<!-- 付款結果成功(僅信用卡) -->
<template>
  <div class='payment-container'>
    <div class='payment-box'>
      <div class='logo'>
        <img src='@/assets/images/resources/logo.svg' alt='Restaurant Booking' />
      </div>
      <div class='payment-box-info'>
        <h4>付款成功</h4>
      </div>
      <div class='divider dashed'></div>
      <div class='payment-box-content'>
        <div class='payment-info'>
          <span class='label'>店商</span>
          <div class='info'>{{ paymentResult?.customerName }}</div>
        </div>
        <div class='payment-info'>
          <span class='label'>購買方案</span>
          <div class='info'>{{ planDescription }}</div>
        </div>
        <div class='payment-info'>
          <span class='label'>付款方式</span>
          <div class='info'>信用卡</div>
        </div>
      </div>
      <div class='divider line'></div>
      <div class='payment-info'>
        <span class='label'>支付金額</span>
        <span class='amount'>NT ${{ formatAmount }}</span>
      </div>
      <BaseButton
        variant='check'
        size='lg'
      >
        查看交易紀錄
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, computed } from 'vue';
  import { usePaymentResult } from '@/composables/modules/payment/usePayment';
  import { useFormat } from '@/composables/useFormat';
  const { formatNumber } = useFormat();

  const { paymentResult, getPaymentResult } = usePaymentResult();

  // 取得付款結果
  const initFromUrlParams = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const payLink = urlParams.get('payLink') || urlParams.get('Paylink');
    await getPaymentResult(payLink)
  };

  const planDescription = computed(() => {
    if (!paymentResult.value) return '';
    if (paymentResult.value.contractType === 'contract') {
      return `${paymentResult.value.solutionType}方案(${paymentResult.value.point}單)`;
    } else {
      return `超額訂單 (${paymentResult.value.point}單)`;
    }
  });

  const formatAmount = computed(() => {
    return formatNumber(paymentResult.value?.amount);
  });

  onMounted(() => {
    initFromUrlParams();
  });
</script>

<style lang='scss' scoped>
@use '@/assets/scss/pages/payment/_common.scss' as *;
</style>