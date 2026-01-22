<template>
  <div class='select-wrapper'>
    <component
      :is='isViewOnly ? viewDropdown : defaultDropdown'
      v-bind='props'
      :model-value='modelValue'
      :placeholder='placeholder'
      :disabled='isDisabled'
      :disabled-type='disabledType'
      @update:model-value='updateModelValue'
      @change='$emit("change", $event)'
      @dropdown-open='$emit("dropdown-open", $event)'
      @dropdown-close='$emit("dropdown-close", $event)'
    />
  </div>
</template>

<script setup>
import defaultDropdown from './defaultDropdown.vue';
import viewDropdown from './viewDropdown.vue';

const props = defineProps({
  id: { type: String, default: '' },
  modelValue: { type: [String, Number, Object, Array], default: '' },
  options: { type: Array, required: true },
  label: { type: String, default: '' },
  labelClass: { type: String, default: '' },
  labelStyle: { type: String, default: '' },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  placeholder: { type: String, default: '請選擇' },
  isDisabled: { type: Boolean, default: false },
  disabledType: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  arrowStyle: { type: String, default: 'default' },
  required: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  isRounded: { type: Boolean, default: false },
  noBackgroundColor: { type: Boolean, default: false },
  isViewOnly: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'change', 'dropdown-open', 'dropdown-close'])

const updateModelValue = (value) => {
  emit('update:modelValue', value);
};
</script>