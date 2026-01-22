<template>
  <div class='main-box'>
    <h1>Button 按鈕指南</h1>
    <br><br>
  
    <h2>
      BaseButton 基本按鈕
      <p>基本款。可以直接使用。</p>
    </h2>
  
    <div class='button-components-box'>
      <BaseButton variant='check' size='sm'>check</BaseButton>
      <br>
      <BaseButton variant='cancel' size='sm'>cancel</BaseButton>
      <br>
      <BaseButton variant='disabled' size='sm'>disabled</BaseButton>
      <br>
      <BaseButton variant='primary-variant' size='sm'>primary-variant</BaseButton>
      <br>
      <BaseButton variant='secondary' size='sm'>secondary</BaseButton>
    </div>
  
    <br><br><br>
  
    <h2>
      Add Button 加減按鈕
      <p>須加上@click事件handlePlusClick, handleMinusClick</p>
    </h2>
  
    <div class='add-button-components-box'>
      <AddReservationButton variant='plus' @click='handlePlusClick'></AddReservationButton>
      <AddReservationButton variant='minus' @click='handleMinusClick'></AddReservationButton>
      <div class='quantity-box'>數量: {{ quantity }}</div>
    </div>
  
    <br><br><br>
  
    <h2>
      BorderTab 底線型分頁按鈕
      <p>tab的名稱跟內容需要在js中設定(內容僅供參考請勿儲存)</p>
    </h2>
  
    <br>
  
    <BorderTab
      :tabs='filteredBorderTabs'
      :tab-content='borderTabContent'
      :current-tab='borderActiveTabIndex'
      @tab-change='handleBorderTabChange'
    ></BorderTab>
  
    <br><br>
  
    <h2>
      FillTab 填滿型分頁按鈕
      <p>tab的名稱跟內容需要在js中設定(內容僅供參考請勿儲存)</p>
    </h2>
  
    <br>
  
    <FillTab
      :tabs='filteredTabs'
      :tab-content='filteredTabContent'
      :current-tab='activeTabIndex'
      @tab-change='handleTabChange'
    >
    </FillTab>

    <section>
      <h2>
        組件導入教學
        <p>在別的組件中引用時的注意事項</p>
      </h2>
    
      <ul style='background-color: antiquewhite;'>
        <li>
          <h4>
            導入BaseButton:
            <p>variant狀態:check, cancel, disabled, primary-variant, secondary</p>
            <p>size尺寸:sm, md, lg</p>
          </h4>
        
          <pre>
          <h5>template</h5>
          <code>
&lt;BaseButton variant='check' size='sm'&gt;check&lt;/BaseButton&gt;
          </code>
        </pre>
        </li>
      
        <li>
          <h4>導入AddReservationButton:</h4>
        
          <pre>
          <h5>template</h5>
          <code>
&lt;AddReservationButton
  variant='plus'
  @click='handlePlusClick'
&gt;
&lt;/AddReservationButton&gt;

&lt;AddReservationButton
  variant='minus'
  @click='handleMinusClick'
&gt;
&lt;/AddReservationButton&gt;

數量計算(僅供參考測試)
&lt;div class='quantity-box'&gt;
  數量: &#123;&#123; quantity &#125;&#125;
&lt;/div&gt;
          </code>
        </pre>
        
          <pre>
          <h5>script</h5>
          <code>
// 加減按鈕功能
const quantity = ref(0);

const handlePlusClick = () => {
  quantity.value += 1;
  console.log('Plus button clicked');
};

const handleMinusClick = () => {
  if (quantity.value > 0) {
    quantity.value -= 1;
  }
  console.log('Minus button clicked');
};
          </code>
        </pre>
        </li>

        <li>
          <h4>導入BorderTab:
            <p>
              引入外部檔案記得import
            </p>
          </h4>
        
          <pre>
          <h5>template <span style='font-size: 14px;'>(*標籤裡的命名請沿用下方範例.*可選用功能:isChangeEvent:判斷編輯狀態是否要切換Tab) </span></h5>
          <code>
&lt;BorderTab
  :tabs='filteredTabs'
  :tab-content='filteredTabContent'
  :current-tab='activeTabIndex'
  :is-change-event='isChangeEvent'
  @tab-change='handleTabChange'
&gt;&lt;/BorderTab&gt;
          </code>
        </pre>
        
          <pre>
          <h5>script</h5>
          <code>
// Tab的vue頁面
import AvailableTime from "./AvailableTime.vue";
import CloseTime from "./CloseTime.vue";
import OpenTime from "./OpenTime.vue";
import Tables from "./Tables.vue";
import Policy from "./Policy.vue";

// Tab分頁狀態管理composable
import { useTabManager } from "@/composables/useTabManager";

// 定義 Tabs 畫面名稱
const borderTabs = [
  { label: "桌型設定", component: Tables },
  { label: "時間管理", component: OpenTime },
  { label: "可預訂時段", component: AvailableTime },
  { label: "特別公休日期", component: CloseTime },
  { label: "預訂政策", component: Policy },
];

// 切換Tab的判斷編輯狀態功能
const isChangeEvent = computed(() => {
  return isEditing.value;
});

