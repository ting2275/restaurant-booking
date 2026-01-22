import { ref, watch, onUnmounted } from 'vue';
import { createSingletonFactory } from '@/utils/singletonFactory';
import { useErrorHandler } from '@/utils/errorHandler';
import { NOTIFICATION_CONFIG } from './constants/config';

// 彈窗控制管理
function createPopupControl() {
  const { handleError } = useErrorHandler();

  const isNotifyOpen = ref(false);
  const isServiceOpen = ref(false);
  const isNewNotification = ref(false);
  const isClicked = ref(false);
  const isMouseOver = ref(false);

  const fadeOutTimer = ref(null);
  const FADE_OUT_DURATION = NOTIFICATION_CONFIG.FADE_OUT_DURATION;

  // 開啟通知彈窗
  const openNotifyPopup = () => {
    try {
      stopFadeOut();
      isNotifyOpen.value = true;
      isServiceOpen.value = false;
    } catch (error) {
      handleError(error, 'openNotifyPopup');
    }
  };

  // 關閉通知彈窗
  const closeNotifyPopup = () => {
    try {
      stopFadeOut();
      isNotifyOpen.value = false;
      isClicked.value = false;
    } catch (error) {
      handleError(error, 'closeNotifyPopup');
    }
  };

  // 開啟服務彈窗
  const openServicePopup = () => {
    try {
      isServiceOpen.value = true;
      isNotifyOpen.value = false;
    } catch (error) {
      handleError(error, 'openServicePopup');
    }
  };

  // 關閉服務彈窗
  const closeServicePopup = () => {
    try {
      isServiceOpen.value = false;
    } catch (error) {
      handleError(error, 'closeServicePopup');
    }
  };

  // 切換服務彈窗
  const toggleServicePopup = () => {
    try {
      if (isServiceOpen.value) {
        closeServicePopup();
      } else {
        openServicePopup();
      }
    } catch (error) {
      handleError(error, 'toggleServicePopup');
    }
  };

  const setNewNotification = (status) => {
    try {
      isNewNotification.value = status;
      if (status) {
        isClicked.value = false;
      }
    } catch (error) {
      handleError(error, 'setNewNotification');
    }
  };

  const startFadeOut = (duration = FADE_OUT_DURATION) => {
    try {
      stopFadeOut();
      if (!isMouseOver.value && isNotifyOpen.value) {
        fadeOutTimer.value = setTimeout(() => {
          isNewNotification.value = false;
          isNotifyOpen.value = false;
          isClicked.value = false;
        }, duration);
      }
    } catch (error) {
      handleError(error, 'startFadeOut');
    }
  };

  const stopFadeOut = () => {
    try {
      if (fadeOutTimer.value) {
        clearTimeout(fadeOutTimer.value);
        fadeOutTimer.value = null;
      }
    } catch (error) {
      handleError(error, 'stopFadeOut');
    }
  };

  const handleMouseEnter = () => {
    try {
      isMouseOver.value = true;
      stopFadeOut();
    } catch (error) {
      handleError(error, 'handleMouseEnter');
    }
  };

  const handleMouseLeave = (duration = FADE_OUT_DURATION) => {
    try {
      isMouseOver.value = false;
      startFadeOut(duration);
    } catch (error) {
      handleError(error, 'handleMouseLeave');
    }
  };

  const handleNotifyClick = () => {
    try {
      if (isNotifyOpen.value) {
        closeNotifyPopup();
      } else {
        openNotifyPopup();
      }
    } catch (error) {
      handleError(error, 'handleNotifyClick');
    }
  };

  const handleServiceClick = () => {
    try {
      if (isServiceOpen.value) {
        closeServicePopup();
      } else {
        openServicePopup();
      }
    } catch (error) {
      handleError(error, 'handleServiceClick');
    }
  };

  // 監聽通知彈窗狀態變化
  watch(isNotifyOpen, (newVal) => {
    try {
      if (newVal) {
        isNewNotification.value = false;
        isClicked.value = true;
      } else {
        isClicked.value = false;
      }
    } catch (error) {
      handleError(error, 'watch:isNotifyOpen');
    }
  });

  // 監聽新通知狀態變化 (移除 eventBus)
  watch(isNewNotification, () => {});

  // 組件卸載時清理
  onUnmounted(() => {
    try {
      stopFadeOut();
      closeNotifyPopup();
      closeServicePopup();
    } catch (error) {
      handleError(error, 'onUnmounted');
    }
  });

  return {
    isNotifyOpen,
    isServiceOpen,
    isNewNotification,
    isClicked,
    isMouseOver,
    openNotifyPopup,
    closeNotifyPopup,
    openServicePopup,
    closeServicePopup,
    toggleServicePopup,
    setNewNotification,
    handleMouseEnter,
    handleMouseLeave,
    handleNotifyClick,
    handleServiceClick,
    FADE_OUT_DURATION
  };
}

export const usePopupControl = createSingletonFactory(createPopupControl);