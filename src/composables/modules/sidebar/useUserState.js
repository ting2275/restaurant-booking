import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'

export function useSelectedCompany() {
  const userStore = useUserStore()
  const ownerCompanies = ref(userStore.ownerCompanies)
  const selectedCompany = ref(userStore.storeId)
  const maintainOwnerCompany = ref(userStore.maintainOwnerCompany)
  const maintainOwnerCompanyOptions = computed(() => (maintainOwnerCompany.value ? [maintainOwnerCompany.value] : []))

  const currentStoreId = computed(() => userStore.storeId)

  watch(currentStoreId, newStoreId => {
    selectedCompany.value = newStoreId
  })

  watch(
    () => maintainOwnerCompany.value,
    () => {
      if (maintainOwnerCompany.value) {
        selectedCompany.value = maintainOwnerCompany.value.oid
      }
    }
  )

  return {
    ownerCompanies,
    selectedCompany,
    maintainOwnerCompanyOptions,
    currentStoreId
  }
}
