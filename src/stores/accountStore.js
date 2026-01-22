import { defineStore } from 'pinia';
import { getAccountInfo } from '@/services/api/accountInfo.js';

export const useAccountStore = defineStore('account', {
  state: () => ({
    differenceDay: null,
    expiredStatus: null,
    googleStatus: null,
    contractChangePopUpVisible: false,
    statusTextMap: {
      0: '未連動',
      1: '連動成功',
      3: '連動審核中',
      8: '未連動',
      9: '未連動'
    },
    contactInfo:{
      contactEmail:null,
      contactName:null,
      contactTel:null,
    },
    sales:{
      salesEmail: null,
      salesName: null,
    },
    solution:{
      solutionName: null,
      solutionId: null,
      solutionStartDay: null,
      solutionEndDay: null,
    },
    merchantId: '',
    worker: {
      workerName: null,
      workerEmail: null,
    },
  }),
  persist: {
    storage: localStorage,
  },
  actions: {
    async setAccountInfo(accountInfo, refetch = false) {
      if (refetch || !accountInfo) {
        try {
          const freshAccountInfo = await getAccountInfo();
          accountInfo = { ...accountInfo, ...freshAccountInfo };
        } catch (error) {
          console.error('重新取得使用者資料失敗:', error);
          return;
        }
      }
      this.differenceDay = accountInfo.differenceDay;
      this.expiredStatus = accountInfo.expiredStatus;
      this.googleStatus = accountInfo.googleStatus;
      this.contactInfo = {
        ...this.contactInfo,
        contactEmail: accountInfo.contactEmail || this.contactInfo.contactEmail,
        contactName: accountInfo.contactName || this.contactInfo.contactName,
        contactTel: accountInfo.contactTel || this.contactInfo.contactTel,
      };
      this.sales = {
        ...this.sales,
        salesEmail: accountInfo.salesEmail || this.sales.salesEmail,
        salesName: accountInfo.salesName || this.sales.salesName,
      };
      this.solution = {
        ...this.solution,
        solutionName: accountInfo.solutionName || this.solution.solutionName,
        solutionId: accountInfo.solutionId || this.solution.solutionId,
        solutionStartDay: accountInfo.solutionStartDay || this.solution.solutionStartDay,
        solutionEndDay: accountInfo.solutionEndDay || this.solution.solutionEndDay,
      };
      this.merchantId = accountInfo.merchantId;
      this.worker = {
        ...this.worker,
        workerName: accountInfo.workerName || this.worker.workerName,
        workerEmail: accountInfo.workerEmail || this.worker.workerEmail,
      };
      this.checkGoogleStatus();
    },

    checkGoogleStatus() {
      if (this.googleStatus === 8) {
        this.setContractChangePopUpVisible(true);
      }
    },

    setContractChangePopUpVisible(value) {
      this.contractChangePopUpVisible = value;
    },

    clearContractChanged() {
      this.contractChangePopUpVisible = false;
    },

    calculateDifferenceDay() {
      const today = new Date();
      const endDate = new Date(this.solutionEndDay);
      const differenceTime = endDate.getTime() - today.getTime();
      this.differenceDay = Math.ceil(differenceTime / (1000 * 60 * 60 * 24));
    }
  },
  getters: {
    getGoogleStatus: (state) => state.googleStatus,
    getGoogleStatusText: (state) => state.statusTextMap[state.googleStatus] || '未知',
    isViewOnly: (state) => state.googleStatus === 8,
  },
});
