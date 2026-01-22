<template>
  <div class='input-group' :class='{ error: hasError }'>
    <div class='input-wrap'>
      <label v-if='label' :class='labelClass' :style='labelStyle'>
        <span v-if='required' class='required'>*</span>
        {{ label }}
      </label>
      <div v-if='type === "password"' class='input-with-icon'>
        <div class='model-box-password' >
          <span v-if='!modelValue && !isViewOnly' class='placeholder'>{{ placeholder }}</span>
          {{ modelValue }}
        </div>
        <span class='icon' >
          <img :src='iconSrc' alt='切換密碼顯示' />
        </span>
      </div>

      <!-- 一般輸入框 -->
      <div class='model-box'>
        {{ modelValue || placeholder }}
      </div>

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
//   locked: {
//     type: Boolean,
//     default: false
//   },
  required: {
    type: Boolean,
    default: false
  },
  isViewOnly: {
    type: Boolean,
    default: false
  }
})


const showPassword = ref(false)

const iconSrc = computed(() => showPassword.value ? eyeOpened : eyeClosed)

const hasError = computed(() => props.errorMessage && props.errorMessage.length > 0)

</script>

<style lang="scss" scoped>
.input-group {
  &.locked {
    input {
      background-color: #ECECEC;
      border-color: #CCCCCC;
      color: $black-900;
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

.model-box {
  width: 100%;
  height: 40px;
  padding: 10px;
  border: 1px solid $black-500;
  border-radius: 8px;
  font-size: 14px;
  background-color: $black-300;
  color: $black-900;
}

.input-with-icon {
  position: relative;
  .model-box-password{
    width: 100%;
    padding: 10px;
    border: 1px solid $black-500;
    border-radius: 8px;
    font-size: 14px;
    background-color: $black-300;
    min-height: 40px;
  }
}

.icon {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #aaa;
}

.error .model-box,
.error .model-box-password {
  border-color: red;
}

.error-message {
  color: red;
  margin-top: 5px;
  font-size: 12px;
}

</style>