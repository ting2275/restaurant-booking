import { handleApiError, api } from './api';

export const getHistoryInfo = async ({
  startDate, endDate, searchReservationStatus, searchInfo, currentPage
}) => {
  try {
    const response = await api.get('/History/Info', {
      params: {
        startDate, endDate, searchReservationStatus, searchInfo, currentPage
      }
    });
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: '成功取得歷史紀錄'
      }
    } else {
      return {
        success: false,
        message: '取得歷史紀錄失敗'
      }
    }
  } catch(error) {
    handleApiError(error);
    throw error;
  }
}