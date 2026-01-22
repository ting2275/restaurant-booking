import { handleApiError, api } from './api';

export const register = async (formData) => {
  try {
    // 模擬 API 請求
    const response = await api.post('/Contact/ContactUs', formData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};