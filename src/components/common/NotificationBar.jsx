import React from 'react';
import { XCircle, AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * Unified notification bar component
 * Displays notifications with priority system: error > warning > info > success
 */
const NotificationBar = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) return null;

  const priorityOrder = { error: 0, warning: 1, info: 2, success: 3 };
  
  // Sort notifications by priority
  const sortedNotifications = [...notifications].sort((a, b) => 
    priorityOrder[a.type] - priorityOrder[b.type]
  );

  // Show the highest priority notification
  const topNotification = sortedNotifications[0];

  const styles = {
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-red-100',
      border: 'border-red-400',
      text: 'text-red-900',
      icon: XCircle,
      iconColor: 'text-red-600'
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-50 to-amber-100',
      border: 'border-amber-400',
      text: 'text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
      border: 'border-blue-400',
      text: 'text-blue-900',
      icon: AlertCircle,
      iconColor: 'text-blue-600'
    },
    success: {
      bg: 'bg-gradient-to-r from-green-50 to-green-100',
      border: 'border-green-400',
      text: 'text-green-900',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    }
  };

  const style = styles[topNotification.type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} border-2 ${style.border} rounded-xl p-4 shadow-lg animate-in slide-in-from-top duration-300`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`${style.text} text-sm font-bold text-right leading-relaxed`}>
            {topNotification.message}
          </p>
          {sortedNotifications.length > 1 && (
            <p className="text-xs text-gray-600 mt-1 text-right">
              +{sortedNotifications.length - 1} إشعار إضافي
            </p>
          )}
        </div>
        {topNotification.dismissible && (
          <button
            onClick={() => onDismiss(topNotification.id)}
            className={`${style.iconColor} hover:opacity-70 transition-opacity`}
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationBar;