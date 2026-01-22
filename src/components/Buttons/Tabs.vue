<template>
  <div class='tabs-container'>
    <BorderTab
      v-for='(tab, index) in tabs'
      :key='index'
      :active-class="currentTab === index ? 'active' : 'inactive'"
      :has-icon='hasIcon'
      @click='changeTab(index)'
    >
      {{ tab.label }}
    </BorderTab>
  </div>
  <component :is='currentTabContent' />
</template>
  
  <script setup>
import { ref, computed } from "vue";
import BorderTab from '@/components/Buttons/BorderTab.vue';

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  tabContent: {
    type: Array,
    required: true,
  },
  hasIcon: { // Add this prop
    type: Boolean,
    default: false,
  }
});

const currentTab = ref(0);
function changeTab(index) {
  currentTab.value = index;
  
}

const currentTabContent = computed(() => {
  return props.tabContent[currentTab.value];
});


  </script>
  
  <style lang="scss" scoped>
 .tabs-container {
  display: flex;
  justify-content: center;
  gap: 40px;
}
  </style>
  