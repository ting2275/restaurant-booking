<template>
  <div class='main-box'>
    <div class='hint-box'>
      <BaseButton variant='secondary' size='sm'>提醒</BaseButton>
      <p>
        請設定欲開放預訂的時間。考量 Google 審核時間，修改後新設定需<span
        >24 - 48小時</span
        >生效，此前系統將維持前次設定。
      </p>
    </div>

    <div class='dropdown-box'>
      <div class='dropdown-box-inner'>
        <p>
          開放預訂時間<br /><br />
          ※ 如設定四週，則為當日起的四週內。
        </p>
        <div class='dropdown-container'>
          <DropdownMenu
            :key='selectedPeriod'
            v-model='selectedPeriod'
            :options='periodDay'
            :is-searchable='false'
            :is-readonly='true'
            :is-view-only='isViewOnly'
            label-key='label'
            value-key='value'
          />
        </div>
      </div>
    </div>

    <div class='checkbox-box'>
      <div class='checkbox-box02'>
        <p>當日預訂</p>
        <div class='check-box03'>
          <RadioBox
            id='open'
            v-model='selectedOption'
            :for-name="'reservation'"
            :value='true'
            :custom-class="'single-radio'"
            :is-view-only='isViewOnly'
            @update:model-value='onChecked'
          >開啟</RadioBox>
          <RadioBox
            id='close'
            v-model='selectedOption'
            :for-name="'reservation'"
            :value='false'
            :custom-class="'single-radio'"
            :is-view-only='isViewOnly'
            @update:model-value='offChecked'
          >關閉</RadioBox>
        </div>
      </div>
      <p>
        ※ 設定是否開放當天的預訂，如選擇開放當日預訂，系統預設的最後訂位時間為每個時段的前兩小時。
      </p>
    </div>
    <div class='button-box'>
      <BaseButton
        variant='check' size='md' 
        :is-view-only='isViewOnly'
        @on-click='saveSettings'
      >儲存</BaseButton>
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
</template>

<script setup>
import { ref, onMounted, watch,inject } from "vue";
import { useTitle } from "@vueuse/core";
import { updateBusinessTime } from "@/services/api/shop";
import { useShopStore } from "@/stores/shopStore";
import { storeToRefs } from "pinia";
import { useTokenWatcher } from "@/composables/useTokenWatcher";
import { useSystemStore } from '@/stores/systemStore';
import { useAccountStore } from '@/stores/accountStore';

const systemStore = useSystemStore();
const accountStore = useAccountStore();

// 是否為檢視模式
const isViewOnly = ref(false);
const GOOGLE_STATUS = 8;
watch(
  () => accountStore.googleStatus,
  (newStatus) => {
    isViewOnly.value = newStatus === GOOGLE_STATUS;
  },
  { immediate: true }
);

const title = useTitle();
title.value = "店家營業設定-時間管理";

const shopStore = useShopStore();
const { shopInfo } = storeToRefs(shopStore);

// 彈窗
const showSuccessPopup = ref(false);
const showFailurePopup = ref(false);
const errorMessage = ref("更新失敗");

const selectedOption = ref(false);

const isEditing = inject('isEditing')
const selectedPeriod = ref("");
const periodDay = [
  { label: "一週", value: "7" },
  { label: "兩週", value: "14" },
  { label: "三週", value: "21" },
  { label: "四週", value: "28" },
];

const isOn = ref(true);
const isOff = ref(false);

const onChecked = (newValue) => {
  if (newValue) {
    isOff.value = false;
    isOn.value = true;
    isEditing.value = true;
    systemStore.setSystemIsEditing(true);
  }
};

const offChecked = (newValue) => {
  if (newValue) {
    isOn.value = false;
    isOff.value = true;
    isEditing.value = true;
    systemStore.setSystemIsEditing(true);
  }
};

const initializeData = () => {
  if (shopInfo.value) {
    if (shopInfo.value.periodDay) {
      selectedPeriod.value = shopInfo.value.periodDay;
    }
    if (shopInfo.value.noReservate !== undefined) {
      isOn.value = shopInfo.value.noReservate === "0";
      isOff.value = shopInfo.value.noReservate !== "0";
      selectedOption.value = shopInfo.value.noReservate === "0"; 
    }
  }
};

