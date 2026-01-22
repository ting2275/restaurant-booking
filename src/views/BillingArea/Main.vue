<template>
  <div class='main-box' :class='backgroundClass'>
    <component :is='currentComponent' v-bind='contractProps'/>

    <div class='tabs-box'>
      <FillTab
        :tabs='filteredTabs'
        :tab-content='filteredTabContent'
        :current-tab='activeTabIndex'
        v-bind='getTabProps()'
        @tab-change='handleTabChange'
      >
      </FillTab>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import TransactionHistory from "./TransactionHistory.vue";
import InvoiceInfo from "./InvoiceInfo.vue";
import { useTitle } from "@vueuse/core";
import { useTheme } from "@/stores/themeStore";
import { useTabManager } from '@/composables/useTabManager';
import { useUserStore } from '@/stores/userStore';
import ContractNew from '@/views/BillingArea/Main/ContractNew.vue';
import ContractOld from '@/views/BillingArea/Main/ContractOld.vue';
import { useTokenWatcher } from "@/composables/useTokenWatcher";
import { getContractList } from '@/services/api/billing';
const title = useTitle();
title.value = "帳務專區";

const userStore = useUserStore();
const themeStore = useTheme();
const backgroundClass = computed(() => themeStore.backgroundClass);
themeStore.setBackgroundClass('bg-gray');

const name = ref('');
const solution = ref('');
const solutionInfo = ref('');
const startDay = ref('');
const endDay = ref('');
const diffDay = ref(0);
const point = ref(0);
const usedPoint = ref(0);
const afterPoint = ref(0);

// 定義 tabs 和內容
const fillTabs = [
  { label: "交易紀錄", component: TransactionHistory },
  { label: "電子發票資訊", component: InvoiceInfo },
];

// 切換Tabs功能
const filteredTabContent = computed(() => {
  return filteredTabs.value.map(tab => tab.component)
});

const { activeTabIndex, changeTab, filteredTabs } = useTabManager(fillTabs);

const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);

const getTabProps = () => {
  if (activeTabIndex.value === 0) {
    return {
      currentPage: currentPage.value,
      totalPages: totalPages.value,
      totalItems: totalItems.value,
      updatePage: handlePageUpdate,
      contractData: contractData.value,
    };
  }
  return {};
}

const handleTabChange = (index) => {
  changeTab(index);
};

const handlePageUpdate = ({ totalItems: items, totalPages: pages, currentPage: page }) => {
  totalItems.value = items;
  totalPages.value = pages;
  currentPage.value = page;
};

// 特殊商家為11家早鳥客戶，係因應新方案轉換過渡期於前端寫死變數，確定早鳥客戶皆換約完成後移除相關邏輯
const specialMerchantIds = import.meta.env.VITE_SPECIAL_MERCHANT_IDS ? import.meta.env.VITE_SPECIAL_MERCHANT_IDS.split(',') : [];
const isSpecialMerchant = computed(() => specialMerchantIds.includes(userStore.merchantId));
// 動態元件選擇
const currentComponent = computed(() => isSpecialMerchant.value ? ContractOld : ContractNew);

import { useFormat } from '@/composables/useFormat';
const { formatPercent } = useFormat();

const contractData = ref(null);
const fetchContractList = async () => {
  // 測試用 上線前刪除
  // if (import.meta.env.MODE === 'development') {
  //   point.value = 100;
  //   usedPoint.value = 50;
  //   afterPoint.value = 50;
  //   return;
  // }
  try {
    const res = await getContractList(userStore.merchantId);
    if (res.success && res.data.contractData) {
      const data = res.data.contractData;

      point.value = Number(data.point);
      usedPoint.value = Number(data.usedPoint);

      const calcAfterPoint = point.value - usedPoint.value;
      afterPoint.value = calcAfterPoint;

      const isOver = calcAfterPoint < 0;
      const display = isOver ? Math.abs(calcAfterPoint) : calcAfterPoint;
      const percent = isOver || point.value <= 0 ? 0 : formatPercent(display, point.value);
      const label = isOver ? '當季超額單數' : '剩餘總單數';

      afterPointInfo.value = {
        isOver,
        display,
        percent,
        label
      };

      contractData.value = data;
      name.value = data.name;
      solution.value = data.solution;
      solutionInfo.value = data.solutionInfo;
      startDay.value = data.startDay;
      endDay.value = data.endDay;
      diffDay.value = data.diffDay;

      if (Number(data.afterPoint) !== calcAfterPoint) {
        console.warn('API afterPoint 與前端計算不一致', data.afterPoint, calcAfterPoint);
      }
    }
  } catch (error) {
    console.error('取得合約資料失敗', error);
  }
};

// 剩餘進度條計算
const afterPointInfo = ref({
  isOver: false,
  display: 0,
  percent: 0,
  label: ''
})

// 傳給元件的 props
const contractProps = computed(() => ({
  contractData: contractData.value,
  point: point.value,
  usedPoint: usedPoint.value,
  afterPoint: afterPoint.value,
  afterPointInfo: afterPointInfo.value,
  name: name.value,
  solution: solution.value,
  solutionInfo: solutionInfo.value,
  startDay: startDay.value,
  endDay: endDay.value,
  diffDay: diffDay.value,
}));

onMounted(() => {
  fetchContractList();
});

watch(
  () => userStore.merchantId,
  (newMerchantId) => {
    if (newMerchantId) {
      fetchContractList("watch merchantId");
    }
  }
);

// 監視切換分店
const reloadFunction = async () => {
  fetchContractList();
};

useTokenWatcher(reloadFunction);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/billingArea/_common.scss' as *;
</style>