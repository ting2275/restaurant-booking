<template>
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
          label-key='label' value-key='value' placeholder='請先選擇桌型與預訂時段' :is-searchable='false' :is-readonly='true' :is-disabled='!hasPartyAndTimeSelected' @dropdown-open='emit("dropdown-open")' @update:model-value='updateSelectedTable'/>
      </div>
    </template>
  </div>
  <teleport v-if='showTeleport' to='#add-popup-footer-root'>
    <BaseButton
      :variant='cancelButton.variant'
      :size='cancelButton.size'
      @on-click='cancelButton.buttonAction'>
      {{ cancelButton.label }}
    </BaseButton>
    <BaseButton
      :variant='nextButton.variant'
      :size='nextButton.size'
      @on-click='nextButton.buttonAction'>
      {{ nextButton.label }}
    </BaseButton>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onActivated, onDeactivated } from 'vue'

defineOptions({
  name: 'BookingInfoForm'
})

const props = defineProps({
  onRequestProps: {
    type: Function,
    required: true
  }
})
// 向父層請求所需的 props
const requiredProps =
['data', 'shopInfo', 'dateClasses', 'saveButtonStatus', 'selectedDateOuter']
const getProps = computed(() => props.onRequestProps(requiredProps))
// 向父層傳遞事件
const emit = defineEmits(['click:cancel-button', 'click:next-button', 'dropdown-open'])


// ------------- 共用變數 -------------
// 下拉選單的日期時間
const dateTime = computed(() => {
  return (selectedDate.value && selectedTime.value) ? `${selectedDate.value} ${selectedTime.value}` : undefined // 中間空格不能刪
})
// 按鈕選取的日期時間
const selectedAvailableDateTime = computed(() => {
  return selectedAvailableTime.value ? `${selectedAvailableDate.value} ${selectedAvailableTime.value}` : undefined // 中間空格不能刪
})
// 桌型與時段皆選定
const hasPartyAndTimeSelected = computed(() => selectedAvailableParty.value && selectedAvailableTime.value)
// 預訂資料完成
const isBookingInfoCompleted = computed(() => hasPartyAndTimeSelected.value  &&  selectedTableId.value !== 0)

// ------------- 上半部(下拉選單) -------------
//選擇人數(下拉)
import { usePeopleOptions } from '@/composables/modules/booking/useBookingForm.js'
const {
  peopleOptions,
  isPeopleOptionsEmpty,
  selectedPeople
} = usePeopleOptions(getProps.value.shopInfo)

//選擇日期(下拉)
import { useDateOptions } from '@/composables/modules/booking/useBookingForm.js'
const {
  businessTime,
  selectedDate,
  isBusinessTimeEmpty,
  handleDateChangeInput
} = useDateOptions(getProps.value.data.partyDate)


//選擇時間(下拉)
import { useTimeOptions } from '@/composables/modules/booking/useBookingForm.js'
const {
  selectedTime,
  timeOptions,
  getNextAvailableTime
} = useTimeOptions(getProps.value.shopInfo, businessTime)

watch(businessTime, newVal => {
  if (newVal.length === 0) return
  selectedTime.value = getProps.value.data.partyTime || getNextAvailableTime()
} )

// 監聽人數、日期、時間任一變更，重新取得可預訂時段
watch([selectedPeople, selectedDate, selectedTime], async ([newPeople, newDate, newTime]) => {
  if(!isBasicSelectedDataReady.value) return
  if (!newPeople || !newDate || newDate === 'Invalid date' || !newTime) return
  await getAvailablePartyList(dateTime.value, newPeople)
  updateSelectedParty(availablePartyList.value[0].partySize) // [預設] 選取最靠近所選人數的桌次 = 選第一桌
  selectedAvailableTime.value = ''
})

// ------------- 下半部(按鈕) -------------
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

// 取得可預訂桌號(下拉)
import { useAvailableTablesList } from '@/composables/modules/booking/useBookingForm.js'
const {
  tableOptions,
  getAvailableTablesList
} = useAvailableTablesList()


