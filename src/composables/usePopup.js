import { reactive } from 'vue'

export function usePopup() {
  const basePopup = reactive({
    show: false,
    title: '',
    content: '',
    buttonText: '我知道了',
    onConfirm: null
  })

  const doubleCheckPopup = reactive({
    show: false,
    title: '',
    content: '',
    confirmText: '是',
    cancelText: '否',
    onConfirm: null,
    onCancel: null
  })

  function showBasePopup({ title, content, buttonText = '我知道了', onConfirm = null }) {
    basePopup.show = true
    basePopup.title = title
    basePopup.content = content
    basePopup.buttonText = buttonText
    basePopup.onConfirm = onConfirm
  }

  function showDoubleCheckPopup({ title, content, confirmText = '是', cancelText = '否', onConfirm = null, onCancel = null }) {
    doubleCheckPopup.show = true
    doubleCheckPopup.title = title
    doubleCheckPopup.content = content
    doubleCheckPopup.confirmText = confirmText
    doubleCheckPopup.cancelText = cancelText
    doubleCheckPopup.onConfirm = onConfirm
    doubleCheckPopup.onCancel = onCancel
  }

  function handleBasePopupConfirm() {
    if (typeof basePopup.onConfirm === 'function') basePopup.onConfirm()
    basePopup.show = false
  }

  function handleDoubleCheckConfirm() {
    if (typeof doubleCheckPopup.onConfirm === 'function') doubleCheckPopup.onConfirm()
    doubleCheckPopup.show = false
  }

  function handleDoubleCheckCancel() {
    if (typeof doubleCheckPopup.onCancel === 'function') doubleCheckPopup.onCancel()
    doubleCheckPopup.show = false
  }

  return {
    basePopup,
    doubleCheckPopup,
    showBasePopup,
    showDoubleCheckPopup,
    handleBasePopupConfirm,
    handleDoubleCheckConfirm,
    handleDoubleCheckCancel
  }
}
