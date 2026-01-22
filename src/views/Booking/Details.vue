<template>
  <div
    ref='bookingCheckerboard' class='booking-checkerboard' :style='{
      gridTemplateRows: getGridTemplateRows,
      gridTemplateColumns: getGridTemplateColumns
    }'>
    <!-- 樞紐空格 -->
    <div class='sticky-hub'></div>
    <!-- [凍結]左側桌數 -->
    <div
      v-for='party in getTableList' :id='`table-${party.tableId}`' :key='party.tableId'
      :class='["party-item", party.tableId === 0 ? "party-item-unspecified" : ""]'>
      <template v-if='party.tableId === 0'>
        <p class='subtitle'>{{ party.tableName }}</p>
        <p class='caption'>({{ props.reservationList.length - withTableCards.length }})</p>
      </template>
      <template v-else>
        <p class='subtitle'>{{ party.tableName }}</p>
        <p class='caption'>{{ party.partySize }}人桌</p>
      </template>
    </div>
    <div v-for='item in getFillSpanHeight' :key='item' class='party-item'></div>
    <!-- [凍結]上方時段 -->
    <div
      v-for='(hour, index) in openHours' :id='`time${openHours[index]}`' :ref='el => setTimeRefs(el, index)'
      :key='openHours[index]' class='hour-item' :style='{ gridColumn: ` time-${openHours[index]}00 / span ${spansEachHour}` }'>
      {{ hour }}:00
    </div>
    <div v-for='item in getFillSpanWidth' :key='item' class='hour-item' :style='{gridColumn: `span ${spansEachHour}`}'></div>
    <!-- 時間軸 -->
    <div v-show='isTimelineShow' class='timeTag-area' :style='{ gridArea: `head / time-${hours}00 / span 1 / span ${spansEachHour}` }'>
      <span ref='timeTag' class='timeTag'>{{ hours }}:{{ minutes }}</span>
      <span ref='timeTagTail' class='timeTagTail'></span>
    </div>
    <div
      v-show='isTimelineShow' class='timeline-area'
      :style='{ gridArea: `2 / time-${hours}00 / span ${totalColumns + 1} / span ${spansEachHour}` }'>
      <span ref='timeline' class='timeline'></span>
    </div>
    <!-- 內部空白格 -->
    <div
      v-for='(column, index) in totalColumns' :key='column' :class='["blank-group", { "blank-group-unspecified": index === 0 }]'
      :style='{ gridColumn: `2 / span ${spansEachHour * blanksEachRow}`, gridRow: `${index + 2}/${index + 3}` }'>
      <div v-for='item in blanksEachRow' :key='item' class='blank'></div>
    </div>
    <!-- 訂位卡片 (尚未指定桌號) -->
    <template v-for='(innerCards, index) in noTableCards' :key='index'>
      <!-- 計數卡片 -->
      <div class='noTableCard' :style='{ gridRow: innerCards.info.gridRow, gridColumn: innerCards.info.gridColumn }' @click='buildUnspecifiedList(innerCards.info.time)'>
        <ReservationStatusCard :id='innerCards.info.time' variant='prepare' name='該時段尚有未分配訂單'/>
        <span>{{ innerCards.cards.length }}</span>
      </div>
    </template>
    <!-- 訂位卡片 (已指定桌號) -->
    <ReservationStatusCard
      v-for='card in withTableCards' :id='card.id' :key='card.id' :variant='card.variant' :name='card.name' :number='card.number' :time='card.time' :memo='card.memo'
      :width='card.width' :style='{ gridRow: card.gridRow, gridColumn: card.gridColumn }' @click='clickCard(card.id)' />
  </div>
  <!-- 展開未指定桌號列表 -->
  <UnspecifiedListPopup
    v-model:visible='isUnspecifiedListPopupVisible'
    :list-data='unspecifiedCards'
    teleport-to='#popup-layer-1'
    @update:handle-click-card='clickEditReservation'
  />
</template>

