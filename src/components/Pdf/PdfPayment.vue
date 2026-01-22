<template>
  <div v-show='pdfData.showPdfContent' id='pdf-order' class='pdf-content'>
    <div class='title-box'>
      <p>Restaurant Booking System 訂購繳費單</p>
    </div>
    <div class='content-box'>
      <div>
        <ul>
          <li v-if='pdfData.contractType !== "overBooking"'>{{ pdfData.customerName }} 您好，您的訂單 <span class='orange'>{{ pdfData.orderNumber }}</span> 已成立。</li>
          <li v-if='pdfData.contractType !== "overBooking"'>訂單狀態：{{ pdfData.paymentStatus }}</li>
          <li v-if='pdfData.contractType !== "overBooking"'>付款方式：{{ pdfData.payType }}</li>
          <li v-if='pdfData.contractType !== "overBooking"'>付款期限：請於 <span class='red expire-date'>{{ formatDate(pdfData.lastPayDate) }}</span><span class='red'>23：59</span> 前完成付款。</li>
          <li v-if='pdfData.payType === "匯款" && pdfData.paymentStatus !== "已付款"' class='transfer-info'>
            <p>匯款資訊</p>
            <ul class='payment-list'>
              <li>永豐商業銀行代碼：807</li>
              <li>戶名：台北數位廣告股份有限公司</li>
              <li>分行代碼：台北分行 021</li>
              <li>轉帳帳號： {{ pdfData.atmPayNumber }}
                <span v-if='pdfData.paymentStatus === "待付款"'>（僅供本次訂單使用）</span>
                <span v-if='pdfData.paymentStatus === "交易失敗"'>（帳號已失效，請重新下單）</span>
              </li>
              <li>支付金額： {{ pdfData.selectedPlanPrice }}（<span class='bold'>請勿內扣手續費</span>，金額已含 5% 營業稅）</li>
            </ul>
          </li>
          <li v-if='pdfData.contractType === "overBooking"'>
            <p>{{ pdfData.customerName }} 您好，您上一計費週期(前三個月)所產生超額訂單費用如下表，煩請於14天內繳納。</p>
          </li>
        </ul>
      </div>

      <div>
        <p v-if='pdfData.contractType !== "overBooking"'>訂單內容：</p>
        <p v-if='pdfData.contractType === "overBooking"'>超額訂單內容：</p>
        <div class='order-container'>
          <div class='row-type-1' :class='{ "row-over-booking" : pdfData.contractType === "overBooking" }'>
            <div class='bg-title'>購買方案</div>
            <div v-if='pdfData.contractType !== "overBooking"' class='bg-title'>價格（含稅）</div>
            <div v-if='pdfData.contractType === "overBooking"' class='bg-title'>超額訂單數</div>
            <div v-if='pdfData.contractType === "overBooking"' class='bg-title'>每筆單價</div>
            <div class='bg-title'>服務期間</div>
          </div>
          <div class='row-type-1' :class='{ "row-over-booking height-50" : pdfData.contractType === "overBooking" }'>
            <div>{{ pdfData.contractInfo }}</div>
            <div v-if='pdfData.contractType !== "overBooking"'>{{ pdfData.selectedPlanPrice }}元</div>
            <div v-if='pdfData.contractType === "overBooking"'>{{ pdfData.exSpending }}單</div>
            <div v-if='pdfData.contractType === "overBooking"'>{{ pdfData.unitCost }}元/單</div>
            <div>{{ formatDate(pdfData.startDate) }} – {{ formatDate(pdfData.endDate) }}</div>
          </div>
          <div class='divide-row'></div>
          <div class='row-type-2' :class='{ "row-over-booking" : pdfData.contractType === "overBooking" }'>
            <div class='bg-title'>小計（未稅）</div>
            <div class='align-right'>NT$ {{ formatNumber(pdfData.beforeTax) }} 元</div>
          </div>
          <div class='row-type-2' :class='{ "row-over-booking" : pdfData.contractType === "overBooking" }'>
            <div class='bg-title'>營業稅（5%）</div>
            <div class='align-right'>NT$ {{ formatNumber(pdfData.tax) }} 元</div>
          </div>
          <div class='row-type-2' :class='{ "row-over-booking" : pdfData.contractType === "overBooking" }'>
            <div class='bg-title'>總計</div>
            <div class='align-right'>NT$ {{ formatNumber(pdfData.selectedPlanPrice) }} 元</div>
          </div>
        </div>
        <p class='red'>請確認訂單明細內容與金額無誤後再進行付款！</p>
      </div>

      <!-- 初次/續約/超額 - START -->
      <div>
        <ul>
          <li><a :href='payUrl'>請按這裡前往付款!</a></li>
          <li><span class='bold'>資料驗證後,選擇㇐種付款方式(匯款/信用卡),如有任何問題,請洽客服專員,謝謝!</span></li>
        </ul>
      </div>
      <!-- 初次/續約/超額 - START -->

      <div>
        <ul>
          <li>[台北數位集團-台北/新北/新竹/台中/台南/高雄]</li>
          <li>客服專線：0800-278-988</li>
          <li>客服信箱：<a href='mailto:tda.gmb@taipeiads.com'>tda.gmb@taipeiads.com</a></li>
          <li>總公司地址：115601 台北市南港區三重路19之6號7樓(南港軟體園區C棟)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { useFormat } from '@/composables/useFormat';
  const { formatNumber, formatDate } = useFormat();

  const props = defineProps({
    pdfData: {
      type: Object,
      required: true,
    },
  });

  const basePath = import.meta.env.VITE_APP_ENV === 'production' ? import.meta.env.VITE_BASE_PATH : '';
  import { joinPath } from '@/utils';

  const payUrl = computed(() => {
    let paymentPath = {
      'overBooking': joinPath(basePath, 'payment-verify-over-booking'),
      'contract': joinPath(basePath, 'payment-verify-contract')
    }[props.pdfData.contractType] || '';
    return `${paymentPath}?payLink=${props.pdfData.payLink}`;
  });

  defineExpose({ props });
