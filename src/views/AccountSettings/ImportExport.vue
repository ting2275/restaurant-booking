<template>
  <div class='main-box'>
    <h4>匯出</h4>
    <div class='main-container'>
      <div class='reminder'>
        <div class='tag'>提醒</div>
        <div class='reminder-content'>可匯出過去的預訂資料。</div>
      </div>
      <div class='export-container'>
        <RangePicker
          :initial-range='[new Date(), new Date()]'
          :max-range-past='EXPORT_DATE_RANGE.MAX_RANGE_PAST'
          :max-range-future='EXPORT_DATE_RANGE.MAX_RANGE_FUTURE'
          @range-change='handleRangeChange'
        />
        <BaseButton :variant='exportButton.variant' :size='exportButton.size' @click='exportData'>匯出</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref , watch } from 'vue'
import { exportBookingInfo } from '@/services/api/booking.js'
import {useUserStore} from '@/stores/userStore'
import { EXPORT_DATE_RANGE } from '@/composables/export/constants/config';

const userStore = useUserStore()
const storeName = ref(userStore.storeName)

const dateRange = ref({ start: '', end: '' });

const handleRangeChange = (range) => {
  dateRange.value.start = new Date(range[0]).toISOString().split('T')[0];
  dateRange.value.end = new Date(range[1]).toISOString().split('T')[0];
};
import { useCSVDownload } from '@/composables/common/useFileDownload';
const exportData = async () => {
  try {
    const result = await exportBookingInfo(dateRange.value.start, dateRange.value.end)
    let fileName = `${storeName.value} - 預訂資料(${dateRange.value.start}-${dateRange.value.end})`
    useCSVDownload(result, fileName)
  } catch (error) {
    console.error('Error getting customer status:', error);
  }
}
const exportButton = ref({ variant: 'cancel', size: 'sm', label: '匯出' });

watch(
  () => userStore.storeName,
  (newVal) => {
    storeName.value = newVal;
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.highlight {
  color: $primary;
}

.reminder {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 40px;
  letter-spacing: 2px;
}

.tag {
  color: $primary;
  background-color: $secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 79px;
  height: 32px;
  border-radius: 24px;
}

.export-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>