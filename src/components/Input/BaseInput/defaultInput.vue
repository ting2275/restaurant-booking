<template>
  <div class='input-group' :class='{ error: hasError }'>
    <div class='input-wrap'>
      <label v-if='label' :class='labelClass' :style='labelStyle'>
        <span v-if='required' class='required'>*</span>
        {{ label }}
      </label>
      <div v-if='type === "password"' class='input-with-icon'>
        <input
          :value='modelValue'
          :type='showPassword ? "text" : "password"'
          :placeholder='placeholder'
          :disabled='props.locked'
          :autocomplete='autocomplete'
          @input='updateValue($event.target.value)'
        />
        <span class='icon' @click='togglePasswordVisibility'>
          <img :src='iconSrc' alt='切換密碼顯示' />
        </span>
      </div>
      <input
        v-else
        v-bind='$attrs'
        :value='modelValue'
        :type='type'
        :placeholder='placeholder'
        :disabled='props.locked'
        :autocomplete='autocomplete'
        @input='updateValue($event.target.value)'
      />
    </div>
    <div v-if='hasError' class='error-message'>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import eyeClosed from '@/assets/images/icons/eye-closed.svg'
import eyeOpened from '@/assets/images/icons/eye-opened.svg'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  labelClass: {
    type: String,
    default: ''
  },
  labelStyle: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  locked: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: ''
  },
})

const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)

const iconSrc = computed(() => showPassword.value ? eyeOpened : eyeClosed)

const hasError = computed(() => props.errorMessage && props.errorMessage.length > 0)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const updateValue = (value) => {
  if (!props.locked) {  // 當locked為true時，輸入框無法編輯
    emit('update:modelValue', value)
  }
}
</script>

<style lang="scss" scoped>
.input-group {
  &.locked {
    input {
      background-color: #ECECEC;
      // border-color: #CCCCCC;
      border: none;
      box-shadow: inset 0 0 0 1px #cccccc;
      color: #2D2D2D;
      cursor: not-allowed;
    }
  }
}

label {
  display: block;
  margin: 0px 0 16px 0;
  color: $black-900;
  @extend .body2;
}

.required {
  color: red;
}

input {
  width: 100%;
  height: 40px;
  padding: 10px;
  border: 1px solid $black-500;
  border-radius: 8px;
  font-size: 14px;
  color: $black-900;
  @extend .body2;
  &:focus {
    outline: none;
    border-color: $primary;
  }
  &:disabled {
    background-color: $black-400;
    color: $black-900;
  }
  @include autofill(#fff, $black-900);
  @include placeholderColor($placeholder-color);
}

.input-with-icon {
  position: relative;
}

.input-with-icon input {
  padding-right: 30px;
}

.icon {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #aaa;
}

.error input {
  border-color: red;
}

.error-message {
  color: red;
  margin-top: 5px;
  font-size: 12px;
}
</style>