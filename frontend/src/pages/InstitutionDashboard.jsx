import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/apiService';
import TrafficLightBadge from '../components/TrafficLightBadge';
import { 
  Building2, FileText, CheckCircle2, AlertTriangle, AlertOctagon, 
  Clock, ArrowRight, UploadCloud, Bell, RefreshCw, PlusCircle, ExternalLink 
} from 'lucide-react';

const InstitutionDashboard = () => {
  const { currentInstitution, setActiveTab, viewApplicationDetail, dataVersion } = useApp();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch applications for this institution: GET /applications?role=INSTITUTION&id={id}
  useEffect(() => {
    let isMounted = true;
    const fetchApps = async () => {
      setLoading(true);
      const res = await api.getApplications('INSTITUTION', currentInstitution._id);
      if (isMounted) {
        setApplications(res.data || []);
        setLoading(false);
      }
    };
    fetchApps();
  }, [currentInstitution._id, dataVersion]);

  // Aggregate document health across all applications
  const allDocs = applications.flatMap(app => 
    (app.documents || []).map(doc => ({ ...doc, appId: app._id }))
  );

  const today = new Date();
  today.setHours(0,0,0,0);

  const expiredDocs = allDocs.filter(d => d.expiryDate && new Date(d.expiryDate) < today);
  const expiringSoonDocs = allDocs.filter(d => {
    if (!d.expiryDate) return false;
    const exp = new Date(d.expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 60;
  });
  const validDocs = allDocs.filter(d => {
    if (!d.expiryDate) return true;
    const exp = new Date(d.expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays > 60;
  });

  return (
    <div className="dashboard-page">
      {/* Page Title & Controls */}
      <div className="page-header-container">
        <div>
          <h1 className="page-title">
            <Building2 size={26} color="#0a2540" />
            <span>Institution Approval & Compliance Portal</span>
          </h1>
          <p className="page-subtitle">
            AICTE Code: <strong>{currentInstitution.code}</strong> | Region: <strong>{currentInstitution.region}</strong> | Institute: <strong>{currentInstitution.name}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('compliance')}
            className="btn btn-outline"
          >
            <UploadCloud size={16} />
            <span>Document Vault</span>
          </button>
          <button
            onClick={() => setActiveTab('new-application')}
            className="btn btn-saffron"
          >
            <PlusCircle size={16} />
            <span>Submit New Request</span>
          </button>
        </div>
      </div>

      {/* Critical Document Expiry Warning Banner (If any expired or amber lease) */}
      {expiredDocs.length > 0 && (
        <div
          role="alert"
          style={{
            backgroundColor: '#fef2f2',
            border: '2px solid #ef4444',
            borderRadius: '6px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertOctagon size={28} color="#b91c1c" />
            <div>
              <strong style={{ color: '#991b1b', fontSize: '0.98rem' }}>
                CRITICAL REGULATORY ALERT: {expiredDocs.length} Mandatory Document(s) Expired!
              </strong>
              <p style={{ color: '#7f1d1d', fontSize: '0.84rem', marginTop: '2px' }}>
                Your Land Lease Agreement or statutory compliance has expired. Under APH Clause 2.4, approvals cannot proceed until renewed deeds are uploaded.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('compliance')}
            className="btn btn-danger btn-sm"
            style={{ whiteSpace: 'nowrap' }}
          >
            Upload Renewal Deed Now
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box">
            <FileText size={22} color="#0a2540" />
          </div>
          <div className="kpi-details">
            <span className="kpi-value">{applications.length}</span>
            <span className="kpi-label">Active Applications</span>
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon-box" style={{ backgroundColor: '#f0fdf4' }}>
            <CheckCircle2 size={22} color="#15803d" />
          </div>
          <div className="kpi-details">
            <span className="kpi-value" style={{ color: '#15803d' }}>{validDocs.length}</span>
            <span className="kpi-label">Valid Compliance Docs (Green)</span>
          </div>
        </div>

        <div className="kpi-card amber">
          <div className="kpi-icon-box" style={{ backgroundColor: '#fffbeb' }}>
            <AlertTriangle size={22} color="#b45309" />
          </div>
          <div className="kpi-details">
            <span className="kpi-value" style={{ color: '#b45309' }}>{expiringSoonDocs.length}</span>
            <span className="kpi-label">Expiring Soon &lt;60d (Amber)</span>
          </div>
        </div>

        <div className="kpi-card red">
          <div className="kpi-icon-box" style={{ backgroundColor: '#fef2f2' }}>
            <AlertOctagon size={22} color="#b91c1c" />
          </div>
          <div className="kpi-details">
            <span className="kpi-value" style={{ color: '#b91c1c' }}>{expiredDocs.length}</span>
            <span className="kpi-label">Expired Documents (Red)</span>
          </div>
        </div>
      </div>

      {/* Main Approval Applications Section */}
      <div className="gov-card">
        <div className="gov-card-header">
          <h2 className="gov-card-title">
            <FileText size={18} />
            <span>Approval Application Status (APH 2025-26)</span>
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Endpoint: <code>GET /applications?role=INSTITUTION&id={currentInstitution._id}</code>
          </span>
        </div>

        <div className="gov-card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              Loading applications from AICTE Portal...
            </div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
              <p style={{ fontSize: '1rem', fontWeight: '600' }}>No active approval requests found for this institution.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Submit an online application for Extension of Approval (EoA) or Course Addition.</p>
              <button
                onClick={() => setActiveTab('new-application')}
                className="btn btn-saffron"
                style={{ marginTop: '1rem' }}
              >
                <PlusCircle size={15} /> Submit Approval Application
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {applications.map(app => (
                <div
                  key={app._id}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0a2540' }}>
                          Application ID: {app._id}
                        </span>
                        <span className={`stage-badge ${app.currentStage}`}>
                          Stage: {app.currentStage}
                        </span>
                        <span className="stage-badge" style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                          Type: {app.applicationType}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                        Submitted on: <strong>{new Date(app.submittedAt).toLocaleDateString()}</strong> | Assigned To: <strong>{app.assignedTo || 'Regional Directorate'}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => viewApplicationDetail(app._id)}
                      className="btn btn-primary btn-sm"
                    >
                      <span>View Full Case & Audit Trail</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Stage Stepper Visualizer */}
                  <div style={{ margin: '1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                      <div className="stepper-progress-bar">
                        <div
                          className="stepper-progress-fill"
                          style={{
                            width: app.currentStage === 'SUBMITTED' ? '15%' :
                                   app.currentStage === 'SCRUTINY' ? '45%' :
                                   app.currentStage === 'EVC' ? '70%' :
                                   app.currentStage === 'SAC_SHC' ? '85%' :
                                   app.currentStage === 'APPROVED' ? '100%' : '30%'
                          }}
                        ></div>
                      </div>

                      {['SUBMITTED', 'SCRUTINY', 'EVC', 'SAC_SHC', 'APPROVED'].map((step, idx) => {
                        const stepOrder = ['SUBMITTED', 'SCRUTINY', 'EVC', 'SAC_SHC', 'APPROVED'];
                        const currentIdx = stepOrder.indexOf(app.currentStage);
                        const isCompleted = currentIdx > idx || app.currentStage === 'APPROVED';
                        const isCurrent = app.currentStage === step;
                        const isDeficiency = app.currentStage === 'DEFICIENCY' && step === 'SCRUTINY';

                        return (
                          <div
                            key={step}
                            className={`stage-step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isDeficiency ? 'deficiency' : ''}`}
                          >
                            <div className="stage-step-circle">
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            <span className="stage-step-title">
                              {step === 'SAC_SHC' ? 'SAC / SHC' : step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Document Expiry Status Cards with Traffic Light */}
                  <div style={{
                    marginTop: '1.25rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <strong style={{ fontSize: '0.84rem', color: '#0a2540' }}>
                        Compliance Documents & Expiry Watchlist (Traffic Light Status):
                      </strong>
                      <button
                        onClick={() => setActiveTab('compliance')}
                        className="btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                      >
                        <UploadCloud size={12} /> Upload Renewal
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {(app.documents || []).length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No documents uploaded yet.</span>
                      ) : (
                        (app.documents || []).map((doc, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.82rem'
                            }}
                          >
                            <span style={{ fontWeight: '600' }}>
                              {doc.docType.replace(/_/g, ' ')}:
                            </span>
                            <TrafficLightBadge expiryDate={doc.expiryDate} size="sm" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Latest Official Comments */}
                  {app.comments && app.comments.length > 0 && (
                    <div style={{
                      marginTop: '0.75rem',
                      fontSize: '0.82rem',
                      color: '#334155',
                      padding: '8px 12px',
                      backgroundColor: '#fefce8',
                      borderRadius: '4px',
                      borderLeft: '4px solid #eab308'
                    }}>
                      <strong>Latest Official Remark ({app.comments[0].user}):</strong> {app.comments[0].text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
