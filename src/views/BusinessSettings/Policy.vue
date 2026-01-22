<template>
  <div class='main-box'>
    <div class='hint-box'>
      <BaseButton variant='secondary' size='sm'>提醒</BaseButton>
      <p>
        請輸入顧客預訂條款或條件。新設定將於<span>
          24 - 48小時</span
        >顯示於 Google 預訂服務中的重要注意事項。
      </p>
    </div>

    <div class='textarea-box'>
      <p>預訂政策</p>
      <textarea
        id='policy-content'
        v-model='policyContent'
        name=''
        cols='30'
        rows='10'
        :placeholder='policyPlaceholder'
        :class='{
          "textarea-view-only": isViewOnly
        }'
        @input='handleTextareaChange'
      ></textarea>
    </div>
    <div class='button-box'>
      <p 
        :class="{ 'span-view-only': isViewOnly }" 
        @click='clearText'
      >
        <span>清除文字</span>
      </p>

      <BaseButton variant='check' size='md' :is-view-only='isViewOnly' @on-click='savePolicy'>儲存</BaseButton>
    </div>
  </div>

  <!-- 成功 Popup -->
  <BasePopUp v-model='showSuccessPopup' :esc-button='false'>
    <template #title>儲存成功</template>
    <template #content>資料已儲存完成</template>
    <template #button>
      <BaseButton variant='check' size='md' @on-click='showSuccessPopup = false'
      >我知道了</BaseButton
      >
    </template>
  </BasePopUp>

  <!-- 失敗 Popup -->
  <BasePopUp v-model='showFailurePopup' :esc-button='false'>
    <template #title>儲存失敗</template>
    <template #content>{{ errorMessage }}</template>
    <template #button>
      <BaseButton variant='check' size='md' @on-click='showFailurePopup = false'
      >我知道了</BaseButton
      >
    </template>
  </BasePopUp>
</template>

<script setup>
import { ref, inject, onMounted, watch, computed } from "vue";
import { useTitle } from "@vueuse/core";
import { useUserStore } from "@/stores/userStore";
import { getPolicy, updatePolicy } from "@/services/api/shop";
// import { useShopStore } from "@/stores/shopStore";
import { useTokenWatcher } from "@/composables/useTokenWatcher";
import { useSystemStore } from '@/stores/systemStore';
import { useAccountStore } from '@/stores/accountStore';

const accountStore = useAccountStore();
const isViewOnly = computed(() => accountStore.isViewOnly);

const systemStore = useSystemStore();
// const shopStore = useShopStore();
const title = useTitle();
title.value = "店家營業設定-預訂政策";
const userStore = useUserStore();
const isEditing = inject('isEditing')

// 彈窗
const showSuccessPopup = ref(false);
const showFailurePopup = ref(false);
const errorMessage = ref("保存政策失敗，請稍後再試");

//獲取userStore的maintainOwnerCompany
const storeId = ref(userStore.merchantId);
const policyContent = ref("");
const policyPlaceholder = ref("");
// 獲取政策
const fetchPolicy = async () => {
  try {
    if (!storeId.value) {
      console.error("MerchantId not found in store");
      return;
    }
    const result = await getPolicy(storeId.value);

    if (result && result.memo !== undefined && result.memo !== null) {
      policyContent.value = result.memo || "";
    } else {
      policyContent.value = "";
      policyPlaceholder.value = "請輸入您的預訂政策，例如：訂位僅保留10分鐘，如有特殊情況，請直接聯繫店家。";
    }
  } catch (error) {
    console.error("Error fetching policy:", error);
    policyContent.value = "";
    policyPlaceholder.value = "";
  }
};

const handleTextareaChange = () => {
  isEditing.value = true;
  systemStore.setSystemIsEditing(true);
};
// 保存政策
const savePolicy = async () => {
  if (!storeId.value) {
    console.error("MerchantId not found, cannot save policy");
    errorMessage.value = "無法保存政策，商戶ID未找到";
    showFailurePopup.value = true;
    return;
  }
  const contentToSave = policyContent.value ? policyContent.value.trim() : null;
  try {
    const result = await updatePolicy(storeId.value, contentToSave);
    if (result.success) {
      showSuccessPopup.value = true;
      policyContent.value = contentToSave === null ? "" : contentToSave;
      policyPlaceholder.value = "";
    } else {
      errorMessage.value = result.message || "保存政策失敗，請稍後再試";
      showFailurePopup.value = true;
      policyPlaceholder.value = "";
    }
  } catch (error) {
    console.error("Error saving policy:", error);
    errorMessage.value = "發生錯誤，請稍後再試";
    showFailurePopup.value = true;
    policyPlaceholder.value = "";
  }

  // shopStore.fetchShopInfo();
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
};

// 清除按鈕的處理邏輯
function clearText() {
  policyContent.value = "";
  policyPlaceholder.value = "";
  isEditing.value = true
  systemStore.setSystemIsEditing(true);
}

// 组件挂载时获取政策
onMounted(async () => {
  await fetchPolicy();
});

watch(storeId, (newStoreId) => {
  if (newStoreId) {
    fetchPolicy();
  }
});

const reloadFunction = () => {
  fetchPolicy();
};
useTokenWatcher(reloadFunction);
</script>

<style lang="scss" scoped>
  * {
    letter-spacing: 0.16em;
  }
  .main-box {
    margin: 0px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    margin: 36px 64px;
    gap: 40px;
    width: 640px;
    @media (max-width: 768px) {
      width: 100%;
      max-width: 640px;
    }
    .hint-box {
      display: flex;
      p {
        align-self: center;
        margin: 0 0 0 16px;
        color: $black-900;
        letter-spacing: 0.16em;
        span {
          color: $primary;
        }
      }
    }
    :deep(.btn-secondary) {
      white-space: nowrap;
      border-radius: 24px;
      padding: 8px 16px;
    }
    :deep(.btn-md){
    width: 196px;
    height: 40px;
    }
    .textarea-box {
      p {
        margin: 16px 0;
        color: $black-900;
      }
      textarea {
        outline: none;
        background: none;
        resize: none;
        color: $black-900;
        width: 100%;
        height: 200px;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid $black-500;
        transition: none;
        &:focus {
          border: 1px solid $primary;
        }
      }
    }
    .button-box {
      display: flex;
      justify-content: space-between;
      p {
        color: $primary;
        align-self: center;
        cursor: pointer;
        span {
          border-bottom: 1px solid $primary;
        }
      }
    }
  }

.textarea-view-only {
  background-color: $black-300 !important; /* 灰色背景 */
  color: $black-900 ;
  pointer-events: none; 
}

.span-view-only {
  pointer-events: none;
  color: $black-500 !important;
  span {
    border-bottom: 1px solid $black-500 !important;
  }
}
</style>
