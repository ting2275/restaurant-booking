<template>
  <div ref='datepickerBoxRef' class='datepicker-range-box' :class='{ disabled: isDisabled, "is-rounded": isRounded }'>
    <!-- 點擊觸發區 -->
    <div
      class='datepicker-range-box-trigger'
      :class="{ 'is-open': isDatepickerBoxOpen }"
      @click.stop='onDatepickerClick'
    ></div>
    <Datepicker
      v-model:value='selectedRange'
      :formatter='momentFormatter'
      :lang='zhTW'
      range
      :inline='true'
      class='datepicker-range'
      :clearable='false'
      :disabled='isDisabled'
      :editable = 'isEditable'
      prefix-class='mx'
      :separator="' - '"
      :disabled-date='disabledDate'
      @change='onRangeSelected'
      @click='onDatepickerClick'
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import Datepicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import zhTW from "vue-datepicker-next/locale/zh-tw.es";
import moment from "moment";
import "moment/locale/zh-tw";
moment.locale("zh-tw");

const props = defineProps({
  initialRange: {
    type: Array,
    default: () => [new Date(), new Date()],
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  isEditable: {
    type: Boolean,
    default: false,
  },
  onRangeChange: {
    type: Function,
    default: null,
  },
  maxRangePast : {
    type: Number,
    default: -1,
  },
  maxRangeFuture: {
    type: Number,
    default: -1,
  },
  isRounded: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "rangeChange"]);

// 內部使用 Date 對象
const selectedRange = ref(props.initialRange);
const isDatepickerBoxOpen = ref(false);
const datepickerBoxRef = ref(null);

// 格式化函數
const formatDate = (date) => moment(date).format('YYYY-MM-DD');

// 用於外部輸出的格式化日期範圍
const formattedSelectedRange = computed(() => {
  return selectedRange.value.map(date => formatDate(date));
});

const momentFormatter = {
  stringify: (date) => (date ? moment(date).format('YYYY/M/D') : ''),
  parse: (value) => (value ? moment(value, 'YYYY/M/D').toDate() : null),
};

// 禁用日期
import { useDisablePeriod } from '@/composables/utilities/useCalendarInputs.js';
const disabledDate = (date) => {
  let { pastDisableDate , futureDisableDate } = useDisablePeriod(props.maxRangePast,props.maxRangeFuture)

  return (pastDisableDate && date < pastDisableDate) || ( futureDisableDate && date > futureDisableDate);
};

// 監聽日期範圍變化，調用 API 並回調父組件
watch(selectedRange, async () => {
  emit("update:modelValue", formattedSelectedRange.value);
  emit("rangeChange", formattedSelectedRange.value);
  props.onRangeChange?.(formattedSelectedRange.value);
});

const onRangeSelected = (range) => {
  selectedRange.value = range;
};

const onDatepickerClick = () => {
  isDatepickerBoxOpen.value = !isDatepickerBoxOpen.value;
};

const clickOutsideCalendar = (event) => {
  if (datepickerBoxRef.value && !datepickerBoxRef.value.contains(event.target)) {
    isDatepickerBoxOpen.value = false;
  }
};

// 初始化時發出格式化的日期範圍
onMounted(() => {
  document.addEventListener('click', clickOutsideCalendar);
  emit("rangeChange", formattedSelectedRange.value);
});

onUnmounted(() => {
  document.removeEventListener('click', clickOutsideCalendar);
});

</script>

<style lang="scss">
@use '@/assets/scss/components/datepicker/_datepicker.scss' as *;
</style>
