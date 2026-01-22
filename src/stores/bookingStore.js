import { defineStore } from 'pinia';

export const useEditingStore  = defineStore('editing', {
    state: () => ({
        isEditing: false,
        originData: {},
        currentData: {},
    }),
    actions: {
        setIsEditing(value) {
            this.isEditing = value;
        },
        setOriginData(data) {
            this.originData = data;
            this.currentData = {...data}; //創建副本
        },
        setCurrentBookingData(data) {
            this.currentData = {
              ...this.currentData, // 保留現有資料
              ...data // 合併新資料
            };
        },
        clearDatas() {
            this.originData = {};
            this.currentData = {};
        }
    },
    getters: {
      isReady: (state) => Object.keys(state.originData).length > 0
    },
});

export const useAddingStore  = defineStore('adding', {
  state: () => ({
      isEditing: false,
      currentData: {},
  }),
  actions: {
      setIsEditing(value) {
          this.isEditing = value;
      },
      setCurrentBookingData(data) {
        this.currentData = {
          ...this.currentData, // 保留現有資料
          ...data // 合併新資料
        };
      },
      clearDatas() {
          this.currentData = {};
      }
  },
  getters: {
    isReady: (state) => Object.keys(state.currentData).length > 0
  },
});