import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/apiService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Role & User Context
  const [role, setRole] = useState('INSTITUTION'); // 'INSTITUTION' | 'OFFICIAL'
  const [institutions, setInstitutions] = useState(api.getMockInstitutions());
  const [selectedInstId, setSelectedInstId] = useState(api.getMockInstitutions()[0]._id);
  
  // Navigation & View state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'compliance' | 'new-application' | 'pendency' | 'app-detail'
  const [selectedAppId, setSelectedAppId] = useState('APP-2025-0891');
  
  // Accessibility & UI Controls
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('font-md'); // 'font-sm', 'font-md', 'font-lg'
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  // Load institutions from API if online
  useEffect(() => {
    let isMounted = true;
    const fetchInsts = async () => {
      const insts = await api.getInstitutions();
      if (isMounted && insts && insts.length > 0) {
        setInstitutions(insts);
        setSelectedInstId(insts[0]._id);
      }
    };
    fetchInsts();
  }, [isOnline]);

  // Active institution object
  const currentInstitution = institutions.find(i => i._id === selectedInstId) || institutions[0];

  // Refresh trigger
  const refreshData = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  // Check backend health periodically
  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      const healthy = await api.checkBackendHealth();
      if (isMounted) setIsOnline(healthy);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch notifications for current context


  useEffect(() => {
    let isMounted = true;
    const fetchNotifs = async () => {
      const recipientId = role === 'INSTITUTION' ? selectedInstId : null;
      const res = await api.getNotifications(recipientId);
      if (isMounted) {
        setNotifications(res.data || []);
      }
    };
    fetchNotifs();
  }, [role, selectedInstId, dataVersion]);

  // Handle High Contrast & Font Size on document body
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    document.body.classList.remove('font-sm', 'font-md', 'font-lg');
    document.body.classList.add(fontSize);
  }, [fontSize]);

  // Switch role with sensible default tab
  const switchRole = (newRole) => {
    setRole(newRole);
    if (newRole === 'INSTITUTION') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('pendency');
    }
  };

  // Open Application Detail view
  const viewApplicationDetail = (appId) => {
    setSelectedAppId(appId);
    setActiveTab('app-detail');
  };

  // Mark notification read
  const markAsRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        role,
        switchRole,
        institutions,
        selectedInstId,
        setSelectedInstId,
        currentInstitution,
        activeTab,
        setActiveTab,
        selectedAppId,
        setSelectedAppId,
        viewApplicationDetail,
        highContrast,
        setHighContrast,
        fontSize,
        setFontSize,
        notifications,
        unreadCount,
        markAsRead,
        isNotifDrawerOpen,
        setIsNotifDrawerOpen,
        isOnline,
        refreshData,
        dataVersion
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
