import { ref, onUnmounted, getCurrentInstance } from 'vue';
import { POLLING_CONFIG } from './constants/config';

/**
 * 簡單的固定間隔輪詢系統
 * 每 5 分鐘自動檢查一次通知，不依賴用戶活動狀態
 */
export function useSmartPolling(fetchNotifications) {
  const isPolling = ref(false);
  const currentInterval = ref(POLLING_CONFIG.INTERVAL);
  let pollingTimer = null;

  // 用於追蹤 customerPoint 點數狀態
  const notificationStatus = ref({
    alertStatus: false,      // customerPoint 點數是否即將用完的警示狀態
    alertPoints: 0,          // 警示點數閾值
    totalUsed: 0,           // 已使用的點數
    lastChecked: null       // 上次檢查時間
  });

  // 更新 customerPoint 點數狀態
  const updateNotificationStatus = (data) => {
    if (data?.customerPoint) {
      const { alertStatus, alertPoints, totalUsed } = data.customerPoint;

      notificationStatus.value = {
        alertStatus,
        alertPoints,
        totalUsed,
        lastChecked: new Date().toISOString()
      };
    }
  };

  const poll = async () => {
    try {
      const data = await fetchNotifications();
      updateNotificationStatus(data);
      console.log('Polling success');
    } catch (error) {
      console.error('Polling error:', error);
    }

    scheduleNextPoll();
  };

  const scheduleNextPoll = () => {
    if (!isPolling.value) return;
    pollingTimer = setTimeout(poll, currentInterval.value);
  };

  const restartPolling = () => {
    if (pollingTimer) {
      clearTimeout(pollingTimer);
    }
    scheduleNextPoll();
  };

  const startPolling = () => {
    if (isPolling.value) return;
    isPolling.value = true;
    scheduleNextPoll();
  };

  const stopPolling = () => {
    if (!isPolling.value) return;
    isPolling.value = false;
    if (pollingTimer) {
      clearTimeout(pollingTimer);
      pollingTimer = null;
    }
  };

  const cleanup = () => {
    stopPolling();
  };

  try {
    const instance = getCurrentInstance();
    if (instance) {
      onUnmounted(cleanup);
    }
  } catch (error) {
    console.warn('useSmartPolling: onUnmounted not available, use cleanup() manually');
  }

  return {
    isPolling,
    currentInterval,
    notificationStatus,
    startPolling,
    stopPolling,
    restartPolling,
    cleanup
  };
}