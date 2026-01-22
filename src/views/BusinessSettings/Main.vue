<template>
  <div class='tabs-box'>
    <BorderTab
      :tabs='filteredTabs'
      :tab-content='filteredTabContent'
      :current-tab='activeTabIndex'
      :is-change-event='isChangeEvent'
      @tab-change='handleTabChange'
    >
    </BorderTab>

    <!-- router確認離開彈窗 -->
    <DoubleCheckPopUp v-model='leaveAlertPopup'>
      <template #title>資料尚未儲存</template>
      <template #content>確定要離開此頁面？</template>
      <template #buttons>
        <BaseButton variant='cancel' size='sm' @on-click='cancelLeave'> 取消 </BaseButton>
        <BaseButton variant='check' size='sm' @on-click='confirmLeave'> 確定 </BaseButton>
      </template>
    </DoubleCheckPopUp>

    <!-- tabs確認離開彈窗 -->
    <DoubleCheckPopUp v-model='changeTabPopup'>
      <template #title>資料尚未儲存</template>
      <template #content>確定要離開此頁面？</template>
      <template #buttons>
        <BaseButton variant='cancel' size='lg' @on-click='cancelTabLeave'> 取消 </BaseButton>
        <BaseButton variant='check' size='lg' @on-click='confirmTabLeave'> 確定 </BaseButton>
      </template>
    </DoubleCheckPopUp>
  </div>
</template>

<script setup>
import { ref, provide, computed } from "vue";
import AvailableTime from "@businessSettings/AvailableTime/index.vue";
import CloseTime from "@businessSettings/CloseTime.vue";
import OpenTime from "@businessSettings/OpenTime.vue";
import Tables from "@businessSettings/Tables.vue";
import Policy from "@businessSettings/Policy.vue";
import { useTitle } from "@vueuse/core";
import { useTheme } from "@/stores/themeStore";
import { onBeforeRouteLeave } from "vue-router";
import { useSystemStore } from '@/stores/systemStore';

const title = useTitle();
title.value = "店家營業設定";
const themeStore = useTheme();
themeStore.setBackgroundClass("bg-white");

const systemStore = useSystemStore();

//切換Tabs
const borderTabs = [
  { label: "桌型設定", component: Tables },
  { label: "時間管理", component: OpenTime },
  { label: "可預訂時段", component: AvailableTime },
  { label: "特別公休日期", component: CloseTime },
  { label: "預訂政策", component: Policy },
];

// 跳轉彈窗:
// 取消和確定按鈕的處理函數
const isEditing = ref(false);
provide('isEditing', isEditing);
let pendingNext;
const leaveAlertPopup = ref(false);
const changeTabPopup = ref(false);

// 取消按鈕的處理函數
const cancelLeave = () => {
  leaveAlertPopup.value = false;
  if(pendingNext){
    pendingNext(false)
  }
};

const confirmLeave = () => {
  leaveAlertPopup.value = false;
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
  if(pendingNext){
    pendingNext()
    pendingNext = null
  }
}

const beforeRouteLeave = (to, from, next) => {
  if (systemStore.systemIsEditing) {
    leaveAlertPopup.value = true;
    pendingNext = next;
  } else {
    next();
  }
};

onBeforeRouteLeave(beforeRouteLeave);

// 切換Tab的判斷功能
const isChangeEvent = computed(() => {
  return isEditing.value;
});

let pendingIndex

// 切換Tabs功能
const filteredTabContent = computed(() => {
  return filteredTabs.value.map(tab => tab.component)
});

import { useTabManager } from '@/composables/useTabManager';

const { activeTabIndex, changeTab, filteredTabs } = useTabManager(borderTabs);

const handleTabChange = (index) => {
  if (!systemStore.systemIsEditing) {
    changeTab(index);
  } else {
    changeTabPopup.value = true;
    pendingIndex = index;
  }
};

const cancelTabLeave = () => {
  changeTabPopup.value = false;
};

const confirmTabLeave = async () => {
  changeTabPopup.value = false;
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
  activeTabIndex.value = pendingIndex
  await changeTab(pendingIndex);
}

</script>

<style lang="scss" scoped>
.tabs-box {
  display: flex;
  align-items: center;
  flex-direction: column;
}
:deep(.tabs-container) {
  border-bottom: 1px solid #cccccc;
  display: flex;
  justify-content: space-between;
  width: 640px;
  padding: 0 20px !important;
  gap: 0px !important;
  white-space: nowrap;
  @media (max-width: 768px) {
    width: 100%;
    max-width: 640px;
  }
}
</style>
