import { useUserStore } from '@/stores/userStore';
import { handleApiError, api } from './api';
export const getAccountInfo = async () => {
  const userStore = useUserStore();
  const token = userStore.token;
  try {
    const response = await api.get(`/Maintain/AccountInfo?timestamp=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 200 && response.data && response.data.maintainAccount) {
      const accountInfo = response.data;
      return accountInfo;
    } else {
      throw new Error('無效的帳戶信息');
    }
  } catch (error) {
    console.error('獲取帳戶信息失敗', error);
    handleApiError(error);
    throw error;
  }
};

export const stopGoogleConnect = async (customerStatus) => {
  try {
    const response = await api.post('/stopGoogleConnect', {
      CustomerStatus: customerStatus
    });
    if (response.status === 200) {
      return {
        success: true,
        message: '成功斷開 Google 連結'
      }
    } else {
      return {
        success: false,
        message: '斷開 Google 連結失敗'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const postCustomerContact = async (subject, message) => {
  try {
    const response = await api.post('/Contact/postCustomerContact', {
      subject, message
    });
    if (response.status === 200) {
      return {
        success: true,
        message: '諮詢已成功提交'
      }
    } else {
      return {
        success: false,
        message: '無法提交諮詢'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}