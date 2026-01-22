<template>
  <div class='pagination-box'>
    <img src='@/assets/images/icons/start-arrow.svg' alt='' @click='goToPage(1)'>
    <img src='@/assets/images/icons/left-arrow.svg' alt='' @click='goToPage(currentPage - 1)'>
    <div>第{{ currentPage }}頁 / 共{{ totalPages }}頁</div>
    <img src='@/assets/images/icons/right-arrow.svg' alt='' @click='goToPage(currentPage + 1)'>
    <img src='@/assets/images/icons/end-arrow.svg' alt='' @click='goToPage(totalPages)'>
    <div>共{{ totalItems }}筆</div>
  </div>
</template>

<script setup>
  import { defineProps, defineEmits } from 'vue';

  const props = defineProps({
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    }
  });

  const emit = defineEmits(['update:page', 'update:currentPage']);

  const goToPage = (page) => {
    if (page < 1 || page > props.totalPages) return;
    emit('update:page', page);
  };
</script>

<style lang="scss" scoped>
  .pagination-box {
    display: flex;
    align-items: center;
    justify-content: center;
    // margin: 30px 0 0 0;
    @extend .body2;
    gap: 16px;
    div:last-child {
      margin: 0 0 0 24px;
    }
    img {
      cursor: pointer;
    }
  }
</style>