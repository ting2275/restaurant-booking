<script setup>
import { ref, computed, watchEffect, provide } from 'vue';
import { useRoute } from 'vue-router';
import { usePollingManager } from '@/composables/notification';
import { usePopupManager } from '@/composables/usePopupManager';
import ServicePopupButton from './partials/ServicePopupButton.vue';
import NotificationPopupButton from './partials/NotificationPopupButton.vue';
import MarkAsReadPopUp from '@/components/Notification/partials/MarkAsReadPopUp.vue';
import { useNotificationIcons } from '@/composables/notification/useNotificationIcons';

const route = useRoute();
const pageTitle = ref(route.meta.pageTitle || 'Restaurant Booking System');

watchEffect(() => {
  pageTitle.value = route.meta.pageTitle || 'Restaurant Booking System';
});

const emit = defineEmits(['toggle-sidebar']);
const handleClick = () => {
  emit('toggle-sidebar');
};

// 使用通知管理器
const {
  unreadBookingCount,
  unreadSystemCount,
  isNotifyOpen,
  markCategoryAllAsRead,
  closeNotifyPopup
} = usePollingManager();

// 計算是否有未讀通知
const hasUnreadNotifications = computed(() => {
  return unreadBookingCount.value > 0 || unreadSystemCount.value > 0;
});

// 使用彈窗管理器並提供給子組件
const popupManager = usePopupManager();
provide('popupManager', popupManager);

// Refs
const servicePopupButtonRef = ref(null);
const notificationPopupButtonRef = ref(null);

// 「標示為已讀」功能
const showConfirmDialog = ref(false);

// 處理「標示為已讀」點擊
const handleMarkAsReadClick = (currentTab) => {
  closeNotifyPopup();
  showConfirmDialog.value = true;
  // 暫存當前分頁，供確認時使用
  pendingMarkAsReadTab.value = currentTab;
};

const pendingMarkAsReadTab = ref(null);

// 確認標示為已讀
const confirmMarkAsRead = async () => {
  if (!pendingMarkAsReadTab.value) return;

  const result = await markCategoryAllAsRead(pendingMarkAsReadTab.value);

  // 關閉確認彈窗
  showConfirmDialog.value = false;
  pendingMarkAsReadTab.value = null;

  // 這裡可以加上成功/失敗的提示訊息
  if (result.success) {
    console.log(result.message);
  } else {
    console.error(result.message);
  }
};

// 取消標示為已讀
const cancelMarkAsRead = () => {
  pendingMarkAsReadTab.value = null;
};

const { getServiceIcon, getNotifyIcon } = useNotificationIcons();

const serviceIcon = computed(() => {
  return getServiceIcon(servicePopupButtonRef.value?.isOpen.value);
});

const notifyIcon = computed(() => {
  return getNotifyIcon(hasUnreadNotifications.value, isNotifyOpen.value);
});
</script>

<template>
  <header>
    <div class='header-menu'>
      <button class='toggle-button' @click='handleClick'>
        <img src='@/assets/images/icons/hamburgar.svg' alt='開啟選單' />
      </button>
      <h1>{{ pageTitle }}</h1>
    </div>
    <div class='header-notify'>
      <ServicePopupButton ref='servicePopupButtonRef' :icon='serviceIcon' />

      <NotificationPopupButton
        ref='notificationPopupButtonRef'
        :icon='notifyIcon'
        @mark-as-read-click='handleMarkAsReadClick'
      />

      <!-- 確認彈窗 -->
      <MarkAsReadPopUp
        v-model='showConfirmDialog'
        @confirm='confirmMarkAsRead'
        @cancel='cancelMarkAsRead'
      />
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/components/popup/_popup-notify.scss' as *;
</style>