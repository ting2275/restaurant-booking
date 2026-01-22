<template>
  <div class='add-time-container'>
    <div class='add-time-slot-form'>
      <!-- 開始日期時間 -->
      <div class='form-group'>
        <label>{{ startLabel }}</label>
        <InputDatePicker
          :initial-date='selectedStartDay'
          :date-classes='dateClasses'
          :max-range-past='maxRangePast'
          :max-range-future='maxRangeFuture'
          @input-date-change='handleStartDateChange'
        />
        <div v-if='validationErrors.startDateError' class='error-message'>
          {{ validationErrors.startDateError }}
        </div>
      </div>
      <div class='form-group'>
        <label>{{ startTimeLabel }}</label>
        <div class='dropdown-container'>
          <DropdownMenu
            :key='selectedStartTime'
            v-model='selectedStartTime'
            :options='timeOptions'
            label-key='label'
            value-key='value'
            :is-searchable='false'
            :is-readonly='true'
            :is-view-only='false'
            :placeholder='timePlaceholder'
            style='flex-basis: 100%;'
            @update:model-value='handleStartTimeChange'
          />
        </div>
        <div v-if='validationErrors.startTimeError' class='error-message'>
          {{ validationErrors.startTimeError }}
        </div>
      </div>
    </div>
   
    <div class='add-time-slot-form'>
      <!-- 結束日期時間 -->
      <div class='form-group'>
        <label>{{ endLabel }}</label>
        <InputDatePicker
          :initial-date='selectedEndDay'
          :date-classes='dateClasses'
          :max-range-past='maxRangePast'
          :max-range-future='maxRangeFuture'
          @input-date-change='handleEndDateChange'
        />
        <div class='message-space'>
          <div v-if='validationErrors.endDateError' class='error-message'>
            {{ validationErrors.endDateError }}
          </div>
          <div v-if='showDateRangeWarning && showWarning' class='hint-text'>
            您已選擇超過 {{ dateRangeDays }} 天
          </div>
        </div>
      </div>
      <div class='form-group'>
        <label>{{ endTimeLabel }}</label>
        <div class='dropdown-container'>
          <DropdownMenu
            :key='selectedEndTime'
            v-model='selectedEndTime'
            :options='endTimeOptions'
            label-key='label'
            value-key='value'
            :is-searchable='false'
            :is-readonly='true'
            :is-view-only='false'
            :placeholder='timePlaceholder'
            style='flex-basis: 100%;'
            @update:model-value='handleEndTimeChange'
          />
        </div>
        <div class='message-space'>
          <div v-if='validationErrors.endTimeError' class='error-message'>
            {{ validationErrors.endTimeError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
   
<script setup>
import { computed, watch, onMounted } from 'vue';
import { useDateTimeRange } from '@/composables/common/useDateTimeRange';

// Props 定義
const props = defineProps({
  initialStartDate: {
    type: [Date, String],
    default: () => new Date()
  },
  initialEndDate: {
    type: [Date, String],
    default: () => new Date()
  },
  initialStartTime: {
    type: String,
    default: ''
  },
  initialEndTime: {
    type: String,
    default: ''
  },
  maxRangePast: {
    type: Number,
    default: 0
  },
  maxRangeFuture: {
    type: Number,
    default: 6
  },
  timeInterval: {
    type: Number,
    default: 30
  },
  showDateRangeWarning: {
    type: Boolean,
    default: true
  },
  warningDays: {
    type: Number,
    default: 1
  },
  dynamicDateRange: {
    type: Boolean,
    default: false
  },
  startLabel: {
    type: String,
    default: '開始日期'
  },
  endLabel: {
    type: String,
    default: '結束日期'
  },
  startTimeLabel: {
    type: String,
    default: '開始時間'
  },
  endTimeLabel: {
    type: String,
    default: '結束時間'
  },
  timePlaceholder: {
    type: String,
    default: '選擇時間'
  },
  showWarning: {
    type: Boolean,
    default: true
  },
  dateClasses: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits([
  'update:startDateTime',
  'update:endDateTime',
  'update:dateTimeRange',
  'update:validationErrors',
  'update:hasErrors',
  'change'
]);

// 使用 composable
const {
  selectedStartDay,
  selectedEndDay,
  selectedStartTime,
  selectedEndTime,
  timeOptions,
  endTimeOptions,
  showDateRangeWarning: showWarningComputed,
  dateRangeDays,
  validationErrors,
  handleStartDateChange,
  handleEndDateChange,
  handleStartTimeChange,
  handleEndTimeChange,
  initSelectedTime,
  getDateTimeRange
} = useDateTimeRange({
  maxRangePast: props.maxRangePast,
  maxRangeFuture: props.maxRangeFuture,
  timeInterval: props.timeInterval,
  showDateRangeWarning: props.showDateRangeWarning,
  warningDays: props.warningDays,
  dynamicDateRange: props.dynamicDateRange
});

// 計算屬性
const showDateRangeWarning = computed(() =>
  props.showWarning && showWarningComputed.value
);

// 監聽初始值變化
watch(() => props.initialStartDate, (newVal) => {
  if (newVal) {
    selectedStartDay.value = new Date(newVal);
  }
}, { immediate: true });

watch(() => props.initialEndDate, (newVal) => {
  if (newVal) {
    selectedEndDay.value = new Date(newVal);
  }
}, { immediate: true });

watch(() => props.initialStartTime, (newVal) => {
  if (newVal) {
    selectedStartTime.value = newVal;
  }
}, { immediate: true });

watch(() => props.initialEndTime, (newVal) => {
  if (newVal) {
    selectedEndTime.value = newVal;
  }
}, { immediate: true });

// 監聽日期時間變化，發出事件
watch([selectedStartDay, selectedStartTime], () => {
  const { startDateTime } = getDateTimeRange();
  emit('update:startDateTime', startDateTime);
  emitChange();
}, { deep: true });

watch([selectedEndDay, selectedEndTime], () => {
  const { endDateTime } = getDateTimeRange();
  emit('update:endDateTime', endDateTime);
  emitChange();
}, { deep: true });

const emitChange = () => {
  const dateTimeRange = getDateTimeRange();
  emit('update:dateTimeRange', dateTimeRange);
  const hasErrors = Object.values(validationErrors.value).some(error => error !== '');
  emit('update:hasErrors', hasErrors); 
  emit('change', dateTimeRange);
};

// 還原預設
function reset() {
  selectedStartDay.value = new Date();
  selectedEndDay.value = new Date();
  selectedStartTime.value = '';
  selectedEndTime.value = '';
  if (validationErrors?.value) {
    Object.keys(validationErrors.value).forEach(k => (validationErrors.value[k] = ''));
  }
  initSelectedTime();
  emitChange();
}

defineExpose({ reset });

onMounted(() => {
  initSelectedTime();    
});
</script>
   
<style lang="scss" scoped>
@use '@/assets/scss/shared/index' as *;
@use '@/assets/scss/mixins/mixins' as *;
.add-time-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  .add-time-slot-form {
    display: flex;
    gap: 32px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    label {
      margin-bottom: 16px;
    }
    .error-message {
      @extend .caption;
      color: $wrong;
      margin-top: 4px;
    }
    .message-space {
      min-height: 24px;
    }
  }
}

.hint-text {
  @extend .caption;
  color: $primary;
  margin-top: 4px;
}

:deep(.menu) {
  z-index: 10 !important;
}

:deep(.disabled) {
  color: #999 !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.form-group:has(.error-message) {
  :deep(.control) {
    border: 1px solid $wrong !important;
    color: $wrong;
  }
  :deep(.datepicker-input-box) {
    border: 1px solid $wrong !important;
  }
}
</style>
  
  