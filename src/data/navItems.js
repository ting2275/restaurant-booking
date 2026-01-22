const basePath = import.meta.env.VITE_APP_ENV === 'production' ? import.meta.env.VITE_BASE_PATH : '';
import { joinPath } from '@/utils';
export const userGuidePath = joinPath(basePath, 'user-guide/user-guide.pdf');

export const navItems = {
  admin: [
    { id: 1, text: '預訂總覽', path: '/booking', icon: 'tableware', type: 'nav' },
    { id: 2, text: '預訂歷史', path: '/history', icon: 'history', type: 'nav' },
    {
      id: 3, text: '通知中心', path: '/notifications', icon: 'message', type: 'nav', children: [
        { id: 31, text: '通知總覽', path: '/notifications/overview' },
        { id: 32, text: '通知設定', path: '/notifications/settings' }
      ]
    },
    { id: 4, text: '店家營業設定', path: '/business-settings', icon: 'shop', type: 'nav' },
    { id: 5, text: '使用手冊', path: userGuidePath, target: '_blank', icon: 'faq', type: 'setting' },
    { id: 6, text: '帳務專區', path: '/billing-area', icon: 'bill', type: 'setting' },
    { id: 7, text: '帳號設定', path: '/account-settings', icon: 'setting', type: 'setting' },
    { id: 8, text: '登出', path: '/', icon: 'logout', type: 'setting' }
  ],
  manager: [
    { id: 1, text: '預訂總覽', path: '/booking', icon: 'tableware', type: 'nav' },
    { id: 2, text: '預訂歷史', path: '/history', icon: 'history', type: 'nav' },
    {
      id: 3, text: '通知中心', path: '/notifications', icon: 'message', type: 'nav', children: [
        { id: 31, text: '通知總覽', path: '/notifications/overview' },
        { id: 32, text: '通知設定', path: '/notifications/settings' }
      ]
    },
    { id: 4, text: '店家營業設定', path: '/business-settings', icon: 'shop', type: 'nav' },
    { id: 5, text: '使用手冊', path: userGuidePath, target: '_blank', icon: 'faq', type: 'setting' },
    { id: 6, text: '帳務專區', path: '/billing-area', icon: 'bill', type: 'setting' },
    { id: 7, text: '帳號設定', path: '/account-settings', icon: 'setting', type: 'setting' },
    { id: 8, text: '登出', path: '/', icon: 'logout', type: 'setting' }
  ],
  staff: [
    { id: 1, text: '預訂總覽', path: '/booking', icon: 'tableware', type: 'nav' },
    { id: 2, text: '使用手冊', path: userGuidePath, target: '_blank', icon: 'faq', type: 'setting' },
    { id: 3, text: '帳號設定', path: '/account-settings', icon: 'setting', type: 'setting' },
    { id: 4, text: '登出', path: '/', icon: 'logout', type: 'setting' }
  ],
  default: [
    { id: 1, text: '預訂總覽', path: '/booking', icon: 'tableware', type: 'nav' }
  ]
};