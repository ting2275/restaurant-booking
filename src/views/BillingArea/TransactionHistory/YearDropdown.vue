<template>
  <div ref='dropdownRef' class='custom-dropdown'>
    <div class='dropdown-trigger' @click='toggleDropdown'>
      <img src='@/assets/images/icons/calender.svg' class='calendar-icon' />
      <span>{{ modelValue }}年</span>
    </div>
    <div v-if='showDropdown' class='dropdown-menu'>
      <div
        v-for='year in yearOptions'
        :key='year'
        :class="['dropdown-item', { active: year === modelValue }]"
        @click.stop='selectYear(year)'
      >
        {{ year }}年
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed } from 'vue';
import { onClickOutside } from '@vueuse/core';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  startYear: {
    type: Number,
    default: 2024,
  },
});
const emit = defineEmits(['update:modelValue']);

const showDropdown = ref(false);
const dropdownRef = ref(null);

const currentYear = new Date().getFullYear();
const yearOptions = computed(() =>
  Array.from({ length: currentYear - props.startYear + 1 }, (_, i) => currentYear - i)
);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}
function selectYear(year) {
  emit('update:modelValue', year);
  showDropdown.value = false;
}

onClickOutside(dropdownRef, () => {
  showDropdown.value = false;
});
</script>
  
<style lang="scss" scoped>
@use "@/assets/scss/pages/billingArea/_common.scss" as *;
</style>