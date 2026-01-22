<template>
  <div class='input-group' :class='[{ error: hasError },props.class]'>
    <label v-if='label'>{{ label }}</label>
    <div class='input-with-icon'>
      <input
        type='search'
        :value='modelValue'
        :placeholder='placeholder'
        :disabled='props.locked'
        :class='{ "is-rounded": isRounded }'
        @input='updateValue($event.target.value)'
        @keydown.enter='handleSearchClick'
      />
      <span class='icon' @click='handleSearchClick'>
        <img v-if="props.class === 'primary'" :src='searchIconPrimary' alt='' />
        <img v-else :src='searchIcon' alt='' />
      </span>
    </div>

    <div v-if='hasError' class='error-message'>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import searchIcon from '@/assets/images/icons/search.svg'
  import searchIconPrimary from '@/assets/images/icons/search-primary.svg'



  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    errorMessage: {
      type: String,
      default: ''
    },
    locked: { // 新增locked prop
      type: Boolean,
      default: false
    },
    class: {
      type: String,
      default: ''
    },
    onEnter: {
      type: Function,
      default: null
    },
    isRounded: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:modelValue', 'search'])
  const hasError = computed(() => props.errorMessage && props.errorMessage.length > 0)

  const updateValue = (value) => {
    if (!props.locked) {  // 當locked為true時，輸入框無法編輯
      emit('update:modelValue', value)
    }
  }

  const handleSearchClick = () => {
    if (props.onEnter) {
      props.onEnter();
    }
    emit('search', props.modelValue);
  }
</script>

<style lang="scss" scoped>
  .input-group {
    margin-bottom: 20px;
    &.locked {
      input {
        background-color: #ECECEC;
        border-color: #CCCCCC;
        color: #2D2D2D;
        cursor: not-allowed;
      }
    }
    &.primary {
      input {
        border: none;
        border-radius: 40px;
        background-color: $secondary;
        padding-left: 20px;
        font-weight: normal;
      }
    }
  }

  label {
    display: block;
    margin-bottom: 10px;
    @extend .body2;
  }

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid $black-500;
    border-radius: 8px;
    font-size: 14px;
    @extend .body2;
    &:focus {
      outline: none;
      border-color: $primary;
    }
    &:disabled {
      background-color: #f1f1f1;
      color: #aaa;
    }
    &.is-rounded {
      border-radius: 30px;
    }
  }

  .input-with-icon {
    position: relative;
  }

  .input-with-icon input {
    padding-right: 30px;
  }

  .icon {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    cursor: pointer;
    color: #aaa;
  }

  .error input {
    border-color: red;
  }

  .error-message {
    color: red;
    margin-top: 5px;
    font-size: 12px;
  }
  input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}
</style>
