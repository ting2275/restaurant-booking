<template>
  <PlainPopUp
    ref='addTableStep1Ref'
    :model-value='modelValue'
    teleport-to='#popup-layer-1'
    card-size='md'
    @update:model-value='close'
  >
    <template #title>
      <p>新增桌子</p>
    </template>
    <template #content>
      <div class='popup-content table-content'>
        <div class='form-group'>
          <label>桌型</label>
          <DropdownMenu
            v-model='tableData.partySize'
            :options='partySizeOptions'
            :is-searchable='false'
            :is-readonly='true'
            label-key='label'
            value-key='value'
            :placeholder='`${tableData.partySize}人桌`'
            @dropdown-open='scrollToBottom'
          />
        </div>
        <div class='form-group'>
          <label class='required'>數量</label>
          <div class='number-input' :class="{ 'error-number-input': isQuantityEmpty }">
            <input
              v-model='tableData.tableQuantity'
              type='number'
              class='table-input'
              placeholder='請輸入數量'
              @input='handleTableQuantityInput'
            />
            <div class='number-controls' :class="{ 'error-number-controls': isQuantityEmpty }">
              <button :disabled='tableData.tableQuantity <= 1' @click='decreaseTableQuantity'>
                <img src='@/assets/images/icons/minus-small.svg' alt='減少' />
              </button>
              <button @click='increaseTableQuantity'>
                <img src='@/assets/images/icons/plus.svg' alt='增加' />
              </button>
            </div>
          </div>
          <p v-if='isQuantityEmpty' class='error-text'>未填寫</p>
        </div>
        <div class='checkbox-group'>
          <label>
            <input
              v-model='tableData.isOnlineBooking'
              type='checkbox'
              :true-value='1'
              :false-value='0'
            />
            是否開放線上預訂
          </label>
        </div>
      </div>
    </template>
    <template #buttons>
      <BaseButton
        variant='cancel'
        size='lg'
        @click='cancel'
      >取消</BaseButton>
      <BaseButton
        variant='check'
        size='lg'
        :disabled='!tableData.partySize || !tableData.tableQuantity'
        @click='next'
      >下一步</BaseButton>
    </template>
  </PlainPopUp>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import PlainPopUp from '@/components/PopUp/PlainPopUp.vue'

const addTableStep1Ref = ref(null)
const scrollToBottom = () => nextTick(() => addTableStep1Ref.value?.scrollToBottom())


defineProps({
  modelValue: { type: Boolean, required: true },
  tableData: { type: Object, required: true },
  partySizeOptions: { type: Array, required: true },
  isQuantityEmpty: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'handleTableQuantityInput',
  'decreaseTableQuantity',
  'increaseTableQuantity',
  'cancel',
  'next'
])

const close = () => {
  emit('update:modelValue', false)  
  emit('close') 
}
const handleTableQuantityInput = (e) => emit('handleTableQuantityInput', e)
const decreaseTableQuantity = () => emit('decreaseTableQuantity')
const increaseTableQuantity = () => emit('increaseTableQuantity')
const cancel = () => emit('cancel')
const next = () => emit('next')
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/businessSettings/_tableManagement.scss' as *;
</style>