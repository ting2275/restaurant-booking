<template>
  <BasePopUp v-model='modelValue' :esc-button='true' :close-on-overlay-click='false'>
    <template #title>您的合約已到期</template>
    <template #content>權限已變更為檢視狀態。</template>
    <template #button>
      <BaseButton variant='check' size='md' @click='handleClose'>我知道了</BaseButton>
    </template>
  </BasePopUp>
</template>
  
  <script setup>
  import { computed } from 'vue';
  import { useAccountStore } from '@/stores/accountStore';
  
  const accountStore = useAccountStore();
  const emit = defineEmits(['close']);
  
  const modelValue = computed({
    get: () => accountStore.contractChangePopUpVisible,
    set: (value) => {
      accountStore.setContractChangePopUpVisible(value);
    },
  });
  
  const handleClose = () => {
    emit('close');
  };
  </script>
  