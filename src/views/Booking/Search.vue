<template>
  <SearchPopUp v-model='isSearchPopupVisible' v-model:visible='isSearchPopupVisible' placeholder='請輸入顧客名稱或電話' teleport-to='#popup-layer-1' @search:reservation='searchReservation'>
    <template v-if='searchResult.length !== 0' #content>
      <BaseTable
        :headers='listHeads'
        :rows='searchResult'
        :row-key='row => row.bookingId'
        :grid-columns='"1fr 1fr 1.2fr 1.5fr 1fr 1.5fr 0.8fr"'
        row-click-mode='row'
        :row-click='clickResult'
        :no-border='true'
        :scroll='true'
        :scroll-height='"404px"'
      >
        <template #default='{ row }'>
          <div>{{ row.formatDate }}</div>
          <div>{{ row.bookingTime }}</div>
          <TagReservationStatus :variant='row.reservationStatus' />
          <div>
            <div>{{ row.familyName }} {{ row.givenName }}</div>
            <div>{{ row.telephone }}</div>
          </div>
          <div class='people-number'>{{ row.effectivePartySize }}</div>
          <div class='limit-text'>{{ row.shopkeeperInfo }}</div>
          <div class='view-icon'>
            <img src='@/assets/images/icons/eye-opened.svg' alt=''>
          </div>
        </template>
      </BaseTable>
    </template>
    <template v-else #content>
      <div class='no-results'>
        <img src='@/assets/images/resources/no-results-found.png' alt='Plus Icon' />
        <p>{{ resultPlaceholder }}</p>
      </div>
    </template>
  </SearchPopUp>
</template>
<script setup>
import { ref, watch, computed } from 'vue'
import { getReservationSeachList } from '@/services/api/booking'
import { useFormat } from '@/composables/useFormat.js';
const { formatDate } = useFormat();

const emit = defineEmits(['update:visible','update:handle-click-card','keep:searching-value']);

const props = defineProps({
  visible: {
    type: Boolean,
    required: false
  }
})

const searchResult = ref([])
const afterSearch = ref(false)
const resultPlaceholder = computed(()=>{
  return afterSearch.value ? '無搜尋資料':'搜尋以獲取更多顧客資訊'
})
const searchReservation = async (value) => {
  emit('keep:searching-value', value)
  cleanSearchResult()
  let results = await getReservationSeachList(value)
  if(results.count === 0){
    cleanSearchResult()
    afterSearch.value = true
    return
  }
  results.data.forEach(item => {
    searchResult.value.push({
      ...item,
      'formatDate': formatDate(item.bookingDate)
    })
  });
}

defineExpose({
  searchReservation
})

// 表格
const listHeads = ['日期', '預訂時段', '狀態', '名稱', '人數', '店家備註', '']

const cleanSearchResult = () => {
  searchResult.value = []
}

// 點擊搜尋結果
const clickResult = (row) =>{
  emit('update:handle-click-card', row.bookingId, true)
}

// 彈窗相關
const isSearchPopupVisible = ref(props.visible)
const closePopup = () => {
  isSearchPopupVisible.value = false
  cleanSearchResult()
  updateVisibility(false)
}
const updateVisibility = (value) => {
  isSearchPopupVisible.value = value;
  emit('update:visible', value); // 通知父層更新
};

// 當父層開啟彈窗
watch(() => props.visible, async (newVal) => {
  isSearchPopupVisible.value = newVal;
  if(newVal){
    afterSearch.value = false
  }
});

// 當子層關閉彈窗
watch(() => isSearchPopupVisible.value, async (newVal) => {
  updateVisibility(newVal)
  if (newVal === false) {
    closePopup()
  }
});
</script>

<style lang="scss" scoped>
:deep(.list-box) {
  border-radius: 0 !important;
}
:deep(.list-head) {
  border-radius: 0 !important;
}
.no-results {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  p{
    @extend .body1;
  }
}
</style>