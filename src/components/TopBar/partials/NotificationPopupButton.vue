<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue';
import NotificationPopUp from '@/components/Notification/NotificationPopUp.vue';
import NotificationList from '@/components/Notification/partials/NotificationList.vue';
import { usePollingManager } from '@/composables/notification';

defineProps({
  icon: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['mark-as-read-click']);

const popupManager = inject('popupManager');

// 使用通知管理器
const {
  closeNotifyPopup,
  isNotifyOpen,
  unreadBookingCount,
  unreadSystemCount,
  isMarkingAsRead
} = usePollingManager();

const buttonRef = ref(null);
const popupRef = ref(null);
const notificationListRef = ref(null);
let popupControl = null;

onMounted(() => {
  if (popupManager) {
    popupControl = popupManager.registerPopup('notification', {
      popupRef: popupRef,
      triggerRef: buttonRef,
      onClose: closeNotifyPopup
    });

    // 同步 popupControl 的 isOpen 到 isNotifyOpen
    watch(() => popupControl.isOpen.value, (newValue) => {
      isNotifyOpen.value = newValue;
    });

    // 同步 isNotifyOpen 到 popupControl
    watch(isNotifyOpen, (newValue) => {
      if (popupControl.isOpen.value !== newValue) {
        popupControl.isOpen.value = newValue;
      }
    });
  }
});

// 切換彈窗
const toggle = () => {
  popupControl?.toggle();
};

// 當前分頁是否有未讀通知
const hasUnread = computed(() => {
  if (!notificationListRef.value) return false;

  const currentTab = notificationListRef.value.activeTab;
  if (currentTab === 'booking') {
    return unreadBookingCount.value > 0;
  } else {
    return unreadSystemCount.value > 0;
  }
});

// 點擊「標示為已讀」按鈕
const handleMarkAsReadClick = () => {
  if (!hasUnread.value) return;
  emit('mark-as-read-click', notificationListRef.value?.activeTab);
};

// 暴露給父組件使用
defineExpose({
  buttonRef,
  popupRef,
  notificationListRef,
  isOpen: isNotifyOpen,
  toggle
});
</script>

<template>
  <div class='notification-popup-wrapper'>
    <button ref='buttonRef' class='notify-button' @click='toggle'>
      <img :src='icon' alt='最新消息' />
    </button>

    <!-- 通知列表彈窗 -->
    <NotificationPopUp
      ref='popupRef'
      v-model='isNotifyOpen'
      type='notification'
      :duration='5000'
      @click.stop
    >
      <template #title>
        <div class='notification-popup-header'>
          <span>最新消息</span>
          <button
            class='mark-all-read-btn'
            :class='{ disabled: !hasUnread || isMarkingAsRead }'
            :disabled='!hasUnread || isMarkingAsRead'
            @click.stop='handleMarkAsReadClick'
          >
            {{ isMarkingAsRead ? '標示中...' : '標示為已讀' }}
          </button>
        </div>
      </template>
      <template #content>
        <NotificationList ref='notificationListRef' />
      </template>
    </NotificationPopUp>
  </div>
</template>

<style lang="scss" scoped>
.notification-popup-wrapper {
  display: contents;
}

// 通知彈窗標題區域（包含「標示為已讀」按鈕）
.notification-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0;
}

// 標示為已讀按鈕
.mark-all-read-btn {
  @extend .caption;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  &:hover:not(.disabled) {
    color: $primary;
  }

  &.disabled {
    color: $black-500;
    cursor: not-allowed;
  }
}
</style>
