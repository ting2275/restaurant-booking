<template>
  <div class='main-box'>
    <h4>合約概況</h4>
    <div class='main-container'>
      <div class='table'>
        <div v-for='data in contractsDatas' :key='data.id' class='data-set'>
          <div class='data-title'>{{ data.title }}</div>
          <div :class="['data-value', { 'highlight': data.title === '剩餘天數' }]">{{ data.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useAccountStore } from '@/stores/accountStore';

const accountStore = useAccountStore();

const contractsDatas = ref([])
const getUserInfo = async () => {
  try {
    contractsDatas.value = [
      { id: 1, title: '合約編號', value: accountStore.solution.solutionId },
      { id: 2, title: '合約起始日', value: accountStore.solution.solutionStartDay },
      { id: 3, title: '合約到期日', value: accountStore.solution.solutionEndDay },
      { id: 4, title: '剩餘天數', value: accountStore.differenceDay }
    ];
  } catch (error) {
    handleError(error);
  }
}

const handleError = (error) => {
  console.error('Error:', error);
}

watch(
  () => [
    accountStore.solution,
    accountStore.differenceDay
  ],
  () => {
    getUserInfo();
  }, {
    immediate: true
  }
)
</script>

<style lang="scss" scoped>
.table {
  margin-bottom: 40px;

  .data-set {
    display: flex;
    padding: 10px 0;

    .data-title {
      flex-basis: 250px;
    }

    .data-value {
      &.highlight {
        color: $primary;
      }
    }
  }
}

:deep(.btn) {
  border-radius: 50px;
}
</style>