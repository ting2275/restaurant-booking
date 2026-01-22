<template>
  <PlainPopUp ref='editRef' v-model='isEditPopupVisible' card-size='lg' teleport-to='#popup-layer-2'>
    <template #title>編輯預訂</template>
    <!-- 內容 -->
    <template #content>
      <component
        :is='ComponentManager'
        v-bind='currentProps'
        v-on='currentListeners'
      />
    </template>
    <!-- 新按鈕 -->
    <template #buttons>
      <div id='edit-popup-footer-root' style='display: contents'></div>
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
import { ref, computed, watch } from 'vue'
import { getBookingInfo, updateBookingInfo } from '@/services/api/booking'
import { useFormat } from '@/composables/useFormat'
const { formatDateLocale } = useFormat();

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
// 向父層傳遞事件
const emit = defineEmits(['update:visible', 'update:reservation-list','action:turn-page']);


// 子組件
import Preview from './Preview.vue' // 預覽
import FormManager from './FormManager.vue' // 編輯

// 管理子層的props
const currentProps = computed(() => {
  return {
    // 編輯
    true: {
      shopInfo: props.shopInfo,
      dateClasses: props.dateClasses,
      editingCardId: props.editingCardId,
      saveButtonStatus: saveButtonStatus.value
    }
  }[editMode.value]
})

// 管理子層的emits
const currentListeners = computed(() => {
  return {
    // 預覽
    false: {
      'click:cancel-button': closePopup,
      'click:editMode-button': editModeHandler,
    },
    // 編輯
    true: {
      'click:editMode-button': editModeHandler,
      'update:save-reservation': saveReservation,
      'dropdown-open': scrollToBottom,
      'scroll-to-top': scrollToTop
    }
  }[editMode.value]
})

// ------------- 共用變數 -------------
const editRef = ref(null)
const scrollToTop = () => editRef.value?.scrollToTop() // 滾動到最上方
const scrollToBottom = () => editRef.value?.scrollToBottom() // 滾動到最下方
const saveButtonStatus = ref(false) // 控制保存按鈕是否可點擊
// pinia
import { useEditingStore } from '@/stores/bookingStore'
const editingStore = useEditingStore()

// ------------- 功能 -------------
// 模式管理
const editMode = ref(false)
const editModeHandler = async value => {
  editMode.value = value
}
const ComponentManager = computed(() =>
(isEditPopupVisible.value) ? (editMode.value) ? FormManager : Preview : null)


// 取得卡片資料
const fetchBookingInfo = async editingCardId => {
  try {
    const result = await getBookingInfo(editingCardId)
    editingStore.setOriginData(result)
  } catch (error) {
    console.error('Error get BookingInfo:', error);
  }
}

// 儲存預訂
const saveReservation = async () => {
  saveButtonStatus.value = true
  const keysToSave = ['effectivePartySize','email','familyName','givenName','partyDate','partySize','partyTime','reservationStatus','shopkeeperInfo','specialInfo','tableId','telephone'];
  const savingData = Object.fromEntries(
  Object.entries(editingStore.currentData).filter(([key]) => keysToSave.includes(key))
);
  const originData = editingStore.originData

  if (savingData.reservationStatus === 'CANCELED'){
    await showStatusPopup(originData)
    isStatusPopupVisible.value = false
    confirmStatus.value = false
  }
  try {
    let bookingId = props.editingCardId
    await updateBookingInfo(bookingId, savingData)
    closePopup()
    if(savingData.reservationStatus !== 'CANCELED'){
      showSuccessPopup(savingData)
    }else{
      emit('update:reservation-list')
    }
  } catch (error) {
    console.error('Error update BookingInfo:', error);
  } finally {
    saveButtonStatus.value = false
  }
}

// ------------- 主彈窗相關 -------------
const isEditPopupVisible = ref(props.visible)

const updateVisibility = (value) => {
  isEditPopupVisible.value = value;
  emit('update:visible', value); // 通知父層更新
};
const closePopup = () => {
  editMode.value = false
  editingStore.setIsEditing(false)
  editingStore.clearDatas()
  updateVisibility(false)
}

// 滾動到最上方
watch(() => editMode.value, () => scrollToTop())

// 當父層開啟彈窗
watch(() => props.visible, async newVal => {
  isEditPopupVisible.value = newVal;
});

// 當子層開關彈窗
watch(() => isEditPopupVisible.value, async newVal => {
  updateVisibility(newVal)
  if(newVal === true){
    await fetchBookingInfo(props.editingCardId)
    saveButtonStatus.value = false
  }else{
    closePopup()
  }
});

// ------------- 提醒類彈窗相關 -------------
// 預訂成功彈窗
const isPopupVisible = ref(false)
const currentPopupContent = ref({});
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

// 跳轉頁面
import { usePageturn } from '@/composables/modules/reservationOverview/useReservationList.js'
const {
  checkTurnNextDay,
  getPrevDay
} = usePageturn()

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
  saveButtonStatus.value = false
};

</script>


<style lang="scss" scoped>
@use '@/assets/scss/pages/booking/_add_edit.scss';
</style>