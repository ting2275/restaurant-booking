<template>
  <div class='main-box'>
    <div class='hint-box'>
      <BaseButton variant='secondary' size='sm'>提醒</BaseButton>
      <p>
        請設定例行開放預訂的時段，非例行休息日可至特別公休日期設定。考量 Google 審核時間，修改後新設定需<span
        >24 - 48小時</span>生效，此前系統將維持前次設定。
      </p>
    </div>
    <div class='second-title-box'>
      <p>預訂時間設定</p>
    </div>
    <div class='dropdown-box'>
      <div class='dropdown-box-inner'>
        <div class='dropdown-box-inner-title'>
          <p>預訂時間</p>
          <p class='hint-text'>※ 設定最早到最晚可接受預訂的時間。</p>
        </div>
        <div class='dropdown-container'>
          <DropdownMenu
            id='AvailableTime'
            :key='openTime'
            v-model='openTime'
            :options='timeOptions'
            label-key='label'
            value-key='value'
            placeholder='起始時間'
            :is-searchable='false'
            :is-readonly='true'
            :is-view-only='isViewOnly'
            style='flex-basis: 100%;'
          />
          <span>至</span>
          <DropdownMenu
            id='EndTime'
            :key='closeTime'
            v-model='closeTime'
            :options='timeOptions'
            label-key='label'
            value-key='value'
            placeholder='結束時間'
            :is-searchable='false'
            :is-readonly='true'
            :is-view-only='isViewOnly'
            style='flex-basis: 100%;'
          />
        </div>
      </div>
    </div>
    <div class='dropdown-box'>
      <div class='dropdown-box-inner'>
        <div class='dropdown-box-inner-title'>
          <p>單次用餐時間</p>
          <p class='hint-text'>※ 請選擇顧客的用餐時間限制。</p>
        </div>
        <div class='dropdown-container'>
          <DropdownMenu
            id='eachTime-box'
            :key='eachTime'
            v-model='eachTime'
            :options='eachTimeOptions'
            label-key='label'
            value-key='value'
            :is-searchable='false'
            :is-readonly='true'
            :is-view-only='isViewOnly'
            style='flex-basis: 100%;'
          />
        </div>
      </div>
    </div>
    <div class='dropdown-box'>
      <div class='dropdown-box-inner'>
        <div class='dropdown-box-inner-title'>
          <p>可預訂時段間隔</p>
          <p class='hint-text'>※ 系統將自動排程並顯示可預訂時段。</p>
        </div>
        <div class='dropdown-container'>
          <DropdownMenu
            id='availableTime-box'
            :key='availableTime'
            v-model='availableTime'
            :options='availableTimeOptions'
            label-key='label'
            value-key='value'
            :is-searchable='false'
            :is-readonly='true'
            :is-view-only='isViewOnly'
            style='flex-basis: 100%;'
          />
        </div>
      </div>
    </div>

    <!-- 暫停某時段訂位 -->
    <PauseTimeSettings
      @update:pause-time-slots='handlePauseTimeSlotsUpdate'
    />

    <div class='second-title-box'>
      <p>可預訂時段</p>
    </div>
    <div class='time-slots-box'>
      <div class='buttons-box'>
        <BaseButton
          variant='cancel'
          size='lg'
          :class='clearAllButtonClass'
          @on-click='clearAllSlots'>
          清除
        </BaseButton>
        <BaseButton
          v-for='slot in availableSlots'
          :key='slot'
          :variant="isAllSelected(slot) ? 'check' : 'primary-variant'"
          size='lg'
          :class='selectAllButtonClass'
          @on-click='selectAllSlotsForSpecificTime(slot)'
        >
          全選
        </BaseButton>
      </div>
      <div v-for='day in weekArray' :key='day.value' class='weekday'>
        <p class='week-text'>{{ day.label }}</p>
        <div class='time-slots'>
          <BaseButton
            v-for='(slot, slotIndex) in generateSlotsForDay(day.value)'
            :key='slotIndex'
            :variant="isSelected(day.value, slot) ? 'check' : 'secondary'"
            size='lg'
            :class='buttonClass(day.value, slot)'
            @on-click='toggleSlotSelection(day.value, slot)'
          >
            {{ slot }}
          </BaseButton>
        </div>
      </div>
    </div>
    <div class='button-box'>
      <BaseButton variant='check' size='md' :is-view-only='isViewOnly' @on-click='handleSave'>儲存</BaseButton>
    </div>
  </div>

  <!-- 單一按鈕彈窗 -->
  <BasePopUp v-model='basePopup.show' :esc-button='true'>
    <template #title>{{ basePopup.title }}</template>
    <template #content>
      <div v-html='basePopup.content'></div>
    </template>
    <template #button>
      <BaseButton variant='check' size='md' @on-click='handleBasePopupConfirm'>
        {{ basePopup.buttonText }}
      </BaseButton>
    </template>
  </BasePopUp>
  <!-- 雙按鈕彈窗 -->
  <DoubleCheckPopUp v-model='doubleCheckPopup.show' :esc-button='true' >
    <template #title>{{ doubleCheckPopup.title }}</template>
    <template #content>
      <div v-html='doubleCheckPopup.content'></div>
    </template>
    <template #buttons>
      <BaseButton variant='cancel' size='sm' @on-click='handleDoubleCheckCancel'>
        {{ doubleCheckPopup.cancelText }}
      </BaseButton>
      <BaseButton variant='check' size='sm' @on-click='handleDoubleCheckConfirm'>
        {{ doubleCheckPopup.confirmText }}
      </BaseButton>
    </template>
  </DoubleCheckPopUp>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineExpose, inject } from "vue";
