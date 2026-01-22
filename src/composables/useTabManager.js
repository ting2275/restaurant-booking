import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

export function useTabManager(tabs, restrictedIndices = []) {
  const route = useRoute();
  const router = useRouter();
  const activeTabIndex = ref(0);

  const filteredTabs = computed(() =>
    tabs.filter((_, index) => !restrictedIndices.includes(index))
  );

  const initializeTabIndex = () => {
    const tabQuery = parseInt(route.query.tab, 10);
    if (!isNaN(tabQuery)) {
      const validIndex = filteredTabs.value.findIndex((_, index) => index === tabQuery);
      activeTabIndex.value = validIndex >= 0 ? validIndex : 0;
    } else {
      activeTabIndex.value = 0;
    }
  };

  // 監聽 route.query.tab 的變化
  watch(() => route.query.tab, (newTab) => {
    const tabIndex = parseInt(newTab, 10);
    if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < filteredTabs.value.length) {
      activeTabIndex.value = tabIndex;
    } else {
      activeTabIndex.value = 0;
    }
  });

  // 切換Tabs功能
  const changeTab = (index) => {
    if (index >= 0 && index < filteredTabs.value.length) {
      activeTabIndex.value = index;
      const query = { ...route.query };
      query.tab = index;
      delete query.category;
      router.push({ query });
    }
  };

  const currentTabContent = computed(() => {
    return filteredTabs.value[activeTabIndex.value]?.component || null;
  });

  initializeTabIndex();

  return {
    activeTabIndex,
    changeTab,
    filteredTabs,
    currentTabContent,
  };
}