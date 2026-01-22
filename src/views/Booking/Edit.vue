<template>
  <PlainPopUp ref='editRef' v-model='isEditPopupVisible' card-size='lg' teleport-to='#popup-layer-2'>
    <template #title>編輯預訂</template>
    <!-- 內容 -->
    <template #content>
      <!-- v-bind='props' -->
      <component
        :is='ModeManager'
        :current-editing-data='currentEditingData'
        :shop-info='props.shopInfo'
        :date-classes='props.dateClasses'
        :editing-card-id='props.editingCardId'
      />
      <!-- 搬到BookingInfoForm Start -->
      <div v-show='editMode && editStep === 1' class='booking-content'>
        <p class='subtitle'>預訂內容</p>
        <div>
          <label>狀態</label>
          <DropdownMenu
            id='selectedStatus' :key='selectedStatus' v-model='selectedStatus' :options='statusOptions'
            label-key='label' value-key='value' placeholder='請選擇預訂狀態' :is-disabled='!editMode' />
        </div>
        <div class='row row-triple'>
          <div>
            <label for='selectedPeople'>人數</label>
            <DropdownMenu
              id='selectedPeople' :key='selectedPeople' v-model='selectedPeople' :options='peopleOptions'
              label-key='label' value-key='value' placeholder='無可選人數' :is-searchable='false' :is-readonly='true' :is-disabled='!editMode || ineditible || isPeopleOptionsEmpty' />
          </div>
          <div>
            <label>日期</label>
            <InputDatePicker
              :initial-date='selectedDate'
              :date-classes='props.dateClasses'
              :max-range-past='0'
              :max-range-future='89'
              :is-disabled='!editMode || ineditible'
              @input-date-change='handleDateChangeInput' />
          </div>
          <div>
            <label for='selectedTime'>時間</label>
            <DropdownMenu
              id='selectedTime' :key='selectedTime' v-model='selectedTime' :options='timeOptions'
              label-key='label' value-key='value' placeholder='無可選時段' :is-searchable='false' :is-readonly='true' :is-disabled='!editMode || ineditible || isBusinessTimeEmpty' />
          </div>
        </div>
        <template v-if='isBusinessTimeEmpty'>
          <div class='warning-box'>
            <img src='@/assets/images/icons/warning.svg' alt='提示公休日'>本日無可選時段。
          </div>
        </template>
        <template v-else>
          <div>
            <label>桌型</label>
            <div class='button-group button-group-party'>
              <BaseButton
                v-for='btn in availablePartyList' :key='btn.partySize' :variant='btn.variant' size='sm'
                @on-click='updateSelectedParty(btn.partySize)'>
                {{ btn.partySize }}人桌
              </BaseButton>
            </div>
          </div>
          <div v-if='!ineditible' class='available-time'>
            <label>預訂時段</label>
            <div v-if='isAllFull'>
              <img src='@/assets/images/icons/warning.svg' alt='提示該區間客滿'> {{ allFullMessage }}
            </div>
            <div v-else class='button-group button-group-time'>
              <BaseButton
                v-for='btn in availableTimeList' :key='btn.time' :variant='btn.variant' size='md'
                :class="(btn.class ? btn.class : '')" @on-click='updateSelectedTime(btn.date , btn.time)' >
                {{ btn.time }}
              </BaseButton>
            </div>
          </div>
          <div class='available-tables'>
            <label>桌號</label>
            <DropdownMenu
              id='selectedTableId' :key='selectedTableId' v-model='selectedTableId' :options='tableOptions'
              label-key='label' value-key='value' placeholder='請先選擇桌型與預訂時段' :is-searchable='false' :is-readonly='true' :is-disabled='!editMode || ineditible || !hasPartyAndTimeSelected' @dropdown-open='scrollToBottom' @update:model-value='updateSelectedTable' />
          </div>
        </template>
      </div>
      <!-- 搬到BookingInfoForm End -->
      <!-- 搬到CustomerInfoForm Start -->
      <div v-show='editMode && editStep === 2' class='booking-content'>
        <template v-if='editMode'>
          <p class='subtitle'>預訂資訊</p>
          <div class='row row-inline review-info'>
            <div class='review-item' >
              <img src='@/assets/images/icons/calender.svg' alt='日期'>
              <span>{{ reservationWeekday }}，{{ reservationFormattedDate }}</span>
            </div>
            <div class='review-item' >
              <img src='@/assets/images/icons/time.svg' alt='時間'>
              <span>{{ selectedAvailableTime }}</span>
            </div>
            <div class='review-item' >
              <img src='@/assets/images/icons/user-small.svg' alt='人數'>
              <span>{{ selectedPeople }}人，{{ selectedTableLabel }}</span>
            </div>
          </div>
        </template>
        <!-- 搬到CustomerInfoForm End -->
        <p class='subtitle'>顧客資訊</p>
        <div class='input-group'>
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
          <template v-if='phoneNumber && isEditPopupVisible'>
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
            <textarea v-model='shopkeeperInfo' placeholder='請輸入店家備註' :disabled='!editMode' name='' rows='5' />
          </div>
        </div>
      </div>
      <!-- 搬到CustomerInfoForm End -->
    </template>
    <!-- 按鈕 -->
    <template v-if='!editMode' #buttons>
      <BaseButton
        :variant='cancelButton.variant' :size='cancelButton.size'
        @on-click='cancelButton.buttonAction'>
        {{ cancelButton.label }}
      </BaseButton>
      <BaseButton
        :variant='editModeButton.variant' :size='editModeButton.size'
        :is-view-only='isViewOnly'
        @on-click='editModeButton.buttonAction'>
        {{ editModeButton.label }}
      </BaseButton>
    </template>
    <template v-else-if='editMode && editStep === 1' #buttons>
      <BaseButton
        :variant='backButton.variant' :size='backButton.size'
        @on-click='backButton.buttonAction'>
        {{ backButton.label }}
      </BaseButton>
      <BaseButton
        :variant='nextButton.variant' :size='nextButton.size'
        @on-click='nextButton.buttonAction'>
        {{ nextButton.label }}
      </BaseButton>
    </template>
    <template v-else-if='editMode && editStep === 2' #buttons>
      <BaseButton
        :variant='prevButton.variant' :size='prevButton.size'
        @on-click='prevButton.buttonAction'>
        {{ prevButton.label }}
      </BaseButton>
      <BaseButton
        :variant='saveButton.variant' :size='saveButton.size'
        :disabled='saveButton.disabled' @on-click='saveButton.buttonAction'>
        {{ saveButton.label }}
      </BaseButton>
    </template>
  </PlainPopUp>
  <CheckReservePopUp v-model='isStatusPopupVisible' :button-count='2' @update:model-value='disconfirm'>
    <template #title>要取消此筆預訂資料?</template>
    <template #reserve-date>{{ confirmReview.formattedDate }}</template>
    <template #reserve-info>
      {{ confirmReview.familyName }}{{ confirmReview.givenName }}，
      {{ confirmReview.effectivePartySize }}位，
      {{ confirmReview.partyTime }}
    </template>
    <template #reserve-tag>
      <TagReservationStatus :variant='confirmReview.reservationStatus'></TagReservationStatus>
    </template>
    <template #buttons>
      <BaseButton variant='cancel' size='md' @on-click='disconfirm(false)'>否</BaseButton>
      <BaseButton variant='check' size='md' @on-click='confirmStatus = true'>是</BaseButton>
    </template>
  </CheckReservePopUp>
  <CheckReservePopUp v-model='isPopupVisible'>
    <template #title>已更新預訂資料</template>
    <template #reserve-date>{{ currentPopupContent.formattedDate }}</template>
    <template #reserve-info>
      {{ currentPopupContent.familyName }}{{ currentPopupContent.givenName }}，
      {{ currentPopupContent.effectivePartySize }}位，
      {{ currentPopupContent.partyTime }}
    </template>
    <template #reserve-tag>
      <TagReservationStatus :variant='currentPopupContent.reservationStatus'></TagReservationStatus>
    </template>
    <template #button>
      <BaseButton variant='check' size='md' @on-click='currentPopupContent.buttonAction'>我知道了</BaseButton>
    </template>
  </CheckReservePopUp>
