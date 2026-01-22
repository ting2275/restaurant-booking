import { handleApiError, api } from './api'

// 取得交易紀錄
export const getBillingInfo = async params => {
  try {
    const response = await api.get('/billingList', {
      params: params
    })
    if (response.status === 200) {
      return response.data
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 取得商家ID
export const getMerchantId = async () => {
  try {
    const response = await api.get('/Maintain/AccountInfo')
    if (response.status === 200) {
      return response.data
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 取得發票資訊
export const getTaxData = async merchantId => {
  try {
    const response = await api.get('/TaxData/' + merchantId)
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功更新店鋪政策'
      }
    } else {
      return {
        success: false,
        message: '無法更新店鋪政策'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 更新發票資訊
export const updateTaxData = async (merchantId, taxData) => {
  try {
    const response = await api.put(`/TaxData/${merchantId}`, taxData)
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功更新營業時間'
      }
    } else {
      return {
        success: false,
        message: '更新營業時間失敗'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 取得店家的合約列表
export const getContractList = async (merchantId, year) => {
  try {
    const response = await api.get('/contractList', {
      params: {
        merchantId,
        year
      }
    })
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '取得合約列表成功'
      }
    } else {
      return {
        success: false,
        message: '取得合約列表失敗'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 取得合約資料
export const getContractDetail = async (merchantId, contractType) => {
  try {
    const response = await api.get('/contractList', {
      params: {
        merchantId,
        contractType
      }
    })
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '取得合約資料成功'
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
