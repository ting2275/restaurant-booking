<template>
  <div class='radio-group' :class='customClass'>
    <span
      :id='id'
      :value='value'
      :checked='isChecked'
      class='view-radio'
      :class='isChecked ? "checked" : "unchecked"'
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
    value: {
      type: [String, Boolean, Number],
      required: true,
    },
    customClass: {
      type: String,
      default: ''
    }
  });

  // 計算該選項是否已被選中
  const isChecked = computed(() => {
    return props.modelValue === props.value;
  });
</script>

<style lang="scss" scoped>
  .radio-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  .view-radio {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    position: relative;
    &.checked {
      border: 1px solid $primary-variant;
      background-color: $secondary;
      &::before {
        content: '';
        display: block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #ffffff;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    &.unchecked {
      border: 1px solid $black-500;
      background-color: $black-400;
    }
  }
</style>