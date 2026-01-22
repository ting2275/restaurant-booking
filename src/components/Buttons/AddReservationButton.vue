<template>
  <button :class='computedClass' @click='handleClick'>
    <img v-if="props.variant === 'plus'" src='@/assets/images/icons/add.svg' alt='Plus Icon' />
    <img v-else src='@/assets/images/icons/minus.svg' alt='Minus Icon' />
    <slot />
  </button>
</template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    variant: {
      type: String,
      default: 'plus',
      validator: value => ['plus', 'minus'].includes(value)
    }
  })
  
  const emit = defineEmits(['click'])
  
  const computedClass = computed(() => {
    return ['btn', `btn-${props.variant}`]
  })
  
  const handleClick = event => {
    emit('click', event)
  }
  </script>
  
  <style lang="scss" scoped>
  .btn {
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 10px;
    gap: 8px;
    border-radius: 100px;
    &-plus {
      background-color: $primary;
    }
    &-minus {
      background-color: $secondary;
    }
    img {
    width: 12px;
    height: 12px;
  }
   
  }
  </style>