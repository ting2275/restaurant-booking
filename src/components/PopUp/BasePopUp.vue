<script setup>
import { ref, watch, nextTick } from 'vue';


const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  id: {
    type: String,
    default: ''
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: false
  },
  escButton: {
    type: Boolean,
    default: true
  },
  buttonCount: {
    type: Number,
    default: 1
  },
  popupMode: {
    type: String,
    default: 'titled'
  },
  cardSize: {
    type: String,
    default: 'md'
  },
  teleportTo: {
    type: String,
    default: 'body'
  }
});


const emit = defineEmits(['update:modelValue']);
const closePopup = () => {
  emit('update:modelValue', false);
}
const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    closePopup();
  }
};
const handleEsc = () => {
  closePopup();
};


const popUpRef = ref(null)
const scrollToTop = () => {
  nextTick(() => {
    let popUpContent = popUpRef.value?.getElementsByClassName('pop-up-content')[0]
    setTimeout(() => {
      popUpContent.scrollTo(0, 0)
    }, 100);
  })
}
const scrollToBottom = () => {
  nextTick(() => {
    let popUpContent = popUpRef.value?.getElementsByClassName('pop-up-content')[0]
    popUpContent.scrollTo(0, popUpContent.scrollHeight)
  })
}


defineExpose({
  scrollToTop,
  scrollToBottom
})


watch(() => props.modelValue, (newVal) => {
  if(newVal) scrollToTop()
})
</script>


<template>
  <teleport :to='props.teleportTo'>
    <transition name='pop-up'>
      <div v-show='modelValue' :id='props.id' ref='popUpRef' class='pop-up'>
        <div v-if="popupMode === 'titled'" class='pop-up-card pop-up-card-titled' :class='props.cardSize'>
          <div class='pop-up-title'>
            <slot name='title'>標題位置</slot>
          </div>
          <div class='pop-up-content'>
            <slot name='content'>內文位置</slot>
          </div>
          <div class='pop-up-footer'>
            <div v-if='buttonCount === 1'>
              <slot name='button'>一個按鈕位置</slot>
            </div>
            <div v-else-if='buttonCount === 2' class='buttons-group'>
              <slot name='buttons'>兩個按鈕位置</slot>
            </div>
          </div>
          <button v-if='escButton' class='pop-up-close' @click='handleEsc'>
            <img src='@/assets/images/icons/closed.svg' alt=''>
          </button>
        </div>
        <div v-else-if="popupMode === 'plain'" class='pop-up-card pop-up-card-plain' :class='props.cardSize'>
          <div class='pop-up-title'>
            <slot name='title'>標題位置</slot>
          </div>
          <div class='pop-up-content'>
            <slot name='content'>內文位置</slot>
          </div>
          <div class='pop-up-footer'>
            <div class='buttons-group'>
              <slot name='buttons'>按鈕位置</slot>
            </div>
          </div>
          <button v-if='escButton' class='pop-up-close' @click='handleEsc'>
            <img src='@/assets/images/icons/closed.svg' alt=''>
          </button>
        </div>
        <div v-else-if="popupMode === 'search'" class='pop-up-card pop-up-card-search'>
          <div class='pop-up-title'>
            <slot name='title'>標題位置</slot>
          </div>
          <div class='pop-up-content'>
            <slot name='content'>內文位置</slot>
          </div>
          <button v-if='escButton' class='pop-up-close' @click='handleEsc'>
            <img src='@/assets/images/icons/closed.svg' alt=''>
          </button>
        </div>
        <div v-else-if="popupMode === 'list'" class='pop-up-card pop-up-card-list'>
          <div class='pop-up-title'>
            <slot name='title'>標題位置</slot>
          </div>
          <div class='pop-up-content'>
            <slot name='content'>內文位置</slot>
          </div>
          <button v-if='escButton' class='pop-up-close' @click='handleEsc'>
            <img src='@/assets/images/icons/closed.svg' alt=''>
          </button>
        </div>
        <div class='pop-up-back' @click='handleOverlayClick'></div>
      </div>
    </transition>
  </teleport>
</template>


<style lang="scss" scoped>
.pop-up-enter-active,
.pop-up-leave-active {
  transition: opacity .3s;
}


.pop-up-enter-from,
.pop-up-leave-to {
  opacity: 0;
}


.pop-up-enter-to,
.pop-up-leave-from {
  opacity: 1;
}


.pop-up {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;


  .pop-up-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 1001;


    &.md {
      width: 400px;
      min-height: 320px;
    }


    &.lg {
      width: 560px;
      height: 560px;
    }


    // 共用樣式
    .pop-up-title {
      color: $black-900;
    }


    .pop-up-content {
      overflow-y: auto;
      @include custom-scrollbar;
    }


    .pop-up-footer {
      width: 100%;
      display: flex;
      justify-content: center;


      .buttons-group {
        width: 100%;
        display: flex;
        gap: 24px;
        :deep(button) {
          width: 100%;
        }
        :deep(.btn) {
          width: 100%;
        }
      }
    }
    .pop-up-close {
      position: absolute;
      top: 10px;
      right: 10px;
      cursor: pointer;
      background-color: transparent;
      border: none;
    }


    // 個別樣式
    &-titled {
      .pop-up-title {
        @extend h4;
        margin-top: auto;
        padding-top: 15%;
      }


      .pop-up-footer {
        margin-top: auto;
        margin-bottom: 40px;
      }


      &.md {
        .pop-up-content {
          padding: 16px 40px;
          text-align: center;
        }


        .pop-up-footer {
          padding: 0 40px;
        }
      }


      &.lg {


        // 僅訂單成立頁
        .pop-up-title {
          padding-top: 0;
        }


        .pop-up-content {
          width: 100%;
          padding: 0 48px;
        }


        .pop-up-footer {
          padding: 0 48px;
        }
      }
    }


    &-plain {
      .pop-up-title {
        @extend .body1;
        width: 100%;
        height: 50px;
        line-height: 50px;
        padding: 0 24px;
        border-bottom: 1px solid $black-500;
      }


      .pop-up-content {
        width: 100%;
      }


      .pop-up-footer {
        width: 100%;
        margin-top: auto;
        border-top: 1px solid $black-500;
      }


      &.md {


        .pop-up-content,
        .pop-up-footer {
          padding: 10px 20px;
        }
      }


      &.lg {


        .pop-up-content,
        .pop-up-footer {
          padding: 16px 24px;
        }


        .pop-up-content {
          padding-top: 0;
        }
      }
      &.xl{
        width: 740px;
        max-width: 95%;
        height: 520px;
      }
    }


    &-search {
      width: 740px;
      max-width: 95%;
      height: 520px;
      justify-content: flex-start;


      .pop-up-title {
        width: 100%;
        height: 80px;
        padding: 20px 24px;
        padding-right: 100px;
      }


      .pop-up-content {
        flex-grow: 1;
        width: 100%;
        overflow-y: hidden;
      }
      .pop-up-close {
        top: 40px;
        right: 20px;
        transform: translateY(-50%);
      }
    }
    &-list {
      width: 740px;
      max-width: 95%;
      height: 520px;
      justify-content: flex-start;


      .pop-up-title {
        @extend .body1;
        width: 100%;
        height: 50px;
        line-height: 50px;
        padding: 0 24px;
        border-bottom: 1px solid $black-500;
      }


      .pop-up-content {
        flex-grow: 1;
        width: 100%;
        overflow-y: hidden;
      }
    }
  }


  .pop-up-back {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
}
</style>



