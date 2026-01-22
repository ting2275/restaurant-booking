import { createSingletonFactory } from '@/utils/singletonFactory';
import { useErrorHandler } from '@/utils/errorHandler';
import { useNotificationProcessor } from './useNotificationProcessor';

// 通知儲存管理
function createNotificationStorage() {
  const { handleStorageError } = useErrorHandler();
  const { processNotification } = useNotificationProcessor();

  const STORAGE_KEY = 'notifications';

  // 載入本地儲存的通知
  const loadStoredNotifications = async () => {
    try {
      const storedNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const processedNotifications = storedNotifications
        .map(notification => processNotification(notification))
        .filter(Boolean);

      return processedNotifications;
    } catch (error) {
      handleStorageError(error, 'loadStoredNotifications');
      return [];
    }
  };

  // 儲存通知到本地
  const persistNotifications = (notifications) => {
    try {
      if (!Array.isArray(notifications)) {
        throw new Error('通知資料必須是陣列');
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      handleStorageError(error, 'persistNotifications');
    }
  };

  // 清除本地儲存的通知
  const clearStoredNotifications = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      handleStorageError(error, 'clearStoredNotifications');
    }
  };

  // 獲取儲存的通知數量
  const getStoredNotificationCount = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return 0;

      const notifications = JSON.parse(stored);
      return Array.isArray(notifications) ? notifications.length : 0;
    } catch (error) {
      handleStorageError(error, 'getStoredNotificationCount');
      return 0;
    }
  };

  // 檢查本地儲存是否可用
  const isStorageAvailable = () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  };

  const backupNotifications = (notifications) => {
    try {
      if (!isStorageAvailable()) {
        throw new Error('本地儲存不可用');
      }

      const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(notifications));

      // 清理舊的備份（保留最近5個）
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${STORAGE_KEY}_backup_`))
        .sort()
        .reverse();

      if (backupKeys.length > 5) {
        backupKeys.slice(5).forEach(key => localStorage.removeItem(key));
      }

      return backupKey;
    } catch (error) {
      handleStorageError(error, 'backupNotifications');
      return null;
    }
  };

  // 恢復通知資料
  const restoreNotifications = (backupKey) => {
    try {
      if (!backupKey || !localStorage.getItem(backupKey)) {
        throw new Error('備份資料不存在');
      }

      const backupData = JSON.parse(localStorage.getItem(backupKey));
      persistNotifications(backupData);
      return backupData;
    } catch (error) {
      handleStorageError(error, 'restoreNotifications');
      return [];
    }
  };

  // 獲取儲存統計資訊
  const getStorageStats = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          totalNotifications: 0,
          storageSize: 0,
          lastUpdated: null
        };
      }

      const notifications = JSON.parse(stored);
      const storageSize = new Blob([stored]).size;

      return {
        totalNotifications: Array.isArray(notifications) ? notifications.length : 0,
        storageSize,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      handleStorageError(error, 'getStorageStats');
      return {
        totalNotifications: 0,
        storageSize: 0,
        lastUpdated: null
      };
    }
  };

  return {
    loadStoredNotifications,
    persistNotifications,
    clearStoredNotifications,
    getStoredNotificationCount,
    isStorageAvailable,
    backupNotifications,
    restoreNotifications,
    getStorageStats,
    STORAGE_KEY
  };
}

export const useNotificationStorage = createSingletonFactory(createNotificationStorage);