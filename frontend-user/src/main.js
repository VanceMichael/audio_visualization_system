import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import './styles/global.scss'
import { installErrorHandler } from './utils/errorHandler'
import { createLogger } from './utils/logger'

const logger = createLogger('Main')

logger.info('Application starting...')

const app = createApp(App)
const pinia = createPinia()

// 安装全局错误处理器
installErrorHandler(app)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(ElementPlus)
app.mount('#app')

logger.info('Application mounted successfully')
