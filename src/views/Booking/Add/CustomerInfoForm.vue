<template>
  <div class='booking-content'>
    <p class='subtitle'>預訂資訊</p>
    <div class='row row-inline review-info'>
      <div class='review-item'>
        <img src='@/assets/images/icons/calender.svg' alt='日期'>
        <span>{{ reservationWeekday }}，{{ reservationFormattedDate }}</span>
      </div>
      <div class='review-item'>
        <img src='@/assets/images/icons/time.svg' alt='時間'>
        <span>{{ getProps.data.partyTime }}</span>
      </div>
      <div class='review-item'>
        <img src='@/assets/images/icons/user-small.svg' alt='人數'>
        <span>{{ getProps.data.effectivePartySize }}人，{{ getProps.data.tableLabel }}</span>
      </div>
    </div>
    <p class='subtitle'>顧客資訊</p>
    <div class='inputs-group'>
      <div class='row row-double'>
        <BaseInput
          v-model='familyNameInput.model' :label='familyNameInput.label'
          :type='familyNameInput.type' :placeholder='familyNameInput.placeholder' :locked='familyNameInput.locked' :error-message='familyNameInput.errorMessage' :required='familyNameInput.required' />
        <BaseInput
          v-model='givenNameInput.model' :label='givenNameInput.label'
          :type='givenNameInput.type' :placeholder='givenNameInput.placeholder' :locked='givenNameInput.locked' :error-message='givenNameInput.errorMessage' :required='givenNameInput.required' />
      </div>
      <template v-if='phoneNumber || documentReady'>
        <PhoneInput
          v-model='phoneInput.model' :label='phoneInput.label'
          :locked='phoneInput.locked' :error-message='phoneInput.errorMessage' :required='phoneInput.required' @update:error-message='updatePhoneErrorMessage' />
      </template>
      <BaseInput
        v-model='emailInput.model' :label='emailInput.label'
        :type='emailInput.type' :placeholder='emailInput.placeholder' :locked='emailInput.locked' :error-message='emailInput.errorMessage' />
      <div class='textarea-box'>
        <label>特殊需求</label>
        <textarea v-model='specialInfo' placeholder='請輸入顧客特殊需求' name='' rows='5' />
      </div>
      <div class='textarea-box'>
        <label>店家備註</label>
        <textarea v-model='shopkeeperInfo' placeholder='請輸入店家備註' name='' rows='5' />
      </div>
    </div>
  </div>
  <teleport v-if='showTeleport' to='#add-popup-footer-root'>
    <BaseButton
      :variant='prevButton.variant' :size='prevButton.size'
      @click='prevButton.buttonAction'>
      {{ prevButton.label }}
    </BaseButton>
    <BaseButton
      :variant='saveButton.variant' :size='saveButton.size'
      :disabled='saveButton.disabled' @click='saveButton.buttonAction'>
      {{ saveButton.label }}
    </BaseButton>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onActivated, onDeactivated } from 'vue'
import { useFormat } from '@/composables/useFormat'
const { formatWeekday, formatDateLocale } = useFormat()

defineOptions({
  name: 'CustomerInfoForm'
})
const props = defineProps({
  onRequestProps: {
    type: Function,
    required: true
  }
})
// 向父層請求所需的 props
const requiredProps = ['data', 'saveButtonStatus']
const getProps = computed(()=>props.onRequestProps(requiredProps))
// 向父層傳遞事件
const emit = defineEmits(['click:prev-button','click:save-button'])

// ------------- 上半部 (預訂資訊) -------------
// 定義props進來的預訂資訊
const reservationWeekday = computed(() => formatWeekday(getProps.value.data.partyDate))
const reservationFormattedDate = computed(() => formatDateLocale(getProps.value.data.partyDate,false))

// ------------- 下半部 (顧客資訊) -------------
// 輸入框設定值
const familyName = ref('')
const familyNameInput = ref({ model: familyName, label: '姓氏', placeholder: '請輸入顧客姓氏', locked: false, required: true, errorMessage: '' })

const givenName = ref('')
const givenNameInput = ref({ model: givenName, label: '名字', placeholder: '請輸入顧客名字', locked: false, required: true, errorMessage: '' })

const phoneNumber = ref('');
const phoneInput = ref({ model: phoneNumber, label: '電話', type: 'phone', locked: false, required: true})
const updatePhoneErrorMessage = message => phoneInput.value.errorMessage = message

const customerEmail = ref('')
const emailInput = ref({ model: customerEmail, label: 'Email', type: 'email', placeholder: '請輸入顧客Email', locked: false, required: false, errorMessage: '' })

const specialInfo = ref('')
const shopkeeperInfo = ref('')


// 按鈕設定值
const prevButton = ref({ variant: 'cancel', size: 'md', label: '上一步', buttonAction: () => clickPrevButton() });
const saveButton = ref({ variant: 'check', size: 'md', label: '確認', buttonAction: () => clickSaveButton() , disabled: getProps.value.saveButtonStatus });

// ------------- 提交本頁面 更新顧客資訊 -------------
// 欄位驗證
import { useCheckBookingForm } from '@/composables/common/useFormValidation.js'
const {
  clearErrorMessage,
  checkInputs
} = useCheckBookingForm()
let checkInputList = [familyNameInput, givenNameInput, phoneInput, emailInput]

// 顧客資訊
const customerInfoData = ref({})
const doneCustomerInfoForm = async () => {
  customerInfoData.value = {
    familyName: familyName.value,
    givenName: givenName.value,
    telephone: phoneNumber.value,
    email: customerEmail.value,
    specialInfo: specialInfo.value,
    shopkeeperInfo: shopkeeperInfo.value
  }
}

const clickPrevButton = async () => {
  await doneCustomerInfoForm()
  emit('click:prev-button',customerInfoData.value)
}

const clickSaveButton = async () => {
  checkInputList.forEach(input => clearErrorMessage(input.value))
  if (!checkInputs(checkInputList)) return
  await doneCustomerInfoForm()
  emit('click:save-button',customerInfoData.value)
}

// 初始化
const documentReady = ref(false)
onMounted(()=>{
  nextTick(()=>documentReady.value = true)
})
const showTeleport = ref(true)
// 每次進入畫面時顯示 teleport
onActivated(() => showTeleport.value = true)
// 每次離開畫面時銷毀 teleport
onDeactivated(() => showTeleport.value = false)
</script>

<style lang="scss" scoped>
  @use '@/assets/scss/pages/booking/_add_edit.scss';
</style>
