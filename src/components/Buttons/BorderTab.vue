<template>
  <div class='tabs-container'>
    <button
      v-for='(tab, index) in tabs'
      :key='index'
      :class='computedClass(index)'
      @click='changeTab(index)'
    >
      <img v-if='hasIcon' :src='icon' alt='icon' />
      {{ tab.label }}
    </button>
  </div>
  <component
    :is='currentTabContent'
    v-if='currentTabContent'
    v-bind='$attrs'
  />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import icon from "@/assets/images/icons/mail.svg";

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  tabContent: {
    type: Array,
    required: true,
  },
  hasIcon: {
    type: Boolean,
    default: false,
  },
  currentTab: {
    type: Number,
    required: true,
  },
  isChangeEvent: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['tab-change']);

const currentTab = ref(props.currentTab);

watch(() => props.currentTab, (newVal) => {
  currentTab.value = newVal;
});

const currentTabContent = computed(() => props.tabContent[currentTab.value] || null);

function changeTab(index) {
  if (props.isChangeEvent) {
    emit("tab-change", index);
  } else {
    currentTab.value = index;
    emit("tab-change", index);
  }
}

// 計算class`
const computedClass = (index) => {
  return [
    'tab-button',
    currentTab.value === index ? 'active' : 'inactive',
    props.hasIcon ? 'has-icon' : '',
  ];
};

</script>

<style lang="scss" scoped>
.tabs-container {
  display: flex;
  padding: 0px;
  gap: 40px;
  margin: 0;
}

.tab-button {
  border: none;
  cursor: pointer;
  padding: 10px 0;
  background-color: white;
  color: $black-900;
  font-size: 16px;
  font-weight: 400;
  line-height: 140%;
  letter-spacing: 0.16em;
  border-radius: 0;

  &.active {
    border-bottom: 4px solid $primary;
  }

  &.inactive {
    border-bottom: 4px solid transparent;
  }

  &.has-icon img {
    margin-left: 8px;
    width: 16px;
    height: 16px;
  }
}
</style>
