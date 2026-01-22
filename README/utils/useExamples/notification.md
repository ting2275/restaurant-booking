# 通知模組使用範例

這個文件展示了如何在通知模組中使用通用工具函數。

## 檔案結構

```
src/composables/notification/
├── index.js                    # 模組入口檔案
├── useNotificationApi.js       # 通知 API 服務
├── useNotificationData.js      # 通知資料管理
├── usePopupControl.js          # 彈窗控制管理
├── useNotificationStorage.js   # 通知儲存管理
├── usePollingManager.js        # 輪詢管理器
├── useNotificationProcessor.js # 通知處理器
├── useSmartPolling.js          # 固定間隔輪詢
├── services/
    └── notificationService.js  # 通知服務
└── constants/
    └── config.js              # 配置常數

```

## 使用範例

### 1. 通知 API 服務

```javascript
// src/composables/notification/useNotificationApi.js
import { getAlertList } from '@/services/api/alertList';
import { createSingletonFactory } from '@/utils/singletonFactory';
import { useErrorHandler } from '@/utils/errorHandler';
import { useNotificationService } from './services/notificationService';
import { useNotificationStorage } from './useNotificationStorage';

function createNotificationApi() {
  const { handleApiError } = useErrorHandler();
  const { updateNotificationData } = useNotificationService();
  const { persistNotifications } = useNotificationStorage();

  // 獲取通知列表
  const fetchNotificationList = async (merchantId) => {
    if (!merchantId) {
      const error = new Error('缺少 merchantId');
      handleApiError(error, 'fetchNotificationList');
      throw error;
    }

    try {
      const response = await getAlertList(merchantId);

      if (response.status === "200" && response.data) {
        return response;
      } else {
        const error = new Error('API 回應格式錯誤');
        handleApiError(error, 'fetchNotificationList');
        throw error;
      }
    } catch (error) {
      handleApiError(error, 'fetchNotificationList');
      throw error;
    }
  };

  // 處理通知資料更新
  const handleNotificationUpdate = (apiData, notificationData, options = {}) => {
    try {
      const result = updateNotificationData(apiData, notificationData, options);

      if (result.hasNewData) {
        // 儲存到本地
        persistNotifications(notificationData.notifications.value);
      }

      return result;
    } catch (error) {
      handleApiError(error, 'handleNotificationUpdate');
      return {
        hasNewData: false,
        newNotifications: [],
        updatedNotifications: [],
        previousCount: notificationData.notifications.value.length,
        currentCount: notificationData.notifications.value.length
      };
    }
  };

  return {
    fetchNotificationList,
    handleNotificationUpdate
  };
}

export const useNotificationApi = createSingletonFactory(createNotificationApi, 'useNotificationApi');
```

### 2. 通知資料管理

```javascript
// src/composables/notification/useNotificationData.js
import { ref, computed } from 'vue';
import { createSingletonFactory } from '@/utils/singletonFactory';
import { useErrorHandler } from '@/utils/errorHandler';
import { NOTIFICATION_CONFIG } from './constants/config';

function createNotificationData() {
  const { handleError } = useErrorHandler();

  const notifications = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const lastUpdateTime = ref(null);

  // 計算屬性：已讀和未讀通知
  const unreadNotifications = computed(() => {
    return Array.isArray(notifications.value) ? notifications.value.filter(notification => !notification.isRead) : [];
  });

  const readNotifications = computed(() => {
    return Array.isArray(notifications.value) ? notifications.value.filter(notification => notification.isRead) : [];
  });

  // 計算未讀通知數量
  const unreadCount = computed(() => unreadNotifications.value.length);

  // 新增通知
  const addNotification = (notification) => {
    try {
      if (!notification || typeof notification !== 'object') {
        throw new Error('通知資料格式錯誤');
      }

      notifications.value.unshift(notification);
    } catch (error) {
      handleError(error, 'addNotification');
    }
  };

  // 標記為已讀
  const markAsRead = (notificationId) => {
    try {
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    } catch (error) {
      handleError(error, 'markAsRead');
    }
  };

  // 清除所有通知
  const clearAllNotifications = () => {
    try {
      notifications.value = [];
      error.value = null;
      lastUpdateTime.value = null;
    } catch (error) {
      handleError(error, 'clearAllNotifications');
    }
  };

  return {
    notifications,
    isLoading,
    error,
    lastUpdateTime,
    unreadNotifications,
    readNotifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAllNotifications
  };
}

export const useNotificationData = createSingletonFactory(createNotificationData, 'useNotificationData');
```

