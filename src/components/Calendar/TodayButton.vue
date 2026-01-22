<template>
  <button class='datepicker-button-box today-button' @click='selectToday'>
    今日
  </button>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import "vue-datepicker-next/index.css";
import moment from 'moment';

const emit = defineEmits(['select-today']);

const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD');
};

const today = ref(new Date());
const formattedToday = computed(() => formatDate(today.value));

const selectToday = () => {
  emit('select-today', formattedToday.value);
};

// 初始化時發出格式化的日期
onMounted(() => {
  emit('select-today', formattedToday.value);
});
</script>

<style lang="scss">
@use '@/assets/scss/components/datepicker/_datepicker.scss' as *;
</style>