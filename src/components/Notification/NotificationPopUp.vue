<script setup>
import { watch, ref, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  duration: {
    type: Number,
    default: 5000
  },
  type: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue', 'click']);
const closePopup = () => {
  emit('update:modelValue', false);
}

const fadeOut = ref(null);
const isInteracting = ref(false);
const touchEndTimer = ref(null);

const startFadeOut = () => {
  stopFadeOut();

  // 只有在使用者沒有互動時才啟動關閉計時器
  if (!isInteracting.value) {
    fadeOut.value = setTimeout(() => {
      closePopup();
    }, props.duration);
  }
}

const stopFadeOut = () => {
  if (fadeOut.value) {
    clearTimeout(fadeOut.value);
    fadeOut.value = null;
  }
}

watch(()=>props.modelValue, (newValue) => {
  if(newValue === true) {
    isInteracting.value = false;
    startFadeOut(); // 彈窗打開時啟動自動關閉計時器
  } else {
    stopFadeOut();
    isInteracting.value = false;
  }
});

// 滑鼠事件處理（桌機）
const handleMouseEnter = () => {
  isInteracting.value = true;
  stopFadeOut();
}

const handleMouseLeave = (event) => {
  const popupElement = event.currentTarget;
  const relatedTarget = event.relatedTarget;

  // 如果滑鼠移動到 popup 外部（不是子元素）
  if (!popupElement.contains(relatedTarget)) {
    isInteracting.value = false;
    startFadeOut();
  }
}

// 觸控事件處理（平板/手機）
const handleTouchStart = () => {
  isInteracting.value = true;
  stopFadeOut();

  // 清除之前的 touchEnd 計時器
  if (touchEndTimer.value) {
    clearTimeout(touchEndTimer.value);
    touchEndTimer.value = null;
  }
}

const handleTouchEnd = () => {
  // touchend 會在點擊完立即觸發，所以需要延遲處理（避免點擊 tab 時立即關閉）
  if (touchEndTimer.value) {
    clearTimeout(touchEndTimer.value);
  }

  touchEndTimer.value = setTimeout(() => {
    isInteracting.value = false;
    startFadeOut();
  }, 300);
}

// 處理 popup 內部的互動（點擊、滾動等）
const handleInteraction = () => {
  isInteracting.value = true;
  stopFadeOut();

  // 取消 touchEnd 的延遲計時器
  // 這樣點擊 tab 時，即使 touchEnd 觸發了延遲計時器，click 事件也會立即取消它
  if (touchEndTimer.value) {
    clearTimeout(touchEndTimer.value);
    touchEndTimer.value = null;
  }
}

// 清理計時器
onUnmounted(() => {
  stopFadeOut();
  if (touchEndTimer.value) {
    clearTimeout(touchEndTimer.value);
  }
});

// 暴露內部 ref 給父元件使用 onClickOutside
const popupElementRef = ref(null);
defineExpose({
  popupElementRef
});
</script>

<template>
  <teleport to='body'>
    <transition name='pop-up'>
      <div
        v-show='modelValue'
        ref='popupElementRef'
        class='pop-up'
        :class='type'
        role='alert'
        aria-live='polite'
        aria-atomic='true'
        @mouseenter.passive='handleMouseEnter'
        @mouseleave.passive='handleMouseLeave'
        @touchstart.passive='handleTouchStart'
        @touchend.passive='handleTouchEnd'
        @click.passive='handleInteraction'
        @scroll.passive='handleInteraction'
      >
        <div class='pop-up-card'>
          <div class='pop-up-title'>
            <slot name='title'>{{ type === 'service' ? '客服資訊' : '最新消息' }}</slot>
          </div>
          <div class='pop-up-content' :class='{ "notification-content": type === "notification" }'>
            <slot name='content'>內容位置</slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/components/popup/_popup-notify.scss' as *;
</style>
