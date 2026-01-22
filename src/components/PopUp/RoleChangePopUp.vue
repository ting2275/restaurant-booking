<template>
  <BasePopUp v-model='modelValue' :esc-button='false' :close-on-overlay-click='false'>
    <template #title>權限變更</template>
    <template #content>您的權限已變更，請重新登入。</template>
    <template #button>
      <BaseButton variant='check' size='md' @click='handleClose'>前往登入</BaseButton>
    </template>
  </BasePopUp>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const emit = defineEmits(['close']);

const modelValue = computed({
  get: () => userStore.roleChangePopUpVisible,
  set: (value) => {
    userStore.setRoleChangePopUpVisible(value);
  },
});

const basePath = import.meta.env.VITE_APP_ENV === 'production' ? import.meta.env.VITE_BASE_PATH : '';
import { joinPath } from '@/utils';

const handleClose = () => {
  userStore.clearUserInfo();
  emit('close');
  window.location.replace(joinPath(basePath, 'login'));
};
</script>
