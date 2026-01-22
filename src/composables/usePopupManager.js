import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

/**
 * 彈窗管理器 - 統一管理多個彈窗的開關和點擊外部關閉邏輯
 */
export function usePopupManager() {
  // 存儲所有註冊的彈窗
  const popups = ref(new Map());

  const registerPopup = (id, { popupRef, triggerRef, onClose }) => {
    const isOpen = ref(false);

    const open = () => {
      // 先關閉其他所有彈窗（互斥邏輯）
      popups.value.forEach((popup, popupId) => {
        if (popupId !== id && popup.isOpen.value) {
          popup.close();
        }
      });
      isOpen.value = true;
    };

    const close = () => {
      isOpen.value = false;
      onClose?.();
    };

    const toggle = () => {
      if (isOpen.value) {
        close();
      } else {
        open();
      }
    };

    // 設置點擊外部關閉
    if (popupRef && triggerRef) {
      onClickOutside(
        () => popupRef.value?.popupElementRef,
        close,
        {
          ignore: [triggerRef]
        }
      );
    }

    popups.value.set(id, {
      isOpen,
      open,
      close,
      toggle,
      popupRef,
      triggerRef
    });

    return {
      isOpen,
      open,
      close,
      toggle
    };
  };

  /**
   * 獲取彈窗控制器
   * @param {string} id - 彈窗識別碼
   */
  const getPopup = (id) => {
    return popups.value.get(id);
  };

  /**
   * 關閉所有彈窗
   */
  const closeAll = () => {
    popups.value.forEach(popup => {
      popup.close();
    });
  };

  /**
   * 註銷彈窗
   * @param {string} id - 彈窗識別碼
   */
  const unregisterPopup = (id) => {
    popups.value.delete(id);
  };

  return {
    registerPopup,
    getPopup,
    closeAll,
    unregisterPopup
  };
}
