<template>
  <BasePopUp v-model='visible'>
    <template #title>
      <slot name='title'>{{ title }}</slot>
    </template>
    <template #content>
      <slot name='content'>{{ content }}</slot>
    </template>
    <template #button>
      <CheckBox
        id='dismissNotice'
        v-model='dontShowAgain'
        :for-name="'dismissNotice'"
        :value='true'
        :is-disabled='false'
        :custom-class="'dismiss-checkbox'"
      >
        不再顯示此訊息
      </CheckBox>
      <BaseButton :variant='buttonVariant' size='lg' @click='onButtonClick'>
        <slot name='buttonText'>{{ buttonText }}</slot>
      </BaseButton>
    </template>
  </BasePopUp>
</template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  const props = defineProps({
    visible: { type: Boolean, default: true },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    buttonText: { type: String, default: '我知道了' },
    buttonVariant: { type: String, default: 'check' },
    dontShowAgain: { type: Boolean, default: false }
  });
  const emit = defineEmits(['update:visible', 'update:dontShowAgain', 'button']);
  
  const visible = ref(props.visible);
  const dontShowAgain = ref(props.dontShowAgain);
  
  watch(visible, val => emit('update:visible', val));
  watch(dontShowAgain, val => emit('update:dontShowAgain', val));
  
  function onButtonClick() {
    emit('button');
  }
  </script>

<style lang="scss" scoped>
@use '@/assets/scss/components/popup/_popup-accoutNotify.scss' as *;
</style>

