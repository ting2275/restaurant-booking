<template>
  <div class='pause-time-slots'>
    <div class='title-box'>
      <div class='popup-box'>
        <p>暫停某時段訂位</p>
        <button class='add-time-button' @click='openPauseTimePopup'>新增/編輯</button>
      </div>
      <div class='description'>
        <p>※ 設定特定日期與時段暫停線上預訂,適用於訂單爆量、臨時活動或內部需求調整。</p>
        <button class='more-info-button' @click='openPauseTimeHint'>更多資訊</button>
      </div>
    </div>

    <!-- 暫停時段設定彈窗 -->
    <PauseTimePopup
      v-model='showPauseTimePopup'
      :pause-time-slots='pauseTimeSlots'
      @update:pause-time-slots='handlePauseTimeSlotsUpdate'
    />

    <!-- 提示資訊彈窗 -->
    <PauseTimeHint v-model='showPauseTimeHint' />

    <!-- 外部顯示所有暫停時段 -->
    <div class='external-slots-display'>
      <div class='display-slots-list'>
        <div 
          v-for='slot in displayPauseTimeSlots' 
          :key='slot.tempCloseId' 
          class='display-slot-item'
        >
          <div class='slot-info'>
            <p>{{ formatDateTime(slot.closeStartDay) }}</p>
            <p>{{ formatDateTime(slot.closeEndDay) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, defineEmits, watch } from 'vue';
import { getTempCloseList } from "@/services/api/shop";
import { useSystemStore } from '@/stores/systemStore';
import { useFormat } from '@/composables/useFormat';
import PauseTimeHint from "@businessSettings/AvailableTime/components/partials/PauseTimeHint.vue";
import PauseTimePopup from "@businessSettings/AvailableTime/components/PauseTimeSettings/PauseTimePopup.vue";
import { useTokenWatcher } from '@/composables/useTokenWatcher';

const systemStore = useSystemStore();
const isEditing = inject('isEditing')
const { formatDateTime } = useFormat();

const emit = defineEmits(['update:pauseTimeSlots']);

// 暫停時段相關狀態
const pauseTimeSlots = ref([]);
const displayPauseTimeSlots = ref([]);

// 彈窗
const showPauseTimePopup = ref(false);
const showPauseTimeHint = ref(false);
const openPauseTimePopup = () => {
  showPauseTimePopup.value = true;
};
const openPauseTimeHint = () => {
  showPauseTimeHint.value = true;
};

// 處理彈窗回傳的暫停時段資料
const handlePauseTimeSlotsUpdate = (newPauseTimeSlots) => {
  pauseTimeSlots.value = newPauseTimeSlots;
  displayPauseTimeSlots.value = JSON.parse(JSON.stringify(newPauseTimeSlots));
  isEditing.value = true;
  systemStore.setSystemIsEditing(true);
  emit('update:pauseTimeSlots', newPauseTimeSlots);
};

// 獲取暫停時段列表
const fetchPauseTimeSlots = async () => {
  try {
    const response = await getTempCloseList();
    pauseTimeSlots.value = response || [];
    displayPauseTimeSlots.value = JSON.parse(JSON.stringify(response || [])); 
  } catch (error) {
    console.error('獲取暫停時段失敗:', error);
  } 
};

watch(pauseTimeSlots, (newValue) => {
  emit('update:pauseTimeSlots', newValue);
}, { deep: true });

onMounted(() => {
  fetchPauseTimeSlots();
});

const reloadFunction = () => {
  fetchPauseTimeSlots();
};
useTokenWatcher(reloadFunction);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/shared/index' as *;
@use '@/assets/scss/mixins/mixins' as *;
.pause-time-slots {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.title-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  .popup-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .add-time-button {
      @extend .body2;
      color: $primary;
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      font: inherit;
      cursor: pointer;
      outline: none;
    }
  }
  .description {
    display: flex;
    @extend .caption;
    .more-info-button {
      color: $black-900;
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      font: inherit;
      cursor: pointer;
      outline: none;
      border-bottom: 1px solid $black-900;
    }
  }
}

// 外部顯示所有暫停時段
.external-slots-display {
  width: 100%;
  max-height: 212px;
  overflow-y: auto;
  @include custom-scrollbar;
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  .display-slots-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    .display-slot-item {
      border-bottom: 1px solid $black-300;
      width: 100%;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.slot-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: 64px; 
  &::after {
    content: '-';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: inherit;
    font-weight: inherit;
  }
}
</style>