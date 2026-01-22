import { handleApiError, api } from './api';

// 合約付款資訊
const fetchContractPaymentInfo = async (payLink) => {
  try {
    const response = await api.get('/Payment/getCustomerSolutionPaymentInfo', {
      params: {
        payLink
      }
    });
    return {
      success: true,
      data: response.data,
      message: '獲取合約付款資訊成功'
    }
  } catch (error) {
    // handleApiError(error);
    // throw error;
    return {
      success: false,
      message: '獲取合約付款資訊失敗'
    }
  }
};

// 超額訂單付款資訊
const fetchOverBookingPaymentInfo = async (payLink) => {
  console.log('fetchOverBookingPaymentInfo', payLink);
  try {
    const response = await api.get('/Payment/getPaymentInfo', {
      params: {
        payLink
      }
    });
    return {
      success: true,
      data: response.data,
      message: '獲取超額付款資訊成功'
    }
  } catch (error) {
    // handleApiError(error);
    // throw error;
    return {
      success: false,
      message: '獲取超額付款資訊失敗'
    }
  }
};

// 產生合約付款連結
const fetchContractPaymentLink = async (payType, contractId, merchantId, buyerIdentifier) => {
  try {
    const response = await api.get('/QPay/customerSolutionPayment', {
      params: {
        payType,
        contractId,
        merchantId,
        buyerIdentifier
      }
    });
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '產生合約付款連結成功'
      }
    } else {
      return {
        success: false,
        message: '產生合約付款連結失敗'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 產生超額付款連結
const fetchOverBookingPaymentLink = async (payType, bookingCountId, merchantId, buyerIdentifier) => {
  try {
    const response = await api.get('/QPay/mailPayment', {
      params: {
        payType,
        bookingCountId,
        merchantId,
        buyerIdentifier
      }
    });
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '產生超額付款連結成功'
      }
    } else {
      return {
        success: false,
        message: '產生超額付款連結失敗'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 取得付款結果
const fetchPaymentResult = async (payLink) => {
  try {
    const response = await api.get('/Payment/paymentResult', {
      params: {
        payLink
      }
    });
    if (response.status === 200) {
      return {
        success: true,
        data: response.data.contractDetail,
        message: '取得付款結果成功'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export { fetchContractPaymentInfo, fetchOverBookingPaymentInfo, fetchContractPaymentLink, fetchOverBookingPaymentLink, fetchPaymentResult };