import { ref } from 'vue';
import {
  useContractPaymentInfo,
  useContractPaymentLink,
  useOverBookingPaymentInfo,
  useOverBookingPaymentLink
 } from '@/composables/modules/payment/usePayment.js';

 // 合約續約運算
const currentPaymentInfo = ref(null);
const currentPaymentLink = ref('');
const currentTransferInfo = ref(null);
const { contractPaymentInfo, getContractPaymentInfo } = useContractPaymentInfo();
const { contractPaymentLink, contractTransferInfo, getContractPaymentLink } = useContractPaymentLink();

// 超額訂單運算
const { overBookingPaymentInfo, getOverBookingPaymentInfo } = useOverBookingPaymentInfo();
const { overBookingPaymentLink, overBookingTransferInfo, getOverBookingPaymentLink } = useOverBookingPaymentLink();

export async function getBillingInfo ( type , payLink ) {
  if (type === 'PaymentVerifyContract') {
    await getContractPaymentInfo(payLink);
    currentPaymentInfo.value = contractPaymentInfo.value;
  } else if (type === 'PaymentVerifyOverBooking') {
    await getOverBookingPaymentInfo(payLink);
    currentPaymentInfo.value = overBookingPaymentInfo.value;
  }
  return currentPaymentInfo.value;
}

export async function getBillingLink( type , data ) {
  if (type === 'PaymentVerifyContract') {
    const { payType, buyerIdentifier , contractId, merchantId  } = data;
    await getContractPaymentLink(payType, contractId, merchantId, buyerIdentifier);
    currentPaymentLink.value = contractPaymentLink.value;
    currentTransferInfo.value = contractTransferInfo.value;
  } else if (type === 'PaymentVerifyOverBooking') {
    const { payType, buyerIdentifier , bookingCountId, merchantId } = data;
    await getOverBookingPaymentLink(payType, bookingCountId, merchantId, buyerIdentifier);
    currentPaymentLink.value = overBookingPaymentLink.value;
    currentTransferInfo.value = overBookingTransferInfo.value;
  }
  return {
    paymentLink: currentPaymentLink.value,
    transferInfo: currentTransferInfo.value
  };
}