<script setup>
import { ref, computed, onMounted, defineProps, watch, inject } from 'vue';
import { usePageMeta } from '@/router/config/setMeta';
import { useRoute } from 'vue-router';
const route = useRoute();
usePageMeta(route);
import { useTokenWatcher } from '@/composables/useTokenWatcher';
import { useUpdateOnTime } from '@/composables/utilities/useUpdateOnTime';
import { getLastAvalibleTime } from '@/composables/modules/reservationOverview/useShopInfo.js';
import { useFormat } from '@/composables/useFormat.js';
const { formatDate } = useFormat();

import UnspecifiedListPopup from './UnspecifiedList.vue';

const props = defineProps({
  reservationList: {
    type: Object,
    required: true
  },
  shopInfo: {
    type: Object,
    required: true
  },
  selectedDate: {
    type: String,
    required: true
  }
})
const noTableCards = ref([]) // 未指定桌號卡片，雙層結構
const withTableCards = ref([]) // 已指定桌號卡片，單層結構
const isCardsBuilt = ref(false)
const buildCards = async () => {
  if (props.reservationList.length === 0) return
  const noTableList = {}
  const withTableList = []
  props.reservationList.forEach((data) => {
    let bookingHours = data.bookingTime.split(":")[0]
    if (data.reservationStatus === 'CANCELED') return
    if (!props.shopInfo.openHours.includes(bookingHours)) return
    const cardInfo = { // 卡片共用資料
      id: data.bookingId,
      variant: data.reservationStatus,
      name: String(data.familyName + data.givenName),
      number: data.effectivePartySize,
      time: data.bookingTime,
      memo: data.specialInfo,
      isAssign: data.isAssign
    }
    if(data.isAssign){
      withTableList.push({ // 已指定桌號卡片
          ...cardInfo,
          gridRow: `table-${data.tableId}`,
          gridColumn: `time-${data.bookingTime.replace(':', '')} / span ${cardSpan.value}`,
          width: Math.max(cardSpan.value, 2)
        }
      )
    }else{
      if (!noTableList[bookingHours]) {
        noTableList[bookingHours] = {
          cards: [],
          info: {}
        }
      }
      // 未指定桌號卡片
      noTableList[bookingHours]['info'] = {
        time: bookingHours,
        gridRow: `table-${data.tableId}`,
        gridColumn: `time-${bookingHours}00 / span ${spansEachHour.value}`,
      }
      noTableList[bookingHours]['cards'].push({
        ...cardInfo,
        date: formatDate(data.bookingDate),
        phone: data.telephone,
        shopkeeperInfo: data.shopkeeperInfo,
        // gridRow: `table-${data.tableId}`,
        // gridColumn: `time-${data.bookingTime.replace(':', '')} / span ${spansEachHour.value}`,
        // width: `${spansEachHour.value}`
      })
    }
    noTableCards.value = noTableList
    withTableCards.value = withTableList
  })
  isCardsBuilt.value = true
}
// 清除卡片
const clearCards = async () => {
  noTableCards.value = []
  withTableCards.value = []
  isCardsBuilt.value = false
}

watch(() => props.reservationList, () => {
  reloadFunction()
});

// 取得所有桌次資料列表
// 按照areaOrder -> tableOrder順序排序
const getTableList = computed(() => {
  let tablesData = props.shopInfo.tables
  let tablesList = []

  // 未指定桌號區
  tablesList.push({
    tableId: 0,
    tableName: '尚未指定桌號',
    partySize: 0,
    isAssign: false
  })

  const sortedTables = tablesData.sort((a, b) => a.areaOrder - b.areaOrder)
  sortedTables.forEach((table) => {
    tablesList = [ ...tablesList, ...table.sort((a, b) => a.tableOrder - b.tableOrder)]
  })
  return tablesList
})

