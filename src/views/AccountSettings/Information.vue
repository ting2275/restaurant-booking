<template>
  <div class='main-box'>
    <h4>
      <span v-if='currentView === 2' class='prev-btn' @click='currentView = 1'>
        <img src='@/assets/images/icons/back-arrow.svg' alt=''>
      </span>
      {{ currentView === 1 ? '帳號資訊' : '變更密碼' }}
    </h4>
    <div class='main-container'>
      <div v-if='currentView === 1'>
        <div class='user-header'>
          <div class='user-avatar'>
            <img v-if='avatarTemp' :src='avatarTemp' alt='hasAvatarTemp'>
            <img v-else-if='userAvatar' :src='user.avatarUrl' :alt='user.username'>
            <img v-else src='@/assets/images/icons/user-picture.svg' :alt='user.username'>
          </div>
          <BaseButton
            :variant='uploadButton.variant'
            :size='uploadButton.size'
            :class="{ 'is-view-only': isViewOnly }"
            @click='triggerAvatarUpload()'>
            <img :src='isViewOnly ? uploadGrayIcon : uploadIcon' alt='upload'>
            {{ uploadButton.label }}
          </BaseButton>
          <input id='avatar' ref='avatarInput' hidden type='file' accept='image/*' @change='previewAvatar()'>
          <BaseButton
            :variant='deleteButton.variant' :size='deleteButton.size'
            class='btn-delete'
            :class="{ 'is-view-only': isViewOnly }"
            @click='clearAvatar()'>
            <img :src='isViewOnly ? deleteGrayIcon : deleteIcon' alt='delete'>
            {{ deleteButton.label }}
          </BaseButton>
        </div>
        <div class='user-info'>
          <BaseInput
            v-for='(input,index) in userNameInputs'
            :key='input.label' v-model='input.model'
            :label='input.label'
            :type='input.type'
            :placeholder='input.placeholder'
            :locked='input.locked'
            :required='input.required'
            :error-message='input.errorMessage'
            :is-view-only='isViewOnly'
            @update:model-value='updateInputValue(index, $event)' />
          <BaseInput
            v-for='input in unEditableInputs' :key='input.label' v-model='input.model' :label='input.label'
            :type='input.type' :placeholder='input.placeholder' :locked='input.locked'
            :error-message='input.errorMessage' />
        </div>
        <div class='user-footer'>
          <p
            class='change-password'
            :class="{ 'is-view-only': isViewOnly }"
            @click='currentView = 2'>
            變更密碼
          </p>
          <BaseButton
            :variant='saveButton.variant'
            :size='saveButton.size'
            :is-view-only='isViewOnly'
            @on-click='saveAccountChanges()'>
            {{ saveButton.label }}
          </BaseButton>
        </div>
      </div>
      <div v-else-if='currentView === 2'>
        <p>變更您的新密碼，由8 - 12位混合大小寫英文字母與數字組成。</p>
        <div class='change-password-group'>
          <BaseInput
            v-for='input in changePasswordInputs' :key='input.label' v-model='input.model'
            :label='input.label' :type='input.type' :placeholder='input.placeholder' :locked='input.locked'
            :error-message='input.errorMessage' />
        </div>
        <div class='change-password-footer'>
          <BaseButton
            :variant='savePasswordButton.variant' :size='savePasswordButton.size'
            @click='updatePassword()'>
            {{ savePasswordButton.label }}
          </BaseButton>
        </div>
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
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useAccountStore } from '@/stores/accountStore';
import { resetPassword, updateMaintainUserInfo , deleteMaintainUserImage } from '@/services/api/maintainUser.js';
import uploadIcon from '@/assets/images/icons/upload.svg';
import uploadGrayIcon from '@/assets/images/icons/upload-gray.svg';
import deleteIcon from '@/assets/images/icons/trash-can-sm-black.svg';
import deleteGrayIcon from '@/assets/images/icons/trash-can-sm-gray.svg';

const router = useRouter()
const userStore = useUserStore()
const currentView = ref(1)
const currentPopupContent = ref('');
const user = ref({});
const userName = ref('')
const userId = ref('')
const userAvatar = ref('')
const storeName = ref('')
const avatarInput = ref(null)

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const userNameInputs = ref([])
const userPasswordInputs = ref([])
const unEditableInputs = ref([])
const changePasswordInputs = ref([
  { model: oldPassword, label: '輸入舊密碼', type: 'password', placeholder: '請輸入您的舊密碼', locked: false },
  { model: newPassword, label: '輸入新密碼', type: 'password', placeholder: '請輸入您的新密碼', locked: false },
  { model: confirmPassword, label: '確認新密碼', type: 'password', placeholder: '請再次輸入您的新密碼', locked: false }
]);
const updateInputValue = (index, value) => { userNameInputs.value[index].model = value; }; // 允許動態更新 userNameInputs 數組中的值

const getUserInfo = () => {
  user.value = {
    username: userStore.userInfo.username || '',
    avatar: userStore.userInfo.avatar || '',
    avatarUrl: userStore.userInfo.avatar || '',
    userId: userStore.userInfo.email || '',
    maintainOwnerId: userStore.userInfo.id || '',
    maintainOwnerCompany: userStore.maintainOwnerCompany || '',
    storeName: userStore.maintainOwnerCompany.name || ''
  };
  userName.value = user.value.username;
  userId.value = user.value.userId;
  userAvatar.value = user.value.avatar;
  storeName.value = user.value.storeName;

  userNameInputs.value = [
    { model: userName, label: '使用者名稱', placeholder: user.value.username, locked: false, required: true }
  ];
  // 密碼測試記得刪掉
  userPasswordInputs.value = [
    { model: oldPassword, label: '輸入密碼', type: 'password', placeholder: '請輸入您的舊密碼', locked: false },
  ];
  unEditableInputs.value = [
    { model: userId, label: '帳號', placeholder: user.value.userId, locked: true },
    { model: storeName, label: '商家名稱', placeholder: user.value.storeName, locked: true },
  ];
};

