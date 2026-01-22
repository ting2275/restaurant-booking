import { watch } from 'vue';
import { debounce } from 'lodash';
import { useUserStore } from '@/stores/userStore';

export const useTokenWatcher = (fetchFunction) => {
  const userStore = useUserStore();

  const debouncedFetch = debounce(fetchFunction, 300);

  watch(
    () => userStore.token,
    (newToken, oldToken) => {
      if (oldToken !== newToken && newToken !== null) {
        debouncedFetch();
      }
    }

  )
}