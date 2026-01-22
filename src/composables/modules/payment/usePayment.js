import { ref } from 'vue'
import {
  fetchContractPaymentInfo,
  fetchOverBookingPaymentInfo,
  fetchContractPaymentLink,
  fetchOverBookingPaymentLink,
  fetchPaymentResult
} from '@/services/api/payment.js'
import { useFormat } from '@/composables/useFormat';
const { formatNumber } = useFormat();

// 合約付款資訊
export function useContractPaymentInfo() {
  const contractPaymentInfo = ref(null)
  const getContractPaymentInfo = async (payLink) => {
    try {
      const result = await fetchContractPaymentInfo(payLink)
      if (result.success) {
        contractPaymentInfo.value = {
          ...result.data,
          planDescription: `${result.data.selectedPlanLabel}方案(${result.data.point}單)`,
          formatAmount: formatNumber(result.data.amount),
          status: result.success
        }
      } else {
        contractPaymentInfo.value = {
          status: result.success
        }
        console.error('fetchContractPaymentInfo API response:', result.message)
      }
    } catch (error) {
      console.error('fetchContractPaymentInfo error', error)
    }
  }
  return {
    contractPaymentInfo,
    getContractPaymentInfo
  }
}

// 超額付款資訊
export function useOverBookingPaymentInfo() {
  const overBookingPaymentInfo = ref(null)
  const getOverBookingPaymentInfo = async (payLink) => {
    try {
      const result = await fetchOverBookingPaymentInfo(payLink)
      if (result.success) {
        overBookingPaymentInfo.value = {
          ...result.data,
          planDescription: `超額訂單(${result.data.exSpending}單)`,
          formatAmount: formatNumber(result.data.amount)
        }
      } else {
        overBookingPaymentInfo.value = {
          status: result.success
        }
        console.error('fetchOverBookingPaymentInfo API response:', result.message)
      }
    } catch (error) {
      console.error('fetchOverBookingPaymentInfo error', error)
    }
  }
  return {
    overBookingPaymentInfo,
    getOverBookingPaymentInfo
  }
}

// 產生合約付款連結
export function useContractPaymentLink() {
  const contractPaymentLink = ref(null)
  const contractTransferInfo = ref(null)
  const getContractPaymentLink = async (payType, contractId, merchantId, buyerIdentifier) => {
    try {
      const result = await fetchContractPaymentLink(payType, contractId, merchantId, buyerIdentifier)
      if (result.success) {
        contractTransferInfo.value = result.data;
        if (payType === 'paymentCard') {
          contractPaymentLink.value = result.data.cardPayURL;
        } else if (payType === 'paymentATM') {
          contractPaymentLink.value = '/payment-atm-transfer-details';
        }
      } else {
        console.error('fetchContractPaymentLink API response:', result.message)
      }
    } catch (error) {
      console.error('fetchContractPaymentLink error', error)
    }
  }
  return {
    contractPaymentLink,
    contractTransferInfo,
    getContractPaymentLink
  }
}

// 產生超額付款連結
export function useOverBookingPaymentLink() {
  const overBookingPaymentLink = ref(null)
  const overBookingTransferInfo = ref(null)
  const getOverBookingPaymentLink = async (payType, bookingCountId, merchantId, buyerIdentifier) => {
    try {
      const result = await fetchOverBookingPaymentLink(payType, bookingCountId, merchantId, buyerIdentifier)
      if (result.success) {
        overBookingTransferInfo.value = result.data;
        if (payType === 'paymentCard') {
          overBookingPaymentLink.value = result.data.cardPayURL;
        } else if (payType === 'paymentATM') {
          overBookingPaymentLink.value = '/payment-atm-transfer-details';
        }
      } else {
        console.error('fetchOverBookingPaymentLink API response:', result.message)
      }
    } catch (error) {
      console.error('fetchOverBookingPaymentLink error', error)
    }
  }
  return {
    overBookingPaymentLink,
    overBookingTransferInfo,
    getOverBookingPaymentLink
  }
}

// 取得付款結果
export function usePaymentResult() {
  const paymentResult = ref(null)
  const getPaymentResult = async (payLink) => {
    try {
      const result = await fetchPaymentResult(payLink)
      if (result.success) {
        paymentResult.value = result.data
      } else {
        console.error('fetchPaymentResult API response:', result.message)
      }
    } catch (error) {
      console.error('fetchPaymentResult error', error)
    }
  }
  return {
    paymentResult,
    getPaymentResult
  }
}