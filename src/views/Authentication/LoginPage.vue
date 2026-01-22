<template>
  <div class='login-container'>
    <div class='login-box-left'>
      <div class='login-box-top'>
        <h1 class='brand'>
          <img src='@/assets/images/resources/logo.svg' alt='Restaurant Booking Logo' />
        </h1>
        <div class='login-form'>
          <form @submit.prevent='handleLogin'>
            <BaseInput
              v-model='email'
              type='email'
              placeholder='請輸入您的電子信箱'
              label='帳號'
              autocomplete='username'
              :error-message='emailError'
              :class="{ 'error': errorMessage }"
              @keyup='handleEmailInput'
              @focusout='validateEmail'
            />
            <BaseInput
              v-model='password'
              type='password'
              placeholder='請輸入８－１２位的密碼'
              label='密碼'
              autocomplete='current-password'
              :error-message='passwordError'
              :class="{ 'error': errorMessage }"
              @keyup='handlePasswordInput'
              @focusout='validatePassword'
            />
            <div class='form-options'>
              <CheckBox
                id='rememberMe'
                v-model='rememberMe'
                :for-name="'rememberMe'"
              >
                記住我
              </CheckBox>
              <router-link to='/forgot-password' class='forgot-password'>忘記帳號或密碼？</router-link>
            </div>
            <BaseButton type='submit' variant='check' size='lg'>登入</BaseButton>

          </form>
          <div class='register-link'>
            <router-link to='/contact-us'>尚未註冊？聯繫專人為您服務</router-link>
          </div>
        </div>
      </div>
      <div class='copyright'>
        <p class='caption'>登入即表示同意<a href='#' target='_blank'>會員條款</a>與<a href='#' target='_blank'>隱私權政策</a></p>
        <p class='small'>Copyright © {{ currentYear }} Taipei Digital Advertising Inc.</p>
      </div>
    </div>
    <div class='login-box-right'>
      <div class='title'>
        <h2>訂位輕鬆管 預訂不漏接</h2>
        <p class='body1'>眾多店家都在使用的餐廳訂位系統</p>
      </div>
      <img class='image' src='@/assets/images/resources/feature-collage.png' alt='預訂管理系統' />
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { usePageMeta } from '@/router/config/setMeta';
import { useRoute, useRouter } from 'vue-router';
import { login } from '@/services/api/login.js';
import { getAccountInfo } from '@/services/api/accountInfo.js';
import { useUserStore } from '@/stores/userStore';
import { useAccountStore } from '@/stores/accountStore';

const route = useRoute();
usePageMeta(route);
const userStore = useUserStore();
const accountStore = useAccountStore();

const router = useRouter();
const email = ref(localStorage.getItem('rememberMe') || '');
const password = ref('');
const errorMessage = ref('');
const rememberMe = ref(false);
const isFormValid = ref(false);
const emailError = ref('');
const passwordError = ref('');
const currentYear = new Date().getFullYear();

const validateEmail = () => {
  emailError.value = '';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value) {
    emailError.value = '未填寫';
  } else if (!emailPattern.test(email.value)) {
    emailError.value = '信箱格式錯誤';
  } else {
    emailError.value = '';
  }
};

const validatePassword = () => {
  passwordError.value = '';
  // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]/;
  if (!password.value) {
    passwordError.value = '未填寫';
  } else if (password.value.length < 8 || password.value.length > 12) {
    passwordError.value = '密碼長度必須在8到12個字符之間';
  } else {
    passwordError.value = '';
  }
};

const handleEmailInput = () => {
  if (email.value) {
    emailError.value = '';
  }
  validateEmail();
};

const handlePasswordInput = () => {
  if (password.value) {
    passwordError.value = '';
  }
  validatePassword();
};

const validateForm = () => {
  validateEmail();
  validatePassword();
  isFormValid.value = !emailError.value && !passwordError.value;
};

const handleLogin = async () => {
  validateForm();
  if (!isFormValid.value) return;
  try {
    const loginResponse = await login(email.value, password.value)
    if (loginResponse.token) {
      userStore.setToken(loginResponse.token);
      const accountInfo = await getAccountInfo(loginResponse.token);
      if (accountInfo && accountInfo.maintainAccount) {
        await userStore.setUserInfo(accountInfo);
        userStore.popUpNotice = accountInfo.popUpNotice;

        userStore.setSelectedCompany(accountInfo.maintainOwnerCompany.oid, accountInfo.maintainOwnerCompany.name);

        await accountStore.setAccountInfo(accountInfo);

        if (rememberMe.value) {
          localStorage.setItem('rememberMe', email.value);
        } else {
          localStorage.removeItem('rememberMe');
        }

        const targetRoute = userStore.isFirst ? { name: 'NewMemberPassword' } : { name: 'BookingOverview' };
        router.push(targetRoute);
      } else {
        handleLoginError('無法獲取有效的帳戶信息')
      }
    } else {
      handleLoginError(loginResponse.message);
    }
  } catch (error) {
    handleLoginError(error.message);
  }

  await nextTick();
};

// 處理登錄錯誤
const handleLoginError = () => {
  errorMessage.value = '帳號或密碼有誤';
  passwordError.value = errorMessage.value;
  localStorage.removeItem('authToken');
};

onMounted(() => {
  userStore.clearRoleChanged();
  rememberMe.value = !!localStorage.getItem('rememberMe');
  email.value = localStorage.getItem('rememberMe') || '';
});
</script>

<style lang='scss' scoped>
@use '@/assets/scss/pages/authentication/_common.scss' as *;
</style>