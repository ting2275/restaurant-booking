import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import piniaPersistedState from 'pinia-plugin-persistedstate'
import router from '@/router'

export function registerPlugins(app) {
  const pinia = createPinia()
  pinia.use(piniaPersistedState)

  const head = createHead()

  app.use(pinia)
  app.use(router)
  app.use(head)
}