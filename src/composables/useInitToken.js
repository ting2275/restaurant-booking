import { ref } from 'vue';
import { api } from '@/services/api/api';
import { useUserStore } from '@/stores/userStore';

const initToken = ref(null);
const tokenExpiration = ref(null);

export function useInitToken() {
  const fetchNewInitToken = async () => {
    try {
      const response = await api.get('/initToken');
      const newToken = response.data.token;
      initToken.value = newToken;

      const userStore = useUserStore();
      userStore.setToken(newToken);

      tokenExpiration.value = new Date().getTime() + 3600 * 1000;
    } catch (error) {
      console.error('無法獲取新的 token:', error);
    }
  };

  const isTokenExpired = () => {
    if (!tokenExpiration.value) return true;
    const currentTime = new Date().getTime();
    return currentTime >= tokenExpiration.value;
  };

  const getInitToken = async () => {
    if (!initToken.value || isTokenExpired()) {
      await fetchNewInitToken();
    }
    return initToken.value;
  };

  return {
    getInitToken,
    fetchNewInitToken
  };
}