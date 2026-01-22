<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Array, Boolean], // 可以是Boolean或Array
    required: true,
  },
  id: {
    type: String,
    default: '',
  },
  forName: {
    type: String,
    default: '',
  },
  value: {
    type: [String, Boolean],
    default: false
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  hasInput: {
    type: Boolean,
    default: false, // 是否顯示 input 欄位
  },
  inputPlaceholder: {
    type: String,
    default: '請輸入詳細內容',
  },
  inputValue: {
    type: String,
    default: '',
  },
  customClass: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue', 'update:inputValue']);

const isChecked = computed({
  get() {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.includes(props.value);
    }
    return props.modelValue === true;
  },
  set(value) {
    if (Array.isArray(props.modelValue)) {
      const newValue = [...props.modelValue];
      if (value && !newValue.includes(props.value)) {
        newValue.push(props.value);
      } else if (!value) {
        const index = newValue.indexOf(props.value);
        if (index !== -1) {
          newValue.splice(index, 1);
        }
      }
      emit('update:modelValue', newValue);
    } else {
      emit('update:modelValue', value); // 單選框情況下
    }
  },
});

const localInputValue = ref(props.inputValue);

function updateValue(event) {
  isChecked.value = event.target.checked;
}

// 當 input 改變時，更新父組件中的值
const onInputChange = (event) => {
  localInputValue.value = event.target.value;
  emit('update:inputValue', event.target.value);
};

watch(() => props.inputValue, (newVal) => {
  localInputValue.value = newVal;
});
</script>

<template>
  <div class='checkbox-group' :class='customClass'>
    <input
      :id='id'
      v-model='isChecked'
      :name='forName'
      :value='value'
      type='checkbox'
      :disabled='isDisabled'
      @change='updateValue'
    />
    <label :for='id'>
      <slot />
    </label>
    <input
      v-if='hasInput'
      v-model='localInputValue'
      type='text'
      class='checkbox-input'
      :placeholder='inputPlaceholder'
      :disabled='!isChecked || isDisabled'
      @input='onInputChange'
    />
  </div>
</template>

<style lang="scss" scoped>
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  input.checkbox-input {
    appearance: none;
    -webkit-appearance: none;
    background: none;
    border: none;
    border-bottom: 1px solid $black-900;
    border-radius: 0;
    outline: none;
    box-shadow: none;
    &:focus,
    &:active,
    &:hover {
      background: none;
      outline: none;
      box-shadow: none;
    }
  }
}

input[type='checkbox'] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid $black-500;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('@/assets/images/icons/check.svg');
    background-size: 16px;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0;
  }

  &:checked {
    border: 1px solid $primary;
    &::after {
      opacity: 1;
    }
  }

  &:disabled {
    border-color: $black-500;
    background-color: $black-400;
    cursor: not-allowed;

    &::after {
      border-color: $black-500;
    }
  }
}

label {
  cursor: pointer;
}
</style>
