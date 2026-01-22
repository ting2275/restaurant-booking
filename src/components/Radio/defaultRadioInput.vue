<template>
  <div class='radio-group' :class='customClass'>
    <input
      :id='id'
      :name='forName'
      :value='value'
      type='radio'
      :checked='isChecked'
      :disabled='isDisabled'
      @change='updateValue'
    />
    <label :for='id'>
      <slot/>
    </label>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Boolean, Number],
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  forName: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Boolean, Number],
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

// 計算該選項是否已被選中
const isChecked = computed(() => {
  return props.modelValue === props.value;
});

// 當選項改變時，更新父組件的值
function updateValue(event) {
  emit('update:modelValue', isNaN(event.target.value) ? event.target.value : Number(event.target.value));
}
</script>

<style lang="scss" scoped>
.radio-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
input[type='radio'] {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: none;
  }
  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid $black-500;
    border-radius: 50%;
    background-color: white;
  }
  ~ label {
    cursor: pointer;
  }
  &:checked {
    &::after {
      background-color: $primary-variant;
      border: 1px solid $primary;
    }
    &::before {
      display: block;
    }
  }
  &:disabled {
    cursor: not-allowed;
    ~ label {
      cursor: not-allowed;
    }
    &::after {
      border-color: $black-500;
      background-color: $black-400;
    }
  }
}
</style>