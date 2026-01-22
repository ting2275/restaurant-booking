import { getAlertList, logReadAlert } from '@/services/api/alertList';
import { createSingletonFactory } from '@/utils/singletonFactory';
import { useErrorHandler } from '@/utils/errorHandler';
import { useNotificationService } from './services/notificationService';
import { useNotificationStorage } from './useNotificationStorage';

// 通知 API 服務
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

  // 批次標記通知為已讀
  const markNotificationsAsRead = async (sendIds) => {
    if (!Array.isArray(sendIds) || sendIds.length === 0) {
      return { success: true, successCount: 0, message: '沒有需要標記的通知' };
    }

    try {
      // 一次性批次傳送所有 sendId，後端會從 JWT token 取得 merchantId 和 email
      const result = await logReadAlert(sendIds);

      return {
        success: true,
        successCount: sendIds.length,
        failureCount: 0,
        result
      };
    } catch (error) {
      handleApiError(error, 'markNotificationsAsRead');
      return {
        success: false,
        successCount: 0,
        failureCount: sendIds.length,
        error: error.message
      };
    }
  };

  return {
    fetchNotificationList,
    handleNotificationUpdate,
    markNotificationsAsRead
  };
}

export const useNotificationApi = createSingletonFactory(createNotificationApi);