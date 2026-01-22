<template>
  <div :class='`vue-select arrow-${props.arrowStyle}`'>
    <label v-if='props.label' class='dropdown-label'>
      <span v-if='props.required' class='required'>*</span>
      {{ props.label }}
    </label>
    <div class='control'>
      <div class='value-container'>
        <div class='single-value'>{{ displayValue }}</div>
      </div>
      <div class='indicators-container'>
        <button type='button' class='dropdown-icon'>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed } from 'vue';
  const props = defineProps({
    modelValue: { type: [String, Number, Object, Array], default: '' },
    options: { type: Array, required: true },
    labelKey: { type: String, default: 'label' },
    valueKey: { type: String, default: 'value' },
    arrowStyle: { type: String, default: 'default' },
    label: { type: String, default: '' },
    required: { type: Boolean, default: false }
  });

  const emit = defineEmits(['update:modelValue', 'change']);
  const selected = ref(props.modelValue);

  const displayValue = computed(() => {
    const selectedOption = props.options.find(option => option[props.valueKey] === props.modelValue);
    return selectedOption ? selectedOption[props.labelKey] : '';
  });

  watch(() => props.modelValue, (newVal) => {
      selected.value = newVal;
  });

  watch(selected, (newVal) => {
    emit('change', newVal);
    emit('update:modelValue', newVal);
  });
</script>

<style lang="scss" scoped>
  :deep(.single-value) {
    flex-grow: 1;
    padding: 10px 16px !important;
  }
  .select-wrapper {
    position: relative;
    .vue-select {
      .control {
        display: flex;
        justify-content: space-between;
        letter-spacing: 0.16em;
        position: relative;
        box-sizing: border-box;
        border: none;
        box-shadow: inset 0 0 0 1px $black-500;
        width: 100%;
        min-height: 40px;
        border-radius: 8px;
        background-color: $black-300;
        .indicators-container {
          display: flex;
          padding: 0;
          width: 40px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          flex-grow: 0;
          .dropdown-icon {
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            width: 24px;
            height: 24px;
            border: none;
            padding: 0;
            margin: 0;
            background-color: transparent;
          }
        }
      }
      &.arrow-default .dropdown-icon {
        background-image: url('@/assets/images/icons/down-arrow-gray.svg');
      }
      &.arrow-custom .dropdown-icon {
        background-image: url('@/assets/images/icons/triangle-down-black.svg');
      }
    }
  }

.dropdown-label {
  display: block;
  margin: 0px 0 16px 0;
  color: $black-900;
  @extend .body2;
}

.required {
  color: red;
}
</style>