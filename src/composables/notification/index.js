export { useSmartPolling } from './useSmartPolling';
export { useNotificationData } from './useNotificationData';
export { usePopupControl } from './usePopupControl';
export { usePollingManager } from './usePollingManager';
export { useNotificationProcessor } from './useNotificationProcessor';
export { useNotificationStorage } from './useNotificationStorage';
export { useNotificationApi } from './useNotificationApi';

// 使用通用工具
export { createSingletonFactory, resetSingletonInstances, getSingletonInstanceKeys, getSingletonInstanceCount } from '@/utils/singletonFactory';
export { ResetManager, resetModuleSingletons, resetAllSingletons, resetOnLogout, resetOnRoleChange, resetOnMerchantSwitch } from '@/utils/resetManager';
export { useErrorHandler } from '@/utils/errorHandler';
export { useNotificationService } from './services/notificationService';

// 常數
export { POLLING_CONFIG, NOTIFICATION_CONFIG } from './constants/config';

// 主要使用方式：usePollingManager
export { usePollingManager as useNotification } from './usePollingManager';