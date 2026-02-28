# [0035. 动态组件与异步组件](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0035.%20%E5%8A%A8%E6%80%81%E7%BB%84%E4%BB%B6%E4%B8%8E%E5%BC%82%E6%AD%A5%E7%BB%84%E4%BB%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 component 标签和 is 属性如何实现动态组件？](#3--component-标签和-is-属性如何实现动态组件)
- [4. 🤔 keep-alive 组件缓存的原理和用法是什么？](#4--keep-alive-组件缓存的原理和用法是什么)
- [5. 🤔 如何定义异步组件？它和代码分割有什么关系？](#5--如何定义异步组件它和代码分割有什么关系)
- [6. 🤔 Suspense 组件是什么？如何处理异步依赖？](#6--suspense-组件是什么如何处理异步依赖)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 动态组件 component 标签与 is 属性
- keep-alive 组件缓存
- 异步组件定义与代码分割
- Suspense 组件（Vue 3）

## 2. 🫧 评价

- todo

## 3. 🤔 component 标签和 is 属性如何实现动态组件？

Vue 提供了一个特殊的内置元素 `<component>`，配合 is 属性可以在运行时动态地切换要渲染的组件。这在实现标签页、多步骤表单、条件性展示不同组件等场景中非常有用。

基本用法：

```html
<template>
  <div>
    <div class="tab-buttons">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="{ active: currentTab === tab.name }"
        @click="currentTab = tab.name"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 动态组件：根据 currentTab 渲染不同的组件 -->
    <component :is="currentTabComponent" />
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import HomeTab from './HomeTab.vue'
  import ProfileTab from './ProfileTab.vue'
  import SettingsTab from './SettingsTab.vue'

  const tabs = [
    { name: 'home', label: '首页', component: HomeTab },
    { name: 'profile', label: '个人主页', component: ProfileTab },
    { name: 'settings', label: '设置', component: SettingsTab },
  ]

  const currentTab = ref('home')

  const currentTabComponent = computed(() => {
    return tabs.find((tab) => tab.name === currentTab.value)?.component
  })
</script>
```

is 属性可以接收以下类型的值：

- 被注册的组件名字符串
- 导入的组件对象
- HTML 原生元素名字符串

```html
<template>
  <!-- 使用组件名字符串（需要全局注册） -->
  <component :is="'MyComponent'" />

  <!-- 使用组件对象 -->
  <component :is="MyComponent" />

  <!-- 渲染为 HTML 原生元素 -->
  <component :is="'div'">这会渲染为 div</component>
  <component :is="tag">动态标签</component>
</template>

<script setup>
  import { ref } from 'vue'
  import MyComponent from './MyComponent.vue'

  const tag = ref('h1') // 可以动态改变渲染的 HTML 标签
</script>
```

动态组件也可以传递 props 和监听事件，和正常使用组件一样：

```html
<template>
  <component
    :is="currentEditor"
    :content="content"
    :readonly="isReadonly"
    @save="handleSave"
    @change="handleChange"
  />
</template>

<script setup>
  import { ref, computed } from 'vue'
  import MarkdownEditor from './MarkdownEditor.vue'
  import RichTextEditor from './RichTextEditor.vue'
  import CodeEditor from './CodeEditor.vue'

  const editorType = ref('markdown')
  const content = ref('')
  const isReadonly = ref(false)

  const editorMap = {
    markdown: MarkdownEditor,
    richtext: RichTextEditor,
    code: CodeEditor,
  }

  const currentEditor = computed(() => editorMap[editorType.value])

  function handleSave(data) {
    console.log('保存：', data)
  }

  function handleChange(newContent) {
    content.value = newContent
  }
</script>
```

需要注意的一点是：每次切换动态组件时，旧组件会被完全销毁，新组件会重新创建。这意味着组件中的所有状态都会丢失——表单输入、滚动位置、计时器等都会被重置。如果需要保持组件状态，就需要使用 keep-alive。

## 4. 🤔 keep-alive 组件缓存的原理和用法是什么？

keep-alive 是 Vue 的一个内置抽象组件，用于缓存动态组件的实例而不是销毁它们。当组件在 keep-alive 中被切换时，它会被"停用"而非"销毁"，其 DOM 元素和组件状态都会被保留在内存中。当再次激活时，之前的状态会完整恢复。

基本用法：

```html
<template>
  <div>
    <button @click="currentView = 'FormA'">表单 A</button>
    <button @click="currentView = 'FormB'">表单 B</button>

    <!-- 不使用 keep-alive：切换时组件被销毁，输入内容丢失 -->
    <component :is="views[currentView]" />

    <!-- 使用 keep-alive：切换时组件被缓存，输入内容保持 -->
    <KeepAlive>
      <component :is="views[currentView]" />
    </KeepAlive>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import FormA from './FormA.vue'
  import FormB from './FormB.vue'

  const currentView = ref('FormA')
  const views = { FormA, FormB }
</script>
```

keep-alive 提供了三个重要的 props 来控制缓存行为：

```html
<template>
  <!-- include：只缓存名字匹配的组件 -->
  <KeepAlive include="FormA,FormB">
    <component :is="currentComponent" />
  </KeepAlive>

  <!-- exclude：不缓存名字匹配的组件 -->
  <KeepAlive exclude="HeavyComponent">
    <component :is="currentComponent" />
  </KeepAlive>

  <!-- max：限制最大缓存实例数 -->
  <KeepAlive :max="5">
    <component :is="currentComponent" />
  </KeepAlive>

  <!-- include 也支持正则和数组 -->
  <KeepAlive :include="/^(Form|Editor)/">
    <component :is="currentComponent" />
  </KeepAlive>

  <KeepAlive :include="['FormA', 'FormB', 'Dashboard']">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

include 和 exclude 匹配的是组件的 name 选项。在 `<script setup>` 中，组件名默认从文件名推断。如果需要显式指定，可以使用一个额外的 `<script>` 块：

```html
<script>
  export default {
    name: 'FormA',
  }
</script>

<script setup>
  // 组合式 API 逻辑
</script>
```

当 max 被设置时，如果缓存的组件实例数超过限制，最久没有被访问的缓存实例会被销毁，为新实例腾出空间。这类似于 LRU（Least Recently Used）缓存策略。

keep-alive 缓存的组件拥有两个独特的生命周期钩子：onActivated 和 onDeactivated：

```html
<script setup>
  import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'

  // 首次挂载和每次从缓存中被激活时调用
  onActivated(() => {
    console.log('组件被激活')
    // 适合进行数据刷新、恢复计时器等操作
    startPolling()
  })

  // 从 DOM 上移除进入缓存时调用
  onDeactivated(() => {
    console.log('组件被停用')
    // 适合停止计时器、取消请求等清理操作
    stopPolling()
  })

  // onMounted 只在首次插入 DOM 时调用一次
  onMounted(() => {
    console.log('组件首次挂载')
  })

  // 在 keep-alive 中，onUnmounted 只在组件从缓存中被移除时调用
  onUnmounted(() => {
    console.log('组件被真正销毁（从缓存中移除）')
  })
</script>
```

在实际应用中，keep-alive 常用于以下场景：多标签页应用中缓存每个标签页的状态；列表-详情页面之间切换时，保持列表的滚动位置和搜索条件；复杂表单分步填写时，保持每步的输入状态。

在 Vue Router 中配合 keep-alive 使用：

```html
<template>
  <router-view v-slot="{ Component }">
    <KeepAlive :include="cachedViews">
      <component :is="Component" :key="$route.fullPath" />
    </KeepAlive>
  </router-view>
</template>

<script setup>
  import { ref } from 'vue'

  // 动态管理需要缓存的页面
  const cachedViews = ref(['Home', 'UserList'])
</script>
```

## 5. 🤔 如何定义异步组件？它和代码分割有什么关系？

异步组件是指不在应用初始加载时一起打包，而是在需要时才从服务器下载的组件。它结合了 JavaScript 的动态 import 语法和打包工具的代码分割能力，可以显著减小应用的初始包体积，提升首屏加载速度。

Vue 3 提供了 defineAsyncComponent 函数来定义异步组件：

```js
import { defineAsyncComponent } from 'vue'

// 最简单的写法：传入一个工厂函数
const AsyncUserProfile = defineAsyncComponent(
  () => import('./components/UserProfile.vue'),
)

// 完整配置写法
const AsyncDashboard = defineAsyncComponent({
  // 加载函数
  loader: () => import('./components/Dashboard.vue'),

  // 加载中展示的组件
  loadingComponent: LoadingSpinner,

  // 展示加载中组件前的延迟时间，默认 200ms
  // 避免加载极快时出现闪烁
  delay: 200,

  // 加载失败时展示的组件
  errorComponent: ErrorDisplay,

  // 超时时间，超过后显示错误组件
  timeout: 10000,
})
```

在 `<script setup>` 中使用异步组件和普通组件一样简洁：

```html
<template>
  <div>
    <h1>仪表盘</h1>
    <!-- 异步组件和普通组件使用方式一样 -->
    <AsyncChart :data="chartData" />
    <AsyncUserList :users="users" />
  </div>
</template>

<script setup>
  import { defineAsyncComponent, ref } from 'vue'

  // 这些组件会被打包工具（Vite/Webpack）自动分割成独立的 chunk
  const AsyncChart = defineAsyncComponent(
    () => import('./components/HeavyChart.vue'),
  )
  const AsyncUserList = defineAsyncComponent(
    () => import('./components/UserList.vue'),
  )

  const chartData = ref([])
  const users = ref([])
</script>
```

代码分割（Code Splitting）是现代打包工具（如 Vite、Webpack）的核心功能之一。当你使用动态 import() 语法时，打包工具会将被导入的模块及其依赖分割成一个独立的文件（chunk）。在运行时，只有当这个模块真正被需要时，浏览器才会发起网络请求去下载它。

```
# 不使用代码分割：所有组件打包在一个文件中
dist/
  assets/
    index-abc123.js    # 2MB（包含所有组件的代码）

# 使用代码分割：异步组件被分割成独立 chunk
dist/
  assets/
    index-abc123.js         # 800KB（主包，只包含首屏需要的代码）
    Dashboard-def456.js     # 200KB
    UserProfile-ghi789.js   # 150KB
    HeavyChart-jkl012.js    # 300KB
```

异步组件在路由级别的应用尤为常见。Vue Router 天然支持异步组件作为路由组件，实现路由级别的懒加载：

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      // 首页直接导入，包含在主包中
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/dashboard',
      // 仪表盘页面懒加载
      component: () => import('../views/Dashboard.vue'),
    },
    {
      path: '/admin',
      // 管理后台懒加载
      component: () => import('../views/Admin.vue'),
      children: [
        {
          path: 'users',
          component: () => import('../views/admin/Users.vue'),
        },
        {
          path: 'settings',
          component: () => import('../views/admin/Settings.vue'),
        },
      ],
    },
  ],
})
```

## 6. 🤔 Suspense 组件是什么？如何处理异步依赖？

Suspense 是 Vue 3 引入的一个内置组件（目前仍为实验性功能），用于协调组件树中异步依赖的加载状态。它可以在等待组件树中的异步内容就绪时，渲染一个加载中的状态。

Suspense 有两个插槽：default 和 fallback。default 插槽中放置实际的内容组件，fallback 插槽中放置加载状态的展示：

```html
<template>
  <Suspense>
    <!-- 主要内容（可能包含异步依赖） -->
    <template #default>
      <AsyncDashboard />
    </template>

    <!-- 加载中状态 -->
    <template #fallback>
      <div class="loading">
        <span class="spinner"></span>
        <p>正在加载仪表盘...</p>
      </div>
    </template>
  </Suspense>
</template>
```

Suspense 能够检测两种类型的异步依赖：

第一种是异步组件（通过 defineAsyncComponent 定义的组件）。第二种是在 `<script setup>` 中使用了顶层 await 的组件：

```html
<!-- UserDashboard.vue：使用顶层 await -->
<template>
  <div>
    <h2>欢迎，{{ userData.name }}</h2>
    <div class="stats">
      <div>文章数：{{ userData.postCount }}</div>
      <div>粉丝数：{{ userData.followerCount }}</div>
    </div>
    <ul>
      <li v-for="post in recentPosts" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</template>

<script setup>
  // 使用顶层 await，这个组件会自动成为一个异步依赖
  const userData = await fetch('/api/user/profile').then((r) => r.json())
  const recentPosts = await fetch('/api/user/posts?limit=5').then((r) => r.json())
</script>
```

```html
<!-- 父组件 -->
<template>
  <Suspense>
    <UserDashboard />
    <template #fallback>
      <p>加载用户数据...</p>
    </template>
  </Suspense>
</template>
```

Suspense 可以嵌套多个异步组件，它会等待所有异步依赖都解析完成后才切换到 default 内容：

```html
<template>
  <Suspense>
    <template #default>
      <div class="dashboard">
        <!-- 三个异步组件都加载完成后才会显示 -->
        <AsyncHeader />
        <AsyncSidebar />
        <AsyncMainContent />
      </div>
    </template>

    <template #fallback>
      <SkeletonScreen />
    </template>
  </Suspense>
</template>
```

Suspense 还提供了事件来监听状态变化：

```html
<template>
  <Suspense @pending="onPending" @resolve="onResolve" @fallback="onFallback">
    <AsyncComponent />
    <template #fallback>
      <LoadingIndicator />
    </template>
  </Suspense>
</template>

<script setup>
  function onPending() {
    console.log('开始加载异步依赖')
  }

  function onResolve() {
    console.log('所有异步依赖已就绪')
  }

  function onFallback() {
    console.log('正在显示 fallback 内容')
  }
</script>
```

配合 Vue Router 使用 Suspense 可以实现更好的路由级加载体验：

```html
<template>
  <router-view v-slot="{ Component }">
    <Suspense>
      <template #default>
        <component :is="Component" />
      </template>
      <template #fallback>
        <div class="page-loading">
          <LoadingBar />
        </div>
      </template>
    </Suspense>
  </router-view>
</template>
```

使用 Suspense 时需要配合 onErrorCaptured 钩子来处理异步加载失败的情况，否则加载错误可能导致页面空白：

```html
<template>
  <div v-if="error" class="error-state">
    <p>加载失败：{{ error.message }}</p>
    <button @click="error = null">重试</button>
  </div>

  <Suspense v-else>
    <AsyncPage />
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
  import { ref, onErrorCaptured } from 'vue'

  const error = ref(null)

  onErrorCaptured((e) => {
    error.value = e
    return false // 阻止错误继续向上传播
  })
</script>
```

需要注意的是，Suspense 目前仍是实验性功能，API 可能在未来版本中发生变化。但其核心概念——协调异步依赖的加载状态——在实际开发中已经被广泛使用。
