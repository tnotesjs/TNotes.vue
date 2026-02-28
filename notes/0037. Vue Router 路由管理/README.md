# [0037. Vue Router 路由管理](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0037.%20Vue%20Router%20%E8%B7%AF%E7%94%B1%E7%AE%A1%E7%90%86)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何安装和配置 Vue Router？动态路由匹配是怎么工作的？](#3--如何安装和配置-vue-router动态路由匹配是怎么工作的)
- [4. 🤔 什么是嵌套路由？命名路由和命名视图如何使用？](#4--什么是嵌套路由命名路由和命名视图如何使用)
- [5. 🤔 编程式导航有哪些方式？](#5--编程式导航有哪些方式)
- [6. 🤔 路由守卫有哪些类型？如何实现路由拦截？](#6--路由守卫有哪些类型如何实现路由拦截)
- [7. 🤔 路由元信息如何实现权限控制？](#7--路由元信息如何实现权限控制)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 路由的安装与配置
- 动态路由匹配与路由参数
- 嵌套路由
- 编程式导航（push、replace、go）
- 命名路由与命名视图
- 重定向与别名
- 路由守卫（全局、路由独享、组件内）
- 路由元信息与权限控制

## 2. 🫧 评价

- todo

## 3. 🤔 如何安装和配置 Vue Router？动态路由匹配是怎么工作的？

Vue Router 是 Vue.js 的官方路由管理器。它和 Vue.js 核心深度集成，使构建单页面应用（SPA）变得轻而易举。在 SPA 中，页面不会整页刷新，而是通过路由切换来动态地渲染不同的组件，模拟"多页面"的体验。

安装和基本配置：

```bash
npm install vue-router@4
```

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const router = createRouter({
  // 使用 HTML5 History 模式
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/about',
      name: 'About',
      component: About,
    },
    {
      path: '/user/:id',
      name: 'User',
      // 路由懒加载
      component: () => import('../views/User.vue'),
    },
  ],
})

export default router
```

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

```html
<!-- App.vue -->
<template>
  <nav>
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/about">关于</RouterLink>
    <RouterLink :to="{ name: 'User', params: { id: 1 } }">用户</RouterLink>
  </nav>

  <!-- 路由出口：匹配到的组件渲染在这里 -->
  <RouterView />
</template>
```

动态路由匹配允许你在路由路径中定义参数（以冒号开头），这些参数会被自动解析并注入到路由对象中：

```js
const routes = [
  // 基本动态参数
  { path: '/user/:id', component: UserProfile },

  // 多个动态参数
  { path: '/user/:userId/post/:postId', component: UserPost },

  // 可选参数（加 ? 后缀）
  { path: '/user/:id/profile/:section?', component: UserSection },

  // 可重复参数（匹配多段路径）
  { path: '/files/:path+', component: FileExplorer }, // 至少一段
  { path: '/docs/:chapters*', component: DocReader }, // 零或多段

  // 自定义正则匹配
  { path: '/article/:id(\\d+)', component: Article }, // 只匹配数字
  { path: '/:pathMatch(.*)*', component: NotFound }, // 捕获所有未匹配的路由
]
```

在组件中获取路由参数：

```html
<template>
  <div>
    <h1>用户 {{ userId }} 的资料</h1>
  </div>
</template>

<script setup>
  import { useRoute, watch } from 'vue'

  const route = useRoute()
  const userId = computed(() => route.params.id)

  // 监听路由参数变化（当 /user/1 切换到 /user/2 时）
  watch(
    () => route.params.id,
    (newId, oldId) => {
      console.log(`用户 ID 从 ${oldId} 变为 ${newId}`)
      // 重新获取用户数据
      fetchUserData(newId)
    },
  )
</script>
```

也可以通过 props 配置将路由参数作为组件的 props 传入，实现路由组件和路由的解耦：

```js
const routes = [
  {
    path: '/user/:id',
    component: UserProfile,
    props: true, // 将 route.params 作为 props 传给组件
  },
  {
    path: '/search',
    component: SearchResults,
    props: (route) => ({
      query: route.query.q,
      page: Number(route.query.page) || 1,
    }),
  },
]
```

```html
<!-- UserProfile.vue：直接通过 props 接收 -->
<script setup>
  const props = defineProps({
    id: { type: String, required: true },
  })
  // 不再需要 useRoute() 来获取参数
</script>
```

## 4. 🤔 什么是嵌套路由？命名路由和命名视图如何使用？

嵌套路由反映了 UI 中组件的嵌套结构。比如一个用户页面内部可能有"个人资料""文章列表""设置"等子页面，URL 表现为 /user/1/profile、/user/1/posts 等。

```js
const routes = [
  {
    path: '/user/:id',
    component: UserLayout,
    children: [
      // 默认子路由：匹配 /user/:id
      { path: '', component: UserOverview },
      // 匹配 /user/:id/profile
      { path: 'profile', component: UserProfile },
      // 匹配 /user/:id/posts
      { path: 'posts', component: UserPosts },
      // 匹配 /user/:id/settings
      { path: 'settings', component: UserSettings },
    ],
  },
]
```

```html
<!-- UserLayout.vue -->
<template>
  <div class="user-layout">
    <aside>
      <nav>
        <RouterLink :to="`/user/${userId}`">概览</RouterLink>
        <RouterLink :to="`/user/${userId}/profile`">个人资料</RouterLink>
        <RouterLink :to="`/user/${userId}/posts`">文章</RouterLink>
        <RouterLink :to="`/user/${userId}/settings`">设置</RouterLink>
      </nav>
    </aside>

    <main>
      <!-- 嵌套的路由出口，渲染子路由组件 -->
      <RouterView />
    </main>
  </div>
</template>

<script setup>
  import { useRoute } from 'vue-router'
  const route = useRoute()
  const userId = computed(() => route.params.id)
</script>
```

命名路由给路由配置起一个名字，这样在导航时可以使用名字代替路径，不受路径变化的影响：

```js
const routes = [
  {
    path: '/user/:id/post/:postId',
    name: 'UserPost',
    component: UserPost,
  },
]
```

```html
<template>
  <!-- 使用名字导航比直接拼路径更安全 -->
  <RouterLink :to="{ name: 'UserPost', params: { id: 1, postId: 42 } }">
    查看文章
  </RouterLink>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  const router = useRouter()

  // 编程式导航也可以使用命名路由
  router.push({ name: 'UserPost', params: { id: 1, postId: 42 } })
</script>
```

命名视图允许在同一个页面中同时展示多个路由视图。当一个路由需要在多个位置渲染不同的组件时使用：

```js
const routes = [
  {
    path: '/dashboard',
    components: {
      default: DashboardMain,
      sidebar: DashboardSidebar,
      header: DashboardHeader,
    },
  },
]
```

```html
<!-- 对应模板 -->
<template>
  <RouterView name="header" />
  <div class="container">
    <RouterView name="sidebar" />
    <RouterView />
    <!-- 默认视图 -->
  </div>
</template>
```

重定向和别名：

```js
const routes = [
  // 重定向：访问 /home 会跳转到 /
  { path: '/home', redirect: '/' },

  // 函数式重定向
  {
    path: '/profile',
    redirect: (to) => {
      return { name: 'UserProfile', params: { id: getCurrentUserId() } }
    },
  },

  // 别名：访问 /p/:id 和 /post/:id 渲染相同组件，URL 不变
  {
    path: '/post/:id',
    component: PostDetail,
    alias: ['/p/:id', '/article/:id'],
  },
]
```

## 5. 🤔 编程式导航有哪些方式？

除了使用 `<RouterLink>` 创建声明式导航，Vue Router 还提供了编程式导航 API，允许在 JavaScript 代码中执行路由跳转。通过 useRouter 组合式函数获取路由器实例。

```html
<script setup>
  import { useRouter, useRoute } from 'vue-router'

  const router = useRouter()
  const route = useRoute()

  // push：添加新的历史记录
  function goToUser(id) {
    // 字符串路径
    router.push(`/user/${id}`)

    // 带路径的对象
    router.push({ path: `/user/${id}` })

    // 命名路由 + 参数
    router.push({ name: 'User', params: { id } })

    // 带查询参数：/search?q=vue&page=1
    router.push({ path: '/search', query: { q: 'vue', page: 1 } })

    // 带 hash：/about#team
    router.push({ path: '/about', hash: '#team' })
  }

  // replace：替换当前历史记录（不会在浏览器历史中留下记录）
  function replaceToLogin() {
    router.replace({ name: 'Login' })
    // 等价于
    router.push({ name: 'Login', replace: true })
  }

  // go：在历史记录中前进或后退
  function goBack() {
    router.go(-1) // 后退一步
  }

  function goForward() {
    router.go(1) // 前进一步
  }

  // back 和 forward 是 go 的快捷方式
  function navigateHistory() {
    router.back() // 等同于 router.go(-1)
    router.forward() // 等同于 router.go(1)
  }
</script>
```

router.push 返回一个 Promise，可以用来处理导航完成或失败：

```html
<script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()

  async function handleLogin() {
    try {
      await loginUser(credentials)
      // 登录成功后跳转
      await router.push({ name: 'Dashboard' })
      console.log('导航完成')
    } catch (error) {
      if (error.name === 'NavigationDuplicated') {
        // 导航到当前页面，可以忽略
      } else {
        console.error('导航失败：', error)
      }
    }
  }

  // 带导航守卫的场景
  async function goToProtectedPage() {
    const result = await router.push('/admin')
    // 如果导航被守卫拦截（比如重定向到登录页），result 会是一个 NavigationFailure
  }
</script>
```

需要注意：当使用 path 时，params 会被忽略。如果路由有参数，必须使用 name 或在 path 中直接拼接：

```js
// 错误：path 和 params 不能同时使用
router.push({ path: '/user', params: { id: 1 } }) // params 被忽略

// 正确方式
router.push({ name: 'User', params: { id: 1 } })
router.push({ path: `/user/1` })
router.push(`/user/1`)
```

## 6. 🤔 路由守卫有哪些类型？如何实现路由拦截？

路由守卫是 Vue Router 提供的导航拦截机制，允许你在路由跳转的不同阶段插入自定义逻辑。常见的用途包括权限验证、登录检查、数据预加载、页面标题设置等。

Vue Router 提供三种级别的守卫：

全局守卫——作用于所有路由跳转：

```js
const router = createRouter({
  /* ... */
})

// 全局前置守卫：在每次导航之前触发
router.beforeEach((to, from) => {
  // to: 即将进入的路由
  // from: 当前的路由

  const isAuthenticated = checkAuth()

  // 如果目标路由需要认证但用户未登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 重定向到登录页，并记录原始目标
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // 返回 true 或 undefined 表示放行
  // 返回 false 取消导航
  // 返回一个路由对象表示重定向
})

// 全局解析守卫：在所有组件内守卫和异步路由组件被解析之后
router.beforeResolve(async (to) => {
  if (to.meta.requiresData) {
    try {
      await fetchRequiredData(to)
    } catch (error) {
      return { name: 'Error', params: { message: error.message } }
    }
  }
})

// 全局后置钩子：导航完成后触发（不能改变导航本身）
router.afterEach((to, from, failure) => {
  // 设置页面标题
  document.title = to.meta.title || '默认标题'

  // 发送页面浏览统计
  if (!failure) {
    analytics.pageView(to.fullPath)
  }

  // 滚动到顶部
  window.scrollTo(0, 0)
})
```

路由独享守卫——只在特定路由配置上生效：

```js
const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    beforeEnter: (to, from) => {
      const user = getCurrentUser()
      if (user?.role !== 'admin') {
        return { name: 'Forbidden' }
      }
    },
  },
  {
    path: '/old-path',
    // beforeEnter 也可以是一个数组
    beforeEnter: [removeQueryParams, removeHash],
  },
]
```

组件内守卫——在路由组件内部定义：

```html
<script setup>
  import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

  // 当路由参数变化时触发（如 /user/1 -> /user/2）
  onBeforeRouteUpdate((to, from) => {
    // 重新加载数据
    fetchUserData(to.params.id)
  })

  // 离开当前路由时触发
  onBeforeRouteLeave((to, from) => {
    // 如果有未保存的更改，提示用户
    if (hasUnsavedChanges.value) {
      const answer = window.confirm('你有未保存的更改，确定要离开吗？')
      if (!answer) return false // 取消导航
    }
  })
