import { ref } from 'vue';
import { getAccountInfo } from '@/services/api/accountInfo';
import { useUserStore } from '@/stores/userStore';

export const useAccountInfo = () => {
  const userStore = useUserStore();
  const accountInfo = ref(null);
  const error = ref(null);
  const fetchAccountInfo = async () => {
    try {
      const result = await getAccountInfo();
      accountInfo.value = result;
      await userStore.setUserInfo(result, false);
    } catch (error) {
      console.error('取得帳號資訊失敗', error);
    }
  };

  return {
    accountInfo,
    error,
    fetchAccountInfo
  };
}