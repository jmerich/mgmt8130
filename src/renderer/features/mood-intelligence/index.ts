/**
 * Mood Intelligence Feature
 *
 * AI-powered mood detection and behavioral analysis system
 * that predicts impulse risk and provides intelligent interventions.
 */

// Core mood detection service
export {
  moodDetectionService,
  useMoodDetection,
  type MoodState,
  type RiskLevel,
  type MoodPrediction,
  type BrowserSignals,
  type DeviceSignals,
  type TemporalSignals,
  type PurchasePatternSignals,
} from '../../services/mood-detection';

// Purchase Intercept - Full-screen intervention UI
export { PurchaseIntercept, default as PurchaseInterceptDefault } from './PurchaseIntercept';

// Spending Forecast - Predictive spending widget
export { SpendingForecast, default as SpendingForecastDefault } from './SpendingForecast';

// Smart Notifications - Proactive alert system
export {
  NotificationProvider,
  useNotifications,
  useSmartNotificationGenerator,
  NotificationToast,
  ToastContainer,
  NotificationCenter,
  NotificationBell,
  type NotificationType,
  type NotificationPriority,
  type SmartNotification,
} from './SmartNotifications';