// Tab Content 內容mapping
const filteredTabContent = computed(() => {
  return filteredTabs.value.map(tab => tab.component)
});

// 使用 Tab 分頁狀態管理composable
const { activeTabIndex, changeTab, filteredTabs } = useTabManager(borderTabs);

// 切換Tab的判斷功能
const handleTabChange = (index) => {
  if (systemStore.systemIsEditing) {
    changeTabPopup.value = true;
    pendingIndex = index;
  }
};

// 彈窗取消
const cancelTabLeave = () => {
  changeTabPopup.value = false;
};

// 彈窗確認
const confirmTabLeave = async () => {
  changeTabPopup.value = false;
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
  activeTabIndex.value = pendingIndex
  await changeTab(pendingIndex);
}
          </code>
        </pre>
        </li>

        <li>
          <h4>導入FillTab:
            <p>
              引入外部檔案記得import
            </p>
          </h4>
        
          <pre>
          <h5>template<span style='font-size: 14px;'>(*標籤裡的命名請沿用下方範例.)</span></h5>
          <code>
&lt;FillTab
  :tabs='filteredTabs'
  :tab-content='filteredTabContent'
  :current-tab='activeTabIndex'
  @tab-change='handleTabChange'
&gt;&lt;/FillTab&gt;
          </code>
        </pre>
        
          <pre>
          <h5>script</h5>
          <code>
// 引入Tab的vue頁面
import TransactionHistory from "./TransactionHistory.vue";
import InvoiceInfo from "./InvoiceInfo.vue";

// Tab分頁狀態管理composable
import { useTabManager } from '@/composables/useTabManager';

// 定義 Tabs 畫面名稱
const fillTabs = [
  { label: "交易紀錄", component: TransactionHistory },
  { label: "電子發票資訊", component: InvoiceInfo },
];

// 切換Tabs功能
const filteredTabContent = computed(() => {
  return filteredTabs.value.map(tab => tab.component)
});

// 使用 Tab 分頁狀態管理composable
const { activeTabIndex, changeTab, filteredTabs } = useTabManager(fillTabs);

const handleTabChange = (index) => {
  changeTab(index);
};
          </code>
        </pre>
        </li>
      </ul>
    </section>
  </div>
</template>
      
<script setup>
import { ref,onMounted,onBeforeUnmount,computed  } from "vue";
// import BaseButton from '@/components/Buttons/BaseButton.vue';
import AddReservationButton from '@/components/Buttons/AddReservationButton.vue';
import BorderTab from '@/components/Buttons/BorderTab.vue';
import FillTab from '@/components/Buttons/FillTab.vue';

// Tabs所要切換的分頁
import AvailableTime from "@businessSettings/AvailableTime/index.vue";
import CloseTime from "@businessSettings/CloseTime.vue";
import OpenTime from "@businessSettings/OpenTime.vue";
import Tables from "@businessSettings/Tables.vue";
import Policy from "@businessSettings/Policy.vue";

// import TransactionHistory from "@/views/BillingArea/TransactionHistory.vue";
import Contracts from "@/views/AccountSettings/Contracts.vue";
import InvoiceInfo from "@/views/BillingArea/InvoiceInfo.vue";

import { useTabManager } from '@/composables/useTabManager';

import { useTitle } from '@vueuse/core';

const title = useTitle();
title.value = 'Button 按鈕指南';

onMounted(() => {
  title.value = 'Button 按鈕指南';
});

onBeforeUnmount(() => {
  title.value = '123';
});

// 加減按鈕功能
const quantity = ref(0);
const handlePlusClick = () => {
 quantity.value += 1;
 console.log('Plus button clicked');
};

const handleMinusClick = () => {
 if (quantity.value > 0) {
   quantity.value -= 1;
 }
 console.log('Minus button clicked');
};

// borderTab的頁碼功能
const borderTabs = [
  { label: 'borderTab-A', component: Tables },
  { label: 'borderTab-B', component: OpenTime },
  { label: 'borderTab-C', component: AvailableTime },
  { label: 'borderTab-D', component: CloseTime },
  { label: 'borderTab-E', component: Policy }
];

const {
  activeTabIndex: borderActiveTabIndex,
  changeTab: changeBorderTab,
  filteredTabs: filteredBorderTabs
} = useTabManager(borderTabs);

const borderTabContent = computed(() => {
  return filteredBorderTabs.value.map(tab => tab.component);
});

const handleBorderTabChange = (index) => {
  changeBorderTab(index);
};

// FillTab的頁碼功能
const fillTabs = [
  { label: "FillTab-A", component: Contracts },
  { label: "FillTab-B", component: InvoiceInfo },
];

const filteredTabContent = computed(() => {
  return filteredTabs.value.map(tab => tab.component)
});

const { activeTabIndex, changeTab, filteredTabs } = useTabManager(fillTabs);

const handleTabChange = (index) => {
  changeTab(index);
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

.button-components-box {
  display: block;
  width: 100%;
  margin: 0;
}

.add-button-components-box {
  display: flex;
  justify-content: start;
  gap: 20px;
  margin: 0;
  background-color: #c1c1c1;
  padding: 20px;
  width: auto;
  .quantity-box {
    display: flex;
    align-items: center;
    width: 100%;
  }
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
      