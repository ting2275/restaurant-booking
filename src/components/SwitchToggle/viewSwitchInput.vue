<template>
  <div class='switch-slider'>
    <div :class='modelValue ? "open" : "close"'>
      <span class='round'/>
    </div>
  </div>
</template>

<script setup>
  import { defineProps } from 'vue';

  defineProps({
    modelValue: {
      type: Boolean,
      default: false
    }
  });
</script>

<style lang="scss" scoped>
  $dot-size: 14px !default;
  .switch-slider {
    position: relative;
    display: block;
    width: calc($dot-size*2.4);
    height: calc($dot-size*1.25);
    border: none;
    div {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50px;
      overflow: hidden;
      .round {
        position: absolute;
        content: '';
        height: $dot-size;
        width: $dot-size;
        bottom: calc($dot-size*0.1);
        background-color: white;
        border-radius: 50%;
      }
      &.open {
        background-color: $primary-variant;
        border: 1px solid $primary-variant;
        .round {
          right: 1px;
          box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
        }
      }
      &.close {
        background-color: $black-400;
        border: 1px solid $black-500;
        .round {
          left: 1px;
        }
      }
    }
  }
</style>