import { useTitle } from "@vueuse/core";
import { updateBusinessTime, updateTimePicker,getCheckClash, addTempClose } from "@/services/api/shop";
import { useShopStore } from "@/stores/shopStore";
import { storeToRefs } from "pinia";
import { useTokenWatcher } from "@/composables/useTokenWatcher";
import { useSystemStore } from '@/stores/systemStore';
import { onClickOutside } from '@vueuse/core';
import { useAccountStore } from '@/stores/accountStore';
import { usePopup } from '@/composables/usePopup';
import { useNotification } from '@/composables/notification';
import PauseTimeSettings from "@businessSettings/AvailableTime/components/PauseTimeSettings/index.vue";

const accountStore = useAccountStore();
const isViewOnly = computed(() => accountStore.isViewOnly);

const buttonClass = (day, slot) => {
  if (isViewOnly.value) {
    return isSelected(day, slot) ? 'check-view-only' : 'secondary-view-only';
  }
  return '';
};
const selectAllButtonClass = computed(() => {
  return isViewOnly.value ? 'select-all-view-only' : '';
});
const clearAllButtonClass = computed(() => {
  return isViewOnly.value ? 'clear-all-view-only' : '';
});

const systemStore = useSystemStore();
const title = useTitle();
title.value = "店家營業設定-可預訂時段";
const shopStore = useShopStore();
const { shopInfo } = storeToRefs(shopStore);
const isEditing = inject('isEditing')

// 彈窗
const {basePopup,doubleCheckPopup,showBasePopup,showDoubleCheckPopup,handleBasePopupConfirm,handleDoubleCheckConfirm,handleDoubleCheckCancel} = usePopup();

const servicePopupRef = ref(null);
const { toggleServicePopup } = useNotification();

onClickOutside(servicePopupRef, () => {
  toggleServicePopup();
}, {
  ignore: [servicePopupRef]
});

const openTime = ref("");
const closeTime = ref("");
const eachTime = ref(0);
const availableTime = ref(0);

// 暫停時段資料
const pauseTimeSlots = ref([]);
const handlePauseTimeSlotsUpdate = (slots) => {
  pauseTimeSlots.value = slots;
};

// 將 selectedSlots.timePicker 導出
const selectedSlots = ref({});
const timePicker = ref({});
defineExpose({
  selectedSlots,
  timePicker,
});

