import { settingMeta } from '@/router/config/metaConfig';
import NotificationOverview from '@/views/Notifications/Overview.vue';
import NotificationPurchase from '@/views/Notifications/Purchase.vue';
import NotificationSettings from '@/views/Notifications/Settings.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

export default [
  {
    path: '/notifications', component: DefaultLayout, redirect: '/notifications/overview',
    children: [
      {
        path: 'overview', name: 'NotificationOverview', component: NotificationOverview,
        meta: settingMeta({
          title: 'Restaurant Booking通知總覽',
          pageTitle: '通知總覽',
          dynamicTitle: 'Restaurant Booking - 通知總覽',
          dynamicDescription: '通知總覽頁面',
          dynamicOgDescription: '通知總覽頁面og描述',
          keyword: '通知,總覽',
        }),
      },
      {
        path: 'purchase', name: 'NotificationPurchase', component: NotificationPurchase,
        meta: settingMeta({
          title: 'Restaurant Booking通知總覽',
          pageTitle: '通知總覽',
          dynamicTitle: 'Restaurant Booking - 通知總覽',
          dynamicDescription: '通知總覽頁面',
          dynamicOgDescription: '通知總覽頁面og描述',
          keyword: '通知,總覽',
        }),
      },
      {
        path: 'settings', name: 'NotificationSettings', component: NotificationSettings,
        meta: settingMeta({
          title: 'Restaurant Booking通知設定',
          pageTitle: '通知設定',
          dynamicTitle: 'Restaurant Booking - 通知設定',
          dynamicDescription: '通知設定頁面',
          dynamicOgDescription: '通知設定頁面og描述',
          keyword: '通知,設定',
        }),
      }
    ],
  },
];