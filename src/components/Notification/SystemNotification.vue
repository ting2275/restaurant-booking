<script setup>
import { useRouter } from 'vue-router';
import { useFormat } from '@/composables/useFormat';

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const { formatRelativeTime } = useFormat();

// 處理點擊跳轉
const handleClick = () => {
  if (props.notification.routeName) {
    router.push({ name: props.notification.routeName });
  }
};
</script>

<template>
  <div
    class='notification-item'
    :class='{ unread: !notification.isRead, clickable: notification.routeName }'
    @click='handleClick'
  >
    <!-- 系統消息圖示 -->
    <div class='notification-icon system'>
      <img src='@/assets/images/icons/system-notification.svg' alt='系統消息'>
    </div>

    <!-- 通知內容 -->
    <div class='notification-content'>
      <div class='notification-text' v-html='notification.content'></div>
      <span class='notification-time'>{{ formatRelativeTime(notification.timestamp) }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/components/popup/_popup-notify.scss' as *;
</style>