</script>
```

完整的导航解析流程：

```
1. 触发导航
2. 在失活的组件里调用 onBeforeRouteLeave
3. 调用全局 beforeEach 守卫
4. 在重用的组件里调用 onBeforeRouteUpdate
5. 在路由配置里调用 beforeEnter
6. 解析异步路由组件
7. 调用全局 beforeResolve 守卫
8. 导航被确认
9. 调用全局 afterEach 钩子
10. 触发 DOM 更新
11. 调用 onMounted 等生命周期钩子
```

## 7. 🤔 路由元信息如何实现权限控制？

路由元信息（meta）是 Vue Router 允许你在路由配置上附加自定义数据的机制。通过 meta 字段，你可以为每个路由标记各种属性，然后在路由守卫中读取这些标记来实现权限控制、页面标题设置等功能。

```js
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      requiresAuth: false,
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '仪表盘',
      requiresAuth: true,
      roles: ['admin', 'editor'],
    },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
    children: [
      {
        path: 'users',
        component: UserManagement,
        meta: {
          title: '用户管理',
          requiresAuth: true,
          roles: ['admin'],
          permissions: ['user:read', 'user:write'],
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      guest: true, // 只允许未登录用户访问
    },
  },
]
```

在全局守卫中使用 meta 实现权限控制：

```js
router.beforeEach(async (to, from) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 我的应用` : '我的应用'

  const userStore = useUserStore()
  const isAuthenticated = userStore.isLoggedIn

  // 检查登录状态
  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath },
    }
  }

  // 已登录用户不允许访问登录页
  if (to.meta.guest && isAuthenticated) {
    return { name: 'Dashboard' }
  }

  // 检查角色权限
  if (to.meta.roles) {
    const userRole = userStore.currentUser?.role
    if (!to.meta.roles.includes(userRole)) {
      return { name: 'Forbidden' }
    }
  }

  // 检查细粒度权限
  if (to.meta.permissions) {
    const userPermissions = userStore.currentUser?.permissions || []
    const hasPermission = to.meta.permissions.every((p) =>
      userPermissions.includes(p),
    )
    if (!hasPermission) {
      return { name: 'Forbidden' }
    }
  }
})
```

路由的 meta 会向下合并。在嵌套路由中，to.matched 数组包含了所有匹配的路由记录。如果你需要检查整个路由链上的 meta，需要遍历 matched 数组：

```js
router.beforeEach((to) => {
  // 检查匹配的路由链中是否有任何一层需要认证
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !isAuthenticated()) {
    return { name: 'Login' }
  }
})
```

配合动态路由实现更灵活的权限方案：

```js
// 根据用户角色动态添加路由
async function setupDynamicRoutes(userRole) {
  const dynamicRoutes = await fetchRoutesByRole(userRole)

  dynamicRoutes.forEach((route) => {
    router.addRoute(route)
  })
}

// 登录成功后
async function onLoginSuccess(user) {
  await setupDynamicRoutes(user.role)
  router.push(route.query.redirect || '/dashboard')
}

// 退出登录时移除动态路由
function onLogout() {
  // removeRoute 通过路由名称移除
  dynamicRouteNames.forEach((name) => {
    router.removeRoute(name)
  })
  router.push('/login')
}
```
