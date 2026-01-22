import { handleApiError, api } from './api'

export const getOrderInfo = async ({ orderId, merchantId }) => {
  try {
    const response = await api.get(`/OrderDetail?orderId=${orderId}&merchantId=${merchantId}`)
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功取得訂單資料'
      }
    } else {
      return {
        success: false,
        message: '取得訂單資料失敗'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const getPaymentDetail = async ({ orderId, contractType }) => {
  try {
    const response = await api.get(`/contractDetail?orderId=${orderId}&contractType=${contractType}`)
    if (response.status === 200) {
      return {
        success: true,
        data: response.data.contractDetail,
        message: '成功取得合約資料'
      }
    } else {
      return {
        success: false,
        message: '取得合約資料失敗'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}
