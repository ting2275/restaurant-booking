import { settingMeta } from '@/router/config/metaConfig';
import Login from '@/views/Authentication/LoginPage.vue';
import ForgotPassword from '@/views/Authentication/ForgotPassword.vue';
import ForgotAccount from '@/views/Authentication/ForgotAccount.vue';
import ContactUs from '@/views/ContactUs/Register.vue';
import NewMemberPassword from '@/views/Authentication/NewMemberPassword.vue';
import PaymentMain from '@/views/Payment/Main.vue';
import PaymentResult from '@/views/Payment/CardResult_success.vue';
import PaymentResultFallback from '@/views/Payment/CardResult_failed.vue';

export default [
  {
    path: '/login', name: 'Login', component: Login,
    meta: settingMeta({
      requiresAuth: false,
      title: 'Restaurant Booking用戶登入',
      pageTitle: '登入',
      dynamicTitle: 'Restaurant Booking - 用戶登入',
      dynamicDescription: 'Restaurant Booking用戶登入',
      dynamicOgDescription: 'Restaurant Booking用戶登入og描述',
    })
  },
  {
    path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword,
    meta: settingMeta({
      requiresAuth: false,
      title: 'Restaurant Booking用戶登入',
      pageTitle: '忘記密碼',
      dynamicTitle: 'Restaurant Booking - 忘記密碼',
      dynamicDescription: 'Restaurant Booking用戶登入',
      dynamicOgDescription: 'Restaurant Booking用戶登入og描述',
    })
  },
  {
    path: '/forgot-account', name: 'ForgotAccount', component: ForgotAccount,
    meta: settingMeta({
      requiresAuth: false,
      title: 'Restaurant Booking用戶登入',
      pageTitle: '忘記帳號',
      dynamicTitle: 'Restaurant Booking - 忘記帳號',
      dynamicDescription: 'Restaurant Booking用戶登入',
      dynamicOgDescription: 'Restaurant Booking用戶登入og描述',
    })
  },
  {
    path: '/contact-us', name: 'ContactUs', component: ContactUs,
    meta: settingMeta({
      requiresAuth: false,
      title: 'Restaurant Booking聯絡我們',
      pageTitle: '聯絡我們',
      dynamicTitle: 'Restaurant Booking - 聯絡我們',
      dynamicDescription: 'Restaurant Booking聯絡我們',
      dynamicOgDescription: 'Restaurant Booking聯絡我們og描述',
    })
  },
  {
    path: '/member-reset-password', name: 'NewMemberPassword', component: NewMemberPassword,
    meta: settingMeta({
      title: 'Restaurant Booking用戶設定密碼',
      pageTitle: '新成員設定密碼',
      dynamicTitle: 'Restaurant Booking - 設定密碼',
      dynamicDescription: 'Restaurant Booking用戶設定密碼',
      dynamicOgDescription: 'Restaurant Booking用戶設定密碼og描述',
    })
  },
  {
    // 合約續約付款流程
    path: '/payment-verify-contract', name: 'PaymentVerifyContract', component: PaymentMain,
    meta: settingMeta({
      requiresAuth: false,
      title: 'Restaurant Booking合約付款流程',
      pageTitle: '合約付款流程',
      dynamicTitle: 'Restaurant Booking - 合約付款流程',
      dynamicDescription: '',
      dynamicOgDescription: '',
    }),
  },
  {
    // 超額訂單付款流程
    path: '/payment-verify-over-booking', name: 'PaymentVerifyOverBooking', component: PaymentMain,
    meta: settingMeta({
      requiresAuth: false,
      title: 'Restaurant Booking超額訂單付款流程',
      pageTitle: '超額訂單付款流程',
      dynamicTitle: 'Restaurant Booking - 超額訂單付款流程',
      dynamicDescription: '',
      dynamicOgDescription: '',
    }),
  },
  {
    // ATM付款流程
    path: '/payment-atm-transfer-details', name: 'PaymentATMTransferDetails', component: PaymentMain,
    meta: settingMeta({
      requiresAuth: false,
      title: 'ATM付款流程',
      pageTitle: 'ATM付款流程',
      dynamicTitle: 'Restaurant Booking - ATM付款流程',
      dynamicDescription: '',
      dynamicOgDescription: '',
    }),
  },
  {
    // 付款結果成功(僅信用卡)
    path: '/payment-result', name: 'PaymentResult', component: PaymentResult,
    meta: settingMeta({
      requiresAuth: false,
      title: 'Restaurant Booking付款結果',
      pageTitle: '付款結果成功',
      dynamicTitle: 'Restaurant Booking - 付款結果成功',
      dynamicDescription: '',
      dynamicOgDescription: '',
    }),
  },
  {
    // 付款結果失敗(僅信用卡)
    path: '/payment-result-fallback', name: 'PaymentResultFallback', component: PaymentResultFallback,
    meta: settingMeta({
      requiresAuth: false,
      title: 'Restaurant Booking付款結果',
      pageTitle: '付款結果失敗',
      dynamicTitle: 'Restaurant Booking - 付款結果失敗',
      dynamicDescription: '',
      dynamicOgDescription: '',
    }),
  }
]
