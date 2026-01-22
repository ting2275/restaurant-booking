<script setup>
import { ref } from 'vue';
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
const baseRef = ref(null)
const scrollToTop = () => baseRef.value?.scrollToTop()
const scrollToBottom = () => baseRef.value?.scrollToBottom()
defineExpose({
  scrollToTop,
  scrollToBottom
})
</script>

<template>
  <BasePopUp ref='baseRef' :button-count = '2' :popup-mode = '"plain"' :card-size='props.cardSize' :teleport-to='props.teleportTo'>
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