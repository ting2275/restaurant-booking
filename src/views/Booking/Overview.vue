<template>
  <div class='overviewOuter'>
    <div class='booking-overview'>
      <div class='booking-status-total'>
        <div v-for='(count, status) in statusCounts' :key='status' class='status-item'>
          <div :class="['status-dot', getStatusClass(status)]"></div>
          <span class='status-count'>: {{ count }}</span>
        </div>
      </div>
      <div class='booking-search'>
        <TodayButton @select-today='handleDateChangeButton' />
        <ButtonDatePicker :initial-date='selectedDate' :max-range-past='1' :max-range-future='89' :date-classes='dateClasses' @button-date-change='handleDateChangeButton' />
        <button class='search-button' @click='clickSearchReservation()'>
          <img src='@/assets/images/icons/search-primary.svg' alt='Search Icon' />
        </button>
      </div>
      <div class='booking-reserve-total'>
        <div class='reserve-item'><img src='@/assets/images/icons/plate.svg'>組數：<span class='highlight'>{{
          reserveTotal.totalCount }}</span></div>
        <div class='reserve-item'><img src='@/assets/images/icons/user.svg'>總人數：<span class='highlight'>{{
          reserveTotal.totalPartySize }}</span></div>
      </div>
    </div>
    <div ref='bookingCheckerboardOuter' class='booking-details'>
      <Details
        v-if='isDataLoaded'
        ref='detailsRef'
        :key='nowUnixTime'
        :reservation-list='reservationList'
        :shop-info='shopInfo'
        :selected-date = 'selectedDate'
        @update:handle-click-card='clickEditReservation'
      />
      <button
        :class="['add-button', { 'view-only': isViewOnly }]"
        @click='!isViewOnly && clickAddReservation()'
      >
        <img src='@/assets/images/icons/add.svg' alt='Plus Icon' />
      </button>
    </div>
  </div>

  <!-- 搜尋預訂 -->
  <SearchReservationPopup
    v-if='isDataLoaded'
    ref='searchRef'
    v-model:visible='isSearchPopupVisible'
    @update:handle-click-card='clickEditReservation'
    @keep:searching-value='handleSearchingValue'
  />


  <!-- 新增預訂 -->
  <AddReservationPopup
    v-if='isDataLoaded'
    :key='nowUnixTime'
    v-model:visible='isAddPopupVisible'
    :shop-info='shopInfo'
    :date-classes='dateClasses'
    :selected-date-outer = 'selectedDate'
    @update:reservation-list='reloadFunction'
    @action:turn-page='turnPage'
  />

  <!-- 編輯預訂 -->
  <EditReservationPopup
    v-if='isDataLoaded'
    :key='nowUnixTime'
    v-model:visible='isEditPopupVisible'
    :shop-info='shopInfo'
    :editing-card-id='editingCardId'
    :date-classes='dateClasses'
    @update:reservation-list='reloadFunction'
    @action:turn-page='turnPage'
  />


</template>

