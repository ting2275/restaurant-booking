<template>
  <router-link
    v-for='item in navigationItems'
    :key='item.id'
    :to="item.children && item.children.length ? '#' : (item.path || '/')"
    class='nav-link'
    :class="{'hasChild': item.children}"
    @click.prevent='handleLinkClick(item)'
  >
    <div class='nav-item'>
      <img
        :src='getIconPath(item.icon)'
        :alt='item.text'
        class='nav-icon'
      />
      <span>{{ item.text }}</span>
    </div>
    <img
      v-if='item.children && item.children.length'
      class='toggle-icon icon-down'
      :class="{'active': expandedMenus.has(item.id)}"
      src='@/assets/images/icons/down-arrow.svg'
    />
    <ul v-if='item.children && expandedMenus.has(item.id)' class='sub-nav'>
      <router-link
        v-for='child in item.children'
        :key='child.id'
        :to="child.path || '/'"
        class='sub-nav-link'
        @click.prevent='handleLinkClick(child)'
      >
        {{ child.text }}
      </router-link>
    </ul>
  </router-link>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserRole } from '@/composables/useUserRole';
import { navItems as allNavItems } from '@/data/navItems';

const router = useRouter();
const emit = defineEmits(['toggle-sidebar']);

const { userRoleKey } = useUserRole();

const navigationItems = computed(() => {
  const { value: role } = userRoleKey;
  const items = allNavItems[role] || [];
  return items.filter(({ type }) => type === 'nav');
});

const iconMap = import.meta.glob('/src/assets/images/icons/*.svg', { eager: true });
const getIconPath = (iconName) => iconMap[`/src/assets/images/icons/${iconName}.svg`]?.default || '';

const expandedMenus = ref(new Set());

const toggleSubMenu = (id) => {
  if (expandedMenus.value.has(id)) {
    expandedMenus.value.delete(id);
  } else {
    expandedMenus.value.add(id);
  }
};

const handleLinkClick = (item) => {
  if (item.children && item.children.length) {
    toggleSubMenu(item.id);
  } else if (item.path) {
    emit('toggle-sidebar');
    router.push({ path: item.path });
  } else {
    console.warn('錯誤的選單:', item);
  }
};
</script>