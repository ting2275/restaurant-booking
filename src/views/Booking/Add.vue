<template>
  <PlainPopUp ref='addRef' v-model='isAddPopupVisible' card-size='lg'>
    <template #title>新增預訂</template>
    <!-- 內容 -->
    <template v-if='currentStep === 1' #content>
      <div class='booking-content'>
        <p class='subtitle'>預訂內容</p>
        <div class='row row-triple'>
          <div>
            <label for='selectedPeople'>人數</label>
            <DropdownMenu
              id='selectedPeople' :key='selectedPeople' v-model='selectedPeople' :options='peopleOptions'
              label-key='label' value-key='value' placeholder='無可選人數' :is-searchable='false' :is-readonly='true' :is-disabled='isPeopleOptionsEmpty' />
          </div>
          <div>
            <label>日期</label>
            <InputDatePicker
              :initial-date='selectedDate' :date-classes='props.dateClasses' :max-range-past='0'
              :max-range-future='89' @input-date-change='handleDateChangeInput' />
          </div>
          <div>
            <label for='selectedTime'>時間</label>
            <DropdownMenu
              id='selectedTime' :key='selectedTime' v-model='selectedTime' :options='timeOptions'
              label-key='label' value-key='value' placeholder='無可選時段' :is-searchable='false' :is-readonly='true' :is-disabled='isBusinessTimeEmpty' />
          </div>
        </div>
        <template v-if='isBusinessTimeEmpty'>
          <div class='warning-box'>
            <img src='@/assets/images/icons/warning.svg' alt='提示公休日'> 本日無可選時段。
          </div>
        </template>
        <template v-else>
          <div>
            <label>桌型</label>
            <div class='button-group button-group-party'>
              <BaseButton
                v-for='btn in availablePartyList' :key='btn.partySize' :variant='btn.variant' size='sm'
                @click='updateSelectedParty(btn.partySize)'>
                {{ btn.partySize }}人桌
              </BaseButton>
            </div>
          </div>
          <div class='available-time'>
            <label>預訂時段</label>
            <div v-if='isAllFull'>
              <img src='@/assets/images/icons/warning.svg' alt='提示該區間客滿'> {{ allFullMessage }}
            </div>
            <div v-else class='button-group button-group-time'>
              <BaseButton
                v-for='btn in availableTimeList' :key='btn.time' :variant='btn.variant' size='md'
                :class="btn.class || ''" @click='updateSelectedTime(btn.date,btn.time)'>
                {{ btn.time }}
              </BaseButton>
            </div>
          </div>
          <div class='available-tables'>
            <label>桌號</label>
            <DropdownMenu
              id='selectedTableId' :key='selectedTableId' v-model='selectedTableId' :options='tableOptions'
              label-key='label' value-key='value' placeholder='請先選擇桌型與預訂時段' :is-searchable='false' :is-readonly='true' :is-disabled='!hasPartyAndTimeSelected' @dropdown-open='scrollToBottom' @update:model-value='updateSelectedTable'/>
          </div>
        </template>
      </div>
    </template>
    <template v-else-if='currentStep === 2' #content>
      <div class='booking-content'>
        <p class='subtitle'>預訂資訊</p>
        <div class='row row-inline review-info'>
          <div class='review-item'>
            <img src='@/assets/images/icons/calender.svg' alt='日期'>
            <span>{{ reservationWeekday }}，{{ reservationFormattedDate }}</span>
          </div>
          <div class='review-item'>
            <img src='@/assets/images/icons/time.svg' alt='時間'>
            <span>{{ selectedAvailableTime }}</span>
          </div>
          <div class='review-item'>
            <img src='@/assets/images/icons/user-small.svg' alt='人數'>
            <span>{{ selectedPeople }}人，{{ selectedTableLabel }}</span>
          </div>
        </div>
        <p class='subtitle'>顧客資訊</p>
        <div class='input-group'>
          <div class='row row-double'>
            <BaseInput
              v-model='familyNameInput.model' :label='familyNameInput.label'
              :type='familyNameInput.type' :placeholder='familyNameInput.placeholder' :locked='familyNameInput.locked' :error-message='familyNameInput.errorMessage' :required='familyNameInput.required' />
            <BaseInput
              v-model='givenNameInput.model' :label='givenNameInput.label'
              :type='givenNameInput.type' :placeholder='givenNameInput.placeholder' :locked='givenNameInput.locked' :error-message='givenNameInput.errorMessage' :required='givenNameInput.required' />
          </div>
          <PhoneInput
            v-model='phoneInput.model' :label='phoneInput.label'
            :locked='phoneInput.locked' :error-message='phoneInput.errorMessage' :required='phoneInput.required' @update:error-message='updatePhoneErrorMessage' />
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
    </template>
    <!-- 按鈕 -->
    <template v-if='currentStep === 1' #buttons>
      <BaseButton
        :variant='cancelButton.variant' :size='cancelButton.size'
        @click='cancelButton.buttonAction'>
        {{ cancelButton.label }}
      </BaseButton>
      <BaseButton
        :variant='nextButton.variant' :size='nextButton.size' @click='nextButton.buttonAction'>
        {{ nextButton.label }}
      </BaseButton>
    </template>
    <template v-else-if='currentStep === 2' #buttons>
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
    </template>
  </PlainPopUp>
  <CheckReservePopUp v-model='isPopupVisible'>
    <template #title>已新增預訂資料</template>
    <template #reserve-date>{{ currentPopupContent.formattedDate }}</template>
    <template #reserve-info>{{ currentPopupContent.familyName }}{{ currentPopupContent.givenName }}，{{
      currentPopupContent.effectivePartySize }}位，{{ currentPopupContent.partyTime }}</template>
    <template #button>
      <BaseButton variant='check' size='md' @click='currentPopupContent.buttonAction'>
        我知道了
      </BaseButton>
    </template>
  </CheckReservePopUp>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { addBookingInfo } from '@/services/api/booking'
