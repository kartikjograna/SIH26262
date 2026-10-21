import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ShieldCheck, Bell, RefreshCw, Eye, SlidersHorizontal, CheckCircle2, AlertTriangle } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const {
    role,
    switchRole,
    institutions,
    selectedInstId,
    setSelectedInstId,
    currentInstitution,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
    unreadCount,
    isNotifDrawerOpen,
    setIsNotifDrawerOpen,
    isOnline,
    refreshData
  } = useApp();

  return (
    <header className="header-wrapper">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="govt-bar" aria-hidden="true"></div>

      {/* Accessibility & Quick Utility Bar */}
      <div className="top-utility-bar">
        <div className="utility-left">
          <span>भारत सरकार | Government of India</span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span>शिक्षा मंत्रालय | Ministry of Education</span>
        </div>
        <div className="utility-right">
          {/* Contrast Mode Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`util-btn ${highContrast ? 'active' : ''}`}
            title="Toggle High Contrast for Accessibility"
            aria-label="Toggle High Contrast Mode"
          >
            <SlidersHorizontal size={11} style={{ display: 'inline', marginRight: '3px' }} />
            {highContrast ? 'Standard Contrast' : 'High Contrast'}
          </button>

          {/* Text Size Resizers */}
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', marginRight: '2px' }}>Text:</span>
            <button
              onClick={() => setFontSize('font-sm')}
              className={`util-btn ${fontSize === 'font-sm' ? 'active' : ''}`}
              title="Small text"
              aria-label="Small font size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('font-md')}
              className={`util-btn ${fontSize === 'font-md' ? 'active' : ''}`}
              title="Default text"
              aria-label="Default font size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('font-lg')}
              className={`util-btn ${fontSize === 'font-lg' ? 'active' : ''}`}
              title="Large text"
              aria-label="Large font size"
            >
              A+
            </button>
          </div>

          <span style={{ color: '#cbd5e1' }}>|</span>

          {/* Backend Connection State */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}
            title={isOnline ? "Connected to Node.js API (http://localhost:5000/api)" : "Backend offline: running in Standalone Interactive Demo Mode"}
          >
            <span className={`status-indicator-dot ${!isOnline ? 'offline' : ''}`}></span>
            <span>{isOnline ? 'API Connected' : 'Demo Standalone'}</span>
            <button
              onClick={refreshData}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0 2px' }}
              title="Refresh Data from API"
              aria-label="Refresh application state"
            >
              <RefreshCw size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="main-header">
        <div className="header-inner">
          <div className="brand-section">
            {/* AICTE Emblem / Crest */}
            <div className="emblem-badge" aria-hidden="true">
              <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer cogwheel representing technical education */}
                <circle cx="50" cy="50" r="46" fill="#0a2540" />
                <path d="M50 10 L54 22 L66 22 L56 30 L60 42 L50 34 L40 42 L44 30 L34 22 L46 22 Z" fill="#e85d04" />
                {/* Ashoka Chakra Center */}
                <circle cx="50" cy="50" r="26" fill="#ffffff" stroke="#003366" strokeWidth="3" />
                <circle cx="50" cy="50" r="8" fill="#003366" />
                {/* Gear teeth */}
                <rect x="47" y="2" width="6" height="8" rx="2" fill="#e85d04" />
                <rect x="47" y="90" width="6" height="8" rx="2" fill="#e85d04" />
                <rect x="2" y="47" width="8" height="6" rx="2" fill="#e85d04" />
                <rect x="90" y="47" width="8" height="6" rx="2" fill="#e85d04" />
              </svg>
            </div>

            <div className="brand-titles">
              <span className="brand-hindi">अखिल भारतीय तकनीकी शिक्षा परिषद</span>
              <span className="brand-english">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</span>
              <span className="brand-system">Approval Workflow Automation & Compliance System</span>
            </div>
          </div>

          {/* Action Center: Role Switcher & Institution Context */}
          <div className="header-actions">
            {/* Dynamic Role Switcher */}
            <div className="role-switcher-box" role="radiogroup" aria-label="Portal Role Selector">
              <button
                type="button"
                role="radio"
                aria-checked={role === 'INSTITUTION'}
                onClick={() => switchRole('INSTITUTION')}
                className={`role-pill ${role === 'INSTITUTION' ? 'active' : ''}`}
                title="Switch to Technical Institution Portal"
              >
                <Building2 size={15} />
                <span>Institution Portal</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={role === 'OFFICIAL'}
                onClick={() => switchRole('OFFICIAL')}
                className={`role-pill ${role === 'OFFICIAL' ? 'active' : ''}`}
                title="Switch to AICTE Official Portal (Regional / Scrutiny Bureau)"
              >
                <ShieldCheck size={15} />
                <span>AICTE Official</span>
              </button>
            </div>

            {/* Institution Switcher (Demo Feature for Institution Portal) */}
            {role === 'INSTITUTION' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="form-select"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    fontSize: '0.8rem',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    maxWidth: '220px',
                    cursor: 'pointer'
                  }}
                  title="Switch Active Technical Institution for Demo"
                  aria-label="Active Institution"
                >
                  {institutions.map(inst => (
                    <option key={inst._id} value={inst._id} style={{ color: '#0a2540', background: '#ffffff' }}>
                      {inst.name.split(' ')[0]} ({inst.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notification Bell with Badge */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotifDrawerOpen(!isNotifDrawerOpen)}
                className="notif-bell-btn"
                aria-label={`Notifications: ${unreadCount} unread`}
                title="View Notifications & Expiry Alerts"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notif-badge-count">{unreadCount}</span>
                )}
              </button>
              <NotificationCenter />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
