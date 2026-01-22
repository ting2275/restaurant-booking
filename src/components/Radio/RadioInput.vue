<template>
  <component
    :is='isViewOnly ? viewRadioInput : defaultRadioInput'
    v-bind='props'
    :model-value='modelValue'
    @update:model-value='updateModelValue'
  >
    <slot/>
  </component>
</template>

<script setup>
  import defaultRadioInput from './defaultRadioInput.vue';
  import viewRadioInput from './viewRadioInput.vue';

  const props = defineProps({
    modelValue: {
      type: [String, Boolean, Number], // 可以是 String 或 Boolean 或 Number
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
      type: [String, Boolean, Number], // 可以是 String 或 Boolean 或 Number
      required: true,
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    customClass: {
      type: String,
      default: ''
    },
    isViewOnly: {
      type: Boolean,
      default: false
    }
  });

  const emit = defineEmits(['update:modelValue']);

  const updateModelValue = (value) => {
    emit('update:modelValue', value);
  };
</script>