// 取得所有營業時段
const openHours = computed(() => {
  return props.shopInfo.openHours
})
// 總可訂位格子數(每列)
const blanksEachRow = computed(() => {
  return openHours.value.length + getFillSpanWidth.value
})
// 空格總列數
const totalColumns = computed(() => {
  return getTableList.value.length + getFillSpanHeight.value
})
// 一個小時切幾份 (可預訂時段間隔)
const spansEachHour = computed(() => {
  // let isQuarter = props.shopInfo.availableTime % 30 !== 0
  // return isQuarter ? 4 : 2
  return 4
})
// Grid切一格幾分鐘
const minutesEachSpan = computed(() => 60 / spansEachHour.value)
// 卡片格數
const cardSpan = computed(() => (props.shopInfo.eachTime / 60) * spansEachHour.value ) // 用餐n小時 * 一小時n格 = 用餐n格

const rowHeaderHeight   = 75 / 2  // 頂端標題列高
const rowHeight         = 75      // 單格高度
const columnBaseWidth   = 230 / spansEachHour.value // 基本欄寬
const columnHeaderWidth = 115     // 左側標題列欄寬(固定)

const widthMap = {
    2: {
      1: columnBaseWidth * 2,
      2: columnBaseWidth,
      3: columnBaseWidth,
      4: columnBaseWidth,
    },
    4: {
      2: columnBaseWidth * 2,
      4: columnBaseWidth,
      6: columnBaseWidth,
      8: columnBaseWidth,
    }
  }

const columnWidth = computed(() => { // 單格寬度
  return widthMap[spansEachHour.value][cardSpan.value] ?? columnBaseWidth
})

// [重要] 以下引號中的空白格勿刪除
const getGridTemplateRows = computed(() => {
  let gridTemplateRows = String.raw`[head] ${rowHeaderHeight}px `
  getTableList.value.forEach((table) => {
    gridTemplateRows += String.raw`[table-${table.tableId}] ${rowHeight}px `
  })
  let n = 0
  while (n < getFillSpanHeight.value) {
    gridTemplateRows += String.raw`[blank] ${rowHeight}px `
    n++
  }
  return gridTemplateRows
})
const getGridTemplateColumns = computed(() => {
  let unitInHour = {
    2:['00','30'],
    4:['00','15','30','45']
  }[spansEachHour.value]

  let gridTemplateColumns = String.raw`[head] ${columnHeaderWidth}px `
  openHours.value.forEach(hour => {
    unitInHour.forEach(unit => gridTemplateColumns += String.raw`[time-${hour}${unit}] ${columnWidth.value}px `)
  })
  let m = 0
  while (m < (getFillSpanWidth.value * spansEachHour.value)) {
    gridTemplateColumns += String.raw`[blank] ${columnWidth.value}px `
    m++
  }
  return gridTemplateColumns
})

// 資料尺寸
const dataWidth = ref(spansEachHour.value * columnWidth.value * (openHours.value.length + 0.5))
const dataHeight = ref(rowHeight * (getTableList.value.length + 1))
// 容器尺寸
const outerWidth = inject('outerWidth')
const outerHeight = inject('outerHeight')
// 補空格用
const getFillSpanWidth = computed(() => {
  if (outerWidth.value > dataWidth.value) {
    let widthSpace = outerWidth.value - dataWidth.value
    let widthSpaceSpan = Math.ceil(widthSpace / (spansEachHour.value * columnWidth.value))
    return widthSpaceSpan
  } else if (props.shopInfo.openHours.length === 24) {
    // [特殊情況] 24小時營業時，最後營業時段要依據用餐時長、梯次補空格
    let lastAvalibleTime = getLastAvalibleTime(props.selectedDate, props.shopInfo.timePicker)
    let minBetweenNextDay = Number(lastAvalibleTime[0]) * 60 + Number(lastAvalibleTime[1])
    let remainSpan = (1440 - minBetweenNextDay) / minutesEachSpan.value  // 最後一個可預訂時段距離00:00格數
    return (remainSpan < cardSpan.value) ? Math.round((cardSpan.value - remainSpan) / 2) : 0
  } else {
    return 0
  }
})
const getFillSpanHeight = computed(() => {
  if (outerHeight.value > dataHeight.value) {
    let heightSpace = outerHeight.value - dataHeight.value
    let heightSpaceSpan = Math.ceil(heightSpace / rowHeight)
    return heightSpaceSpan
  } else {
    return 0
  }
})

