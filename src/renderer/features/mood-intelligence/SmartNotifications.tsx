/**
 * Smart Notifications System
 *
 * AI-powered notification system that delivers proactive alerts
 * based on mood patterns, behavioral signals, and risk predictions.
 * Includes toast notifications, notification center, and scheduling.
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { MoodState, RiskLevel, MoodPrediction } from '../../services/mood-detection';
import './SmartNotifications.css';

// Notification Types
export type NotificationType =
  | 'mood-alert'      // Current mood indicates high risk
  | 'pattern-warning' // Historical pattern suggests upcoming risk
  | 'budget-alert'    // Budget threshold reached
  | 'cooldown-end'    // Cooldown period ending
  | 'positive'        // Positive reinforcement
  | 'insight'         // AI insight/tip
  | 'milestone';      // Achievement unlocked

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SmartNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  icon?: string;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
  expiresAt?: Date;
  metadata?: {
    mood?: MoodState;
    riskLevel?: RiskLevel;
    amount?: number;
    category?: string;
  };
}

interface NotificationContextType {
  notifications: SmartNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read' | 'dismissed'>) => void;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType | null>(null);

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Notification Provider
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);

  const addNotification = useCallback((
    notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read' | 'dismissed'>
  ) => {
    const newNotification: SmartNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      dismissed: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        dismissNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Toast Notification Component
interface ToastProps {
  notification: SmartNotification;
  onDismiss: () => void;
  onAction?: () => void;
}

export const NotificationToast: React.FC<ToastProps> = ({
  notification,
  onDismiss,
  onAction,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 5 seconds for non-urgent notifications
    if (notification.priority !== 'urgent') {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onDismiss, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.priority, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  const getIcon = (): string => {
    const icons: Record<NotificationType, string> = {
      'mood-alert': '🧠',
      'pattern-warning': '📊',
      'budget-alert': '💰',
      'cooldown-end': '⏰',
      'positive': '🎉',
      'insight': '💡',
      'milestone': '🏆',
    };
    return notification.icon || icons[notification.type];
  };

  const getPriorityClass = (): string => {
    return `priority-${notification.priority}`;
  };

  return (
    <div className={`notification-toast ${getPriorityClass()} ${isExiting ? 'exiting' : ''}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        {notification.actionLabel && (
          <button className="toast-action" onClick={onAction}>
            {notification.actionLabel}
          </button>
        )}
      </div>
      <button className="toast-dismiss" onClick={handleDismiss}>×</button>
    </div>
  );
};

// Toast Container - Renders active toasts
interface ToastContainerProps {
  maxVisible?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ maxVisible = 3 }) => {
  const { notifications, dismissNotification, markAsRead } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState<SmartNotification[]>([]);

  useEffect(() => {
    // Show only unread, non-dismissed notifications
    const activeNotifications = notifications
      .filter(n => !n.dismissed && !n.read)
      .slice(0, maxVisible);
    setVisibleToasts(activeNotifications);
  }, [notifications, maxVisible]);

  const handleDismiss = (id: string) => {
    dismissNotification(id);
    markAsRead(id);
  };

  if (visibleToasts.length === 0) return null;

  return (
    <div className="toast-container">
      {visibleToasts.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={() => handleDismiss(notification.id)}
          onAction={() => {
            notification.actionCallback?.();
            handleDismiss(notification.id);
          }}
        />
      ))}
    </div>
  );
};

// Notification Center Panel
interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (n.dismissed) return false;
    if (filter === 'unread') return !n.read;
    return true;
  });

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getIcon = (type: NotificationType): string => {
    const icons: Record<NotificationType, string> = {
      'mood-alert': '🧠',
      'pattern-warning': '📊',
      'budget-alert': '💰',
      'cooldown-end': '⏰',
      'positive': '🎉',
      'insight': '💡',
      'milestone': '🏆',
    };
    return icons[type];
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center" onClick={e => e.stopPropagation()}>
        <div className="nc-header">
          <h3>Notifications</h3>
          <div className="nc-actions">
            {unreadCount > 0 && (
              <button className="nc-btn" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
            <button className="nc-btn" onClick={clearAll}>
              Clear all
            </button>
            <button className="nc-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="nc-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="nc-list">
          {filteredNotifications.length === 0 ? (
            <div className="nc-empty">
              <span className="empty-icon">🔔</span>
              <p>No notifications</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`nc-item ${!notification.read ? 'unread' : ''} priority-${notification.priority}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="nc-item-icon">{getIcon(notification.type)}</div>
                <div className="nc-item-content">
                  <div className="nc-item-header">
                    <h4>{notification.title}</h4>
                    <span className="nc-item-time">{formatTime(notification.timestamp)}</span>
                  </div>
                  <p>{notification.message}</p>
                  {notification.actionLabel && (
                    <button
                      className="nc-item-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        notification.actionCallback?.();
                      }}
                    >
                      {notification.actionLabel}
                    </button>
                  )}
                </div>
                {!notification.read && <div className="nc-unread-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Notification Bell Icon with badge
interface NotificationBellProps {
  onClick: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const { unreadCount } = useNotifications();

  return (
    <button className="notification-bell" onClick={onClick}>
      <span className="bell-icon">🔔</span>
      {unreadCount > 0 && (
        <span className="bell-badge">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

// Smart Notification Generator - Creates contextual notifications
export const useSmartNotificationGenerator = () => {
  const { addNotification } = useNotifications();

  const generateMoodAlert = useCallback((prediction: MoodPrediction) => {
    if (prediction.riskLevel === 'high' || prediction.riskLevel === 'critical') {
      addNotification({
        type: 'mood-alert',
        priority: prediction.riskLevel === 'critical' ? 'urgent' : 'high',
        title: 'High Impulse Risk Detected',
        message: `Your current mood (${prediction.primaryMood}) suggests elevated spending risk. Consider waiting before making purchases.`,
        actionLabel: 'View Details',
        metadata: {
          mood: prediction.primaryMood,
          riskLevel: prediction.riskLevel,
        },
      });
    }
  }, [addNotification]);

  const generatePatternWarning = useCallback((day: string, _riskScore: number) => {
    addNotification({
      type: 'pattern-warning',
      priority: 'medium',
      title: `${day} Spending Alert`,
      message: `Historical data shows ${day}s are high-risk for impulse purchases. Stay mindful today!`,
      icon: '📈',
    });
  }, [addNotification]);

  const generateBudgetAlert = useCallback((percentUsed: number, remaining: number) => {
    const isUrgent = percentUsed >= 90;
    addNotification({
      type: 'budget-alert',
      priority: isUrgent ? 'urgent' : 'high',
      title: isUrgent ? 'Budget Critical!' : 'Budget Warning',
      message: `You've used ${percentUsed}% of your monthly budget. $${remaining.toFixed(0)} remaining.`,
      actionLabel: 'View Budget',
      metadata: {
        amount: remaining,
      },
    });
  }, [addNotification]);

  const generateCooldownEnd = useCallback((merchant: string) => {
    addNotification({
      type: 'cooldown-end',
      priority: 'medium',
      title: 'Cooldown Complete',
      message: `Your cooling-off period for ${merchant} has ended. Still want to make that purchase?`,
      actionLabel: 'Review Purchase',
      metadata: {
        category: merchant,
      },
    });
  }, [addNotification]);

  const generatePositiveReinforcement = useCallback((blockedAmount: number, streak: number) => {
    addNotification({
      type: 'positive',
      priority: 'low',
      title: 'Great Job! 🎉',
      message: `You've saved $${blockedAmount.toFixed(0)} by blocking impulse purchases. ${streak}-day mindful streak!`,
      icon: '💪',
    });
  }, [addNotification]);

  const generateInsight = useCallback((insight: string) => {
    addNotification({
      type: 'insight',
      priority: 'low',
      title: 'AI Insight',
      message: insight,
      icon: '💡',
    });
  }, [addNotification]);

  const generateMilestone = useCallback((milestone: string, description: string) => {
    addNotification({
      type: 'milestone',
      priority: 'low',
      title: milestone,
      message: description,
      icon: '🏆',
    });
  }, [addNotification]);

  return {
    generateMoodAlert,
    generatePatternWarning,
    generateBudgetAlert,
    generateCooldownEnd,
    generatePositiveReinforcement,
    generateInsight,
    generateMilestone,
  };
};

export default NotificationProvider;
