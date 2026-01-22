<template>
  <div class='slots-container'>
    <div class='slots-list'>
      <div 
        v-for='slot in modelValue' 
        :key='slot.tempCloseId' 
        class='slot-item'
      >
        <div class='slot-info'>
          <p>{{ formatDateTime(slot.closeStartDay) }}</p>
          <p>{{ formatDateTime(slot.closeEndDay) }}</p>
        </div>
        <div class='slot-actions'>
          <button class='delete-button' @click='handleDelete(slot.tempCloseId)'>
            {{ deleteButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { useFormat } from '@/composables/useFormat';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  deleteButtonText: {
    type: String,
    default: '移除時段'
  }
});

const emit = defineEmits(['update:modelValue']);

const { formatDateTime } = useFormat();

const handleDelete = (tempCloseId) => {
  const updatedSlots = props.modelValue.filter(slot => slot.tempCloseId !== tempCloseId);
  emit('update:modelValue', updatedSlots);
};
</script>

<style lang='scss' scoped>  
@use '@/assets/scss/shared/index' as *;
@use '@/assets/scss/mixins/mixins' as *;

// 暫停時段列表
.slots-container {
  display: flex;
  width: 100%;
  padding: 8px 0px;
  .slots-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    .slot-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 36px;
      gap: 8px;
      
       .slot-info {
          position: relative;
          display: flex;
          align-items: center;
          gap: 64px; 
          &::after {
            content: '-';
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            color: inherit;
            font-weight: inherit;
          }
        }
    }
    .slot-actions {
      .delete-button {
        @extend .body2;
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        outline: none;
        color: $primary;
      }
    }
  }
}
</style>
  
