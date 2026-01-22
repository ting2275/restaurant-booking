<template>
  <div :id='`row-${table.tableId}`' ref='rowRef' class='table-row editMode'>
    <div class='col table-sort'>
      <div class='drag-handle'>
        <span></span>
        <span></span>
      </div>
    </div>
    <div class='col table-number'>
      <input
        v-model='table.tableName'
        type='text'
        class='table-input'
        :class="{ 'error-border': isDuplicate }"
        placeholder='建議輸入八個字元以內'
        @input='onDataChange'
      />
    </div>
    <div class='col table-type'>
      <DropdownMenu
        v-model='table.partySize'
        :options='partySizeOptions'
        :is-searchable='false'
        :is-readonly='true'
        label-key='label'
        value-key='value'
        :placeholder='`${table.partySize}人桌`'
        @dropdown-open='scrollToBottom(table.tableId)'
        @change='onDataChange'
      />
    </div>
    <div class='col table-status'>
      <input
        v-model='table.isOnlineBooking'
        type='checkbox'
        :true-value='1'
        :false-value='0'
        class='table-status-input'
        :class="{ 'error-border': isDuplicate }"
        @change='onDataChange'
      />
    </div>
    <div class='col table-actions'>
      <button class='delete-btn' @click='onDelete(table.tableId)'>
        <img src='@/assets/images/icons/trash-can.svg' alt='刪除' />
      </button>
    </div>
  </div>
</template>
  
<script setup>
import { ref, defineExpose, onMounted } from 'vue';

const rowRef = ref(null);
defineExpose({ rowRef });

const { table, partySizeOptions, isDuplicate } = defineProps({
  table: { type: Object, required: true },
  partySizeOptions: { type: Array, required: true },
  isDuplicate: { type: Boolean, default: false }
});
const emit = defineEmits(['dataChange', 'delete','scrollToBottom', 'mounted']);
const onDataChange = () => emit('dataChange');
const onDelete = (id) => emit('delete', id);

const scrollToBottom = (id) => emit('scrollToBottom', id);

onMounted(() => {
  emit('mounted', table.tableId);
});

</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/businessSettings/_tableManagement.scss' as *;
</style>