</script>

<style lang="scss" scoped>
  .pdf-content {
    font-family: "Noto Sans TC", sans-serif;
    color: #000000;
    font-size: 12px;
    font-weight: 400;
    p {
      margin: 0;
      color: #000000;
      margin-bottom: 4px;
      .payment-deadline {
        color: $primary;
      }
    }
    .orange {
      color: $primary;
    }
    .red {
      color: $wrong;
    }
    .bold {
      font-weight: 700;
    }
    a {
      color: #0000ff;
      text-decoration: none;
      border-bottom: 1px solid #0000ff;
    }
    .title-box {
      width: 100%;
      height: 40px;
      background: $primary;
      margin: 0 0 14px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      p {
        font-size: 14px;
        font-weight: 700;
        color: #fff;
      }
    }
    .content-box {
      > div {
        margin-bottom: 30px;
      }
      ul, ol {
        li {
          margin-bottom: 4px;
        }
        &.payment-list {
          li {
            margin-left: 40px;
          }
        }
      }
      ul {
        list-style: none;
      }
      ol {
        list-style-type: decimal !important;
        li {
          margin-left: 36px;
        }
      }
      .expire-date {
        padding-right: 10px;
      }
      .transfer-info {
        margin: 30px 0;
      }
    }
    .order-container, .over-container {
      border: 1px solid #000;
      .row-type-1, .row-type-2 {
        display: grid;
        border-bottom: 1px solid #000;
        &:last-child {
          border-bottom: none;
        }
        div {
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
        }
        >div {
          border-right: 1px solid #000;
        }
        >div:last-child {
          border-right: none;
        }
      }
      .row-type-2 {
        >div:nth-child(2) {
          justify-content: end;
        }
      }
      .divide-row {
        height: 6px;
        background: #000;
      }
      .bg-title {
        background-color: #fef4e9;
      }
    }
    .order-container {
      .row-type-1 {
        grid-template-columns: 2.5fr 1.5fr 6fr;
        &.row-over-booking {
          grid-template-columns: 1fr 0.7fr 0.7fr 1fr;
        }
        &.height-50 {
          div {
            height: 50px;
          }
        }
      }
      .row-type-2 {
        grid-template-columns: 2.5fr 7.5fr;
        &.row-over-booking {
          grid-template-columns: 1fr 2.4fr;
        }
      }
    }
    // .over-container {
    //   .row-type-1 {
    //     grid-template-columns: 1fr 1fr 1fr 1fr;
    //   }
    //   .row-type-2 {
    //     grid-template-columns: 1fr 3fr;
    //   }
    // }
    .footer-box {
      width: 100%;
      height: 60px;
      background: #000;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      p {
        color: #fff;
        margin: 0;
      }
    }
  }
</style>