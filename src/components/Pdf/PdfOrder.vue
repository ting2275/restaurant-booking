<template>
  <div v-show='pdfData.showPdfContent' id='pdf-order' class='pdf-content'>
    <div class='title-box'>
      <p>Restaurant Booking System 數位版訂購單</p>
    </div>

    <div class='content-box'>
      <div>
        <ul>
          <li>{{ pdfData.customerName }} 顧客您好，您的訂單 <span class='orange'>{{ pdfData.orderNumber }}</span> 已成立。</li>
          <li>訂單狀態：{{ pdfData.paymentStatus }}</li>
          <li>付款方式：{{ pdfData.selectedPaymentMethod }}</li>
          <li v-if='pdfData.selectedPaymentMethod === "匯款" && (pdfData.paymentStatus === "待付款")'>
            付款期限：請於 <span class='red'>{{ formatDate(pdfData.expireDate) }}，23：59</span> 前完成付款。
          </li>
          <li v-if='pdfData.selectedPaymentMethod === "匯款" && pdfData.paymentStatus !== "已付款"' class='transfer-info'>
            <p>臨櫃匯款資訊</p>
            <ul class='payment-list'>
              <li>永豐商業銀行代碼：807</li>
              <li>戶名：台北數位廣告股份有限公司</li>
              <li>分行代碼：台北分行 021</li>
              <li>轉帳帳號： {{ pdfData.atmPayNumber }}
                <span v-if='pdfData.paymentStatus === "待付款"'>（僅供本次訂單使用）</span>
                <span v-if='pdfData.paymentStatus === "交易失敗"'>（帳號已失效，請重新下單）</span>
              </li>
              <li>金額： {{ pdfData.selectedPlanPrice }}（<span class='bold'>請勿內扣手續費</span>，金額已含 5% 營業稅）</li>
            </ul>
          </li>
          <li>申購日期：{{ formatDate(pdfData.orderDate) }} </li>
        </ul>
      </div>

      <div>
        <p>訂單內容</p>
        <div class='order-container'>
          <div class='row-type-1'>
            <div class='bg-title'>購買方案</div>
            <div class='bg-title'>價格（含稅）</div>
          </div>
          <div class='row-type-1'>
            <div>{{ pdfData.selectedPlanLabel }}</div>
            <div>{{ pdfData.selectedPlanPrice }}元</div>
          </div>
          <div class='divide-row'></div>
          <div class='row-type-2'>
            <div class='bg-title'>小計（未稅）</div>
            <div>NT$ {{ formatNumber(pdfData.beforeTax) }}</div>
          </div>
          <div class='row-type-2'>
            <div class='bg-title'>營業稅（5%）</div>
            <div>NT$ {{ formatNumber(pdfData.tax) }}</div>
          </div>
          <div class='row-type-2'>
            <div class='bg-title'>總計</div>
            <div>{{ pdfData.selectedPlanPrice }}</div>
          </div>
        </div>
      </div>

      <div>
        <p>※ 注意事項</p>
        <ol type='1'>
          <li>匯款交易使用虛擬帳號，若超過付款期限即失效，請務必留意。</li>
          <li><span class='red'>完成申購後，請於<span class='bold'>五日內完成付款</span>，否則視作交易失敗。</span></li>
          <li>若訂單狀態顯示<span class='bold'>交易失敗，請重新下單</span>，請勿使用已失效的匯款資訊，以免產生財務糾紛。</li>
          <li>完成付款後，您購買的通知簡訊將於<span class='bold'>三個工作天內匯入。</span></li>
          <li><span class='bold'>若有任何問題，請聯繫服務人員。</span></li>
        </ol>
      </div>
    </div>

    <div class='footer-box'>
      <p>【客服資訊】電話客服時間：星期一～星期五 10:00~17:00</p>
      <p>聯絡專線:0800 278 988 聯絡信箱:tda.gmb@taipeiads.com</p>
    </div>

  </div>
</template>

<script setup>
  import { defineProps, defineExpose  } from 'vue';
  import { useFormat } from '@/composables/useFormat';

  const { formatNumber, formatDate } = useFormat();

  const props = defineProps({
    pdfData: {
      type: Object,
      required: true,
    },
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
      .transfer-info {
        margin: 30px 0;
      }
    }

    .order-container {
      border: 1px solid #000;
      .row-type-1, .row-type-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        border-bottom: 1px solid #000;
        &:last-child {
          border-bottom: none;
        }
        >div:nth-child(1) {
          border-right: 1px solid #000;
        }
        div {
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: start;
          padding: 6px;
        }
      }
      .row-type-2 {
        grid-template-columns: 1fr 4fr;
        >div:nth-child(1) {
          justify-content: center;
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