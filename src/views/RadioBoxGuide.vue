<template>
  <div class='component-guide'>
    <h2>Radio 組件使用指南</h2>

    <!-- 單選 Radio 的示例 -->
    <section>
      <h3>單選 Radio 使用指南</h3>
      <div class='radio-container'>
        <!-- 外部使用組件時必要 -->
        <div v-for='(option, index) in genderOptions' :key='option.value'>
          <RadioBox
            :id='`gender-${index}`'
            v-model='selectedGender'
            :for-name="'gender'"
            :value='option.value'
            :is-disabled='option.isDisabled'
            :custom-class="'radio-button'"
          >
            {{ option.label }}
          </RadioBox>
        </div>
      </div>

      <!-- Demo 用：顯示已選擇的性別 -->
      <div class='demo-text'>
        <p>已選擇的性別: {{ selectedGenderLabel }}</p>
      </div>
    </section>

    <!-- 單選 Radio 的示例 -->
    <section>
      <h3>單選 Radio 示例</h3>
      <RadioBox
        id='newsletter'
        v-model='subscribeNewsletter'
        :for-name="'newsletter'"
        :value='true'
        :is-disabled='false'
        :custom-class="'single-radio'"
      >
        我想訂閱電子報
      </RadioBox>

      <!-- Demo 用：顯示是否訂閱電子報 -->
      <div class='demo-text'>
        <p>訂閱電子報: {{ subscribeNewsletter ? '是' : '否' }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
// 外部使用組件時必要

// 單選框的選項
const genderOptions = ref([
  { label: '男性', value: 'male', isDisabled: false },
  { label: '女性', value: 'female', isDisabled: false },
  { label: '不透露', value: 'preferNotToSay', isDisabled: true }
]);

// 用於指南的已選性別
const selectedGender = ref('');

// 單選框已選的性別標籤
const selectedGenderLabel = computed(() => {
  const selectedOption = genderOptions.value.find(option => option.value === selectedGender.value);
  return selectedOption ? selectedOption.label : '未選擇';
});

// 單選框值
const subscribeNewsletter = ref(false);
</script>

<style scoped>
.component-guide {
  padding: 20px;
}

section {
  margin-bottom: 40px;
}

h3 {
  margin: 15px 0;
}

.radio-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

.demo-text {
  margin: 10px 0;
}
</style>
