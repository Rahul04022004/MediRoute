export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Critical = 'critical',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  duration?: number; // milliseconds, undefined = persistent
  soundAlert?: boolean;
}

/**
 * Trigger browser notification
 */
export const triggerBrowserNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Play sound alert (for critical incidents)
 */
export const playSoundAlert = (type: 'critical' | 'warning' | 'info' = 'info') => {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'critical') {
      // Critical: high pitch, 3 beeps
      oscillator.frequency.value = 1000;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime + 0.15);
      oscillator.stop(audioContext.currentTime + 0.25);

      oscillator.start(audioContext.currentTime + 0.3);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === 'warning') {
      // Warning: medium pitch, 2 beeps
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime + 0.15);
      oscillator.stop(audioContext.currentTime + 0.25);
    } else {
      // Info: low pitch, 1 beep
      oscillator.frequency.value = 600;
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  } catch (error) {
    console.error('Error playing sound alert:', error);
  }
};

/**
 * Create notification with optional sound
 */
export const createNotification = (
  type: NotificationType,
  title: string,
  message: string,
  duration?: number,
  soundAlert?: boolean
): Notification => {
  const notification: Notification = {
    id: `notification-${Date.now()}-${Math.random()}`,
    type,
    title,
    message,
    timestamp: Date.now(),
    duration,
    soundAlert,
  };

  // Play sound if critical
  if (type === NotificationType.Critical && soundAlert !== false) {
    playSoundAlert('critical');
  } else if (type === NotificationType.Warning && soundAlert) {
    playSoundAlert('warning');
  }

  // Trigger browser notification for critical alerts
  if (type === NotificationType.Critical) {
    triggerBrowserNotification(title, {
      body: message,
      icon: '/ambulance-icon.png',
      tag: 'critical-alert',
      requireInteraction: true,
    });
  }

  return notification;
};
