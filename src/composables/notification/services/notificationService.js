import { useNotificationProcessor } from '../useNotificationProcessor';
import { useErrorHandler } from '@/utils/errorHandler';

// 統一的通知處理服務
export function useNotificationService() {
  const {
    processBookingNotification,
    processSystemNotification,
    filterSystemNotifications,
    hasNotificationUpdate
  } = useNotificationProcessor();
  const { handleApiError } = useErrorHandler();

  const processApiResponse = (responseData, existingNotifications = []) => {
    try {
      let hasNewData = false;
      const newNotifications = [];
      const updatedNotifications = [];

      // 處理訂位消息（resultBooking）
      const bookingsArray = responseData?.resultBooking || [];
      bookingsArray.forEach((booking) => {
        // 查找是否已存在
        const existingNotification = existingNotifications.find(
          (n) => n.ID === `booking_${booking.sendId}`
        );

        // 處理通知
        // 如果 API 有提供 bookingTime，會使用真實時間
        // 如果沒有且已存在，會保留原有 timestamp
        const processedBooking = processBookingNotification(
          booking,
          existingNotification?.timestamp
        );
        if (!processedBooking) return;

        if (!existingNotification) {
          newNotifications.push(processedBooking);
          hasNewData = true;
        } else {
          if (hasNotificationUpdate(existingNotification, processedBooking)) {
            const updatedNotification = {
              ...processedBooking,
              isRead: existingNotification.isRead,
              isNew: false
            };
            updatedNotifications.push(updatedNotification);
            hasNewData = true;
          }
        }
      });

      // 處理系統消息（data）
      const systemArray = responseData?.data || [];
      const filteredSystemData = filterSystemNotifications(systemArray);

      filteredSystemData.forEach((notification) => {
        const processedNotification = processSystemNotification(notification);
        if (!processedNotification) return;

        const existingNotification = existingNotifications.find(
          (n) => n.ID === processedNotification.ID
        );

        if (!existingNotification) {
          newNotifications.push(processedNotification);
          hasNewData = true;
        } else {
          if (hasNotificationUpdate(existingNotification, processedNotification)) {
            const updatedNotification = {
              ...processedNotification,
              isRead: existingNotification.isRead,
              isNew: false
            };
            updatedNotifications.push(updatedNotification);
            hasNewData = true;
          }
        }
      });

      return {
        hasNewData,
        newNotifications,
        updatedNotifications,
        previousCount: existingNotifications.length,
        currentCount: existingNotifications.length + newNotifications.length
      };
    } catch (error) {
      handleApiError(error, 'processApiResponse');
      return {
        hasNewData: false,
        newNotifications: [],
        updatedNotifications: [],
        previousCount: existingNotifications.length,
        currentCount: existingNotifications.length
      };
    }
  };

  const updateNotificationData = (apiData, notificationData, options = {}) => {
    const result = processApiResponse(apiData, notificationData.notifications.value);

    if (result.hasNewData) {
      if (result.newNotifications.length > 0) {
        notificationData.addNotifications(result.newNotifications);

        if (options.onNewNotification) {
          options.onNewNotification(result.newNotifications.length);
        }
      }

      if (result.updatedNotifications.length > 0) {
        result.updatedNotifications.forEach(updatedNotification => {
          const index = notificationData.notifications.value.findIndex(
            n => n.ID === updatedNotification.ID
          );
          if (index !== -1) {
            Object.assign(notificationData.notifications.value[index], updatedNotification);
          }
        });
      }

      if (options.eventBus) {
        options.eventBus.emit('notifications:new-data', {
          count: result.currentCount,
          newCount: result.newNotifications.length,
          updatedCount: result.updatedNotifications.length
        });
      }
    }

    return result;
  };

  const validateNotification = (notification) => {
    // 訂位消息的必要欄位
    if (notification.category === 'booking') {
      const requiredFields = ['sendId', 'sendStatus', 'bookingDate'];
      const missingFields = requiredFields.filter(field => !notification[field]);

      if (missingFields.length > 0) {
        return {
          isValid: false,
          errors: `缺少必要欄位: ${missingFields.join(', ')}`
        };
      }
    }

    // 系統消息的必要欄位
    if (notification.category === 'system') {
      const requiredFields = ['ID', 'status', 'BuyDate'];
      const missingFields = requiredFields.filter(field => !notification[field]);

      if (missingFields.length > 0) {
        return {
          isValid: false,
          errors: `缺少必要欄位: ${missingFields.join(', ')}`
        };
      }
    }

    return { isValid: true };
  };

  const batchProcessNotifications = (notifications, processor) => {
    return notifications
      .map(notification => {
        const validation = validateNotification(notification);
        if (!validation.isValid) {
          console.warn('通知驗證失敗:', validation.errors, notification);
          return null;
        }
        return processor(notification);
      })
      .filter(Boolean);
  };

  return {
    processApiResponse,
    updateNotificationData,
    validateNotification,
    batchProcessNotifications,
    processBookingNotification,
    processSystemNotification,
    filterSystemNotifications,
    hasNotificationUpdate
  };
}