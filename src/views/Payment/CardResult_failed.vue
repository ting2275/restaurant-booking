<!-- 付款結果失敗(僅信用卡) -->
<template>
  <div class='payment-container'>
    <div class='payment-box'>
      <div class='logo'>
        <img src='@/assets/images/resources/logo.svg' alt='Restaurant Booking' />
      </div>
      <div class='payment-box-info'>
        <h4>付款失敗，請重新付款</h4>
      </div>
      <div class='divider dashed'></div>
      <div class='payment-box-content'>
        <p>親愛的夥伴，{{ companyName }}。<br>
          您的訂單沒有成功付款，系統已將此筆交易自動失效，請聯繫客服協助確認原因，或重新交易付款。</p>
        <div class='form-footer'>
          <div class='text'>
            <p>※ 電話客服時間：星期一~星期五 10:00~17:00</p>
            <p class='inline'>專線：0800-278-988</p>
            <p class='inline'>信箱：tda.gmb@taipeiads.com</p>
          </div>
        </div>
      </div>
      <BaseButton
        variant='check'
        size='lg'
      >
        回到Restaurant Booking系統
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';

  const companyName = ref('');
  const initFromUrlParams = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    companyName.value = urlParams.get('CompanyName') || '您好';
  };

  onMounted(() => {
    initFromUrlParams();
  });
</script>

<style lang='scss' scoped>
@use '@/assets/scss/pages/payment/_common.scss' as *;
</style>