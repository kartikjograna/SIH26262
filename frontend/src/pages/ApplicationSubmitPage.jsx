import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/apiService';
import TrafficLightBadge, { getExpiryStatus } from '../components/TrafficLightBadge';
import { FilePlus2, CheckCircle, AlertTriangle, ArrowRight, Building, ShieldCheck, Check } from 'lucide-react';

const APPLICATION_TYPES = [
  {
    type: 'SCRUTINY_EVC',
    title: 'Scrutiny + Expert Visit Committee (SCRUTINY_EVC)',
    description: 'Required for Course Additions, Intake Expansion, or Campus Expansion under APH Section 2.1.'
  },
  {
    type: 'ONLY_SCRUTINY',
    title: 'Only Scrutiny (ONLY_SCRUTINY)',
    description: 'Applicable for routine Extension of Approval (EoA) or institutional name change without structural alterations.'
  },
  {
    type: 'EVC_SAC',
    title: 'Scrutiny + EVC + Standing Appellate Committee (EVC_SAC)',
    description: 'Mandatory workflow for establishment of New Technical Institutions or restoration cases.'
  },
  {
    type: 'ONLY_EVC',
    title: 'Only EVC (ONLY_EVC)',
    description: 'On-site committee verification for infrastructure and equipment readiness.'
  }
];

