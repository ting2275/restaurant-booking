<template>
  <div class='area-edit'>
    <div class='drag-handle'>
      <span></span>
      <span></span>
    </div>
    <input
      v-model='area.areaName'
      type='text'
      class='area-input'
      :class="{ 'error-border': isDuplicate }"
      placeholder='建議輸入八個字元以內'
      @input='onDataChange'
      @click.stop
    />
    <div class='area-actions'>
      <div class='table-icon'>
        <img src='@/assets/images/icons/table.svg' alt='桌子' />
      </div>
      <span class='table-count'>{{ area.tablesQuantity }}</span>
      <button class='delete-btn' @click.stop='onDelete(area.areaId)'>
        <img src='@/assets/images/icons/trash-can.svg' alt='刪除' />
      </button>
    </div>
  </div>
</template>
  
<script setup>
defineProps({
  area: { type: Object, required: true },
  isDuplicate: { type: Boolean, default: false }
});
const emit = defineEmits(['dataChange', 'delete']);
const onDataChange = () => emit('dataChange');
const onDelete = (id) => emit('delete', id);
</script>

<style lang="scss" scoped>
@import '@/assets/scss/pages/businessSettings/_common.scss';
</style>