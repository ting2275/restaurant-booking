<template>
  <div class='main-box'>
    <div class='hint-box'>
      <BaseButton variant='secondary' size='sm'>提醒</BaseButton>
      <p>
        請設定不開放線上預訂日期。考量 Google 審核時間，修改後新設定將於<span>24 - 48小時</span>生效，此前系統將維持前次設定。
      </p>
    </div>

    <!-- 年月顯示欄位 -->
    <div class='month-picker'>
      <BaseButton variant='secondary' size='sm' @on-click='changeMonth(-1)'>
        <template #default>
          <img
            src='@/assets/images/icons/left-arrow.svg'
            alt='Previous Month'
            class='arrow-icon left-arrow'
            width='24'
            height='24'
          />
        </template>
      </BaseButton>
      <button class='currentMonth-btn' @click='toggleMonthPicker'>{{ currentMonthDisplay }}</button>
      <BaseButton variant='secondary' size='sm' @on-click='changeMonth(1)'>
        <template #default>
          <img
            src='@/assets/images/icons/right-arrow.svg'
            alt='Next Month'
            class='arrow-icon'
            width='24'
            height='24'
          />
        </template>
      </BaseButton>
    </div>

    <!-- 月份選擇彈窗 -->
    <div
      v-if='showMonthPickerPopup'
      class='month-picker-popup'
      :style='{ top: computedTop }'
      @mousedown.stop>
      <div class='year-box'>
        <button @click='changeYear(-1)'> 
          <img
            src='@/assets/images/icons/left-arrow.svg'
            alt='Previous Month'
            class=''
            width='24'
            height='24'
          />
        </button>
        <span>{{ currentYear }}年</span>
        <button @click='changeYear(1)'>
          <img
            src='@/assets/images/icons/right-arrow.svg'
            alt='Previous Month'
            class=''
            width='24'
            height='24'
          />
        </button>
      </div>

      <div class='month-grid'>
        <button
          v-for='(month, index) in months'
          :key='index'
          :class='{ active: isActiveMonth(index) }'
          @click='selectMonth(index)'
        >
          {{ month }}
        </button>
      </div>
    </div>

    <!-- 日期選擇器 -->
    <div class='date-grid'>
      <div v-for='day in daysOfWeek' :key='day' class='day-header'>{{ day }}</div>
      <BaseButton
        v-for='(date, index) in dates'
        :key='index'
        size='lg'
        :variant='getDateVariant(date)'
        :disabled='!isDateSelectable(date)'
        :class='{ 
          noClick: nextThreeDays.includes(formatDate(date)), 
          "gray-text": !isDateInCurrentMonth(date),
          "selected-view-only": isViewOnly && isSelected(date),
        }' 
        @on-click='toggleDate(date)'
      >
        {{ date ? date.getDate() : "" }}
      </BaseButton>
    </div>

    <div class='button-box'>
      <div class='date-hint-box'>
        <div class='date-hint-item'>
          <span class='dot dot-set'></span>
          已設定日期
        </div>
        <div class='date-hint-item'>
          <span class='dot dot-past'></span>
          過去已設定日期
        </div>
        <div class='date-hint-item'>
          <span class='dot dot-disabled'></span>
          不可設定日期
        </div>
      </div>
      <BaseButton variant='check' size='md' :is-view-only='isViewOnly' @on-click='saveHolidays'>儲存</BaseButton>
    </div>
  </div>

  <!-- 成功 Popup -->
  <BasePopUp v-model='showSuccessPopup' :esc-button='false'>
    <template #title>儲存成功</template>
    <template #content>資料已儲存完成</template>
    <template #button>
      <BaseButton variant='check' size='md' @on-click='showSuccessPopup = false'
      >我知道了</BaseButton
      >
    </template>
  </BasePopUp>

  <!-- 失敗 Popup -->
  <BasePopUp v-model='showFailurePopup' :esc-button='false'>
    <template #title>儲存失敗</template>
    <template #content>{{ errorMessage }}</template>
    <template #button>
      <BaseButton variant='check' size='md' @on-click='showFailurePopup = false'
      >我知道了</BaseButton
      >
    </template>
  </BasePopUp>

  <!-- 確定要設定特別公休日彈窗 -->
  <DoubleCheckPopUp v-model='showChangeHolidaysPopup' :esc-button='true'>
    <template #title>確定要設定特別公休日？</template>
    <template #content>
      <div class='content-text'>
        {{ failureMessage }}
        <p>
          若當日不營業，請務必提醒已預訂之顧客
        </p>
      </div>
    </template>
    <template #buttons>
      <BaseButton variant='cancel' size='sm' @on-click='handleCancel'>
        否
      </BaseButton>
      <BaseButton variant='check' size='sm' @on-click='handleConfirm'>
        是
      </BaseButton>
    </template>
  </DoubleCheckPopUp>
</template>


