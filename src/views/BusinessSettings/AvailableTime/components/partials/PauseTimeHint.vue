<template>
  <BasePopUp 
    :model-value='modelValue' 
    :esc-button='true'
    card-size='lg' 
    @update:model-value='handleClose'
  >
    <template #title>
      <p class='popup-title'>提醒您:<br/>暫停訂位僅影響 Google 地圖的預訂</p>
    </template>
    <template #content>
      <div class='popup-content'>
        <ol class='info-list'>
          <li class='info-item'>您設定的「暫停某時段訂位」，只會影響顧客從 Google 地圖預訂。您仍可在後台手動新增訂位，系統也會正常發送通知給顧客。</li>
          <li class='info-item'>已經成功預訂的顧客將不會被取消訂位。</li>
          <li class='info-item'>如果該時段決定不營業或需要調整（例如減少桌數），請主動通知顧客並手動修改訂位。</li>
        </ol>
        <p class='contact-info'>如在設定過程中遇到問題，歡迎聯繫客服，我們將協助您進行處理。</p>
      </div>
    </template>
    <template #button>
      <BaseButton variant='check' size='md' @on-click='handleConfirm'>
        我知道了
      </BaseButton>
    </template>
  </BasePopUp>
</template>
  
<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});
  
const emit = defineEmits(['update:modelValue']);

const handleClose = () => {
  emit('update:modelValue', false);
};

const handleConfirm = () => {
  emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.popup-title {
  text-align: center;
}

.popup-content {
  text-align: left;
  margin: 32px 0 0 0 ;
}

.info-list {
  margin-bottom: 16px;
  padding-left: 20px;
}

.info-item {
  margin-bottom: 8px;
}
</style>