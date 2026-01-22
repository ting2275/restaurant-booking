<template>
  <div class='area-normal'>
    <span class='area-name'>{{ area.areaName }}</span>
    <div class='area-info'>
      <div class='table-icon'>
        <img src='@/assets/images/icons/table.svg' alt='桌子' />
      </div>
      <span class='table-count'>{{ area.tablesQuantity }}</span>
      <div class='right-arrow-icon'>
        <img src='@/assets/images/icons/right-arrow.svg' alt='進入' />
      </div>
    </div>
  </div>
</template>
  
<script setup>
const { area } = defineProps({
  area: { type: Object, required: true }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/pages/businessSettings/_common.scss';
</style>