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

const AppContent = () => {
  const { role, activeTab, isOnline } = useApp();

  return (
    <div className="app-container">
      <Header />
      <Navigation />

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
