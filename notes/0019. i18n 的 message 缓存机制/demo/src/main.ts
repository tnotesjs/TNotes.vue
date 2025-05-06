import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: ['en'],

  messages: {
    // en 由程序运行过程中动态插入到 messages 中
    // en: {
    //   message: {
    //     greeting: 'hello world',
    //   },
    // },
    // zh-CN 是系统默认的语言，首次启动时默认就加载 zh-CN
    'zh-CN': {
      message: {
        greeting: '你好，世界',
      },
    },
  },
})

const app = createApp(App)

app.use(i18n)

app.mount('#app')