</template>
<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { getBookingInfo, updateBookingInfo } from '@/services/api/booking'
import { useFormat } from '@/composables/useFormat'
const { formatWeekday, formatDateLocale } = useFormat();
const emit = defineEmits(['update:visible', 'update:reservation-list','action:turn-page']);
const props = defineProps({
  visible: {
    type: Boolean,
    required: false
  },
  shopInfo: {
    type: Object,
    required: true
  },
  editingCardId: {
    type: Number,
    required: true
  },
  dateClasses: {
    type: Object,
    default: () => ({}),
  }
})


// 預覽
import Preview from './Edit/Preview.vue'
// 編輯
import FormManager from './Edit/FormManager.vue'

// 模式管理
const ModeManager = computed(() => editMode.value ? FormManager : Preview)

// for mapping api and components params
const matchButtonVariants = {
  'true': 'secondary',
  'false': 'not-open'
}


// 當前步驟
const editStep = ref(1)

// 取得卡片資料
const currentEditingData = ref({});
const fetchBookingInfo = async editingCardId => {
  try {
    const result = await getBookingInfo(editingCardId)
    currentEditingData.value = {
      ...result
    }
  } catch (error) {
    console.error('Error get BookingInfo:', error);
  }
}
// 帶入店家初始資料
const getDefaultBookingInfo = async cardId => {
  await fetchBookingInfo(cardId)
  originStatus.value = currentEditingData.value.reservationStatus
  selectedStatus.value = currentEditingData.value.reservationStatus
  selectedPeople.value = currentEditingData.value.effectivePartySize
  selectedDate.value = currentEditingData.value.partyDate
  selectedTableId.value = currentEditingData.value.tableId
  reservationDate.value = currentEditingData.value.partyDate
  selectedTime.value = currentEditingData.value.partyTime
  familyName.value = currentEditingData.value.familyName
  givenName.value = currentEditingData.value.givenName
  phoneNumber.value = currentEditingData.value.telephone
  customerEmail.value = currentEditingData.value.email
  specialInfo.value = currentEditingData.value.specialInfo
  shopkeeperInfo.value = currentEditingData.value.shopkeeperInfo
  selectedTableLabel.value = (selectedTableId.value !== 0) ? `${currentEditingData.value.tablePartySize}人桌 (${currentEditingData.value.tableName})` : '尚未指定桌號'
}


