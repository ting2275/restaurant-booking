import { ref, computed } from 'vue';
import { createSingletonFactory } from '@/utils/singletonFactory';
import { useErrorHandler } from '@/utils/errorHandler';
import { NOTIFICATION_CONFIG } from './constants/config';

// 通知資料管理
function createNotificationData() {
  const { handleError } = useErrorHandler();

  const notifications = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const lastUpdateTime = ref(null);

  // 計算屬性：依分類分組
  const bookingNotifications = computed(() => {
    return Array.isArray(notifications.value) ? notifications.value.filter(n => n.category === 'booking') : [];
  });

  const systemNotifications = computed(() => {
    return Array.isArray(notifications.value) ? notifications.value.filter(n => n.category === 'system') : [];
  });

  // 計算屬性：已讀和未讀通知
  const unreadNotifications = computed(() => {
    return Array.isArray(notifications.value) ? notifications.value.filter(notification => !notification.isRead) : [];
  });

  const readNotifications = computed(() => {
    return Array.isArray(notifications.value) ? notifications.value.filter(notification => notification.isRead) : [];
  });

  // 訂位消息的未讀數量
  const unreadBookingCount = computed(() => {
    return bookingNotifications.value.filter(n => !n.isRead).length;
  });

  // 系統消息的未讀數量
  const unreadSystemCount = computed(() => {
    return systemNotifications.value.filter(n => !n.isRead).length;
  });

  // 計算未讀通知數量
  const unreadCount = computed(() => unreadNotifications.value.length);

  // 新增：用於顯示的排序後通知
  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  });

  // 計算限制顯示的通知數量（基於排序後的結果）
  const displayNotifications = computed(() => {
    return sortedNotifications.value.slice(0, NOTIFICATION_CONFIG.DISPLAY_LIMIT);
  });

  // 計算屬性：已存在的通知
  const visibleNotifications = computed(() => {
    return displayNotifications.value;
  });

  // 計算屬性：最新通知
  const latestNotification = computed(() => {
    if (!Array.isArray(sortedNotifications.value) || sortedNotifications.value.length === 0) return null;
    return sortedNotifications.value[0];
  });

  // 添加新通知
  const addNotification = (notification) => {
    try {
      if (!notification || !notification.ID) {
        throw new Error('通知資料無效');
      }

      const existingIndex = notifications.value.findIndex(
        item => item.ID === notification.ID
      );

      if (existingIndex !== -1) {
        const existingNotification = notifications.value[existingIndex];
        notifications.value[existingIndex] = {
          ...existingNotification,
          ...notification,
          isNew: false,
          updatedAt: new Date().toISOString()
        };
      } else {
        notifications.value.unshift(notification);
      }

      lastUpdateTime.value = new Date().toISOString();
    } catch (error) {
      handleError(error, 'addNotification');
    }
  };

  const addNotifications = (newNotifications) => {
    try {
      if (!Array.isArray(newNotifications)) {
        throw new Error('輸入必須是陣列');
      }

      newNotifications.forEach(notification => {
        addNotification(notification);
      });
    } catch (error) {
      handleError(error, 'addNotifications');
    }
  };

  const markAsRead = (notificationId) => {
    try {
      const notification = notifications.value.find(item => item.ID === notificationId);
      if (notification) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
      }
    } catch (error) {
      handleError(error, 'markAsRead');
    }
  };

  const markAllAsRead = () => {
    try {
      notifications.value.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
      });
    } catch (error) {
      handleError(error, 'markAllAsRead');
    }
  };

  // 標記特定分類的所有通知為已讀
  const markCategoryAsRead = (category) => {
    try {
      notifications.value.forEach(notification => {
        if (notification.category === category && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
      });
    } catch (error) {
      handleError(error, 'markCategoryAsRead');
    }
  };

  // 獲取特定分類的未讀通知 sendId 列表（用於批次標記已讀）
  const getUnreadSendIds = (category) => {
    try {
      return notifications.value
        .filter(n => n.category === category && !n.isRead && n.sendId)
        .map(n => n.sendId);
    } catch (error) {
      handleError(error, 'getUnreadSendIds');
      return [];
    }
  };

  // 移除通知
  const removeNotification = (notificationId) => {
    try {
      const index = notifications.value.findIndex(item => item.ID === notificationId);
      if (index !== -1) {
        notifications.value.splice(index, 1);
      }
    } catch (error) {
      handleError(error, 'removeNotification');
    }
  };

  // 清除所有通知
  const clearAllNotifications = () => {
    try {
      notifications.value = [];
      lastUpdateTime.value = new Date().toISOString();
    } catch (error) {
      handleError(error, 'clearAllNotifications');
    }
  };

  // 清除已讀通知
  const clearReadNotifications = () => {
    try {
      notifications.value = notifications.value.filter(notification => !notification.isRead);
    } catch (error) {
      handleError(error, 'clearReadNotifications');
    }
  };

  // 根據類型過濾通知
  const filterByType = (type) => {
    try {
      return notifications.value.filter(notification => notification.type === type);
    } catch (error) {
      handleError(error, 'filterByType');
      return [];
    }
  };

  // 根據優先級過濾通知
  const filterByPriority = (priority) => {
    try {
      return notifications.value.filter(notification => notification.priority === priority);
    } catch (error) {
      handleError(error, 'filterByPriority');
      return [];
    }
  };

  // 搜尋通知
  const searchNotifications = (searchTerm) => {
    try {
      if (!searchTerm) return notifications.value;
      const term = searchTerm.toLowerCase();
      return notifications.value.filter(notification =>
        notification.content?.toLowerCase().includes(term)
      );
    } catch (error) {
      handleError(error, 'searchNotifications');
      return [];
    }
  };

  // 排序通知
  const sortNotifications = (sortBy = 'timestamp', sortOrder = 'desc') => {
    try {
      const sorted = [...notifications.value];
      sorted.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      return sorted;
    } catch (error) {
      handleError(error, 'sortNotifications');
      return notifications.value;
    }
  };

  // 獲取通知統計資訊
  const getNotificationStats = () => {
    try {
      const total = notifications.value.length;
      const unread = unreadCount.value;
      const read = total - unread;

      const typeStats = {};
      const priorityStats = {};

      notifications.value.forEach(notification => {
        const type = notification.type || 'unknown';
        typeStats[type] = (typeStats[type] || 0) + 1;

        const priority = notification.priority || 'normal';
        priorityStats[priority] = (priorityStats[priority] || 0) + 1;
      });

      return {
        total,
        unread,
        read,
        typeStats,
        priorityStats
      };
    } catch (error) {
      handleError(error, 'getNotificationStats');
      return {
        total: 0,
        unread: 0,
        read: 0,
        typeStats: {},
        priorityStats: {}
      };
    }
  };

  // 設置載入狀態
  const setLoading = (loading) => {
    isLoading.value = loading;
  };

  // 設置錯誤狀態
  const setError = (err) => {
    error.value = err;
    if (err) {
      handleError(err, 'setError');
    }
  };

  // 清除錯誤狀態
  const clearError = () => {
    error.value = null;
  };

  return {
    notifications,
    isLoading,
    error,
    lastUpdateTime,
    bookingNotifications,
    systemNotifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    unreadBookingCount,
    unreadSystemCount,
    sortedNotifications,
    displayNotifications,
    visibleNotifications,
    latestNotification,
    addNotification,
    addNotifications,
    markAsRead,
    markAllAsRead,
    markCategoryAsRead,
    getUnreadSendIds,
    removeNotification,
    clearAllNotifications,
    clearReadNotifications,
    filterByType,
    filterByPriority,
    searchNotifications,
    sortNotifications,
    getNotificationStats,
    setLoading,
    setError,
    clearError
  };
}

export const useNotificationData = createSingletonFactory(createNotificationData);