<template>
  <div class='main-box'>
    <!-- Inputs-components -->
    <h1>Input 輸入框指南</h1>
    <br><br>

    <h2>
      BaseInput 基本輸入框
      <p>基本款。props項目可參考原檔。</p>
    </h2>

    <BaseInput
      v-model='baseInput01'
      label='label名稱'
      type='text'
      placeholder='請輸入內容'
      :locked='false'
    />
    <BaseButton variant='check' size='md' @click='saveSettings01'>儲存</BaseButton>

    <div v-if='isSaved01'>
      <p>輸入內容：{{ baseInput01 }}</p>
    </div>

    <br><br>

    <h4>
      帳號密碼功能
      <p>有type跟error-message可以顯示錯誤訊息。</p>
    </h4>

    <BaseInput
      v-model='userName'
      label='帳號'
      placeholder='請輸入帳號'
      :locked='false'
      :required='true'
      :error-message='usernameErrorMessage'
    />
    <BaseInput
      v-model='password'
      label='密碼'
      type='password'
      placeholder='請輸入密碼'
      :locked='false'
      :required='true'
      :error-message='passwordErrorMessage'
    />
    <br>
    <BaseButton variant='check' size='md' @click='saveSettings'>儲存</BaseButton>

    <div v-if='isSaved'>
      <p>帳號：{{ savedUserName }}</p>
      <p>密碼：{{ savedPassword }}</p>
    </div>

    <br><br><br>

    <h2>
      SearchInput 搜尋輸入框
      <p>有search事件可以觸發，enter可直接搜尋。</p>
    </h2>

    <SearchInput
      v-model='searchContent'
      label='搜尋'
      type='search'
      placeholder='請輸入搜尋內容'
      @search='handleSearch'
    />

    <div v-if='searchResult'>
      <p>搜尋結果：{{ searchResult }}</p>
    </div>

    <br><br><br>

    <!-- PhoneInput -->
    <h2>
      PhoneInput 電話輸入框
      <p>有v-phone-input的套件，可以輸入電話號碼。</p>
    </h2>

    <PhoneInput
      v-model='phoneNumber'
      label='電話'
      type='phone'
      :locked='false'
      :required='true'
      :error-message='phoneErrorMessage'
      @update:error-message='updatePhoneErrorMessage'
    />

    <BaseButton @click='showPhoneNumber'>送出</BaseButton>

    <!-- 顯示輸入的電話號碼 -->
    <div v-if='displayPhoneNumber'>
      <p>電話號碼: {{ displayedPhoneNumber }}</p>
    </div>

    <br><br><br>

    <section>
      <h2>
        組件導入教學
        <p>在別的組件中引用時的注意事項</p>
      </h2>
      <ul style='background-color: antiquewhite;'>
        <li>
          <h4>
            導入BaseInput:
          </h4>
          <pre>
          <h5>template</h5>
          <code>
            &lt;BaseInput
            v-model='baseInput01'
            label='label名稱'
            type='text'
            placeholder='請輸入內容'
            :locked='false'
            /&gt;
          </code>
        </pre>
        </li>
        <li>
          <h4>導入SearchInput:</h4>
          <pre>
          <h5>template</h5>
          <code>
            &lt;SearchInput
            v-model='searchContent'
            label='搜尋'
            type='search'
            placeholder='請輸入搜尋內容'
            @search='handleSearch'
            /&gt;
            &lt;div v-if='searchResult'&gt;
            &lt;p&gt;搜尋結果：&#123;&#123; searchResult &#125;&#125;&lt;/p&gt;
            &lt;/div&gt;
          </code>
        </pre>
          <pre>
          <h5>script</h5>
          <code>
            const searchContent = ref('');
            const searchResult = ref('');
            function handleSearch() {
              console.log('搜尋內容：', searchContent.value);
              searchResult.value = searchContent.value;
              // 在這裡可以添加其他搜尋邏輯
            }
          </code>
        </pre>
        </li>
        <li>
          <h4>導入PhoneInput:
            <p>使用外部插件v-phone-input</p>
          </h4>
          <pre>
          <h5>template</h5>
          <code>
            &lt;PhoneInput
            v-model='phoneNumber'
            label='電話'
            type='phone'
            :locked='false'
            :required='true'
            :error-message='phoneErrorMessage'
            @update:error-message='updatePhoneErrorMessage'
            /&gt;
          </code>
        </pre>
          <pre>
          <h5>script</h5>
          <code>
            const phoneNumber = ref('');
            const phoneErrorMessage = ref('');
            const updatePhoneErrorMessage = (massge) => {
              phoneErrorMessage.value = massge
            }
          </code>
        </pre>
        </li>
      </ul>
    </section>
  </div>

