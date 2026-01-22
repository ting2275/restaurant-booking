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

// 輪詢管理器
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

  const isMarkingAsRead = ref(false);

  const merchantId = computed(() => userStore.merchantId);
  const isLogin = computed(() => userStore.isLogin);
  const canPoll = computed(() => merchantId.value && isLogin.value);

  let pollingInstance = null;

  const createPollingInstance = () => {
    try {
      return useSmartPolling(async () => {
        return await fetchNotificationList(merchantId.value, true);
      });
    } catch (error) {
      handlePollingError(error, 'createPollingInstance');
      return null;
    }
  };

  const initializeNotifications = async () => {
    try {
      if (!canPoll.value || isInitialized.value) return;
      isInitialized.value = true;

      await fetchNotificationList(merchantId.value, false); // 初始化時不自動彈出

      pollingInstance = createPollingInstance();

      pollingInstance?.startPolling();
    } catch (error) {
      handlePollingError(error, 'initializeNotifications');
    }
  };

  const fetchNotificationList = async (merchantId, autoPopup = false) => {
    try {
      dependencies.notificationData.setLoading(true);
      dependencies.notificationData.clearError();
      const apiData = await dependencies.notificationApi.fetchNotificationList(merchantId);

      const result = dependencies.notificationApi.handleNotificationUpdate(apiData, dependencies.notificationData, {
        onNewNotification: (newCount) => {
          if (newCount > 0) {
            dependencies.popupControl.setNewNotification(true);
            if (autoPopup) {
              dependencies.popupControl.openNotifyPopup();
            }
          }
        },
        popupControl: dependencies.popupControl
      });

      lastFetchTime.value = new Date().toISOString();
      errorCount.value = 0;
      return result;
    } catch (error) {
      errorCount.value++;
      handlePollingError(error, errorCount.value);
      dependencies.notificationData.setError(error);
      if (errorCount.value >= maxRetries) {
        pollingInstance?.stopPolling();
      }
      throw error;
    } finally {
      dependencies.notificationData.setLoading(false);
    }
  };

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

  const handleMerchantSwitch = async (newMerchantId) => {
    pollingInstance?.stopPolling();
    dependencies.notificationData.clearAllNotifications();
    pollingInstance = createPollingInstance();
    await fetchNotificationList(newMerchantId, true); // 切換店家時也自動彈出
    pollingInstance?.startPolling();
  };

  watch(
    () => merchantId.value,
    (newMerchantId, oldMerchantId) => {
      if (isInitialized.value && newMerchantId && newMerchantId !== oldMerchantId) {
        handleMerchantSwitch(newMerchantId);
      }
    }
  );

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

  onMounted(() => {
    if (!isInitialized.value && canPoll.value) {
      initializeNotifications();
    }
  });

  onUnmounted(() => {
    pollingInstance?.cleanup();
  });

  // 標記特定分類的所有通知為已讀
  const markCategoryAllAsRead = async (category) => {
    try {
      isMarkingAsRead.value = true;

      // 獲取該分類的未讀 sendId 列表
      const unreadSendIds = dependencies.notificationData.getUnreadSendIds(category);

      if (unreadSendIds.length === 0) {
        return { success: true, message: '沒有未讀通知' };
      }

      // 呼叫 API 批次標記為已讀
      const result = await dependencies.notificationApi.markNotificationsAsRead(unreadSendIds);

      if (result.success) {
        // API 呼叫成功後，立即更新本地狀態
        dependencies.notificationData.markCategoryAsRead(category);

        // 重新 fetch 通知列表以同步後端狀態
        await fetchNotificationList(merchantId.value, false);

        return {
          success: true,
          message: `成功標記 ${result.successCount} 則通知為已讀`
        };
      } else {
        return {
          success: false,
          message: `部分標記失敗: ${result.successCount} 成功, ${result.failureCount} 失敗`
        };
      }
    } catch (error) {
      handlePollingError(error, 'markCategoryAllAsRead');
      return {
        success: false,
        message: '標記失敗，請稍後再試'
      };
    } finally {
      isMarkingAsRead.value = false;
    }
  };

  return {
    isInitialized,
    lastFetchTime,
    errorCount,
    canPoll,
    merchantId,
    isLogin,
    isMarkingAsRead,
    initializeNotifications,
    fetchNotificationList,
    resetNotifications,
    markCategoryAllAsRead,
    startPolling: () => pollingInstance?.startPolling(),
    stopPolling: () => pollingInstance?.stopPolling(),
    restartPolling: () => pollingInstance?.restartPolling(),
    cleanup: () => pollingInstance?.cleanup(),
    isPolling: computed(() => pollingInstance?.isPolling.value),
    currentInterval: computed(() => pollingInstance?.currentInterval.value ?? POLLING_CONFIG.INTERVAL),
    ...dependencies.notificationData,
    ...dependencies.popupControl
  };
}

export const usePollingManager = createSingletonFactory(createPollingManager);
