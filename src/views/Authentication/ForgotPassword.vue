<template>
  <div class='forgot-password-container'>
    <div class='forgot-password-box'>
      <div v-if='step === 1'>
        <div class='box-head'>
          <h2 class='title'>忘記密碼</h2>
          <p>請輸入您的帳號，我們將發送驗證碼至您的信箱。</p>
        </div>
        <div class='box-content' @focusout='validateEmail'>
          <BaseInput
            v-model='email'
            type='email'
            placeholder='請輸入您的電子信箱'
            label='帳號'
            :error-message='emailError'
            @input='validateEmail'
          />
          <router-link to='/forgot-account'>忘記帳號？</router-link>
        </div>
      </div>
      <div v-else-if='step === 2'>
        <div class='box-head'>
          <h2 class='title'>輸入驗證碼</h2>
          <p>我們傳送了一封電子郵件到 {{ email }}，內附驗證碼，請輸入該驗證碼登入。</p>
        </div>
        <div class='box-content'>
          <BaseInput
            v-model='code'
            type='text'
            placeholder='輸入驗證碼'
            label='輸入驗證碼'
            :error-message='codeError'
            @input='validateCode'
          />
          <a @click='requestVerificationCode(true)'>重新發送驗證碼</a>
        </div>
      </div>
      <div v-else-if='step === 3'>
        <div class='box-head'>
          <h2 class='title'>重設密碼</h2>
          <p>請重新設定您的新密碼，由 8 - 12 位混合大小寫英文字母與數字組成。</p>
        </div>
        <div class='box-content'>
          <BaseInput
            v-model='newPassword'
            type='password'
            placeholder='請輸入您的密碼'
            label='輸入新密碼'
            :error-message='passwordError'
            @input='validatePasswords'
          />
          <BaseInput
            v-model='confirmPassword'
            type='password'
            placeholder='請輸入您的密碼'
            label='確認新密碼'
            :error-message='confirmPasswordError'
            @input='validatePasswords'
          />
        </div>
      </div>
      <div v-if='!showSuccessAlert' class='button-group'>
        <BaseButton v-if='step === 1' variant='cancel' size='lg' @click='cancel'>取消</BaseButton>
        <BaseButton v-else variant='cancel' size='lg' @click='previousStep'>上一步</BaseButton>
        <BaseButton :disabled='!isStepValid' variant='check' size='lg' @click='nextStep'>{{ step === 3 ? '確認' : '繼續' }}</BaseButton>
      </div>
    </div>
  </div>

  <BasePopUp v-model='showPopupToRoute' :esc-button='false'>
    <template #title>{{ popupTitleMessage }}</template>
    <template #content>{{ popupContentText }}</template>
    <template #button>
      <BaseButton variant='check' size='md' @click='goToLogin'>前往登入</BaseButton
      >
    </template>
  </BasePopUp>

  <BasePopUp v-model='showPopupToClose' :esc-button='true'>
    <template #title>{{ popupTitleMessage }}</template>
    <template #content>{{ popupContentText }}</template>
    <template #button>
      <BaseButton variant='check' size='md' @click='showPopupToClose = false'
      >我知道了</BaseButton
      >
    </template>
  </BasePopUp>

</template>

<script setup>
import { ref, computed } from 'vue'
import { usePageMeta } from '@/router/config/setMeta'
import { useRoute, useRouter } from 'vue-router'

import { sendVerificationCode, verifyCode, resetPassword } from '@/services/api/login.js'

const route = useRoute()
usePageMeta(route)

const router = useRouter()

const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const maintainOwnerId = ref('')

const emailError = ref('')
const codeError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const isEmailValid = ref(false)
const isCodeValid = ref(false)
const isPasswordValid = ref(false)
const showSuccessAlert = ref(false)
const showPopupToRoute = ref(false)
const showPopupToClose = ref(false)
const popupTitleMessage = ref('')
const popupContentText = ref('')

const validateCode = () => {
  codeError.value = code.value === ''
    ? '未填寫'
    : !/^[0-9]{6}$/.test(code.value)
      ? '驗證碼輸入錯誤'
      : ''
  isCodeValid.value = !codeError.value
}

const validateEmail = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailError.value = !email.value ? '未填寫' : emailPattern.test(email.value) ? '' : '信箱格式錯誤';
  isEmailValid.value = !emailError.value;
};

const validatePasswords = () => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,12}$/;
  passwordError.value = newPassword.value === ''
    ? '未填寫'
    : !passwordRegex.test(newPassword.value)
      ? '密碼必須包含大小寫字母和數字，且長度為 8 - 12 位'
      : '';

  confirmPasswordError.value = confirmPassword.value === ''
    ? '未填寫'
    : newPassword.value !== confirmPassword.value
      ? '密碼輸入不一致。'
      : '';

  isPasswordValid.value = passwordError.value === '' && confirmPasswordError.value === '';
};

const requestVerificationCode = async (showPopup = false) => {
  try {
    const response = await sendVerificationCode(email.value)
    if (response && response.code) {
      step.value = 2;
      if (showPopup) {
        popupTitleMessage.value = '已重新發送驗證碼';
        popupContentText.value = '請至您的信箱確認內容';
        showPopupToClose.value = true;
      }
    } else {
      emailError.value = '查無此帳號';
    }
  } catch (error) {
    emailError.value = error.message
  }
}



const VerificationCode = async () => {
  try {
    const response = await verifyCode(email.value, code.value)
    if (response && response.status === 'success') {
      maintainOwnerId.value = response.maintainOwnerId;
      step.value = 3;
    } else {
      codeError.value = '驗證碼輸入錯誤';
    }
  } catch (error) {
    codeError.value = error.message
  }
}

const setNewPassword = async () => {
  try {
    const response = await resetPassword(newPassword.value, confirmPassword.value, email.value, maintainOwnerId.value);
    if (response && response.status === 'success') {
      // popupTitleMessage.value = response.message;
      popupTitleMessage.value = '密碼設定完成';
      popupContentText.value = '請重新登入';
      showPopupToRoute.value = true;
    } else if (response.status === 'error') {
      popupTitleMessage.value = '新密碼不可與原密碼相同';
      popupContentText.value = '請重新設定密碼';
      showPopupToClose.value = true;
    } else {
      passwordError.value = response.message;
    }
  } catch (error) {
    passwordError.value = error.message || '密碼重設失敗，請稍後再試';
  }
}

const step = ref(1)
const nextStep = async () => {
  if (step.value === 1) {
    await requestVerificationCode()
  } else if (step.value === 2) {
    await VerificationCode()
  } else if (step.value === 3) {
    await setNewPassword()
  }
}

const previousStep = () => {
  step.value--;
}

const cancel = () => {
  router.push({ name: 'Login' });
}

const goToLogin = () => {
  showPopupToRoute.value = false;
  router.push({ name: 'Login' });
}

const isStepValid = computed(() => {
  if (step.value === 1) {
    return isEmailValid.value;
  } else if (step.value === 2) {
    return isCodeValid.value;
  } else if (step.value === 3) {
    return isPasswordValid.value && !passwordError.value && !confirmPasswordError.value;
  }
  return false;
});
</script>

<style lang='scss' scoped>
@use '@/assets/scss/pages/authentication/_common.scss' as *;
</style>