const editMode = ref(false)
// 不可異動狀態
const ineditible = computed(()=>['seated','NO_SHOW'].includes(originStatus.value))
const originStatus = ref('')

// 搬家 Start

// 選擇狀態(下拉)
const selectedStatus = ref('')
const allOptions = [
  { label: '新預訂', value: 'prepare' },
  { label: '已確認', value: 'CONFIRMED' },
  { label: '已入座', value: 'seated' },
  { label: '未出席', value: 'NO_SHOW' },
  { label: '已取消', value: 'CANCELED' }
]

const statusOptions = computed(() => {
  const statusMap = {
    prepare: ['prepare', 'CONFIRMED', 'seated', 'CANCELED'],
    CONFIRMED: ['CONFIRMED', 'seated', 'NO_SHOW', 'CANCELED'],
    seated: ['seated', 'CONFIRMED', 'NO_SHOW', 'CANCELED'],
    NO_SHOW: ['NO_SHOW', 'seated', 'CANCELED'],
    CANCELED: ['CANCELED']
  }
  return allOptions.filter(option => statusMap[originStatus.value]?.includes(option.value))
})


//選擇人數(下拉)
import { usePeopleOptions } from '@/composables/modules/booking/useBookingForm.js'
const {
  peopleOptions,
  isPeopleOptionsEmpty,
  selectedPeople
} = usePeopleOptions(props.shopInfo)

//選擇日期(下拉)
import { useDateOptions } from '@/composables/modules/booking/useBookingForm.js'
const {
  businessTime,
  selectedDate,
  isBusinessTimeEmpty,
  handleDateChangeInput
} = useDateOptions( currentEditingData.value.partyDate )

//選擇時間(下拉)
import { useTimeOptions } from '@/composables/modules/booking/useBookingForm.js'
const {
  selectedTime,
  timeOptions
} = useTimeOptions(props.shopInfo, businessTime)

watch(businessTime, (newVal) => {
  if (newVal.length === 0) return
  if (!newVal.includes(selectedTime.value)) {
    selectedTime.value = newVal[0] // 換日選取第一個時段
  }
})

// 當前日期時間
const dateTime = computed(() => {
  return (selectedDate.value && selectedTime.value) ? `${selectedDate.value} ${selectedTime.value}` : undefined // 中間空格不能刪
})

// 選取的日期時間
const selectedAvailableDateTime = computed(() => {
  return selectedAvailableTime.value ? `${reservationDate.value} ${selectedAvailableTime.value}` : undefined // 中間空格不能刪
})

