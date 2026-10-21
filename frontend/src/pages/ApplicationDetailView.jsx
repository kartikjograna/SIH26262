import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/apiService';
import TrafficLightBadge from '../components/TrafficLightBadge';
import DecisionPanel from '../components/DecisionPanel';
import { 
  ArrowLeft, FileText, Building2, MapPin, Calendar, Clock, 
  FileCheck, Shield, History, ExternalLink, AlertOctagon, CheckCircle2 
} from 'lucide-react';

const ApplicationDetailView = () => {
  const { selectedAppId, role, setActiveTab, dataVersion } = useApp();
  const [application, setApplication] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'documents' | 'audit'

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      const appRes = await api.getApplicationById(selectedAppId);
      const auditRes = await api.getApplicationAuditLogs(selectedAppId);
      if (isMounted) {
        setApplication(appRes.data);
        setAuditLogs(auditRes.data || (appRes.data?.auditLogs || []));
        setLoading(false);
      }
    };
    if (selectedAppId) {
      fetchDetail();
    }
  }, [selectedAppId, dataVersion]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Loading comprehensive case details for {selectedAppId}...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="gov-card">
        <div className="gov-card-body" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>Application Not Found</h3>
          <p style={{ color: '#64748b', marginTop: '6px' }}>No record found for ID: {selectedAppId}</p>
          <button
            onClick={() => setActiveTab(role === 'INSTITUTION' ? 'dashboard' : 'pendency')}
            className="btn btn-outline"
            style={{ marginTop: '1rem' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const inst = typeof application.institutionId === 'object' ? application.institutionId : {};
  const docs = application.documents || [];

  return (
    <div className="app-detail-page">
      {/* Back Button & Case Reference */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab(role === 'INSTITUTION' ? 'dashboard' : 'pendency')}
          className="btn btn-outline btn-sm"
        >
          <ArrowLeft size={15} />
          <span>Back to {role === 'INSTITUTION' ? 'Institution Dashboard' : 'Regional Pendency List'}</span>
        </button>

        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          File Reference: <strong>AICTE/APH/{application._id}</strong>
        </span>
      </div>

      {/* Main Case Header Card */}
      <div className="gov-card" style={{ marginBottom: '1.25rem' }}>
        <div className="gov-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0a2540' }}>
                Case File: {application._id}
              </h1>
              <span className={`stage-badge ${application.currentStage}`}>
                Stage: {application.currentStage}
              </span>
              <span className="stage-badge" style={{ backgroundColor: '#e2e8f0', color: '#1e293b' }}>
                Status: {application.status}
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#475569', marginTop: '4px' }}>
              <strong>{inst.name || 'Technical Institute'}</strong> (PID: {inst.code || 'AICTE-DEMO'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: '#0a2540'
            }}>
              <MapPin size={13} color="#e85d04" />
              {inst.region || 'Northern'} Region
            </span>
          </div>
        </div>

        {/* Workflow Stepper */}
        <div style={{ padding: '0.75rem 1.25rem 0.5rem' }}>
          <div className="stage-stepper">
            <div className="stepper-progress-bar">
              <div
                className="stepper-progress-fill"
                style={{
                  width: application.currentStage === 'SUBMITTED' ? '0%' :
                         (application.currentStage === 'SCRUTINY' || application.currentStage === 'DEFICIENCY') ? '25%' :
                         application.currentStage === 'EVC' ? '50%' :
                         application.currentStage === 'SAC_SHC' ? '75%' :
                         application.currentStage === 'APPROVED' ? '100%' : '0%'
                }}
              ></div>
            </div>

            {[
              { key: 'SUBMITTED', label: 'SUBMITTED' },
              { key: 'SCRUTINY', label: 'SCRUTINY' },
              { key: 'EVC', label: 'EVC' },
              { key: 'SAC_SHC', label: 'SAC / SHC' },
              { key: 'APPROVED', label: 'APPROVED' }
            ].map((step, idx) => {
              const isApproved = application.currentStage === 'APPROVED';
              const isDeficiency = application.currentStage === 'DEFICIENCY';
              
              let stageIdx = 0;
              if (application.currentStage === 'SUBMITTED') stageIdx = 0;
              else if (application.currentStage === 'SCRUTINY' || isDeficiency) stageIdx = 1;
              else if (application.currentStage === 'EVC') stageIdx = 2;
              else if (application.currentStage === 'SAC_SHC') stageIdx = 3;
              else if (isApproved) stageIdx = 4;

              const isCompleted = isApproved || stageIdx > idx;
              const isCurrent = !isDeficiency && stageIdx === idx;
              const isDeficientStep = isDeficiency && idx === 1;

              return (
                <div
                  key={step.key}
                  className={`stage-step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isDeficientStep ? 'deficiency' : ''}`}
                >
                  <div className="stage-step-circle">
                    {isCompleted ? '✓' : isDeficientStep ? '!' : idx + 1}
                  </div>
                  <span className="stage-step-title">
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>


        {/* Quick Metadata Bar */}
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          fontSize: '0.82rem'
        }}>
          <div>
            <span style={{ color: '#64748b' }}>Workflow Path:</span>
            <div style={{ fontWeight: '700', color: '#0a2540' }}>{application.applicationType}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Submitted Date:</span>
            <div style={{ fontWeight: '700', color: '#0a2540' }}>{new Date(application.submittedAt).toLocaleDateString()}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Assigned Desk:</span>
            <div style={{ fontWeight: '700', color: '#0a2540' }}>{application.assignedTo || 'Regional Scrutiny Panel'}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Last Official Action:</span>
            <div style={{ fontWeight: '700', color: '#0a2540' }}>{new Date(application.lastActionAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Official Decision Panel (Highlighted for Officials) */}
      {role === 'OFFICIAL' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <DecisionPanel
            application={application}
            onDecisionComplete={(updated) => setApplication(updated)}
          />
        </div>
      )}

      {/* Detail Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #cbd5e1',
        marginBottom: '1.25rem'
      }}>
        <button
          onClick={() => setActiveSection('overview')}
          className={`nav-item-btn ${activeSection === 'overview' ? 'active' : ''}`}
          style={{ paddingBottom: '0.6rem' }}
        >
          <FileText size={16} />
          <span>Case Data & Programs</span>
        </button>
        <button
          onClick={() => setActiveSection('documents')}
          className={`nav-item-btn ${activeSection === 'documents' ? 'active' : ''}`}
          style={{ paddingBottom: '0.6rem' }}
        >
          <FileCheck size={16} />
          <span>Uploaded Documents & Expiry ({docs.length})</span>
        </button>
        <button
          onClick={() => setActiveSection('audit')}
          className={`nav-item-btn ${activeSection === 'audit' ? 'active' : ''}`}
          style={{ paddingBottom: '0.6rem' }}
        >
          <History size={16} />
          <span>Digital Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Section 1: Overview & Programs */}
      {activeSection === 'overview' && (
        <div className="gov-card">
          <div className="gov-card-header">
            <h2 className="gov-card-title">
              <Building2 size={18} />
              <span>Technical Institution Application Details</span>
            </h2>
          </div>
          <div className="gov-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#0a2540', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                  Institution Information
                </h4>
                <p style={{ fontSize: '0.86rem', marginBottom: '6px' }}><strong>Name:</strong> {inst.name}</p>
                <p style={{ fontSize: '0.86rem', marginBottom: '6px' }}><strong>Permanent AICTE ID:</strong> {inst.code}</p>
                <p style={{ fontSize: '0.86rem', marginBottom: '6px' }}><strong>Official Email:</strong> {inst.email || 'registrar@institute.edu.in'}</p>
                <p style={{ fontSize: '0.86rem', marginBottom: '6px' }}><strong>Campus Address:</strong> {inst.address || 'AICTE Approved Campus'}</p>
                <p style={{ fontSize: '0.86rem' }}><strong>Regional Jurisdiction:</strong> {inst.region} Regional Office</p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#0a2540', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                  Approval Request & Program Offerings
                </h4>
                <p style={{ fontSize: '0.86rem', marginBottom: '6px' }}><strong>Academic Session:</strong> {application.academicYear || '2025-2026'}</p>
                <p style={{ fontSize: '0.86rem', marginBottom: '6px' }}><strong>Application Category:</strong> {application.applicationType}</p>
                
                <div style={{ marginTop: '0.75rem' }}>
                  <strong style={{ fontSize: '0.84rem', color: '#0a2540' }}>Programs Under Scrutiny:</strong>
                  <ul style={{ marginTop: '4px', paddingLeft: '1.25rem', fontSize: '0.84rem', color: '#334155' }}>
                    {(application.programs || ['Technical Engineering Degree (Intake: 180)']).map((prog, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{prog}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Official Observations & Comments */}
            {application.comments && application.comments.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#0a2540', marginBottom: '0.5rem' }}>
                  Regulatory Notes & Committee Observations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {application.comments.map((c, idx) => (
                    <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid #0a2540' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b' }}>
                        <strong>{c.user}</strong>
                        <span>{new Date(c.timestamp).toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: '0.84rem', marginTop: '2px', color: '#1e293b' }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 2: Upload History & Expiry Tracking (Traffic Light) */}
      {activeSection === 'documents' && (
        <div className="gov-card">
          <div className="gov-card-header">
            <h2 className="gov-card-title">
              <FileCheck size={18} />
              <span>Document Upload History & Traffic Light Validity Guard</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Automatic Alert Engine: Green (&gt;60d), Amber (&le;60d), Red (Expired)
            </span>
          </div>

          <div className="gov-card-body" style={{ padding: 0 }}>
            {docs.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                No documents uploaded for this application.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Document Type</th>
                      <th>Registered Expiry Date</th>
                      <th>Traffic Light Indicator</th>
                      <th>Validity Audit</th>
                      <th>Repository File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((doc, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={16} color="#0a2540" />
                            <strong>{doc.docType.replace(/_/g, ' ')}</strong>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                            {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>

                        <td>
                          <TrafficLightBadge expiryDate={doc.expiryDate} />
                        </td>

                        <td>
                          {doc.isValid ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#15803d', fontSize: '0.8rem', fontWeight: '600' }}>
                              <CheckCircle2 size={14} /> Legally Verified
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#b91c1c', fontSize: '0.8rem', fontWeight: '600' }}>
                              <AlertOctagon size={14} /> Deficiency Noted
                            </span>
                          )}
                        </td>

                        <td>
                          <a
                            href={doc.fileUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          >
                            <ExternalLink size={12} /> Inspect Deed
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 3: Digital Audit Trail (Requirement) */}
      {activeSection === 'audit' && (
        <div className="gov-card">
          <div className="gov-card-header">
            <h2 className="gov-card-title">
              <History size={18} />
              <span>Immutable Digital Audit Trail</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Full chronological ledger of institutional actions and official regulatory orders
            </span>
          </div>

          <div className="gov-card-body">
            {auditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                No audit entries recorded yet.
              </div>
            ) : (
              <div className="timeline">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className={`timeline-dot ${log.action}`} aria-hidden="true"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <div>
                          <span className="timeline-actor">{log.actionBy || 'Authorized Official'}</span>
                          <span className={`stage-badge ${log.action === 'APPROVE' ? 'APPROVED' : log.action === 'REVERT' ? 'DEFICIENCY' : 'SUBMITTED'}`} style={{ marginLeft: '8px', fontSize: '0.7rem' }}>
                            {log.action}
                          </span>
                        </div>
                        <span className="timeline-date">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '4px' }}>
                        Transition: <strong>{log.fromStage || 'DRAFT'}</strong> ➔ <strong>{log.toStage || application.currentStage}</strong>
                      </div>

                      {log.remarks && (
                        <div className="timeline-remarks">
                          "{log.remarks}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailView;
