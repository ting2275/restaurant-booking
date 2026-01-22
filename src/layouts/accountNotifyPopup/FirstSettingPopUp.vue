<template>
  <BaseAccountNotifyPopUp
    v-model:visible='visible'
    v-model:dont-show-again='dontShowAgain'
    :title="'確認店家營業設定'"
    :button-text="'前往設定'"
    @button='handleButton'
  >
    <template #content>
      請務必確認所有設定，這些設定將影響顧客可選擇的預訂選項
    </template>
  </BaseAccountNotifyPopUp>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { updatePopUpNotice } from '@/services/api/maintainUser';

const emit = defineEmits(['update:visible']);
const userStore = useUserStore();
const visible = ref(true);
const dontShowAgain = ref(false);
const router = useRouter();

const handleButton = async () => {
  if (dontShowAgain.value) {
    try {
      await updatePopUpNotice(userStore.userInfo.email);
      userStore.popUpNotice = 0;
    } catch (error) {
      console.error('更新彈窗通知狀態失敗', error);
    }
  }
  emit('update:visible', false);
  router.push({ name: 'BusinessSettings' });
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/popup/_popup-accoutNotify.scss' as *;
</style>