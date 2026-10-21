import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api, getNextStageAPH } from '../api/apiService';
import { CheckCircle2, RotateCcw, AlertOctagon, ShieldCheck, ArrowRight, X } from 'lucide-react';

const DecisionPanel = ({ application, onDecisionComplete }) => {
  const { refreshData } = useApp();
  const [remarks, setRemarks] = useState('');
  const [officialName, setOfficialName] = useState('Dr. P. K. Verma (Regional Scrutiny Officer)');
  const [submitting, setSubmitting] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'APPROVE' | 'REVERT'
  const [errorMsg, setErrorMsg] = useState('');

  if (!application) return null;

  const currentStage = application.currentStage;
  const nextStage = getNextStageAPH(application.applicationType, currentStage);
  const isApprovedFinal = currentStage === 'APPROVED';

  const handleOpenConfirm = (action) => {
    if (!remarks.trim()) {
      setErrorMsg('Mandatory: Official remarks/reason must be recorded for regulatory audit.');
      return;
    }
    setErrorMsg('');
    setModalAction(action);
  };

  const handleConfirmDecision = async () => {
    if (!modalAction) return;

    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      action: modalAction,
      user: officialName,
      remarks: remarks.trim()
    };

    const res = await api.processApplication(application._id, payload);
    setSubmitting(false);

    if (res.success) {
      setModalAction(null);
      setRemarks('');
      refreshData();
      if (onDecisionComplete) {
        onDecisionComplete(res.data);
      }
    } else {
      setErrorMsg(res.message || 'Error processing application decision.');
    }
  };

  return (
    <div className="decision-panel-container" style={{
      backgroundColor: '#ffffff',
      border: '2px solid #0a2540',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#0a2540',
        color: '#ffffff',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#fbbf24" />
          <h3 style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '0.2px' }}>
            Official Regulatory Decision Panel
          </h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
          Endpoint: <code>POST /applications/process/:appId</code>
        </span>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Stage Transition Projection */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '0.85rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
              Current Regulatory Stage:
            </span>
            <div style={{ marginTop: '2px' }}>
              <span className={`stage-badge ${currentStage}`}>
                {currentStage}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRight size={18} color="#64748b" />
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
              Next Stage Upon Approval:
            </span>
            <div style={{ marginTop: '2px' }}>
              <span className="stage-badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
                {nextStage}
              </span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
              Reversion Path:
            </span>
            <div style={{ marginTop: '2px' }}>
              <span className="stage-badge DEFICIENCY">
                DEFICIENCY
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            style={{
              padding: '8px 12px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
              borderRadius: '4px',
              fontSize: '0.82rem',
              marginBottom: '1rem'
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Official Officer Identity */}
        <div className="form-group" style={{ marginBottom: '0.85rem' }}>
          <label className="form-label" htmlFor="officer-name">
            Authorised Officer / Committee Signatory:
          </label>
          <input
            type="text"
            id="officer-name"
            value={officialName}
            onChange={(e) => setOfficialName(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
          />
        </div>

        {/* Mandatory Remarks Field */}
        <div className="form-group">
          <label className="form-label required" htmlFor="official-remarks">
            Official Regulatory Remarks / Scrutiny Order (Recorded in Digital Audit Trail)
          </label>
          <textarea
            id="official-remarks"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="form-textarea"
            placeholder="Specify reason for stage movement, inspection observation, or detailed deficiency notice..."
            required
          />
          <p className="form-hint">
            Under AICTE regulations, all decision remarks are permanently recorded in the immutable audit log and notified to the technical institution.
          </p>
        </div>

        {/* Decision Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #e2e8f0',
          flexWrap: 'wrap'
        }}>
          {/* Revert Button: moves to DEFICIENCY */}
          <button
            type="button"
            disabled={submitting || currentStage === 'DEFICIENCY'}
            onClick={() => handleOpenConfirm('REVERT')}
            className="btn btn-danger"
            title="Revert application to DEFICIENCY stage with reason"
          >
            <RotateCcw size={16} />
            <span>Revert (Move to DEFICIENCY)</span>
          </button>

          {/* Approve Button: moves to next stage */}
          <button
            type="button"
            disabled={submitting || isApprovedFinal}
            onClick={() => handleOpenConfirm('APPROVE')}
            className="btn btn-success"
            title={`Approve and advance application to ${nextStage}`}
          >
            <CheckCircle2 size={16} />
            <span>{isApprovedFinal ? 'Fully Approved' : `Approve & Forward to ${nextStage}`}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalAction && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-dialog">
            <div className="modal-header">
              <h4 id="modal-title" className="modal-title">
                {modalAction === 'APPROVE' ? (
                  <>
                    <CheckCircle2 color="#15803d" size={20} />
                    <span>Confirm Approval Order</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon color="#b91c1c" size={20} />
                    <span>Confirm Regulatory Reversion</span>
                  </>
                )}
              </h4>
              <button
                onClick={() => setModalAction(null)}
                className="modal-close-btn"
                aria-label="Close confirmation dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.92rem', color: '#1e293b', marginBottom: '1rem' }}>
                You are about to issue the following regulatory decision for application <strong>{application._id}</strong>:
              </p>

              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.86rem'
              }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Action:</strong>{' '}
                  <span className={`stage-badge ${modalAction === 'APPROVE' ? 'APPROVED' : 'DEFICIENCY'}`}>
                    {modalAction}
                  </span>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Stage Movement:</strong> {currentStage} ➔{' '}
                  <strong>{modalAction === 'APPROVE' ? nextStage : 'DEFICIENCY'}</strong>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <strong>Signatory:</strong> {officialName}
                </div>
                <div>
                  <strong>Recorded Order Remarks:</strong>
                  <div style={{
                    marginTop: '4px',
                    padding: '6px 8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontStyle: 'italic'
                  }}>
                    "{remarks}"
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                This action will be published to the public AICTE compliance ledger and the institution will receive an automated alert.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="btn btn-outline"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                disabled={submitting}
                className={`btn ${modalAction === 'APPROVE' ? 'btn-success' : 'btn-danger'}`}
              >
                {submitting ? 'Executing Decision...' : `Confirm & Commit ${modalAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionPanel;
