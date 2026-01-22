import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'

import App from '@/App.vue'
import piniaPersistedState from 'pinia-plugin-persistedstate'
import router from '@/router'
import registerGlobalComponents from '@/components'
import '@/assets/scss/main.scss'
import '@/assets/scss/components/input/_phoneInput.scss'
import { useSystemStore } from '@/stores/systemStore';

const app = createApp(App)
const head = createHead()
registerGlobalComponents(app)
const pinia = createPinia()
pinia.use(piniaPersistedState)
app.use(router)
app.use(head)
app.use(pinia)
app.mount('#app')

const env = import.meta.env.VITE_APP_ENV || 'production';
console.log(`當前運行環境: ${env}`);
if (env === 'development') {
  app.config.devtools = true;
}

const systemStore = useSystemStore();
systemStore.setImageBaseUrl();

//PhoneInput用
import 'flag-icons/css/flag-icons.min.css';
import 'v-phone-input/dist/v-phone-input.css';
import { createVPhoneInput } from 'v-phone-input';
import { VAutocomplete } from 'vuetify/components';
import { createVuetify } from 'vuetify';

const vuetify = createVuetify();
const vPhoneInput = createVPhoneInput({
    countryIconMode: 'svg',
    enableSearchingCountry: true,
    persistentPlaceholder: true,
    defaultCountry: 'TW',
    label: '',
    countryLabel: '',
    invalidMessage: '',
    placeholder: '請輸入您的電話',
});

app.use(vuetify);
app.component('VAutocomplete', VAutocomplete);
app.use(vPhoneInput);