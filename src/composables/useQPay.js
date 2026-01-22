import { ref } from 'vue';
import { QPayService } from '@/services/api/pay.js';

export function useQPay() {
  const responseData = ref(null);

  const createPayment = async ({ route, amount, point }) => {
    try {
      const response = await QPayService.createPayment({ route, amount, point });
      responseData.value = response.data;
      console.log('createPayment response', response);
      return response.data;
    } catch (error) {
      console.error('createPayment error', error);
      throw error;
    }
  };

  const handleReturnCard = async ({ ShopNo, PayToken }) => {
    try {
      const response = await QPayService.handleReturnCard({ ShopNo, PayToken });
      responseData.value = response.data;
      console.log('handleReturnCard response', response);
      return response.data;
    } catch (error) {
      console.error('handleReturnCard error', error);
      throw error;
    }
  };

  return {
    responseData,
    createPayment,
    handleReturnCard
  };
}