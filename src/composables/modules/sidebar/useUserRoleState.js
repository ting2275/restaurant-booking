import { computed } from 'vue';
import { useUserRole } from '@/composables/useUserRole';
import { useSelectedCompany } from '@/composables/modules/sidebar/useUserState';

export function useUserRoleState() {
  const { isAdmin } = useUserRole();
  const { ownerCompanies, maintainOwnerCompanyOptions } = useSelectedCompany();
  const dropdownOptions = computed(() => isAdmin.value ? ownerCompanies.value : maintainOwnerCompanyOptions.value);

  const valueKey = computed(() => isAdmin.value ? 'id' : 'oid');

  return {
    dropdownOptions,
    valueKey,
  };
}
