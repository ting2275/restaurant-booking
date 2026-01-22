<template>
  <div class='user-info' @click='handleUserInfoClick'>
    <img :src='user.avatar' :alt='user.username' class='avatar' />
    <div class='user-details'>
      <p class='title'>{{ user.username }}</p>
      <small class='small'>{{ userRoleText }}</small>
    </div>
    <img class='icon-right' src='@/assets/images/icons/right-arrow.svg'>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useUserRole } from '@/composables/useUserRole';
import { useRouter } from 'vue-router';
import defaultAvatar from '@/assets/images/icons/user-picture.svg';

const userStore = useUserStore();
const user = computed(() => ({
  username: userStore.userInfo.maintainName || userStore.userInfo.username || '',
  avatar: userStore.userInfo.avatar || defaultAvatar,
  role: userStore.userInfo.maintainRoot || userStore.userInfo.role || '',
}));

const { userRoleText } = useUserRole();

const router = useRouter();
const emit = defineEmits(['toggle-sidebar']);

const handleUserInfoClick = () => {
  emit('toggle-sidebar');
  router.push({ path: '/account-settings' });
};
</script>
