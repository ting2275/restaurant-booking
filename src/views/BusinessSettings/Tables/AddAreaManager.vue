<template>
  <PlainPopUp
    :model-value='modelValue'
    teleport-to='#popup-layer-1'
    card-size='md'
    @update:model-value='close'
  >
    <template #title>
      <p>新增區域</p>
    </template>
    <template #content>
      <div class='popup-content'>
        <div class='form-group'>
          <label class='required'>區域名稱</label>
          <input
            v-model='localAreaName'
            type='text'
            class='area-input'
            placeholder='建議輸入八個字元以內'
          />
        </div>
      </div>
    </template>
    <template #buttons>
      <BaseButton variant='cancel' size='lg' @click='close'>取消</BaseButton>
      <BaseButton
        variant='check'
        size='lg'
        :disabled='!localAreaName'
        @click='confirm'
      >確認並新增桌子</BaseButton>
    </template>
  </PlainPopUp>
</template>

<script setup>
import { ref, watch } from 'vue'
import PlainPopUp from '@/components/PopUp/PlainPopUp.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  areaName: { type: String, default: '' }
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'confirm'
])

const localAreaName = ref(props.areaName)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      localAreaName.value = props.areaName;
    }
  }
);

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
const confirm = () => emit('confirm', localAreaName.value)
</script>

<style lang="scss" scoped>
@import '@/assets/scss/pages/businessSettings/_common.scss';
</style>