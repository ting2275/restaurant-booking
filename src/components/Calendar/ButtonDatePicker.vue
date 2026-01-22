<!-- ButtonDatePicker.vue -->
<template>
  <div ref='datepickerBoxRef' class='datepicker-button-box' :class='{ disabled: isDisabled }'>
    <div class='date-nav-box'>
      <!-- 前一天按鈕 -->
      <button class='date-nav' :class='dateNavClass' title='往前一天' @click='changeDate(-1)'>
        <img src='@/assets/images/icons/left-arrow.svg' alt='前一天按鈕' />
      </button>
      <!-- 點擊觸發區 -->
      <div
        class='datepicker-range-box-trigger'
        :class="{ 'is-open': isDatepickerBoxOpen }"
        @click.stop='onDatepickerClick'
      ></div>
      <DatePicker
        v-model:value='selectedDate'
        :formatter='momentFormatter'
        :lang='zhTW'
        format='YYYY/M/D'
        :inline='true'
        class='datepicker-button'
        :clearable='false'
        :disabled='isDisabled'
        :disabled-date='isDisabledDate'
        :editable = 'isEditable'
        prefix-class='mx'
        @change='onDateSelected'
        @open='onDatepickerOpen'
        @close='onDatepickerClose'
        @panel-change='onPanelChange'
        @click='onDatepickerClick'
      />
      <!-- 後一天按鈕 -->
      <button class='date-nav' title='往後一天' @click='changeDate(1)'>
        <img src='@/assets/images/icons/right-arrow.svg' alt='後一天按鈕' />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watchEffect, watch, onUnmounted } from "vue";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import zhTW from "vue-datepicker-next/locale/zh-tw.es";
import moment from "moment";
import "moment/locale/zh-tw";
moment.locale("zh-tw");
zhTW.weekStart = 0;

