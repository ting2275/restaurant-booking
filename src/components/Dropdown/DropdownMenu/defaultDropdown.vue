<template>
  <label v-if='label' :class='labelClass' :style='labelStyle'>
    <span v-if='required' class='required'>*</span>
    {{ label }}
  </label>
  <div
    class='dropdown-menu-trigger'
    :class="{ 'is-open': isOpen }"
    @click='toggleMenu'
  ></div>
  <div ref='selectWrapperRef'>
    <VueSelect
      :id='id'
      v-model='selected'
      :options='formattedOptions'
      :placeholder='placeholder'
      :class='selectedClass'
      :disabled='isDisabled'
      :disabled-type='disabledType'
      :is-readonly='isReadonly'
      :is-searchable='isSearchable'
      :dir='computedDir'
      :is-view-only='isViewOnly'
      @click='toggleMenu'
      @change='handleChange'
      @update:model-value='updateModelValue'
    />
  </div>
  <div v-if='errorMessage' class='error-message'>{{ errorMessage }}</div>
</template>

<script setup>
import { ref, computed, toRefs, watch, onMounted, onUnmounted } from 'vue';
import VueSelect from 'vue3-select-component';

const props = defineProps({
  menuOpen: Boolean,
  id: { type: String, default: '' },
  modelValue: { type: [String, Number, Object, Array], default: '' },
  options: { type: Array, required: true },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  isDisabled: { type: Boolean, default: false },
  disabledType: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' },
  labelClass: { type: String, default: '' },
  labelStyle: { type: String, default: '' },
  required: { type: Boolean, default: false },
  isReadonly: { type: Boolean, default: true },
  isSearchable: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  placeholder: { type: String, default: '請選擇' },
  arrowStyle: { type: String, default: 'default' },
  isRounded: { type: Boolean, default: false },
  noBackgroundColor: { type: Boolean, default: false },
  isViewOnly: { type: Boolean, default: false },
});

const { isReadonly, isSearchable } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'change', 'dropdown-open', 'dropdown-close']);
const selected = ref(props.modelValue);

const formattedOptions = computed(() => {
  return props.options.map((option) => ({
    label: option[props.labelKey],
    value: option[props.valueKey],
    disabled: option.disabled ?? false,
  }));
});

const updateModelValue = (value) => {
  emit('update:modelValue', value);
};

const selectedClass = computed(() => [
  'dropdown',
  `dropdown-${selected.value}`,
  props.disabled ? 'disabled' : '',
  props.disabledType ? `dropdown-${props.disabledType}` : '',
  props.errorMessage ? 'error' : '',
  `arrow-${props.arrowStyle}`,
  props.isRounded ? 'is-rounded' : '',
  props.noBackgroundColor ? 'no-background-color' : ''
]);

const computedDir = ref('auto');
const selectWrapperRef = ref(null);

import { useDropdownManager } from '@/composables/common/useDropdownManager';
const { open, close, isOpened } = useDropdownManager();

const isOpen = computed(() => isOpened(props.id))

const toggleMenu = () => {
  if (!isOpened(props.id)) {
    setTimeout(() => {
      open(props.id)
      emit('dropdown-open', props.id)
    }, 0)
  } else {
    close()
    emit('dropdown-close', props.id)
  }
}

const clickOutsideDropdown = (event) => {
  const wrapper = selectWrapperRef.value
  const isInside = wrapper?.contains(event.target)
  const isTrigger = event.target.closest('.dropdown-menu-trigger')

  if (!isInside && !isTrigger) {
    close()
    emit('dropdown-close', props.id)
  }
}

const calculateDropdownDirection = () => {
  if (!props.menuOpen) return;

  const selectWrapper = selectWrapperRef.value;
  if (!selectWrapper) return;

  const popupContainer = selectWrapper.closest('.pop-up-content');
  if (!popupContainer) return;

  const dropdownMenu = selectWrapper.querySelector('.vue-select .menu');
  if (!dropdownMenu) {
    computedDir.value = 'auto';
    return;
  }

  const dropdownHeight = dropdownMenu.clientHeight || 200;

  const selectRect = selectWrapper.getBoundingClientRect();
  const popupRect = popupContainer.getBoundingClientRect();
  const availableHeight = popupRect.bottom - selectRect.bottom;

  computedDir.value = availableHeight < dropdownHeight ? 'up' : 'auto';
};

onMounted(() => {
  document.addEventListener('click', clickOutsideDropdown);
  calculateDropdownDirection();
  window.addEventListener('resize', calculateDropdownDirection);
  window.addEventListener('scroll', calculateDropdownDirection, { passive: true });
  setTimeout(() => {
    setReadonly();
  }, 0);
});

onUnmounted(() => {
  document.removeEventListener('click', clickOutsideDropdown);
  window.removeEventListener('resize', calculateDropdownDirection);
  window.removeEventListener('scroll', calculateDropdownDirection, { passive: true });
});

