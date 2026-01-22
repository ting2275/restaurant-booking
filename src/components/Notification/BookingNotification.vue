<script setup>
import { useFormat } from '@/composables/useFormat';

defineProps({
  notification: {
    type: Object,
    required: true
  }
});

const { formatRelativeTime } = useFormat();
</script>

<template>
  <div
    class='notification-item'
    :class='{ unread: !notification.isRead }'
  >
    <div class='notification-icon'>
      <img
        v-if="notification.sendStatus === 'New'"
        src='@/assets/images/icons/menu.svg'
        alt='新增預訂'
      >
      <img
        v-else-if="notification.sendStatus === 'Modify'"
        src='@/assets/images/icons/edit.svg'
        alt='修改預訂'
      >
      <img
        v-else-if="notification.sendStatus === 'Save'"
        src='@/assets/images/icons/tableware.svg'
        alt='保留預訂'
      >
      <img
        v-else-if="notification.sendStatus === 'Cancel'"
        src='@/assets/images/icons/trash-can.svg'
        alt='取消預訂'
      >
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
