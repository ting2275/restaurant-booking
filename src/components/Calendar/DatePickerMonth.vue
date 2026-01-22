<template>
  <Datepicker
    v-model:value='selectedMonth'
    :formatter='momentFormatter'
    :lang='zhTW'
    type='month'
    format='YYYY-MM'
    :inline='true'
    @change='onMonthSelected'
  />
</template>

<script setup>
import { ref, watch } from "vue";
import Datepicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import zhTW from "vue-datepicker-next/locale/zh-tw.es";
import moment from "moment";
import "moment/locale/zh-tw";
moment.locale("zh-tw");

const props = defineProps({
  initialMonth: {
    type: Date,
    default: () => new Date(),
  },
  onMonthChange: {
    type: Function,
    default: null,
  },
});

const momentFormatter = (date) => {
  return moment(date).format('YYYY-MM');
};

const selectedMonth = ref(momentFormatter(props.initialMonth));

// 監聽月份變化，調用 API 並回調父組件
watch(selectedMonth, async (newMonth) => {
  if (props.onMonthChange) {
    props.onMonthChange(newMonth);
  }
});

const onMonthSelected = (month) => {
  selectedMonth.value = month;
};
</script>

<style lang="scss">
@use '@/assets/scss/components/datepicker/_datepicker.scss' as *;
</style>
