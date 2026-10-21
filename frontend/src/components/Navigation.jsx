import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, FileText, UploadCloud, ListChecks, FileSearch, Building } from 'lucide-react';

const Navigation = () => {
  const { role, activeTab, setActiveTab, currentInstitution, selectedAppId } = useApp();

  return (
    <nav className="nav-bar" aria-label="Portal Navigation">
      <div className="nav-inner">
        <ul className="nav-links">
          {role === 'INSTITUTION' ? (
            <>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`nav-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard & Status</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('compliance')}
                  className={`nav-item-btn ${activeTab === 'compliance' ? 'active' : ''}`}
                >
                  <UploadCloud size={16} />
                  <span>Compliance & Lease Vault</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('new-application')}
                  className={`nav-item-btn ${activeTab === 'new-application' ? 'active' : ''}`}
                >
                  <FileText size={16} />
                  <span>New Approval Request</span>
                </button>
              </li>
              {activeTab === 'app-detail' && (
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('app-detail')}
                    className="nav-item-btn active"
                  >
                    <FileSearch size={16} />
                    <span>Case Review ({selectedAppId})</span>
                  </button>
                </li>
              )}
            </>
          ) : (
            <>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('pendency')}
                  className={`nav-item-btn ${activeTab === 'pendency' ? 'active' : ''}`}
                >
                  <ListChecks size={16} />
                  <span>Regional Pendency Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('app-detail')}
                  className={`nav-item-btn ${activeTab === 'app-detail' ? 'active' : ''}`}
                >
                  <FileSearch size={16} />
                  <span>Application Detail & Decision ({selectedAppId})</span>
                </button>
              </li>
            </>
          )}
        </ul>

        {/* Institution / Officer Badge Context */}
        <div className="nav-context-pill">
          {role === 'INSTITUTION' ? (
            <>
              <Building size={14} color="#0a2540" />
              <span>
                <strong>{currentInstitution.name}</strong> ({currentInstitution.region} Region)
              </span>
            </>
          ) : (
            <>
              <span className="stage-badge SCRUTINY">OFFICIAL DESK</span>
              <span>Regional Officer & Scrutiny Committee Panel</span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