<script setup>
import { ref, computed, onMounted, watch,inject,onBeforeUnmount } from "vue";
import { updateHolidays,getCheckClash } from "@/services/api/shop";
import { useTitle } from "@vueuse/core";
import { useShopStore } from "@/stores/shopStore";
import { storeToRefs } from "pinia";
import { useTokenWatcher } from "@/composables/useTokenWatcher";
import { useSystemStore } from '@/stores/systemStore';
import { useAccountStore } from '@/stores/accountStore';

const accountStore = useAccountStore();
const isViewOnly = computed(() => accountStore.isViewOnly);

const systemStore = useSystemStore();
const title = useTitle();
title.value = "店家營業設定-特別公休日期";
const shopStore = useShopStore();
const { shopInfo } = storeToRefs(shopStore);
const isEditing = inject('isEditing')

// 彈窗
const showSuccessPopup = ref(false);
const showFailurePopup = ref(false);
const showChangeHolidaysPopup = ref(false);
const errorMessage = ref("保存失敗，請稍後再試");
const failureMessage = ref("當日已有預訂資料");

const selectedDates = ref([]);
const currentMonth = ref(new Date());

//非當月的日期文字灰色
const isDateInCurrentMonth = (date) => {
  return date.getMonth() === currentMonth.value.getMonth() && date.getFullYear() === currentMonth.value.getFullYear();
};

const daysOfWeek = ["日", "一", "二", "三", "四", "五", "六"];
const currentMonthDisplay = computed(() => {
  return `${currentMonth.value.getFullYear()}年${currentMonth.value.getMonth() + 1}月`;
});

// 月份選擇彈窗
const showMonthPickerPopup = ref(false);
const computedTop = computed(() => {
  return systemStore.isContractNotification ? 'calc(31% + 40px)' : '31%';
});

const toggleMonthPicker = () => {
  showMonthPickerPopup.value = !showMonthPickerPopup.value; 
};

const handleClickOutside = (event) => {
  const monthPickerPopup = document.querySelector('.month-picker-popup');
  const toggleButton = document.querySelector('.currentMonth-btn'); 
  if (
    monthPickerPopup && 
    !monthPickerPopup.contains(event.target) && 
    toggleButton && 
    !toggleButton.contains(event.target)
  ) {
    showMonthPickerPopup.value = false;
  }
};

const currentYear = ref(currentMonth.value.getFullYear());
const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

const changeYear = (delta) => {
  currentYear.value += delta;
};

const isActiveMonth = (index) => {
  return currentYear.value === currentMonth.value.getFullYear() && index === currentMonth.value.getMonth();
};

const selectMonth = (index) => {
  currentMonth.value.setFullYear(currentYear.value); 
  currentMonth.value.setMonth(index); 
  changeMonth(0); 
  showMonthPickerPopup.value = false; 
};

const dates = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const result = [];
  // 添加上個月的日期
  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();
  for (let i = firstDay.getDay(); i > 0; i--) {
    result.push(new Date(year, month - 1, prevMonthDays - i + 1));
  }
  // 添加當前月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    result.push(new Date(year, month, i));
  }
  // 添加下個月的日期，直到總數達到 35
  let nextMonthDay = 1;
  while (result.length < 35) {
    result.push(new Date(year, month + 1, nextMonthDay++));
  }
  return result;
});

// 將日期設置為3天後開始
const startDate = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const selectableStartDate = new Date(today);
  selectableStartDate.setDate(today.getDate() + 0); 
  return selectableStartDate;
});

// 計算今天、明天和後天的日期
const getNextThreeDays = () => {
  const today = new Date();
  return [
    today.toISOString().split('T')[0], 
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0], 
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0],  
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split('T')[0]  
  ];
};

// 在模板中使用
const nextThreeDays = getNextThreeDays();

const isDateSelectable = (date) => {
  if (!date) return false;
  return date >= startDate.value; 
};

const getDateVariant = (date) => {
  if (!date) return "primary-variant";
  const dateString = formatDate(date);
  if (selectedDates.value.includes(dateString)) {
    return "check"; 
  }
  return "primary-variant"; // 默認返回樣式
};

const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const changeMonth = (delta) => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() + delta);
  currentMonth.value = newDate; // 更新當前月份
};

const lastSelectedDate = ref(null); // 用於記錄最後選取的日期

