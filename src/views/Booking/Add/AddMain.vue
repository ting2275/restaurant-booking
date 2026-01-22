<template>
  <PlainPopUp ref='addRef' v-model='isAddPopupVisible' card-size='lg'>
    <template #title>新增預訂</template>
    <!-- 內容 -->
    <template #content>
      <component
        :is='ComponentManager'
        v-bind='currentProps'
        :key='nowUnixTime'
        v-on='currentListeners'
      />
    </template>
    <template #buttons>
      <div id='add-popup-footer-root' style='display: contents'></div>
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
import { useFormat } from '@/composables/useFormat'
const { formatDateLocale } = useFormat()

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

// 向父層傳遞事件
const emit = defineEmits(['update:visible','update:reservation-list','action:turn-page']);

// 子組件
import FormManager from './FormManager.vue' // 編輯

// 管理子層的props
const currentProps = computed(() => {
  return {
    shopInfo: props.shopInfo,
    dateClasses: props.dateClasses,
    selectedDateOuter: props.selectedDateOuter,
    saveButtonStatus: saveButtonStatus.value
  }
})

// 管理子層的emits
const currentListeners = computed(() => {
  return {
    'click:cancel-button': closePopup,
    'dropdown-open': scrollToBottom,
    'update:save-reservation': saveReservation,
    'scroll-to-top': scrollToTop
  }
})

// ------------- 共用變數 -------------
const addRef = ref(null)
const scrollToBottom = () => addRef.value?.scrollToBottom()
const scrollToTop = () => addRef.value?.scrollToTop()
const saveButtonStatus = ref(false)
const nowUnixTime = ref(Date.now())
// pinia
import { useAddingStore } from '@/stores/bookingStore'
const addingStore = useAddingStore()

// ------------- 功能 -------------
// 模式管理
const ComponentManager = computed(() =>
(isAddPopupVisible.value) ? FormManager : null)


// ------------- 儲存預訂 -------------
import { addBookingInfo } from '@/services/api/booking'
const saveReservation = async () => {
  saveButtonStatus.value = true
  const keysToSave = ['effectivePartySize','email','familyName','givenName','partyDate','partySize','partyTime','shopkeeperInfo','specialInfo','tableId','telephone'];
  const savingData = Object.fromEntries(
    Object.entries(addingStore.currentData).filter(([key]) => keysToSave.includes(key))
  )

  try {
    let result = await addBookingInfo(savingData)
    newCardId.value = result.bookingId
    closePopup()
    showSuccessPopup(savingData)
  } catch (error) {
    console.error('Error save reservation:', error);
  } finally {
    saveButtonStatus.value = false
  }
}

// ------------- 主彈窗相關 -------------
const isAddPopupVisible = ref(props.visible)

const updateVisibility = (value) => {
  isAddPopupVisible.value = value;
  emit('update:visible', value); // 通知父層更新
};
const closePopup = () => {
  addingStore.setIsEditing(false)
  addingStore.clearDatas()
  updateVisibility(false)
}


// 當父層開啟彈窗
watch(() => props.visible, async newVal => {
  isAddPopupVisible.value = newVal;
});

// 當子層開關彈窗
watch(() => isAddPopupVisible.value, async newVal => {
  updateVisibility(newVal)
  if(newVal === true){
    nowUnixTime.value = Date.now()
  }else{
    closePopup()
  }
});

// ------------- 提醒類彈窗相關 -------------
// 預訂成功彈窗
const isPopupVisible = ref(false)
const currentPopupContent = ref({});
const newCardId = ref(0) // 新增預訂後的卡片ID
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

// 跳轉頁面
import { usePageturn } from '@/composables/modules/reservationOverview/useReservationList.js'
const {
  checkTurnNextDay,
  getPrevDay
} = usePageturn()

</script>