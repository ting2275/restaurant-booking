<template>
  <div class='info-box'>
    <div class='info-box-header'>
      <h4>{{ name }}</h4>
      <div class='info-box-header-right'>
        <div>
          <img src='@/assets/images/icons/plan.svg' alt=''>
          <p>{{ solution }}方案共<span class='point-number'>{{ point }}</span>單</p>
        </div>
        <p v-show='props.solutionInfo' class='solution-info'>{{ solutionInfoDisplay }}</p>
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
      <!-- 剩餘進度條 -->
      <ProgressCircle
        :point='point'
        :after-point='afterPointInfo.display'
        :percent='afterPointInfo.percent'
        :after-point-label='afterPointInfo.label'
        :is-over='afterPointInfo.isOver'
      />
    </div>
  </div>
</template>

<script setup>
import ProgressCircle from "@/views/BillingArea/Main/ProgressCircle.vue";
import { useFormat } from "@/composables/useFormat";
import { computed } from 'vue';

const { formatDate } = useFormat();

const props = defineProps({
//   contractData: { type: Object, default: () => ({}) },
  point: { type: Number, default: 0 },
//   usedPoint: { type: Number, default: 0 },
//   afterPoint: { type: Number, default: 0 },
  afterPointInfo: { type: Object, default: () => ({}) },
  name: { type: String, default: '' },
  solution: { type: String, default: '' },
  solutionInfo: { type: String, default: '' },
  startDay: { type: String, default: '' },
  endDay: { type: String, default: '' },
  diffDay: { type: Number, default: 0 },
});

const solutionInfoDisplay = computed(() => {
  return props.solutionInfo ? `(${props.solutionInfo})` : '';
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/billingArea/_common.scss' as *;
</style>