<template>
  <BasePopUp :button-count = '2' :popup-mode = '"search"' :teleport-to='props.teleportTo'>
    <template #title>
      <slot name='title'>
        <SearchInput
          v-for='(input, index) in searchInputs'
          :key='index'
          v-model='input.model'
          :type='input.type'
          :class = '"primary"'
          :placeholder='input.placeholderText'
          @search='handleSearch'
        />
      </slot>
    </template>
    <template #content>
      <slot name='content'/>
    </template>
  </BasePopUp>
</template>

<script setup>
import { ref ,watch } from 'vue';
import BasePopUp from '@/components/PopUp/BasePopUp.vue';

const props = defineProps({
  visible:{
    type: Boolean,
    required: true
  },
  placeholder: {
    type: String,
    default: '',
    required: true
  },
  teleportTo: {
    type: String,
    default: 'body'
  }
});

const searchContent = ref('');
const searchInputs = ref([
  { model: searchContent, type: 'search', placeholderText: props.placeholder }
]);

// 當父層開啟彈窗
watch(() => props.visible, async () => {
  searchContent.value=''
});

const emit = defineEmits(['search:reservation']);
const handleSearch = () =>{
  emit('search:reservation',searchContent.value)
}

</script>
