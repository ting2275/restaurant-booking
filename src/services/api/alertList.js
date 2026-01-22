import { handleApiError, api } from './api';

// 取得通知列表
export const getAlertList = async (merchantId) => {
  try {
    const response = await api.get(`/alertList?merchantId=${merchantId}`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('獲取通知列表失敗');
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// 批次標記通知為已讀
export const logReadAlert = async (sendIdArray) => {
  try {
    const response = await api.post('/logReadAlert', {
      sendId: sendIdArray // 傳送 sendId 陣列，merchantId 和 email 由後端從 JWT token 取得
    });
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('標記通知為已讀失敗');
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}