import { settingMeta } from '@/router/config/metaConfig';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import PaymentCallback from '@/views/Payment/PaymentCallback.vue';

export default [
  {
    path: '/order', component: DefaultLayout,
    children: [
      {
        path: 'payment-callback', name: 'PaymentCallback', component: PaymentCallback,
        meta: settingMeta({
          title: 'Restaurant Booking付款結果',
          pageTitle: '付款結果',
          dynamicTitle: 'Restaurant Booking - 付款結果',
          dynamicDescription: '付款結果頁面',
          dynamicOgDescription: '付款結果頁面og描述',
        }),
      },
    ],
  }
];