<template>
  <PlainPopUp
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
        <template v-for='(table, index) in newTablesData' :key='index'>
          <BaseInput
            v-model='table.tableName'
            :label='`桌號${index + 1}`'
            type='text'
            placeholder='建議輸入八個字元以內'
            required
            :class='{ "error-border": duplicateIndexes.includes(index) }'
          />
        </template>
      </div>
    </template>
    <template #buttons>
      <BaseButton
        variant='cancel'
        size='lg'
        @click='previous'
      >上一步</BaseButton>
      <BaseButton
        variant='check'
        size='lg'
        :disabled='newTablesData.some(table => !table.tableName)'
        @click='confirm'
      >確認</BaseButton>
    </template>
  </PlainPopUp>
</template>
  
<script setup>
import PlainPopUp from '@/components/PopUp/PlainPopUp.vue'

defineProps({
  modelValue: { type: Boolean, required: true },
  newTablesData: { type: Array, required: true },
  duplicateIndexes: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'previous',
  'confirm'
])

const close = () => {
  emit('update:modelValue', false)  
  emit('close') 
}
const previous = () => emit('previous')
const confirm = () => emit('confirm')
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/businessSettings/_tableManagement.scss' as *;
</style>