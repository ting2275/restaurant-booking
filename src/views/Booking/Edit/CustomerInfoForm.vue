<template>
  <div class='booking-content'>
    <p class='subtitle'>預訂資訊</p>
    <div class='row row-inline review-info'>
      <div class='review-item' >
        <img src='@/assets/images/icons/calender.svg' alt='日期'>
        <span>{{ reservationWeekday }}，{{ reservationFormattedDate }}</span>
      </div>
      <div class='review-item' >
        <img src='@/assets/images/icons/time.svg' alt='時間'>
        <span>{{ getProps.data.partyTime }}</span>
      </div>
      <div class='review-item' >
        <img src='@/assets/images/icons/user-small.svg' alt='人數'>
        <span>{{ getProps.data.effectivePartySize }}人，{{ getProps.data.tableLabel }}</span>
      </div>
    </div>
    <p class='subtitle'>顧客資訊</p>
    <div class='inputs-group'>
      <div class='row row-double'>
        <BaseInput
          v-model='familyNameInput.model' :label='familyNameInput.label'
          :type='familyNameInput.type' :placeholder='familyNameInput.placeholder' :locked='familyNameInput.locked'
          :error-message='familyNameInput.errorMessage' />
        <BaseInput
          v-model='givenNameInput.model' :label='givenNameInput.label'
          :type='givenNameInput.type' :placeholder='givenNameInput.placeholder' :locked='givenNameInput.locked'
          :error-message='givenNameInput.errorMessage' />
      </div>
      <template v-if='phoneNumber'>
        <PhoneInput
          v-model='phoneInput.model' :label='phoneInput.label'
          :locked='phoneInput.locked' :error-message='phoneInput.errorMessage' />
      </template>
      <BaseInput
        v-model='emailInput.model' :label='emailInput.label'
        :type='emailInput.type' :placeholder='emailInput.placeholder' :locked='emailInput.locked'
        :error-message='emailInput.errorMessage' />
      <div class='textarea-box'>
        <label>特殊需求</label>
        <textarea v-model='specialInfo' placeholder='請輸入顧客特殊需求' disabled='true' name='' rows='5' />
      </div>
      <div class='textarea-box'>
        <label>店家備註</label>
        <textarea v-model='shopkeeperInfo' placeholder='請輸入店家備註' name='' rows='5' />
      </div>
    </div>
  </div>
  <teleport v-if='showTeleport' to='#edit-popup-footer-root'>
    <BaseButton
      :variant='prevButton.variant' :size='prevButton.size'
      :disabled='prevButton.disabled'
      @on-click='prevButton.buttonAction'>
      {{ prevButton.label }}
    </BaseButton>
    <BaseButton
      :variant='saveButton.variant' :size='saveButton.size'
      :disabled='saveButton.disabled'
      @on-click='saveButton.buttonAction'>
      {{ saveButton.label }}
    </BaseButton>
  </teleport>
</template>

<script setup>
import { computed, ref, reactive, onMounted, onActivated, onDeactivated } from 'vue'
import { useFormat } from '@/composables/useFormat'
const { formatWeekday, formatDateLocale } = useFormat();
const props = defineProps({
  onRequestProps: {
    type: Function,
    required: true
  }
})
// 向父層請求所需的 props
const requiredProps = ['data','ineditible','saveButtonStatus']
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
const familyNameInput = reactive({ model: familyName, label: '姓氏', locked: true })

const givenName = ref('')
const givenNameInput = reactive({ model: givenName, label: '名字', locked: true })

const phoneNumber = ref('');
const phoneInput = ref({  model: phoneNumber, label: '電話', type: 'phone', locked: true })

const customerEmail = ref('')
const emailInput = reactive({ model: customerEmail, label: 'Email', type: 'email', locked: true })

const specialInfo = ref('')
const shopkeeperInfo = ref('')

// 按鈕設定值
const prevButton = ref({ variant: 'cancel', size: 'md', label: '上一步', buttonAction: () => clickPrevButton() });
const saveButton = computed(() => ({ variant: 'check', size: 'md', label: '確認', buttonAction: () => clickSaveButton(), disabled: getProps.value.saveButtonStatus }));

// ------------- 提交本頁面 更新顧客資訊 -------------
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
  await doneCustomerInfoForm()
  emit('click:save-button',customerInfoData.value)
}


// 初始化
onMounted(()=>{
  setCustomerInfo()
})
const showTeleport = ref(true)
// 每次進入畫面時顯示 teleport
onActivated(() => showTeleport.value = true)
// 每次離開畫面時銷毀 teleport
onDeactivated(() => showTeleport.value = false)

// 帶入訂單初始資料
const setCustomerInfo = () => {
  familyName.value = getProps.value.data.familyName
  givenName.value = getProps.value.data.givenName
  phoneNumber.value = getProps.value.data.telephone
  customerEmail.value = getProps.value.data.email
  specialInfo.value = getProps.value.data.specialInfo
  shopkeeperInfo.value = getProps.value.data.shopkeeperInfo
}
</script>

<style lang="scss" scoped>
  @use '@/assets/scss/pages/booking/_add_edit.scss';
</style>

