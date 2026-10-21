import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/apiService';
import TrafficLightBadge, { getExpiryStatus } from '../components/TrafficLightBadge';
import { 
  UploadCloud, FileCheck, AlertTriangle, AlertOctagon, CheckCircle2, 
  Calendar, File, Eye, Check, ExternalLink, HelpCircle 
} from 'lucide-react';

const DOCUMENT_TYPES = [
  { id: 'LEASE_AGREEMENT', label: 'Registered Land Lease Agreement (Deed)', validityReq: 'Minimum 30 years or unexpired lease' },
  { id: 'BUILDING_PLAN_APPROVAL', label: 'Approved Building Plan (PWD / Town Planning)', validityReq: 'Valid as on submission date' },
  { id: 'FIRE_SAFETY_CERTIFICATE', label: 'Fire & Life Safety Certificate (NOC)', validityReq: 'Must be renewed annually / 3-yearly' },
  { id: 'OCCUPANCY_CERTIFICATE', label: 'Occupancy / Completion Certificate', validityReq: 'Permanent or valid till occupancy' },
  { id: 'AFFILIATING_UNIVERSITY_NOC', label: 'Affiliating University NOC / Letter', validityReq: 'Valid for current academic session' },
  { id: 'STRUCTURAL_STABILITY_CERTIFICATE', label: 'Structural Stability Certificate', validityReq: 'Issued by chartered structural engineer' }
];

