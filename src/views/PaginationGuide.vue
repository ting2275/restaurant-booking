<template>
  <BasePagination
    :current-page='currentPage'
    :total-pages='totalPages'
    :total-items='totalItems'
    @update:page='handlePageChange'
  />
</template>

<script setup>
  import { ref } from 'vue';
  import BasePagination from '@/components/Pagination/BasePagination.vue'

  const currentPage = ref(1);
  const totalPages = ref(3);
  const totalItems = ref(56);

  const handlePageChange = (newPage) => {
    currentPage.value = newPage;
  };
</script>

<style lang="scss" scoped>

</style>