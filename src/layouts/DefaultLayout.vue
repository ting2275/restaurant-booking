<script>
import { ref, computed, provide, watch } from 'vue';
import { useTheme } from '@/stores/themeStore';
import { useRouter } from 'vue-router';
import { useSystemStore } from '@/stores/systemStore';
import { useAccountStore } from '@/stores/accountStore';
import { useUserRole } from '@/composables/useUserRole';
import DynamicHeader from '@/components/TopBar/Header.vue';
import SideBar from '@/components/Navigation/SideBar/SideBar.vue';

import PopUpLayerContainer from '@/components/PopUpContainer/PopUpContainer.vue';
import { useAccountStatePopup } from '@/composables/useAccountStatePopup';
import FirstSettingPopUp from '@/layouts/accountNotifyPopup/FirstSettingPopUp.vue';
import LowPointPopUp from '@/layouts/accountNotifyPopup/LowPointPopUp.vue';
import ExSpendPopUp from '@/layouts/accountNotifyPopup/ExSpendPopUp.vue';

export default {
  name: 'DefaultLayout',
  components: {
    DynamicHeader,
    SideBar,
    PopUpLayerContainer,
    FirstSettingPopUp,
    LowPointPopUp,
    ExSpendPopUp,
  },
  setup() {
    const router = useRouter();
    const themeStore = useTheme();
    const systemStore = useSystemStore();
    const backgroundClass = computed(() => themeStore.backgroundClass);
    const isExpanded = ref(false);
    const toggleSidebar = () => {
      isExpanded.value = !isExpanded.value;
    };

    const accountStore = useAccountStore();
    const differenceDay = ref(accountStore.differenceDay);
    const solutionEndDay = ref(accountStore.solution.solutionEndDay);
    const { showIsFirstPopup, showIsLowPopup, showIsExSpendPopup } = useAccountStatePopup();
    const { isAdmin, isManager, isStaff } = useUserRole();

    const navigateToConsultation = () => {
      let tabIndex;
      if (isAdmin.value) {
        tabIndex = 4;
      } else if (isManager.value) {
        tabIndex = 3;
      } else if (isStaff.value) {
        tabIndex = 1;
      } else {
        tabIndex = 0;
      }
      router.push({
        name: 'AccountSettings',
        query: { tab: tabIndex, category: 'contract-consultation' }
      });
    };

    const notifications = computed(() => {
      const results = [];
      if (differenceDay.value <= 30) {
        results.push({
          type: 'contractReminder',
          message: `您的合約將於 ${solutionEndDay.value} 到期，如有合約問題請填寫問題諮詢 >>`,
          action: navigateToConsultation,
        });
      }
      return results;
    });

    watch(
      () => accountStore.differenceDay,
      (newDifferenceDay) => {
        differenceDay.value = newDifferenceDay;
        solutionEndDay.value = accountStore.solution.solutionEndDay;
      }
    )

    watch(notifications, (newNotifications) => {
      systemStore.setIsContractNotification(newNotifications.length > 0);
    });

    router.afterEach((to, from) => {
      if (to.path !== from.path) {
        if (isExpanded.value) {
          isExpanded.value = false;
        }
      }
    });

    // 滾動至頁面最上方
    const mainRef = ref(null);
    const scrollToTop = () => {
      if (mainRef.value) {
        mainRef.value.scrollTo(0,0);
      }
    };
    provide('scrollToTop', scrollToTop);

    return {
      isExpanded,
      toggleSidebar,
      backgroundClass,
      notifications,
      navigateToConsultation,
      mainRef,
      showIsFirstPopup,
      showIsLowPopup,
      showIsExSpendPopup,
    };
  },
};

</script>

<template>
  <div :class="['main-page', backgroundClass]">
    <DynamicHeader @toggle-sidebar='toggleSidebar' />
    <div class='content-wrapper'>
      <transition name='fade'>
        <div v-show='notifications.length' class='fullWidth-notify'>
          <div v-for='(notification, index) in notifications' :key='index'>
            <template v-if='notification.type === "contractReminder"'>
              {{ notification.message }}
              <router-link class='link' to='/' @click.prevent='notification.action'>前往詢問</router-link>
            </template>
          </div>
        </div>
      </transition>
      <div v-if='isExpanded' class='backdrop' @click='toggleSidebar'></div>
      <SideBar :is-expanded='isExpanded' @toggle-sidebar='toggleSidebar' />
      <main ref='mainRef'>
        <router-view />
      </main>
      <PopUpLayerContainer />
    </div>
  </div>
  <!-- 確認店家營業設定 -->
  <FirstSettingPopUp v-if='showIsFirstPopup' v-model:visible='showIsFirstPopup' />
  <!-- 可用單數即將使用完畢 -->
  <LowPointPopUp v-if='showIsLowPopup' v-model:visible='showIsLowPopup' />
  <!-- 超額單數繳費通知 -->
  <ExSpendPopUp v-if='showIsExSpendPopup' v-model:visible='showIsExSpendPopup' />
</template>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