import { useFormat } from '@/composables/useFormat'
const { formatWeekday, formatDateLocale } = useFormat();
const emit = defineEmits(['update:visible', 'update:reservation-list', 'action:turn-page']);
const props = defineProps({
  visible: {
    type: Boolean,
    required: false
  },
  shopInfo: {
    type: Object,
    required: true
  },
  dateClasses: {
    type: Object,
    default: () => ({}),
  },
  selectedDateOuter: {
    type: String,
    required: true
  }
})

// for mapping api and components params
const matchButtonVariants = {
  'true': 'secondary',
  'false': 'not-open'
}


// 當前步驟
const currentStep = ref(1)

//選擇人數(下拉)
import { usePeopleOptions } from '@/composables/modules/booking/useBookingForm.js'
const {
  peopleOptions,
  isPeopleOptionsEmpty,
  selectedPeople,
  getDefaultPeople
} = usePeopleOptions(props.shopInfo)

//選擇日期(下拉)
import { useDateOptions } from '@/composables/modules/booking/useBookingForm.js'
const {
  businessTime,
  selectedDate,
  isBusinessTimeEmpty,
  handleDateChangeInput
} = useDateOptions( new Date(props.selectedDateOuter).toISOString().split('T')[0] )

//選擇時間(下拉)
import { useTimeOptions } from '@/composables/modules/booking/useBookingForm.js'
const {
  selectedTime,
  timeOptions,
  getNextAvailableTime
} = useTimeOptions(props.shopInfo, businessTime)
watch(businessTime, newVal => {
  if (newVal.length === 0) return
  selectedTime.value = getNextAvailableTime()
} )

const dateTime = computed(() => {
  return (selectedDate.value && selectedTime.value) ? `${selectedDate.value} ${selectedTime.value}` : undefined // 中間空格不能刪
})

const selectedAvailableDateTime = computed(() => {
  return selectedAvailableTime.value ? `${reservationDate.value} ${selectedAvailableTime.value}` : undefined // 中間空格不能刪
})

// 監聽人數、日期、時間任一變更，重新取得可預訂時段
watch([selectedPeople, selectedDate, selectedTime], async ([newPeople, newDate, newTime]) => {
  if (!newPeople || !newDate || newDate === 'Invalid date' || !newTime) return
  if (!isAddPopupVisible.value) return
  await getAvailablePartyList(dateTime.value, newPeople)
  updateSelectedParty(availablePartyList.value[0].partySize) // [預設] 選取最靠近所選人數的桌次 = 選第一桌
  selectedAvailableTime.value = ''
})

