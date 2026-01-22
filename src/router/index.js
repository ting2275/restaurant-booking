import { createRouter, createWebHistory } from 'vue-router';
import { checkAuth } from './config/checkAuth';
import authRoutes from './modules/authRoutes';
import bookingRoutes from './modules/bookingRoutes';
import historyRoutes from './modules/historyRoutes';
import notificationRoutes from './modules/notificationRoutes';
import businessRoutes from './modules/businessRoutes';
import accountRoutes from './modules/accountRoutes';
// import orderRoutes from './modules/orderRoutes';
import PopupGuide from '../views/PopupGuide.vue';
import CalendarGuide from '../views/CalendarGuide.vue';
import CheckBoxGuide from '../views/CheckboxGuide.vue';
import RadioBoxGuide from '../views/RadioBoxGuide.vue';
import SwitchBoxGuide from '../views/SwitchboxGuide.vue';
import PaginationGuide from '../views/PaginationGuide.vue';
import InputGuide from '../views/InputGuide.vue';
import ButtonGuide from '../views/ButtonGuide.vue';
import billingRoutes from './modules/billingRoutes';

const isDevelopment = import.meta.env.MODE === 'development';

const routes = [
  { path: '/', redirect: '/booking/overview' },
  ...(isDevelopment ? [
    { path: '/popup-guide', name: 'PopupGuide', component: PopupGuide, meta: { requiresAuth: false } },
    { path: '/calendar-guide', name: 'CalendarGuide', component: CalendarGuide, meta: { requiresAuth: false } },
    { path: '/checkbox-guide', name: 'CheckBoxGuide', component: CheckBoxGuide, meta: { requiresAuth: false } },
    { path: '/radiobox-guide', name: 'RadioBoxGuide', component: RadioBoxGuide, meta: { requiresAuth: false } },
    { path: '/switchbox-guide', name: 'SwitchBoxGuide', component: SwitchBoxGuide, meta: { requiresAuth: false } },
    { path: '/pagination-guide', name: 'PaginationGuide', component: PaginationGuide, meta: { requiresAuth: false } },
    { path: '/input-guide', name: 'InputGuide', component: InputGuide, meta: { requiresAuth: false } },
    { path: '/button-guide', name: 'ButtonGuide', component: ButtonGuide, meta: { requiresAuth: false } },
  ] : []),
  ...authRoutes,
  ...bookingRoutes,
  ...historyRoutes,
  ...notificationRoutes,
  ...businessRoutes,
  ...accountRoutes,
  // ...orderRoutes,
  ...billingRoutes,
]
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes
});

router.beforeEach(checkAuth);


export default router;