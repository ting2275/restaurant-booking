import { ref } from 'vue'
import { getPaymentDetail } from '@/services/api/order.js'

export function usePaymentDetail() {
  const paymentDetailData = ref(null)
  const fetchPaymentDetail = async ({ orderId, contractType }) => {
    try {
      const params = { orderId, contractType }
      const result = await getPaymentDetail(params)
      if (result.success) {
        paymentDetailData.value = result.data
      } else {
        console.error('fetchPaymentDetail API response:', result.message)
      }
    } catch (error) {
      console.error('fetchPaymentDetail error', error)
    }
  }
  return {
    paymentDetailData,
    fetchPaymentDetail
  }
}
