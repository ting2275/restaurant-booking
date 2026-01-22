import { handleApiError, api } from './api';

export const initToken = async () => {
  try {
    const response = await api.get('/initToken');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const login = async (userId, userPassword) => {
  try {
    const response = await api.post('/Login', { userId, userPassword });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const multiChangeAccountAction = async (companyId) => {
  try {
    const response = await api.post('/multiChangeAccountAction', { ownerCompanyId: parseInt(companyId) });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const sendVerificationCode = async (userId) => {
  try {
    const response = await api.post('/MaintainUser/SendVerificationCode', { userId });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
export const verifyCode = async (userId, code) => {
  try {
    const response = await api.post('/MaintainUser/VerifyCode', { userId, code });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
export const resetPassword = async (userPassword, userPassword2, userId, maintainOwnerId) => {
  try {
    const response = await api.post('/MaintainUser/ResetForgetPassword', {userPassword, userPassword2, maintainOwnerId, userId});
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
