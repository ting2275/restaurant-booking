<template>
  <h2></h2>
  <div class='forgot-password-container'>
    <div class='forgot-password-box'>
      <div>
        <div class='box-head'>
          <h2 class='title'>忘記帳號</h2>
          <p>請聯繫服務專員，我們將盡快與您聯繫找回帳號。</p>
        </div>
        <div class='box-content'>
          <p>電話客服時間：星期一～星期五 10:00~17:00</p>
          <div class='content-with-icon'>
            <img src='@/assets/images/icons/phone.svg'>
            <span>聯絡專線：0800-278-988</span>
          </div>
          <div class='content-with-icon'>
            <img src='@/assets/images/icons/mail.svg'>
            <span>聯絡信箱：tda.gmb@taipeiads.com</span>
          </div>
        </div>
      </div>
      <BaseButton variant='check' size='lg' @click='goToLogin'>返回登入</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { usePageMeta } from '@/router/config/setMeta'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
usePageMeta(route)
const router = useRouter()

const goToLogin = () => {
  router.push({ name: 'Login' });
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/authentication/_common.scss' as *;
.forgot-password {
  &-box {
    height: 400px;
    .box-content {
      flex: 1;
      gap: 20px;
    }
    .content-with-icon {
      display: flex;
      align-items: center;
      gap: 10px;
      @extend .subtitle;
    }
    .title {
      @extend h4;
      margin-bottom: 10px;
    }
    p {
      @extend .body2;
    }
  }
}
</style>