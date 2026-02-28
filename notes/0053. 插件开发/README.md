# [0053. 插件开发](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0053.%20%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue 插件的编写规范是什么？如何创建一个插件？](#3--vue-插件的编写规范是什么如何创建一个插件)
- [4. 🤔 如何为插件添加全局属性和方法？](#4--如何为插件添加全局属性和方法)
- [5. 🤔 如何发布和使用自己开发的 Vue 插件？](#5--如何发布和使用自己开发的-vue-插件)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 插件的编写规范
- 为插件添加全局属性与方法
- 发布与使用插件

## 2. 🫧 评价

- todo

## 3. 🤔 Vue 插件的编写规范是什么？如何创建一个插件？

Vue 插件是一种向 Vue 应用全局添加功能的机制。插件可以是一个拥有 install 方法的对象，也可以直接是一个 install 函数。通过 app.use() 来安装插件。

插件的基本结构：

```js
// 方式一：对象形式
const myPlugin = {
  install(app, options) {
    // app 是 Vue 应用实例
    // options 是 app.use(myPlugin, options) 传入的选项

    // 1. 注册全局组件
    app.component('MyGlobalComponent', {
      /* ... */
    })

    // 2. 注册全局指令
    app.directive('my-directive', {
      /* ... */
    })

    // 3. 注入全局属性
    app.config.globalProperties.$myMethod = () => {}

    // 4. 通过 provide 提供值
    app.provide('myInjection', options)
  },
}

// 方式二：函数形式
function myPlugin(app, options) {
  // 与对象形式的 install 相同
}

// 使用
app.use(myPlugin, { someOption: true })
```

一个完整的实战示例——全局通知插件：

```js
// plugins/notification/index.js
import { reactive } from 'vue'
import NotificationContainer from './NotificationContainer.vue'

// 通知状态
const state = reactive({
  notifications: [],
})

let notificationId = 0

// 通知管理方法
const notify = {
  success(message, duration = 3000) {
    return addNotification({ type: 'success', message, duration })
  },
  error(message, duration = 5000) {
    return addNotification({ type: 'error', message, duration })
  },
  warning(message, duration = 4000) {
    return addNotification({ type: 'warning', message, duration })
  },
  info(message, duration = 3000) {
    return addNotification({ type: 'info', message, duration })
  },
}

function addNotification({ type, message, duration }) {
  const id = ++notificationId
  state.notifications.push({ id, type, message })

  if (duration > 0) {
    setTimeout(() => removeNotification(id), duration)
  }

  return id
}

function removeNotification(id) {
  const index = state.notifications.findIndex((n) => n.id === id)
  if (index > -1) {
    state.notifications.splice(index, 1)
  }
}

// 插件定义
export default {
  install(app, options = {}) {
    // 注册全局组件
    app.component('NotificationContainer', NotificationContainer)

    // 通过 globalProperties 暴露（选项式 API 中通过 this.$notify 访问）
    app.config.globalProperties.$notify = notify

    // 通过 provide 暴露（组合式 API 中通过 inject 访问）
    app.provide('notify', notify)
    app.provide('notificationState', state)

    // 合并用户选项
    if (options.position) {
      state.position = options.position
    }
  },
}

// 导出 composable（推荐的使用方式）
export function useNotification() {
  return { notify, state }
}
```

```html
<!-- plugins/notification/NotificationContainer.vue -->
<template>
  <div class="notification-container">
    <TransitionGroup name="notification">
      <div
        v-for="n in state.notifications"
        :key="n.id"
        :class="['notification', `notification--${n.type}`]"
      >
        {{ n.message }}
        <button @click="remove(n.id)">&times;</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
  import { inject } from 'vue'

  const state = inject('notificationState')
  const { notify } = inject('notify') ?? {}

  function remove(id) {
    const index = state.notifications.findIndex((n) => n.id === id)
    if (index > -1) state.notifications.splice(index, 1)
  }
</script>
```

使用插件：

```js
// main.js
import NotificationPlugin from './plugins/notification'

app.use(NotificationPlugin, { position: 'top-right' })
```

```html
<!-- 在组件中使用 -->
<script setup>
  import { useNotification } from '@/plugins/notification'

  const { notify } = useNotification()

  function handleSave() {
    try {
      // ... 保存操作
      notify.success('保存成功')
    } catch (e) {
      notify.error('保存失败：' + e.message)
    }
  }
</script>
```

## 4. 🤔 如何为插件添加全局属性和方法？

Vue 3 提供了多种方式为应用全局注入属性和方法，每种方式适用于不同的场景。

方式一：app.config.globalProperties——适用于选项式 API：

```js
// plugins/api.js
export default {
  install(app, options) {
    // 添加全局属性
    app.config.globalProperties.$appName = 'My App'

    // 添加全局方法
    app.config.globalProperties.$formatDate = (date, format = 'YYYY-MM-DD') => {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // 添加全局 $http 方法
    app.config.globalProperties.$http = {
      get: (url) => fetch(url).then((r) => r.json()),
      post: (url, data) =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then((r) => r.json()),
    }
  },
}
```

```html
<!-- 在选项式 API 中使用 -->
<script>
  export default {
    mounted() {
      console.log(this.$appName) // 'My App'
      console.log(this.$formatDate(new Date()))
      this.$http.get('/api/data')
    },
  }
</script>

<!-- 在模板中使用 -->
<template>
  <p>{{ $appName }}</p>
  <p>{{ $formatDate(createdAt) }}</p>
</template>
```

在 script setup 中访问 globalProperties 需要通过 getCurrentInstance：

```html
<script setup>
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
proxy.$formatDate(new Date())
```

方式二：app.provide / inject——推荐的组合式 API 方式：

```js
// plugins/i18n-simple.js
import { ref, computed } from 'vue'

export default {
  install(app, options) {
    const locale = ref(options.defaultLocale || 'zh-CN')
    const messages = options.messages || {}

    function t(key) {
      return messages[locale.value]?.[key] || key
    }

    function setLocale(newLocale) {
      locale.value = newLocale
    }

    // 提供给所有后代组件
    app.provide('i18n', {
      locale: computed(() => locale.value),
      t,
      setLocale,
    })
  },
}
```

```html
<script setup>
  import { inject } from 'vue'

  const { t, setLocale } = inject('i18n')
</script>

<template>
  <h1>{{ t('greeting') }}</h1>
  <button @click="setLocale('en')">English</button>
</template>
```

方式三：导出 Composable 函数——最灵活的方式：

```js
// plugins/useLogger.js
let loggerInstance = null

export function createLogger(options = {}) {
  return {
    install(app) {
      loggerInstance = {
        log: (...args) => {
          if (options.debug) console.log('[LOG]', ...args)
        },
        warn: (...args) => console.warn('[WARN]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
      }
      app.provide('logger', loggerInstance)
    },
  }
}

// Composable 函数
export function useLogger() {
  if (!loggerInstance) {
    throw new Error('Logger 插件未安装，请先调用 app.use(createLogger())')
  }
  return loggerInstance
}
```

TypeScript 类型增强（让 globalProperties 有类型提示）：

```ts
// types/global.d.ts
declare module 'vue' {
  interface ComponentCustomProperties {
    $appName: string
    $formatDate: (date: Date | string, format?: string) => string
    $http: {
      get: <T>(url: string) => Promise<T>
      post: <T>(url: string, data: unknown) => Promise<T>
    }
  }
}

export {}
```

## 5. 🤔 如何发布和使用自己开发的 Vue 插件？

将 Vue 插件发布为 npm 包需要考虑项目结构、构建配置、类型声明和文档。

项目结构：

```
vue-plugin-my-feature/
  src/
    index.js          # 插件入口
    components/       # 组件
    directives/       # 指令
    composables/      # 组合式函数
  dist/               # 构建产物
  types/              # TypeScript 类型声明
    index.d.ts
  package.json
  README.md
  LICENSE
  vite.config.js      # 库模式构建配置
```

使用 Vite 库模式构建：

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'MyVuePlugin',
      fileName: (format) => `my-vue-plugin.${format}.js`,
    },
    rollupOptions: {
      // 不打包 vue（使用宿主项目的 vue）
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

package.json 配置：

```json
{
  "name": "vue-plugin-my-feature",
  "version": "1.0.0",
  "description": "A Vue 3 plugin for ...",
  "type": "module",
  "main": "./dist/my-vue-plugin.umd.js",
  "module": "./dist/my-vue-plugin.es.js",
  "types": "./types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/my-vue-plugin.es.js",
      "require": "./dist/my-vue-plugin.umd.js",
      "types": "./types/index.d.ts"
    }
  },
  "files": ["dist", "types"],
  "peerDependencies": {
    "vue": "^3.2.0"
  },
  "keywords": ["vue", "vue3", "plugin"],
  "license": "MIT",
  "scripts": {
    "build": "vite build",
    "prepublishOnly": "npm run build"
  }
}
```

类型声明文件：

```ts
// types/index.d.ts
import { Plugin, Ref, ComputedRef } from 'vue'

export interface MyPluginOptions {
  debug?: boolean
  locale?: string
}

export interface MyFeature {
  count: Ref<number>
  doubleCount: ComputedRef<number>
  increment: () => void
}

declare const MyPlugin: Plugin
export default MyPlugin

export declare function useMyFeature(): MyFeature
```

发布到 npm：

```bash
# 登录 npm
npm login

# 发布
npm publish

# 发布带 scope 的包
npm publish --access public
```

用户安装和使用：

```bash
npm install vue-plugin-my-feature
```

```js
import { createApp } from 'vue'
import MyPlugin from 'vue-plugin-my-feature'
import { useMyFeature } from 'vue-plugin-my-feature'

const app = createApp(App)
app.use(MyPlugin, { debug: true })
```
