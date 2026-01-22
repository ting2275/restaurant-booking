<template>
  <AddTableStep1
    v-if='step === 1'
    :model-value='modelValue'
    v-bind='{ tableData, partySizeOptions, isQuantityEmpty }'
    @handle-table-quantity-input='handleTableQuantityInput'
    @decrease-table-quantity='decreaseTableQuantity'
    @increase-table-quantity='increaseTableQuantity'
    @update:model-value="emit('update:modelValue', $event)"
    @close='handleClose'
    @cancel='handleClose'
    @next='onNextStep'
  />
  <AddTableStep2
    v-else-if='step === 2'
    :model-value='modelValue'
    :new-tables-data='newTablesData'
    :duplicate-indexes='duplicateIndexes'
    @update:model-value="emit('update:modelValue', $event)"
    @close='handleClose'
    @previous='goToPreviousStep'
    @confirm='onConfirm'
  />
</template>
  
<script setup>
import AddTableStep1 from '@businessSettings/Tables/TableManagement/Steps/AddTableStep1.vue'
import AddTableStep2 from '@businessSettings/Tables/TableManagement/Steps/AddTableStep2.vue'

defineProps({
  modelValue: { type: Boolean, required: true },
  step: { type: Number, required: true },
  tableData: { type: Object, required: true },
  newTablesData: { type: Array, required: true },
  partySizeOptions: { type: Array, required: true },
  isQuantityEmpty: { type: Boolean, default: false },
  duplicateIndexes: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:modelValue',  
  'close',
  'nextStep',
  'previousStep',
  'confirm',
  'handleTableQuantityInput',
  'decreaseTableQuantity',
  'increaseTableQuantity'
]);

const handleClose = () => {
  emit('update:modelValue', false);
  emit('close');
}
const goToPreviousStep = () => emit('previousStep');
const onNextStep = () => emit('nextStep');
const onConfirm = () => emit('confirm');
const handleTableQuantityInput = (e) => emit('handleTableQuantityInput', e);
const decreaseTableQuantity = () => emit('decreaseTableQuantity');
const increaseTableQuantity = () => emit('increaseTableQuantity');
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/businessSettings/_tableManagement.scss' as *;
</style>
