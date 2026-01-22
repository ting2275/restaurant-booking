import { defineStore } from 'pinia'
import { getShopInfo } from '@/services/api/shop'
import axios from 'axios'

export const useShopStore = defineStore('shop', {
  state: () => ({
    shopInfo: null,
    loading: false,
    error: null
  }),
  actions: {
    async fetchShopInfo() {
      this.loading = true
      this.error = null
      try {
        const data = await getShopInfo()
        this.shopInfo = data
      } catch (error) {
        this.error = error.message || '獲取店家資訊失敗'
      } finally {
        this.loading = false
      }
    },
    async updateHolidays(holidaysData) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          throw new Error('未找到授權令牌，請重新登錄')
        }
        const formattedData = { holidays: holidaysData }
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
        const response = await axios.put(`${API_BASE_URL}/Shop/holidays`, formattedData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        this.shopInfo = { ...this.shopInfo, holidays: holidaysData }
        return response.data
      } catch (error) {
        console.error('更新假期設置失敗:', error)
        if (error.response) {
          console.log('錯誤狀態:', error.response.status)
          console.log('錯誤數據:', error.response.data)
          this.error = `更新失敗: ${error.response.data.message || error.response.data.errors?.holidays || error.response.statusText}`
        } else if (error.request) {
          this.error = '無法連接到服務器，請檢查網絡連接'
        } else {
          this.error = error.message || '更新假期設置失敗'
        }
        throw error
      } finally {
        this.loading = false
      }
    },
    setShopInfo(info) {
      this.shopInfo = info
    },

    setMerchantId(id) {
      this.merchantId = id
    },

    updateShopInfo(newInfo) {
      this.shopInfo = { ...this.shopInfo, ...newInfo }
    }
  }
})
