import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getBasePath = env => {
  switch (env) {
    case 'production':
      return '/Book/'
    default:
      return '/'
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const basePath = env.VITE_BASE_PATH || getBasePath(env.VITE_APP_ENV)
  const isDevelopment = mode === 'development'

  console.log('Base Path:', env.VITE_BASE_PATH)
  console.log('Environment Variables:', env)

  const excludeFiles = isDevelopment
    ? []
    : [
        'src/views/CalendarGuide.vue',
        'src/views/CheckBoxGuide.vue',
        'src/views/InputGuide.vue',
        'src/views/PaginationGuide.vue',
        'src/views/PopupGuide.vue',
        'src/views/RadioBoxGuide.vue',
        'src/views/SwitchboxGuide.vue',
        'src/views/Test.vue'
      ]

  return {
    base: basePath,
    server: isDevelopment
      ? {
          host: process.env.VITE_DEV_HOST,
          port: process.env.VITE_DEV_PORT
        }
      : undefined,
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    },
    plugins: [
      vue(),
      {
        name: 'exclude-files',
        apply: 'build',
        enforce: 'pre',
        resolveId(id) {
          if (!isDevelopment && excludeFiles.some(file => id.endsWith(file))) {
            return '\0null'
          }
          return null
        },
        load(id) {
          if (id === '\0null') {
            return 'export default {};'
          }
          return null
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@businessSettings': path.resolve(__dirname, './src/views/BusinessSettings')
      }
    },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `
            @use "@/assets/scss/shared/index" as *;
          `
        }
      }
    }
  }
})
