import { settingMeta } from '@/router/config/metaConfig';
import HistoryOverview from '@/views/History/Overview.vue';
// import HistoryDetails from '@/views/History/Details.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

export default [
  {
    path: '/history', component: DefaultLayout, redirect: '/history/overview',
    children: [
      {
        path: 'overview', name: 'HistoryOverview', component: HistoryOverview,
        meta: settingMeta({
          title: 'Restaurant Booking預訂歷史',
          pageTitle: '預訂歷史',
          dynamicTitle: 'Restaurant Booking - 預訂歷史',
          dynamicDescription: '預訂歷史頁面',
          dynamicOgDescription: '預訂歷史頁面og描述',
          keyword: '預訂,歷史',
        }),
      }
    ],
  },
];