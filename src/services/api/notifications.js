import { handleApiError, api } from './api';

export const getNotifications = async ({
  mobile, currentPage = 1, pageSize = 10, startDate, endDate, order = 'asc'
} = {}) => {
  try {
    const response = await api.get('/Notifications/History', {
      params: {
        mobile, currentPage, pageSize, startDate, endDate, order
      }
    });
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功獲取通知歷史記錄'
      }
    } else {
      return {
        success: false,
        message: '無法獲取通知歷史記錄'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const getNotificationInfo = async () => {
  try {
    const response = await api.get('/Notifications/Info');
    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
        message: '成功獲取客戶簡訊使用概況'
      }
    } else {
      return {
        success: false,
        message: '無法獲取客戶簡訊使用概況'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const getNotificationSettings = async () => {
  try {
    const response = await api.get('/Notifications/Settings');
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功獲取通知設置'
      }
    } else {
      return {
        success: false,
        message: '無法獲取通知設定'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const updateNotificationSettings = async (settings) => {
  try {
    const response = await api.put('/Notifications/Settings', {
      notificationStatus: settings
    });
    if (response.status === 200) {
      return {
        success: true,
        message: '成功更新通知設置'
      }
    } else {
      return {
        success: false,
        message: '無法更新通知設置'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const downloadNotifications = async (mobile, startDate, endDate, customerName) => {
  try {
    const response = await api.get('/Notifications/Download', {
      params: {
        mobile, startDate, endDate, customerName
      },
    });
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功下載通知歷史記錄'
      }
    } else {
      return {
        success: false,
        message: '無法下載通知歷史記錄'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}