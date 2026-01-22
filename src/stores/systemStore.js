import { defineStore } from 'pinia';

export const useSystemStore = defineStore('system', {
  state: () => ({
    systemIsEditing: false,
    imageBaseUrl: null,
    isContractNotification: false,
  }),
  actions: {
    setSystemIsEditing(value) {
      this.systemIsEditing = value;
    },
    setImageBaseUrl() {
      const env = import.meta.env.VITE_APP_ENV;
      if (env === 'production') {
        this.imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
      } else {
        const source = import.meta.env.VITE_IMAGE_SOURCE || '2';
        this.imageBaseUrl = source === '2'
          ? import.meta.env.VITE_IMAGE_BASE_URL_2 || 'https://images.example.com/'
          : import.meta.env.VITE_IMAGE_BASE_URL_1 || 'https://images.example.com/';
      }

      if (!this.imageBaseUrl) {
        throw new Error('IMAGE_BASE_URL 未正確設置，請檢查 .env 文件配置');
      }
    },
    setIsContractNotification(value) {
      this.isContractNotification = value;
    }
  }
});