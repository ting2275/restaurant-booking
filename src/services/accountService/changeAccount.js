import { multiChangeAccountAction } from '../api/login';
import { getAccountInfo } from '../api/accountInfo';
import { useUserStore } from '@/stores/userStore';
import { useAccountStore } from '@/stores/accountStore';
const multiChangeAccountActionAndFetchInfo = async (companyId) => {
  const userStore = useUserStore();
  const response = await multiChangeAccountAction(companyId);
  if (response.token) {
    userStore.setToken(response.token);
    const accountInfoResponse = await getAccountInfo();
    if (accountInfoResponse) {
      return { token: response.token, accountInfo: accountInfoResponse };
    }
    throw new Error('未找到有效的帳號資料');
  }
  throw new Error('未找到有效的 token');
};

export const changeAccount = async (companyId) => {
  const userStore = useUserStore();
  const accountStore = useAccountStore();
  try {
    const response = await multiChangeAccountActionAndFetchInfo(companyId);
    const newToken = response.token;
    userStore.setToken(newToken);
    userStore.setUserInfo(response.accountInfo);
    accountStore.setAccountInfo(response.accountInfo);
    const { oid, name, streetAddress, telephone } = response.accountInfo.maintainOwnerCompany;
    userStore.updateTokenAndStoreInfo(newToken, oid, name, streetAddress, telephone);
    userStore.selectedCompanyId = oid
    userStore.selectedCompanyName = name;
    userStore.storeAddress = streetAddress;
    userStore.storePhone = telephone;
    userStore.merchantId = response.accountInfo.merchantId;
    userStore.popUpNotice = response.accountInfo.popUpNotice || 1;
    return response.accountInfo.maintainRoot;
  } catch (error) {
    console.error('切換帳號失敗', error);
    throw error;
  }
};