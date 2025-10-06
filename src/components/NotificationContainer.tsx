import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../lib/store';

const NotificationContainer: React.FC = () => {
  const { notifications, hideNotification } = useAppStore();

  useEffect(() => {
    // Auto-hide notifications after 5 seconds
    notifications.forEach((notification) => {
      if (notification.autoHide !== false) {
        const timer = setTimeout(() => {
          hideNotification(notification.id);
        }, 5000);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, hideNotification]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full border rounded-lg shadow-lg p-4 transition-all duration-300 transform ${
            getBackgroundColor(notification.type)
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 w-0 flex-1">
              {notification.title && (
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
              )}
              <p className="text-sm text-gray-700 mt-1">
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => hideNotification(notification.id)}
              >
                <span className="sr-only">关闭</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;