<script setup>
import BasePopUp from '@/components/PopUp/BasePopUp.vue';
const props = defineProps({
    cardSize: {
    type: String,
    default: 'md'
  },
  teleportTo: {
    type: String,
    default: 'body'
  }
})
</script>

<template>
  <BasePopUp :button-count = '2' :card-size='props.cardSize' :teleport-to='props.teleportTo'>
    <template #title>
      <slot name='title'>父組件層標題</slot>
    </template>
    <template #content>
      <slot name='content'>父組件層內文</slot>
    </template>
    <template #buttons>
      <slot name='buttons'>父組件層兩個按鈕</slot>
    </template>
  </BasePopUp>
</template>