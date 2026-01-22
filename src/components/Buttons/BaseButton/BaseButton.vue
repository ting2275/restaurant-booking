<template>
  <component
    :is='isViewOnly ? viewButton : defaultButton'
    :class-array='computedClass'
    :is-disabled='variant === "disabled"|| variant === "not-open"'
    @click-event='emit("on-click", event)'>
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import defaultButton from './defaultButton.vue';
import viewButton from './viewButton.vue';

const props = defineProps({
  isViewOnly: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: "check",
    validator: (value) =>
      [
        "check",
        "cancel",
        "disabled",
        "not-open",
        "readonly",
        "primary-variant",
        "secondary",
      ].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg'].includes(value)
  },
})

const computedClass = computed(() => {
  return ["btn", `btn-${props.variant}`, `btn-${props.size}`];
});

const emit = defineEmits(['on-click'])
</script>
