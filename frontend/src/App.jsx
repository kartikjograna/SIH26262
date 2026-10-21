import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Pages
import InstitutionDashboard from './pages/InstitutionDashboard';
import CompliancePage from './pages/CompliancePage';
import ApplicationSubmitPage from './pages/ApplicationSubmitPage';
import OfficialPendencyDashboard from './pages/OfficialPendencyDashboard';
import ApplicationDetailView from './pages/ApplicationDetailView';
import { ShieldCheck, Info } from 'lucide-react';

const AppContent = () => {
  const { role, activeTab, isOnline } = useApp();

  return (
    <div className="app-container">
      <Header />
      <Navigation />

      {/* Connection Notice / Mode Banner */}
      <div className={`system-banner ${!isOnline ? 'standalone' : ''}`} role="status">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '1350px', margin: '0 auto', width: '100%' }}>
          <Info size={15} style={{ flexShrink: 0 }} />
          <span>
            {isOnline ? (
              <>
                <strong>Live Backend Mode:</strong> Connected to Node.js/Express API at <code>http://localhost:5000/api</code>.
              </>
            ) : (
              <>
                <strong>Interactive Demo Mode:</strong> Node.js server offline or standby. Full interactive workflow, role transitions, lease document uploads, and audit trails are simulated in real-time.
              </>
            )}
          </span>
        </div>
      </div>

      <main id="main-content" className="main-content">
        {role === 'INSTITUTION' ? (
          <>
            {activeTab === 'dashboard' && <InstitutionDashboard />}
            {activeTab === 'compliance' && <CompliancePage />}
            {activeTab === 'new-application' && <ApplicationSubmitPage />}
            {activeTab === 'app-detail' && <ApplicationDetailView />}
          </>
        ) : (
          <>
            {activeTab === 'pendency' && <OfficialPendencyDashboard />}
            {activeTab === 'app-detail' && <ApplicationDetailView />}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
