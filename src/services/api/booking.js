import { handleApiError, api } from './api';

export const getReservationList = async (searchDate, searchReservationStatus = '', searchInfo = '') => {
  try {
    const response = await api.get('/Booking/reservationListV2', {
      params: {
        searchDate,
        searchReservationStatus,
        searchInfo
      }
    });
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '獲取預訂列表成功'
      }
    } else {
      return {
        success: false,
        message: '獲取預訂列表失敗'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const getReservationSeachList = async (searchInfo = '') => {
  try {
    const response = await api.get('/Booking/reservationSeachList', {
      params: {
        searchInfo
      }
    });
    if (response.status === 200) {
      return {
        ...response.data,
        success: true,
        message: '獲取預訂列表成功'
      }
    } else {
      return {
        success: false,
        message: '獲取預訂列表失敗'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const getBookingInfo = async (bookingId) => {
  try {
    const response = await api.get('/Booking/getBookingInfo', {
      params: {
        bookingId
      }
    });
    if (response.status === 200) {
      return response.data
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
export const addBookingInfo = async (bookingData) => {
  try {
    const response = await api.post('/Booking/addBookingInfo', {
      ...bookingData
    });
    if (response.status === 200) {
      return {
        bookingId: response.data.bookingId,
        success: true,
        message: '新增預訂成功'
      }
    } else {
      return {
        success: false,
        message: '新增預訂失敗'
      }
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}


export const updateBookingInfo = async (bookingId,updateData) => {
  try {
    const params = {bookingId};
    const body = updateData !== null ? { ...updateData } : {};
    const response = await api.put('/Booking/updateBookingInfo', body, { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const batchAvailabilityLookup = async (dateTime,partySize,bookingId) => {
  try {
    const response = await api.get('/Booking/batchAvailabilityLookup', {
      params: {
        dateTime,
        partySize,
        bookingId
      }
    });
    if (response.status === 200) {
      return response.data
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const batchAvailabilitySeat = async (dateTime,effectivePartySize ) => {
  try {
    const response = await api.get('/Booking/batchAvailabilitySeatV2', {
      params: {
        dateTime,
        effectivePartySize
      }
    });
    if (response.status === 200) {
      return response.data
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const batchAvailabilityTables = async (dateTime,partySize, tableId , bookingId) => {
  try {
    const response = await api.get('/Booking/batchAvailabilityTables', {
      params: {
        dateTime,
        partySize,
        tableId,
        bookingId
      }
    });
    if (response.status === 200) {
      return response.data
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const getDateStatuses = async () => {
  try {
    const response = await api.get('/Booking/checkTablesForCalendar');
    return response.data
  } catch (error) {
    console.error('獲取日期狀態時出錯:', error);
  }
};

export const getBusinessTime = async (toDate) => {
  try {
    const response = await api.get('/Booking/businessTime', {
      params: {
        toDate,
      }
    });
    return response
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const bookingStatus = async () => {
  try {
    const response = await api.get('/data/statusTotal.json');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const bookingReserveTotal = async () => {
  try {
    const response = await api.get('/data/reservationTotal.json');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
export const exportBookingInfo = async (startDate,endDate) => {
  try {
    const response = await api.get('/exportBookingInfo',{
      params: {
        startDate,
        endDate
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}