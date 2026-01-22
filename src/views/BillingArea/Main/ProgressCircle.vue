<template>
  <div class='progress-container'>
    <svg class='progress-ring' width='80' height='80'>
      <circle
        class='progress-ring__background'
        stroke='#eee'
        stroke-width='8'
        fill='transparent'
        r='36'
        cx='40'
        cy='40'
      />
      <circle
        class='progress-ring__circle'
        :stroke='color'
        stroke-width='8'
        fill='transparent'
        r='36'
        cx='40'
        cy='40'
        :stroke-dasharray='circumference'
        :stroke-dashoffset='dashOffset'
        stroke-linecap='round'
      />
      <text x='40' y='36' text-anchor='middle' class='progress-text'>
        剩餘<tspan x='40' dy='18' class='progress-percent-text'>{{ displayPercent }}</tspan>%
      </text>
    </svg>
    <div class='progress-info'>
      <div class='progress-info-item'>
        <p :class="{ 'over-point': isOver }"><span class='point-number'>{{ afterPoint }}</span> 單</p>
        <p class='progress-info-label'>{{ afterPointLabel }}</p>
      </div>
      <p class='divider'>/</p>
      <div class='progress-info-item'>
        <p><span class='point-number'>{{ point }}</span> 單</p>
        <p class='progress-info-label'>合約總單數</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const color = '#FC6300';

const props = defineProps({
  point: { type: Number, required: true },
  afterPoint: { type: Number, required: true },
  percent: { type: Number, required: true },
  afterPointLabel: { type: String, required: true },
  isOver: { type: Boolean, required: true }
});

const radius = 36;
const circumference = 2 * Math.PI * radius;

const numberPercent = computed(() => {
  const raw = Number(props.percent);
  return isNaN(raw) || !isFinite(raw) ? 0 : raw;
});

const displayPercent = computed(() => numberPercent.value);

const dashOffset = computed(() => circumference * (1 - numberPercent.value / 100));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/billingArea/_common.scss' as *;
</style>
