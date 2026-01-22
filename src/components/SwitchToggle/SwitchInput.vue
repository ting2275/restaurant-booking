<template>
  <component
    :is='isViewOnly ? viewSwitchInput : defaultSwitchInput'
    v-bind='props'
    :model-value='modelValue'
    @update:model-value='updateModelValue'
  />
</template>

<script setup>
  import { defineProps, defineEmits } from 'vue';
  import defaultSwitchInput from './defaultSwitchInput.vue';
  import viewSwitchInput from './viewSwitchInput.vue';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    forName: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    isDisabled: {
      type: Boolean,
      default: false
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