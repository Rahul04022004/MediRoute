import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification, NotificationType, createNotification as createNotifService } from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, title: string, message: string, duration?: number, soundAlert?: boolean) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (type: NotificationType, title: string, message: string, duration?: number, soundAlert?: boolean) => {
      const notification = createNotifService(type, title, message, duration, soundAlert);
      setNotifications(prev => [...prev, notification]);

      // Auto-remove after duration
      if (duration && duration > 0) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, duration);
      }
    },
    [removeNotification]
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
