import { handleApiError, api, apiFormData } from './api'

export const sendVerifyCode = async userId => {
  try {
    const response = await api.post('/MaintainUser/SendVerificationCode', { userId })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const verifyCode = async (userId, code) => {
  try {
    const response = await api.post('/MaintainUser/VerifyCode', { userId, code })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const insertPassword = async passwordData => {
  try {
    const response = await api.post('/MaintainUser/insertPassword', passwordData)
    return response
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const resetPassword = async passwordData => {
  try {
    const response = await api.post('/MaintainUser/ResetPassword', passwordData)
    return response
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const getMaintainUserList = async status => {
  try {
    const statusString = String(status)
    const response = await api.get('/MaintainUser/maintainUserList', {
      params: { status: statusString }
    })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const maintainOwnerCompanyUserList = async status => {
  try {
    const statusString = String(status)
    const response = await api.get('/MaintainUser/maintainOwnerCompanyUserList', {
      params: { status: statusString }
    })
    return response.data.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}
export const insertMaintainUser = async maintainUser => {
  try {
    const response = await api.post('/MaintainUser/insertMaintainUser', maintainUser)
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功新增維護使用者'
      }
    } else {
      return {
        success: false,
        message: '無法新增維護使用者'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const resendUserPassword = async userId => {
  try {
    const response = await api.post('/MaintainUser/resendMaintainUserPassword', { userId })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const checkActiveLink = async (keyCode, ivCode, activeCode) => {
  try {
    const response = await api.get('/MaintainUser/checkActiveLink', {
      params: { keyCode, ivCode, activeCode }
    })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const checkMaintainUser = async () => {
  try {
    const response = await api.get('/MaintainUser/countMaintainUser')
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功取得維護使用者數量'
      }
    } else {
      return {
        success: false,
        message: '無法取得維護使用者數量'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const deleteMaintainUser = async maintainOwnerId => {
  try {
    const response = await api.delete('/MaintainUser/deleteMaintainUser', {
      params: { maintainOwnerId }
    })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const updateMaintainUserType = async updateData => {
  try {
    const response = await api.put('/MaintainUser/updateMaintainUserType', updateData)
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const updateMaintainUserInfo = async maintainUser => {
  try {
    const response = await apiFormData.post('/MaintainUser/updateMaintainUserInfo', maintainUser)
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const deleteMaintainUserImage = async () => {
  try {
    const response = await api.delete('/MaintainUser/deleteMaintainUserImage')
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const updatePopUpNotice = async userId => {
  try {
    const response = await api.post('/MaintainUser/updatePopUpNotice', { userId })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const updateIsLowPopUpStatus = async solutionId => {
  try {
    const response = await api.put('/Maintain/updateCustomerSolutionStatus', { solutionId })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const updateExSpendPopUpStatus = async exSpendId => {
  try {
    const response = await api.put('/Maintain/updateBookingCountStatus', { exSpendId })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}