// timeOptions 的生成方式
const generateSlots = (start, end, interval) => {
  const slots = [];
  let startTime = start;
  let [endHour, endMinute] = end.split(":").map(Number);
  const availableTimeValue = parseInt(availableTime.value) || 0;
  const adjustEndTime = (hour, minute, adjustment) => {
    minute -= adjustment;
    if (minute < 0) {
      hour -= 1;
      minute += 60;
    }
    return [hour, minute];
  };
  if (availableTimeValue > 0) {
    [endHour, endMinute] = adjustEndTime(endHour, endMinute, availableTimeValue);
  }
  if (start === end) {
    endHour += 24;
  } else if (start > end) {
    endHour += 24;
  }
  let [currentHour, currentMinute] = startTime.split(":").map(Number);
  while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
    slots.push(startTime);
    currentMinute += interval;
    currentHour += Math.floor(currentMinute / 60);
    currentMinute %= 60;
    startTime = `${String(currentHour % 24).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
  }
  // 如果最後生成的時間等於 end，則刪除該插槽
  if (slots[slots.length - 1] === end) {
    slots.pop();
  }
  return slots;
};

const availableSlots = computed(() => {
  const interval = parseInt(availableTime.value) || 30;
  return generateSlots(openTime.value, closeTime.value, interval,);
});

const generateSlotsForDay = () => availableSlots.value;

// 時間選項
const eachTimeValues = [30, 60, 90, 120];
const eachTimeOptions = computed(() =>
  eachTimeValues.map(v => ({
    label: `${v}分鐘`,
    value: v
  }))
);
const timeValues = [15, 30, 45, 60, 75, 90];
const timeDropdownOptions = timeValues.map(v => ({
  label: `${v}分鐘`,
  value: Number(v),
  disabled: Number(eachTime.value) < v
}));
const availableTimeOptions = computed(() => {
  const each = Number(eachTime.value);
  return timeDropdownOptions.map(opt => ({
    ...opt,
    disabled: each < Number(opt.value)
  }));
});
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const weekArray = weekdays.map((label, day) => ({
  value: String(day),
  label: `${label}`
}));

// 開關可預訂時間段
const toggleSlotSelection = async (day, slot) => {
  isEditing.value = true;
  systemStore.setSystemIsEditing(true);
  const timePickerFormat = `${day},${slot}`;
  if (!selectedSlots.value[day]) {
    selectedSlots.value[day] = [];
  }
  const index = selectedSlots.value[day].indexOf(timePickerFormat);
  if (index > -1) {
    const previousTimePicker = timePickerFormat;
    selectedSlots.value[day].splice(index, 1);
    if (!timePicker.value[day]) {
      timePicker.value[day] = [];
    }
    const isClash = await checkTimePickerAPI(day, slot);
    if (isClash) {
      selectedSlots.value[day].push(previousTimePicker);
      return;
    }
    timePicker.value[day] = timePicker.value[day].filter(item => item !== slot);
  } else {
    selectedSlots.value[day].push(timePickerFormat);
    if (!timePicker.value[day]) {
      timePicker.value[day] = [];
    }
    timePicker.value[day].push(slot);
  }
};

const checkTimePickerAPI = async (day,slot) => {
    try {
      const response = await getCheckClash(
        openTime.value,
        closeTime.value,
        availableTime.value,
        day+","+slot
      );
      if (response.status === "error") {
        showBasePopup({
          title: '無法修改可預訂時段',
          content: '<p class="subtitle" style="margin-bottom: 8px;">已有預訂資料</p>需調整預訂資料才可修改，如需協助可以聯繫服務專員，我們將盡快與您聯繫',
          buttonText: '聯繫服務專員',
          onConfirm: handleContactService
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("獲取檢查衝突數據失敗:", error);
    }
};

const isSelected = (day, slot) => {
  return selectedSlots.value[day] && selectedSlots.value[day].includes(`${day},${slot}`);
};

// 全選某一時間段的按鈕邏輯
const selectAllSlotsForSpecificTime = (slot) => {
  weekArray.forEach((day) => {
    const dayKey = day.value;
    if (!selectedSlots.value[dayKey]) {
      selectedSlots.value[dayKey] = [];
      isEditing.value = true;
      systemStore.setSystemIsEditing(true);
    }
    const timePickerFormat = `${dayKey},${slot}`;
    if (!selectedSlots.value[dayKey].includes(timePickerFormat)) {
      selectedSlots.value[dayKey].push(timePickerFormat);
      isEditing.value = true;
      systemStore.setSystemIsEditing(true);
    }
  });
};

const isAllSelected = (slot) => {
  return weekArray.every((day) => isSelected(day.value, slot));
};

// 清除功能
const clearAllSlots = async () => {
  try {
    const checkClearAll = 1;
    const response = await getCheckClash(
      null,
      null,
      null,
      null,
      null,
      checkClearAll
    );
    if (response.status === "error") {
      showBasePopup({
        title: '無法清除所有時間段',
        content: '<p class="subtitle" style="margin-bottom: 8px;">已有預訂資料</p>需調整預訂資料才可修改，如需協助可以聯繫服務專員，我們將盡快與您聯繫',
        buttonText: '聯繫服務專員',
        onConfirm: handleContactService
      });
      return;
    }
    selectedSlots.value = {};
    isEditing.value = true;
    systemStore.setSystemIsEditing(true);
  } catch (error) {
    showBasePopup({
      title: '無法清除所有時間段',
      content: '<p class="subtitle" style="margin-bottom: 8px;">已有預訂資料</p>需調整預訂資料才可修改，如需協助可以聯繫服務專員，我們將盡快與您聯繫',
      buttonText: '聯繫服務專員',
      onConfirm: handleContactService
    });
    return;
  }
};

const savedTimePickerArray = ref([]);

// 儲存按鈕點擊事件
const handleSave = async () => {
  const availableSlots = generateSlots(openTime.value, closeTime.value, parseInt(availableTime.value) || 30);
  const timePicker = Object.values(selectedSlots.value).flat().filter((item) => {
    const [, time] = item.split(",");
    return availableSlots.includes(time);
  });
  const timePickerArray = timePicker.sort((a, b) => {
    const [dayA, timeA] = a.split(",");
    const [dayB, timeB] = b.split(",");
    if (dayA === dayB) {
      return timeA.localeCompare(timeB);
    }
    return dayA - dayB;
  });
  savedTimePickerArray.value = timePickerArray;
  const businessTimeData = {
    openTime: openTime.value,
    closeTime: closeTime.value,
    eachTime: eachTime.value,
    availableTime: availableTime.value,
    periodDay: shopInfo.value.periodDay,
    noReservate: shopInfo.value.noReservate,
    timePicker: timePickerArray,
  };
  try {
    const businessTimeResult = await updateBusinessTime(businessTimeData);
    if (!businessTimeResult.success) {
      throw new Error(businessTimeResult.message || "更新營業時間失敗");
    }
    
    const tempCloseData = pauseTimeSlots.value.map(slot => ({
      closeStartDay: slot.closeStartDay,
      closeEndDay: slot.closeEndDay
    }));
    const tempCloseResult = await addTempClose(tempCloseData);
    if (!tempCloseResult.success) {
      throw new Error(tempCloseResult.message || "更新暫停時段失敗");
    }

    const timePickerResult = await updateTimePicker({ timePicker: timePicker });
    if (!timePickerResult.success) {
      throw new Error(timePickerResult.message || "更新預訂時段失敗");
    }
    
    // 儲存完成
    selectedSlots.value = timePicker.reduce((acc, item) => {
      const [day] = item.split(",");
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    }, {});
    shopStore.fetchShopInfo();
    showBasePopup({title: '儲存成功',content: '資料已儲存完成'});
    isEditing.value = false
    systemStore.setSystemIsEditing(false);
  } catch (error) {
    console.error('儲存失敗:', error);
    showBasePopup({title: '儲存失敗',content: '請確實選取您的可預訂時段'});
  }
};

const timeOptions = computed(() => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      options.push({ label: time, value: time });
    }
  }
  return options;
});

let originalSelectedSlots = ref({});
const isInitialized = ref(false);
const isTimeReady = ref(false);

const initializeData = (info) => {
  isRestoring.value = true;
  isInitialized.value = false;
  openTime.value = info.openTime || "";
  closeTime.value = info.closeTime || "";
  availableTime.value = info.availableTime !== undefined ? Number(info.availableTime) : 0;
  eachTime.value = info.eachTime !== undefined ? Number(info.eachTime) : 0;
  if (Array.isArray(info.timePicker)) {
    selectedSlots.value = info.timePicker.reduce((acc, item) => {
      const [day] = item.split(",");
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    }, {});
    originalSelectedSlots.value = JSON.parse(JSON.stringify(selectedSlots.value));
  } else {
    selectedSlots.value = {};
    timePicker.value = [];
  }
  isInitialized.value = true;
  setTimeout(() => {
    isRestoring.value = false;
  }, 0);
};

// 聯絡服務專員
const handleContactService = () => {
  toggleServicePopup();
  showBasePopup.value = false;
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
};

// {{單次用餐時間 & 可預訂時段 功能}}
const prevTime = ref({
  eachTime: eachTime.value,
  availableTime: availableTime.value
});

const isRestoring = ref(false);

// 強制availableTime不會大於eachTime的變化
watch(eachTime, (newEach) => {
  if (Number(availableTime.value) > Number(newEach)) {
    availableTime.value = newEach;
  }
});

watch(
  eachTime,
  (newVal, oldVal) => {
    if (isRestoring.value) return;
    if (newVal !== oldVal) {
      prevTime.value = {
        eachTime: oldVal,
        availableTime: availableTime.value
      };
      checkUnmatchPopup();
    }
  },
  { flush: 'pre' }
);

watch(
  availableTime,
  (newVal, oldVal) => {
    if (isRestoring.value) return;
    if (newVal !== oldVal) {
      prevTime.value = {
        eachTime: eachTime.value,
        availableTime: oldVal
      };
      checkUnmatchPopup();
    }
  },
  { flush: 'pre' }
);

const timeUnmatchCancelLeave = () => {
  isRestoring.value = true;
  if (prevTime.value) {
    eachTime.value = prevTime.value.eachTime;
    availableTime.value = prevTime.value.availableTime;
  }
  doubleCheckPopup.show = false;
  setTimeout(() => {
    isRestoring.value = false;
  }, 0);
};

const timeUnmatchConfirmLeave = () => {
  doubleCheckPopup.show = false;
};

// 添加對 shopInfo 的監聽
watch(
  () => shopInfo.value,
  (newValue) => {
    if (newValue) {
      initializeData(newValue);
    }
  },
  { immediate: true }
);

// 通用監聽處理函式
const isClashChecking = ref(false);
function useTimeFieldWatcher(fieldRef, prevRef, getParams) {
  watch(
    () => fieldRef.value,
    async (newVal) => {
      if (!isInitialized.value) return;
      if (isRestoring.value) return;
      if (newVal !== shopInfo.value[getParams().fieldName]) {
        isEditing.value = true;
        systemStore.setSystemIsEditing(true);
      }
      if (newVal) {
        try {
          isClashChecking.value = true;
          const params = getParams();
          const response = await getCheckClash(
            params.openTime,
            params.closeTime,
            params.availableTime
          );
          isClashChecking.value = false;
          if (response.status === "error") {
            showBasePopup({
              title: '無法修改預訂時間',
              content: '<p class="subtitle" style="margin-bottom: 8px;">已有預訂資料</p>需調整預訂資料才可修改，如需協助可以聯繫服務專員，我們將盡快與您聯繫',
              buttonText: '聯繫服務專員',
              onConfirm: handleContactService
            });
            isRestoring.value = true;
            fieldRef.value = prevRef.value;
            await reloadFunction();
            setTimeout(() => {
              isRestoring.value = false;
            }, 0);
            return;
          }
        } catch (error) {
          isClashChecking.value = false;
          console.error("獲取檢查衝突數據失敗:", error);
        }
      }
    }
  );
}

function checkUnmatchPopup() {
  if (
    isTimeReady.value &&
    !isRestoring.value &&
    eachTime.value &&
    availableTime.value &&
    eachTime.value !== availableTime.value
  ) {
    showDoubleCheckPopup({
      title: '確定要進行此設定？',
      content: '當單次用餐時間與可預訂時段間隔<span style="color: #fc6300;">不一致</span>時，可能導致<span style="color: #fc6300;">訂單無法排滿</span>的情況  ',
      confirmText: '確認',
      cancelText: '取消',
      onConfirm: timeUnmatchConfirmLeave,
      onCancel: timeUnmatchCancelLeave
    });
  }
}

const fields = {openTime,closeTime,eachTime,availableTime};

const previous = {
  openTime: ref(openTime.value),
  closeTime: ref(closeTime.value),
  eachTime: ref(eachTime.value),
  availableTime: ref(availableTime.value)
};

const timeFields = [
  { key: 'openTime', label: '無法修改預訂時間' },
  { key: 'closeTime', label: '無法修改預訂時間' },
  { key: 'eachTime', label: '無法修改單次用餐時間' },
  { key: 'availableTime', label: '無法修改可預訂時段' }
];

onMounted(async () => {
  isInitialized.value = false;
  if (!shopInfo.value) {
    await shopStore.fetchShopInfo();
  }
  initializeData(shopStore.shopInfo);
  isInitialized.value = true;
  isTimeReady.value = true;
  timeFields.forEach(field => {
    useTimeFieldWatcher(
      fields[field.key],
      previous[field.key],
      () => ({
        openTime: openTime.value,
        closeTime: closeTime.value,
        eachTime: eachTime.value,
        availableTime: availableTime.value,
        fieldName: field.key
      }),
      field.label
    );
  });
});

const reloadFunction = async () => {
  try {
    await shopStore.fetchShopInfo();
    initializeData(shopStore.shopInfo);
  } catch (error) {
    console.error("重新加載店鋪信息失敗:", error);
  }
};

useTokenWatcher(reloadFunction);
</script>
<style lang="scss" scoped>
@use '@/assets/scss/pages/businessSettings/_availableTime.scss' as *;
</style>