### 3. 彈窗控制管理

```javascript
// src/composables/notification/usePopupControl.js
import { ref, watch, onUnmounted } from 'vue';
import { createSingletonFactory } from '@/utils/singletonFactory';
import { useErrorHandler } from '@/utils/errorHandler';
import { NOTIFICATION_CONFIG } from './constants/config';

function createPopupControl() {
  const { handleError } = useErrorHandler();

  const isNotifyOpen = ref(false);
  const isServiceOpen = ref(false);
  const isNewNotification = ref(false);
  const isClicked = ref(false);
  const isMouseOver = ref(false);

  const fadeOutTimer = ref(null);
  const FADE_OUT_DURATION = NOTIFICATION_CONFIG.FADE_OUT_DURATION;

  // 開啟通知彈窗
  const openNotifyPopup = () => {
    try {
      stopFadeOut();
      isNotifyOpen.value = true;
      isServiceOpen.value = false;
    } catch (error) {
      handleError(error, 'openNotifyPopup');
    }
  };

  // 關閉通知彈窗
  const closeNotifyPopup = () => {
    try {
      stopFadeOut();
      isNotifyOpen.value = false;
      isClicked.value = false;
    } catch (error) {
      handleError(error, 'closeNotifyPopup');
    }
  };

  // 處理滑鼠進入
  const handleMouseEnter = () => {
    try {
      isMouseOver.value = true;
      stopFadeOut();
    } catch (error) {
      handleError(error, 'handleMouseEnter');
    }
  };

  // 處理滑鼠離開
  const handleMouseLeave = (duration = FADE_OUT_DURATION) => {
    try {
      isMouseOver.value = false;
      startFadeOut(duration);
    } catch (error) {
      handleError(error, 'handleMouseLeave');
    }
  };

  // 組件卸載時清理
  onUnmounted(() => {
    try {
      stopFadeOut();
      closeNotifyPopup();
      closeServicePopup();
    } catch (error) {
      handleError(error, 'onUnmounted');
    }
  });

  return {
    isNotifyOpen,
    isServiceOpen,
    isNewNotification,
    isClicked,
    isMouseOver,
    openNotifyPopup,
    closeNotifyPopup,
    handleMouseEnter,
    handleMouseLeave
  };
}

export const usePopupControl = createSingletonFactory(createPopupControl, 'usePopupControl');
```

### 4. 通知儲存管理

```javascript
// src/composables/notification/useNotificationStorage.js
import { createSingletonFactory } from '@/utils/singletonFactory';
import { useErrorHandler } from '@/utils/errorHandler';
import { useNotificationProcessor } from './useNotificationProcessor';

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

  return {
    loadStoredNotifications,
    persistNotifications,
    clearStoredNotifications
  };
}

export const useNotificationStorage = createSingletonFactory(createNotificationStorage, 'useNotificationStorage');
```

### 5. 輪詢管理器

