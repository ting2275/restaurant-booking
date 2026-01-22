<script setup>
  import { ref } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { updatePopUpNotice } from '@/services/api/maintainUser';

  const userStore = useUserStore();
  const visible = ref(true);
  const dontShowAgain = ref(false);
  const emit = defineEmits(['close', 'navigate']);

  const navigate = async () => {
    if (dontShowAgain.value) {
      try {
        await updatePopUpNotice(userStore.userInfo.email);
        userStore.popUpNotice = 0;
      } catch (error) {
        console.error('更新彈窗通知狀態失敗', error);
      }
    }
    emit('close');
    emit('navigate');
  };
</script>

<template>
  <BasePopUp v-model='visible'>
    <template #title>確認店家營業設定</template>
    <template #content>
      <div>請務必確認所有設定，這些設定將影響顧客可選擇的預訂選項</div>
    </template>
    <template #button>
      <CheckBox
        id='dismissNotice'
        v-model='dontShowAgain'
        :for-name="'dismissNotice'"
        :value='true'
        :is-disabled='false'
        :custom-class="'dismiss-checkbox'"
      >
        不再顯示此訊息
      </Checkbox>
      <BaseButton variant='check' size='lg' @click='navigate'>前往設定</BaseButton>
    </template>
  </BasePopUp>
</template>

<style lang='scss' scoped>
  .pop-up-content > div {
    max-width: 320px;
    text-align: center;
    margin: 10px 0;
    letter-spacing: 0.1em;
    padding: 0 10px;
  }
  .dismiss-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
</style>
