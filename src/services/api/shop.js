import { handleApiError, api } from './api'

export const getShopInfo = async () => {
  try {
    const response = await api.get('/Booking/shop')
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const getCheckClash = async (openTime, closeTime, availableTime, timePicker, holiday, checkClearAll) => {
  try {
    const response = await api.get('/Booking/checkClashBookingV2', {
      params: {
        openTime,
        closeTime,
        availableTime,
        timePicker,
        holiday,
        checkClearAll
      }
    })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const getTables = async () => {
  try {
    const response = await api.get('/Shop/Tables')
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const getCheckTables = async (partySize, tableQuantityChange) => {
  try {
    const response = await api.get('/Booking/checkTables', {
      params: {
        partySize: partySize,
        tableQuantityChange: tableQuantityChange
      }
    })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const updateTables = async tableData => {
  try {
    const response = await api.put('/Shop/Tables', tableData)
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功更新桌型數量'
      }
    } else {
      return {
        success: false,
        message: '更新桌型數量失敗'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const updateBusinessTime = async businessTimeData => {
  try {
    const response = await api.put('/Shop/BusinessTime', businessTimeData)
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

export const updateTimePicker = async timePickerData => {
  try {
    const response = await api.put('/Shop/timePicker', timePickerData)
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功更新預訂時段'
      }
    } else {
      return {
        success: false,
        message: '無法更新預訂時段'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const updateHolidays = async holidaysData => {
  try {
    const response = await api.put('/Shop/holidays', { holidays: holidaysData })
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功更新不開放預訂日期'
      }
    } else {
      return {
        success: false,
        message: '無法更新不開放預訂日期'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const getPolicy = async merchantId => {
  try {
    const response = await api.get('/Shop/policy', { params: { merchantId } })
    if (response.status === 200 && response.data) {
      return response.data
    } else {
      console.error('Unexpected API response:', response)
      return { memo: null, status: null }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const updatePolicy = async (merchantId, memo) => {
  try {
    const params = { merchantId }
    const body = memo === null ? { memo: null } : { memo: memo || '' }
    const response = await api.put('/Shop/policy', body, { params })
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

// 獲取區域與桌型列表
export const getAreaList = async () => {
  try {
    const response = await api.get('/Shop/getAreaList')
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 更新區域(名稱.排序)
export const updateAreaData = async areaData => {
  try {
    const response = await api.put('/Shop/updateAreaSort', areaData)
    if (response.status === 200) {
      return {
        success: true,
        message: '更新排序成功'
      }
    } else {
      return {
        success: false,
        message: '更新排序失敗'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 更新區域名稱
export const updateAreaById = async areaData => {
  try {
    const response = await api.put('/Shop/updateAreaById', areaData)
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功更新區域名稱'
      }
    } else {
      return {
        success: false,
        message: '更新區域名稱失敗'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 新增區域
export const addArea = async areaData => {
  try {
    const response = await api.post('/Shop/addArea', {
      areaName: areaData.areaName,
      areaOrder: Number(areaData.areaOrder),
      tablesQuantity: Number(areaData.tablesQuantity)
    })
    if (response.status === 200) {
      return {
        success: true,
        data: response.data
      }
    }
    return {
      success: false,
      message: '新增區域失敗'
    }
  } catch (error) {
    console.error('新增區域失敗:', error)
    return {
      success: false,
      message: error.message || '新增區域失敗'
    }
  }
}

// 新增區域桌子
export const addTableNames = async tableDataArray => {
  try {
    const formattedData = tableDataArray.map(table => ({
      areaId: table.areaId,
      partySize: table.partySize,
      isOnlineBooking: String(table.isOnlineBooking),
      tableOrder: table.tableOrder,
      tableName: table.tableName
    }))
    const response = await api.post('/Shop/addTableNames', formattedData)

    if (response.data.status === 'error' && response.data.message === '上限已達一百桌') {
      return {
        success: false,
        isLimitExceeded: true,
        message: '上限已達一百桌'
      }
    }

    if (response.status === 200) {
      return {
        success: true,
        data: response.data
      }
    }

    return {
      success: false,
      message: '新增桌子失敗'
    }
  } catch (error) {
    console.error('新增桌子失敗:', error)
    return {
      success: false,
      message: error.message || '新增桌子失敗'
    }
  }
}

// 獲取總桌數
export const getTotalTableQuantity = async () => {
  try {
    const response = await api.get('/Shop/getTotalTableQuantity')
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 更新桌子資訊
export const updateTableInfo = async tableData => {
  try {
    const response = await api.put(
      '/Shop/updateTableInfo',
      tableData.map(table => ({
        tableId: table.tableId,
        tableName: table.tableName,
        tableOrder: table.tableOrder,
        partySize: table.partySize,
        isOnlineBooking: String(table.isOnlineBooking)
      }))
    )

    if (response.status === 200) {
      return {
        success: true,
        message: '更新成功'
      }
    }
    return {
      success: false,
      message: '更新失敗'
    }
  } catch (error) {
    console.error('更新桌子信息失败:', error)
    return {
      success: false,
      message: error.message || '更新失敗'
    }
  }
}

// 後端檢查桌號是否重複
export const checkDuplicateName = async name => {
  try {
    const response = await api.get('/Shop/checkDuplicateName', {
      params: { name }
    })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 刪除區域
export const deleteArea = async areaId => {
  try {
    const response = await api.delete('/Shop/deleteArea', {
      params: { areaId: areaId }
    })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 刪除單一桌子
export const deleteTable = async tableId => {
  try {
    const response = await api.delete('/Shop/deleteTable', {
      params: { tableId: tableId }
    })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 獲取區域內的桌子列表
export const getTableNameList = async areaId => {
  try {
    const response = await api.get('/Shop/getTableNameList', {
      params: { areaId }
    })
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功獲取桌子列表'
      }
    } else {
      return {
        success: false,
        message: '獲取桌子列表失敗'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const checkTableBooked = async (tableId, partySize) => {
  try {
    const response = await api.get('/Shop/checkTableBooked', {
      params: { tableId, partySize }
    })
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const getTempCloseList = async () => {
  try {
    const response = await api.get('/Shop/getTempCloseList')
    return response.data
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const addTempClose = async tempCloseData => {
  try {
    const response = await api.post('/Shop/addTempClose', tempCloseData)
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '新增暫停營業期間成功'
      }
    } else {
      return {
        success: false,
        message: '新增暫停營業期間失敗'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const deleteTempCloseById = async tempCloseId => {
  try {
    const response = await api.delete('/Shop/deleteTempCloseById', {
      params: { tempCloseId }
    })
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '刪除暫停營業期間成功'
      }
    } else {
      return {
        success: false,
        message: '刪除暫停營業期間失敗'
      }
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// 以下為舊的 接Jacky的
export const getStores = async () => {
  try {
    const response = await api.get('/stores')
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}
export const getStoreReservationsTime = async storeId => {
  try {
    const response = await api.get(`/stores/${storeId}/reservations-time`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}
export const postStoreReservationsTime = async (storeId, data) => {
  try {
    const response = await api.post(`/stores/${storeId}/reservations-time`, data)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}
export const getStoreBusinessTimeSetting = async storeId => {
  try {
    const response = await api.get(`/stores/${storeId}/business-time-setting`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}
export const postStoreBusinessTimeSetting = async (storeId, data) => {
  try {
    const response = await api.post(`/stores/${storeId}/business-time-setting`, data)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}
export const getStoreTables = async storeId => {
  try {
    const response = await api.get(`/stores/${storeId}/tables`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}
export const postStoreTable = async (storeId, data) => {
  try {
    const response = await api.put(`/stores/${storeId}/tables`, data)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}