const toggleDate = async (date) => {

  if (isViewOnly.value) {
    return; // 禁用點擊
  }

  const dateString = formatDate(date);
    // 檢查有沒有在三天禁用範圍內
    if (nextThreeDays.includes(dateString)) {
    return;
  }

  lastSelectedDate.value = dateString;
  holidays.value = dateString;

  const isCurrentMonth = date.getMonth() === currentMonth.value.getMonth() && date.getFullYear() === currentMonth.value.getFullYear();

  let isNewSelection = false;

  // 檢查是否已選取，若是則取消選取
  if (selectedDates.value.includes(dateString)) {
    const index = selectedDates.value.indexOf(dateString);
    selectedDates.value.splice(index, 1);
  } else {
    selectedDates.value.push(dateString);
    isNewSelection = true; // 標記為新選取
  }

  // 保存當前選擇的日期和假期
  originalSelectedDates.value = [...selectedDates.value];
  originalHolidays.value = holidays.value;

  // 只有在新選取時才檢查API
  if (isNewSelection) {
    try {
      const response = await getCheckClash(null, null, null, null, holidays.value);
      if (response.status === "error") {
        showChangeHolidaysPopup.value = true;
        holidays.value = '';
        const index = selectedDates.value.indexOf(lastSelectedDate.value);
        if (index !== -1) {
          selectedDates.value.splice(index, 1);
        }
      }
    } catch (error) {
      console.error("獲取檢查衝突數據失敗:", error);
    }
  }

  // 處理月份切換邏輯
  if (isCurrentMonth) {
    isEditing.value = true;
    systemStore.setSystemIsEditing(true);
    return;
  }

  if (currentMonth.value.getMonth() === 0 && date.getMonth() === 11) {
    changeMonth(-1);
    isEditing.value = true;
    systemStore.setSystemIsEditing(true);
    return;
  }

  if (currentMonth.value.getMonth() === 11 && date.getMonth() === 0) {
    changeMonth(1);
    isEditing.value = true;
    systemStore.setSystemIsEditing(true);
    return;
  }

  if (date.getMonth() < currentMonth.value.getMonth()) {
    changeMonth(-1);
    isEditing.value = true;
    systemStore.setSystemIsEditing(true);
    return;
  } else if (date.getMonth() > currentMonth.value.getMonth()) {
    changeMonth(1);
    isEditing.value = true;
    systemStore.setSystemIsEditing(true);
    return;
  }

  isEditing.value = true;
  systemStore.setSystemIsEditing(true);
};

const isSelected = (date) => {
  return selectedDates.value.includes(formatDate(date));
};

const saveHolidays = async () => {
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
  try {
    // 過濾和排序有效的假期日期
    const validHolidays = selectedDates.value
      .filter((dateString) => {
        const date = new Date(dateString);
        return isDateSelectable(date); 
      })
      .map((dateString) => {
        return new Date(dateString).toISOString().split("T")[0];
      })
      .sort((a, b) => new Date(a) - new Date(b));

    const response = await updateHolidays(validHolidays); 
    console.log("服務器響應:", response);
    selectedDates.value = validHolidays; 
    showSuccessPopup.value = true;

    shopStore.fetchShopInfo();
  } catch (error) {
    console.error("保存假期設置失敗:", error);
    console.log(
      "錯誤詳情:",
      shopStore.error || (error.response ? error.response.data : error.message)
    );
    showFailurePopup.value = true;
  }
};

// 暫存問題處理
const tempDates = ref([]); 

const initializeData = () => {
  if (shopInfo.value && shopInfo.value.holidays) {
    tempDates.value = [...shopInfo.value.holidays]; 
    selectedDates.value = [...shopInfo.value.holidays]; 
  } else {
    tempDates.value = []; 
    selectedDates.value = []; 
  }
  currentMonth.value = new Date(currentMonth.value);
};

onBeforeUnmount(() => {
  selectedDates.value = [...tempDates.value]; // 恢復原始資料
});

const reloadFunction = async () => {
  try {
    await shopStore.fetchShopInfo();
    initializeData();
  } catch (error) {
    console.error("重新加載店鋪信息失敗:", error);
  }
};

onMounted(async () => {
  try {
    if (!shopInfo.value) {
      await shopStore.fetchShopInfo();
    }
    initializeData();
  } catch (error) {
    console.error("獲取店鋪信息失敗:", error);
  }
});

// 監聽holidays
const holidays = ref('');
watch(
  () => holidays.value,
  async (newHolidays) => {
    // 避免彈窗跳兩次
    if (newHolidays === originalHolidays.value) return; 
    // 切換router判定
    if (newHolidays !== shopInfo.value.holidays) { 
      isEditing.value = true; 
      systemStore.setSystemIsEditing(true);
    }
    if (newHolidays) {
      try {
        const response = await getCheckClash(
          null, 
          null,
          null,
          null,
          newHolidays, 
        );
        if (response.status === "error") {
          showChangeHolidaysPopup.value = true; 
        }
        console.log("API Response:", response);
      } catch (error) {
        console.error("獲取檢查衝突數據失敗:", error);
      }
    }
  }
);

watch(
  () => shopInfo.value,
  (newShopInfo) => {
    if (newShopInfo) {
      initializeData();
    }
  },
  { deep: true }
);

// 月曆選擇彈窗
onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});

// 提示彈窗
const originalSelectedDates = ref([...selectedDates.value]); 
const originalHolidays = ref(holidays.value);

const handleCancel = () => {
  showChangeHolidaysPopup.value = false;
  originalSelectedDates.value = [...selectedDates.value];
  originalHolidays.value = holidays.value;
};

const handleConfirm = () => {
  selectedDates.value = [...originalSelectedDates.value]; 
  holidays.value = originalHolidays.value; 
  isEditing.value = true;
  systemStore.setSystemIsEditing(true);
  showChangeHolidaysPopup.value = false;
};

// 使用 token 監視器
useTokenWatcher(reloadFunction);
</script>

<style lang="scss" scoped>
@import '@/assets/scss/pages/businessSettings/_closeTime.scss';
</style>



