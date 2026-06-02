# [0091. Suspense](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0091.%20Suspense)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `<Suspense>` 是什么？](#3--suspense-是什么)
  - [3.1. suspense 这个英文单词的含义是？](#31-suspense-这个英文单词的含义是)
  - [3.2. `<Suspense>` 解决的核心问题是什么？](#32-suspense-解决的核心问题是什么)
  - [3.3. `<Suspense>` 组件稳定吗？](#33-suspense-组件稳定吗)
  - [3.4. 如果组件不是异步组件，也没有顶层 await 的逻辑，那还有必要使用 `<Suspense>` 吗？](#34-如果组件不是异步组件也没有顶层-await-的逻辑那还有必要使用-suspense-吗)
- [4. 🤔 哪些东西会被 `<Suspense>` 视为异步依赖？](#4--哪些东西会被-suspense-视为异步依赖)
  - [4.1. `async setup()`](#41-async-setup)
  - [4.2. 异步组件](#42-异步组件)
- [5. 🤔 `default` 和 `fallback` 插槽是怎么工作的？](#5--default-和-fallback-插槽是怎么工作的)
  - [5.1. 初次渲染](#51-初次渲染)
  - [5.2. 后续更新](#52-后续更新)
- [6. 🤔 `timeout`、事件和错误处理分别负责什么？](#6--timeout事件和错误处理分别负责什么)
  - [6.1. `timeout`](#61-timeout)
  - [6.2. 事件](#62-事件)
  - [6.3. 错误处理](#63-错误处理)
- [7. 🤔 `<Suspense>` 和 `<Transition>`、`<KeepAlive>`、`<RouterView>` 该怎么配合？](#7--suspense-和-transitionkeepaliverouterview-该怎么配合)
- [8. 🤔 嵌套 Suspense 时 `suspensible` 有什么用？](#8--嵌套-suspense-时-suspensible-有什么用)
- [9. 🤔 异步组件和 `<Suspense>` 是什么关系？](#9--异步组件和-suspense-是什么关系)
  - [9.1. `<Suspense>` 简介](#91-suspense-简介)
  - [9.2. 两者之间的关系](#92-两者之间的关系)
  - [9.3. 配合使用](#93-配合使用)
  - [9.4. 错误处理的最佳实践 - 外层用 `onErrorCaptured` 兜底](#94-错误处理的最佳实践---外层用-onerrorcaptured-兜底)
  - [9.5. 小结](#95-小结)
- [10. 💻 demos.1 - 基本用法：按需加载](#10--demos1---基本用法按需加载)
- [11. 💻 demos.2 - 加载状态与错误状态](#11--demos2---加载状态与错误状态)
- [12. 💻 demos.3 - loader 缓存机制](#12--demos3---loader-缓存机制)
- [13. 💻 demos.4 - 与 Suspense 配合使用](#13--demos4---与-suspense-配合使用)
- [14. 💻 demos.5 - 加载失败重试机制](#14--demos5---加载失败重试机制)
- [15. 🔗 引用](#15--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 功能定位
- 异步依赖
- 顶层 await
- fallback
- timeout
- 三个事件
- 错误处理
- 嵌套边界

## 2. 🫧 评价

`<Suspense>` 的价值主要体现在复杂异步组件树里，但它本身仍是实验性功能，所以你既要知道怎么用，也要知道别把它当成“全能异步方案”。高频考点是异步依赖识别、插槽行为、`timeout` 和与其他内置组件的嵌套顺序。

## 3. 🤔 `<Suspense>` 是什么？

### 3.1. suspense 这个英文单词的含义是？

Suspense 在英语中的本意是：

- 悬而未决、暂时中止
- 一种等待、不确定、悬念的状态

在文学或影视中，“suspense” 通常指那种紧张地等待某个结果揭晓的感觉。

### 3.2. `<Suspense>` 解决的核心问题是什么？

`<Suspense>` 用来协调“整棵组件子树里的异步依赖”。

如果没有它，当一个页面里有多个异步组件或多个 `async setup()` 组件时，常见情况是：

- 这里一个 loading
- 那里一个 loading
- 内容分批出现
- 页面完成时机不统一

`<Suspense>` 的目标就是把这些异步依赖收口到一个上层边界里，在它们都准备好之前，用统一的后备内容兜底。

### 3.3. `<Suspense>` 组件稳定吗？

至少现在（26.05 Vue 3.5）还不是一个稳定版，还是一个实验性功能。

官方文档的开头就说明了：

::: warning 实验性功能

`<Suspense>` 是一项实验性功能。它不一定会最终成为稳定功能，并且在稳定之前相关 API 也可能会发生变化。

:::

### 3.4. 如果组件不是异步组件，也没有顶层 await 的逻辑，那还有必要使用 `<Suspense>` 吗？

没必要。

如果组件树中既没有异步组件，也没有任何顶层 await，那么 `<Suspense>` 不会捕获到任何异步依赖。它会认为所有内容都已就绪，直接从开始就显示 default 插槽，fallback 永远不会被触发。

这种情况下使用 `<Suspense>` 是多余的，没有实际意义，直接渲染组件即可。

## 4. 🤔 哪些东西会被 `<Suspense>` 视为异步依赖？

官方文档明确提到两类：

1. 带异步 `setup()` 的组件。
2. 异步组件。

### 4.1. `async setup()`

```js
export default {
  async setup() {
    const response = await fetch('/api/posts')
    const posts = await response.json()

    return { posts }
  },
}
```

如果你使用 `<script setup>`，顶层 `await` 也会让这个组件自动成为异步依赖：

```html
<script setup>
  const response = await fetch('/api/posts')
  const posts = await response.json()
</script>

<template> {{ posts }} </template>
```

### 4.2. 异步组件

异步组件默认就是 `suspensible` 的，也就是说如果组件树上层存在 `<Suspense>`，它会被纳入这个边界统一管理。

如果你显式把异步组件设为 `suspensible: false`，那它就不再交给 `<Suspense>` 统一控制，而是自己处理加载态。

## 5. 🤔 `default` 和 `fallback` 插槽是怎么工作的？

`<Suspense>` 有两个最重要的插槽：

- `#default`
- `#fallback`

```html
<Suspense>
  <Dashboard />

  <template #fallback> 正在加载... </template>
</Suspense>
```

这两个插槽都只允许一个直接子节点。

它的执行逻辑可以分成两个阶段理解：

### 5.1. 初次渲染

初次渲染时，Vue 会先在内存里尝试渲染 `default` 内容。

- 如果没碰到异步依赖，直接进入完成状态，显示默认内容。
- 如果碰到了异步依赖，就进入挂起状态，显示 `fallback`。

等所有异步依赖都解析完成后，再把默认内容真正显示出来。

### 5.2. 后续更新

进入完成状态后，并不是组件树里任何一个更深层异步依赖更新都会重新回退。只有默认插槽的根节点被替换时，`<Suspense>` 才可能重新进入挂起状态。

这点很重要，它意味着 `<Suspense>` 不是一个“全树任何异步都自动闪 fallback”的组件。

## 6. 🤔 `timeout`、事件和错误处理分别负责什么？

### 6.1. `timeout`

当 `<Suspense>` 已经处于完成状态后，如果默认内容被新的异步内容替换，它不会立刻显示 `fallback`，而是会先继续展示旧内容一段时间。

这个等待时长可以用 `timeout` 控制：

```html
<Suspense :timeout="0">
  <Dashboard />

  <template #fallback> 正在加载... </template>
</Suspense>
```

`timeout="0"` 表示一旦进入新的挂起状态，立即切到 `fallback`。

### 6.2. 事件

`<Suspense>` 会触发 3 个事件：

- `pending`
- `resolve`
- `fallback`

它们分别表示：

- 进入挂起状态
- 默认内容完成解析
- 后备内容真正显示出来

这些事件很适合用来驱动全局 loading 条、骨架屏埋点或页面切换反馈。

### 6.3. 错误处理

`<Suspense>` 自己不负责错误处理。

如果异步依赖内部抛错，你需要在父级组件中通过：

- `errorCaptured`
- `onErrorCaptured()`

来捕获和处理。

这意味着 `<Suspense>` 解决的是“等待什么、何时显示 fallback”，不是“如何处理异常”。

## 7. 🤔 `<Suspense>` 和 `<Transition>`、`<KeepAlive>`、`<RouterView>` 该怎么配合？

这部分官方特别强调了嵌套顺序。

常见写法如下：

```html
<RouterView v-slot="{ Component }">
  <template v-if="Component">
    <Transition mode="out-in">
      <KeepAlive>
        <Suspense>
          <component :is="Component" />

          <template #fallback> 正在加载... </template>
        </Suspense>
      </KeepAlive>
    </Transition>
  </template>
</RouterView>
```

这套组合里：

- `<Transition>` 负责切换动画
- `<KeepAlive>` 负责页面缓存
- `<Suspense>` 负责异步依赖协调

另外还有一个很容易误会的点：Vue Router 的路由懒加载虽然也用了动态导入，但它和“异步组件”不是一回事，因此路由懒加载本身目前不会触发 `<Suspense>`。不过路由组件内部如果继续使用了异步组件或异步 `setup()`，这些后代依赖仍然会触发 `<Suspense>`。

## 8. 🤔 嵌套 Suspense 时 `suspensible` 有什么用？

这个能力在 3.3+ 才支持。

假设你有外层异步组件和内层异步组件：

```html
<Suspense>
  <component :is="DynamicAsyncOuter">
    <Suspense suspensible>
      <component :is="DynamicAsyncInner" />
    </Suspense>
  </component>
</Suspense>
```

如果不给内部 `<Suspense>` 加 `suspensible`，它会被父级视为同步组件，然后自己维护自己的 fallback 和修补周期。这样在双层动态异步切换时，可能会出现空节点或多次 patch，体验并不理想。

加上 `suspensible` 后，内部边界会把异步依赖处理权交给父级 `<Suspense>`，从而让整个异步协调更加统一。

你可以把它理解成：

- 不加 `suspensible`，子边界自己兜底。
- 加了 `suspensible`，子边界把控制权上交给父边界。

## 9. 🤔 异步组件和 `<Suspense>` 是什么关系？

### 9.1. `<Suspense>` 简介

`<Suspense>` 是一个内置组件（目前 `26.05` 仍为实验性功能），用来在组件树中协调对异步依赖的处理。它让我们可以在组件树上层等待下层的多个嵌套异步依赖项解析完成，并可以在等待时渲染一个加载状态。

问：Suspense 在等什么？

答：等待异步依赖。

::: details 来看看官方文档的回答：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-17-14-04-49.png)

:::

`<Suspense>` 可以等待的异步依赖有两种：

::: code-group

```js [1]
// 异步依赖可以是：
// 带有异步 setup() 钩子的组件
// 这也包含了使用 <script setup> 时有顶层 await 表达式的组件
const Comp = {
  // async setup => 这是 Suspense 关注的
  async setup() {
    const data = await fetch('/api/user') // 等数据返回
    return { data }
  },
}
```

```js [2]
// 异步依赖可以是：
// 异步组件
const AsyncComp = defineAsyncComponent(() => import('./Comp.vue'))
```

:::

Suspense 有两个插槽：default 和 fallback，分别用于显式不同状态下的内容。

在上述这个示例中，Suspense 会等这个 `await fetch('/api/user')` 完成，等待期间显示插槽 `#fallback`，完成后切换到插槽 `#default`。

使用示例：

```html
<template>
  <Suspense>
    <!-- 主要内容（可能包含异步依赖） -->
    <template #default>
      <!-- Suspense 可以嵌套多个异步组件
       它会等待所有异步依赖都解析完成后才切换到 default 内容 -->
      <div class="dashboard">
        <!-- 三个异步组件都加载完成后才会显示 -->
        <AsyncHeader />
        <AsyncSidebar />
        <AsyncMainContent />
      </div>
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

### 9.2. 两者之间的关系

异步组件（defineAsyncComponent）可以和 Vue 的内置组件 `<Suspense>` 配合使用。

你可以把它们理解成两层不同的职责：

- 异步组件负责「这个组件如何延迟加载」
- `<Suspense>` 负责「当子树里出现异步依赖时，整个区域如何统一显示 fallback 内容」

异步组件 => 自己管自己的加载状态：

```js
const Comp = defineAsyncComponent(() => import('./Comp.vue'))
```

`<Suspense>` => 管的是下层组件的异步依赖：

```html
<Suspense>
  <template #default><SyncComp /></template>
  <template #fallback>加载中...</template>
</Suspense>
```

### 9.3. 配合使用

```js
const AsyncComp = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  suspensible: true, // 默认值，交给 Suspense 管
})
// suspensible: true => 状态由 Suspense 统一管理
// suspensible: false => 状态由组件自己的 loadingComponent 管
```

异步组件默认就是“suspensible”的。这意味着如果组件关系链上有一个 `<Suspense>`，那么这个异步组件就会被当作这个 `<Suspense>` 的一个异步依赖。在这种情况下，加载状态是由 `<Suspense>` 控制，而该组件自己的加载、报错、延时和超时等选项都将被忽略。

```html
<Suspense>
  <template #default>
    <AsyncComp />
  </template>
  <template #fallback> 加载中... </template>
</Suspense>
```

AsyncComp 的 chunk 加载是一个异步的 Promise，所以 `<Suspense>` 会等它加载完成后再切换到 `#default`。如果 AsyncComp 内部还有 async setup，那么 `<Suspense>` 还会继续等 async setup 里的异步操作完成。

```html
<Suspense>
  <template #default>
    <AsyncComp />
    <!-- 异步组件，内部还有 async setup -->
  </template>
  <template #fallback> 加载中... </template>
</Suspense>
```

在上述这种情况下，两个阶段叠加：

1. Suspense 等 AsyncComp 的 chunk 加载完成
2. Suspense 等 AsyncComp 内部的 async setup 完成
3. 两者都完成 -> 显示 `#default` 内容

### 9.4. 错误处理的最佳实践 - 外层用 `onErrorCaptured` 兜底

Suspense 内部的异步错误（如顶层 await 的 fetch 失败）不会被异步组件的 `onError` 捕获，需要外层用 `onErrorCaptured` 兜底。

```html
<template>
  <div v-if="error">
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

### 9.5. 小结

- 如果你的页面里只是单个低频组件想做延迟加载，通常直接用异步组件就够了
- 如果是一整片组件子树都可能进入异步等待态，`<Suspense>` 会更适合统一管理加载体验

::: tip

需要注意的是，Suspense 目前仍是实验性功能，API 可能在未来版本中发生变化。但其核心概念 => 「协调异步依赖的加载状态」在实际开发中已经被广泛使用。

:::

## 10. 💻 demos.1 - 基本用法：按需加载

::: code-group

```html [App.vue]
<script setup>
  import { defineAsyncComponent, ref } from 'vue'

  // defineAsyncComponent + import() 是最常见的异步组件用法
  // 构建工具（Vite/Webpack）会将 import() 识别为代码分割点
  // 此时组件代码不会被打进主包，只有首次渲染时才会加载
  const AsyncPanel = defineAsyncComponent(() => import('./AsyncPanel.vue'))

  const visible = ref(false)
</script>

<template>
  <div>
    <button @click="visible = !visible">
      {{ visible ? '隐藏面板' : '显示面板' }}
    </button>
    <p>勾选后才会渲染 AsyncPanel，此时才触发加载：</p>
    <AsyncPanel v-if="visible" />
    <!-- 异步组件和普通组件在使用上几乎没有区别，都是通过组件标签在模板中使用 -->
  </div>
</template>
```

```html [AsyncPanel.vue]
<script setup>
  // 模拟一个加载耗时 1s 的异步组件
  // 在实际项目中，这里可能是一个大体积的图表组件、编辑器等
  console.log('AsyncPanel 已加载并执行')

  const message = '我是异步加载的面板组件'
</script>

<template>
  <div style="margin-top: 12px; padding: 12px; border: 1px solid #ccc;">
    <p>{{ message }}</p>
  </div>
</template>
```

:::

::: swiper

![默认状态](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-17-15-00-36.png)

![显示面板](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-17-15-00-51.png)

:::

## 11. 💻 demos.2 - 加载状态与错误状态

::: code-group

```html [App.vue]
<script setup>
  import { defineAsyncComponent, ref } from 'vue'

  // 展示加载中的占位组件
  import LoadingComp from './LoadingComp.vue'

  // 展示加载失败的错误组件
  import ErrorComp from './ErrorComp.vue'

  // 使用对象写法配置加载/错误状态
  const SlowChart = defineAsyncComponent({
    loader: () =>
      new Promise((resolve) => {
        // 模拟 2 秒的网络延迟
        setTimeout(() => {
          import('./SlowChart.vue').then(resolve)
        }, 2000)
      }),
    loadingComponent: LoadingComp,
    errorComponent: ErrorComp,
    delay: 200,
    timeout: 5000,
  })

  // 模拟一个必定加载失败的组件
  const FailComp = defineAsyncComponent({
    loader: () =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network Error')), 500)
      }),
    loadingComponent: LoadingComp,
    errorComponent: ErrorComp,
    delay: 200,
    timeout: 5000,
  })

  const showSlow = ref(false)
  const showFail = ref(false)
</script>

<template>
  <div>
    <button @click="showSlow = !showSlow">
      {{ showSlow ? '隐藏慢加载组件' : '展示慢加载组件' }}
    </button>
    <button @click="showFail = !showFail" style="margin-left: 8px">
      {{ showFail ? '隐藏失败组件' : '展示失败组件' }}
    </button>

    <div style="margin-top: 16px">
      <h4>场景 A：加载较慢（2s）</h4>
      <SlowChart v-if="showSlow" />
    </div>

    <div style="margin-top: 16px">
      <h4>场景 B：加载失败</h4>
      <FailComp v-if="showFail" />
    </div>
  </div>
</template>
```

```html [SlowChart.vue]
<script setup>
  const data = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
</script>

<template>
  <div style="padding: 8px; border: 1px solid #4fc08d;">
    <p>📊 图表组件加载完成</p>
    <p>数据：{{ data.join(', ') }}</p>
  </div>
</template>
```

```html [LoadingComp.vue]
<template>
  <p style="color: #888">⏳ 组件加载中...</p>
</template>
```

```html [ErrorComp.vue]
<template>
  <p style="color: red">❌ 组件加载失败！</p>
</template>
```

:::

![gif](./assets/1.gif)

## 12. 💻 demos.3 - loader 缓存机制

::: code-group

```html [App.vue]
<script setup>
  import { defineAsyncComponent, ref } from 'vue'

  // 全局计数器：记录 loader 实际被调用的次数
  // 在浏览器控制台观察：无论卸载/重新挂载多少次，loader 只被调用 1 次
  let loadCount = ref(0)

  const CachedComp = defineAsyncComponent(() => {
    loadCount.value++
    console.log(`[loader] 第 ${loadCount.value} 次调用`)
    return import('./CachedComp.vue')
  })

  const visible = ref(true)
  const key = ref(0)
</script>

<template>
  <div>
    <p>打开控制台，反复点击下面的按钮，观察 loader 调用次数：{{ loadCount }}</p>
    <button @click="visible = !visible">
      {{ visible ? '卸载组件' : '重新挂载' }}
    </button>
    <button @click="key++" style="margin-left: 8px;">
      强制重新渲染（改变 key）
    </button>

    <div style="margin-top: 12px;">
      <!-- key 变化会导致组件完全销毁并重建 -->
      <!-- 但 loader 不会重新调用，因为 resolvedComp 已缓存 -->
      <CachedComp v-if="visible" :key="key" />
    </div>
  </div>
</template>
```

```html [CachedComp.vue]
<script setup>
  // 每次组件实例创建时都会执行这段代码
  // 但 loader（动态 import）只会执行一次
  const now = new Date().toLocaleString()
</script>

<template>
  <div style="padding: 8px; border: 1px solid #f0ad4e">
    <p>我是 CachedComp，实例创建时间：{{ now }}</p>
    <p style="font-size: 13px; color: #888">
      组件代码只下载一次，后续挂载均使用缓存
    </p>
  </div>
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-17-16-40-36.png)

测试：不断卸载、挂载、重新渲染，你会发现 loadCount 始终都是 1，不会增加，但是时间会实时刷新。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-17-16-40-46.png)

demo 里两个按钮的作用是：

- 卸载/挂载：销毁实例再创建新实例 => 时间变了，但 loader 没重新调用
- 改变 key：强制销毁旧实例并用新实例替换 => 效果同上，进一步证明即使 Vue 认为这是一个“全新的组件”，loader 也不会重复调用

这就像你 `import` 一个模块，模块文件只下载一次（缓存），但你每次 `new` 一个类，构造函数里的代码都会重新跑（新实例）。

- `defineAsyncComponent(() => import('./CachedComp.vue'))` 里的回调函数 => 只跑了 1 次，这就是「缓存」
- 但每次你挂载 `<CachedComp />`，Vue 都会创建一个「全新的组件实例」，所以 `<script setup>` 里的 `const now = new Date()` 自然会重新执行，拿到新时间

## 13. 💻 demos.4 - 与 Suspense 配合使用

::: code-group

```html [App.vue]
<script setup>
  import { defineAsyncComponent, ref } from 'vue'

  // 异步组件默认是 "suspensible" 的
  // 被 Suspense 包裹后，自身的 loadingComponent / errorComponent / delay / timeout 均被忽略
  // 加载状态统一由 Suspense 的 #fallback 插槽控制
  const AsyncWidget = defineAsyncComponent(() => import('./AsyncWidget.vue'))

  const show = ref(true)
</script>

<template>
  <div>
    <button @click="show = !show">{{ show ? '卸载' : '重新挂载' }}</button>
    <div style="margin-top: 12px;">
      <!--
        Suspense 等待其 #default 插槽下所有异步依赖完成：
        1. AsyncWidget 的 chunk 加载（取决于网络环境，通常比较快）
        2. AsyncWidget 内部的 async setup（约 3s，这是组件内部通过 setTimeout 模拟的时间）
        两者都完成后，才展示 #default 的内容。
      -->
      <Suspense v-if="show">
        <template #default>
          <AsyncWidget />
        </template>
        <template #fallback>
          <p>⏳ Suspense 统一 loading...</p>
        </template>
      </Suspense>
    </div>
  </div>
</template>
```

```html [AsyncWidget.vue]
<script setup>
  // 异步 setup：Suspense 会等待它完成
  const res = await new Promise((resolve) => {
    setTimeout(() => resolve({ status: 'ok', data: [1, 2, 3] }), 3000)
  })
</script>

<template>
  <div style="padding: 8px; border: 1px solid #4fc08d;">
    <p>✅ 数据已就绪：{{ res.data.join(', ') }}</p>
    <p style="font-size: 13px; color: #888;">
      async setup 完成后，Suspense 才切换到 default 插槽
    </p>
  </div>
</template>
```

:::

![gif](./assets/2.gif)

## 14. 💻 demos.5 - 加载失败重试机制

::: code-group

```html [App.vue]
<script setup>
  import { defineAsyncComponent, ref } from 'vue'
  import ErrorComp from './ErrorComp.vue'

  // 模拟：前 2 次加载失败，第 3 次成功
  let attempt = 0
  const maxFailures = 2

  // onError 回调让你决定加载失败后的行为：
  // - 调用 retry() 重新尝试
  // - 调用 fail() 标记为失败，渲染 errorComponent
  const ResilientComp = defineAsyncComponent({
    loader: () => {
      attempt++
      console.log(`[loader] 第 ${attempt} 次尝试`)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (attempt <= maxFailures) {
            reject(new Error(`Attempt ${attempt} failed`))
          } else {
            resolve(import('./ResilientComp.vue'))
          }
        }, 500)
      })
    },
    errorComponent: ErrorComp,
    delay: 100,
    onError(error, retry, fail, attempts) {
      console.log(`[onError] 第 ${attempts} 次失败: ${error.message}`)
      // fail(); // 模拟首次失败就直接推向失败
      if (attempts <= maxFailures) {
        console.log(`[onError] 自动重试...`)
        retry() // 调用 retry 会重置 pendingRequest 并重新执行 loader
      } else {
        fail() // 调用 fail 渲染 errorComponent
      }
    },
  })

  const show = ref(false)
</script>

<template>
  <div>
    <button
      @click="
        show = !show;
        attempt = 0;
      "
    >
      {{ show ? '卸载' : '加载（模拟前2次失败）' }}
    </button>
    <p style="margin-top: 8px; font-size: 13px; color: #888">
      打开控制台观察重试过程：前 2 次失败后自动 retry，第 3 次成功加载
    </p>
    <div style="margin-top: 12px">
      <ResilientComp v-if="show" />
    </div>
  </div>
</template>
```

```html [ResilientComp.vue]
<template>
  <div style="padding: 8px; border: 1px solid #4fc08d;">
    <p>🎉 组件重试加载成功！</p>
  </div>
</template>
```

```html [ErrorComp.vue]
<template>
  <p style="color: red">❌ 彻底加载失败</p>
</template>
```

:::

初始状态：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-17-16-59-59.png)

点击「加载」按钮后：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-17-17-00-13.png)

控制台输出结果：

```
[loader] 第 1 次尝试
[onError] 第 1 次失败: Attempt 1 failed
[onError] 自动重试...
[loader] 第 2 次尝试
[onError] 第 2 次失败: Attempt 2 failed
[onError] 自动重试...
[loader] 第 3 次尝试
```

在 `onError` 回调中，我们可以根据失败的次数来决定是继续重试还是放弃重试，这为我们提供了一个非常灵活的错误处理机制，适用于网络不稳定等场景。

如果在失败的之后，我们决定放弃重试，直接将结果推向渲染失败，只需要调用 `fail()` 即可：

```js {3}
const ResilientComp = defineAsyncComponent({
  onError(error, retry, fail, attempts) {
    fail() // 模拟首次失败就直接推向失败
  },
})
```

这时候会直接渲染错误组件 `ErrorComp`：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-17-17-02-56.png)

## 15. 🔗 引用

- [Vue.js 官方文档 - Suspense][1]
- [Vue.js 官方文档 - `<Suspense>` API][2]
- [Vue.js 官方文档 - 异步组件][3]
- [Vue.js 官方文档 - `onErrorCaptured()`][4]

[1]: https://cn.vuejs.org/guide/built-ins/suspense.html
[2]: https://cn.vuejs.org/api/built-in-components.html#suspense
[3]: https://cn.vuejs.org/guide/components/async.html
[4]: https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured
