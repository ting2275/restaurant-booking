<template>
  <component
    :is='isViewOnly ? viewInput : defaultInput'
    v-bind='$attrs'
    :model-value='modelValue'
    :label='label'
    :label-class='labelClass'
    :label-style='labelStyle'
    :type='type'
    :placeholder='placeholder'
    :error-message='errorMessage'
    :locked='locked'
    :required='required'
    :autocomplete='autocomplete'
    @update:model-value='updateModelValue'
  />
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import defaultInput from './defaultInput.vue';
import viewInput from './viewInput.vue';

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  labelClass: {
    type: String,
    default: ''
  },
  labelStyle: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  locked: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  isViewOnly: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

// 檢查googleStatus狀態
// watch(
//   () => props.isViewOnly,
//   (newValue) => {
//     console.log('isViewOnly状态:', newValue);
//   },
//   { immediate: true }
// );

const updateModelValue = (value) => {
  emit('update:modelValue', value);  // 直接發出事件
};

</script>