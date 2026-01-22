<template>
  <div>
    <div class='top-box'>
      <div class='filter-box'>
        <div class='range-picker-box'>
          <YearDropdown v-model='selectedYear'/>
        </div>
      </div>
    </div>
    <div :style='{ minHeight: heightStyle }' class='height-box'>
      <BaseTable
        :headers='listHeads'
        :rows='historyData'
        :row-key='row => row.ID'
      >
        <template #default='{ row:{ID, startDay, endDay, contractInfo, amount, payType, payDate, status, taxNo, orderId, contractType} }'>
          <div class='orderId-box'>
            <p>{{ ID }}</p>
          </div>
          <div>
            <p>
              {{ showDate(startDay) }} -<br>
              {{ showDate(endDay) }}
            </p>
          </div>
          <div>{{ contractInfo }}</div>
          <div>
            <p class='amount-text'>{{ amount }}</p>
          </div>
          <div>
            <p>{{ payType }}</p>
          </div>
          <div>
            <p>{{ showDate(payDate) }}</p>
          </div>
          <div>
            {{ status }}<br />
            <a @click='handlePdfDownload(ID, orderId, contractInfo, payType,contractType)'>{{ pdfDownload }}</a>
          </div>
          <div class='taxNo-box'>
            <p>{{ taxNo }}</p>
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted } from "vue";
import { useTokenWatcher } from "@/composables/useTokenWatcher";
import { getContractList } from "@/services/api/billing";
import { useUserStore } from "@/stores/userStore";
import { useFormat } from "@/composables/useFormat";
import { useSystemStore } from "@/stores/systemStore";
import YearDropdown from "./TransactionHistory/YearDropdown.vue";

const systemStore = useSystemStore();

const heightStyle = computed(() => {
  return systemStore.isContractNotification
    ? "calc(100dvh - 280px)"
    : "calc(100dvh - 240px)";
});

const { formatDate } = useFormat();

const userStore = useUserStore();

// 年份選擇器
const selectedYear = ref(new Date().getFullYear());

watch(selectedYear, () => {
  fetchContractList();
});

// 表格
const listHeads = ref(["訂單編號","計費期間","內容","金額","付款方式","付款日","狀態","發票"]);

// 狀態Map
const statusMap = {
  0: "待付款",
  1: "已付款",
  9: "交易失敗",
};

// {{取得繳費單資料}} 未完成
import { usePaymentDetail } from "@/composables/usePaymentDetail";

const { paymentDetailData, fetchPaymentDetail } = usePaymentDetail();
const orderDetail = ref({});
const merchantId = computed(() => userStore.merchantId);

// 特殊商家為11家早鳥客戶，係因應新方案轉換過渡期於前端寫死變數，確定早鳥客戶皆換約完成後移除相關邏輯
const specialMerchantIds = import.meta.env.VITE_SPECIAL_MERCHANT_IDS ? import.meta.env.VITE_SPECIAL_MERCHANT_IDS.split(',') : [];

const isSpecialMerchant = computed(() => specialMerchantIds.includes(merchantId.value));

const pdfDownload = computed(() => {
  return specialMerchantIds.includes(merchantId.value) ? '' : '繳費單';
});
const customerName = computed(() => userStore.storeName);

async function loadOrderData(orderId, contractType) {
  if (orderId && contractType) {
    await fetchPaymentDetail({ orderId, contractType });
    orderDetail.value = paymentDetailData.value;
  } else {
    console.error("orderId is empty");
  }
}

// 繳費單 下載
import { usePaymentDownload } from "@/composables/usePaymentDownload";
const { paymentDownload } = usePaymentDownload();
async function handlePdfDownload(ID, orderId, contractInfo, payType, contractType) {
  if (specialMerchantIds.includes(merchantId.value)) return;
  await loadOrderData(orderId, contractType);

  const id = ID;
  paymentDownload(orderDetail.value, customerName.value, id, payType, contractInfo, contractType);
}

// 獲取交易紀錄列表資料
const historyData = ref([]);

const scrollToTop = inject("scrollToTop");

const fetchContractList = async () => {
  try {
    const res = await getContractList(merchantId.value, selectedYear.value);
    if (res.success && res.data) {
      processContractData(res.data);
    } else {
      console.warn("fetchContractList 失敗:", res.message || "無資料");
    }
  } catch (error) {
    console.error("fetchContractList error", error);
  }
};

function safeValue(val) {
  return val === "" || val === null || val === undefined ? "--" : val;
}

function showDate(val) {
  return val === '--' ? '--' : formatDate(val);
}

const processContractData = (response) => {
  historyData.value = (response.data || []).map(item => ({
    ID: safeValue(item.ID),
    startDay: safeValue(item.startDay),
    endDay: safeValue(item.endDay),
    contractInfo: safeValue(item.contractInfo),
    amount: isSpecialMerchant.value ? '--' : `NT$${safeValue(item.amount)}`,
    payType: isSpecialMerchant.value ? '--' : safeValue(item.payType),
    payDate: isSpecialMerchant.value ? '--' : safeValue(item.payDate),
    status: isSpecialMerchant.value ? '--' : (statusMap[Number(item.status)] || "--"),
    taxNo: isSpecialMerchant.value ? '--' : safeValue(item.taxNo),
    orderId: safeValue(item.orderId),
    contractType: safeValue(item.contractType),
  }));
};

watch(
  () => userStore.merchantId,
  (newMerchantId) => {
    if (newMerchantId) {
      fetchContractList("watch merchantId");
      scrollToTop();
    }
  }
);

// 監視切換分店
const reloadFunction = async () => {
  fetchContractList();
};

onMounted(() => {
  fetchContractList();
});

useTokenWatcher(reloadFunction);
</script>

<style lang="scss" scoped>
@use "@/assets/scss/components/popup/_popup-booking.scss" as *;
@use "@/assets/scss/pages/booking/_add_edit.scss" as *;
@use "@/assets/scss/pages/billingArea/_common.scss" as *;
</style>



