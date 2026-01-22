<template>
  <div class='component-guide'>
    <h2>Checkbox 組件使用指南</h2>

    <!-- 多選 Checkbox 的示例 -->
    <section>
      <h3>多選Checkbox 使用指南</h3>
      <div class='checkbox-container'>
        <!-- 外部使用組件時必要 -->
        <div v-for='(option) in serviceOptions' :key='option.value'>
          <CheckBox
            :id='option.value'
            v-model='selectedServices'
            :for-name="'serves'"
            :value='option.value'
            :is-disabled='option.isDisabled'
            :has-input='option.hasInput'
            :input-placeholder='option.inputPlaceholder'
            :input-value='inputValues[option.value]'
            @update:input-value='(value) => handleInputChange(option.value, value)'
          >
            {{ option.label }}
          </Checkbox>
        </div>
      </div>

      <!-- Demo 用：顯示已選擇的服務 -->
      <div class='demo-text'>
        <p>已選擇的服務: {{ formattedSelectedServices }}</p>
      </div>
    </section>

    <!-- 單選 Checkbox 的示例 -->
    <section>
      <h3>單選 Checkbox 示例</h3>
      <CheckBox
        id='acceptTerms'
        v-model='acceptTerms'
        :for-name="'terms'"
        :value='true'
        :is-disabled='false'
        :custom-class="'single-checkbox'"
      >
        我接受條款和條件
      </Checkbox>
      <p>接受條款: {{ acceptTerms ? '是' : '否' }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 以下為外部使用組件時必要

// 保存每個選項的 input 值
const inputValues = ref({});

// 處理輸入變化
function handleInputChange(optionValue, newValue) {
  inputValues.value[optionValue] = newValue;
}

// 以下為DEMO用
// 用於指南的服務選項
const serviceOptions = ref([
  { label: '線上訂位', value: 'onlineBooking', isDisabled: true, hasInput: false },
  { label: '線上訂餐', value: 'onlineOrder', isDisabled: false, hasInput: false },
  { label: '線上訂飲料', value: 'onlineDrink', isDisabled: false, hasInput: false },
  { label: '其他', value: 'other', isDisabled: false, hasInput: true, inputPlaceholder: '' }
]);

// const serviceOptions = ref([
//   { label: '線上訂位', value: 'onlineBooking', isDisabled: true },
//   { label: '線上訂餐', value: 'onlineOrder', isDisabled: false },
//   { label: '線上訂飲料', value: 'onlineDrink', isDisabled: false }
// ]);

// 用於指南的選擇服務的數組
const selectedServices = ref([]);

// 用於指南格式化已選擇的服務
const formattedSelectedServices = computed(() => {
  return selectedServices.value
    .map((serve) => {
      const option = serviceOptions.value.find(option => option.value === serve);
      const inputValue = inputValues.value[serve] || '';
      return `${option ? option.label : serve}${inputValue ? `: ${inputValue}` : ''}`;
    })
    .join('、');
});

// 單選框值
const acceptTerms = ref(false);
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

.checkbox-container {
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