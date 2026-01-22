<template>
  <DoubleCheckPopUp v-model='visible'>
    <template #title>資料尚未儲存</template>
    <template #content>確定要離開此頁面？</template>
    <template #buttons>
      <BaseButton variant='cancel' size='sm' @click='cancelLeave'> 取消 </BaseButton>
      <BaseButton variant='check' size='sm' @click='confirmLeave'> 確定 </BaseButton>
    </template>
  </DoubleCheckPopUp>
</template>

<script setup>
import { computed } from "vue";
import DoubleCheckPopUp from '@/components/PopUp/DoubleCheckPopUp.vue';

const emit = defineEmits(['confirm', 'cancel', 'update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const cancelLeave = () => {
  emit('cancel');
  visible.value = false;
};

const confirmLeave = () => {
  emit('confirm');
  visible.value = false;
};
</script>

<style scoped>

</style>