const uploadButton = ref({ variant: 'cancel', size: 'sm', label: '上傳' });
const deleteButton = ref({ variant: 'cancel', size: 'sm', label: '刪除' });
const saveButton = ref({ variant: 'check', size: 'md', label: '儲存' });
const savePasswordButton = ref({ variant: 'check', size: 'md', label: '確認' });

const saveAccountChanges = async () => {
  if (!userName.value) {
    showPopup('member-edit-warning');
    return;
  }
  let blob = new Blob([])
  const formData = new FormData();
  if (isClearAvatar.value){
    await deleteMaintainUserImage()
  }
  if (avatarTemp.value !== '') {
    blob = await base64ToBlob(avatarTemp.value, 'image/png');
    formData.append('image', blob, 'image.png');
  }
  formData.append('userName', userName.value)

  try {
    await updateMaintainUserInfo(formData);
    showPopup('member-edit-success');

    await userStore.setUserInfo({
      ...userStore.userInfo,
      username: userName.value,
      imageUrl: userAvatar.value
    }, true);
  } catch (error) {
    console.error('Error updating user info:', error);
  }
}

const updatePassword = async () => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,12}$/;
  if (!passwordRegex.test(newPassword.value)) {
    showPopup('password-warning');
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    showPopup('password-confirm-warning');
    return;
  }
  const inputs = {
    "userPassword": newPassword.value,
    "userOldPassword": oldPassword.value,
    "maintainOwnerId": user.value.maintainOwnerId,
    "userId": user.value.userId
  }
  try {
    const result = await resetPassword({ ...inputs });
    if (result.data.status === 'success') {
      showPopup('password-success');
    } else if (result.data.status === 'error') {
      const errorMessages = {
        '缺少參數': '請輸入舊密碼',
        '密碼不能相同': '新舊密碼不能相同',
        '密碼不能為舊密碼。': '密碼不能為舊密碼',
        '舊密碼錯誤。': '舊密碼錯誤'
      }
      const errorMessage = errorMessages[result.data.message];
      if (errorMessage) {
        showPopup('password-wrong', errorMessage);
      }
    }
  } catch (error) {
    showPopup('password-wrong');
    return;
  }
}

// 觸發上傳按鈕
const triggerAvatarUpload = () => {
  avatarInput.value.click();
}
const avatarTemp = ref('')
const isClearAvatar = ref(false);
const previewAvatar = () => {
  if (avatarInput.value.files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarTemp.value = e.target.result;
    }
    avatarInput.value.image = avatarInput.value.files[0];
    reader.readAsDataURL(avatarInput.value.files[0]);
  }
}
const clearAvatar = () => {
  avatarTemp.value = '';
  userAvatar.value = '';
  isClearAvatar.value = true;
}

function base64ToBlob(base64, mimeType) {
  const byteString = atob(base64.split(',')[1]); // 解碼 base64
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([uint8Array], { type: mimeType });
}

// 跳轉到登入頁面
const redirectToLogin = () => {
  router.push('/login')
}

// popup setting 相關
const isPopupVisible = ref(false);
const showPopup = (type, message = '') => {
  const template = popupContentTemplates.value[type];
  currentPopupContent.value = {
    ...template,
    content: message || template.content
  }
  isPopupVisible.value = true;
}
const closePopup = () => {
  isPopupVisible.value = false
}
const popupContentTemplates = ref({
  'member-edit-warning': {
    title: '請輸入完整資訊',
    content: '使用者名稱必填',
    buttonText: '確定',
    buttonAction: () => closePopup()
  },
  'member-edit-phone-warning': {
    title: '電話格式錯誤',
    content: '請檢查後重新輸入',
    buttonText: '確定',
    buttonAction: () => closePopup()
  },
  'member-edit-success': {
    title: '修改成功',
    content: '帳號資訊已更新',
    buttonText: '我知道了',
    buttonAction: () => closePopup()
  },
  'password-wrong': {
    title: '密碼輸入錯誤',
    content: '請重新輸入密碼',
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
});

watch(
  () => userStore.userInfo,
  () => {
    getUserInfo();
  }, {
    immediate: true
  }
)

// 檢視狀態
const accountStore = useAccountStore();
const isViewOnly = ref(false);
const GOOGLE_STATUS = ref(8);
watch(
  () => accountStore.googleStatus,
  (newStatus) => {
    isViewOnly.value = newStatus === GOOGLE_STATUS.value;
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/accountSettings/_mixins.scss' as *;

.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 1px solid $black-500;
  border-radius: 8px;

  .user-avatar {
    @include avatar(56px);
  }

  :deep(.btn) {
    padding: 4px 8px;
    width: fit-content;
  }
  :deep(.btn-cancel), .btn-delete {
    &.is-view-only {
      pointer-events: none;
      color: $black-500;
      border: 1px solid $black-500;
    }
  }
}

.user-info {
  display: block;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;

  label {
    display: block;
    margin-bottom: 10px;
  }
}

.info-group {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 10px;
  width: 100%;

  .info-title {
    width: 60px;
  }

  .info-content {
    flex: 1;
  }
}

.user-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;

  .change-password {
    color: $primary;
    text-decoration: underline;
    cursor: pointer;
    &.is-view-only {
      pointer-events: none;
      color: $black-500;
    }
  }
}

.change-password-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.change-password-group {
  margin: 40px 0;
}
</style>