```javascript
// src/composables/notification/usePollingManager.js
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { createSingletonFactory } from '@/utils/singletonFactory';
import { useErrorHandler } from '@/utils/errorHandler';
import { useSmartPolling } from './useSmartPolling';
import { useNotificationData } from './useNotificationData';
import { usePopupControl } from './usePopupControl';
import { useNotificationApi } from './useNotificationApi';
import { useNotificationStorage } from './useNotificationStorage';
import { useUserStore } from '@/stores/userStore';
import { POLLING_CONFIG } from './constants/config';

function createPollingManager() {
  const { handlePollingError } = useErrorHandler();
  const userStore = useUserStore();

  const isInitialized = ref(false);
  const lastFetchTime = ref(null);
  const errorCount = ref(0);
  const maxRetries = 3;

  const dependencies = {
    notificationData: useNotificationData(),
    popupControl: usePopupControl(),
    notificationApi: useNotificationApi(),
    notificationStorage: useNotificationStorage()
  };

  const merchantId = computed(() => userStore.merchantId);
  const isLogin = computed(() => userStore.isLogin);
  const canPoll = computed(() => merchantId.value && isLogin.value);

  let pollingInstance = null;

  // 重置通知
  const resetNotifications = () => {
    try {
      pollingInstance?.stopPolling();
      dependencies.notificationData.clearAllNotifications();
      errorCount.value = 0;
      lastFetchTime.value = null;
      isInitialized.value = false;
    } catch (error) {
      handlePollingError(error, 'resetNotifications');
    }
  };

  // 監聽登入狀態變化
  watch(
    () => isLogin.value,
    (isLoggedIn) => {
      if (isLoggedIn && !isInitialized.value) {
        initializeNotifications();
      } else if (!isLoggedIn) {
        resetNotifications();
      }
    }
  );

  onUnmounted(() => {
    pollingInstance?.cleanup();
  });

  return {
    isInitialized,
    lastFetchTime,
    errorCount,
    canPoll,
    merchantId,
    isLogin,
    resetNotifications
  };
}

export const usePollingManager = createSingletonFactory(createPollingManager, 'usePollingManager');
```

## 重置場景

### 1. 登出時重置

```javascript
// 在組件中使用
import { resetOnLogout } from '@/utils/resetManager';

const handleLogout = () => {
  userStore.clearUserInfo();
  resetOnLogout(); // 重置所有通知相關單例
  router.push('/login');
};
```

### 2. 權限變更時重置

```javascript
// 在組件中使用
import { resetOnRoleChange } from '@/utils/resetManager';

const handleRoleChange = () => {
  resetOnRoleChange(); // 重置所有單例
  window.location.reload();
};
```

### 3. 商家切換時重置

```javascript
// 在 Store 中使用
import { ResetManager } from '@/utils/resetManager';

const switchMerchant = (newMerchantId) => {
  this.merchantId = newMerchantId;
  ResetManager.resetOnMerchantSwitch(); // 重置通知模組單例
};
```

## 模組分組配置

通知模組在 ResetManager 中的分組配置：

```javascript
const MODULE_GROUPS = {
  notification: [
    'useNotificationApi',
    'useNotificationData',
    'usePopupControl',
    'useNotificationStorage',
    'usePollingManager'
  ]
};
```

## 輪詢系統說明

通知系統採用**固定間隔輪詢策略**：

### 輪詢配置
- **固定間隔**：5 分鐘（300,000 毫秒）
- **不依賴使用者活動狀態**：無論使用者是否活躍，都以固定間隔執行
- **自動管理**：登入時啟動，登出時停止

### 自動彈窗邏輯
- ✅ 輪詢檢測到新通知時自動彈出
- ✅ 切換商家時自動彈出
- ❌ 頁面初次載入/重新載入時不自動彈出

### 配置檔案
```javascript
// src/composables/notification/constants/config.js
export const POLLING_CONFIG = {
  INTERVAL: 300000  // 5分鐘 (300,000 毫秒)
};
```

## 最佳實踐

1. **錯誤處理**：所有可能出錯的操作都使用 `useErrorHandler`
2. **單例管理**：使用 `createSingletonFactory` 確保單例模式
3. **重置時機**：在適當的時機重置單例，避免狀態混亂
4. **模組化**：按功能分離不同的 composables
5. **依賴注入**：使用依賴注入模式管理模組間的關係

## 注意事項

1. 通知輪詢會在用戶登出時自動停止
2. 本地儲存的通知會在商家切換時清除
3. 彈窗狀態會在組件卸載時自動清理
4. 錯誤處理會記錄詳細的錯誤資訊