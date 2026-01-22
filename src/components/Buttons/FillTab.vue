<template>
  <div>
    <div class='tabs-container'>
      <button
        v-for='(tab, index) in tabs'
        :key='index'
        :class='computedClass(index)'
        :disabled='restrictedTabs.includes(index)'
        @click='changeTab(index)'
      >
        {{ tab.label }}
      </button>
    </div>
    <component
      :is='currentTabContent'
      v-if='currentTabContent'
      v-bind='$attrs'
    />
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';

  const props = defineProps({
    tabs: {
      type: Array,
      required: true,
    },
    tabContent: {
      type: Array,
      required: true,
    },
    restrictedTabs: {
      type: Array,
      default: () => [],
    },
    currentTab: {
      type: Number,
      default: 0,
    },
    isChangeEvent: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['tab-change', 'update-page']);

  const currentTab = ref(props.currentTab);

  watch(() => props.currentTab, (newVal) => {
    currentTab.value = newVal;
  });

  const currentTabContent = computed(() => props.tabContent[currentTab.value] || null);

  function changeTab(index) {
    if (!props.restrictedTabs.includes(index) && index >= 0 && index < props.tabs.length) {
      if (props.isChangeEvent) {
        emit('tab-change', index);
      } else {
        currentTab.value = index;
        emit('tab-change', index);
      }
    }
  }

  const computedClass = (index) => [
    'btn',
    currentTab.value === index ? 'btn-active' : 'btn-inactive',
    props.restrictedTabs.includes(index) ? 'disabled' : '',
  ];
</script>

<style lang="scss" scoped>
  .btn {
    border: none;
    cursor: pointer;
    padding: 10px 24px;
    gap: 0px;
    border-radius: 8px 8px 0 0;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 140%;
    letter-spacing: 0.16em;
    background-color: white;
    color: $black-900;
    white-space: nowrap;

    &-active {
    background-color: $primary;
    color: white;;
    }
    &-inactive {
    background-color: transparent;
    color: $black-900;
    }

  }

  .tabs-container {
    display: flex;
  }
</style>