const props = defineProps({
  initialDate: {
    type: [Date, String],
    default: () => new Date(),
  },
  onDateChange: {
    type: Function,
    default: null,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  isEditable: {
    type: Boolean,
    default: false,
  },
  dateClasses: {
    type: Object,
    default: () => ({}),
  },
  maxRangePast : {
    type: Number,
    default: -1,
  },
  maxRangeFuture: {
    type: Number,
    default: -1,
  },
});

const emit = defineEmits(["update:modelValue", "buttonDateChange"]);
const selectedDate = ref(new Date(props.initialDate));
const parentContainer = ref(null);

const statusClassMap = {
  isToday: 'today-date',
  selectedDay: 'selected-date',
  reservedDay: 'reserved-date',
  emptyDay: 'empty-date',
  expiredDay: 'unable-date'
};

watch(() => props.initialDate, (newVal) => {
  selectedDate.value = new Date(newVal);
});

// 格式化函數
const formatDate = (date) => moment(date).format('YYYY-MM-DD');
// 用於外部輸出的格式化日期
const formattedSelectedDate = computed(() => formatDate(selectedDate.value));

const momentFormatter = {
  stringify: (date) => (date ? moment(date).format('YYYY/M/D') : ''),
  parse: (value) => (value ? moment(value, 'YYYY/M/D').toDate() : null),
  getWeek: (date) => moment(date).week(),
};

const onDateSelected = (date) => {
  const oldDate = selectedDate.value;
  selectedDate.value = date;
  emit("update:modelValue", formattedSelectedDate.value);
  emit("buttonDateChange", formattedSelectedDate.value);
  handleDateChange(formattedSelectedDate.value);

  if (date.getMonth() !== oldDate.getMonth() || date.getFullYear() !== oldDate.getFullYear()) {
    nextTick(() => {
      applyDateClasses();
      setupCalendarClickListener();
    });
  }
};

const changeDate = (days) => {
  const newDate = new Date(selectedDate.value);
  newDate.setDate(newDate.getDate() + days);
  selectedDate.value = newDate;
  if(props.maxRangePast !== -1 && !checkBeforeLimitDate(newDate,props.maxRangePast + 1)){
    onDateSelected(newDate);
    nextTick(() => {
      applyDateClasses();
      setupCalendarClickListener();
    });
    isDatepickerBoxOpen.value = false;
  } else{
    return
  }
};

const checkBeforeLimitDate = (checkDate,limit) => {
  const today = new Date();
  const limitDate = new Date(today);
  limitDate.setDate(today.getDate() - limit);
  return (checkDate.getTime() <= limitDate.getTime()) ? true : false
}
const dateNavClass = ref('')
const lockChangeDateButton =(active=true) => {
  dateNavClass.value = active? 'lock':''
}

// 禁用日期
import { useDisablePeriod } from '@/composables/utilities/useCalendarInputs.js';
const isDisabledDate = (date) => {
  let { pastDisableDate , futureDisableDate } = useDisablePeriod(props.maxRangePast,props.maxRangeFuture)

  // const dateKey = formatDate(date);
  // const certainDisableDate = ['unable-date'].includes(props.dateClasses[dateKey])

  return (pastDisableDate && date < pastDisableDate) || ( futureDisableDate && date > futureDisableDate);
};

// 應用自定義的日期類別
const applyDateClasses = () => {
  const cells = document.querySelectorAll(".mx-calendar td");
  // 首先清除所有日期的自定義 class
  cells.forEach((cell) => {
    Object.values(statusClassMap).forEach((className) => {
      if (cell.classList.contains(className)) {
        cell.classList.remove(className);
      }
    });
  });

  // 遍歷每個日期單元格
  cells.forEach((cell) => {
    const dateTitle = cell.getAttribute("title");
    if (dateTitle) {
      const formattedDate = moment(dateTitle).format('YYYY-MM-DD');
      if (props.dateClasses[formattedDate]) {
        cell.classList.add(props.dateClasses[formattedDate]);
      }
    }
  });
};

const handleCalendarClick = () => {
  nextTick(applyDateClasses);
  setupCalendarClickListener();
};

const setupCalendarClickListener = () => {
  const calendar = document.querySelector('.mx-calendar');
  if (calendar) {
    calendar.addEventListener('click', handleCalendarClick);
  }
};

// 永遠監聽日曆變化的 MutationObserver
const setupMutationObserver = () => {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  const callback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const calendar = document.querySelector('.mx-calendar');
        if (calendar) {
          setupCalendarClickListener();
          observer.disconnect();
          break;
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
};

async function handleDateChange(date) {
  if (props.onDateChange) {
    props.onDateChange(date);
  }
}

onMounted(() => {
  nextTick(() => {
    setupMutationObserver();
    setupCalendarClickListener();
  });
  document.addEventListener('click', clickOutsideCalendar);
  emit("buttonDateChange", formattedSelectedDate.value);
});

onUnmounted(() => {
  document.removeEventListener('click', clickOutsideCalendar);
});

const isDatepickerBoxOpen = ref(false);
const datepickerBoxRef = ref(null);
const onDatepickerClick = () => {
  isDatepickerBoxOpen.value = !isDatepickerBoxOpen.value;
};

const clickOutsideCalendar = (event) => {
  if (datepickerBoxRef.value && !datepickerBoxRef.value.contains(event.target)) {
    isDatepickerBoxOpen.value = false;
  }
};

// 監聽 dateClasses 的變化，並重新應用樣式
watchEffect(() => {
  if (parentContainer.value && document.querySelector(".mx-calendar")) {
    nextTick(applyDateClasses);
  }
});

const onDatepickerOpen = () => {
  nextTick(() => {
    applyDateClasses();
    setupCalendarClickListener();
    const datepickerCalendar = document.querySelector('.mx-datepicker-main');
    if (datepickerCalendar) {
      datepickerCalendar.classList.add("custom-calendar-style");
    }
  });
};

const onDatepickerClose = () => {
  nextTick(() => {
    applyDateClasses();
    setupCalendarClickListener();
  });
};

const onPanelChange = (type, oldType) => {
  if (type === 'date' || oldType === 'date') {
    nextTick(() => {
      applyDateClasses();
      setupCalendarClickListener();
    });
  }
};

watch(selectedDate, (newDate) => {
  // 鎖定往回的箭頭按鈕
  if(props.maxRangePast !== -1){
    lockChangeDateButton(checkBeforeLimitDate(newDate,props.maxRangePast))
  }
});
</script>

<style lang="scss">
@use '@/assets/scss/components/datepicker/_datepicker.scss' as *;
</style>