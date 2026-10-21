import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, AlertCircle, Clock, ExternalLink, X } from 'lucide-react';

const NotificationCenter = () => {
  const { notifications, markAsRead, isNotifDrawerOpen, setIsNotifDrawerOpen, viewApplicationDetail } = useApp();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM'

  if (!isNotifDrawerOpen) return null;

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'ALL') return true;
    return n.severity === filter;
  });

  const getSeverityBadge = (severity) => {
    if (severity === 'HIGH') return <span className="stage-badge DEFICIENCY">CRITICAL</span>;
    if (severity === 'MEDIUM') return <span className="stage-badge SCRUTINY">WARNING</span>;
    return <span className="stage-badge SUBMITTED">INFO</span>;
  };

  return (
    <div className="notif-dropdown" role="dialog" aria-label="Notifications Panel">
      <div style={{
        padding: '0.85rem 1rem',
        backgroundColor: '#0a2540',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.92rem' }}>
          <Bell size={16} />
          <span>Notification & Alert Center</span>
        </div>
        <button
          onClick={() => setIsNotifDrawerOpen(false)}
          style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{
        padding: '6px 12px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        gap: '6px'
      }}>
        <button
          onClick={() => setFilter('ALL')}
          className={`btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.72rem', padding: '2px 8px' }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('HIGH')}
          className={`btn-sm ${filter === 'HIGH' ? 'btn-danger' : 'btn-outline'}`}
          style={{ fontSize: '0.72rem', padding: '2px 8px' }}
        >
          High Severity ({notifications.filter(n => n.severity === 'HIGH').length})
        </button>
      </div>

      {/* List */}
      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {filteredNotifs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            No alerts or notifications found.
          </div>
        ) : (
          filteredNotifs.map(n => (
            <div
              key={n._id}
              className={`notif-item ${!n.isRead ? 'unread' : ''}`}
              onClick={() => {
                if (!n.isRead) markAsRead(n._id);
                if (n.relatedApplication) {
                  viewApplicationDetail(n.relatedApplication);
                  setIsNotifDrawerOpen(false);
                }
              }}
            >
              <div className="notif-icon">
                {n.severity === 'HIGH' ? (
                  <AlertCircle size={18} color="#b91c1c" />
                ) : (
                  <Clock size={18} color="#b45309" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                  {getSeverityBadge(n.severity)}
                  {!n.isRead && (
                    <span style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: '700' }}>NEW</span>
                  )}
                </div>
                <p className="notif-text" style={{ marginTop: '4px' }}>{n.message}</p>
                <div className="notif-time" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  {n.relatedApplication && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#0a2540', fontWeight: '600' }}>
                      View App <ExternalLink size={11} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        padding: '8px 12px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <button
          onClick={() => notifications.forEach(n => !n.isRead && markAsRead(n._id))}
          className="btn-outline btn-sm"
          style={{ width: '100%', fontSize: '0.75rem', padding: '4px' }}
        >
          <Check size={12} /> Mark All as Read
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;
