import { handleApiError, api } from './api';

const QPayService = {
  createPayment: async ({ route, amount, point }) => {
    try {
      const response = await api.get(`/QPay/${route}?amount=${amount}&point=${point}`);
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: '成功取得QPay資料'
        }
      } else {
        return {
          success: false,
          message: '取得QPay資料失敗'
        }
      }
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  handleReturnCard: async ({ ShopNo, PayToken }) => {
    // const route = '/payment-callback';
    try {
      const response = await api.post(`/QPay/ReturnCard`, { ShopNo, PayToken });
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: '成功取得ReturnCard資料'
        }
      } else {
        return {
          success: false,
          message: '取得ReturnCard資料失敗'
        }
      }
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

export { QPayService };