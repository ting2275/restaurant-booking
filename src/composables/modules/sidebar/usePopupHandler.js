import { ref } from 'vue';
import { useSystemStore } from '@/stores/systemStore';

/**
 * 彈窗邏輯整合：管理 popup 顯示、pending 值與 confirm/cancel 行為
 * @param {Function} onConfirm - 確定要執行的 callback
 * @returns popup 控制相關參數與方法
 */

export function usePopupHandler(onConfirm) {
  const systemStore = useSystemStore();
  const showEditingPopup = ref(false);
  const pendingCompanyId = ref(null);

  const triggerPopup = (companyId) => {
    pendingCompanyId.value = companyId;
    showEditingPopup.value = true;
  }

  const confirm = async (emit) => {
    showEditingPopup.value = false;
    systemStore.setSystemIsEditing(false);
    if (onConfirm) {
      await onConfirm(pendingCompanyId.value, emit);
    }
  }

  const cancel = (emit, resetFunction) => {
    showEditingPopup.value = false;
    systemStore.setSystemIsEditing(false);
    if (typeof resetFunction === 'function') resetFunction();
    emit('toggle-sidebar');
  }

  return {
    showEditingPopup,
    pendingCompanyId,
    triggerPopup,
    confirm,
    cancel,
  };
}
