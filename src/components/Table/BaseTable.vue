<template>
  <div class='list-box' :class='{ "no-border": noBorder }'>
    <div class='list-head' :style='{ gridTemplateColumns }'>
      <div v-for='head in headers' :key='head'>{{ head }}</div>
    </div>
    <div class='list-content-box' :class='{ "scroll": scroll }' :style='scroll && scrollHeight ? { maxHeight: scrollHeight } : {}'>

      <template v-if="rowClickMode === 'row'">
        <!-- 點擊整列 -->
        <div
          v-for='(row, index) in props.rows'
          :key='`row-click-${rowKey(row, index)}`'
          class='list-content'
          :class='{ "row-click": rowClick }'
          :style='{ gridTemplateColumns }'
          @click='rowClick(row)'
        >
          <slot :row='row' :index='index'></slot>
        </div>
      </template>

      <!-- 不觸發任何功能 -->
      <template v-else>
        <div
          v-for='(row, index) in rows'
          :key='`not-click-${rowKey(row, index)}`'
          class='list-content'
          :style='{ gridTemplateColumns }'
        >
          <slot :row='row' :index='index'></slot>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  headers: { type: Array, required: true },
  rows: { type: Array, required: true, default: () => [] },
  rowKey: { type: Function, default: (row, index) => index },
  gridColumns: { type: String, default: '' },
  rowClickMode: { type: String, default: '' }, // 'row' | ''
  rowClick: { type: Function, default: () => {} },
  noBorder: { type: Boolean, default: false },
  scroll: { type: Boolean, default: false },
  scrollHeight: { type: String, default: '500px' }

});

const gridTemplateColumns = computed(() => {
  if (props.gridColumns) return props.gridColumns;
  return `repeat(${props.headers.length}, 1fr)`;
})
</script>

<style lang="scss" scoped>
  .list-box {
    border-radius: 8px;
    margin: 0 0 24px 0;
    &.no-border {
      .list-head, .list-content-box {
        border: none;
      }
    }
    .list-head, .list-content {
      display: grid;
      align-items: center;
      justify-items: center;
      text-align: center;
      @extend .body2;
    }
    .list-head {
      padding: 8px 24px;
      border-radius: 8px 8px 0 0;
      background-color: $black-300;
      color: $black-700;
      font-weight: 500;
      border: 1px solid $black-500;
      border-bottom: none;
    }
    .list-content-box {
      border-radius: 0 0 8px 8px;
      border: 1px solid $black-500;
      border-top: none;
      &.scroll {
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
      }
    }
    .list-content {
      padding: 12px 24px;
      min-height: 64px;
      color: $black-900;
      &:nth-child(odd) {
        background-color: #ffffff;
      }
      &:nth-child(even) {
        background-color: $black-100;
      }
      &:last-child {
        border-radius: 0 0 8px 8px;
      }
      &.row-click {
        cursor: pointer;
      }
      :deep(.people-number) {
        color: $primary;
        @extend .title;
      }
      :deep(.limit-text) {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
      }
      :deep(.view-icon) {
        height: 40px;
        width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: solid 1px $black-500;
        border-radius: 50%;
        background: #ffffff;
        img {
          width: 24px;
          height: 24px;
        }
      }
    }
  }
</style>