// 取得可預訂桌型
import { useAvailablePartyList } from '@/composables/modules/booking/useBookingForm.js'
const {
  availablePartyList,
  getAvailablePartyList
} = useAvailablePartyList()

// 取得可預訂時段
import { useAvailableTimeList } from '@/composables/modules/booking/useBookingForm.js'
const {
  availableTimeList,
  isAllFull,
  allFullMessage,
  getAvailableTimeList
} = useAvailableTimeList()

// 取得可預訂桌號
import { useAvailableTablesList } from '@/composables/modules/booking/useBookingForm.js'
const {
  tableOptions,
  getAvailableTablesList
} = useAvailableTablesList()

const hasPartyAndTimeSelected = computed(() => selectedAvailableParty.value && selectedAvailableTime.value)

const selectedAvailableParty = ref('') // 被選擇的桌型
const selectedAvailableTime = ref('') // 被選擇的時段
const selectedTableId = ref(0) // 被選擇的桌次

const reservationDate = ref('')
const reservationWeekday = computed(() => formatWeekday(reservationDate.value))
const reservationFormattedDate = computed(() => formatDateLocale(reservationDate.value,false))

// 點選桌型按鈕
const updateSelectedParty = async partySize => {
  selectedAvailableParty.value = partySize
  updateSelectedPartyColor(partySize)
  await getAvailableTimeList(dateTime.value, partySize)
  selectedAvailableTime.value = ''
  selectedTableId.value = 0
}
const updateSelectedPartyColor = partySize => {
  availablePartyList.value.forEach(item => {
    item.variant = (item.partySize === partySize) ? 'check' : matchButtonVariants[item.available];
  });
}

// 點選時段按鈕
const updateSelectedTime = async (date,time) => {
  selectedAvailableTime.value = time
  reservationDate.value = date
  updateSelectedTimeColor(time)
  await getAvailableTablesList(selectedAvailableDateTime.value, selectedAvailableParty.value)
  updateSelectedTable(0)
}
const updateSelectedTimeColor = time => {
  availableTimeList.value.forEach(item => {
    item.variant = (item.time === time) ? 'check' : matchButtonVariants[item.available];
  });
}

// 點選桌號選單
const addRef = ref(null)
const selectedTableLabel = ref('')
const scrollToBottom = () => addRef.value?.scrollToBottom()
const updateSelectedTable = (tableId) => {
  selectedTableId.value = tableId
  selectedTableLabel.value = tableOptions.value.find(item => item.value === tableId)?.label || '查無桌號'
}

// 輸入框設定值
const familyName = ref('')
const familyNameInput = ref({ model: familyName, label: '姓氏', placeholder: '請輸入顧客姓氏', locked: false, required: true, errorMessage: '' })
const givenName = ref('')
const givenNameInput = ref({ model: givenName, label: '名字', placeholder: '請輸入顧客名字', locked: false, required: true, errorMessage: '' })

const phoneNumber = ref('');
const phoneInput = ref({ model: phoneNumber, label: '電話', type: 'phone', locked: false, required: true, errorMessage: '' })
const updatePhoneErrorMessage = massge => phoneInput.value.errorMessage = massge

const customerEmail = ref('')
const emailInput = ref({ model: customerEmail, label: 'Email', type: 'email', placeholder: '請輸入顧客Email', locked: false, required: false, errorMessage: '' })

const specialInfo = ref('')
const shopkeeperInfo = ref('')

import { useCheckBookingForm } from '@/composables/common/useFormValidation.js'
const {
  clearErrorMessage,
  checkInputs
} = useCheckBookingForm()

// 按鈕設定值
const cancelButton = ref({ variant: 'cancel', size: 'md', label: '取消', buttonAction: () => closeAddPopup() });
const prevButton = ref({ variant: 'cancel', size: 'md', label: '上一步', buttonAction: () => { currentStep.value-- } });
const nextButton = computed(() => ({
  variant: ((selectedAvailableTime.value !== '' && selectedAvailableParty.value !== '' && selectedTableId.value !== 0) ? 'check' : 'disabled'),
  // variant: ((selectedAvailableTime.value !== '' && selectedAvailableParty.value !== '') ? 'check' : 'disabled'), //測試用
  size: 'md',
  label: '下一步',
  buttonAction: () => { currentStep.value++ }
}));
const saveButton = ref({ variant: 'check', size: 'md', label: '確認', buttonAction: () => saveReservation() , disabled: false });
const toggleSaveButtonDisabled = value => saveButton.value.disabled = value

