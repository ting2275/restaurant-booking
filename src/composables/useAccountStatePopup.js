import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useUserRole } from '@/composables/useUserRole'

export function useAccountStatePopup() {
  const userStore = useUserStore()
  const { isAdmin, isManager } = useUserRole()

  // 首次彈窗
  const showIsFirstPopup = ref(false)
  onMounted(() => {
    if ((isAdmin.value || isManager.value) && userStore.popUpNotice === 1) {
      showIsFirstPopup.value = true
    }
  })

  // 低單數彈窗
  const showIsLowPopup = ref(false)
  watch(
    () => [userStore.lowPopupData.isLow, userStore.lowPopupData.alertCustomerSolutionStatus],
    ([isLow, alertCustomerSolutionStatus]) => {
      showIsLowPopup.value = isLow === 1 && alertCustomerSolutionStatus === 0
    },
    { immediate: true }
  )

  // 超額單數彈窗
  const showIsExSpendPopup = ref(false)
  watch(
    () => userStore.isExSpendPopupStatus,
    isExSpendPopupStatus => {
      showIsExSpendPopup.value = isExSpendPopupStatus
    },
    { immediate: true }
  )

  return {
    showIsFirstPopup,
    showIsLowPopup,
    showIsExSpendPopup
  }
}
