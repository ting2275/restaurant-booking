<template>
  <div class='switch-group'>
    <fieldset class='switch-slider'>
      <input
        :id='`${id}${options[0]}`'
        :checked='isChecked'
        type='radio'
        :name='forName'
        :value='options[0]'
        :disabled='isDisabled'
        @change='updateValue'
      >
      <label
        class='true'
        :for='`${id}${options[0]}`'
      >
        <span class='round' />
        <span class='text' />
      </label>
      <input
        :id='`${id}${options[1]}`'
        :checked='unChecked'
        type='radio'
        :name='forName'
        :value='options[1]'
        :disabled='isDisabled'
        @change='updateValue'
      >
      <label
        class='false'
        :for='`${id}${options[1]}`'
      >
        <span class='round' />
        <span class='text' />
      </label>
    </fieldset>
    <label><slot /></label>
  </div>
</template>
<script setup>

import { toRefs, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: ''
  },
  forName: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  isDisabled: {
    type: Boolean,
    default: false
  }
});

const { modelValue, id, forName, options, isDisabled } = toRefs(props);
const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  emit('update:modelValue', event.target.value === 'true');
};

const isChecked = computed(() => {
  return modelValue.value === options.value[0];
});

const unChecked = computed(() => {
  return modelValue.value === options.value[1];
});
</script>

<style lang="scss" scoped>
$dot-size: 14px !default;
.switch-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.switch-slider {
  position: relative;
  display: block;
  width: calc($dot-size*2.4);
  height: calc($dot-size*1.25);
  border: none;
  input {
    display: none;
  }
  label {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50px;
    overflow: hidden;
    .text {
      display: block;
      font-size: calc($dot-size*0.75);
      color: white;
      line-height: calc($dot-size*1.25);
    }
    .round {
      position: absolute;
      content: '';
      height: $dot-size;
      width: $dot-size;
      left: 1px;
      bottom: calc($dot-size*0.1);
      background-color: white;
      border-radius: 50%;
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    }
    &.true {
      background-color: #ccc;
      border: 1px solid $black-600;
      .text {
        text-align: right;
        padding-right: calc($dot-size*0.625);
      }
    }
    &.false {
      background-color: $primary;
      border: 1px solid $primary;
      .text {
        text-align: left;
        padding-left: calc($dot-size*0.625);
      }
      .round {
        transform: translateX(calc($dot-size*1.15));
      }
    }
  }
  input:checked + label {
    opacity: 0;
    pointer-events: none;
  }
  input:disabled + label {
    border: 1px solid $black-500;
    &.true {
      background-color: $black-400;
    }
    &.false {
      background-color: $black-400;
    }
  }
}
</style>