const setReadonly = () => {
  const selectWrapper = selectWrapperRef.value;
  if (!selectWrapper) return;
  const input = selectWrapper.querySelector('.vue-select input.search-input');
  if (input) input.readOnly = isReadonly.value;
};

watch(isReadonly, setReadonly, { immediate: true });

const handleChange = (value) => {
  emit('change', value);
};

watch(selected, (newVal) => {
  emit('update:modelValue', newVal);
  emit('change', newVal);
});

watch(() => props.modelValue, (newVal) => {
  if (selected.value !== newVal) {
    selected.value = newVal;
  }
}, { immediate: true });
</script>

<style lang="scss">
:root {
  --vs-input-outline: none !important;
  --vs-border-radius: 8px !important;
  --vs-font-size: map-get($body2, font-size) !important;
  --vs-font-weight: map-get($body2, font-weight) !important;
  --vs-line-height: map-get($body2, line-height) !important;
  --vs-menu-height: 180px !important;

  --vs-menu-padding: 0 0 16px 0 !important;
  --vs-menu-border: none !important;
  --vs-menu-box-shadow: 2px 4px 12px 0px #00000040 !important;

  --vs-option-padding: var(--vs-padding) !important;
  --vs-option-font-size: var(--vs-font-size) !important;
  --vs-option-font-weight: var(--vs-font-weight) !important;
  --vs-option-hover-color: #ececec !important;
  --vs-option-focused-color: unset !important;
  --vs-option-selected-color: #ececec !important;
  --vs-option-disabled-color: unset !important;
  --vs-option-disabled-text-color: unset !important;
}

.dropdown {
  letter-spacing: 0.16em;
  .control {
    cursor: pointer;
    input {
      cursor: pointer;
    }
  }
  &.dropdown-prepare {
    .control {
      background-color: $primary-variant;
    }
  }
  &.dropdown-CONFIRMED {
    .control {
      background-color: $accent-2;
    }
  }
  &.dropdown-seated {
    .control {
      background-color: $accent-1;
    }
  }
  &.dropdown-NO_SHOW {
    .control {
      background-color: $black-400;
    }
  }
  &.dropdown-CANCELED {
    .control {
      background-color: #ffffff;
    }
  }
  &.disabled {
    .control {
      pointer-events: none;
      background-color: $black-400;
    }
    &.arrow-default .dropdown-icon {
      background-image: url('@/assets/images/icons/down-arrow-black.svg');
    }
    &.arrow-custom .dropdown-icon {
      background-image: url('@/assets/images/icons/triangle-down-black.svg');
    }
  }
  &.is-rounded {
    .control {
      border-radius: 30px;
    }
  }
  &.no-background-color {
    .control {
      background-color: #ffffff;
    }
  }

  // 無法編輯的禁用狀態
  &.disabled-all {
    pointer-events: none;
    cursor: not-allowed !important;
    .control {
      background-color: $black-400;
    }
  }

  .control {
    border: 1px solid $black-500 !important;
    color: $black-900;
    height: 40px;
    .indicators-container {
      display: flex;
      padding: 0;
      width: 40px;
      justify-content: center;
      align-items: center;
      gap: 0;
      flex-shrink: 0;
      flex-grow: 0;
    }
    .indicators-container > * {
      flex: 1;
    }
    .value-container {
      color: $black-900;
      padding-top: 0;
      padding-bottom: 0;
      flex-wrap: nowrap;
    }
    button.dropdown-icon {
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      width: 24px;
      height: 24px;
      svg {
        display: none;
      }
    }
    button.clear-button {
      display: none;
    }
  }
  &.arrow-default .dropdown-icon {
    background-image: url('@/assets/images/icons/down-arrow.svg');
  }
  &.arrow-custom .dropdown-icon {
    background-image: url('@/assets/images/icons/triangle-down.svg');
  }
  .menu {
    .menu-option {
      padding: 8px 16px;
    }
    .focused {
      &:hover {
        background-color: $black-400;
      }
    }
    @include custom-scrollbar;
  }
  &.error {
    .control {
      border-color: red !important;
    }
  }
  &[dir='up'] {
    .menu {
      bottom: 100%;
      top: auto;
    }
  }
}

.select-wrapper {
  position: relative;
  .required {
    color: red;
    margin-left: 4px;
  }
  .error-message {
    color: red;
    margin-top: 5px;
    font-size: 12px;
    text-indent: 0;
  }
}

label {
  display: block;
  letter-spacing: 2.24px;
}
</style>

<style lang="scss" scoped>
  :deep(.search-input) {
    @include placeholderColor($placeholder-color);
    position: absolute;
    inset: 0;
    width: 100% !important;
  }
  :deep(.single-value) {
    flex-grow: 1;
    padding: 10px 16px !important;
  }
  label {
    margin-bottom: 16px;
  }
  .dropdown-menu-trigger {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    cursor: pointer;
    display: none;
    &.is-open {
      display: block;
    }
  }
</style>