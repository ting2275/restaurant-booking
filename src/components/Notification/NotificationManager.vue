<script setup>
import BookingNotification from './BookingNotification.vue';
import SystemNotification from './SystemNotification.vue';

defineProps({
  notifications: {
    type: Array,
    required: true,
    default: () => []
  }
});

// 根據分類選擇對應的組件
const getComponentForNotification = (notification) => {
  if (notification.category === 'booking') {
    return BookingNotification;
  } else if (notification.category === 'system') {
    return SystemNotification;
  }
  // 預設返回訂位消息組件
  return BookingNotification;
};
</script>

<template>
  <div class='notification-list'>
    <component
      :is='getComponentForNotification(notification)'
      v-for='notification in notifications'
      :key='notification.ID'
      :notification='notification'
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/components/popup/_popup-notify.scss' as *;
</style>
