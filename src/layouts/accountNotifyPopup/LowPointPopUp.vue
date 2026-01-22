<template>
  <BaseAccountNotifyPopUp
    v-model:visible='visible'
    v-model:dont-show-again='dontShowAgain'
    :title="'可用單數即將使用完畢'"
    :button-text="'我知道了'"
    @button='handleButton'
  >
    <template #content>
      可用單數剩餘<span class='hint-text'>{{ afterPoint }}</span>單，單數消耗完畢後，系統仍能正常使用，但後續將計算超額單數，並於當季結算後提供繳費單。如有任何問題，請聯繫服務專員協助處理
    </template>
  </BaseAccountNotifyPopUp>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { updateIsLowPopUpStatus } from '@/services/api/maintainUser';

const userStore = useUserStore();

const visible = ref(true);

const dontShowAgain = ref(false);

const afterPoint = computed(() => userStore.lowPopupData.afterPoint);

const emit = defineEmits(['update:visible']);

const handleButton = async () => {
  if (dontShowAgain.value) {
    try {
      const solutionId = userStore.lowPopupData.solutionId;
      await updateIsLowPopUpStatus(solutionId);
      userStore.lowPopupData.isLow = 0;
      userStore.lowPopupData.alertCustomerSolutionStatus = 1;
    } catch (error) {
      console.error('更新彈窗通知狀態失敗', error);
    }
  }
  emit('update:visible', false);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/popup/_popup-accoutNotify.scss' as *;
</style>
