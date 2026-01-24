import React from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

/**
 * Professional Floating Notification Component
 * Fixed position notifications that don't affect layout
 */
const NotificationBar = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) return null;

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-800',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
        };
      case 'error':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          text: 'text-rose-800',
          icon: <XCircle className="w-5 h-5 text-rose-600" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-800',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-800',
          icon: <Info className="w-5 h-5 text-blue-600" />,
        };
    }
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 space-y-3 max-w-2xl w-full px-5 pointer-events-none">
      {notifications.map((notification) => {
        const style = getNotificationStyle(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`
              ${style.bg} ${style.border} ${style.text}
              border-2 rounded-xl px-5 py-4 flex items-center gap-4
              shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-5 duration-300
              pointer-events-auto
            `}
          >
            <div className="flex-shrink-0">
              {style.icon}
            </div>
            
            <p className="flex-1 text-sm font-semibold text-right leading-relaxed">
              {notification.message}
            </p>
            
            {notification.dismissible && (
              <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 p-1.5 hover:bg-black/5 rounded-lg transition-all"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NotificationBar;