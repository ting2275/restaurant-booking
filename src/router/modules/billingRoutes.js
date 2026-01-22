import { settingMeta } from '@/router/config/metaConfig';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import BillingArea from '@/views/BillingArea/Main.vue';

export default [
    {
        path: '/billing-area',component: DefaultLayout,
        children: [
            {
                path: '', name: 'BillingArea', component: BillingArea,
                meta: settingMeta({
                    requiresEditingCheck: true,
                    title: '帳務專區',
                    pageTitle: '帳務專區',
                    description: '帳務專區',
                    ogDescription: '帳務專區',
                }),
            },
        ],
    }   
];