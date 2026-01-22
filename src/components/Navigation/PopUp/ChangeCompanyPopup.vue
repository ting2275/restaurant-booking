<template>
  <ConfirmLeavePopUp
    v-model='visible'
    @confirm='confirmChange'
    @cancel='cancelChange'
  />
</template>

<script setup>
import { computed } from 'vue';
import { useChangeCompany } from '@/composables/modules/sidebar/useChangeCompany';
import { useUserStore } from '@/stores/userStore';

const emit = defineEmits(['company-changed', 'update:modelValue']);
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  pendingId: { type: [String, Number], default: null },
});

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const userStore = useUserStore();
const { handleSelectedCompanyChange } = useChangeCompany();

const confirmChange = async () => {
  if (!props.pendingId) return;

  await handleSelectedCompanyChange(props.pendingId, {
    onSuccess: () => {
      visible.value = false;
      emit('company-changed');
    }
  });
};

const cancelChange = () => {
  visible.value = false;
  userStore.selectedCompanyId = userStore.storeId;
};
</script>