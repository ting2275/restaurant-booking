<template>
  <div class='forgot-password-container'>
    <div class='forgot-password-box'>
      <div>
        <div class='box-head'>
          <h2 class='title'>重設密碼</h2>
          <p>請重新設定您的新密碼，由8 - 12位混合大小寫英文字母與數字組成。</p>
        </div>
        <div class='box-content'>
          <div class='change-password-group'>
            <BaseInput
              v-for='(input, index) in changePasswordInputs' :key='index' v-model='input.model'
              :label='input.label' :type='input.type' :placeholder='input.placeholder' :locked='input.locked'
              :error-message='input.errorMessage'
              @input='validatePasswords' />
          </div>
        </div>
      </div>
      <div class='button-group'>
        <BaseButton variant='cancel' size='lg' @click='redirectToLogin'>返回登入頁</BaseButton>
        <BaseButton variant='check' size='lg' @click='updatePassword'>確認</BaseButton>
      </div>
    </div>
  </div>
  <BasePopUp v-model='isPopupVisible'>
    <template #title>{{ currentPopupContent.title }}</template>
    <template #content>{{ currentPopupContent.content }}</template>
    <template #button>
      <BaseButton variant='check' size='md' @click='currentPopupContent.buttonAction'>
        {{ currentPopupContent.buttonText }}
      </BaseButton>
    </template>
  </BasePopUp>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';

const newPassword = ref('')
const confirmPassword = ref('')
const router = useRouter()

const changePasswordInputs = ref([
  { model: newPassword, label: '輸入新密碼', type: 'password', placeholder: '請輸入您的密碼', locked: false, errorMessage: '' },
  { model: confirmPassword, label: '確認新密碼', type: 'password', placeholder: '請再次輸入您的密碼', locked: false, errorMessage: '' }
]);

const isPasswordValid = ref(false);

const validatePasswords = () => {
  isPasswordValid.value = true
  changePasswordInputs.value.forEach((input) => {
    input.errorMessage = '';
    if (input.model.value === '') {
      input.errorMessage = '未填寫';
      isPasswordValid.value = false;
    }
  });
  if (newPassword.value.length < 8 || newPassword.value.length > 12) {
    changePasswordInputs.value[0].errorMessage = '密碼長度須為 8 - 12 位';
    isPasswordValid.value = false;
  }
  if (newPassword.value !== confirmPassword.value) {
    changePasswordInputs.value[1].errorMessage = '密碼輸入不一致。';
    isPasswordValid.value = false;
  }
}

import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore()
import { resetPassword } from '@/services/api/login.js'

const userData = {
  userId: userStore.userInfo.id,
  userAccount: userStore.userInfo.email
}

const updatePassword = async () => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,12}$/;
  if (!passwordRegex.test(newPassword.value)) {
    showPopup('password-warning');
    return;
  }
  try {
    const response = await resetPassword(newPassword.value, confirmPassword.value, userData.userAccount, userData.userId);
    if (response && response.status === 'success') {
      showPopup('password-success');
    } else if (response.status === 'error') {
      showPopup('password-wrong');
    }
  } catch (error) {
    showPopup('password-wrong');
    return;
  }
}

// 跳轉到登入頁面
const redirectToLogin = () => {
  router.push({ name: 'Login' });
}
// popup相關
const isPopupVisible = ref(false);
const currentPopupContent = ref('')
const showPopup = (type) => {
  currentPopupContent.value = popupContentTemplates.value[type];
  isPopupVisible.value = true;
}
const closePopup = () => {
  isPopupVisible.value = false
}
const popupContentTemplates = ref({
  'password-wrong': {
    title: '新密碼不可與原密碼相同',
    content: '請重新設定密碼',
    buttonText: '我知道了',
    buttonAction: () => closePopup()
  },
  'password-warning': {
    title: '請重新設定新密碼',
    content: '輸入的新密碼需符合字元條件限制',
    buttonText: '確定',
    buttonAction: () => closePopup()
  },
  'password-confirm-warning': {
    title: '請再次確認新密碼',
    content: '新密碼輸入不一致',
    buttonText: '確定',
    buttonAction: () => closePopup()
  },
  'password-success': {
    title: '密碼設定完成',
    content: '請重新登入',
    buttonText: '前往登入',
    buttonAction: () => redirectToLogin()
  }
})
</script>

<style lang='scss' scoped></style>