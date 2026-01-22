<script setup>
import BasePopUp from '@/components/PopUp/BasePopUp.vue';

const modelValue = defineModel({ type: Boolean, default: false });

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  modelValue.value = false;
  emit('cancel');
};
</script>

<template>
  <BasePopUp
    :model-value='modelValue'
    teleport-to='#popup-layer-1'
    card-size='md'
    :esc-button='false'
    :button-count='2'
  >
    <template #title>
      <span></span>
    </template>
    <template #content>
      <p class='confirm-text'>是否將所有訊息標示為已讀？</p>
    </template>
    <template #buttons>
      <BaseButton variant='cancel' size='sm' @click='handleCancel'>否</BaseButton>
      <BaseButton variant='check' size='sm' @click='handleConfirm'>是</BaseButton>
    </template>
  </BasePopUp>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/shared/index' as *;
@use '@/assets/scss/mixins/mixins' as *;
.confirm-text {
  @extend .headline4;
  text-align: center;
}
</style>
