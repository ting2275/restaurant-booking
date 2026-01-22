<script setup>
import { ref, onMounted, inject, watch } from 'vue';
import NotificationPopUp from '@/components/Notification/NotificationPopUp.vue';

defineProps({
  icon: {
    type: String,
    required: true
  }
});

const popupManager = inject('popupManager');

const buttonRef = ref(null);
const popupRef = ref(null);
const isOpen = ref(false);
let popupControl = null;

onMounted(() => {
  if (popupManager) {
    popupControl = popupManager.registerPopup('service', {
      popupRef: popupRef,
      triggerRef: buttonRef,
      onClose: () => {}
    });

    // 同步 popupControl 的 isOpen 到本地 isOpen
    watch(() => popupControl.isOpen.value, (newValue) => {
      isOpen.value = newValue;
    });

    // 同步本地 isOpen 到 popupControl
    watch(isOpen, (newValue) => {
      if (popupControl.isOpen.value !== newValue) {
        popupControl.isOpen.value = newValue;
      }
    });
  }
});

const toggle = () => {
  popupControl?.toggle();
};

// 暴露給父組件使用
defineExpose({
  buttonRef,
  popupRef,
  isOpen,
  toggle
});
</script>

<template>
  <div class='service-popup-wrapper'>
    <button ref='buttonRef' class='notify-button' @click='toggle'>
      <img :src='icon' alt='客服資訊' />
    </button>

    <NotificationPopUp
      ref='popupRef'
      v-model='isOpen'
      type='service'
      :duration='5000'
      @click.stop
    >
      <template #title>客服資訊</template>
      <template #content>
        <div class='context'>
          <div class='service-info'>
            <span>電話客服時間：</span>
            <span>星期一~星期五 10:00~17:00</span>
            <div>
              <img src='@/assets/images/icons/phone.svg' alt='電話' />
              <span>0800-278-988</span>
            </div>
            <div>
              <img src='@/assets/images/icons/mail.svg' alt='信箱' />
              <span>tda.gmb@taipeiads.com</span>
            </div>
          </div>
        </div>
      </template>
    </NotificationPopUp>
  </div>
</template>

<style lang="scss" scoped>
.service-popup-wrapper {
  display: contents;
}
</style>
