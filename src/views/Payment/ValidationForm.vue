<template>
  <div class='payment-container'>
    <div class='payment-box'>
      <div class='logo'>
        <img src='@/assets/images/resources/logo.svg' alt='Restaurant Booking' />
      </div>
      <div class='payment-box-info'>
        <p class='description'>親愛的顧客您好，請輸入驗證資料並確認購買金額</p>
        <div class='total-amount'>NT${{ paymentInfo.formatAmount }}</div>
      </div>
      <div class='payment-box-content'>
        <div class='divider dashed'></div>
        <div class='input-group'>
          <BaseInput v-model='idNumberInput.model' :label='idNumberInput.label' :placeholder='idNumberInput.placeholder' :type='idNumberInput.type' :maxlength='idNumberInput.maxlength' :required='idNumberInput.required' :error-message='idNumberError' @input='validateIdNumber' />
        </div>
        <div class='divider dashed'></div>
        <div class='payment-solution'>
          <span class='label'>購買方案</span>
          <div class='plan'>{{ paymentInfo.planDescription }}</div>
        </div>
        <div class='payment-method'>
          <div class='label'>
            <span v-if='paymentMethodInput.required' class='required'>*</span>
            {{ paymentMethodInput.label }}
          </div>
          <div class='method-options'>
            <RadioBox
              v-for='option in paymentMethodInput.options'
              :id='option.value'
              :key='option.value'
              v-model='selectedPayment'
              :for-name="'payment'"
              :value='option.value'
            >
              {{ option.label }}
            </RadioBox>
          </div>
          <p v-if='paymentMethodError' class='error-message'>{{ paymentMethodError }}</p>
        </div>
        <div class='divider line'></div>
        <div class='amount-confirm'>
          <span class='label'>金額確認</span>
          <span class='amount'>NT${{ paymentInfo.formatAmount }}</span>
        </div>
        <div class='confirm-check'>
          <CheckBox
            id='acceptTerms'
            v-model='acceptTerms'
            :for-name="'terms'"
            :value='true'
            @change='validateConfirmation'
          >
            <span class='required'>*</span>
            我已確認資料皆正確，且購買完成後無法取消此交易。
          </CheckBox>
          <p v-if='confirmationError' class='error-message'>{{ confirmationError }}</p>
        </div>
      </div>
      <BaseButton
        class='next-button btn-lg'
        :disabled='!isFormValid'
        @on-click='onSubmit'
      >
        下一步
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, defineEmits } from 'vue';
import { useIdValidator } from '@/composables/utilities/useIdValidator';

const props = defineProps({
  paymentInfo: {
    type: Object,
    required: true
  },
  isFormSubmitAvailable: {
    type: Boolean,
    required: true
  }
});
const emit = defineEmits(['form-submit']);

// 資料驗證流程
const idNumber = ref('');
const idNumberError = ref('');
const idNumberInput = reactive({ model: idNumber, label: '身分證字號/統一編號', type: 'text', placeholder: '請輸入身分證字號或統一編號', maxlength: 10, required: true });

const { isValidIdOrGUI } = useIdValidator();

const validateIdNumber = () => {
  if (!idNumber.value) {
    idNumberError.value = '請輸入身分證字號/統一編號';
    return false;
  }
  if (!isValidIdOrGUI(idNumber.value)) {
    idNumberError.value = '身分證字號或統一編號格式錯誤';
    return false;
  }
  idNumberError.value = '';
  return true;
};

const selectedPayment = ref('');
const paymentMethodInput = reactive({
  model: selectedPayment,
  label: '付款方式',
  type: 'radio',
  options: [
    { label: '匯款', value: 'paymentATM' },
    { label: '信用卡', value: 'paymentCard' }
  ],
  required: true
});

const acceptTerms = ref(false);

const validatePaymentMethod = () => {
  if (!selectedPayment.value) {
    paymentMethodError.value = '請選擇付款方式';
    return false;
  }
  paymentMethodError.value = '';
  return true;
};

const validateConfirmation = () => {
  if (!acceptTerms.value) {
    confirmationError.value = '請確認同意付款';
    return false;
  }
  confirmationError.value = '';
  return true;
};

const paymentMethodError = ref('');
const confirmationError = ref('');

const isFormValid = computed(() => {
  return idNumber.value &&
         selectedPayment.value &&
         acceptTerms.value &&
         !idNumberError.value &&
         !paymentMethodError.value &&
         !confirmationError.value &&
         props.isFormSubmitAvailable;
});

const onSubmit = () => {
  if (!validateIdNumber() || !validatePaymentMethod() || !validateConfirmation()) {
    return;
  }
  emit('form-submit', {
    buyerIdentifier: idNumber.value,
    payType: selectedPayment.value
  });
};
</script>

<style lang='scss' scoped>
@use '@/assets/scss/pages/payment/_common.scss' as *;
</style>
