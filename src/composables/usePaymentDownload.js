import { createApp, h, nextTick } from 'vue'
import html2pdf from 'html2pdf.js'
import PdfPayment from '@/components/Pdf/PdfPayment.vue'; // 繳費單

export function usePaymentDownload() {
  const paymentDownload = (contractDetail, customerName, id, payType, contractInfo, contractType) => {
    if (!contractDetail) {
      console.error('無訂單資料')
      return
    }
    const shopLog = Array.isArray(contractDetail.shopLog) && contractDetail.shopLog.length > 0 ? contractDetail.shopLog[0] : {}

    const pdfData = {
      customerName: customerName,
      orderNumber: id || '--', // 訂單編號
      paymentStatus: contractDetail.status || '--', // 訂單狀態
      // selectedPaymentMethod: payType || '--', // 付款方式
      orderDate: shopLog.buyDate || '--', // 訂購日期
      selectedPlanLabel: contractDetail.solutionType || '--', // 購買方案
      selectedPlanPrice: contractDetail.amount || '--', // 方案價格
      lastPayDate: contractDetail.lastPayDate || '--', // 付款期限
      beforeTax: contractDetail.amountExclTax || '--', // 未稅金額
      tax: contractDetail.tax || '--', // 稅額
      showPdfContent: true, // 是否顯示PDF內容
      atmPayNumber: contractDetail.atmAccount || '', // 匯款帳號??
      payType: payType || '--',
      contractInfo: contractInfo || '--',
      exSpending: contractDetail.exSpending || '--',
      unitCost: contractDetail.unitCost || '--',
      contractType: contractType || '--',
      startDate: contractDetail.startDate || '--',
      endDate: contractDetail.endDate || '--',
      payLink: contractDetail.payLink || ''
    }

    // 創建PDF父容器
    const wrapperContainer = document.createElement('div')
    wrapperContainer.style.cssText = 'position: absolute; top: -10000px; left: -10000px; width: 100vw; height: auto; overflow: hidden;'
    document.body.appendChild(wrapperContainer)

    // 在父容器内創建 PDF渲染容器
    const pdfContainer = document.createElement('div')
    wrapperContainer.appendChild(pdfContainer)

    const app = createApp({
      render() {
        return h(PdfPayment, { pdfData }) // 繳費單
      }
    })

    app.mount(pdfContainer)

    nextTick(() => {
      setTimeout(() => {
        const opt = {
          margin: 1,
          filename: `${customerName}-繳費單.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }

        html2pdf()
          .from(pdfContainer)
          .set(opt)
          .save()
          .then(() => {
            app.unmount()
            document.body.removeChild(wrapperContainer)
          })
      }, 100)
    })
  }

  return { paymentDownload }
}
