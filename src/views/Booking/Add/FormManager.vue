<template>
  <keep-alive
    v-if='addingStore.isReady'
    :include='["BookingInfoForm", "CustomerInfoForm"]'
  >
    <component
      :is='StepManager[currentStep]'
      v-bind='currentStepProps'
      v-on='currentListeners'
    />
  </keep-alive>
</template>
<script setup>
import { computed, ref, watch, onMounted } from 'vue'
const props = defineProps({
  shopInfo: {
    type: Object,
    default: () => ({})
  },
  dateClasses: {
    type: Object,
    default: () => ({})
  },
  saveButtonStatus: {
    type: Boolean,
    default: false
  },
  selectedDateOuter: {
    type: String,
    required: true
  }
})
// 向父層傳遞事件
const emit = defineEmits(['click:cancel-button', 'dropdown-open', 'scroll-to-top', 'update:save-reservation'])

// pinia
import { useAddingStore } from '@/stores/bookingStore'
const addingStore = useAddingStore()

// 編輯預訂內容
import BookingInfoForm from './BookingInfoForm.vue'
// 編輯顧客資訊
import CustomerInfoForm from './CustomerInfoForm.vue'

// 模式管理
const currentStep = ref(1)
const StepManager = computed(() => {
  return {
    1 : BookingInfoForm,
    2 : CustomerInfoForm
  }
})

// 根據當前步驟動態傳遞 emit listeners
const currentListeners = computed(() => {
  return {
    1: {
      'click:cancel-button': () => emit('click:cancel-button'),
      'click:next-button': confirmBookingInfoForm,
      'dropdown-open': () => emit('dropdown-open')
    },
    2: {
      'click:prev-button': confirmCustomerInfoForm,
      'click:save-button': confirmSaveButton
    }
  }[currentStep.value]
})


// 選取的訂單資料 ['click:next-button']
const currentBookingInfoData = ref({})
const confirmBookingInfoForm = (data) => {
  currentBookingInfoData.value = data
  addingStore.setCurrentBookingData(currentBookingInfoData.value)
  addingStore.setIsEditing(true)
  currentStep.value = 2
}

// 上一頁 ['click:prev-button']
const currentCustomerInfoData = ref({})
const confirmCustomerInfoForm = async (data) => {
  if (Object.keys(currentBookingInfoData.value).length === 0) return
  currentCustomerInfoData.value = data
  await addingStore.setCurrentBookingData(currentCustomerInfoData.value)
  currentStep.value = 1
}

// 確認顧客資訊 ['click:save-button']
const confirmSaveButton = async (data) => {
  currentCustomerInfoData.value = data
  await addingStore.setCurrentBookingData(currentCustomerInfoData.value)
  emit('update:save-reservation')
}

// 換頁滾動
watch(() => currentStep.value, () => emit('scroll-to-top'))

// 設定預設值
import { usePeopleOptions } from '@/composables/modules/booking/useBookingForm.js'
const { getDefaultPeople } = usePeopleOptions(props.shopInfo)
const setDefault = async () => {
  addingStore.setCurrentBookingData({
    effectivePartySize: getDefaultPeople(),
    partyDate: new Date(props.selectedDateOuter).toISOString().split('T')[0],
    tablePartySize: 0,
    tableId: 0,
    telephone: '',
    email: '',
    familyName: '',
    givenName: '',
    specialInfo: '',
    shopkeeperInfo: '',
  })
}
// 初始化(帶入初始值)
onMounted(async () => {
  if(!addingStore.isEditing){
    await setDefault()
  }
})

// ------------- Props Request 溝通邏輯 -------------
// 處理子組件請求 props
const handleRequestProps = (requestedProps) => {
  // 允許往下傳的 props
  const availableProps = {
    data: addingStore.currentData,
    shopInfo: props.shopInfo,
    dateClasses: props.dateClasses,
    saveButtonStatus: props.saveButtonStatus,
    selectedDateOuter: props.selectedDateOuter
  }

  // 過濾子層的 requestedProps
  return requestedProps.reduce((acc, prop) => {
    if (prop in availableProps) {
      acc[prop] = availableProps[prop]
    }
    return acc
  }, {} // 初始化空物件
  )
}

// 根據當前步驟動態傳遞 props
const currentStepProps = computed(() => {
  return {
    onRequestProps: handleRequestProps
  }
})
</script>