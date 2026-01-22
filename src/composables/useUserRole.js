import { computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
export function useUserRole() {
  const userStore = useUserStore();

  const userRole = {
    '1': { id: 1, key: 'admin', text: '管理員', label: '管理員' },
    '2': { id: 2, key: 'manager', text: '店長', label: '店長' },
    '3': { id: 3, key: 'staff', text: '店員', label: '員工' }
  }
  const userRoleKey = computed(() => userRole[userStore.userInfo.role]?.key || 'default');
  const userRoleText = computed(() => userRole[userStore.userInfo.role]?.text || '未知角色');

  const isRole = (role) => computed(() => userRoleKey.value === role);

  return {
    userRole,
    userRoleKey,
    userRoleText,
    isAdmin: isRole('admin'),
    isManager: isRole('manager'),
    isStaff: isRole('staff')
  };
}