const CompliancePage = () => {
  const { currentInstitution, refreshData, dataVersion } = useApp();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedAppId, setSelectedAppId] = useState('');
  const [docType, setDocType] = useState('LEASE_AGREEMENT');
  const [expiryDate, setExpiryDate] = useState('');
  const [fileName, setFileName] = useState('');
  const [undertakingAgreed, setUndertakingAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch applications for this institution
  useEffect(() => {
    let isMounted = true;
    const fetchApps = async () => {
      setLoading(true);
      const res = await api.getApplications('INSTITUTION', currentInstitution._id);
      if (isMounted) {
        setApplications(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedAppId(res.data[0]._id);
        }
        setLoading(false);
      }
    };
    fetchApps();
  }, [currentInstitution._id, dataVersion]);

  // Compute live preview of traffic light badge as date is selected
  const expiryPreview = expiryDate ? getExpiryStatus(expiryDate) : null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppId || !docType || !expiryDate) {
      setFeedback({ type: 'error', message: 'Please select an application, document type, and expiry date.' });
      return;
    }
    if (!undertakingAgreed) {
      setFeedback({ type: 'error', message: 'You must confirm the legal undertaking declaration before submitting.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const payload = {
      appId: selectedAppId,
      docType: docType,
      fileUrl: `https://docs.aicte-india.org/vault/${currentInstitution.code.toLowerCase()}_${docType.toLowerCase()}.pdf`,
      expiryDate: new Date(expiryDate).toISOString()
    };

    const res = await api.uploadCompliance(payload);
    setSubmitting(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Success: ${docType.replace(/_/g, ' ')} has been uploaded with expiry ${expiryDate}. Traffic Light status updated!`
      });
      setExpiryDate('');
      setFileName('');
      setUndertakingAgreed(false);
      refreshData();
    } else {
      setFeedback({ type: 'error', message: res.message || 'Failed to upload document.' });
    }
  };

  // Pre-fill form for quick renewal
  const initiateRenewal = (appId, type) => {
    setSelectedAppId(appId);
    setDocType(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Extract all documents across applications for the table
  const allRegisteredDocs = applications.flatMap(app =>
    (app.documents || []).map(doc => ({
      ...doc,
      appId: app._id,
      stage: app.currentStage
    }))
  );

  return (
    <div className="compliance-page">
      {/* Page Header */}
      <div className="page-header-container">
        <div>
          <h1 className="page-title">
            <UploadCloud size={26} color="#0a2540" />
            <span>Statutory Compliance & Document Expiry Vault</span>
          </h1>
          <p className="page-subtitle">
            Upload and renew prescribed legal documents (Lease Agreements, Fire Safety, Building Approvals) under AICTE Regulations.
          </p>
        </div>
      </div>

      {/* Traffic Light Guide Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
          <HelpCircle size={18} color="#0a2540" />
          <strong style={{ fontSize: '0.9rem', color: '#0a2540' }}>
            AICTE Regulatory Traffic Light Expiry Monitoring Protocol:
          </strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
            <span className="traffic-dot" style={{ backgroundColor: '#15803d', width: '12px', height: '12px' }}></span>
            <div>
              <strong style={{ color: '#14532d', fontSize: '0.82rem' }}>GREEN (Valid)</strong>
              <p style={{ fontSize: '0.74rem', color: '#166534' }}>More than 60 days to expiry. Compliance satisfied.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fffbeb', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fde68a' }}>
            <span className="traffic-dot" style={{ backgroundColor: '#b45309', width: '12px', height: '12px' }}></span>
            <div>
              <strong style={{ color: '#78350f', fontSize: '0.82rem' }}>AMBER (Expiring Soon)</strong>
              <p style={{ fontSize: '0.74rem', color: '#92400e' }}>Expiry within 30-60 days. Advance renewal alert triggered.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
            <span className="traffic-dot" style={{ backgroundColor: '#b91c1c', width: '12px', height: '12px' }}></span>
            <div>
              <strong style={{ color: '#7f1d1d', fontSize: '0.82rem' }}>RED (Expired)</strong>
              <p style={{ fontSize: '0.74rem', color: '#991b1b' }}>Past expiry date. Immediate deficiency action initiated.</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Upload Form (Requirement 1: POST /compliance/upload) */}
        <div className="gov-card">
          <div className="gov-card-header">
            <h2 className="gov-card-title">
              <FileCheck size={18} />
              <span>Document Upload & Expiry Registration</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Endpoint: <code>POST /compliance/upload</code>
            </span>
          </div>

          <div className="gov-card-body">
            {feedback && (
              <div
                role="alert"
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: feedback.type === 'success' ? '#14532d' : '#991b1b',
                  border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`
                }}
              >
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              {/* Target Application */}
              <div className="form-group">
                <label className="form-label required" htmlFor="target-app">
                  Select Approval Application
                </label>
                <select
                  id="target-app"
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="form-select"
                  required
                >
                  {applications.length === 0 && <option value="">No active applications available</option>}
                  {applications.map(app => (
                    <option key={app._id} value={app._id}>
                      {app._id} — {app.applicationType} ({app.currentStage})
                    </option>
                  ))}
                </select>
                <p className="form-hint">The document will be linked to this case file in the AICTE DMS.</p>
              </div>

              {/* Document Type */}
              <div className="form-group">
                <label className="form-label required" htmlFor="doc-type">
                  Document Classification
                </label>
                <select
                  id="doc-type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="form-select"
                  required
                >
                  {DOCUMENT_TYPES.map(dt => (
                    <option key={dt.id} value={dt.id}>
                      {dt.label}
                    </option>
                  ))}
                </select>
                <p className="form-hint">
                  {DOCUMENT_TYPES.find(d => d.id === docType)?.validityReq}
                </p>
              </div>

              {/* Expiry Date with Live Traffic Light Indicator Preview */}
              <div className="form-group">
                <label className="form-label required" htmlFor="expiry-date">
                  Document Expiry Date (As registered on Legal Deed)
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="date"
                    id="expiry-date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="form-input"
                    required
                  />
                  {expiryPreview && (
                    <div style={{ flexShrink: 0 }}>
                      <TrafficLightBadge expiryDate={expiryDate} />
                    </div>
                  )}
                </div>
                {expiryPreview && (
                  <p style={{
                    fontSize: '0.78rem',
                    marginTop: '6px',
                    color: expiryPreview.status === 'red' ? '#b91c1c' : expiryPreview.status === 'amber' ? '#b45309' : '#15803d',
                    fontWeight: '600'
                  }}>
                    Status Preview: {expiryPreview.fullLabel}
                  </p>
                )}
              </div>

              {/* File Attachment Dropzone */}
              <div className="form-group">
                <label className="form-label required" htmlFor="file-input">
                  Upload Signed Document (PDF / Max 10MB)
                </label>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '6px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    id="file-input"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <UploadCloud size={32} color="#0a2540" style={{ margin: '0 auto 6px' }} />
                    <p style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0a2540' }}>
                      {fileName ? `Attached: ${fileName}` : 'Click to Browse or Drag PDF Document'}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Registered deed with stamp paper and seal
                    </span>
                  </label>
                </div>
              </div>

              {/* Statutory Undertaking Checkbox */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={undertakingAgreed}
                    onChange={(e) => setUndertakingAgreed(e.target.checked)}
                    style={{ marginTop: '3px' }}
                    required
                  />
                  <span style={{ fontSize: '0.8rem', color: '#334155', lineHeight: '1.4' }}>
                    <strong>Statutory Undertaking:</strong> I declare that the uploaded document is authentic, duly registered with the competent authority, and complies with Chapter I & II of the AICTE Approval Process Handbook.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {submitting ? 'Uploading & Verifying...' : 'Submit & Register Compliance'}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Compliance Registry */}
        <div className="gov-card" style={{ flex: 1.2 }}>
          <div className="gov-card-header">
            <h2 className="gov-card-title">
              <FileCheck size={18} />
              <span>Registered Compliance Documents & Health Registry</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {allRegisteredDocs.length} Total Records
            </span>
          </div>

          <div className="gov-card-body" style={{ padding: 0 }}>
            {allRegisteredDocs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No compliance documents uploaded yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Document Type</th>
                      <th>Application</th>
                      <th>Expiry Date</th>
                      <th>Traffic Light Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRegisteredDocs.map((doc, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <File size={15} color="#0a2540" />
                            <strong>{doc.docType.replace(/_/g, ' ')}</strong>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                            {doc.appId}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem' }}>
                            {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <TrafficLightBadge expiryDate={doc.expiryDate} />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => initiateRenewal(doc.appId, doc.docType)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                            title="Renew document"
                          >
                            <UploadCloud size={12} /> Renew
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;
