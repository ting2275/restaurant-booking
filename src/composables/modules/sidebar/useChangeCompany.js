import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useAccountStore } from '@/stores/accountStore';
import { multiChangeAccountAction } from '@/services/api/login';
import { useUserRole } from '@/composables/useUserRole';
export function useChangeCompany() {
  const userStore = useUserStore();
  const accountStore = useAccountStore();
  const { isAdmin } = useUserRole();
  const isFetchAccountInfo = ref(false);
  const handleSelectedCompanyChange = async (companyId, options = {}) => {
    if (userStore.storeId === companyId) return false;

    if (!isAdmin.value) {
      console.error('非管理員無法切換店鋪');
      userStore.selectedCompanyId = companyId;
      return;
    }

    if (isFetchAccountInfo.value) return;
    isFetchAccountInfo.value = true;

    try {
      const response = await multiChangeAccountAction(companyId);
      if (!response.token) {
        console.error('切換店鋪失敗:', response);
        return false;
      }

      const newToken = response.token;
      userStore.setToken(newToken);
      userStore.updateTokenAndStoreInfo(newToken, companyId, '');
      await userStore.setUserInfo(response, true);
      await accountStore.setAccountInfo(response, true);
      const maintainOwnerCompany = userStore.maintainOwnerCompany;
      if (!maintainOwnerCompany) return;

      const { oid, name, streetAddress, telephone } = maintainOwnerCompany;
      userStore.updateTokenAndStoreInfo(newToken, oid, name, streetAddress, telephone);
      userStore.selectedCompanyId = oid;
      userStore.selectedCompanyName = name;
      userStore.storeAddress = streetAddress;
      userStore.storePhone = telephone;

      options?.onSuccess?.();
      return true;
    } catch (error) {
      console.error('切換店鋪失敗:', error);
      return false;
    } finally {
      isFetchAccountInfo.value = false;
    }
  };

  return {
    handleSelectedCompanyChange,
  };
}
