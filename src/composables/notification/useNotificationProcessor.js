import { useErrorHandler } from '@/utils/errorHandler';

// 通知處理
export function useNotificationProcessor() {
  const { handleError } = useErrorHandler();

  // 訂位消息的狀態映射
  const bookingStatusMap = {
    'New': '新增',
    'Modify': '修改',
    'Save': '保留',
    'Cancel': '取消'
  };

  // 生成訂位消息內容
  const generateBookingMessage = (booking) => {
    const statusText = bookingStatusMap[booking.sendStatus] || booking.sendStatus;

    return `<h4 class='caption1'>顧客${statusText}了預訂</h4>` +
           `<span class='small'>${booking.name}，${booking.bookingDate}，${booking.partySize || booking.effectivePartySize} 人</span>`;
  };

  // 生成系統消息內容（原有的交易通知）
  const generateSystemMessage = (notification) => {
    if (notification.status === '交易成功') {
      return `訂單 <span class='highlight'>${notification.ID}</span> 交易完成。通知簡訊 <span class='highlight'>${notification.point}</span> 則已匯入，點此確認。`;
    } else if (notification.status === '交易失敗') {
      return `您購買的通知簡訊方案<span class='highlight'>交易失敗</span>，點此確認詳情。`;
    }
    return null;
  };

  // 處理訂位消息
  const processBookingNotification = (booking, existingTimestamp = null) => {
    try {
      if (!booking.sendId) {
        return null;
      }

      const content = generateBookingMessage(booking);
      let timestamp;
      let hasRealTimestamp = false;

      if (booking.bookingTime) {
        timestamp = new Date(booking.bookingTime.replace(' ', 'T')).toISOString();
        hasRealTimestamp = true;
      } else if (existingTimestamp) {
        timestamp = existingTimestamp;
        hasRealTimestamp = false;
      } else {
        // Fallback: 使用當前時間
        timestamp = new Date().toISOString();
        hasRealTimestamp = false;
      }

      return {
        ID: `booking_${booking.sendId}`,
        sendId: booking.sendId,
        type: 'booking',
        category: 'booking',
        sendStatus: booking.sendStatus,
        content,
        name: booking.name,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime, // 保留原始 bookingTime
        partySize: booking.partySize || booking.effectivePartySize,
        timestamp,
        hasRealTimestamp, // 標記是否有真實時間
        isNew: !booking.isRead,
        isRead: booking.isRead || false
      };
    } catch (error) {
      handleError(error, 'processBookingNotification');
      return null;
    }
  };

  // 處理系統消息（原有的交易通知）
  const processSystemNotification = (notification) => {
    try {
      if (!notification.ID) {
        return null;
      }

      const includeStatus = ['交易成功', '交易失敗'];
      if (!includeStatus.includes(notification.status)) {
        return null;
      }

      const content = generateSystemMessage(notification);
      if (!content) {
        return null;
      }

      const statusRoute = {
        '交易成功': 'NotificationOverview',
        '交易失敗': 'BillingArea'
      };

      return {
        ID: notification.ID.trim(),
        type: notification.status === '交易成功' ? 'success' : 'error',
        category: 'system', // 用於分類：系統消息
        status: notification.status,
        content,
        point: notification.point,
        timestamp: notification.BuyDate,
        BuyDate: notification.BuyDate,
        routeName: statusRoute[notification.status] || null,
        isNew: true,
        isRead: false
      };
    } catch (error) {
      handleError(error, 'processSystemNotification');
      return null;
    }
  };

  // 過濾系統消息（移除「交易未完成」）
  const filterSystemNotifications = (notifications) => {
    return notifications.filter(
      (notification) => notification.status !== '交易未完成'
    );
  };

  // 檢查通知是否有更新
  const hasNotificationUpdate = (existing, processed) => {
    // 對於訂位消息，比較 sendStatus 和 isRead 狀態
    if (processed.category === 'booking') {
      return existing.sendStatus !== processed.sendStatus ||
             existing.isRead !== processed.isRead;
    }

    // 對於系統消息，比較 status
    if (processed.category === 'system') {
      return existing.status !== processed.status;
    }

    return false;
  };

  return {
    processBookingNotification,
    processSystemNotification,
    filterSystemNotifications,
    hasNotificationUpdate,
    bookingStatusMap
  };
}
