<template>
  <div :class='computedClass'>
    {{ variantText[props.variant] }}
  </div>
</template>

<script setup>
    import { computed } from 'vue'

    const props = defineProps({
        variant: {
            type: String,
            default: 'staff',
            validator: value => ['admin', 'manager', 'staff'].includes(value)
        }
    })

    const computedClass = computed(() => {
        return ['tag', `tag-${props.variant}`]
    })

    const variantText =  {
        admin: '管理員',
        manager: '店長',
        staff: '員工'
    }
</script>

<style lang="scss" scoped>
    .tag {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 32px;
        border-radius: 8px;
        color: $black-900;
        border: none;
        font-size: map-get($body2, font-size);
        line-height: map-get($body2, line-height);
        font-weight: map-get($body2, font-weight);
        letter-spacing: map-get($body2, letter-spacing);
        &-admin {
            background-color: $primary;
            color: #ffffff
        }
        &-manager {
            background-color: $primary-variant;
            color: $black-900;
        }
        &-staff {
            background-color: $secondary;
            color: $black-900;
        }
    }
</style>