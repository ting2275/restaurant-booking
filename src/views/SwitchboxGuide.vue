<template>
  <h1>Switchbox Guide</h1>
  <section>
    <h2>Switchbox</h2>

    <SwitchBox id='testSW' v-model='switchValue' for-name='testName' :options='options' error-message='此為必填'>
      開關文字
    </SwitchBox>

    <!-- Demo 用：顯示開關值狀態 -->
    <div class='demo-text'>
      <p>開關值狀態: {{ jsonResponse.switchStatus }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue';

// 定義 JSON 文件
const jsonResponse = ref({
  "switchStatus": 0
});
// 定義選項。參考 JSON 文件的值定義選項開關值，前者為開值，後者為關值
const options = [1, 0];

// 根據 JSON 文件的值來設定初始值
const switchValue = ref(
  jsonResponse.value.switchStatus
);

// 監聽 switch 的值變化，並更新 JSON 文件的值
watch(switchValue, (newValue) => {
  jsonResponse.value.switchStatus = newValue;
});
</script>

<style lang="scss" scoped>
section {
  margin: 40px 10px;

  h2 {
    margin: 0 0 10px;
    font-size: 30px;

    p {
      display: inline-block;
      font-size: 14px;
      color: $black-900;
      background: $accent-1;
      padding: 0 5px;
      line-height: 2;
      border-radius: 5px;
    }
  }

  button {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
  }

  .demo-text {
    margin: 10px 0;
  }
}
</style>