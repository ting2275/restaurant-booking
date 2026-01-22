<template>
  <transition name='slide'>
    <aside v-show='props.isExpanded' :class='{ expanded: props.isExpanded }' class='sidebar'>
      <SidebarHead />
      <div class='sidebar-nav'>
        <UserInfo />
        <DropdownMenu
          v-if='dropdownOptions.length > 0'
          :key='dropdownKey'
          :model-value='tempSelectedCompany'
          :options='dropdownOptions'
          label-key='name'
          :value-key='valueKey'
          placeholder='請選擇店鋪'
          arrow-style='custom'
          :is-disabled='!isAdmin'
          :is-searchable='false'
          :is-readonly='true'
          :is-view-only='isViewOnly'
          @update:model-value='onDropdownSelect'
        />
        <nav class='nav'>
          <NavItem
            @toggle-sidebar='emit("toggle-sidebar")'
          />
        </nav>
      </div>
      <SidebarFooter
        @toggle-sidebar='emit("toggle-sidebar")'
      />
    </aside>
  </transition>
  <ChangeCompanyPopUp
    v-model='showEditingPopup'
    :pending-id='pendingCompanyId'
    @confirm='handleConfirmLeave'
    @cancel='handleCancelLeave'
  />

</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSystemStore } from '@/stores/systemStore';

import SidebarHead from './SidebarHead.vue';
import UserInfo from './UserInfo.vue';
import NavItem from './NavItem.vue';
import SidebarFooter from './SidebarFooter.vue';

const router = useRouter();
const systemStore = useSystemStore();

import { useUserRole } from '@/composables/useUserRole';
const { isAdmin } = useUserRole();

import { useSelectedCompany } from '@/composables/modules/sidebar/useUserState';

const { selectedCompany } = useSelectedCompany();

import { useUserRoleState } from '@/composables/modules/sidebar/useUserRoleState';
const { dropdownOptions, valueKey } = useUserRoleState();

onMounted(async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    router.push({ name: 'Login' });
  }
});

const emit = defineEmits(['toggle-sidebar', 'editing-alert', 'change-company']);

import { useChangeCompany } from '@/composables/modules/sidebar/useChangeCompany';
const { handleSelectedCompanyChange } = useChangeCompany();

const props = defineProps({
  isExpanded: Boolean,
});

const finalizeCompanyChange = (companyId) => {
  selectedCompany.value = companyId;
  if (props.isExpanded) {
    emit('toggle-sidebar');
  }
};

import { usePopupHandler } from '@/composables/modules/sidebar/usePopupHandler';
const { showEditingPopup, pendingCompanyId } = usePopupHandler();

const tempSelectedCompany = ref(selectedCompany.value);
const lastSelectedCompany = ref(selectedCompany.value);
const dropdownKey = ref(0);

watch(selectedCompany, (val) => {
  tempSelectedCompany.value = val;
  lastSelectedCompany.value = val;
});

const onDropdownSelect = (companyId) => {
  if (systemStore.systemIsEditing) {
    pendingCompanyId.value = companyId;
    showEditingPopup.value = true;
    return;
  }
  tempSelectedCompany.value = companyId;
  selectedCompany.value = companyId;
  lastSelectedCompany.value = companyId;
  handleSelectedCompanyChange(companyId, {
    onSuccess: () => finalizeCompanyChange(companyId)
  });
};

const handleCancelLeave = () => {
  tempSelectedCompany.value = lastSelectedCompany.value;
  dropdownKey.value++;
  emit('toggle-sidebar');
};

const handleConfirmLeave = async () => {
  const switched = await handleSelectedCompanyChange(pendingCompanyId.value, {
    onSuccess: () => finalizeCompanyChange(pendingCompanyId.value)
  });
  if (!switched) finalizeCompanyChange(pendingCompanyId.value);
};

import { useAccountStore } from '@/stores/accountStore';
const accountStore = useAccountStore();
const isViewOnly = ref(false);
const GOOGLE_STATUS = ref(8);
watch(
  () => accountStore.googleStatus,
  (newStatus) => {
    isViewOnly.value = newStatus === GOOGLE_STATUS.value;
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.slide-leave-active, .slide-enter-active {
  transition: all .3s ease;
}
</style>