// 時間軸相關
const timeTag = ref('')
const timeTagTail = ref('')
const timeline = ref('')
const hours = ref('')
const minutes = ref('')
const calcNowPosition = () => {
  const now = new Date()
  hours.value = now.getHours().toString().padStart(2, '0')
  minutes.value = now.getMinutes().toString().padStart(2, '0')
  let timelinePosition = Math.floor(100 / 60 * minutes.value)
  // let timeTagLeft = Math.max(40, timelinePosition * columnWidth * 2 / 100)
  const timeTagLeft = computed(() => timelinePosition * columnWidth.value * spansEachHour.value / 100)
  if (timeline.value && timeTag.value) {
    timeline.value.style.left = `${timelinePosition}%`
    timeTag.value.style.left = `${timeTagLeft.value}px`
    timeTagTail.value.style.left = `${timelinePosition}%`
  }
}
const isTimelineShow = computed(() => {
  let inOpenHours = openHours.value.includes(new Date().getHours().toString().padStart(2, '0')) ? true : false
  let isToday = (props.selectedDate === new Date().toLocaleDateString('en-CA')) ? true : false
  return (inOpenHours && isToday) ? true : false
})

const timelineHandler = () => {
  calcNowPosition()
  useUpdateOnTime(() => {
    setTimeout(() => {
      calcNowPosition()
    }, 999)
  }, 1, 'calcNowPosition')
}

// 橫向滾到時間
const bookingCheckerboard = ref('')
const timeRefs = ref([])
const setTimeRefs = (el, index) => {
  if (el) {
    timeRefs.value[index] = el;  // 將每個動態生成的 DOM 元素存入陣列
  }
}

const timeLineIndex = ref(0)
function scrollToHour(hour) {
  timeLineIndex.value = openHours.value.indexOf(String(hour))
  if (timeLineIndex.value === -1) {
    return
  }
  const parentRect = bookingCheckerboard.value.getBoundingClientRect(); // 容器位置
  const scrollHandler = (element) => {
    const elementRect = element.getBoundingClientRect(); // 元素位置
    // 計算需要滾動的距離 (元素的左邊 - 容器的左邊 + 偏移量)
    const scrollLeft = bookingCheckerboard.value.scrollLeft + elementRect.left - parentRect.left - columnHeaderWidth;
    bookingCheckerboard.value.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  }
  scrollHandler(timeRefs.value[timeLineIndex.value])
}
// 判斷時間軸滾動是否作用
const scrollToTimeline = () => {
  if (isTimelineShow.value) {
    scrollToHour(hours.value)
    useUpdateOnTime(() => {
      setTimeout(() => {
        scrollToHour(new Date().getHours())
      }, 999)
    }, 60, 'scrollToHour')
  } else {
    scrollToHour(props.shopInfo.openHours[0])
  }
}

// 滾動到指定卡片位置
const scrollToCard = (cardId) => {
  let targetElement = document.getElementById(cardId);
  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center'
  });
}

const waitForCardsBuilt = () => {
  return new Promise(resolve => {
    const unwatch = watch(
      () => isCardsBuilt.value,
      newValue => {
        if (newValue) {
          unwatch(); // 停止監聽
          resolve();
        }
      }
    );
  });
};

// 點擊訂位卡片
const emit = defineEmits(['update:handle-click-card', 'update:handle-click-unspecified-list']);
const clickCard = (bookingId) => {
  emit('update:handle-click-card', bookingId, true) // [事件名稱；預訂Id；彈窗狀態]
}




// 展開未指定桌號列表
const unspecifiedCards = computed(() => noTableCards.value[unspecifiedPeriod.value]?.cards || [])
const unspecifiedPeriod = ref(0)
const isUnspecifiedListPopupVisible = ref(false)

const buildUnspecifiedList = (time) => {
  unspecifiedPeriod.value = time
  isUnspecifiedListPopupVisible.value = true
}
const clickEditReservation = (cardId) => {
  emit('update:handle-click-card', cardId, true)
}

