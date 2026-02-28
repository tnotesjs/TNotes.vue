# [0058. 服务端渲染（SSR）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0058.%20%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93%EF%BC%88SSR%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 CSR、SSR 和 SSG 分别是什么？有什么区别？](#3--csrssr-和-ssg-分别是什么有什么区别)
- [4. 🤔 Vue SSR 的原理是什么？有哪些需要注意的挑战？](#4--vue-ssr-的原理是什么有哪些需要注意的挑战)
- [5. 🤔 Vue Router 在 SSR 中如何使用？](#5--vue-router-在-ssr-中如何使用)
- [6. 🤔 SSR 中的状态管理如何处理注水和脱水？](#6--ssr-中的状态管理如何处理注水和脱水)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- CSR vs SSR vs SSG
- Vue 的 SSR 原理与挑战
- 使用 Vue Router 进行 SSR
- 状态管理在 SSR 中的处理（store 注水与脱水）

## 2. 🫧 评价

- todo

## 3. 🤔 CSR、SSR 和 SSG 分别是什么？有什么区别？

CSR（Client-Side Rendering，客户端渲染）、SSR（Server-Side Rendering，服务端渲染）和 SSG（Static Site Generation，静态站点生成）是三种不同的页面渲染策略。

CSR——传统的 SPA 模式。浏览器请求 HTML 时只获得一个空壳（只有一个 div#app），然后下载 JavaScript Bundle，在客户端执行 JS 来生成和渲染全部 DOM 内容：

```
用户请求 -> 服务器返回空 HTML -> 下载 JS -> 执行 JS -> 渲染页面 -> 请求 API 数据 -> 更新页面
```

```html
<!-- CSR 返回的 HTML -->
<!DOCTYPE html>
<html>
  <body>
    <div id="app"></div>
    <!-- 空壳 -->
    <script src="/app.js"></script>
    <!-- JS 负责一切 -->
  </body>
</html>
```

CSR 的优点：开发简单、用户交互体验好（切换页面无刷新）、服务器压力小。缺点：首屏加载慢（需要等 JS 下载和执行）、SEO 不友好（搜索引擎爬虫看到的是空页面）。

SSR——服务器在收到请求时执行 Vue 组件代码，将组件渲染为完整的 HTML 字符串返回给浏览器。浏览器收到的是带有完整内容的 HTML，可以立即显示。随后浏览器下载 JS 并进行"注水"（hydration），使页面变为可交互的 SPA：

```
用户请求 -> 服务器执行 Vue 渲染为 HTML -> 返回完整 HTML -> 浏览器显示内容
                                        -> 同时下载 JS -> 注水（hydration）-> 页面可交互
```

```html
<!-- SSR 返回的 HTML -->
<!DOCTYPE html>
<html>
  <body>
    <div id="app">
      <!-- 已渲染的完整内容 -->
      <h1>欢迎</h1>
      <ul>
        <li>文章1</li>
        <li>文章2</li>
      </ul>
    </div>
    <script src="/app.js"></script>
    <!-- 注水用 -->
  </body>
</html>
```

SSR 的优点：首屏加载快（用户立即看到内容）、SEO 友好。缺点：服务器压力大（每次请求都要执行渲染）、开发复杂度高（需要考虑代码的服务端/客户端兼容性）。

SSG——在构建阶段（build time）就将所有页面预渲染为静态 HTML 文件。部署时只需要一个静态文件服务器：

```
构建时：Vue 组件 + 数据 -> 预渲染为 HTML 文件
部署后：用户请求 -> 直接返回静态 HTML（无需服务器计算）
```

SSG 的优点：加载最快（CDN 直接返回）、SEO 友好、不需要 Node.js 服务器。缺点：数据是构建时确定的（不适合频繁更新的内容）、页面多时构建时间长。

选择建议：博客、文档站点用 SSG；需要 SEO 的动态内容站点（电商、新闻）用 SSR；管理后台、内部系统用 CSR。

## 4. 🤔 Vue SSR 的原理是什么？有哪些需要注意的挑战？

Vue SSR 的核心原理是：同一套 Vue 组件代码在服务端和客户端各执行一次。服务端执行渲染生成 HTML 字符串（用于首屏显示），客户端执行注水（hydration，将静态 HTML "激活"为可交互的 Vue 应用）。

基本的 SSR 实现：

```js
// server.js
import express from 'express'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

const app = express()

app.get('*', async (req, res) => {
  // 每次请求创建新的 Vue 应用实例（避免状态污染）
  const vueApp = createSSRApp({
    data() {
      return { count: 0, url: req.url }
    },
    template: `<div>
      <h1>Hello SSR</h1>
      <p>当前路径：{{ url }}</p>
      <p>计数：{{ count }}</p>
      <button @click="count++">+1</button>
    </div>`,
  })

  // 将 Vue 组件渲染为 HTML 字符串
  const html = await renderToString(vueApp)

  res.send(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="app">${html}</div>
      <script src="/client.js"></script>
    </body>
    </html>
  `)
})

