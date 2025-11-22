import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { NotificationType } from '../services/notificationService';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const NotificationHistory: React.FC = () => {
  const { notifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Success: return '✓';
      case NotificationType.Error: return '✕';
      case NotificationType.Warning: return '⚠';
      case NotificationType.Critical: return '🚨';
      case NotificationType.Info: return 'ℹ';
      default: return '•';
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Success: return 'text-green-400';
      case NotificationType.Error: return 'text-red-400';
      case NotificationType.Warning: return 'text-yellow-400';
      case NotificationType.Critical: return 'text-red-500';
      case NotificationType.Info: return 'text-blue-400';
      default: return 'text-muted';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const sortedNotifications = [...notifications].reverse();
  const criticalCount = notifications.filter(n => n.type === NotificationType.Critical).length;

  return (
    <div className="fixed bottom-6 left-6 z-[9998]">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center font-bold text-lg transition-colors',
          isOpen
            ? 'bg-primary text-background'
            : 'bg-background-light border-2 border-primary/30 text-primary hover:border-primary/50'
        )}
      >
        <span className="text-xl">🔔</span>
        {notifications.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={clsx(
              'absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
              criticalCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-primary'
            )}
          >
            {Math.min(notifications.length, 9)}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute bottom-20 left-0 w-96 bg-background-light/95 backdrop-blur-lg rounded-lg border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-3 border-b border-primary/20">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span>🔔</span> Notification History ({notifications.length})
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {sortedNotifications.length === 0 ? (
              <div className="p-6 text-center text-muted">
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {sortedNotifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={clsx(
                      'p-3 rounded-lg border transition-colors hover:bg-background/50',
                      notif.type === NotificationType.Critical
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-primary/10 bg-background/30'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={clsx('text-lg flex-shrink-0', getTypeColor(notif.type))}>
                        {getTypeIcon(notif.type)}
                      </span>
                      <div className="flex-grow min-w-0">
                        <p className={clsx('font-semibold text-sm', getTypeColor(notif.type))}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-muted mt-2">{formatTime(notif.timestamp)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-primary/20 p-2 bg-background/50">
              <button className="w-full py-2 text-xs font-semibold text-muted hover:text-foreground transition-colors">
                Clear All
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default NotificationHistory;
