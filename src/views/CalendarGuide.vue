<template>
  <div class='component-guide'>
    <h2>日期選擇器使用指南</h2>

    <section>
      <h3>今日日期選擇</h3>
      <TodayButton @select-today='handleTodaySelected' />
      <p class='demo-text'>選定日期（今日）：{{ selectedDate }}</p>
    </section>

    <!-- 單日日期選擇器（按鈕類型） -->
    <section>
      <h3>單日日期選擇器（按鈕類型）</h3>
      <ButtonDatePicker
        :initial-date='new Date()'
        :date-classes='dateClasses'
        @button-date-change='handleDateChangeButton'
      />
      <p class='demo-text'>選定日期（按鈕類型）：{{ selectedDateButton }}</p>
    </section>

    <!-- 單日日期選擇器（輸入框類型） -->
    <section>
      <h3>單日日期選擇器（輸入框類型）</h3>
      <InputDatePicker
        :initial-date='new Date()'
        :date-classes='dateClasses'
        @input-date-change='handleDateChangeInput'
      />
      <p class='demo-text'>選定日期（輸入框類型）：{{ selectedDateInput }}</p>
    </section>

    <!-- 日期範圍選擇器 -->
    <section>
      <h3>日期範圍選擇器</h3>
      <RangePicker
        :initial-range='[new Date(), new Date()]'
        @range-change='handleRangeChange'
      />
      <p class='demo-text'>起始日期：{{ dateRange.start }}，結束日期：{{ dateRange.end }}</p>
    </section>

    <!-- 月份選擇器 -->
    <section>
      <h3>月份選擇器</h3>
      <DatePickerMonth
        :initial-month='new Date()'
        api-endpoint='mockApiEndpoint'
        :on-month-change='handleMonthChange'
      />
      <p class='demo-text'>選定月份：{{ selectedMonth }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 初始化選擇器的數據和函數
const selectedDate = ref('');
const selectedDateButton = ref('');
const selectedDateInput = ref('');
const dateRange = ref({ start: '', end: '' });
const selectedMonth = ref(new Date());
const dateClasses = ref({});

import { generateDateClasses } from '@/composables/common/useCalendar'

// 初始化日曆數據
onMounted(() => {
  generateDateClasses().then(result=>dateClasses.value = result)
});

// 日期選擇處理程序
const handleDateChangeButton = (date) => {
  selectedDateButton.value = date;
};

const handleDateChangeInput = (date) => {
  selectedDateInput.value = date;
};

const handleRangeChange = (range) => {
  dateRange.value.start = range[0];
  dateRange.value.end = range[1];
};

const handleMonthChange = (month) => {
  selectedMonth.value = month;
};

const handleTodaySelected = (date) => {
  selectedDate.value = date;
};
</script>

<style lang="scss" scoped>
.component-guide {
  padding: 20px;
}

section {
  margin-bottom: 40px;
}

h3 {
  margin: 15px 0;
}

.demo-text {
  margin: 10px 0;
}

:deep(.datepicker-button-box) {
  max-width: 180px;
}
</style>