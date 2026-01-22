import { defineStore } from 'pinia'
import { getAccountInfo } from '@/services/api/accountInfo.js'
import { useSystemStore } from '@/stores/systemStore'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    userInfo: {
      username: null,
      avatar: null,
      role: null,
      email: null,
      id: null
    },
    isFirst: false,

    lowPopupData: {
      solutionId: '',
      isLow: 0,
      afterPoint: 0,
      alertCustomerSolutionStatus: 1
    },

    isExSpendPopupStatus: false,
    exSpendPopupData: null,

    maintainOwnerCompany: null,
    storeName: '',
    storeId: null,
    storeAddress: '',
    storePhone: '',

    merchantId: '',
    ownerCompanies: [],
    popUpNotice: null,
    url: '',

    isLogin: false,

    selectedCompanyId: null,
    selectedCompanyName: '',
    // maintainAccount: '',
    // maintainOwnerId: '',
    roleChangePopUpVisible: false
  }),
  persist: {
    storage: localStorage,
    paths: ['userInfo', 'token']
  },
  actions: {
    setRoleChangePopUpVisible(value) {
      this.roleChangePopUpVisible = value
    },
    clearRoleChanged() {
      this.roleChangePopUpVisible = false
    },
    setToken(token) {
      if (this.token !== token) {
        this.token = token
        this.isLogin = !!token
        localStorage.setItem('authToken', token)
      }
    },
    setSelectedCompany(companyId, companyName) {
      this.selectedCompanyId = companyId
      this.selectedCompanyName = companyName
    },
    async setUserInfo(accountInfo = {}, refetch = false) {
      const systemStore = useSystemStore()
      if (refetch || !accountInfo || !this.userInfo.role) {
        try {
          const freshAccountInfo = await getAccountInfo()
          accountInfo = { ...accountInfo, ...freshAccountInfo }
        } catch (error) {
          console.error('重新取得使用者資料失敗:', error)
          return
        }
      }
      this.userInfo = {
        ...this.userInfo,
        username: accountInfo.maintainName || this.userInfo.username,
        avatar: accountInfo.imageUrl ? `${systemStore.imageBaseUrl}${accountInfo.imageUrl}` : '',
        role: accountInfo.maintainRoot || this.userInfo.role,
        email: accountInfo.maintainAccount || this.userInfo.email,
        id: accountInfo.maintainOwnerId || this.userInfo.id
      }
      this.isFirst = accountInfo.isFirst === 1

      this.lowPopupData = {
        solutionId: accountInfo.solutionId ?? '',
        isLow: accountInfo.isLow ?? 0,
        afterPoint: accountInfo.afterPoint ?? 0,
        alertCustomerSolutionStatus: accountInfo.alertCustomerSolutionStatus ?? 0
      }
      if (accountInfo.exSpend) {
        this.exSpendPopupData = {
          exSpendId: accountInfo.exSpend.exSpendId,
          exSpendAmount: accountInfo.exSpend.exSpendAmount,
          exSpendStartDate: accountInfo.exSpend.exSpendStartDate,
          exSpendEndDate: accountInfo.exSpend.exSpendEndDate,
          alertBookingCountStatus: accountInfo.exSpend.alertBookingCountStatus
        }
        this.isExSpendPopupStatus = accountInfo.exSpend.alertBookingCountStatus === 1
      } else {
        this.exSpendPopupData = null
        this.isExSpendPopupStatus = false
      }

      this.maintainOwnerCompany = accountInfo.maintainOwnerCompany || ''
      this.storeName = accountInfo.maintainOwnerCompany ? accountInfo.maintainOwnerCompany.name : ''
      this.storeId = accountInfo.maintainOwnerCompany ? accountInfo.maintainOwnerCompany.oid : ''
      this.storeAddress = accountInfo.maintainOwnerCompany ? accountInfo.maintainOwnerCompany.streetAddress : ''
      this.storePhone = accountInfo.maintainOwnerCompany ? accountInfo.maintainOwnerCompany.telephone : ''

      this.merchantId = accountInfo.merchantId
      this.ownerCompanies = accountInfo.ownerCompany || []
      this.popUpNotice = typeof accountInfo.popUpNotice !== 'undefined' ? accountInfo.popUpNotice : 1
      this.url = accountInfo.url

      this.isLogin = !!accountInfo.maintainAccount

      // this.maintainAccount = accountInfo.maintainAccount;
      // this.maintainOwnerId = accountInfo.maintainOwnerId;
      return this.userInfo.role
    },
    clearUserInfo() {
      this.token = null
      this.userInfo = {
        username: '',
        avatar: '',
        role: '',
        email: '',
        id: ''
      }
      this.isFirst = false

      this.maintainOwnerCompany = null
      this.storeName = ''
      this.storeId = null
      this.storeAddress = ''
      this.storePhone = ''

      this.merchantId = null
      this.ownerCompanies = []
      this.popUpNotice = null
      this.url = ''
      this.isExSpendPopupStatus = false
      this.exSpendPopupData = null
      this.isLogin = false

      this.selectedCompanyId = null
      this.selectedCompanyName = ''
      // this.maintainAccount = null;
      // this.maintainOwnerId = null;
      this.roleChangePopUpVisible = false
      const rememberMe = localStorage.getItem('rememberMe')
      localStorage.clear()
      if (rememberMe) {
        localStorage.setItem('rememberMe', rememberMe)
      }
    },
    async updateTokenAndStoreInfo(newToken, storeId, storeName, storeAddress, storePhone) {
      this.setToken(newToken)
      this.storeId = storeId
      this.storeName = storeName
      this.storeAddress = storeAddress
      this.storePhone = storePhone
    }
  }
})
