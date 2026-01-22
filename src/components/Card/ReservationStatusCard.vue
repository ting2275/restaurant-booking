<template>
  <div :id='props.id' :class='computedClass'>
    <div class='left-box'>
      <div class='row'>
        <span class='variant'>{{ variantText[props.variant] }}</span>
        <span v-if='props.width !== 1' class='number'>{{ number }}位</span>
      </div>
      <p class='name'>{{ name }}</p>
    </div>
    <div class='right-box'>
      <p v-if='props.width !== 1' class='time'>{{ time }}</p>
      <p v-if='props.width !== 1' class='memo'>{{ memo }}</p>
    </div>
  </div>
</template>

<script setup>
    import { computed } from 'vue'

    const props = defineProps({
        variant: {
            type: String,
            default: 'prepare',
            validator: value => ['prepare', 'CONFIRMED', 'seated', 'NO_SHOW', 'CANCELED'].includes(value)
        },
        darken: {
            type: Boolean,
            default: false
        },
        name: {
            type: String,
            default: ''
        },
        number: {
            type: Number,
            default: 1
        },
        time: {
            type: String,
            default: ''
        },
        memo: {
            type: String,
            default: ''
        },
				width: {
					type: Number,
					default: 1
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

      let classes = ['reservation-card', `reservation-card-${variantMap[props.variant]}`, `width-${props.width}`];
      if (props.darken) {
          classes.push('darken');
      }
      return classes;
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
    .reservation-card {
        position: relative;
        width: 100%;
        height: 65px;
        padding: 12px;
        border-radius: 8px;
        display: flex;
        flex-direction: row;
				justify-content: space-between;
				gap: 8px;
        cursor: pointer;
        box-shadow: 0px 2px 4px 0px #00000040;
        >div {
            display: flex;
            flex-direction: column;
						justify-content: space-between;
        }
				.left-box {
					flex-shrink: 0;
				}
				.row {
            display: flex;
            flex-direction: row;
						gap: 8px;
				}
        .variant, .number {
            background: #ffffff;
            border-radius: 8px;
						@extend .small;
            font-weight: 700;
            padding: 0 8px;
        }
				.name {
					@extend .caption;
					font-weight: 700;
					max-width: 85px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
        }
        .time {
						@extend .small;
        }
        .memo {
						@extend .caption;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
				&.width-4 .memo {
					max-width: 80px;
				}
				&.width-6 .memo {
					max-width: 180px;
				}
				&.width-8 .memo {
					max-width: 280px;
				}
        &.reservation-card-prepare {
            background-color: $primary-variant;
        }
        &.reservation-card-confirmed {
            background-color: $accent-2;
        }
        &.reservation-card-seated {
            background-color: $accent-1;
        }
				&.reservation-card-canceled {
            background-color: $black-500;
        }
        &.reservation-card-noShow {
          background-color: $grey;
        }
        &.darken::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: inherit;
            pointer-events: none;
        }
    }
</style>