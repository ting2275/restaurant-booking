<template>
  <div class='main-box'>
    <h4>問題諮詢</h4>
    <div class='main-container'>
      <form @submit.prevent='SubmitEvent'>
        <div class='form-group selector-group'>
          <label for='questionCategories'>
            <span class='required'>*</span>諮詢類別</label>
          <DropdownMenu
            id='questionCategories'
            :key='questionCategories'
            v-model='questionCategories'
            :options='consultationOptions'
            label-key='label'
            value-key='value'
            placeholder='請選擇' />
        </div>
        <div class='form-group'>
          <div class='textarea-box'>
            <label>
              <span class='required'>*</span>諮詢內容</label>
            <textarea v-model='questionContent' placeholder='請輸入您的問題' name='' rows='5' />
          </div>
        </div>
        <div class='form-footer'>
          <div class='text'>
            <p>※ 電話客服時間：星期一~星期五 10:00~17:00</p>
            <p class='inline'>專線：0800-278-988</p>
            <p class='inline'>信箱：tda.gmb@taipeiads.com</p>
          </div>
          <div class='button-box'>
            <BaseButton variant='check' size='md' type='submit'>發送</BaseButton>
          </div>
        </div>
      </form>
    </div>
  </div>
  <BasePopUp v-model='isPopupVisible'>
    <template #title>{{ currentPopupContent.title }}</template>
    <template #content>
      {{ currentPopupContent.content1 }}
      <span class='highlight'>{{ currentPopupContent.highlight }}</span>
      {{ currentPopupContent.content2 }}
      {{ currentPopupContent.content }}
    </template>
    <template #button>
      <BaseButton variant='check' size='md' @click='closePopup'>{{ currentPopupContent.buttonText }}</BaseButton>
    </template>
  </BasePopUp>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { postCustomerContact } from '@/services/api/accountInfo';

const route = useRoute();

const consultationOptions = [
  { label: '使用問題', value: 'usage-consultation' },
  { label: '合約問題', value: 'contract-consultation' },
  { label: '通知簡訊', value: 'notification-consultation' },
  { label: '回饋與意見', value: 'feedback-consultation' },
  { label: '其他', value: 'other-consultation' },
];

const questionContent = ref('');
const isPopupVisible = ref(false);

const category = ref(route.query.category || '');
const questionCategories = ref(category.value);

const currentPopupContent = ref('');
const popupContentTemplates = ref({
  'conform': {
    title: '發送成功',
    content1: '已收到您的諮詢，將安排服務專員在',
    highlight: '3-5個工作天內',
    content2: '回覆您，感謝您的耐心等待',
    buttonText: '我知道了',
  },
  'warning': {
    title: '請輸入完整資訊',
    content: '請輸入諮詢類別與諮詢內容',
    buttonText: '確定',
  },
});

const consultationLabels = {
  'usage-consultation': '使用問題',
  'contract-consultation': '合約問題',
  'notification-consultation': '通知簡訊',
  'feedback-consultation': '回饋與意見',
  'other-consultation': '其他',
};

const togglePopup = (type, isVisible) => {
  if (isVisible) {
    currentPopupContent.value = popupContentTemplates.value[type];
  }
  isPopupVisible.value = isVisible;
}

const showPopup = (type) => {
  togglePopup(type, true);
}

const closePopup = () => {
  togglePopup(null, false);
}

const SubmitEvent = async () => {
  if (!questionCategories.value || !questionContent.value) {
    showPopup('warning')
    return;
  }

  const categoryLabel = consultationLabels[questionCategories.value];
  await postCustomerContact(categoryLabel, questionContent.value);
  showPopup('conform')
  questionCategories.value = '';
  questionContent.value = '';
};

watch(
  () => route.query.category,
  (newCategory) => {
    category.value = newCategory || '';
    questionCategories.value = category.value;
  }
);
</script>

<style lang="scss" scoped>
.required {
  color: $wrong;
}

.form-group {
  margin-bottom: 24px;

  label {
    display: block;
    margin-bottom: 16px;
  }
}

.selector-group {
  width: 50%;
}

.textarea-box {
  textarea {
    outline: none;
    background: none;
    resize: none;
    color: $black-900;
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid $black-500;

    &:focus {
      border: 1px solid $primary;
    }
  }
}

.form-footer {
  display: flex;
  justify-content: space-between;

  .text {
    font-size: 12px;
    letter-spacing: 2px;

    p {
      margin-bottom: 0.5rem;
    }

    .inline {
      display: inline-block;
      margin-right: 2rem;
    }
  }

  .button-box {
    display: flex;
    align-items: center;
  }

  @media (max-width: 1024px){
    flex-direction: column-reverse;
    .button-box{
      justify-content: flex-end;
      margin-bottom: 24px;
    }
  }
}

.highlight {
  color: $primary;
  text-align: center;
}
</style>