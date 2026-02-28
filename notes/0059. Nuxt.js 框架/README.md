# [0059. Nuxt.js 框架](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0059.%20Nuxt.js%20%E6%A1%86%E6%9E%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Nuxt 如何安装？其目录结构是怎样的？](#3--nuxt-如何安装其目录结构是怎样的)
- [4. 🤔 Nuxt 的文件路由系统是如何工作的？](#4--nuxt-的文件路由系统是如何工作的)
- [5. 🤔 布局和中间件在 Nuxt 中如何使用？](#5--布局和中间件在-nuxt-中如何使用)
- [6. 🤔 useFetch 和 useAsyncData 如何获取数据？](#6--usefetch-和-useasyncdata-如何获取数据)
- [7. 🤔 Nuxt 的模块化和部署选项有哪些？](#7--nuxt-的模块化和部署选项有哪些)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Nuxt 的安装与目录结构
- 页面与路由系统（基于文件的路由）
- 布局与中间件
- 数据获取（useFetch、useAsyncData）
- 模块化与插件生态
- 部署与渲染模式选择（SSR、SSG、SPA）

## 2. 🫧 评价

- todo

## 3. 🤔 Nuxt 如何安装？其目录结构是怎样的？

Nuxt 3 提供了简洁的脚手架命令来初始化项目：

```bash
# 使用 nuxi 创建新项目
npx nuxi@latest init my-nuxt-app

# 进入目录并安装依赖
cd my-nuxt-app
npm install

# 启动开发服务器
npm run dev
```

Nuxt 3 采用约定优于配置的设计理念，目录结构中每个文件夹都有特定的用途：

```
my-nuxt-app/
├── .nuxt/              # 自动生成的构建目录（不要手动修改）
├── assets/             # 需要构建工具处理的静态资源（Sass、图片等）
├── components/         # Vue 组件（自动导入）
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   └── ui/
│       ├── Button.vue
│       └── Modal.vue
├── composables/        # 组合式函数（自动导入）
│   └── useAuth.ts
├── content/            # Nuxt Content 模块的内容文件（Markdown 等）
├── layouts/            # 布局组件
│   ├── default.vue
│   └── admin.vue
├── middleware/         # 路由中间件
│   └── auth.ts
├── pages/              # 页面组件（自动生成路由）
│   ├── index.vue        # -> /
│   ├── about.vue        # -> /about
│   └── users/
│       ├── index.vue    # -> /users
│       └── [id].vue     # -> /users/:id
├── plugins/            # 插件
│   └── myPlugin.ts
├── public/             # 直接提供的静态文件（不经过构建处理）
│   └── favicon.ico
├── server/             # 服务端 API 路由和中间件
│   ├── api/
│   │   └── hello.ts    # -> /api/hello
│   └── middleware/
├── utils/              # 工具函数（自动导入）
│   └── format.ts
├── app.vue             # 应用入口组件
├── nuxt.config.ts      # Nuxt 配置文件
├── package.json
└── tsconfig.json
```

几个核心目录的自动化特性：

```ts
// components/ 中的组件会自动注册，无需 import
// 文件结构映射为组件名：
// components/ui/Button.vue -> <UiButton />

// composables/ 中的函数会自动导入
// composables/useAuth.ts
export const useAuth = () => {
  const user = useState('user', () => null)

  const login = async (credentials) => {
    // 登录逻辑
  }

  const logout = () => {
    user.value = null
  }

  return { user, login, logout }
}

// 在任何组件中直接使用，无需 import
// pages/profile.vue
// const { user } = useAuth()  直接可用
```

```ts
// nuxt.config.ts 核心配置
export default defineNuxtConfig({
  devtools: { enabled: true },

  // 启用的模块
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  // 运行时配置
  runtimeConfig: {
    // 仅服务端可访问
    apiSecret: process.env.API_SECRET,
    // 客户端也可访问
    public: {
      apiBase: process.env.API_BASE || '/api',
    },
  },

  // TypeScript 配置
  typescript: {
    strict: true,
  },
})
```

## 4. 🤔 Nuxt 的文件路由系统是如何工作的？

Nuxt 基于 pages/ 目录的文件结构自动生成路由配置，不需要手动编写 router 配置。文件名和目录结构直接映射为 URL 路径。

基本路由映射规则：

```
pages/
├── index.vue           ->  /
├── about.vue           ->  /about
├── contact.vue         ->  /contact
├── blog/
│   ├── index.vue       ->  /blog
│   └── [slug].vue      ->  /blog/:slug    （动态参数）
├── users/
│   ├── index.vue       ->  /users
│   ├── [id].vue        ->  /users/:id
│   └── [id]/
│       ├── index.vue   ->  /users/:id
│       └── posts.vue   ->  /users/:id/posts
└── [...slug].vue       ->  /*  （全匹配，通常用于 404）
```

动态路由参数通过方括号表示：

```html
<!-- pages/users/[id].vue -->
<script setup>
  const route = useRoute()

  // 取得动态参数
  console.log(route.params.id) // 访问 /users/42 时为 "42"
</script>

<template>
  <div>
    <h1>用户 #{{ route.params.id }}</h1>
  </div>
</template>
```

嵌套路由通过目录结构和同名 Vue 文件实现。如果 pages/parent.vue 和 pages/parent/ 目录同时存在，parent.vue 作为布局，目录中的文件作为子路由：

```
pages/
├── dashboard.vue         ->  父路由（包含 <NuxtPage />）
└── dashboard/
    ├── index.vue         ->  /dashboard
    ├── settings.vue      ->  /dashboard/settings
    └── analytics.vue     ->  /dashboard/analytics
```

```html
<!-- pages/dashboard.vue（父路由，相当于 router-view 的容器） -->
<template>
  <div>
    <h1>仪表盘</h1>
    <nav>
      <NuxtLink to="/dashboard">首页</NuxtLink>
      <NuxtLink to="/dashboard/settings">设置</NuxtLink>
      <NuxtLink to="/dashboard/analytics">分析</NuxtLink>
    </nav>
    <!-- 子路由渲染位置 -->
    <NuxtPage />
  </div>
</template>
```

路由中间件可以在页面中通过 definePageMeta 声明使用：

```html
<!-- pages/admin.vue -->
<script setup>
  definePageMeta({
    middleware: 'auth', // 使用 middleware/auth.ts
    layout: 'admin', // 使用 layouts/admin.vue
    title: '管理后台',
  })
</script>
```

## 5. 🤔 布局和中间件在 Nuxt 中如何使用？

布局（Layouts）用来定义页面的通用结构（比如导航栏、页脚、侧边栏）。默认布局是 layouts/default.vue，所有页面都会使用它，除非指定了其他布局。

```html
<!-- layouts/default.vue -->
<template>
  <div class="page-container">
    <header>
      <nav>
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
      </nav>
    </header>

    <main>
      <!-- 页面内容渲染位置 -->
      <slot />
    </main>

    <footer>
      <p>版权信息</p>
    </footer>
  </div>
</template>
```

```html
<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <NuxtLink to="/admin">仪表盘</NuxtLink>
      <NuxtLink to="/admin/users">用户管理</NuxtLink>
      <NuxtLink to="/admin/settings">系统设置</NuxtLink>
    </aside>
    <main class="content">
      <slot />
    </main>
  </div>
</template>
```

在页面中指定布局：

```html
<!-- pages/admin/index.vue -->
<script setup>
  definePageMeta({
    layout: 'admin', // 使用 admin 布局
  })
</script>

<template>
  <div>
    <h1>管理后台</h1>
  </div>
</template>
```

中间件（Middleware）是在导航到某个路由之前执行的函数，常用于权限验证、重定向等。Nuxt 中有三种中间件：

```ts
// middleware/auth.ts —— 命名路由中间件（手动在页面中引用）
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

  // 未登录，重定向到登录页
  if (!user.value) {
    return navigateTo('/login')
  }
})
```

```ts
// middleware/log.global.ts —— 全局中间件（文件名含 .global 后缀）
// 自动应用于所有路由
export default defineNuxtRouteMiddleware((to, from) => {
  console.log(`导航: ${from.path} -> ${to.path}`)
})
```

```html
<!-- 内联中间件（直接在页面中定义） -->
<script setup>
  definePageMeta({
    middleware: [
      function (to, from) {
        // 内联中间件逻辑
        if (to.query.preview !== 'true') {
          return abortNavigation()
        }
      },
      'auth', // 也可以混合使用命名中间件
    ],
  })
</script>
```

中间件的执行顺序：全局中间件（按文件名字母排序）先执行，然后是页面定义的中间件（按数组顺序）。

## 6. 🤔 useFetch 和 useAsyncData 如何获取数据？

Nuxt 3 提供了 useFetch 和 useAsyncData 两个组合式函数来处理数据获取，它们都支持 SSR（在服务端获取数据，避免客户端重复请求）。

useFetch 是对 useAsyncData 和 $fetch 的封装，用于直接请求 URL：

```html
<script setup>
  // 基本用法
  const { data, pending, error, refresh } = await useFetch('/api/users')

  // 带选项
  const { data: posts } = await useFetch('/api/posts', {
    // 查询参数
    query: {
      page: 1,
      limit: 10,
    },
    // 请求方法
    method: 'GET',
    // 请求头
    headers: {
      Authorization: 'Bearer token123',
    },
    // 转换响应数据
    transform: (response) => {
      return response.data.map((post) => ({
        ...post,
        title: post.title.toUpperCase(),
      }))
    },
    // 默认值
    default: () => [],
  })

  // 监听响应式数据变化自动重新请求
  const page = ref(1)
  const { data: pagedPosts } = await useFetch('/api/posts', {
    query: { page }, // page 变化时自动重新请求
    watch: [page],
  })
</script>

<template>
  <div>
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">错误：{{ error.message }}</div>
    <ul v-else>
      <li v-for="user in data" :key="user.id">{{ user.name }}</li>
    </ul>
  </div>
</template>
```

useAsyncData 提供了更灵活的数据获取方式，适合非 HTTP 请求的场景或需要自定义逻辑的场景：

```html
<script setup>
  // useAsyncData 接受一个唯一 key 和一个获取函数
  const { data: user } = await useAsyncData('user', () => {
    return $fetch(`/api/users/${route.params.id}`)
  })

  // 组合多个请求
  const { data: dashboardData } = await useAsyncData('dashboard', async () => {
    const [users, posts, stats] = await Promise.all([
      $fetch('/api/users'),
      $fetch('/api/posts'),
      $fetch('/api/stats'),
    ])

    return { users, posts, stats }
  })

  // 懒加载（不阻塞导航，客户端异步加载）
  const { data, pending } = await useLazyFetch('/api/heavy-data')
  const { data: lazyData } = await useLazyAsyncData('lazy', () =>
    $fetch('/api/slow-endpoint'),
  )
</script>
```

这两个函数在 SSR 中的工作流程：服务端执行数据获取 -> 将数据序列化到 HTML 中（payload）-> 客户端从 payload 恢复数据（不会重复请求）。

```html
<script setup>
  // 仅客户端获取（不在服务端执行）
  const { data } = await useFetch('/api/client-only', {
    server: false, // 不在服务端获取
  })

  // 手动刷新数据
  const { data, refresh } = await useFetch('/api/data')
  const handleRefresh = () => {
    refresh() // 重新获取数据
  }
</script>
```

## 7. 🤔 Nuxt 的模块化和部署选项有哪些？

Nuxt 的模块系统允许通过安装和配置模块来扩展框架功能，社区提供了丰富的模块生态。

```bash
# 安装常用模块
npx nuxi module add @pinia/nuxt
npx nuxi module add @nuxtjs/tailwindcss
npx nuxi module add @nuxt/content
npx nuxi module add @nuxt/image
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt', // 状态管理
    '@nuxtjs/tailwindcss', // Tailwind CSS
    '@nuxt/content', // 内容管理（Markdown 渲染）
    '@nuxt/image', // 图片优化
    '@nuxtjs/i18n', // 国际化
    '@vueuse/nuxt', // VueUse 工具集
    '@nuxt/devtools', // 开发工具
  ],
})
```

自定义模块开发：

```ts
// modules/myModule.ts
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  defaults: {
    enabled: true,
  },
  setup(options, nuxt) {
    if (!options.enabled) return

    const { resolve } = createResolver(import.meta.url)

    // 添加插件
    addPlugin(resolve('./runtime/plugin'))

    // 添加服务端 API
    nuxt.hook('nitro:config', (config) => {
      config.handlers = config.handlers || []
      config.handlers.push({
        route: '/api/custom',
        handler: resolve('./runtime/api/custom'),
      })
    })
  },
})
```

部署方面，Nuxt 3 使用 Nitro 引擎，支持多种渲染模式和部署目标：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  // 渲染模式配置（可以按路由级别配置）
  routeRules: {
    '/': { prerender: true }, // SSG：构建时预渲染
    '/blog/**': { isr: 3600 }, // ISR：增量静态再生（1 小时过期）
    '/admin/**': { ssr: false }, // SPA：仅客户端渲染
    '/api/**': { cors: true, cache: { maxAge: 60 } }, // API 路由
  },

  // Nitro 部署预设
  nitro: {
    preset: 'node-server', // 默认：Node.js 服务器
    // preset: 'vercel'      // Vercel
    // preset: 'netlify'     // Netlify
    // preset: 'cloudflare'  // Cloudflare Workers
    // preset: 'static'      // 纯静态站点
  },
})
```

构建和部署命令：

```bash
# SSR 模式构建（默认）
npm run build
# 输出到 .output/ 目录，启动方式：
node .output/server/index.mjs

# SSG 模式（预渲染所有页面为静态 HTML）
npx nuxi generate
# 输出到 .output/public/ 目录，部署到任意静态托管

# 预览构建结果
npx nuxi preview
```

Nuxt 3 的混合渲染（Hybrid Rendering）是其一大亮点——可以为不同路由选择不同的渲染策略：首页用 SSG 获取最快速度，博客用 ISR 平衡实时性和性能，后台管理用 SPA 减少服务器压力，全部在同一个项目中配置。
