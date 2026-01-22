<template>
  <BaseAccountNotifyPopUp
    v-model:visible='visible'
    v-model:dont-show-again='dontShowAgain'
    :title="'超額單數繳費通知'"
    :button-text="'我知道了'"
    @button='handleButton'
  >
    <template #content>
      目前有超額單數<span class='hint-text'>{{ exSpendAmount }}</span>，請至帳務專區確認款項，並下載繳費單協助繳費。<br>
      <span class='hint-text'>
        計費期間:{{ formatDate(exSpendStartDate).slice(5) }} - {{ formatDate(exSpendEndDate).slice(5) }}
      </span>
    </template>
  </BaseAccountNotifyPopUp>
</template>
      
<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { updateExSpendPopUpStatus  } from '@/services/api/maintainUser';
import { useFormat } from "@/composables/useFormat";

const { formatDate } = useFormat();

const userStore = useUserStore();

const visible = ref(true);

const dontShowAgain = ref(false);

const exSpendAmount = computed(() => userStore.exSpendPopupData.exSpendAmount);

const exSpendStartDate = computed(() => userStore.exSpendPopupData.exSpendStartDate);

const exSpendEndDate = computed(() => userStore.exSpendPopupData.exSpendEndDate);

const emit = defineEmits(['update:visible']);

const handleButton = async () => {
  if (dontShowAgain.value) {
    try {
      const exSpendId = userStore.exSpendPopupData.exSpendId;
      await updateExSpendPopUpStatus(exSpendId);
      // await userStore.setUserInfo();
      userStore.isExSpendPopupStatus = false
      userStore.exSpendPopupData.alertBookingCountStatus = 1;
    } catch (error) {
      console.error('更新彈窗通知狀態失敗', error);
    }
  }
  emit('update:visible', false);
};
</script>

<style lang='scss' scoped>
@use '@/assets/scss/components/popup/_popup-accoutNotify.scss' as *;
</style>