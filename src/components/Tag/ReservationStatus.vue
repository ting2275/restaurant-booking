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
            default: 'prepare',
            validator: value => ['prepare', 'CONFIRMED', 'seated', 'NO_SHOW', 'CANCELED'].includes(value)
        }
    })

    const computedClass = computed(() => {
        const variantMap = {
            'prepare': 'prepare',
            'CONFIRMED': 'confirmed',
            'seated': 'seated',
            'NO_SHOW': 'noShow',
            'CANCELED': 'canceled'
        }
        return ['tag', `tag-${variantMap[props.variant]}`]
    })

    const variantText = {
        prepare: '新預訂',
        CONFIRMED: '已確認',
        seated: '已入座',
        NO_SHOW: '未出席',
        CANCELED: '已取消'
    }
</script>

<style lang="scss" scoped>
    .tag {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 79px;
        height: 32px;
        border-radius: 24px;
        color: $black-900;
        font-size: map-get($body2, font-size);
        line-height: map-get($body2, line-height);
        font-weight: map-get($body2, font-weight);
        letter-spacing: map-get($body2, letter-spacing);
        &-prepare {
            background-color: $primary-variant;
        }
        &-confirmed {
            background-color: $accent-2;
        }
        &-seated {
            background-color: $accent-1;
        }
        &-noShow {
            background-color: $black-400;
        }
        &-canceled {
            background-color: #ffffff;
            border: 1px solid $black-500;
        }
    }
</style>