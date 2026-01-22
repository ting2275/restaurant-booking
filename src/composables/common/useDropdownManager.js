import { ref } from 'vue'

const openedDropdownId = ref(null)

export const useDropdownManager = () => {
  const isOpened = id => openedDropdownId.value === id
  const open = id => { openedDropdownId.value = id }
  const close = () => { openedDropdownId.value = null }

  return {
    openedDropdownId,
    isOpened,
    open,
    close
  }
}