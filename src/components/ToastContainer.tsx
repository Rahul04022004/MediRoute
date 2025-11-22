import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';
import { NotificationType } from '../services/notificationService';
import clsx from 'clsx';

const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case NotificationType.Success:
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        title: 'text-green-400',
        icon: '✓',
      };
    case NotificationType.Error:
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        title: 'text-red-400',
        icon: '✕',
      };
    case NotificationType.Warning:
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        title: 'text-yellow-400',
        icon: '⚠',
      };
    case NotificationType.Critical:
      return {
        bg: 'bg-red-600/20',
        border: 'border-red-600/50',
        title: 'text-red-300',
        icon: '🚨',
      };
    case NotificationType.Info:
    default:
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        title: 'text-blue-400',
        icon: 'ℹ',
      };
  }
};

const ToastNotification: React.FC<{ notification: any; onClose: () => void }> = ({ notification, onClose }) => {
  const styles = getNotificationStyles(notification.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 400, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={clsx(
        'fixed top-24 right-6 max-w-sm rounded-xl border backdrop-blur-lg p-5 shadow-xl z-[9999]',
        styles.bg,
        styles.border,
        notification.type === NotificationType.Critical && 'animate-pulse border-l-4'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={clsx('text-2xl flex-shrink-0 mt-0.5', styles.title)}>{styles.icon}</div>
        <div className="flex-grow">
          <h3 className={clsx('font-bold text-base', styles.title)}>{notification.title}</h3>
          <p className="text-sm text-gray-300 mt-1.5 leading-relaxed">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-white transition-colors flex-shrink-0 text-lg leading-none pt-1"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <AnimatePresence>
      {notifications.map((notification, index) => (
        <div key={notification.id} style={{ position: 'fixed', top: `${96 + index * 120}px`, right: 24, zIndex: 9999 }}>
          <ToastNotification notification={notification} onClose={() => removeNotification(notification.id)} />
        </div>
      ))}
    </AnimatePresence>
  );
};

export default ToastContainer;
