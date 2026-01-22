<template>
  <div v-show='editingStore.isReady' class='booking-content'>
    <p class='subtitle'>預訂內容</p>
    <div class='row preview-info'>
      <TagReservationStatus v-if='cardInfo.reservationStatus' :variant='cardInfo.reservationStatus'></TagReservationStatus>
    </div>
    <div class='row row-inline preview-info'>
      <div class='preview-item' >
        <img src='@/assets/images/icons/calender.svg' alt='日期'>
        <span>{{ cardInfo.weekday }}，{{ cardInfo.partyDate }}</span>
      </div>
      <div class='preview-item' >
        <img src='@/assets/images/icons/time.svg' alt='時間'>
        <span>{{ cardInfo.partyTime }}</span>
      </div>
      <div class='preview-item' >
        <img src='@/assets/images/icons/user-small.svg' alt='人數'>
        <span>{{ cardInfo.effectivePartySize }}人，{{ cardInfo.tableInfo }}</span>
      </div>
    </div>
    <hr>
    <p class='subtitle'>顧客資訊</p>
    <div class='row preview-info'>
      <div class='preview-item'>
        <div class='item-title'>姓名</div>
        <div class='item-content'>{{ cardInfo.familyName }} {{ cardInfo.givenName }}</div>
      </div>
      <div class='preview-item'>
        <div class='item-title'>電話</div>
        <div class='item-content'>{{ cardInfo.telephone }}</div>
      </div>
      <div class='preview-item'>
        <div class='item-title'>Email</div>
        <div class='item-content'>{{ cardInfo.email }}</div>
      </div>
      <div class='preview-item'>
        <div class='item-title'>特殊需求</div>
        <div class='item-content'>{{ cardInfo.specialInfo }}</div>
      </div>
      <div class='preview-item'>
        <div class='item-title'>店家備註</div>
        <div class='item-content'>{{ cardInfo.shopkeeperInfo }}</div>
      </div>
    </div>
  </div>
  <teleport to='#edit-popup-footer-root'>
    <BaseButton
      :variant='cancelButton.variant'
      :size='cancelButton.size'
      @on-click='cancelButton.buttonAction'>
      {{ cancelButton.label }}
    </BaseButton>
    <BaseButton
      :variant='editModeButton.variant'
      :size='editModeButton.size'
      :is-view-only='isViewOnly'
      :disabled='editModeButton.disabled'
      @on-click='editModeButton.buttonAction'>
      {{ editModeButton.label }}
    </BaseButton>
  </teleport>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import { useFormat } from '@/composables/useFormat'
const { formatDateLocale, formatWeekday } = useFormat();

// pinia
import { useEditingStore } from '@/stores/bookingStore'
const editingStore = useEditingStore()

const emit = defineEmits(['click:cancel-button', 'click:editMode-button']);

// 卡片預覽資訊
const cardInfo = computed(() => {
  const baseInfo = editingStore.originData
  return {
    ...baseInfo,
    partyDate: formatDateLocale(baseInfo.partyDate, false),
    weekday: formatWeekday(baseInfo.partyDate),
    tableInfo: (baseInfo.tableId !== 0) ? `${baseInfo.tablePartySize}人桌 (${baseInfo.areaName}-${baseInfo.tableName})` : '尚未指定桌號'
  }
})

// 檢查googleStatus狀態
import { useAccountStore } from '@/stores/accountStore';
const accountStore = useAccountStore();
const isViewOnly = ref(false);
const GOOGLE_STATUS = 8; // 8: 僅供檢視
watch(
  () => accountStore.googleStatus,
  (newStatus) => {
    isViewOnly.value = newStatus === GOOGLE_STATUS;
  },
  { immediate: true }
);

// 按鈕設定值
const cancelButton = ref({ variant: 'cancel', size: 'md', label: '取消', buttonAction: () => {
  emit('click:cancel-button')
}});
const editModeButton = ref({ variant: 'check', size: 'md', label: '編輯', buttonAction: () => {
  emit('click:editMode-button', true)
}});

</script>

<style lang='scss' scoped>
  @use '@/assets/scss/pages/booking/_add_edit.scss';
</style>
