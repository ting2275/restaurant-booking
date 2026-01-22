<template>
  <div class='sidebar-footer'>
    <div v-for='item in navigationItems' :key='item.id'>
      <router-link
        v-if='!item.target'
        :to='item.path'
        class='nav-link'
        @click.prevent='handleLinkClick(item)'
      >
        <div class='nav-item'>
          <img :src='getIconPath(item.icon)' :alt='item.text' class='nav-icon' />
          <span>{{ item.text }}</span>
        </div>
      </router-link>
      <a
        v-else
        :href='item.path'
        :target='item.target'
        class='nav-link'
        rel='noopener noreferrer'
      >
        <div class='nav-item'>
          <img :src='getIconPath(item.icon)' :alt='item.text' class='nav-icon' />
          <span>{{ item.text }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useUserRole } from '@/composables/useUserRole';
import { navItems as allNavItems } from '@/data/navItems';

const router = useRouter();
const emit = defineEmits(['toggle-sidebar']);
const userStore = useUserStore();

const { userRoleKey } = useUserRole();

const navigationItems = computed(() => {
  const { value: role } = userRoleKey;
  const items = allNavItems[role] || [];
  return items.filter(({ type }) => type === 'setting');
});

const iconMap = import.meta.glob('/src/assets/images/icons/*.svg', { eager: true });
const getIconPath = (iconName) => iconMap[`/src/assets/images/icons/${iconName}.svg`]?.default || '';

const handleLinkClick = (item) => {
  switch (item.text) {
    case '登出':
      logout();
      break;
    default:
      if (item.path) {
        emit('toggle-sidebar');
        router.push({ path: item.path });
      } else {
        console.warn('錯誤的選單:', item);
      }
  }
};

const basePath = import.meta.env.VITE_APP_ENV === 'production' ? import.meta.env.VITE_BASE_PATH : '';
import { joinPath } from '@/utils';

const logout = () => {
  userStore.clearUserInfo();
  userStore.clearRoleChanged();
  const rememberEmail = localStorage.getItem('rememberMe');
  if (!rememberEmail) {
    localStorage.removeItem('rememberMe');
  }
  window.location.replace(joinPath(basePath, 'login'));
};
</script>