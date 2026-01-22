<template>
  <div :class='backgroundClass'>
    <div v-if='isLoading'>載入中...</div>
    <div v-else-if='error'>{{ error }}</div>
    <div v-else class='main-box'>
      <div class='content-box'>
        <h4>名稱設定</h4>
        <div class='name-box'>
          <p class='body1'>通知店家名稱</p>
          <BaseInput
            v-for='(input, index) in inputs'
            :key='index'
            v-model='input.model'
            :type='input.type'
            :placeholder='input.placeholder'
            :locked='input.locked'
          />
        </div>
        <!-- <p class='caption'>※ 名稱會顯示於通知簡訊中，如欲修改請與<router-link to='/account-settings?tab=4'>服務專員聯絡</router-link></p> -->
        <p class='caption'>※ 名稱會顯示於通知簡訊中，如欲修改請與<router-link to='/' @click.prevent='navigateToConsultation'>服務專員聯絡</router-link>
        </p>
      </div>
      <div class='content-box'>
        <h4>通知設定</h4>
        <div class='remind-box'>
          <div class='label-remind'>提醒</div>
          <p>通知簡訊可增加顧客對店家的信賴感，進而提升實際來店率，降低未出席率，系統會優先發送 Line 官方帳號通知，如顧客無法接收，將改發送手機簡訊，四種通知情境請參考下列說明。</p>
        </div>
        <div class='setting-box'>
          <div class='setting-box-title'>
            <p class='body1'>顧客通知簡訊</p>
          </div>
          <div class='setting-box-content'>
            <div v-for='(item, index) in settingItems' :key='index' class='setting-item'>
              <p class='body2'>{{ item.title }}</p>
              <p class='caption'>{{ item.description }}</p>
              <div class='preview-box'>
                <div class='preview-item'>
                  <img src='@/assets/images/icons/LINE.png' alt=''>
                  <a href='#'>預覽</a>
                  <div class='preview-content preview-content-line'>
                    <div class='top'>
                      <p>官方帳號個人服務通知</p>
                      <img src='@/assets/images/icons/notifications-line-bell.svg' alt=''>
                    </div>
                    <div class='content'>
                      <div class='title-box'>
                        <p class='content-title'>{{ item.notificationLine.title }}</p>
                        <p>{{ item.notificationLine.message }}</p>
                      </div>
                      <div class='list-box'>
                        <div class='list-item'>
                          <p>商家名稱</p>
                          <p>{{ companyName }}</p>
                        </div>
                        <div class='list-item'>
                          <p>預訂時間</p>
                          <p>{{ shopData.date }} {{ shopData.time }}</p>
                        </div>
                        <div class='list-item'>
                          <p>預訂人數</p>
                          <p>{{ shopData.people }}</p>
                        </div>
                        <div class='list-item'>
                          <p>商家地址</p>
                          <p>{{ userStore.storeAddress }}</p>
                        </div>
                        <div class='list-item'>
                          <p>商家電話</p>
                          <p>{{ userStore.storePhone }}</p>
                        </div>
                      </div>
                      <div class='btn-box'>
                        <div v-for='(button, buttonIndex) in item.notificationLine.buttons' :key='buttonIndex' class='btn'>{{ button }}</div>
                      </div>
                    </div>
                    <div class='bottom'>
                      <p>此訊息作為個人服務之通知，您可以點擊以參考相關說明。</p>
                    </div>
                  </div>
                </div>
                <div class='preview-item'>
                  <img src='@/assets/images/icons/message-text.svg' alt=''>
                  <a href='#'>預覽</a>
                  <div class='preview-content preview-content-sms'>
                    <p>{{ replaceNotificationSms(item.notificationSms.message, shopData) }}
                      <span class='sms-link'>{{ shopData.link }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { useTheme } from '@/stores/themeStore';
  import shopDataJson from '@/data/notificationShopData.json'; //簡訊預覽資料
  import {  getNotificationSettings, updateNotificationSettings } from '@/services/api/notifications';
  import { useTokenWatcher } from "@/composables/useTokenWatcher";
  import { useUserStore } from '@/stores/userStore';
  import { useAccountStore } from '@/stores/accountStore';

  const userStore = useUserStore();
  const accountStore = useAccountStore();

  // 是否為檢視模式
  const isViewOnly = ref(false);
  const GOOGLE_STATUS = 8;
  watch(
    () => accountStore.googleStatus,
    (newStatus) => {
      isViewOnly.value = newStatus === GOOGLE_STATUS;
    },
    { immediate: true }
  );

  // 灰底背景
  const themeStore = useTheme();
  const backgroundClass = computed(() => themeStore.backgroundClass);
  themeStore.setBackgroundClass('bg-gray');

  const companyName = ref('')
  const switchValue = ref(true);
  const shopData = ref(null);
  // const userName = ref('')
  const isLoading = ref(true);
  const error = ref(null);
  const isSettingsLoaded = ref(false);

  // 店家名稱Input
  const inputs = ref([
    { model: companyName, placeholder: '', locked: true }
  ]);

  // // 獲取店家資料
  // const fetchNotificationInfo = async () => {
  //   try {
  //     const response = await getNotificationInfo();
  //     if (response.success) {
  //       companyName.value = response.data.companyName;
  //     } else {
  //       console.error('Error fetchNotificationInfo:', response.message);
  //     }
  //   } catch (error) {
  //     console.error('Error fetchNotificationInfo:', error);
  //   }
  // };

  // 獲取店家通知設定
  const fetchNotificationSettings = async () => {
    try {
      const response = await getNotificationSettings();
      if (response.success) {
        switchValue.value = response.data.notificationStatus.enabled;
        companyName.value = response.data.companyName;
        isSettingsLoaded.value = true;
      } else {
        error.value = response.message;
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      error.value = '載入通知設定時出錯。請稍後再試。';
    }
  };


  // 確認彈窗預設值
  const popupVisibility = ref({1: false});

  // 跳出確認彈窗
  const confirmPopup = async (newValue) => {
    if (newValue === true) {
      popupVisibility.value[1] = true;
    } else {
      updateSettings(switchValue.value);
    }
  }
  watch(switchValue, confirmPopup);

  // 更新店家通知設定
  const updateSettings =  async (newValue) => {
    try {
      const response = await updateNotificationSettings({ enabled: newValue });
      if (response.success) {
        console.log('更新通知設定成功');
      } else {
        console.error('更新通知設定失敗:', response.message);
        switchValue.value = !newValue; // 恢復原值
      }
    } catch (err) {
      console.error('更新通知設定時出錯:', err);
      switchValue.value = !newValue; // 恢復原值
    }
  };

  // 簡訊預覽
  const settingItems = ref([
    {
      title: '1. 預訂通知',
      description: '※ 顧客預訂後，將收到通知簡訊。',
      notificationLine: {
        title: '訂位完成通知',
        message: '您已成功建立一筆訂位。如有其他訂位問題，歡迎與店家聯繫。以下為您的訂位資訊：',
        buttons: ['查看訂位資訊']
      },
      notificationSms: {
        message: '您已預訂【{shopName}】{date} {time} {people}人 '
      }
    },
    {
      title: '2. 提醒通知',
      description: '※ 顧客預訂到來前一天，將收到通知簡訊。',
      notificationLine: {
        title: '訂位通知提醒',
        message: '提醒您有一筆即將到來的訂位。請點選下方按鈕告知您要保留或取消。',
        buttons: ['保留訂位', '查看訂位資訊']
      },
      notificationSms: {
        message: '您於【{shopName}】的預訂為{date} {time} {people}人，如欲取消請點選 '
      }
    },
    {
      title: '3. 修改通知',
      description: '※ 顧客修改預訂後，將收到通知簡訊。',
      notificationLine: {
        title: '訂位變更通知',
        message: '您已成功建立一筆訂位。如有其他訂位問題，歡迎與店家聯繫。以下為您的訂位資訊：',
        buttons: ['查看訂位資訊']
      },
      notificationSms: {
        message: '您於【{shopName}】的預訂已更改為{date} {time} {people}人 '
      }
    },
    {
      title: '4. 取消通知',
      description: '※ 顧客取消預訂後，將收到通知簡訊。',
      notificationLine: {
        title: '訂位取消通知',
        message: '您的訂位已被取消。如有其他訂位問題，歡迎與店家聯繫。以下為您的訂位資訊：',
        buttons: ['查看訂位資訊']
      },
      notificationSms: {
        message: '您於【{shopName}】{date} {time} {people}人訂位已取消 '
      }
    }
  ]);

  // 獲取簡訊預覽店家假資料
  const fetchShopData = async () => {
    try {
      isLoading.value = true;
      shopData.value = shopDataJson; //串接假資料
    } catch (err) {
      console.error('Error fetching shop data:', err);
      error.value = '載入資料時出錯。請稍後再試。';
    } finally {
      isLoading.value = false;
    }
  };

  // 簡訊預覽店家資料替換
  const replaceNotificationSms = (message, shopData) => {
    return message
      .replace('{shopName}', companyName.value)
      .replace('{date}', shopData.date)
      .replace('{time}', shopData.time)
      .replace('{people}', shopData.people);
  };

  onMounted(() => {
    // fetchNotificationInfo();
    fetchShopData();
    fetchNotificationSettings();
  })

  // 使用 token 監視器
  // useTokenWatcher(fetchNotificationInfo);
  useTokenWatcher(fetchNotificationSettings);

  import { useRouter } from 'vue-router';
  const router = useRouter();
  const navigateToConsultation = () => {
    router.push({
      name: 'AccountSettings',
      query: { tab: 4, category: 'notification-consultation' }
    });
  };
</script>

<style lang="scss" scoped>
  @use '@/assets/scss/pages/notifications/_settings.scss' as *;
</style>