</template>

<script setup>
import { ref, computed } from "vue";
import "v-phone-input/dist/v-phone-input.css";
import PhoneInput from "@/components/Input/PhoneInput.vue";
import { useTitle } from "@vueuse/core";
const title = useTitle();
title.value = "Input 輸入框指南";

// BaseInput 基本輸入框
const baseInput01 = ref('');
const isSaved01 = ref(false);
function saveSettings01() {
  if (baseInput01.value.trim() !== '') {
    isSaved01.value = true;
    console.log('儲存成功：', baseInput01.value);
  } else {
    isSaved01.value = false;
    console.log('輸入內容不能為空');
  }
}

// BaseInput 帳號密碼功能
const userName = ref('');
const password = ref('');
const usernameError = ref('請輸入有效的電子郵件地址');
const passwordError = ref('密碼不能為空');
const isSubmitted = ref(false);
const isSaved = ref(false);
const savedUserName = ref('');
const savedPassword = ref('');

function showError(input) {
  return !input || input.trim() === '';
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

const usernameErrorMessage = computed(() => {
  return !isValidEmail(userName.value) && isSubmitted.value ? usernameError.value : '';
});

const passwordErrorMessage = computed(() => {
  return showError(password.value) && isSubmitted.value ? passwordError.value : '';
});

function saveSettings() {
  isSubmitted.value = true;

  if (!isValidEmail(userName.value)) {
    usernameError.value = '請輸入有效的電子郵件地址';
  } else {
    usernameError.value = '';
  }

  if (showError(password.value)) {
    passwordError.value = '密碼不能為空';
  } else {
    passwordError.value = '';
  }

  if (!usernameError.value && !passwordError.value) {
    // 儲存帳號和密碼
    savedUserName.value = userName.value;
    savedPassword.value = password.value;
    isSaved.value = true;
    console.log('儲存成功');
  } else {
    isSaved.value = false;
  }
}

// SearchInput 搜尋輸入框
const searchContent = ref('');
const searchResult = ref('');

function handleSearch() {
  console.log('搜尋內容：', searchContent.value);
  searchResult.value = searchContent.value;
  // 在這裡可以添加其他搜尋邏輯
}

// PhoneInput 電話輸入框
const phoneNumber = ref('');
const phoneErrorMessage = ref('');
const displayPhoneNumber = ref(false); //渲染畫面用
const displayedPhoneNumber = ref(''); //渲染畫面用

const updatePhoneErrorMessage = (massge) => {
  phoneErrorMessage.value = massge
}
// 渲染畫面電話號碼(非必須)
const showPhoneNumber = () => {
  if (phoneNumber.value.trim() !== '') {
    displayedPhoneNumber.value = phoneNumber.value;
    displayPhoneNumber.value = true;
    console.log('電話號碼：', displayedPhoneNumber.value);
  } else {
    phoneErrorMessage.value = '請輸入有效的電話號碼';
    displayPhoneNumber.value = false;
  }
};

</script>

<style lang="scss" scoped>

.main-box {
  margin: 40px 40px;
  display: flex;
  justify-content: center;
  flex-direction: column;

  >h1 {
    margin: 0px 0;
  }

  >h2, h3, h4 {
    margin: 0 0 10px;
    p {
      display: inline-block;
      font-size: 16px;
      color: $black-900;
      background: $accent-1;
      padding: 0 5px;
      line-height: 2;
      border-radius: 5px;
    }

  }
}

 .button-components-box{
  display: flex;
  gap:20px; margin:0px 0 ;
 }

 section {
  margin: 40px 10px;

  ul {
    padding: 20px;
    list-style-type: none;
  }

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
}

</style>
