<template>
  <div :class='classArray' :disabled='props.disabled'>
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  classArray: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/button/_base-button.scss' as *;
.btn {
  &-check {
    background-color: $black-500;
    color: white;
  }
  &:disabled, &-disabled {
    background-color: $black-500;
    color: white;
    cursor: not-allowed;
  }
  &-not-open {
    &:disabled{
      background-color: $black-400;
      color: $black-600;
    }
  }
  &-readonly{
    background-color: #ececec;
    color: #2d2d2d;
    cursor: not-allowed;
  }
  &-cancel {
    background-color: white;
    color: $black-500;
    border: 1px solid $black-500;
  }

  &-primary-variant { /* 新增 primary-variant 狀態 */
    background-color: $black-500;
    color: white;
  }

  &-secondary { /* 新增 secondary 狀態 */
    background-color: $secondary;
    color: $primary;
  }
}
</style>