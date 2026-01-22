<template>
  <div class='payment-container'>
    <div class='payment-box'>
      <div class='logo'>
        <img src='@/assets/images/resources/logo.svg' alt='Restaurant Booking' />
      </div>
      <div class='payment-box-info'>
        <h4>此付款連結已失效</h4>
      </div>
      <div class='divider dashed'></div>
      <div class='payment-box-content'>
        <p>如有任何問題，請聯繫客服。</p>
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
        @click='goToRestaurant BookingSystem'
      >
        回到Restaurant Booking系統
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
const goToRestaurant BookingSystem = () => {
  // TODO: 跳轉到Restaurant Booking系統
}
</script>

<style lang='scss' scoped>
@use '@/assets/scss/pages/payment/_common.scss' as *;
</style>