<script setup>
  import { ref, onMounted, watch, computed, provide, nextTick } from 'vue'
  import { useTheme } from '@/stores/themeStore';
  import { usePageMeta } from '@/router/config/setMeta';
  import { useRoute, useRouter } from 'vue-router';
  import { useShopInfo } from '@/composables/modules/reservationOverview/useShopInfo.js'
  import { useReservationList } from '@/composables/modules/reservationOverview/useReservationList.js'
  import { useUpdateOnTime } from '@/composables/utilities/useUpdateOnTime.js'
  import { generateDateClasses } from '@/composables/common/useCalendar'
  import { useTokenWatcher } from '@/composables/useTokenWatcher';

  import Details from './Details.vue';
  // import AddReservationPopup from './Add.vue';
  import AddReservationPopup from './Add/AddMain.vue';
  // import EditReservationPopup from './Edit.vue';
  import EditReservationPopup from './Edit/EditMain.vue';
  import SearchReservationPopup from './Search.vue';


  const router = useRouter();
  const route = useRoute();
  const themeStore = useTheme();
  themeStore.setBackgroundClass('bg-white');
  usePageMeta(route);

  const selectedDate = ref(new Date());
  // ShopInfo 資料獲取
  const { shopInfo,fetchShopInfo } = useShopInfo();

  // 預訂列表資料獲取
  const { reservationList,statusCounts,reserveTotal,buildReservationList,isReservationListBuilded } = useReservationList();

  // 檢查登入token
  const checkAuthToken = () =>{
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push({ name: 'Login' });
      return false;
    }
    return true
  }

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

  onMounted(async () => {
    if(!checkAuthToken()) return

    useUpdateOnTime(()=>{
      setTimeout(() => {
        buildReservationList(selectedDate.value,shopInfo.value)
      },999)
    },10,'buildReservationList')

  });

  const isShopInfoLoaded = computed(() => Object.keys(shopInfo.value).length !== 0)
  const isReservationListLoaded = computed(() => isReservationListBuilded.value)
  const isDataLoaded = computed(() => isReservationListLoaded.value && isShopInfoLoaded.value)

  // 監聽店家資訊是否載入完成 才執行日期選擇預設
  watch(shopInfo, async () => {
    if(!checkAuthToken()) return
    if (isShopInfoLoaded.value) {
      // 更新日期選擇器
      await buildReservationList(selectedDate.value, shopInfo.value);
    }
  }, { immediate: true });

  // 根據不同狀態設置不同的樣式
  const getStatusClass = (status) => {
    const statusClasses = {
      totalPrepare: 'orange',
      totalConfirmed: 'blue',
      totalSeated: 'green',
    };
    return statusClasses[status] || '';
  };
  // 日期選擇處理程序
  const handleDateChangeButton = (date) => {
    if(date!==''){
      selectedDate.value = date
      nextTick(()=>{
        if(detailsRef.value) detailsRef.value.scrollToTimeline()
      })
    }
  };

  // 初始化日曆數據
  const dateClasses = ref({});
  onMounted(() => {
    generateDateClasses().then(result=>dateClasses.value = result)
  });

  watch(selectedDate, (newDate) => {
    if(isShopInfoLoaded.value){
      buildReservationList(newDate,shopInfo.value);
    }
  });

  // Popup相關 觸發新增預訂
  // [新增預訂]
  const isAddPopupVisible = ref(false)
  const clickAddReservation = () => isAddPopupVisible.value = true

  // [編輯預訂]
  const isEditPopupVisible = ref(false)
  const editingCardId = ref(0)

  // 當Details點擊卡片、當點擊單筆搜尋結果
  const clickEditReservation = (cardId , isPopupVisible) => {
    editingCardId.value = cardId
    isEditPopupVisible.value = isPopupVisible
  }

  // 點擊搜尋按鈕
  const isSearchPopupVisible = ref(false)
  const clickSearchReservation = () => isSearchPopupVisible.value = true
  const searchingValue = ref('')
  const handleSearchingValue = value => searchingValue.value = value

  const searchRef = ref(null)
  const reloadSearchList = async () => {
    if(isSearchPopupVisible.value){
      searchRef.value?.searchReservation(searchingValue.value)
    }
  }

  // 取得資料表容器尺寸
  const bookingCheckerboardOuter = ref(null)
  const outerWidth = ref(0)
  const outerHeight = ref(0)
  const getOuterSize = () => {
    const rect = bookingCheckerboardOuter.value.getBoundingClientRect();
    outerWidth.value = rect.width
    outerHeight.value = Math.floor(rect.height)
  }
  onMounted(() => {
    if (bookingCheckerboardOuter.value) {
      nextTick(() => getOuterSize())
      provide('outerWidth',outerWidth)
      provide('outerHeight',outerHeight)
    }
  });

  const nowUnixTime = ref(Date.now())


  const reloadFunction = async () => {
    await fetchShopInfo() // 重新載入店家資訊 連帶重新載入預訂列表
    await buildReservationList(selectedDate.value,shopInfo.value)
    generateDateClasses().then(result=>dateClasses.value = result)
    // nowUnixTime.value = Date.now()
    reloadSearchList()
    nextTick(()=>{
      if(detailsRef.value) detailsRef.value.scrollToTimeline()
    })
  };

  const detailsRef = ref(null)
  const turnPage = (savingDate,cardId) => {
    if(selectedDate.value === savingDate){
      buildReservationList(savingDate,shopInfo.value);
    }
    selectedDate.value = savingDate
    detailsRef.value.scrollToCardHandler(cardId)
    reloadSearchList()
  }

  useTokenWatcher(reloadFunction);
</script>
<style lang="scss" scoped>
  @use '@/assets/scss/pages/booking/common.scss' as *;

  .overviewOuter {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
  }

  .booking-details {
    flex-grow: 1;
    overflow: hidden;
    position: relative;
  }

  .add-button {
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 64px;
    height: 64px;
    padding: 10px;
    border-radius: 100px;
    background-color: $primary;
    position: absolute;
    right: 20px;
    bottom: 20px;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
    img {
      width: 40px;
    }
    &.view-only{
      background-color: $black-500;
      cursor: not-allowed;
    }
  }

  .datepicker-button-box,
  .datepicker-button-box :deep(.mx-input),
  .search-button{
    cursor: pointer;
  }
  .search-button{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $secondary;
    color: $primary;
    box-shadow: 0 1px 4px $primary-variant;
    border: 0;
    border-radius: 30px;
    padding: 0 16px;
    height: 40px;
  }
</style>
