<!-- 付款流程主頁面 ； (含付款驗證頁面、ATM付款頁面、連結失效頁面) -->
<template>
  <component
    :is='currentStepComponent'
    v-if='isPaymentInfoReady'
    v-bind='stepProps'
    v-on='stepActions'
  />
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getBillingInfo, getBillingLink } from '@/composables/modules/payment/useBillingPurpose.js';

const route = useRoute();

const isPaymentInfoReady = ref(false);
const currentPaymentInfo = ref(null);
const currentTransferInfo = ref(null);

// 解析網址參數
const initFromUrlParams = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlSource = urlParams.get('payLink');
  currentPaymentInfo.value = await getBillingInfo(route.name, urlSource)
  isPaymentInfoReady.value = true;

  // 已付過款的訂單；或其他400 Bad Request導致無法正常取回訂單資訊
  // 將currentStep設為failed，顯示連結失效頁面
  if (currentPaymentInfo.value.status === false) {
    currentStep.value = 'failed';
  }
};

import Form from '@/views/Payment/ValidationForm.vue';
import ATM from '@/views/Payment/TransferDetails.vue';
import PaymnetFailed from '@/views/Payment/PaymnetFailed.vue';

const currentStep = ref('form');
const currentStepComponent = computed(() => {
  return {
    'form': Form, // 驗證頁面
    'ATM': ATM, // 匯款資訊頁面
    'failed': PaymnetFailed, // 取得訂單資訊失敗->連結失效頁面
  }[currentStep.value] || PaymnetFailed;
});
const stepProps = computed(() => {
  return {
    'form': {
      'paymentInfo': currentPaymentInfo.value,
      'isFormSubmitAvailable': isFormSubmitAvailable.value
    },
    'ATM': {
      'paymentInfo': currentPaymentInfo.value,
      'transferInfo': currentTransferInfo.value
    }
  }[currentStep.value] || {};
})

const stepActions = computed(() => {
  return {
    'form': {
      'form-submit': onFormSubmit
    }
  }[currentStep.value] || {};
})

onMounted(() => {
  initFromUrlParams();
});

// 表單提交
const isFormSubmitAvailable = ref(true);
const onFormSubmit = async (data) => {
  isFormSubmitAvailable.value = false;
  let actionData = {
    ...data,
    ...currentPaymentInfo.value
  }
  const { paymentLink, transferInfo } = await getBillingLink(route.name, actionData);
    //【選擇ATM付款】切換顯示轉帳資訊
  if (data.payType === 'paymentATM') {
    currentStep.value = 'ATM';
    currentTransferInfo.value = transferInfo;
  } else {
    //【選擇信用卡付款】跳轉至銀行付款頁面
    // 根據付款結果，跳轉至對應returnUrl(參照authRoutes.js)，不會再回到此頁面。
    window.location.href = paymentLink;
  }
};


</script>