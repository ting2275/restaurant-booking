<template>
  <div class='phoneInputBox' :class="{ 'disabled': locked, error: hasError }" >
    <label v-if='label'>
      <span v-if='required' class='required'>*</span>
      {{ label }}
    </label>
    <v-phone-input
      ref='phoneInput'
      v-model='phone'
      country-icon-mode='svg'
      display-format='significant'
      autocomplete='off'
      placeholder='請輸入電話號碼'
    />
    <!-- :invalid-message='invalidMessage' -->
    <div v-if='hasError' class='error-message'>
      {{ errorMessage }}
    </div>
  </div>
</template>


<script setup>
import { ref,computed,watch,defineProps, defineEmits, onMounted} from 'vue';
import { makePhone } from 'v-phone-input';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
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
  }
});

const emit = defineEmits(['update:modelValue','update:errorMessage']);
const phone = ref(props.modelValue);
const invalidMessage = ref('');
const formatPhoneNumber = ref('')
const hasError = computed(() => {
  return (props.errorMessage && props.errorMessage.length > 0) || (invalidMessage.value && invalidMessage.value.length > 0)
})

onMounted(() => {
  const inputElement = document.querySelector('.v-phone-input input');
  if (inputElement) {
    inputElement.placeholder = '請輸入國家名稱';
  }
});

// 解構電話號碼
const deconstructPhone = (phone) => {
  const validNumber = makePhone(phone);
  return {
    countryCode: validNumber.countryCode || '',
    phoneNumber: validNumber.number.significant || '',
    valid: validNumber.valid || false
  }
}

watch(phone, (newValue) => {
  const {countryCode, phoneNumber, valid} = deconstructPhone(newValue);
  formatPhoneNumber.value = '+' + countryCode + ' ' + phoneNumber

  // 檢查號碼有沒有合規定
  invalidMessage.value = valid ? '' : '電話號碼格式無效';
  emit('update:modelValue', formatPhoneNumber.value);
  emit('update:errorMessage',invalidMessage.value)
});
</script>

<style lang="scss" scoped>
label {
  display: block;
  margin-bottom: 10px;
  color: $black-900;
  @extend .body2;
}

.required {
  color: red;
}

.error .v-phone-input {
  outline: 1px solid red;
  border-radius: 8px;
}

.error-message {
  color: red;
  margin-top: 5px;
  font-size: 12px;
}


.disabled {
  pointer-events: none;
  .v-phone-input {
    position: relative;
    &::before {
      z-index: 1;
      content: '';
      position: absolute;
      top: 1px;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.07);
      z-index: 1;
      height: 40px;
      border-radius: 8px;
    }
  }
}

:deep(*) {
  padding: 0;
  margin: 0;
  min-height: 0;
}


</style>



