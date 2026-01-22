<template>
  <BasePopUp v-model='isUnspecifiedListPopupVisible' :popup-mode = '"list"' >
    <template #title>
      未指定桌號卡片
    </template>
    <template #content>
      <BaseTable
        :headers='listHeads'
        :rows='props.listData'
        :row-key='row => row.bookingId'
        :grid-columns='"1.5fr 1fr 1.2fr 1.5fr 0.8fr 1.5fr 0.8fr"'
        row-click-mode='row'
        :row-click='clickResult'
        :no-border='true'
        :scroll='true'
        :scroll-height='"404px"'
      >
        <template #default='{ row }'>
          <div>{{ row.date }}</div>
          <div>{{ row.time }}</div>
          <TagReservationStatus :variant='row.variant' />
          <div>
            <div>{{ row.name }}</div>
            <div>{{ row.phone }}</div>
          </div>
          <div class='people-number'>{{ row.number }}</div>
          <div class='limit-text'>{{ row.shopkeeperInfo }}</div>
          <div class='view-icon'>
            <img src='@/assets/images/icons/eye-opened.svg' alt=''>
          </div>
        </template>
      </BaseTable>
    </template>
  </BasePopUp>
</template>

<script setup>
import { ref, watch } from 'vue'
const emit = defineEmits(['update:visible','update:handle-click-card']);

const props = defineProps({
  visible: {
    type: Boolean,
    required: false
  },
  listData: {
    type: Array,
    required: true
  }
})

// 表格
const listHeads = ['日期', '預訂時段', '狀態', '顧客資訊', '人數' , '店家備註', '']


// 點擊搜尋結果
const clickResult = (row) =>{
  emit('update:handle-click-card', row.id, true)
}

// 彈窗相關
const isUnspecifiedListPopupVisible = ref(props.visible)
const closePopup = () => {
  isUnspecifiedListPopupVisible.value = false
  updateVisibility(false)
}
const updateVisibility = (value) => {
  isUnspecifiedListPopupVisible.value = value;
  emit('update:visible', value); // 通知父層更新
};

// 當父層開啟彈窗
watch(() => props.visible, async (newVal) => {
  isUnspecifiedListPopupVisible.value = newVal;
});

// 當子層關閉彈窗
watch(() => isUnspecifiedListPopupVisible.value, async (newVal) => {
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