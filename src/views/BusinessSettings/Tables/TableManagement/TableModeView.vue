<template>
  <div class='table-row'>
    <div class='col table-number'>
      <div class='table-icon'>
        <img src='@/assets/images/icons/table.svg' alt='桌子' />
      </div>
      {{ table.tableName }}
    </div>
    <div class='col table-type'>{{ table.partySize }}人桌</div>
    <div class='col table-status'>
      {{ table.isOnlineBooking === '1' ? '可以' : '不行' }}
    </div>
  </div>
</template>
  
<script setup>
const { table } = defineProps({
  table: { type: Object, required: true }
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/businessSettings/_tableManagement.scss' as *;
</style>

