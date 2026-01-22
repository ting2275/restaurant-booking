<template>
  <PlainPopUp
    :model-value='modelValue'
    teleport-to='#popup-layer-1'
    card-size='lg'
    @update:model-value='handleClose'
  >
    <template #title>
      <p>暫停某時段訂位</p>
    </template>
    <template #content>
      <div class='pause-time-popup-content'>
        <!-- 新增時段 -->
        <div class='add-time-section'>
          <DateTimeRangePicker
            ref='rangeRef'
            :max-range-past='0'
            :max-range-future='6'
            :time-interval='30'
            start-label='開始日期'
            end-label='結束日期'
            time-placeholder='選擇時間'
            :show-warning='true'
            :dynamic-date-range='false'
            @change='handleDateTimeChange'
            @update:has-errors='handleHasErrors'
          />
          <div class='add-button-container'>
            <button :disabled='isAddButtonDisabled' @click='handleAddTimeSlot'>
              新增
            </button>
          </div>
          <hr>
        </div>
        <!-- 時段列表 -->
        <PauseTimePopupList
          v-model='localPauseTimeSlots'
          delete-button-text='移除時段'
        />
      </div>
    </template>
    <template #buttons>
      <BaseButton
        variant='cancel'
        size='lg'
        @click='cancelChanges'
      >取消</BaseButton>
      <BaseButton
        variant='check'
        size='lg'
        @click='confirmChanges'
      >確認</BaseButton>
    </template>
  </PlainPopUp>
</template>
      
<script setup>
import { ref, watch, computed } from 'vue';
import { useSystemStore } from '@/stores/systemStore';
import PauseTimePopupList from "@businessSettings/AvailableTime/components/partials/PauseTimePopupList.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  pauseTimeSlots: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'update:pauseTimeSlots']);
const systemStore = useSystemStore();

// 本地暫停時段資料（用於編輯）
const localPauseTimeSlots = ref([]);
const originalPauseTimeSlots = ref([]);

const hasValidationErrors = ref(false);

const handleHasErrors = (hasErrors) => {
  hasValidationErrors.value = hasErrors;
};

// 按鈕禁用邏輯
const isAddButtonDisabled = computed(() => {
  return !currentDateTimeRange.value || hasValidationErrors.value;
});

// 當前選擇的日期時間範圍
const currentDateTimeRange = ref(null);

// 處理日期時間變化
const handleDateTimeChange = (dateTimeRange) => {
  currentDateTimeRange.value = dateTimeRange;
};

// 新增時段按鈕功能
const handleAddTimeSlot = () => {
  if (!currentDateTimeRange.value || isAddButtonDisabled.value) return;
  try {
    const newSlot = {
      tempCloseId: `temp_${Date.now()}`,
      closeStartDay: currentDateTimeRange.value.startDateTime,
      closeEndDay: currentDateTimeRange.value.endDateTime,
      isNew: true 
    };
    //去重邏輯
    const isDuplicate = localPauseTimeSlots.value.some(existingSlot => {
      return existingSlot.closeStartDay === newSlot.closeStartDay && 
             existingSlot.closeEndDay === newSlot.closeEndDay;
    });
    if (isDuplicate) {
      return;
    }
    // 排序
    localPauseTimeSlots.value.push(newSlot);
    localPauseTimeSlots.value.sort((a, b) => {
      const startComparison = new Date(a.closeStartDay) - new Date(b.closeStartDay);
      if (startComparison !== 0) {
        return startComparison;
      }
      return new Date(a.closeEndDay) - new Date(b.closeEndDay);
    });
    
  } catch (error) {
    console.error('新增時段失敗:', error);
  }
};

// 彈窗控制
const handleClose = () => {
  resetForm();
  localPauseTimeSlots.value = JSON.parse(JSON.stringify(originalPauseTimeSlots.value));
  emit('update:modelValue', false);
};

const cancelChanges = () => {
  resetForm();
  localPauseTimeSlots.value = JSON.parse(JSON.stringify(originalPauseTimeSlots.value));
  emit('update:modelValue', false);
};

const confirmChanges = () => {
  const hasChanges = JSON.stringify(localPauseTimeSlots.value) !== JSON.stringify(originalPauseTimeSlots.value);
  if (hasChanges) {
    emit('update:pauseTimeSlots', localPauseTimeSlots.value);
    systemStore.setSystemIsEditing(true);
  }
  resetForm();
  emit('update:modelValue', false);
};

// 監聽 props 變化，初始化本地資料
watch(() => props.pauseTimeSlots, (newValue) => {
  localPauseTimeSlots.value = JSON.parse(JSON.stringify(newValue));
  originalPauseTimeSlots.value = JSON.parse(JSON.stringify(newValue));
}, { immediate: true, deep: true });

const rangeRef = ref(); 

// 重置開始結束日期時間回預設值
function resetForm() {
  rangeRef.value?.reset?.();        
  currentDateTimeRange.value = null;
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/shared/index' as *;
@use '@/assets/scss/mixins/mixins' as *;

.add-time-section {
  padding: 16px 0 0 0 ;
  .add-button-container {
    display: flex;
    justify-content: flex-end;
    margin: 16px 0;
    button {
      background:none;
      border:none;
      padding:0;
      margin:0;
      font:inherit;
      cursor:pointer;
      @extend .body2;
      color: $primary;
      &:disabled {
        color: $black-500;
        cursor: not-allowed;
      }
    }
  }
  hr{
    display: block;
    border: none;
    height: 8px;
    width: calc(100% + 48px);
    position: relative;
    left: -24px;
    background-color: $black-300;
  }
}
.pause-time-popup-content{
  min-height: 400px;
}
</style>