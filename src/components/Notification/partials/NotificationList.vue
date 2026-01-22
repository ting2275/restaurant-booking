<script setup>
import { ref, computed, watch } from 'vue';
import { usePollingManager } from '@/composables/notification/usePollingManager';
import NotificationItemManager from '../NotificationManager.vue';

// 通知管理
const {
  bookingNotifications,
  systemNotifications,
  unreadBookingCount,
  unreadSystemCount
} = usePollingManager();

// 當前啟用的 Tab
const activeTab = ref('booking');

// 虛擬滾動相關狀態
const initialLoadSize = ref(7); // 初始加載 7 筆
const isLoading = ref(false); // 是否正在加載
const listContainerRef = ref(null); // 列表容器 ref

// 為每個 Tab 保留已加載的資料狀態
const bookingDisplayCount = ref(7); // booking tab 已加載數量
const systemDisplayCount = ref(7); // system tab 已加載數量
const bookingScrollPosition = ref(0); // booking tab 滾動位置
const systemScrollPosition = ref(0); // system tab 滾動位置

// 所有通知（已排序）
const allNotifications = computed(() => {
  if (activeTab.value === 'booking') {
    return [...bookingNotifications.value]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } else {
    return [...systemNotifications.value]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
});

// 當前 tab 的顯示數量
const currentDisplayCount = computed(() => {
  return activeTab.value === 'booking' ? bookingDisplayCount.value : systemDisplayCount.value;
});

// 當前顯示的通知列表（逐筆加載）
const currentNotifications = computed(() => {
  return allNotifications.value.slice(0, currentDisplayCount.value);
});

// 是否還有更多資料
const hasMore = computed(() => {
  return currentNotifications.value.length < allNotifications.value.length;
});

const loadingText = computed(() => {
  return isLoading.value ? '通知加載中...' : (!hasMore.value && currentNotifications.value.length > 0 ? '沒有更多消息了' : '載入中...');
});

// 切換 Tab
const switchTab = (tab) => {
  // 保存當前 tab 的滾動位置
  if (listContainerRef.value) {
    if (activeTab.value === 'booking') {
      bookingScrollPosition.value = listContainerRef.value.scrollTop;
    } else {
      systemScrollPosition.value = listContainerRef.value.scrollTop;
    }
  }

  // 切換 tab
  activeTab.value = tab;

  // 恢復新 tab 的滾動位置
  if (listContainerRef.value) {
    setTimeout(() => {
      if (activeTab.value === 'booking') {
        listContainerRef.value.scrollTop = bookingScrollPosition.value;
      } else {
        listContainerRef.value.scrollTop = systemScrollPosition.value;
      }
    }, 0);
  }
};

// 加載更多（每次載入 1 筆）
const loadMore = () => {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;
  // 模擬加載延遲，讓使用者看到逐筆載入效果
  setTimeout(() => {
    // 更新對應 tab 的顯示數量
    if (activeTab.value === 'booking') {
      bookingDisplayCount.value += 1;
    } else {
      systemDisplayCount.value += 1;
    }
    isLoading.value = false;
  }, 200); // 200ms 延遲，讓載入效果更明顯
};

// 重置所有已加載的資料（在有新通知或標示已讀後調用）
const resetAllLoadedData = () => {
  bookingDisplayCount.value = initialLoadSize.value;
  systemDisplayCount.value = initialLoadSize.value;
  bookingScrollPosition.value = 0;
  systemScrollPosition.value = 0;
  if (listContainerRef.value) {
    listContainerRef.value.scrollTop = 0;
  }
};

// 監聽滾動事件
const handleScroll = (event) => {
  const container = event.target;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;

  // 計算距離底部的距離
  const distanceToBottom = scrollHeight - scrollTop - clientHeight;

  // 當滾動到底部前 50px 時，觸發加載更多
  if (distanceToBottom < 50 && distanceToBottom >= 0) {
    loadMore();
  }
};

// 監聽通知資料變化（新通知或標示已讀後重置）
watch([bookingNotifications, systemNotifications], ([newBooking, newSystem], [oldBooking, oldSystem]) => {
  // 檢查是否有新通知加入或數量減少（標示已讀）
  const bookingChanged = newBooking?.length !== oldBooking?.length;
  const systemChanged = newSystem?.length !== oldSystem?.length;

  if (bookingChanged || systemChanged) {
    resetAllLoadedData();
  }
}, { deep: true });

// 暴露給父元件使用
defineExpose({
  activeTab,
  switchTab,
  resetAllLoadedData
});
</script>

<template>
  <div class='notification-panel'>
    <!-- Tab 分頁 -->
    <div class='notification-tabs'>
      <button
        class='tab-item'
        :class="{ active: activeTab === 'booking' }"
        @click.stop="switchTab('booking')"
      >
        <span class='tab-text'>訂位消息</span>
        <span v-if='unreadBookingCount > 0' class='badge'></span>
      </button>
      <button
        class='tab-item'
        :class="{ active: activeTab === 'system' }"
        @click.stop="switchTab('system')"
      >
        <span class='tab-text'>系統消息</span>
        <span v-if='unreadSystemCount > 0' class='badge'></span>
      </button>
    </div>

    <!-- 通知列表 -->
    <div
      ref='listContainerRef'
      :class='{ "notification-list-container": allNotifications.length > 0, "empty-state-container": allNotifications.length === 0 }'
      @scroll.passive='handleScroll'
    >
      <div v-if='allNotifications.length === 0' class='empty-state'>
        <div class='empty-image'>
          <img src='@/assets/images/resources/empty-notification.svg' alt='無通知'>
        </div>
        <p class='empty-text'>您沒有任何最新消息</p>
      </div>

      <template v-else>
        <NotificationItemManager
          :notifications='currentNotifications'
        />

        <!-- 加載指示器 -->
        <div class='loading-indicator'>
          <span class='loading-text'>{{ loadingText }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/components/popup/_popup-notify.scss' as *;


.notification-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Tab 分頁
.notification-tabs {
  display: flex;
  border-bottom: 1px solid $black-500;
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 12px 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    .tab-text {
      @extend .caption;
    }

    .badge {
      display: inline-block;
      width: 4px;
      height: 4px;
      background-color: $primary;
      border-radius: 50%;
      transform: translateY(-10px);
    }

    &.active {
      border-bottom-color: $primary;
      .tab-text {
        color: $primary;
        font-weight: $font-weight-bold;
      }
    }

    &:hover:not(.active) {
      .tab-text {
        color: $primary;
      }
    }
  }
}

// 通知列表容器
.notification-list-container {
  flex: 1;
  min-height: 50dvh;
  max-height: 70dvh;
  overflow-y: auto;
  overflow-x: hidden;
  @include custom-scrollbar;
}

.empty-state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  @extend .notification-list-container;
  // 空狀態
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;

    .empty-image {
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 110px;
        filter: grayscale(100%);
      }
    }

    .empty-text {
      @extend .body2;
    }
  }
}

// 加載指示器
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;

  .loading-text {
    @extend .small;
    color: $black-500;
  }
}

// 沒有更多資料提示
.no-more-data {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;

  .no-more-text {
    @extend .small;
    color: $black-500;
  }
}
</style>
