import { ref } from 'vue';
import { getOrderInfo } from '@/services/api/order.js';

const orderDetailData = ref(null);

export function useOrderDetail() {
  const fetchOrderDetail = async ({ orderId, merchantId }) => {
    console.log('fetchOrderDetail 被調用');
    try {
      const params = { orderId, merchantId };
      const result = await getOrderInfo(params);
      if (result.success) {
        orderDetailData.value = result.data;
        console.log('fetchOrderDetail API response:', result.data);
      } else {
        console.error('fetchOrderDetail API response:', result.message);
      }
    } catch (error) {
      console.error('fetchOrderDetail error', error);
    }
  }

  return {
    orderDetailData,
    fetchOrderDetail
  };
}
