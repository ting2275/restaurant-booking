<template>
  <div class='main-box'>
    <h4>終止連動</h4>
    <div class='main-container'>
      <div class='tag'>提醒</div>
      <div class='statement '>
        <p>終止連動後<span class='highlight'>系統任何更動將無法同步至 Google，也無法接收來自 Google 預訂的資料</span>，這可能<span class='highlight'>導致顧客預訂資料的遺漏，進而引發消費糾紛</span>。請務必謹慎操作，因終止連動所造成的損失本公司恕不負責。</p>
        <p>終止連動 Google 預訂功能不等於取消方案。終止連動後，<span class='highlight'>如欲重新連動，需酌收設置費3000元</span>，請聯繫服務專員進行設定，連動審核會於5個工作天內生效，如有不便，敬請見諒。</p>
      </div>
      <div class='dashboard'>
        <div class='item-title'>Google 商家檔案連動狀態</div>
        <div class='status' :class='syncStatusColor'>{{ syncStatusText }}</div>
        <div class='action'>
          <BaseButton v-if='customerStatus === 1' variant='check' size='sm' @click='showPopup("disconnect")'> 終止連動 </BaseButton>
          <BaseButton v-else variant='check' size='sm' @click='showPopup("reconnect")'> 重新連動 </BaseButton>
        </div>
      </div>
    </div>
  </div>
  <DoubleCheckPopUp v-model='isPopupVisible'>
    <template #title>{{ currentPopupContent.title }}</template>
    <template #content>
      <div v-html='sanitizedContent'></div>
    </template>
    <template #buttons>
      <BaseButton :variant='buttonCancel.variant' :size='buttonCancel.size' @click='closePopup'>
        {{ buttonCancel.label }}
      </BaseButton>
      <BaseButton :variant='buttonConfirm.variant' :size='buttonConfirm.size' @click='currentPopupContent.buttonAction'>
        {{ currentPopupContent.buttonText }}
      </BaseButton>
    </template>
  </DoubleCheckPopUp>
</template>

<script setup>
import { ref, computed , watch } from 'vue';
import { stopGoogleConnect } from '@/services/api/accountInfo';
import DOMPurify from 'dompurify';
import { useAccountStore } from '@/stores/accountStore';

const accountStore = useAccountStore();

const customerStatus = ref(accountStore.googleStatus);

const syncStatusText = computed(() => accountStore.getGoogleStatusText);

const getStatusColor = (status) => {
  return {
    0: 'status-error',
    1: 'status-success',
    3: 'status-reviewing',
    8: 'status-expired',
    9: 'status-pending'
  }[status];
}

const syncStatusColor = computed(() => getStatusColor(accountStore.googleStatus));

const buttonCancel = ref({ variant: 'cancel', size: 'md', label: '取消' });
const buttonConfirm = ref({ variant: 'check', size: 'md' });

const getCustomerStatus = () => {
  customerStatus.value = accountStore.googleStatus;

};

const disconnect = async () => {
  try {
    await stopGoogleConnect(9);
    await accountStore.setAccountInfo({googleStatus: 9}, true);
  } catch (error) {
    handleError(error);
  } finally {
    closePopup();
  }
};

const isPopupVisible = ref(false);
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

// 統一處理錯誤
const handleError = (error) => {
  console.error('Error:', error);
}

const popupContentTemplates = ref({
  'disconnect': {
    title: '確定要終止連動?',
    content: '終止後系統<span class="highlight">將無法接收任何線上訂位</span>，也無法接收來自 Google 預訂的資料',
    buttonText: '確定終止',
    buttonAction: () => disconnect()
  },
  'reconnect': {
    title: '重新連動注意事項',
    content: '<span class="highlight">需酌收設定費3000元</span>，請聯繫服務專員進行設定，連動審核會於5個工作天內生效',
    buttonText: '聯繫服務專員',
    buttonAction: () => {
      closePopup()
      // router.push('../Contacts');
    }
  }
});

const currentPopupContent = ref(popupContentTemplates.value.disconnect);
const sanitizedContent = computed(() => {
  return DOMPurify.sanitize(currentPopupContent.value.content);
});

watch (
  () => accountStore.googleStatus,
  () => {
    getCustomerStatus();
  }
);
</script>

<style lang="scss" scoped>
.highlight{
  color: $primary;
}
.tag {
  color: $primary;
  background-color: $secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 79px;
  height: 32px;
  border-radius: 24px;
  font-size: map-get($body2, font-size);
  line-height: map-get($body2, line-height);
  font-weight: map-get($body2, font-weight);
  letter-spacing: map-get($body2, letter-spacing);
}

.dashboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  letter-spacing: 2px;
  //已關閉 googleStatus:0
  .status-error {
    color: $wrong;
  }
  //啟用中 googleStatus:1
  .status-success {
    color: $success;
  }
  //連動審核中 googleStatus:3
  .status-reviewing {
    color: $primary;
  }
  //已到期 googleStatus:8
  .status-expired {
    color: $wrong;
  }
  //申請停用中 googleStatus:9
  .status-pending {
    color: $wrong;
  }
}

.statement {
  margin: 30px 0 60px;
  letter-spacing: 2px;

  p {
    margin: 0 0 20px;
  }
}

:deep(.highlight) {
  color: $primary;
}

:deep(.action .btn) {
  border-radius: 50px;
}
</style>