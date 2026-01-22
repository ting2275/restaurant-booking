<template>
  <div class='payment-container'>
    <div class='payment-box'>
      <div class='logo'>
        <img src='@/assets/images/resources/logo.svg' alt='Restaurant Booking' />
      </div>
      <div class='payment-box-info'>
        <h4>付款資訊</h4>
      </div>
      <div class='divider dashed'></div>
      <div class='payment-box-content'>
        <div class='payment-info'>
          <span class='label'>店商</span>
          <div class='info'>{{ paymentInfo.name }}</div>
        </div>
        <div class='payment-info'>
          <span class='label'>購買方案</span>
          <div class='info'>{{ paymentInfo.planDescription }}</div>
        </div>
        <div class='payment-info'>
          <span class='label'>付款方式</span>
          <div class='info'>匯款</div>
        </div>
        <div class='payment-info'>
          <span class='label'>轉帳銀行</span>
          <div class='info'>永豐商業銀行 807</div>
        </div>
        <div class='payment-info'>
          <span class='label'>戶名</span>
          <div class='info'>台北數位廣告股份有限公司</div>
        </div>
        <div class='payment-info'>
          <span class='label'>分行代碼</span>
          <div class='info'>台北分行 021</div>
        </div>
        <div class='payment-info'>
          <span class='label'>轉帳帳號</span>
          <div class='info'>{{ transferInfo.atmPayNo }}(僅供本次訂單使用)</div>
        </div>
      </div>
      <div class='divider line'></div>
      <div class='payment-info'>
        <span class='label'>支付金額</span>
        <span class='amount'>NT ${{ paymentInfo.formatAmount }}</span>
      </div>
      <div class='buttons-group'>
        <BaseButton
          variant='cancel'
          size='lg'
          @click='downloadReceipt'
        >
          <img src='@/assets/images/icons/download.svg' alt='download' />
          下載繳費單
        </BaseButton>
        <BaseButton
          variant='check'
          size='lg'
          @click='viewTransactionHistory'
        >
          查看交易紀錄
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>

defineProps({
  paymentInfo: {
    type: Object,
    required: true
  },
  transferInfo: {
    type: Object,
    required: true
  }
});

const downloadReceipt = () => {
  console.log('downloadReceipt');
  window.print();
}

const viewTransactionHistory = () => {
  console.log('viewTransactionHistory');
  // TODO: 跳轉到交易紀錄頁面
}
</script>

<style lang='scss' scoped>
@use '@/assets/scss/pages/payment/_common.scss' as *;
</style>
