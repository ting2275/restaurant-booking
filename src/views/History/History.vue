<template>
  <PlainPopUp v-model='isPopupVisible' card-size='lg'>
    <template #title>預訂資料</template>
    <template #content>
      <div class='booking-content'>
        <p class='subtitle'>預訂內容</p>
        <div class='row preview-info'>
          <TagReservationStatus v-if='originStatus' :variant='originStatus'></TagReservationStatus>
        </div>
        <div class='row row-inline preview-info'>
          <div class='preview-item' >
            <img src='@/assets/images/icons/calender.svg' alt='日期'>
            <span>{{ Weekday }}，{{ formattedDate }}</span>
          </div>
          <div class='preview-item' >
            <img src='@/assets/images/icons/time.svg' alt='時間'>
            <span>{{ partyTime }}</span>
          </div>
          <div class='preview-item' >
            <img src='@/assets/images/icons/user-small.svg' alt='人數'>
            <span>{{ effectivePartySize }}人，{{ partySize }}人桌</span>
          </div>
        </div>
        <hr>
        <p class='subtitle'>顧客資訊</p>
        <div class='row preview-info'>
          <div class='preview-item'>
            <div class='item-title'>姓名</div>
            <div class='item-content'>{{ familyName }} {{ givenName }}</div>
          </div>
          <div class='preview-item'>
            <div class='item-title'>電話</div>
            <div class='item-content'>{{ phoneNumber }}</div>
          </div>
          <div class='preview-item'>
            <div class='item-title'>Email</div>
            <div class='item-content'>{{ email }}</div>
          </div>
          <div class='preview-item'>
            <div class='item-title'>特殊需求</div>
            <div class='item-content'>{{ specialInfo }}</div>
          </div>
          <div class='edit-box'>
            <label for=''>店家備註</label>
            <textarea
              v-model='shopkeeperInfo'
              rows='3'
              cols=''
              maxlength='1000'
              :class='{"textarea-view-only": isViewOnly}'
            />
          </div>
        </div>
      </div>
    </template>
    <template #buttons>
      <BaseButton
        variant='check'
        size='md'
        :is-view-only='isViewOnly'
        @on-click='saveBooking(props.bookingId)'
      >
        儲存
      </BaseButton>
    </template>
  </PlainPopUp>
</template>

<script setup>
  import { ref, computed, watch, defineProps, defineEmits } from 'vue';
  import { getBookingInfo, updateBookingInfo } from '@/services/api/booking';

  const props = defineProps({
    popupVisible: {
      type: Boolean,
      required: true
    },
    bookingId: {
      type: Number,
      required: true
    }
  })

  const emit = defineEmits(['update:modelValue', 'fetchHistoryInfo']);

  const isPopupVisible = ref(props.popupVisible);

  watch(() => props.popupVisible, (newVal) => {
    if (isPopupVisible.value !== newVal) {
      isPopupVisible.value = newVal;
    }
  })

  watch(() => isPopupVisible.value, async newVal => {
    if (isPopupVisible.value !== newVal){
      updatePopupVisible(newVal);
    } else if (newVal === true) {
      await fetchBookingInfo();
    } else {
      closePopup();
    }
  })

  const closePopup = () => {
    updatePopupVisible(false)
  }

  const updatePopupVisible = (value) => {
    isPopupVisible.value = value;
    emit('update:modelValue', value);
    console.log('isPopupVisible', value);
  }

  // 計算星期幾、日期
  import { useFormat } from '@/composables/useFormat'
  const { formatWeekday, formatDateLocale } = useFormat();
  const Weekday = computed(() => formatWeekday(partyDate.value));
  const formattedDate = computed(() => formatDateLocale(partyDate.value,false));

  // 預訂資料
  const originStatus = ref('');
  const selectDetailStatus = ref('');
  const effectivePartySize = ref('');
  const partyDate = ref('');
  const partyTime = ref('');
  const partySize = ref('');
  const familyName = ref('');
  const givenName = ref('');
  const phoneNumber = ref('');
  const email = ref('');
  const specialInfo = ref('');
  const shopkeeperInfo = ref('');

  // 獲取單獨一筆預訂資料
  const fetchBookingInfo = async () => {
    try {
      const result = await getBookingInfo(props.bookingId);
      originStatus.value = result.reservationStatus;
      selectDetailStatus.value = result.reservationStatus;
      effectivePartySize.value = result.effectivePartySize;
      partyDate.value = result.partyDate;
      partyTime.value = result.partyTime;
      partySize.value = result.partySize;
      familyName.value = result.familyName;
      givenName.value = result.givenName;
      phoneNumber.value = result.telephone;
      email.value = result.email;
      specialInfo.value = result.specialInfo;
      shopkeeperInfo.value = result.shopkeeperInfo;
    } catch(error) {
      console.error('fetchBookingInfo error', error);
    }
  }

  // 儲存預訂資料
  const saveBooking = async () => {
    const saveBookingData = {
      email: email.value,
      reservationStatus: originStatus.value,
      givenName: givenName.value,
      familyName: familyName.value,
      partySize: partySize.value,
      telephone: phoneNumber.value,
      effectivePartySize: effectivePartySize.value,
      partyDate: partyDate.value,
      partyTime: partyTime.value,
      specialInfo: specialInfo.value,
      shopkeeperInfo: shopkeeperInfo.value
    };

    try {
      await updateBookingInfo(props.bookingId, saveBookingData);
      closePopup();
      emit('fetchHistoryInfo');
    } catch(error) {
      console.error('saveBooking error', error);
    }
  }

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
</script>

<style lang='scss' scoped>
  @use '@/assets/scss/pages/booking/_add_edit.scss' as *;

  .row {
    &.row-inline {
      display: flex !important;
      gap: 24px !important;
    }
  }
  .preview-info {
    margin-bottom: 0;
  }
  .edit-box {
    border-top: 1px solid $black-500;
    margin-top: 16px;
    padding-top: 16px;
    label {
      display: block;
      margin: 24px 0 16px 0;
    }
  }
  .textarea-view-only {
    background-color: $black-300 !important;
    color: $black-900 ;
    pointer-events: none;
  }
</style>