<template>
  <div class='main-box' :class='backgroundClass'>
    <div>
      <div class='top-box'>
        <div class='filter-box'>
          <div class='range-picker-box'>
            <RangePicker
              v-model='dateRange'
              :initial-range='[dateRange.start, dateRange.end]'
              :max-range-past='-1'
              :max-range-future='0'
              :is-rounded='true'
              @range-change='handleRangeChange'
            />
          </div>
          <div class='dropdown-status-box'>
            <DropdownMenu
              v-model='selectReservationStatus'
              :options='reservationStatus'
              label-key='label'
              value-key='value'
              :is-rounded='true'
              :no-background-color='true'
              @change='handleStatusChange'
            />
          </div>
          <SearchInput
            v-model='searchContent'
            type='search'
            placeholder='請輸入名稱或電話'
            :is-rounded='true'
            @search='handleSearch'
          />
        </div>
        <div class='total-box'>
          <div>
            <img src='@/assets/images/icons/plate.svg' alt=''>
            <p>組數：<span>{{ totalGroup }}</span></p>
          </div>
          <div>
            <img src='@/assets/images/icons/user.svg' alt=''>
            <p>總人數：<span>{{ totalPeople }}</span></p>
          </div>
        </div>
      </div>
      <div :style='{ minHeight: heightStyle }' class='height-box'>
        <BaseTable
          :headers='listHeads'
          :rows='historyData.data || []'
          :row-key='row => row.bookingId'
          :grid-columns='"1fr 0.5fr 1fr 1fr 0.5fr 1fr 1fr 0.5fr"'
          row-click-mode='row'
          :row-click='isClickList'
        >
          <template #default='{ row }'>
            <div>{{ formatDate(row.bookingDate) }}</div>
            <div>{{ row.bookingTime }}</div>
            <TagReservationStatus :variant='row.reservationStatus' />
            <div>
              <div>{{ row.familyName }} {{ row.givenName }}</div>
              <div>{{ row.telephone }}</div>
            </div>
            <div class='people-number'>{{ row.effectivePartySize }}</div>
            <div class='limit-text'>{{ row.specialInfo }}</div>
            <div class='limit-text'>{{ row.shopkeeperInfo }}</div>
            <div class='view-icon'>
              <img src='@/assets/images/icons/eye-opened.svg' alt=''>
            </div>
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
    <HistoryPopup
      v-model='popupVisible'
      :popup-visible='popupVisible'
      :booking-id='bookingId'
      @fetch-history-info='fetchHistoryInfo'
    />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, inject } from 'vue';
  import { useTokenWatcher } from "@/composables/useTokenWatcher";
  import { getHistoryInfo } from '@/services/api/history';
  // import { getBookingInfo, updateBookingInfo } from '@/services/api/booking';
  import HistoryPopup from './History.vue';

  // 灰色背景
  import { useTheme } from '@/stores/themeStore';
  const themeStore = useTheme();
  const backgroundClass = computed(() => themeStore.backgroundClass);
  themeStore.setBackgroundClass('bg-white');

  // 計算頁面高度
  import { useSystemStore } from '@/stores/systemStore';
  const systemStore = useSystemStore();
  const heightStyle = computed(() => {
    return systemStore.isContractNotification ? 'calc(100dvh - 210px)' : 'calc(100dvh - 170px)';
  })

  const historyData = ref({
    data: [],
    count: 0,
    totalPartySize: 0,
    totalItems: 0,
    totalPages: 1,
  });
  const totalGroup = ref(0);
  const totalPeople = ref(0);

  // 日期預設選取30天
  const today = new Date();
  const dateRange = ref({
    start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
    end: today,
  });

  // 日期選擇處理程序
  const handleRangeChange = (range) => {
    dateRange.value.start = new Date(range[0]);
    dateRange.value.end = new Date(range[1]);
    currentPage.value = 1;
    fetchHistoryInfo();
  };

  // dropdown狀態選擇
  const selectReservationStatus = ref('all');
  const reservationStatus = [
    { label: '全部', value: 'all' },
    { label: '已入座', value: 'seated' },
    { label: '未出席', value: 'NO_SHOW' },
    { label: '已取消', value: 'CANCELED' },
  ]

  // 搜尋Input
  const searchContent = ref('');

  const handleSearch = () => {
    currentPage.value = 1;
    fetchHistoryInfo();
  }

  const listHeads = ref(['日期', '時間', '預訂狀態', '顧客資訊', '人數', '特殊需求', '店家備註', '']);

  // Pagination 分頁
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalItems = ref(0);
  const handlePageChange = (newPage) => {
    currentPage.value = newPage;
    fetchHistoryInfo().then(() => {
      scrollToTop();
    });
  };

  // 滾動至頁面最上方
  const scrollToTop = inject('scrollToTop');

  // 獲取歷史列表資料
  const fetchHistoryInfo = async () => {
    try {
      const params = {
        startDate: dateRange.value.start.toISOString().split('T')[0],
        endDate: dateRange.value.end.toISOString().split('T')[0],
        searchReservationStatus: selectReservationStatus.value,
        searchInfo: searchContent.value,
        currentPage: currentPage.value
      }
      const response = await getHistoryInfo(params);

      if (response.success) {
        historyData.value = {
          ...response.data,
          data: response.data?.data || []
        };
        totalGroup.value = response.data.count || 0;
        totalPeople.value = response.data.totalPartySize || 0;
        totalItems.value = response.data.totalItems || 0;
        totalPages.value = response.data.totalPages || 1;
      } else {
        console.log('fetchHistoryInfo 失敗:', response.message);
        historyData.value.data = [];
      }
    } catch(error) {
      console.error('fetchHistoryInfo error', error);
      historyData.value.data = [];
    }
  }

  const popupVisible = ref(false);
  const bookingId = ref(0);

  const isClickList = (data) => {
    popupVisible.value = true;
    bookingId.value = data.bookingId;
  }

  // 計算星期幾、日期
  import { useFormat } from '@/composables/useFormat'
  const { formatDate } = useFormat();

  const handleStatusChange = (newValue) => {
    selectReservationStatus.value = newValue;
    fetchHistoryInfo();
  };

  onMounted(() => {
    fetchHistoryInfo();
  })

  // 監視切換分店
  useTokenWatcher(fetchHistoryInfo);
</script>

<style lang="scss" scoped>
  @use '@/assets/scss/components/popup/_popup-booking.scss' as *;
  @use '@/assets/scss/pages/history/_common.scss' as *;
</style>