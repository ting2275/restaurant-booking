<template>
  <router-view />
  <RoleChangePopUp v-model='showRoleChangePopUp' @close='handlePopUpClose' />
  
  <ContractChangePopUp v-model='showContractChangePopUp' @close='handleContractPopUpClose' />
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from "@/stores/userStore";
import { useAccountStore } from "@/stores/accountStore";

const userStore = useUserStore();
const accountStore = useAccountStore();

const showRoleChangePopUp = computed({
  get: () => userStore.roleChangePopUpVisible,
  set: (value) => {
    userStore.setRoleChangePopUpVisible(value);
  },
});

const handlePopUpClose = () => {
  userStore.clearRoleChanged();
};

const showContractChangePopUp = computed({
  get: () => accountStore.contractChangePopUpVisible,
  set: (value) => {
    accountStore.setContractChangePopUpVisible(value);
  },
});

const handleContractPopUpClose = () => {
  accountStore.clearContractChanged();
};
</script>
