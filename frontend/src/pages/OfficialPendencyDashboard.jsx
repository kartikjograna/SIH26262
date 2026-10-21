import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/apiService';
import TrafficLightBadge, { getExpiryStatus } from '../components/TrafficLightBadge';
import { 
  ListChecks, Search, Filter, ShieldAlert, ArrowRight, Building2, 
  Clock, AlertTriangle, AlertOctagon, CheckCircle2, MapPin, Eye 
} from 'lucide-react';

const REGIONS = ['ALL', 'Northern', 'Southern', 'Western', 'Eastern', 'Central'];
const STAGES = ['ALL', 'SUBMITTED', 'SCRUTINY', 'EVC', 'SAC_SHC', 'DEFICIENCY'];

const OfficialPendencyDashboard = () => {
  const { viewApplicationDetail, dataVersion } = useApp();
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch pending applications: GET /applications/pending
  useEffect(() => {
    let isMounted = true;
    const fetchPending = async () => {
      setLoading(true);
      const res = await api.getPendingApplications();
      if (isMounted) {
        setPendingApps(res.data || []);
        setLoading(false);
      }
    };
    fetchPending();
  }, [dataVersion]);

  // Filter logic
  const filteredApps = pendingApps.filter(app => {
    const instName = typeof app.institutionId === 'object' ? app.institutionId?.name : '';
    const instCode = typeof app.institutionId === 'object' ? app.institutionId?.code : '';
    const instRegion = typeof app.institutionId === 'object' ? app.institutionId?.region : '';

    const matchesRegion = selectedRegion === 'ALL' || instRegion === selectedRegion;
    const matchesStage = selectedStage === 'ALL' || app.currentStage === selectedStage;

    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      app._id?.toLowerCase().includes(term) ||
      instName?.toLowerCase().includes(term) ||
      instCode?.toLowerCase().includes(term);

    return matchesRegion && matchesStage && matchesSearch;
  });

  // Calculate Aging (Days elapsed since submitted)
  const getDaysPending = (dateStr) => {
    if (!dateStr) return 0;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  // Check if an application has any expired document
  const checkAppDocHealth = (app) => {
    const docs = app.documents || [];
    const today = new Date();
    today.setHours(0,0,0,0);

    const hasExpired = docs.some(d => d.expiryDate && new Date(d.expiryDate) < today);
    if (hasExpired) return { status: 'red', label: 'Expired Doc Detected' };

    const hasAmber = docs.some(d => {
      if (!d.expiryDate) return false;
      const exp = new Date(d.expiryDate);
      const days = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 60;
    });
    if (hasAmber) return { status: 'amber', label: 'Expiring Soon' };

    return { status: 'green', label: 'Documents OK' };
  };

  return (
    <div className="pendency-dashboard">
      {/* Page Header */}
      <div className="page-header-container">
        <div>
          <h1 className="page-title">
            <ListChecks size={26} color="#0a2540" />
            <span>National Pendency & Regulatory Monitoring Dashboard</span>
          </h1>
          <p className="page-subtitle">
            Real-time stage-wise workload distribution across all AICTE Regional Directorates (Endpoint: <code>GET /applications/pending</code>)
          </p>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box">
            <ListChecks size={22} color="#0a2540" />
          </div>
          <div className="kpi-details">
            <span className="kpi-value">{pendingApps.length}</span>
            <span className="kpi-label">Total Pending Across Regions</span>
          </div>
        </div>

        <div className="kpi-card red">
          <div className="kpi-icon-box" style={{ backgroundColor: '#fef2f2' }}>
            <AlertOctagon size={22} color="#b91c1c" />
          </div>
          <div className="kpi-details">
            <span className="kpi-value" style={{ color: '#b91c1c' }}>
              {pendingApps.filter(a => a.currentStage === 'DEFICIENCY').length}
            </span>
            <span className="kpi-label">Reverted for Deficiency</span>
          </div>
        </div>

        <div className="kpi-card amber">
          <div className="kpi-icon-box" style={{ backgroundColor: '#fffbeb' }}>
            <Clock size={22} color="#b45309" />
          </div>
          <div className="kpi-details">
            <span className="kpi-value" style={{ color: '#b45309' }}>
              {pendingApps.filter(a => a.currentStage === 'EVC').length}
            </span>
            <span className="kpi-label">EVC Queue (Inspection Due)</span>
          </div>
        </div>

        <div className="kpi-card saffron">
          <div className="kpi-icon-box" style={{ backgroundColor: '#fff2e8' }}>
            <Building2 size={22} color="#e85d04" />
          </div>
          <div className="kpi-details">
            <span className="kpi-value" style={{ color: '#e85d04' }}>
              {pendingApps.filter(a => a.currentStage === 'SCRUTINY').length}
            </span>
            <span className="kpi-label">In Scrutiny Committee</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search by Application ID or Institute Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px' }}
            />
          </div>

          {/* Regional Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0a2540' }}>Region:</span>
            {REGIONS.map(reg => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`btn-sm ${selectedRegion === reg ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Stage Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0a2540' }}>Stage:</span>
            {STAGES.map(stage => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`btn-sm ${selectedStage === stage ? 'btn-saffron' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                {stage === 'ALL' ? 'All' : stage}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Applications Table */}
      <div className="gov-card">
        <div className="gov-card-header">
          <h2 className="gov-card-title">
            <ListChecks size={18} />
            <span>Regional Applications Requiring Official Action ({filteredApps.length} Cases)</span>
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Click "Review Case & Decision" to inspect documents and issue orders.
          </span>
        </div>

        <div className="gov-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
              Loading pendency records from AICTE Workflow Server...
            </div>
          ) : filteredApps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <p style={{ fontWeight: '600' }}>No pending applications found matching current filters.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try switching regions or clearing search terms.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Technical Institution</th>
                    <th>Region</th>
                    <th>Workflow Type</th>
                    <th>Current Stage</th>
                    <th>Ageing / SLA</th>
                    <th>Document Health</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map(app => {
                    const inst = typeof app.institutionId === 'object' ? app.institutionId : {};
                    const daysPending = getDaysPending(app.submittedAt);
                    const docHealth = checkAppDocHealth(app);

                    return (
                      <tr key={app._id}>
                        <td>
                          <strong style={{ color: '#0a2540', fontSize: '0.9rem' }}>{app._id}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Sub: {new Date(app.submittedAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>
                            {inst.name || 'Technical Institute'}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            PID: {inst.code || 'AICTE-REG'}
                          </div>
                        </td>

                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                            <MapPin size={13} color="#e85d04" />
                            {inst.region || 'Northern'}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                            {app.applicationType}
                          </span>
                        </td>

                        <td>
                          <span className={`stage-badge ${app.currentStage}`}>
                            {app.currentStage}
                          </span>
                        </td>

                        <td>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: daysPending > 25 ? '#b91c1c' : daysPending > 10 ? '#b45309' : '#15803d'
                          }}>
                            <Clock size={13} />
                            <span>{daysPending} days</span>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            {daysPending > 25 ? 'ESCALATION ALERT' : 'Within Normal SLA'}
                          </div>
                        </td>

                        <td>
                          <span className={`traffic-light-badge ${docHealth.status}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                            <span className="traffic-dot"></span>
                            <span>{docHealth.label}</span>
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => viewApplicationDetail(app._id)}
                            className="btn btn-primary btn-sm"
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            <span>Review & Decide</span>
                            <ArrowRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficialPendencyDashboard;
