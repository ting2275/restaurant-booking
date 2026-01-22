<template>
  <keep-alive
    v-if='editingStore.isReady'
    :include='["BookingInfoForm", "CustomerInfoForm"]'>
    <component
      :is='StepManager[currentStep]'
      v-bind='currentStepProps'
      v-on='currentListeners'
    />
  </keep-alive>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
const props = defineProps({
  shopInfo: {
    type: Object,
    default: () => ({})
  },
  dateClasses: {
    type: Object,
    default: () => ({})
  },
  editingCardId: {
    type: Number,
    required: true
  },
  saveButtonStatus: {
    type: Boolean,
    default: false
  }
})
// 向父層傳遞事件
const emit = defineEmits(['click:editMode-button','update:save-reservation', 'dropdown-open', 'scroll-to-top'])

// pinia
import { useEditingStore } from '@/stores/bookingStore'
const editingStore = useEditingStore()

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
// 不可異動狀態
const ineditible = computed(()=>['seated','NO_SHOW'].includes(editingStore.originData.reservationStatus))


// 根據當前步驟動態傳遞 emit listeners
const currentListeners = computed(() => {
  return {
    1: {
      'click:back-button': closeEditMode,
      'click:next-button': confirmBookingInfoForm,
      'dropdown-open': () => emit('dropdown-open')
    },
    2: {
      'click:prev-button': confirmCustomerInfoForm,
      'click:save-button': saveReservation
    }
  }[currentStep.value]
})

// 關閉編輯模式 ['click:back-button']
const closeEditMode = () => {
  emit('click:editMode-button', false)
}

// 選取的訂單資料 ['click:next-button']
const currentBookingInfoData = ref({})
const confirmBookingInfoForm = (data) => {
  currentBookingInfoData.value = data
  editingStore.setCurrentBookingData(currentBookingInfoData.value)
  editingStore.setIsEditing(true)
  currentStep.value = 2
}

// 上一頁 ['click:prev-button']
const currentCustomerInfoData = ref({})
const confirmCustomerInfoForm = async (data) => {
  if (Object.keys(currentBookingInfoData.value).length === 0) return
  currentCustomerInfoData.value = data
  await editingStore.setCurrentBookingData(currentCustomerInfoData.value)
  currentStep.value = 1
}

// 確認顧客資訊 ['click:save-button']
const saveReservation = async (data) => {
  currentCustomerInfoData.value = data
  await editingStore.setCurrentBookingData(currentCustomerInfoData.value)
  emit('update:save-reservation')
}

// 換頁滾動
watch(() => currentStep.value, () => emit('scroll-to-top'))

// ------------- Props Request 溝通邏輯 -------------

// 處理子組件請求 props
const handleRequestProps = (requestedProps) => {
  // 允許往下傳的 props
  const availableProps = {
    data: editingStore.isEditing ? editingStore.currentData : editingStore.originData,
    shopInfo: props.shopInfo,
    ineditible: ineditible.value,
    dateClasses: props.dateClasses,
    editingCardId: props.editingCardId,
    saveButtonStatus: props.saveButtonStatus
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