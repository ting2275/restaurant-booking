import { createApp, h, nextTick } from 'vue'
import html2pdf from 'html2pdf.js'
import PdfOrder from '@/components/Pdf/PdfOrder.vue'

export function useOrderDownload() {
  const orderDownload = (contractDetail, customerName) => {
    if (!contractDetail) {
      console.error('無訂單資料')
      return
    }
    console.log('contractDetail:', contractDetail)
    const shopLog = Array.isArray(contractDetail.shopLog) && contractDetail.shopLog.length > 0 ? contractDetail.shopLog[0] : {}
    // 再打印 shopLog
    console.log('shopLog:', shopLog)

    // 訂單狀態
    // const paymentStatusMap = {
    //   0: '待付款',
    //   1: '已付款',
    //   9: '交易失敗'
    // }
    // const paymentStatus = paymentStatusMap[shopLog.status] || ''

    // 計算付款方式
    const payTypeMap = {
      1: '信用卡',
      2: '匯款',
      3: '公司設定'
    }

    // 付款方式（新API暫時沒有，先空著）
    // const selectedPaymentMethod = payTypeMap[contractDetail.payType] || ''

    // 初始化變量
    // let selectedPlanLabel = ''
    // let selectedPlanPrice = ''

    // 如果付款方式是公司設定，直接使用 API 提供的數值
    // if (contractDetail.payType === 3) {
    //   selectedPlanLabel = `通知簡訊${contractDetail.point}則`
    //   selectedPlanPrice = `NT$ ${contractDetail.amount}`
    // } else {
    //   // 計算目前方案
    //   const planMap = {
    //     GMB0500: { label: 500, bonus: 50, price: 'NT$ 1,000' },
    //     GMB1000: { label: 1000, bonus: 150, price: 'NT$ 2,000' },
    //     GMB2500: { label: 2500, bonus: 500, price: 'NT$ 5,000' },
    //     GMB5000: { label: 5000, bonus: 1250, price: 'NT$ 10,000' }
    //   }
    //   const currentPlan = planMap[contractDetail.amountType] || {}
    //   selectedPlanLabel = currentPlan ? `通知簡訊${currentPlan.label}則 (贈送${currentPlan.bonus}則)` : ''
    //   selectedPlanPrice = currentPlan ? currentPlan.price : ''
    // }

    const pdfData = {
      customerName: customerName,
      orderNumber: contractDetail.Id || '', // 訂單編號
      paymentStatus: contractDetail.status || '', // 訂單狀態
      selectedPaymentMethod: payTypeMap[shopLog.status] || '', // 付款方式
      orderDate: shopLog.buyDate || '', // 訂購日期
      selectedPlanLabel: contractDetail.solutionType || '', // 購買方案
      selectedPlanPrice: contractDetail.amount || '', // 方案價格
      expireDate: contractDetail.endDate || '', // 到期日
      beforeTax: contractDetail.amountExclTax || '', // 未稅金額
      tax: contractDetail.tax || '', // 稅額
      showPdfContent: true, // 是否顯示PDF內容
      atmPayNumber: contractDetail.atmAccount || '' // 匯款帳號??
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
        return h(PdfOrder, { pdfData })
      }
    })

    app.mount(pdfContainer)

    nextTick(() => {
      setTimeout(() => {
        const opt = {
          margin: 1,
          filename: `${customerName}-訂購單.pdf`,
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

  return { orderDownload }
}