app.listen(3000)
```

```js
// client.js（客户端入口）
import { createSSRApp } from 'vue'

// 使用相同的组件配置
const app = createSSRApp({
  // ... 与服务端相同的组件定义
})

// 注水：将服务端渲染的静态 HTML 激活为可交互应用
app.mount('#app')
```

SSR 开发中的核心挑战：

第一，避免跨请求状态污染。服务端在多个请求之间共享同一个 Node.js 进程，如果使用单例模式（全局共享的 store、router），不同请求的数据会互相污染。必须为每次请求创建新的应用实例：

```js
// 错误：全局单例
const app = createSSRApp(App)
const store = createPinia()

// 正确：工厂函数，每次请求创建新实例
function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  const router = createRouter({
    /* ... */
  })

  app.use(pinia)
  app.use(router)

  return { app, pinia, router }
}
```

第二，平台特定 API 的兼容性。服务端没有 window、document、DOM API。代码中不能在模块顶层使用浏览器 API：

```js
// 错误：在模块顶层使用浏览器 API
const width = window.innerWidth // 服务端报错

// 正确：在生命周期钩子中使用
onMounted(() => {
  const width = window.innerWidth // 只在客户端执行
})

// 或使用条件判断
if (typeof window !== 'undefined') {
  // 浏览器环境
}
```

第三，生命周期的差异。服务端只执行 beforeCreate 和 created（Vue 2）/ setup（Vue 3）。onMounted、onUpdated 等钩子不会在服务端执行。不要在 setup 中执行副作用（如定时器、事件监听），放到 onMounted 中。

第四，数据预取。SSR 需要在服务端获取数据后再渲染，而不是像 CSR 那样先渲染再请求数据。

## 5. 🤔 Vue Router 在 SSR 中如何使用？

Vue Router 在 SSR 环境中需要使用 createMemoryHistory（服务端没有浏览器 URL 栏），而客户端使用 createWebHistory。

```js
// router/index.js
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'

export function createAppRouter() {
  return createRouter({
    // 服务端使用 memory history，客户端使用 web history
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: [
      {
        path: '/',
        component: () => import('../views/Home.vue'),
      },
      {
        path: '/about',
        component: () => import('../views/About.vue'),
      },
      {
        path: '/user/:id',
        component: () => import('../views/User.vue'),
      },
    ],
  })
}
```

服务端入口需要在渲染前推送当前 URL 到路由并等待路由就绪：

```js
// entry-server.js
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import { createAppRouter } from './router'

export async function render(url) {
  const app = createSSRApp(App)
  const router = createAppRouter()

  app.use(router)

  // 将服务器请求的 URL 推送到路由
  router.push(url)

  // 等待路由和异步组件就绪
  await router.isReady()

  const html = await renderToString(app)

  return { html }
}
```

```js
// entry-client.js
import { createSSRApp } from 'vue'
import App from './App.vue'
import { createAppRouter } from './router'

