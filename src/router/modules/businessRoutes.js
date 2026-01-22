import { settingMeta } from '@/router/config/metaConfig'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BusinessSettings from '@businessSettings/Main.vue'
import TableManagement from '@businessSettings/Tables/TableManagement.vue'

export default [
  {
    path: '/business-settings',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'BusinessSettings',
        component: BusinessSettings,
        meta: settingMeta({
          requiresEditingCheck: true,
          title: '店家營業設定',
          pageTitle: '店家營業設定',
          description: '店家營業設定',
          ogDescription: '店家營業設定'
        })
      },
      {
        path: 'table-management/:areaId/:areaName',
        name: 'TableManagement',
        component: TableManagement,
        meta: settingMeta({
          requiresEditingCheck: true,
          title: '店家營業設定',
          pageTitle: '店家營業設定',
          description: '店家營業設定',
          ogDescription: '店家營業設定'
        }),
        props: true
      }
    ]
  }
]