// ------------- 按鈕點擊動作 -------------
const selectedAvailableParty = ref(0) // 被選擇的桌型
const selectedAvailableTime = ref('') // 被選擇的時段
const selectedAvailableDate = ref('') // 被選擇的日期 != 下拉選單的日期(因時間按鈕的實際日期可能不同)
const selectedTableId = ref(0) // 被選擇的桌次
const selectedTablePartySize = ref(0) // 被選擇的桌型容納人數
const selectedTableLabel = ref('') // 被選擇的桌型+桌名 畫面顯示用

// for mapping api and components params
const matchButtonVariants = {
  'true': 'secondary',
  'false': 'not-open'
}

// 點選桌型按鈕
const updateSelectedParty = async partySize => {
  selectedAvailableParty.value = partySize
  updateSelectedPartyColor(partySize)
  await getAvailableTimeList(dateTime.value, partySize)
  selectedAvailableTime.value = ''
  clearSelectedTable()
}
const updateSelectedPartyColor = partySize => {
  availablePartyList.value.forEach(item => {
    item.variant = (item.partySize === partySize) ? 'check' : matchButtonVariants[item.available];
  });
}

// 點選時段按鈕
const updateSelectedTime = async (date,time) => {
  selectedAvailableTime.value = time
  selectedAvailableDate.value = date
  updateSelectedTimeColor(time)
  await getAvailableTablesList(selectedAvailableDateTime.value, selectedAvailableParty.value)
  clearSelectedTable()
}
const updateSelectedTimeColor = time => {
  availableTimeList.value.forEach(item => {
    item.variant = (item.time === time) ? 'check' : matchButtonVariants[item.available];
  });
}

// 點選桌號選單
const updateSelectedTable = (tableId) => {
  selectedTableId.value = tableId
  selectedTablePartySize.value = tableOptions.value.find(item => item.value === tableId)?.tablePartySize
  selectedTableLabel.value = tableOptions.value.find(item => item.value === tableId)?.label
}
const clearSelectedTable = () => {
  selectedTableId.value = 0
  selectedTablePartySize.value = 0
  selectedTableLabel.value = ''
}


// 按鈕設定值
const cancelButton = ref({ variant: 'cancel', size: 'md', label: '取消', buttonAction: () => emit('click:cancel-button')
});
const nextButton = computed(() => {
  return {
    variant: isBookingInfoCompleted.value ? 'check' : 'disabled',
    size: 'md',
    label: '下一步',
    buttonAction: () => doneBookingInfoForm()
  }
})

// 提交本頁面 更新預訂資料
const bookingInfoData = ref({})
const doneBookingInfoForm = () => {
  bookingInfoData.value = {
    tableId: selectedTableId.value,
    partySize: selectedAvailableParty.value,
    tablePartySize: selectedTablePartySize.value,
    effectivePartySize: selectedPeople.value,
    partyDate: selectedAvailableDate.value,
    partyTime: selectedAvailableTime.value,
    tableLabel: selectedTableLabel.value || '尚未指定桌號'
  }
  emit('click:next-button', bookingInfoData.value)
}
// 初始化
const isBasicSelectedDataReady = ref(false)
onMounted( async () => {
  await setBasicSelectedData()
  isBasicSelectedDataReady.value = true
  setShopSelectedData()
})
const showTeleport = ref(true)
// 每次進入畫面時顯示 teleport
onActivated(() => showTeleport.value = true)
// 每次離開畫面時銷毀 teleport
onDeactivated(() => showTeleport.value = false)

// 帶入基本選擇資料 [狀態、人數、日期、時間]
const setBasicSelectedData = async () => {
  const { effectivePartySize, partyDate } = getProps.value.data
  selectedPeople.value = effectivePartySize
  selectedDate.value = partyDate
}

// 帶入店家選擇資料 [桌型、時段、桌號]
const setShopSelectedData = async () => {
  const { tablePartySize, partyDate, partyTime, tableId } = getProps.value.data
  await getAvailablePartyList(dateTime.value, selectedPeople.value) // 用實際用餐人數取得桌型列表
  await updateSelectedParty(tablePartySize) // 選取當前訂單桌號的容納人數
  await updateSelectedTime(partyDate , partyTime)
  updateSelectedTable(tableId) // 選取當前訂單桌號
}
</script>

<style lang="scss" scoped>
  @use '@/assets/scss/pages/booking/_add_edit.scss';
</style>