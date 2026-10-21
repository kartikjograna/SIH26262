import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

/**
 * Traffic Light Indicator System
 * Green: Valid (> 60 days remaining)
 * Amber: Expiring Soon (0 - 60 days remaining)
 * Red: Expired (Past expiry date)
 */
export const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) {
    return { status: 'unknown', label: 'No Expiry Set', days: null, color: 'gray' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'red',
      level: 'CRITICAL',
      label: `EXPIRED (${Math.abs(diffDays)}d ago)`,
      fullLabel: `Expired on ${expiry.toLocaleDateString()}`,
      days: diffDays,
      urgency: 'high'
    };
  } else if (diffDays <= 30) {
    return {
      status: 'amber',
      level: 'URGENT_WARNING',
      label: `Expiring Soon (${diffDays}d left)`,
      fullLabel: `Expires in ${diffDays} days (${expiry.toLocaleDateString()})`,
      days: diffDays,
      urgency: 'medium'
    };
  } else if (diffDays <= 60) {
    return {
      status: 'amber',
      level: 'WARNING',
      label: `Expiring in ${diffDays} days`,
      fullLabel: `Expires in ${diffDays} days (${expiry.toLocaleDateString()})`,
      days: diffDays,
      urgency: 'medium'
    };
  } else {
    return {
      status: 'green',
      level: 'VALID',
      label: `Valid (${diffDays}d left)`,
      fullLabel: `Valid until ${expiry.toLocaleDateString()} (${diffDays} days remaining)`,
      days: diffDays,
      urgency: 'low'
    };
  }
};

const TrafficLightBadge = ({ expiryDate, showIcon = true, customLabel, size = 'md' }) => {
  const info = getExpiryStatus(expiryDate);

  const renderIcon = () => {
    if (!showIcon) return null;
    if (info.status === 'green') {
      return <CheckCircle2 size={14} aria-hidden="true" />;
    } else if (info.status === 'amber') {
      return <AlertTriangle size={14} aria-hidden="true" />;
    } else if (info.status === 'red') {
      return <AlertOctagon size={14} aria-hidden="true" />;
    }
    return <HelpCircle size={14} aria-hidden="true" />;
  };

  return (
    <span
      className={`traffic-light-badge ${info.status} ${size === 'sm' ? 'text-xs' : ''}`}
      role="status"
      aria-label={`Document Expiry Status: ${info.level}. ${info.fullLabel}`}
      title={info.fullLabel}
    >
      <span className="traffic-dot" aria-hidden="true"></span>
      {renderIcon()}
      <span>{customLabel || info.label}</span>
    </span>
  );
};

export default TrafficLightBadge;
