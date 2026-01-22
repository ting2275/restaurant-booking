import { settingMeta } from '@/router/config/metaConfig';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

import AccountSettings from '@/views/AccountSettings/Main.vue';

export default [
    {
        path: '/account-settings', component: DefaultLayout,
        children: [
            {
                path: '', name: 'AccountSettings', component: AccountSettings,
                meta: settingMeta({
                    title: '帳號設定',
                    pageTitle: '帳號設定',
                    description: '帳號設定',
                    ogDescription: '帳號設定',
                }),
            },


        ],
    }
];