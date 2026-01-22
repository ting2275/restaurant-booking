import { settingMeta } from '@/router/config/metaConfig';
import BookingOverview from '@/views/Booking/Overview.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

export default [
  {
    path: '/booking', component: DefaultLayout, redirect: '/booking/overview',
    children: [
      {
        path: 'overview', name: 'BookingOverview', component: BookingOverview,
        meta: settingMeta({
          title: 'Restaurant Booking預訂總覽',
          pageTitle: '預訂總覽',
          dynamicTitle: 'Restaurant Booking - 預訂總覽',
          dynamicDescription: '預訂總覽頁面',
          dynamicOgDescription: '預訂總覽頁面og描述',
          keyword: '預訂,總覽',
        }),
      }
    ],
  },
];