const reloadFunction = async () => {
  await clearCards();
  await buildCards();
};

useTokenWatcher(reloadFunction);

onMounted(async () => {
  await clearCards();
  await buildCards();
  timelineHandler();
  scrollToTimeline()
})

defineExpose({
  scrollToCardHandler: async (cardId) => {
    await waitForCardsBuilt();
    scrollToCard(cardId)
  },
  scrollToTimeline,
  buildUnspecifiedList
})

</script>

<style lang="scss" scoped>
$layer: blank, count-point,timeline,  hour, timetag, party, hub;
// $layer: blank, timeline, hour, party, hub, timetag;

%table-border {
  box-shadow: inset 0 0 0 .5px $black-500;
}

:deep(.reservation-card) {
  top: 50%;
  transform: translateY(-50%);
  width: 100% !important;
}

.booking-checkerboard {
  display: grid;
  grid-auto-flow: dense;
  height: 100%;
  background-color: $black-400;
  border: 1px solid $black-500;
  border-radius: 10px;
  overflow: auto;
  position: relative;
  @include custom-scrollbar;
  overscroll-behavior: none; /* 防止回彈效果 */
  -webkit-overflow-scrolling: auto; /* 禁用滾動彈性效果 */
}

.sticky-hub {
  background-color: $secondary;
  @extend %table-border;
  grid-row: 1/2;
  grid-column: 1/2;
  position: sticky;
  top: 0;
  left: 0;
  z-index: index($layer, hub);
}

.party-item {
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  @extend %table-border;
  grid-column: head;
  position: sticky;
  left: 0;
  z-index: index($layer, party);
  .subtitle {
    margin-bottom: 4px;
    width: calc(100% - 10px);
    text-align: center;
  }
  &-unspecified {
    color: white;
    background-color: #2D486B;
    // position: sticky;
    // top: calc(75px / 2);
    // z-index: index($layer, hub);
  }
}

.hour-item {
  background-color: $secondary;
  @extend %table-border;
  padding-left: 10px;
  color: $primary;
  line-height: 36px;
  letter-spacing: 1px;
  font-weight: 500;
  grid-row: head;
  position: sticky;
  top: 0;
  z-index: index($layer, hour);
}

.timeTag-area {
  z-index: index($layer, timetag);
  position: sticky;
  top: 0;

  .timeTag {
    color: white;
    font-size: 14px;
    letter-spacing: 2px;
    background-color: $primary;
    border-radius: 20px;
    width: 80px;
    line-height: 1.6;
    text-align: center;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(-50%, -50%);
  }

  .timeTagTail {
    width: 2px;
    background-color: $primary;
    position: absolute;
    height: 10px;
    bottom: 0;
  }
}

.timeline-area {
  pointer-events: none;
  z-index: index($layer, timeline);
  position: relative;

  .timeline {
    width: 2px;
    background-color: $primary;
    position: absolute;
    top: 0;
    bottom: 0;
  }
}

.blank-group {
  width: 100%;
  display: flex;

  &:nth-child(odd) {
    background-color: white;
  }

  &:nth-child(even) {
    background-color: $black-300;
  }

  &.blank-group-unspecified {
    background-color: #2D486B;
    // position: sticky;
    // top: calc(75px / 2);
    // z-index: index($layer, blank);
  }
}

.blank {
  flex: 1 0 0;
  position: relative;
  @extend %table-border;

  &::after {
    content: '';
    position: absolute;
    width: 0;
    border: 1px dashed $black-500;
    left: 50%;
    top: 0;
    bottom: 0;
  }

  &.grey {
    background-color: $black-400;
  }
}

.noTableCard {
  position: relative;
  z-index: index($layer, count-point);
  span {
    color: white;
    background-color: $wrong;
    border-radius: 20px;
    padding: 0 8px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 12px;
    right: 12px;
    @extend .caption;
  }
  :deep(.reservation-card) {
    .name {
      max-width: 100%;
    }
  }
}
</style>