let checkInputList = [familyNameInput, givenNameInput, phoneInput, emailInput]

// 儲存預訂
const saveReservation = async () => {
  checkInputList.forEach(input => {
    clearErrorMessage(input.value)
  })
  if (!checkInputs(checkInputList)) return
  toggleSaveButtonDisabled(true)
  let savingData = {
    "email": customerEmail.value,
    "familyName": familyName.value,
    "givenName": givenName.value,
    "partySize": selectedAvailableParty.value,
    "telephone": phoneNumber.value,
    "effectivePartySize": selectedPeople.value,
    "partyDate": reservationDate.value,
    "partyTime": selectedAvailableTime.value,
    "specialInfo": specialInfo.value,
    "shopkeeperInfo": shopkeeperInfo.value,
    "tableId": selectedTableId.value
  }

  try {
    let result = await addBookingInfo(savingData)
    newCardId.value = result.bookingId
    closeAddPopup()
    showSuccessPopup(savingData)
    toggleSaveButtonDisabled(false)
  } catch (error) {
    console.error('Error save reservation:', error);
  } finally {
    toggleSaveButtonDisabled(false)
  }
}

// 彈窗內換頁
watch([currentStep],() => addRef.value?.scrollToTop())

// 彈窗相關
const isAddPopupVisible = ref(props.visible)
const closeAddPopup = () => {
  selectedAvailableTime.value = ''
  selectedAvailableParty.value = ''
  checkInputList.forEach((input) => clearErrorMessage(input.value))
  updateVisibility(false)
}
const updateVisibility = value => {
  isAddPopupVisible.value = value;
  emit('update:visible', value); // 通知父層更新
};

// 當父層開啟彈窗
watch(() => props.visible, async newVal => {
  isAddPopupVisible.value = newVal;
});

// 當子層關閉彈窗
watch(() => isAddPopupVisible.value, async newVal => {
  updateVisibility(newVal)
  if (newVal === true) {
    await resetDefault()
    await handleDateChangeInput(selectedDate.value)
    toggleSaveButtonDisabled(false)
    if(dateTime.value) {
      await getAvailablePartyList(dateTime.value, selectedPeople.value)
      updateSelectedParty(availablePartyList.value[0].partySize)
    }
  } else {
    closeAddPopup()
  }
});

// 還原預設
const resetDefault = async () => {
  currentStep.value = 1
  selectedPeople.value = getDefaultPeople()
  selectedDate.value = new Date(props.selectedDateOuter).toISOString().split('T')[0];
  familyName.value = ''
  givenName.value = ''
  phoneNumber.value = ''
  customerEmail.value = ''
  specialInfo.value = ''
  shopkeeperInfo.value = ''
  selectedTableId.value = 0
}

// 成功彈窗
const isPopupVisible = ref(false)
const currentPopupContent = ref({});
const newCardId = ref(0) // 新增預訂後的卡片ID

import { usePageturn } from '@/composables/modules/reservationOverview/useReservationList.js'
const {
  checkTurnNextDay,
  getPrevDay
} = usePageturn()

// 跳轉頁面
const showSuccessPopup = savingData => {
  currentPopupContent.value = {
    ...savingData,
    formattedDate: formatDateLocale(savingData.partyDate),
    buttonAction: () => {
      isPopupVisible.value = false
      let isTurnNextDay = checkTurnNextDay(savingData.partyTime , props.shopInfo.closeTime)
      if (props.shopInfo.isOvernight && isTurnNextDay) {
        emit('action:turn-page', getPrevDay(savingData.partyDate), newCardId.value)
      } else {
        emit('action:turn-page', savingData.partyDate, newCardId.value)
      }
    }
  }
  isPopupVisible.value = true;
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/booking/_add_edit.scss' as *;
</style>