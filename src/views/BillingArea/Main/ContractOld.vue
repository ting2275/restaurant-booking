<template>
  <div class='info-box'>
    <div class='info-box-header'>
      <h4>{{ name }}</h4>
      <div class='info-box-header-right'>
        <div>
          <img src='@/assets/images/icons/plan.svg' alt=''>
          <p>{{ solution }}</p>
        </div>
      </div>
    </div>
    <div class='content-box'>
      <div class='content-box-left'>  
        <div>
          <p>服務期間</p>
          <p>{{ formatDate(startDay) }} - {{ formatDate(endDay) }}</p>
        </div>
        <div>
          <p>剩餘天數</p>
          <p><span class='remaining-days'>{{ diffDay }}</span> 天</p>
        </div>
      </div>
      
    </div>
  </div>
</template>
    
<script setup>
import { useFormat } from "@/composables/useFormat";
const { formatDate } = useFormat();

defineProps({
//   contractData: { type: Object, default: () => ({}) },
  // point: { type: Number, default: 0 },
//   usedPoint: { type: Number, default: 0 },
//   afterPoint: { type: Number, default: 0 },
  // afterPointInfo: { type: String, default: '' },
  name: { type: String, default: '' },
  solution: { type: String, default: '' },
  // solutionInfo: { type: String, default: '' },
  startDay: { type: String, default: '' },
  endDay: { type: String, default: '' },
  diffDay: { type: Number, default: 0 },
});
</script>
  
<style lang="scss" scoped>
@use '@/assets/scss/pages/billingArea/_common.scss' as *;
</style>


