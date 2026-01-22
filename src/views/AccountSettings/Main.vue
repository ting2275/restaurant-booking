<template>
  <div class='tabs-box' :class='backgroundClass'>
    <FillTab
      :key='activeTabIndex'
      :tabs='filteredTabs'
      :tab-content='filteredTabContent'
      :current-tab='activeTabIndex'
      @tab-change='handleTabChange'
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTitle } from '@vueuse/core'
const title = useTitle()
title.value = '帳號設定'

import { useTheme } from '@/stores/themeStore';
const themeStore = useTheme();
const backgroundClass = computed(() => themeStore.backgroundClass);
themeStore.setBackgroundClass('bg-gray');

import FillTab from '@/components/Buttons/FillTab.vue';
import Permissions from "./Permissions.vue";
import Information from "./Information.vue";
import BusinessSync from "./BusinessSync.vue";
import Consultation from "./Consultation.vue";
import Contracts from "./Contracts.vue";
import ImportExport from "./ImportExport.vue";

import { useUserRole } from '@/composables/useUserRole';

// FillTab的分頁名稱.以及分頁的內容;
const fillTabs = [
  { label: "帳號資訊", component: Information },
  { label: "權限管理", component: Permissions },
  { label: "合約概況", component: Contracts },
  { label: "終止連動", component: BusinessSync },
  { label: "問題諮詢", component: Consultation },
  { label: "匯出", component: ImportExport },
];

const { isAdmin, isManager, isStaff } = useUserRole();

const roleRestrictions = {
  admin: [],
  manager: [3],
  staff: [1, 2, 3, 5],
}
const restrictedTabs = computed(() => {
  if (isAdmin.value) return roleRestrictions.admin;
  else if (isManager.value) return roleRestrictions.manager;
  else if (isStaff.value) return roleRestrictions.staff;
  else return [];
});

const filteredTabContent = computed(() => {
  return filteredTabs.value.map(tab => tab.component)
});

import { useTabManager } from '@/composables/useTabManager';

const { activeTabIndex, changeTab, filteredTabs } = useTabManager(fillTabs, restrictedTabs.value);

const handleTabChange = (index) => {
  changeTab(index);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/accountSettings/_common.scss' as *;

.tabs-box{
display: flex;
justify-content: center;
align-items: center;
flex-direction: column;
}
@media (max-width: 1024px){
  :deep(.tabs-container){
    .btn{
      padding: 10px 20px;
    }
  }
}
</style>
