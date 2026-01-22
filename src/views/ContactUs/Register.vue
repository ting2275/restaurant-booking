<template>
  <div class='register-container'>
    <div class='register-box'>
      <div class='register-content'>
        <div class='content-box'>
          <div class='head'>
            <h4>聯絡我們</h4>
            <p>請留下您的聯絡資訊，我們將安排服務專員為您介紹產品和服務。</p>
          </div>
          <div class='step-box'>
            <div v-if='step === 1' class='step'>
              <div class='hero'>
                <img class='image' src='@/assets/images/resources/hero.jpg' alt='聯絡我們' />
              </div>
              <div class='step-data'>
                <form class='submit-form' @submit.prevent='goToNextStep'>
                  <BaseInput
                    v-model='formData.name'
                    label='姓名'
                    placeholder='請輸入您的姓名'
                    :error-message='errors.name'
                    :required='true'
                    label-class='custom-label'
                    @focusout="validateField('name')"
                  />
                  <div class='select-group' :class="{'error': errors.gender}">
                    <label class='custom-label' for='gender'>
                      稱謂
                    </label>
                    <div class='custom-dropdown'>
                      <DropdownMenu
                        id='gender'
                        v-model='formData.gender'
                        :options='genderOptions'
                        label-key='label'
                        value-key='value'
                        :error-message='errors.gender'
                        :is-searchable='false'
                        :is-readonly='true'
                        @focusout='validateField("gender")'
                        @blur='validateField("gender")'
                      />
                    </div>
                  </div>
                  <div class='phone-input-group'>
                    <label class='custom-label'>
                      <span class='required'>*</span>
                      聯絡電話
                    </label>
                    <PhoneInput
                      v-model='formData.phone'
                      :required='true'
                      :error-message='errors.phone'
                      @update:error-message='updatePhoneErrorMessage'
                      @focusout="validateField('phone')"
                    />
                  </div>
                  <BaseInput
                    v-model='formData.email'
                    label='電子信箱'
                    placeholder='請輸入您的電子信箱'
                    :error-message='errors.email'
                    :required='true'
                    label-class='custom-label'
                    @focusout="validateField('email')"
                  />
                  <BaseInput
                    v-model='formData.shopName'
                    label='店家名稱'
                    placeholder='請輸入您的店家名稱'
                    :required='true'
                    label-class='custom-label'
                    :error-message='errors.shopName'
                    @focusout="validateField('shopName')"
                  />
                </form>
              </div>
            </div>
            <div v-else-if='step === 2' class='step'>
              <div class='step-data'>
                <form class='submit-form' @submit.prevent='submitForm'>
                  <div class='inputForm'>
                    <div class='select-group'>
                      <label class='custom-label' for='shopLocation'>
                        <span class='required'>*</span>
                        店家位置
                      </label>
                      <div class='custom-dropdown'>
                        <DropdownMenu
                          id='shopLocation'
                          v-model='formData.shopLocation'
                          :options='cityOptions'
                          label-key='label'
                          value-key='value'
                          :error-message='errors.shopLocation'
                          :is-searchable='false'
                          :is-readonly='true'
                          @focusout="validateField('shopLocation')"
                          @blur='validateField("shopLocation")'
                        />
                      </div>
                    </div>
                    <div class='select-group'>
                      <label class='custom-label' for='businessType'>
                        <span class='required'>*</span>
                        經營類型
                      </label>
                      <div class='custom-dropdown'>
                        <DropdownMenu
                          id='businessType'
                          v-model='formData.businessType'
                          :options='businessTypeOptions'
                          label-key='label'
                          value-key='value'
                          :error-message='errors.businessType'
                          @focusout="validateField('businessType')"
                          @blur='validateField("businessType")'
                        />
                      </div>
                    </div>
                  </div>
                  <div class='form-group'>
                    <label>
                      <span class='required'>*</span>
                      想了解的服務（可複選）
                    </label>
                    <div class='checkbox-container' @focusout='validateQuestionType'>
                      <div v-for='option in serviceOptions' :key='option.value'>
                        <CheckBox
                          :id='option.value'
                          v-model='formData.questionType'
                          :for-name="'questionType'"
                          :value='option.value'
                          :is-required='true'
                          :has-input='option.hasInput'
                          :input-placeholder='option.inputPlaceholder'
                          :input-value='inputValues[option.value]'
                          @update:input-value='(value) => handleInputChange(option.value, value)'
                          @change='validateQuestionType'
                        >
                          {{ option.label }}
                        </Checkbox>
                      </div>
                    </div>
                    <p v-if='errors.questionType' class='error-message'>未選擇</p>
                  </div>
                  <div class='form-group margin-top-16'>
                    <label>
                      <span class='required'>*</span>
                      可聯絡時間（可複選）
                    </label>
                    <div class='checkbox-container' @focusout='validateContactTime'>
                      <div v-for='option in contactTimeOptions' :key='option.value'>
                        <CheckBox
                          :id='option.value'
                          v-model='formData.contactTime'
                          :for-name="'contactTime'"
                          :value='option.value'
                          :is-required='true'
                          @update:input-value='(value) => handleInputChange(option.value, value)'
                          @change='validateContactTime'
                        >
                          {{ option.label }}
                        </Checkbox>
                      </div>
                    </div>
                    <p v-if='errors.contactTime' class='error-message'>未選擇</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div v-if='!showSuccessAlert' class='button-group'>
            <BaseButton v-if='step === 1' variant='cancel' size='lg' @click='cancel'>取消</BaseButton>
            <BaseButton v-else variant='cancel' size='lg' @click='previousStep'>上一步</BaseButton>
            <BaseButton :disabled='!isStepValid' variant='check' size='lg' @click='nextStep'>
              {{ step === 2 ? '完成' : '下一步' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
  <BasePopUp id='submitPopup' v-model='showSuccessAlert' :esc-button='false'>
    <template #title>填寫完成</template>
    <template #content>
      <div class='custom-style'>已收到您的聯絡資料，將安排服務專員在<span class='highlight'>3-5個工作天內</span>回覆您，感謝您的耐心等待。
      </div>
    </template>
    <template #button>
      <BaseButton variant='check' size='md' @click='goToLogin'>我知道了</BaseButton
      >
    </template>
  </BasePopUp>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePageMeta } from '@/router/config/setMeta'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
usePageMeta(route)
const router = useRouter()

const step = ref(1)
const showSuccessAlert = ref(false)
// const nameError = ref('')
// const emailError = ref('')

const formData = ref({
  name: '',
  gender: '',
  phone: '',
  // countryCode: '+886',
  email: '',
  shopLocation: '',
  shopName: '',
  businessType: '',
  questionType: [],
  contactTime: []
});

const errors = ref({
  name: '',
  gender: '',
  phone: '',
  email: '',
  shopLocation: '',
  shopName: '',
  businessType: '',
  questionType: '',
  contactTime: ''
});

const validateField = (field) => {
  if (field === 'phone') {
    if (!formData.value[field]) {
      errors.value[field] = `未填寫`;
    }
  } else if (field === 'shopLocation' || field === 'businessType') {
    if (!formData.value[field]) {
      errors.value[field] = `未選擇`;
    } else {
      errors.value[field] = '';
    }
  } else if (field === 'email') {
    if (!formData.value[field]) {
      errors.value[field] = `未填寫`;
    } else if (!validateEmail(formData.value[field])) {
      errors.value[field] = `信箱格式錯誤`;
    } else {
      errors.value[field] = '';
    }
  } else if (!formData.value[field] && field !== 'gender') {
    errors.value[field] = `未填寫`;
  } else {
    errors.value[field] = '';
  }
};

const updatePhoneErrorMessage = (message) => {
  let customMessage = message;
  if (message === '電話號碼格式無效') {
    customMessage = '電話格式錯誤';
  }
  errors.value.phone = customMessage;
}

const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

const inputValues = ref({
  其他: '',
});

const validateQuestionType = () => {
  if (formData.value.questionType.length === 0) {
    errors.value.questionType = '未選擇';
  } else {
    errors.value.questionType = '';
  }
}

const validateContactTime = () => {
  if (formData.value.contactTime.length === 0) {
    errors.value.contactTime = '未選擇';
  } else {
    errors.value.contactTime = '';
  }
}

import { genderOptions, cityOptions, businessTypeOptions, serviceOptions as rawServiceOptions, contactTimeOptions as rawContactTimeOptions } from '@/data/registerOptions.js';

const serviceOptions = ref(rawServiceOptions);
const contactTimeOptions = ref(rawContactTimeOptions);

function handleInputChange(optionValue, newValue) {
  inputValues.value[optionValue] = newValue;
}

const isStepValid = computed(() => {
  if (step.value === 1) {
    return (
      formData.value.name &&
      formData.value.phone &&
      formData.value.email &&
      !errors.value.email &&
      !errors.value.phone &&
      formData.value.shopName
    );
  } else if (step.value === 2) {
    return formData.value.shopLocation && formData.value.businessType && formData.value.questionType.length > 0 && formData.value.contactTime.length > 0;
  }
  return false;
});

const goToNextStep = () => {
  if (step.value === 1) {
    validateField('email')
    validateField('phone')
    if (!errors.value.email && !errors.value.phone) {
      step.value = 2
    }
  }
}

const previousStep = () => {
  if (step.value > 1) {
    step.value -= 1
  }
}

const nextStep = () => {
  if (step.value === 1) {
    goToNextStep()
  } else if (step.value === 2) {
    submitForm()
  }
}

import { useInitToken } from '@/composables/useInitToken';
import { register } from '@/services/api/register';
const { getInitToken } = useInitToken();

const formattedData = computed(() => {
  return {
    name: formData.value.name,
    gender: formData.value.gender,
    phone: formData.value.phone,
    email: formData.value.email,
    shopLocation: formData.value.shopLocation,
    shopName: formData.value.shopName,
    businessType: formData.value.businessType,
    questionType: formData.value.questionType.join(','),
    contactTime: formData.value.contactTime.join(',')
  };
});

const submitForm = async () => {
  if (!formData.value.gender) {
    formData.value.gender = '未選擇';
  }
  const otherOption = formData.value.questionType.includes('其他');
  const message = otherOption ? inputValues.value['其他'] : '';

  const formattedDataToSend = {
    ...formattedData.value,
    message: message,
  };
  try {
    const newToken = await getInitToken();
    if (!newToken) {
      console.error('獲取 Token 失敗');
      return;
    }
    const response = await register(formattedDataToSend);

    if (response && response.status === 'success') {
      showSuccessAlert.value = true;
    } else {
      console.error('提交失敗:', response.message);
    }
  } catch (error) {
    console.error('提交失敗:', error);
  }
}

const cancel = () => {
  router.push({ name: 'Login' })
}

const goToLogin = () => {
  router.push({ name: 'Login' })
}
</script>

<style lang="scss" scoped>
  @use '@/assets/scss/pages/contactUs/_common.scss' as *;

  :deep(.select-group) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }
  :deep(.input-group), :deep(.phone-input-group) {
    .error-message {
      text-indent: 100px;
    }
  }
  :deep(.input-wrap), :deep(.phone-input-wrap) {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 20px;
  }
  :deep(.custom-label) {
    width: 100%;
    max-width: 80px;
    margin: 0;
    display: block;
    @extend .body2;
  }
  :deep(.phone-input-group) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }
  :deep(.phone-input-group .error-message) {
    text-indent: 0;
  }
  :deep(.phoneInputBox) {
    flex: 1;
  }
  :deep(input.checkbox-input) {
    flex-grow: 1;
    border-bottom: 1px solid #ccc !important;
  }
  .custom-style {
    text-align: center;
    letter-spacing: 0.1em;
    padding: 0 20px;
  }
  .highlight {
    color: $primary;
  }
</style>