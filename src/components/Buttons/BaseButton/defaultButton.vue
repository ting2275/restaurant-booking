<template>
  <button :class='classArray' :disabled='props.isDisabled' @click='handleClick'>
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  classArray: {
    type: Array,
    default: () => []
  },
  isDisabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click-event'])
const handleClick = event => {
  emit('click-event', event)
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/button/_base-button.scss' as *;

.btn {
  &-check {
    background-color: $primary;
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
    color: $primary;
    border: 1px solid $primary;
  }

  &-primary-variant { /* 新增 primary-variant 狀態 */
    background-color: $primary-variant;
    color: white;
  }

  &-secondary { /* 新增 secondary 狀態 */
    background-color: $secondary;
    color: $primary;
  }
}
</style>