// 監聽人數、日期、時間任一變更，重新取得可預訂時段
watch([selectedPeople, selectedDate, selectedTime], async ([newPeople, newDate, newTime]) => {
  if (!editMode.value) return
  if (!newPeople || !newDate || newDate === 'Invalid date' || !newTime) return
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

// 取得當前預訂桌型
const getDefaultParty = () => {
  const { tablePartySize, partySize } = currentEditingData.value
  availablePartyList.value = [{
    partySize: tablePartySize || partySize, // 當前訂單桌號容納人數
    variant: 'check',
    selected: true
  }]
  selectedAvailableParty.value = tablePartySize || partySize
}

// 取得可預訂時段
import { useAvailableTimeList } from '@/composables/modules/booking/useBookingForm.js'
const {
  availableTimeList,
  isAllFull,
  allFullMessage,
  getAvailableTimeList
} = useAvailableTimeList()

// 取得可預訂桌號(下拉)
import { useAvailableTablesList } from '@/composables/modules/booking/useBookingForm.js'
const {
  tableOptions,
  getAvailableTablesList
} = useAvailableTablesList()

const hasPartyAndTimeSelected = computed(() => selectedAvailableParty.value && selectedAvailableTime.value)

const getDefaultTable = () => {
  const { tablePartySize, tableName, tableId } = currentEditingData.value
  if(tablePartySize){
    tableOptions.value = [{
        label: `${tablePartySize}人桌 (${tableName})`, // 當前訂單桌號資訊
        value: tableId
    }]
  }
}

const selectedAvailableParty = ref(0) // 被選擇的桌型
const selectedAvailableTime = ref('') // 被選擇的時段
const selectedTableId = ref(0) // 被選擇的桌次

const reservationDate = ref('')
const reservationWeekday = computed(() => formatWeekday(reservationDate.value))
const reservationFormattedDate = computed(() => formatDateLocale(reservationDate.value,false))

// 點選桌型按鈕
const updateSelectedParty = async partySize => {
  if(!editMode.value || ineditible.value) return // 非編輯模式或不可編輯
  selectedAvailableParty.value = partySize
  updateSelectedPartyColor(partySize)
  await getAvailableTimeList(dateTime.value, partySize , props.editingCardId)
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
  await getAvailableTablesList(selectedAvailableDateTime.value, selectedAvailableParty.value , currentEditingData.value.tableId)
  selectedTableId.value = 0
}
const updateSelectedTimeColor = time => {
  availableTimeList.value.forEach(item => {
    item.variant = (item.time === time) ? 'check' : matchButtonVariants[item.available];
  });
}

// 點選桌號選單
const selectedTableLabel = ref('') // 被選擇的桌型+桌名 畫面顯示用
const updateSelectedTable = tableId => {
  selectedTableId.value = tableId
  selectedTableLabel.value = tableOptions.value?.find(item =>item.value === tableId)?.label || '查無桌號'
}
const scrollToBottom = () => editRef.value?.scrollToBottom()

// 搬家 End


// 檢查googleStatus狀態
import { useAccountStore } from '@/stores/accountStore';
const accountStore = useAccountStore();
const isViewOnly = ref(false);
const GOOGLE_STATUS = 8;
watch(
  () => accountStore.googleStatus,
  (newStatus) => {
    isViewOnly.value = newStatus === GOOGLE_STATUS;
  },
  { immediate: true }
);

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
const cancelButton = ref({ variant: 'cancel', size: 'md', label: '取消', buttonAction: () => closePopup() });
const backButton = ref({ variant: 'cancel', size: 'md', label: '返回', buttonAction: () => editModeHandler(false) });
const editModeButton = ref({ variant: 'check', size: 'md', label: '編輯', buttonAction: () => editModeHandler(true) });
const isBookingInfoCompleted = computed(() => (selectedAvailableTime.value !== '' && selectedAvailableParty.value !== '' && selectedTableId.value !== 0))
const nextButton = computed(() => {
  const isEnabled = (isBookingInfoCompleted.value || selectedStatus.value === 'CANCELED')
  return {
    variant: isEnabled ? 'check' : 'disabled',
    size: 'md',
    label: '下一步',
    buttonAction: () => editStep.value++
  }
})

const prevButton = ref({ variant: 'cancel', size: 'md', label: '上一步', buttonAction: () => editStep.value-- });
const saveButton = ref({ variant: 'check', size: 'md', label: '確認', buttonAction: () => saveReservation() , disabled: false });
const toggleSaveButtonDisabled = value => saveButton.value.disabled = value

// 儲存預訂
const saveReservation = async () => {
  toggleSaveButtonDisabled(true)
  let originData = {
    ...currentEditingData.value
  }
  let savingData = {
    "email": customerEmail.value,
    "reservationStatus": selectedStatus.value,
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
  if (selectedStatus.value === 'CANCELED'){
    await showStatusPopup(originData)
    isStatusPopupVisible.value = false
    confirmStatus.value = false
  }
  try {
    let bookingId = props.editingCardId
    await updateBookingInfo(bookingId, savingData)
    closePopup()
    if(selectedStatus.value !== 'CANCELED'){
      showSuccessPopup(savingData)
    }else{
      emit('update:reservation-list')
    }
  } catch (error) {
    console.error('Error update BookingInfo:', error);
  } finally {
    toggleSaveButtonDisabled(false)
  }
}

// 編輯模式
const editModeHandler = async value => {
  if (!dateTime.value) {
    editMode.value = false
    return
  }
  editMode.value = value
  const { tableId, tablePartySize, partyDate, partyTime } = currentEditingData.value
  if (value === false || ineditible.value) {
    // 關閉編輯模式還原預設 || 不可編輯(代入預設)
    await getDefaultBookingInfo(props.editingCardId)
    getDefaultParty()
    selectedAvailableTime.value = partyTime
    getDefaultTable()
  } else if( value === true && tableId === 0){
    // 開啟編輯模式 && 當前訂單桌號尚未指定
    await getAvailablePartyList(dateTime.value, selectedPeople.value) // 用實際用餐人數取得桌型列表
    await updateSelectedParty(availablePartyList.value[0].partySize) // 選取最靠近所選人數的桌次 = 選第一桌
    await updateSelectedTime(partyDate , partyTime)
  } else if (value === true) {
    // 開啟編輯模式 && 當前訂單桌號已指定
    await getAvailablePartyList(dateTime.value, selectedPeople.value) // 用實際用餐人數取得桌型列表
    await updateSelectedParty(tablePartySize) // 選取當前訂單桌號的容納人數
    await updateSelectedTime(partyDate , partyTime)
    updateSelectedTable(tableId) // 選取當前訂單桌號
  }
}

// 彈窗內換頁
const editRef = ref(null)
watch([editMode,editStep],() => editRef.value?.scrollToTop())


// 彈窗相關
const isEditPopupVisible = ref(props.visible)
const closePopup = () => {
  editStep.value = 1
  editMode.value = false
  updateVisibility(false)
}
const updateVisibility = (value) => {
  isEditPopupVisible.value = value;
  emit('update:visible', value); // 通知父層更新
};


// 當父層開啟彈窗
watch(() => props.visible, async newVal => {
  isEditPopupVisible.value = newVal;
});


// 當子層開關彈窗
watch(() => isEditPopupVisible.value, async newVal => {
  updateVisibility(newVal)
  if(newVal === true){
    await getDefaultBookingInfo(props.editingCardId)
    await handleDateChangeInput(selectedDate.value)
    toggleSaveButtonDisabled(false)
  }else{
    closePopup()
  }
});


// 成功彈窗
const isPopupVisible = ref(false)
const currentPopupContent = ref({});

import { usePageturn } from '@/composables/modules/reservationOverview/useReservationList.js'
const {
  checkTurnNextDay,
  getPrevDay
} = usePageturn()

// 跳轉頁面
const showSuccessPopup = (savingData) => {
  currentPopupContent.value = {
    ...savingData,
    formattedDate: formatDateLocale(savingData.partyDate),
    buttonAction: () => {
      isPopupVisible.value = false
      let isTurnNextDay = checkTurnNextDay(savingData.partyTime, props.shopInfo.closeTime)
      if (props.shopInfo.isOvernight && isTurnNextDay) {
        emit('action:turn-page', getPrevDay(savingData.partyDate), props.editingCardId)
      } else {
        emit('action:turn-page', savingData.partyDate, props.editingCardId)
      }
    }
  }
  isPopupVisible.value = true;
}

// 變更狀態為取消彈窗
const isStatusPopupVisible = ref(false)
const confirmStatus = ref(false)
const confirmReview = ref({})
const showStatusPopup = (originData) => {
  confirmReview.value = {
    ...originData,
    formattedDate: formatDateLocale(originData.partyDate)
  }
  return new Promise((resolve) => {
    // 顯示彈窗
    isStatusPopupVisible.value = true

    // 綁定彈窗的確認按鈕
    watch(()=>confirmStatus.value,(newValue) => {
      if(newValue) resolve()
    })
  });
}
const disconfirm = (value) => {
  isStatusPopupVisible.value = value
  toggleSaveButtonDisabled(false)
};
</script>


<style lang="scss" scoped>
@use '@/assets/scss/pages/booking/_add_edit.scss';
</style>