const ApplicationSubmitPage = () => {
  const { currentInstitution, setActiveTab, viewApplicationDetail, refreshData } = useApp();

  const [applicationType, setApplicationType] = useState('SCRUTINY_EVC');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [programs, setPrograms] = useState('B.Tech in Artificial Intelligence & Machine Learning (60 seats)\nB.Tech in Computer Science & Engineering (120 seats)');
  const [totalIntake, setTotalIntake] = useState('180');
  const [leaseExpiryDate, setLeaseExpiryDate] = useState('');
  const [submittedBy, setSubmittedBy] = useState('Dr. S. K. Sharma (Head of Institution / Principal)');
  const [undertakingAgreed, setUndertakingAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const leaseStatus = leaseExpiryDate ? getExpiryStatus(leaseExpiryDate) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!undertakingAgreed) {
      alert('Please agree to the statutory declaration before submitting.');
      return;
    }

    setLoading(true);
    setResult(null);

    const programList = programs.split('\n').filter(p => p.trim().length > 0);

    const payload = {
      institutionId: currentInstitution._id,
      institutionName: currentInstitution.name,
      region: currentInstitution.region,
      applicationType: applicationType,
      academicYear: academicYear,
      programs: programList,
      submittedBy: submittedBy,
      currentStage: 'SUBMITTED',
      status: 'PENDING',
      documents: [
        {
          docType: 'LEASE_AGREEMENT',
          fileUrl: `https://docs.aicte-india.org/vault/${currentInstitution.code.toLowerCase()}_lease.pdf`,
          expiryDate: leaseExpiryDate ? new Date(leaseExpiryDate).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          isValid: true
        }
      ]
    };

    const res = await api.submitApplication(payload);
    setLoading(false);

    if (res.success) {
      setResult(res.data);
      refreshData();
    } else {
      alert('Error submitting application: ' + (res.message || 'Unknown error'));
    }
  };

  return (
    <div className="submit-app-page">
      <div className="page-header-container">
        <div>
          <h1 className="page-title">
            <FilePlus2 size={26} color="#0a2540" />
            <span>Submit Approval Request (APH 2025-26)</span>
          </h1>
          <p className="page-subtitle">
            Formal submission of regulatory application to All India Council for Technical Education.
          </p>
        </div>
      </div>

      {result ? (
        <div className="gov-card" style={{ borderTop: '4px solid #15803d' }}>
          <div className="gov-card-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <CheckCircle size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', color: '#0a2540', marginBottom: '0.5rem' }}>
              Application Successfully Submitted & Registered!
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#334155', fontWeight: '700' }}>
              Application Tracking ID: <span style={{ color: '#e85d04' }}>{result._id}</span>
            </p>
            <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '600px', margin: '0.75rem auto 1.5rem' }}>
              Your application has entered the <strong>SUBMITTED</strong> stage and has been routed to the <strong>{currentInstitution.region} Regional Scrutiny Directorate</strong>. A formal digital audit trail has been initiated.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => viewApplicationDetail(result._id)}
                className="btn btn-primary"
              >
                <span>Open Application Detail View</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setActiveTab('dashboard');
                }}
                className="btn btn-outline"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="gov-card">
          <div className="gov-card-header">
            <h2 className="gov-card-title">
              <Building size={18} />
              <span>Institutional Approval Application Form</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Endpoint: <code>POST /applications/submit</code>
            </span>
          </div>

          <div className="gov-card-body">
            <form onSubmit={handleSubmit}>
              {/* Institution Metadata Banner */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Institution</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0a2540' }}>{currentInstitution.name}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>AICTE Permanent ID</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0a2540' }}>{currentInstitution.code}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Region</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0a2540' }}>{currentInstitution.region} Regional Office</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Academic Session</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0a2540' }}>2025-2026</p>
                  </div>
                </div>
              </div>

              {/* Application Type Selection */}
              <div className="form-group">
                <label className="form-label required">
                  Approval Workflow Type (APH Processing Path)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {APPLICATION_TYPES.map(at => (
                    <label
                      key={at.type}
                      style={{
                        display: 'block',
                        padding: '0.85rem',
                        borderRadius: '6px',
                        border: applicationType === at.type ? '2px solid #0a2540' : '1px solid #cbd5e1',
                        backgroundColor: applicationType === at.type ? '#f0f7ff' : '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <input
                          type="radio"
                          name="appType"
                          value={at.type}
                          checked={applicationType === at.type}
                          onChange={(e) => setApplicationType(e.target.value)}
                        />
                        <strong style={{ fontSize: '0.86rem', color: '#0a2540' }}>{at.type}</strong>
                      </div>
                      <p style={{ fontSize: '0.76rem', color: '#475569', paddingLeft: '22px' }}>
                        {at.description}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Proposed Programs & Intake */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label required" htmlFor="programs-input">
                    Proposed Technical Programs & Intake
                  </label>
                  <textarea
                    id="programs-input"
                    rows={4}
                    value={programs}
                    onChange={(e) => setPrograms(e.target.value)}
                    className="form-textarea"
                    placeholder="Enter course name and approved seats (one per line)"
                    required
                  />
                  <p className="form-hint">Specify degree/diploma courses for scrutiny validation.</p>
                </div>

                <div>
                  <div className="form-group">
                    <label className="form-label required" htmlFor="intake-input">
                      Total Annual Intake Capacity
                    </label>
                    <input
                      type="number"
                      id="intake-input"
                      value={totalIntake}
                      onChange={(e) => setTotalIntake(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Mandatory Registered Lease Agreement Date */}
                  <div className="form-group">
                    <label className="form-label required" htmlFor="lease-date">
                      Registered Land Lease Expiry Date
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="date"
                        id="lease-date"
                        value={leaseExpiryDate}
                        onChange={(e) => setLeaseExpiryDate(e.target.value)}
                        className="form-input"
                        required
                      />
                      {leaseStatus && <TrafficLightBadge expiryDate={leaseExpiryDate} />}
                    </div>
                    <p className="form-hint">
                      {leaseStatus ? `Traffic Light Status: ${leaseStatus.fullLabel}` : 'Must have at least 30 years or valid lease tenure.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submitting Official */}
              <div className="form-group">
                <label className="form-label required" htmlFor="submitter-input">
                  Authorized Submitter (Principal / Director)
                </label>
                <input
                  type="text"
                  id="submitter-input"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Mandatory Undertaking */}
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                padding: '1rem',
                margin: '1.25rem 0'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={undertakingAgreed}
                    onChange={(e) => setUndertakingAgreed(e.target.checked)}
                    style={{ marginTop: '3px' }}
                    required
                  />
                  <span style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: '1.5' }}>
                    <strong>Mandatory Undertaking under APH 2025-26:</strong> We hereby solemnly affirm that the land, infrastructure, faculty, and lease deeds submitted for this application comply with the regulations of the All India Council for Technical Education. We understand that non-compliance or expired deeds will result in immediate reversion to DEFICIENCY.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-saffron"
                >
                  {loading ? 'Submitting to AICTE...' : 'Submit Approval Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationSubmitPage;