const app = createSSRApp(App)
const router = createAppRouter()

app.use(router)

// 等待路由就绪后再注水
router.isReady().then(() => {
  app.mount('#app')
})
```

服务端路由匹配与重定向处理：

```js
// server.js
app.get('*', async (req, res) => {
  const { app, router } = createApp()

  router.push(req.url)
  await router.isReady()

  // 检查是否有路由重定向
  const matchedRoute = router.currentRoute.value
  if (matchedRoute.matched.length === 0) {
    res.status(404).send('Not Found')
    return
  }

  if (matchedRoute.redirectedFrom) {
    res.redirect(301, matchedRoute.fullPath)
    return
  }

  const html = await renderToString(app)
  res.send(renderHTML(html))
})
```

## 6. 🤔 SSR 中的状态管理如何处理注水和脱水？

在 SSR 中，服务端和客户端都会执行应用代码。服务端获取的数据需要传递给客户端，避免客户端重复请求。这个过程叫做"脱水"（dehydration，服务端序列化状态）和"注水"（hydration，客户端恢复状态）。

基本原理：

```
服务端：创建 Store -> 获取数据 -> 渲染 HTML -> 将 Store 状态序列化为 JSON 嵌入 HTML
                                                    ↓（脱水 dehydration）
HTML：<script>window.__INITIAL_STATE__ = { "user": {...}, "items": [...] }</script>
                                                    ↓（注水 hydration）
客户端：创建 Store -> 从 window.__INITIAL_STATE__ 恢复状态 -> 注水激活应用
```

使用 Pinia 的 SSR 状态管理：

```js
// entry-server.js
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import { createAppRouter } from './router'

export async function render(url) {
  const app = createSSRApp(App)
  const pinia = createPinia()
  const router = createAppRouter()

  app.use(pinia)
  app.use(router)

  router.push(url)
  await router.isReady()

  // 在组件中使用 store 获取数据（组件的 setup 中）
  const html = await renderToString(app)

  // 脱水：将 Pinia 的状态序列化
  const initialState = JSON.stringify(pinia.state.value)

  return { html, initialState }
}
```

```js
// server.js
app.get('*', async (req, res) => {
  const { html, initialState } = await render(req.url)

  res.send(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="app">${html}</div>
      <!-- 将状态嵌入 HTML -->
      <script>window.__pinia = ${initialState}</script>
      <script src="/client.js"></script>
    </body>
    </html>
  `)
})
```

```js
// entry-client.js
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createAppRouter } from './router'

const app = createSSRApp(App)
const pinia = createPinia()
const router = createAppRouter()

app.use(pinia)
app.use(router)

// 注水：恢复服务端的 Pinia 状态
if (window.__pinia) {
  pinia.state.value = window.__pinia
}

router.isReady().then(() => {
  app.mount('#app')
})
```

在组件中进行数据预取：

```html
<!-- views/User.vue -->
<script setup>
  import { useUserStore } from '../stores/user'
  import { useRoute } from 'vue-router'
  import { onServerPrefetch, onMounted } from 'vue'

  const route = useRoute()
  const userStore = useUserStore()

  // 服务端预取数据
  onServerPrefetch(async () => {
    await userStore.fetchUser(route.params.id)
  })

  // 客户端：如果没有从服务端获取到数据（如客户端导航），则在这里获取
  onMounted(async () => {
    if (!userStore.currentUser) {
      await userStore.fetchUser(route.params.id)
    }
  })
</script>

<template>
  <div v-if="userStore.currentUser">
    <h1>{{ userStore.currentUser.name }}</h1>
    <p>{{ userStore.currentUser.email }}</p>
  </div>
</template>
```

注水过程中的注意事项：序列化时要防止 XSS 攻击（使用安全的序列化方式处理特殊字符），注水时客户端渲染的 DOM 结构必须与服务端完全一致（否则会出现 hydration mismatch 警告）。在实际项目中，推荐使用 Nuxt.js 框架来处理这些复杂的 SSR 细节。