const fetchData = async () => {
  try {
    await shopStore.fetchShopInfo(); 
    initializeData();
  } catch (error) {
    console.error("獲取店鋪信息失敗:", error);
  }
};

const saveSettings = async () => {
  const businessTimeData = {
    periodDay: selectedPeriod.value,
    noReservate: isOff.value ? "1" : "0",
    eachTime: shopInfo.value.eachTime,
    openTime: shopInfo.value.openTime,
    closeTime: shopInfo.value.closeTime,
  };
  try {
    const result = await updateBusinessTime(businessTimeData);
    if (result.success) {
      showSuccessPopup.value = true;
      shopStore.setShopInfo({ ...shopInfo.value, ...businessTimeData });
      shopStore.fetchShopInfo();
    } else {
      errorMessage.value = result.message || "更新失敗";
      showFailurePopup.value = true;
    }
  } catch (error) {
    console.error("更新時間發生錯誤:", error);
    showFailurePopup.value = true;
  }
  // 更新Pinia
  shopStore.$patch({
    shopInfo: {
      periodDay: selectedPeriod.value,
      noReservate: isOff.value ? "1" : "0",
    },
  });
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
};

onMounted(async () => {
  await fetchData(); 
});

// 監聽 shopInfo 的變化
watch(
  () => shopInfo.value,
  () => {
    initializeData();
  },
  { deep: true }
);

// 切換router判定
watch(
  () => selectedPeriod.value,
  (newPeriodDay) => {
    if (newPeriodDay !== shopInfo.value.periodDay) { 
      isEditing.value = true; 
      systemStore.setSystemIsEditing(true);
    }
  }
);

const reloadFunction = async () => {
  await fetchData(); 
};
useTokenWatcher(reloadFunction);
</script>

<style lang="scss" scoped>
*{
  letter-spacing: 0.16em;
  color: $black-900;
}

.main-box {
  margin: 0px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 36px 64px;
  gap: 40px;
  width: 640px;
  @media (max-width: 768px) {
    width: 100%;
    max-width: 640px;
  }
  .hint-box {
    display: flex;
    p {
      align-self: center;
      margin: 0 0 0 16px;
      color: $black-900;
      letter-spacing: 0.16em;
      span {
        color: $primary;
      }
    }
  }
  :deep(.btn-secondary) {
    white-space: nowrap;
    border-radius: 24px;
    padding: 8px 16px;
  }

  .dropdown-box {
    display: flex;
    flex-direction: column;
    .dropdown-box-inner {
      display: flex;
      justify-content: flex-start;
      align-items: start;
      @media (max-width: 768px) {
        justify-content: flex-start;
      }
      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.8;
        white-space: nowrap;
        width:320px;
        margin: 0 40px 0 0;
      }

      .dropdown-container {
        display: flex;
        align-items: center;
        width: 100%;
        .dropdown {
          width: 100%; /* 控制下拉框的寬度 */
        }
        span {
          margin: auto 20px;
        }
      }
    }
    p {
      margin: 8px 0 0 0;
    }
  }
  :deep(.single-value) {
    white-space: nowrap;
    color: $black-900;
  }
  :deep(.menu) {
    color: $black-900;
  }
  :deep(.menu-option) {
    color: $black-900;
  }
  :deep(.btn-md){
  width: 196px;
  height: 40px;
  }
  // 開放預訂時間dropdown

  :deep(.select-wrapper){
    width: 100%;
  }
  .checkbox-box {
    display: flex;
    flex-direction: column;
    .checkbox-box02 {
      display: grid;
      width: 100%;
      grid-template-columns: 320px 100%;
      p {
        margin: auto 40px auto 0;
        width: 320px;
      }
      .check-box03 {
        display: flex;
        align-items: center;
        height: 40px;
        margin: auto 0;
        gap: 40px;
        .checkbox-group {
          margin: 0 20px 0 0;
        }
      }
    }
    p {
      margin: 8px 0 0 0;
    }
  }
}
.button-box {
  display: flex;
  justify-content: end;
}
</style>
