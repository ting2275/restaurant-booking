<script setup>
import BasePopUp from '@/components/PopUp/BasePopUp.vue';

const props = defineProps({
    buttonCount: {
    type: Number,
    default: 1
  },
  teleportTo: {
    type: String,
    default: 'body'
  }
})
</script>

<template>
  <BasePopUp :button-count = 'props.buttonCount' :teleport-to='props.teleportTo'>
    <template #title>
      <slot name='title'>父組件層標題</slot>
    </template>
    <template #content>
      <p class='reserve-info'>
        <span class='reserve-date'><slot name='reserve-date'></slot></span>
        <slot name='reserve-info'></slot>
        <slot name='reserve-tag'></slot>
      </p>
    </template>
    <template #button>
      <slot name='button'>父組件層一個按鈕</slot>
    </template>
    <template #buttons>
      <slot name='buttons'>父組件層兩個按鈕</slot>
    </template>
  </BasePopUp>
</template>

<style lang="scss" scoped>
  .reserve-info{
    color: $black-900;
    letter-spacing: 2px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  .reserve-date {
    display: block;
    color: $primary;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 500;
  }
</style>