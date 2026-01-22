<script setup>
import { ref } from 'vue';

const popupVisibility = ref({
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
  7: false,
  8: false
});

const showPopup = (num) => {
  if (popupVisibility.value[num] !== undefined) {
    popupVisibility.value[num] = true;
  }
}

const doubleButtons = ref([
  { variant: 'cancel', size: 'sm', label: '取消' },
  { variant: 'check', size: 'sm', label: '我知道了' }
]);


const userName = ref('')
const password = ref('')
const usernameError = ref('錯誤訊息文字')
const passwordError = ref('錯誤訊息文字')
const inputs = ref([
  { model: userName, label: '帳號', placeholder: '請輸入帳號', locked: false },
  { model: userName, label: '帳號', placeholder: '請輸入帳號', locked: true },
  { model: userName, label: '帳號', placeholder: '請輸入帳號', locked: true, errorMessage: usernameError },
  { model: password, label: '密碼', type: 'password', placeholder: '請輸入密碼', locked: false },
  { model: password, label: '密碼', type: 'password', placeholder: '請輸入密碼', locked: true },
  { model: password, label: '密碼', type: 'password', placeholder: '請輸入密碼', locked: true, errorMessage: passwordError },
]);

</script>

<template>
  <h1>POPUP 彈跳視窗指南</h1>

  <section>
    <h2>POPUP - Basic with close button
      <p>基本款(預設有關閉叉號)。可以直接使用。</p>
    </h2>
    <button @click='showPopup(2)'>POPUP - Basic with close button</button>
    <BasePopUp v-model='popupVisibility[2]'>
      <template #title>請輸入完整資訊</template>
      <template #content>使用者名稱必填</template>
      <template #button>
        <BaseButton variant='check' size='md' @click='popupVisibility[2] = false'>確定</BaseButton>
      </template>
    </BasePopUp>
  </section>

  <section>
    <h2>POPUP - Basic
      <p>基本款(無關閉叉號)。傳入參數【:esc-button='false'】</p>
    </h2>
    <button @click='showPopup(1)'>POPUP - Basic</button>
    <BasePopUp v-model='popupVisibility[1]' :esc-button='false'>
      <template #title>填寫完成</template>
      <template #content>我們將安排服務專員為您介紹產品和服務</template>
      <template #button>
        <BaseButton variant='check' size='md' @click='popupVisibility[1] = false'>我知道了</BaseButton>
      </template>
    </BasePopUp>
  </section>

  <section>
    <h2>POPUP - Check reserve info
      <p>確認預定資料款</p>
    </h2>
    <button @click='showPopup(3)'>POPUP - Check reserve info</button>
    <CheckReservePopUp v-model='popupVisibility[3]'>
      <template #title>已新增預定資料</template>
      <template #reserve-date>2024年4月20日</template>
      <template #reserve-info>陳小姐，四位，19:00</template>
      <template #button>
        <BaseButton variant='check' size='md' @click='popupVisibility[3] = false'>我知道了</BaseButton>
      </template>
    </CheckReservePopUp>
  </section>

  <section>
    <h2>POPUP - Check reserve info with tag
      <p>更新預定資料狀態款。需顯示狀態Tag時把Tag components直接傳入</p>
    </h2>
    <button @click='showPopup(4)'>POPUP - Check reserve info with tag</button>
    <CheckReservePopUp v-model='popupVisibility[4]'>
      <template #title>已更新預定資料</template>
      <template #reserve-date>2024年4月20日</template>
      <template #reserve-info>陳小姐，四位，19:00</template>
      <template #reserve-tag>
        <TagReservationStatus variant='newReservation'></TagReservationStatus>
      </template>
      <template #button>
        <BaseButton variant='check' size='md' @click='popupVisibility[4] = false'>我知道了</BaseButton>
      </template>
    </CheckReservePopUp>
  </section>

  <section>
    <h2>POPUP - Double buttons
      <p>雙重確認款</p>
    </h2>
    <button @click='showPopup(5)'>POPUP - Double buttons
    </button>
    <DoubleCheckPopUp v-model='popupVisibility[5]' card-size='md'> <!--card-size 可選 lg 或 md，不填為 md-->
      <template #title>確定要刪除成員?</template>
      <template #content>刪除後無法還原資料</template>
      <template #buttons>
        <BaseButton
          v-for='(button, index) in doubleButtons' :key='index' :variant='button.variant' :size='button.size'
          @click='popupVisibility[5] = false'>
          {{ button.label }}
        </BaseButton>
      </template>
    </DoubleCheckPopUp>
  </section>

  <section style='opacity: .4;'>
    <h2>POPUP - Delete Alert </h2>
    <button @click='showPopup(6)'>POPUP - Delete Alert</button> (尚未製作)
  </section>

  <section>
    <h2>POPUP - Notify
      <p>通知款。可傳入顯示秒數【:duration='3000'】預設為3000毫秒</p>
    </h2>
    <button @click='showPopup(7)'>POPUP - Notify</button>
    <NotifyPopUp v-model='popupVisibility[7]' :duration='2000'>
      <template #title>最新通知</template>
      <template #avatar>
        <img src='@/assets/images/resources/TD-avatar.svg' alt='avatar'>
      </template>
      <template #content>
        您的合約將於<span style='color:orange'>30日</span>後到期，如有合約問題請填寫問題諮詢。
      </template>
    </NotifyPopUp>
  </section>

  <section>
    <h2>POPUP - Functional for form or other
      <p>詳細內容版。沒有大標題只有天地小標，內容隨意塞。寬度有lg 或 md。</p>
    </h2>
    <button @click='showPopup(8)'>POPUP - Check reserve info with tag</button>
    <PlainPopUp v-model='popupVisibility[8]' card-size='lg'> <!--card-size 可選 lg 或 md，不填為 md-->
      <template #title>已更新預定資料</template>
      <template #content>
        <!-- 中間換成任何想放的form表或其他內容 -->
        <BaseInput
          v-for='(input, index) in inputs' :key='index' v-model='input.model' :label='input.label'
          :type='input.type' :placeholder='input.placeholder' :locked='input.locked'
          :error-message='input.errorMessage' />
      </template>
      <template #buttons>
        <BaseButton
          v-for='(button, index) in doubleButtons' :key='index' :variant='button.variant' :size='button.size'
          @click='popupVisibility[8] = false'>
          {{ button.label }}
        </BaseButton>
      </template>
    </PlainPopUp>
  </section>

  <section>
    <h2>開關的傳遞
      <p>在別的子組件中引用時，要在中繼層監聽兩個值，一個是父層來的prop.visible，一個是子層來的emit。</p>
    </h2>
    <ul style='background-color: antiquewhite;'>
      <li>
        <h4>導入子頁面的最上層(祖父層):</h4>
        <pre>
        <h5>template</h5>
        <code>
          &lt;AddReservationPopup
          v-model:visible='isAddPopupVisible'
          /&gt;
        </code>
      </pre>
      </li>
      <li>
        <h4>子頁面(中繼層):</h4>
        <pre>
          <h5>template</h5>
        <code>
          &lt;PlainPopUp
          v-model='isPopupVisible'
          &gt;
        </code>
      </pre>
        <pre>
          <h5>script</h5>
        <code>
          const emit = defineEmits(['update:visible']);
          const props = defineProps({
            visible: {
                type: Boolean,
                required: false
            }
          })

          // 當父層開啟彈窗
          watch(() => props.visible, (newVal) => {
              isPopupVisible.value = newVal;
          });

          // 當子層關閉彈窗
          watch(() => isPopupVisible.value, (newVal) => {
              emit('update:visible', value); // 通知父層更新
          });
        </code>
      </pre>
      </li>
      <li>
        <h4>彈窗本component(孫子層)</h4>
        <h5>不用更改，組件已有emit值出來</h5>
      </li>
    </ul>
  </section>

</template>

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
}
</style>