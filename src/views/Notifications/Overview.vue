<template>
  <div class='main-box' :class='backgroundClass'>
    <div>
      <div v-if='notificationData' class='info-box'>
        <h4>{{ customerName }}</h4>
        <div class='content-box'>
          <div>
            <p class='content-title'>統計期間</p>
            <p>{{ formatDate(dateRange.start) }} - {{ formatDate(dateRange.end) }}</p>
          </div>
          <div>
            <p class='content-title'>寄送數量</p>
            <span class='total-number'>{{ totalLine }}</span><img src='@/assets/images/icons/LINE.png' alt=''>
            <span class='total-number'>{{ totalSms }}</span><img src='@/assets/images/icons/message-text.svg' alt=''>
          </div>
        </div>
      </div>
      <div class='top-box'>
        <div class='filter-box'>
          <div class='range-picker-box'>
            <RangePicker
              v-model='dateRange'
              :initial-range='[dateRange.start, dateRange.end]'
              :max-range-past='EXPORT_DATE_RANGE.MAX_RANGE_PAST'
              :max-range-future='EXPORT_DATE_RANGE.MAX_RANGE_FUTURE'
              :is-rounded='true'
              @range-change='handleRangeChange'
            />
          </div>
          <SearchInput
            v-for='(input, index) in searchInputs'
            :key='index'
            v-model='input.model'
            :label='input.label'
            :type='input.type'
            :placeholder='input.placeholder'
            :locked='input.locked'
            :error-message='input.errorMessage'
            :is-rounded='true'
            @search='handleSearch'
          />
        </div>
        <BaseButton variant='cancel' class='btn-export' @on-click='exportFile'>匯出</BaseButton>
      </div>
      <div :style='{ minHeight: heightStyle }' class='height-box'>
        <BaseTable
          :headers='listHeads'
          :rows='notificationLists'
          :row-key='row => row.smsTime + row.mobileNumber'
          :no-border='true'
        >
          <template #default='{ row }'>
            <div>
              <span>{{ formatDate(row.smsTime) }}</span>
              <span>{{ row.smsTime.split(' ')[1] }}</span>
            </div>
            <div>{{ row.mobileNumber }}</div>
            <div>{{ row.smsType }}</div>
            <div>
              <img :src='resolveSendType(row.sendType)' alt=''>
              <span v-if='row.noCount === 1' class='no-count'>（不計費）</span>
            </div>
            <div v-if='row.receiver !== "顧客"'>{{ row.receiver }}</div>
            <div v-else>{{ row.receiverName }}</div>
            <div>{{ row.sentCount === 0 ? '發送失敗' : row.sentCount }}</div>
          </template>
        </BaseTable>
      </div>
      <BasePagination
        :current-page='currentPage'
        :total-pages='totalPages'
        :total-items='totalItems'
        @update:page='handlePageChange'
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, inject, watch } from 'vue';
  import { getNotifications, downloadNotifications } from '@/services/api/notifications';
  import { useTokenWatcher } from "@/composables/useTokenWatcher";
  import iconMessageText from '@/assets/images/icons/message-text.svg';
  import iconLine from '@/assets/images/icons/LINE.png';
  import { EXPORT_DATE_RANGE } from '@/composables/export/constants/config';

  // 灰色背景
  import { useTheme } from '@/stores/themeStore';
  const themeStore = useTheme();
  const backgroundClass = computed(() => themeStore.backgroundClass);
  themeStore.setBackgroundClass('bg-gray');

  // 計算頁面高度
  import { useSystemStore } from '@/stores/systemStore';
  const systemStore = useSystemStore();
  const heightStyle = computed(() => systemStore.isContractNotification ? 'calc(100dvh - 512px)' : 'calc(100dvh - 472px)');

  const notificationData = ref(null);
  const notificationLists = ref([]);

  // 搜尋Input
  const searchContent = ref('');
  const searchPlaceholder= ref('請輸入收件者電話');
  const searchInputs = ref([
    {
      model: searchContent,
      label: '',
      type: 'search',
      placeholder: searchPlaceholder,
      locked: false
    }
  ]);

  import { useDisablePeriod } from '@/composables/utilities/useCalendarInputs.js';

  const { pastDisableDate, futureDisableDate } = useDisablePeriod(6, 0);

  // 初始化選擇器的數據和函數
  const dateRange = ref({
    start: pastDisableDate,
    end: futureDisableDate
  });

  import { useFormat } from '@/composables/useFormat';
  const { formatDate } = useFormat();


  // 日期選擇處理程序
  const handleRangeChange = (range) => {
    dateRange.value.start = new Date(range[0]);
    dateRange.value.end = new Date(range[1]);
    currentPage.value = 1;
    fetchNotifications();
  };

  // Search 搜尋
  const handleSearch = () => {
    currentPage.value = 1;
    fetchNotifications();
  }

  // Pagination 分頁
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalItems = ref(0);
  const handlePageChange = (newPage) => {
    currentPage.value = newPage;
    fetchNotifications().then(() => {
      scrollToTop();
    });
  };

  // 滾動至頁面最上方
  const scrollToTop = inject('scrollToTop');

  // 計算店家名稱
  const customerName = computed(() => {
    if (notificationData.value && notificationData.value.customer) {
      return notificationData.value.customer[0].name;
    }
    return '';
  });

  // 計算LINE數量
  const totalLine = computed(() => {
    if (notificationData.value && notificationData.value.customer) {
      return notificationData.value.customer.totalLine;
    }
    return '';
  });

  // 計算SMS數量
  const totalSms = computed(() => {
    if (notificationData.value && notificationData.value.customer) {
      return notificationData.value.customer.totalSms;
    }
    return '';
  });

  const buildNotificationParams = (includeCustomerName = false) => {
    const params = {
      mobile: searchContent.value,
      currentPage: currentPage.value,
      pageSize: 20,
      startDate: formatDate(dateRange.value.start),
      endDate: formatDate(dateRange.value.end),
      order: 'desc'
    };
    if (includeCustomerName) {
      params.customerName = customerName.value;
    }
    return params;
  }

  // 表格
  const listHeads = ref(['時間', '電話', '通知類型', '發送類型', '收件者', '寄送則數']);

  // 獲取通知列表資料
  const fetchNotifications = async () => {
    try {
      const params = buildNotificationParams();
      const result = await getNotifications(params);

      if (result.success && result.data?.data) {
        notificationData.value = result.data;
        notificationLists.value = result.data.data.notifications || [];
        totalPages.value = result.data.data.totalPages || 1;
        totalItems.value = result.data.data.totalItems || 0;
      } else {
        console.error('獲取通知失敗:', result.message || '未知錯誤');
      }
    } catch (error) {
      error.value = error.message;
      console.error('獲取通知時出錯:', error);
    }
  };

  import { useCSVDownload } from '@/composables/common/useFileDownload';
  // 匯出
  const exportFile = async () => {
    try {
      const params = buildNotificationParams(true);
      const result = await downloadNotifications(
        params.mobile,
        params.startDate,
        params.endDate,
        params.customerName
      );
      if (result.success) {
        let fileName = `${customerName.value} - 簡訊總覽(${params.startDate}-${params.endDate})`
        useCSVDownload(result.data, fileName)
        console.log('檔案匯出成功');
      } else {
        console.log('檔案匯出失敗', result.message);
      }
    } catch (error) {
      console.error('下載檔案時出錯:', error);
    }
  };

  const sendTypeMap = {
    1: iconMessageText,
    2: iconLine,
  };
  const resolveSendType = (sendType) => {
    return sendTypeMap[sendType] || '';
  };

  // 使用 token 監視器
  useTokenWatcher(fetchNotifications);

  // 檢查googleStatus狀態
  import { useAccountStore } from '@/stores/accountStore';
  const accountStore = useAccountStore();
  const isViewOnly = ref(false);
  const GOOGLE_STATUS = 8;
  watch(
    () => accountStore.googleStatus,
    (newStatus) => {
      isViewOnly.value = newStatus === GOOGLE_STATUS;
    },
    { immediate: true }
  );
</script>

<style lang="scss" scoped>
  @use '@/assets/scss/pages/notifications/_common.scss' as *;
</style>