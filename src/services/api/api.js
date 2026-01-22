import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

// 模擬 API 的基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fixedToken = 'your-api-token-here';

// 創建 Axios 實例
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const apiFormData = axios.create({
  baseURL: API_BASE_URL,
  headers:{
    'Content-Type':'multipart/form-data'
  }
})
apiFormData.interceptors.request.use(config => {
  const userStore = useUserStore();
  const token = userStore.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});



// 請求攔截器
api.interceptors.request.use(config => {
  const userStore = useUserStore();
  if (config.url !== '/Login') {
    const token = config.url === '/initToken' ? fixedToken : userStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Token 未設置，可能會導致 Unauthorized 錯誤');
    }
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 響應攔截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const userStore = useUserStore();
      switch (error.response.status) {
        case 401:
          console.error('授權失敗，請重新登入');
          userStore.setRoleChangePopUpVisible(true);
          break;
        case 403:
          console.error('拒絕訪問');
          break;
        case 404:
          console.error('請求的資源不存在');
          break;
        default:
          console.error('其他錯誤:', error.response.status);
      }
    } else if (error.request) {
      console.error('未收到響應');
    } else {
      console.error('發生錯誤', error.message);
    }
    return Promise.reject(error);
  }
);

export const handleApiError = (error) => {
  if (error.response) {
    console.error(`API Error [${error.response.status}]: ${error.response.data.message || '請求失敗'}`);
    throw new Error(error.response.data.message || '請求失敗');
  } else if (error.request) {
    console.error('No response received from the server.');
  } else {
    console.error('Error', error.message);
  }
};