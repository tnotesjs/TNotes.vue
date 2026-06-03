# [0091. Suspense](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0091.%20Suspense)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `<Suspense>` 是什么？](#3--suspense-是什么)
  - [3.1. suspense 这个英文单词的含义是？](#31-suspense-这个英文单词的含义是)
  - [3.2. 作用](#32-作用)
  - [3.3. 稳定性](#33-稳定性)
- [4. 🤔 哪些东西会被 `<Suspense>` 视为异步依赖？](#4--哪些东西会被-suspense-视为异步依赖)
  - [4.1. 异步依赖](#41-异步依赖)
  - [4.2. `async setup()`](#42-async-setup)
  - [4.3. 异步组件](#43-异步组件)
- [5. 🤔 `<Suspense>` 都有哪些插槽？](#5--suspense-都有哪些插槽)
  - [5.1. `default` 和 `fallback` 插槽](#51-default-和-fallback-插槽)
  - [5.2. 注意：插槽内容中的节点数量](#52-注意插槽内容中的节点数量)
  - [5.3. `default` 和 `fallback` 插槽的切换逻辑是什么？什么情况下会再次回退到 `fallback`？](#53-default-和-fallback-插槽的切换逻辑是什么什么情况下会再次回退到-fallback)
    - [初次渲染](#初次渲染)
    - [后续更新](#后续更新)
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
- [10. 💻 demos.1 - 异步组件 `defineAsyncComponent` 与 `<Suspense>` 配合使用](#10--demos1---异步组件-defineasynccomponent-与-suspense-配合使用)
- [11. 💻 demos.2 - 插槽内容中的节点数量问题 - 单个根节点](#11--demos2---插槽内容中的节点数量问题---单个根节点)
- [12. 💻 demos.3 - 插槽内容中的节点数量问题 - 特殊的 `v-if` 注释节点](#12--demos3---插槽内容中的节点数量问题---特殊的-v-if-注释节点)
- [13. 💻 demos.4 - 插槽内容中的节点数量问题 - 多个子节点，无法确定单一根](#13--demos4---插槽内容中的节点数量问题---多个子节点无法确定单一根)
- [14. 💻 demos.5 - `default` 和 `fallback` 插槽的切换逻辑 - 根节点类型变化，回退到 `fallback`](#14--demos5---default-和-fallback-插槽的切换逻辑---根节点类型变化回退到-fallback)
- [15. 💻 demos.6 - `default` 和 `fallback` 插槽的切换逻辑 - 持续触发异步，但只有首次触发 `fallback`](#15--demos6---default-和-fallback-插槽的切换逻辑---持续触发异步但只有首次触发-fallback)
- [16. 🔗 引用](#16--引用)

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

### 3.2. 作用

`<Suspense>` 用来协调“整棵组件子树里的异步依赖”。

如果没有它，当一个页面里有多个异步组件或多个 `async setup()` 组件时，常见情况是：

- 这里一个 loading
- 那里一个 loading
- 内容分批出现
- 页面完成时机不统一

`<Suspense>` 的目标就是把这些异步依赖收口到一个上层边界里，在它们都准备好之前，用统一的后备内容兜底。

### 3.3. 稳定性

至少现在（26.05 Vue 3.5）还不是一个稳定版，还是一个实验性功能。

官方文档的开头就说明了：

::: warning 实验性功能

`<Suspense>` 是一项实验性功能。它不一定会最终成为稳定功能，并且在稳定之前相关 API 也可能会发生变化。

:::

## 4. 🤔 哪些东西会被 `<Suspense>` 视为异步依赖？

### 4.1. 异步依赖

官方文档明确提到两类：

1. 带异步 `setup()` 的组件
2. 异步组件

::: tip 如果组件不是异步组件，也没有顶层 await 的逻辑，那还有必要使用 `<Suspense>` 吗？

没必要。

如果组件树中既没有异步组件，也没有任何顶层 await，那么 `<Suspense>` 不会捕获到任何异步依赖。它会认为所有内容都已就绪，直接从开始就显示 default 插槽，fallback 永远不会被触发。

这种情况下使用 `<Suspense>` 是多余的，没有实际意义，直接渲染组件即可。

:::

### 4.2. `async setup()`

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

### 4.3. 异步组件

异步组件默认就是 `suspensible` 的，也就是说如果组件树上层存在 `<Suspense>`，它会被纳入这个边界统一管理。

```js
const AsyncPanel = defineAsyncComponent(
  () => import('./components/AsyncPanel.vue'),
  // 默认就是 suspensible: true
)
```

如果你显式把异步组件设为 `suspensible: false`，那它就不再交给 `<Suspense>` 统一控制，而是自己处理加载态。

```js
const AsyncPanel = defineAsyncComponent(
  () => import('./components/AsyncPanel.vue'),
  suspensible: false, // 这个组件自己管自己的加载状态，不受 Suspense 影响
)
```

## 5. 🤔 `<Suspense>` 都有哪些插槽？

### 5.1. `default` 和 `fallback` 插槽

`<Suspense>` 有两个插槽：

- `#default`，默认插槽，异步内容就绪后显示的内容
- `#fallback`，后备插槽，异步内容未就绪时显示的内容

```html
<Suspense>
  <template #default>
    <!-- 默认插槽：
     异步内容最终就绪后实际渲染的内容。
     只有当所有异步依赖全部 resolve 后，才会展示该插槽。 -->
    <AsyncComponent />
  </template>
  <template #fallback>
    <!-- fallback 插槽：
     当有异步内容尚未就绪时，会显示 #fallback 插槽中的后备内容。
     通常会在这个插槽中显示加载状态或占位符。 -->
    <Loading />
    <!-- 或者直接显示一段占位提示文案，比如：正在加载... -->
  </template>
</Suspense>
```

### 5.2. 注意：插槽内容中的节点数量

`default` 和 `fallback` 插槽只允许一个“可识别”的直接子节点。

| 情况                       | 结果                                  |
| -------------------------- | ------------------------------------- |
| 单个根节点                 | 正常工作                              |
| 多个子节点，无法确定单一根 | 开发模式下警告，变为 Comment 空占位符 |

::: tip “可识别”的直接子节点

❌ 错误说法：`default` 和 `fallback` 插槽只允许一个直接子节点。

✅ 正确说法：`default` 和 `fallback` 插槽只允许一个“可识别”的直接子节点。

当插槽内容是数组（识别到多个节点）时，会调用 `filterSingleRoot` 寻找单一根节点。

- 在搜索过程中，会自动过滤掉普通注释节点。
- 这里有个小细节：如果是 `<!--v-if-->` 注释节点，Vue 也会把它当成一个占位符节点来处理，不会被过滤。因为源码实现层面的判定逻辑是 `if (child.type !== Comment || child.children === 'v-if') { ... }`。正常情况下，不会有人刻意写 `<!--v-if-->` 这个注释，它是 Vue 编译器自动生成的一个占位注释，代表"这个位置原本应该有一个节点"的语义占位符。如果你想要验证的话，可以利用下面的 DEMO 在 Vue SFC 中快速验证下。

在 vuejs/core 中相关源码位置：

- `packages/runtime-core/src/components/Suspense.ts` => `normalizeSuspenseSlot`
- `packages/runtime-core/src/vnode.ts` => `normalizeVNode`
- `packages/runtime-core/src/componentRenderUtils.ts` => `filterSingleRoot`

:::

### 5.3. `default` 和 `fallback` 插槽的切换逻辑是什么？什么情况下会再次回退到 `fallback`？

`default` 和 `fallback` 插槽的执行逻辑可以分成两个阶段理解：

#### 初次渲染

初次渲染时，Vue 会先在内存里尝试渲染 `default` 内容。

- 如果没碰到异步依赖，直接进入完成状态，显示默认内容。
- 如果碰到了异步依赖，就进入挂起状态，显示 `fallback`，等所有异步依赖都解析完成后，再把默认内容真正显示出来。

#### 后续更新

进入完成状态后，并不是子树里任何一个深层异步依赖更新都会触发重新挂起。是否重新进入挂起状态，取决于默认插槽根节点的 VNode 类型是否改变：

- 根节点 VNode 类型不变（如同一个组件的 props 或事件更新） => 只走普通 patch，不会显示 fallback。
- 根节点 VNode 类型改变（例如从组件 A 切换到组件 B） => `<Suspense>` 才“可能”重新进入挂起状态。

注意这里的“可能”：即使根节点类型变了，如果新分支内部没有异步依赖，也会立即 resolve，不会展示 fallback。

也就是说，`<Suspense>` 不是一个“全树任何异步都自动闪 fallback”的组件，它只会在根节点类型切换时重新评估是否需要进入挂起状态。

那么如果一个组件的异步行为完成之后，再次触发异步行为，会回退到挂起状态 `fallback` 吗？

不会。因为 `<Suspense>` 只追踪通过 `setup` 返回的 Promise（即顶层 `await` 或 `async setup()`）注册的异步依赖，且 `setup` 只执行一次。组件内部的其他异步操作（如 `watchEffect`、事件处理器中的 `await` 等）不会被 `<Suspense>` 感知，不会触发 fallback。

## 6. 🤔 `timeout`、事件和错误处理分别负责什么？

### 6.1. `timeout`

三种行为对比：

| `timeout` 值 | 后续更新有异步依赖时的行为 |
| --- | --- |
| 未设置（内部为 `-1`） | 继续显示旧内容，等新内容 resolve 后再切换，**不显示 fallback** |
| `0` | 立即切换到 fallback |
| `> 0`（如 `10`） | 等待 N 毫秒后切换到 fallback |

注意这个 `timeout` 逻辑只影响后续更新（`patchSuspense`）。初次渲染时没有旧内容可以保留，只要有异步依赖就会直接显示 fallback，不受 `timeout` 影响。

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

## 10. 💻 demos.1 - 异步组件 `defineAsyncComponent` 与 `<Suspense>` 配合使用

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

## 11. 💻 demos.2 - 插槽内容中的节点数量问题 - 单个根节点

::: code-group

```html [App.vue]
<script setup>
  import AsyncComp from './AsyncComp.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <!-- 可以有额外的注释节点 -->
      <AsyncComp />
    </template>
    <template #fallback>
      <!-- 可以有额外的注释节点 -->
      <p>Loading…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncComp.vue]
<script setup>
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('Hello, Suspense!'), 1000)
  })
</script>

<template>
  <div>{{ data }}</div>
</template>
```

:::

最终效果：

1. 先展示 Loading...
2. 1s 后展示 Hello, Suspense!

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-14-29-36.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-14-29-45.png)

:::

## 12. 💻 demos.3 - 插槽内容中的节点数量问题 - 特殊的 `v-if` 注释节点

::: code-group

```html [App.vue]
<script setup>
  import AsyncComp from './AsyncComp.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <!--v-if-->
      <AsyncComp />
    </template>
    <template #fallback>
      <p>Loading…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncComp.vue]
<script setup>
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('Hello, Suspense!'), 1000)
  })
</script>

<template>
  <div>{{ data }}</div>
</template>
```

:::

这种情况下，页面无法正常渲染，并且会在开发环境下抛出警告信息：

::: warning

`[Vue warn]: <Suspense> slots expect a single root node.`

:::

## 13. 💻 demos.4 - 插槽内容中的节点数量问题 - 多个子节点，无法确定单一根

::: code-group

```html [App.vue]
<script setup>
  import AsyncA from './AsyncA.vue'
  import AsyncB from './AsyncB.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <AsyncA />
      <AsyncB />
    </template>
    <template #fallback>
      <p>Loading…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncA.vue]
<script setup>
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('A'), 1000)
  })
</script>

<template>
  <div>{{ data }}</div>
</template>
```

```html [AsyncB.vue]
<script setup>
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('B'), 2000)
  })
</script>

<template>
  <div>{{ data }}</div>
</template>
```

:::

这种情况下，页面无法正常渲染，并且会在开发环境下抛出警告信息：

::: warning

`[Vue warn]: <Suspense> slots expect a single root node.`

:::

对应的真实 DOM 结构中，会插入一个空的注释节点：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-14-55-47.png)

## 14. 💻 demos.5 - `default` 和 `fallback` 插槽的切换逻辑 - 根节点类型变化，回退到 `fallback`

::: code-group

```html [App.vue]
<script setup>
  import { ref } from 'vue'
  import AsyncA from './AsyncA.vue'
  import AsyncB from './AsyncB.vue'

  const flag = ref(true)
</script>

<template>
  <div style="padding: 20px;">
    <button @click="flag = !flag">切换组件</button>
    <!--
      timeout="0"：根节点类型切换时，立即展示 fallback，不做延迟。
      每次点击按钮，根节点从 AsyncA ↔ AsyncB 切换，
      isSameVNodeType 返回 false，进入 else 分支重新挂起。
      因为新组件有 async setup（suspense.deps > 0），所以会展示 fallback。
    -->
    <Suspense timeout="0">
      <template #default>
        <AsyncA v-if="flag" />
        <AsyncB v-else />
      </template>
      <template #fallback>
        <p style="color: gray; font-size: 24px; padding: 20px;">Loading…</p>
      </template>
    </Suspense>
  </div>
</template>
```

```html [AsyncA.vue]
<script setup>
  // async setup → 被 Suspense 追踪为异步依赖
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('A（等待 1s）'), 1000)
  })
</script>

<template>
  <div style="color: blue; font-size: 24px; padding: 20px;">{{ data }}</div>
</template>
```

```html [AsyncB.vue]
<script setup>
  // async setup → 被 Suspense 追踪为异步依赖
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('B（等待 1.5s）'), 1500)
  })
</script>

<template>
  <div style="color: red; font-size: 24px; padding: 20px;">{{ data }}</div>
</template>
```

:::

每次点击切换组件，页面会在下面状态中依次改变：

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-16-51-29.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-16-51-44.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-16-51-29.png)

![4](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-16-52-09.png)

:::

如果不加 `timeout="0"`，`Loading...` 只会在首次加载的时候出现，后续 A B 之间的切换都不会出现。

| `timeout` 值 | 后续更新有异步依赖时的行为 |
| --- | --- |
| 未设置（内部为 `-1`） | 继续显示旧内容，等新内容 resolve 后再切换，不显示 fallback |
| `0` | 立即切换到 fallback |
| `> 0`（如 `10`） | 等待 N 毫秒后切换到 fallback |

## 15. 💻 demos.6 - `default` 和 `fallback` 插槽的切换逻辑 - 持续触发异步，但只有首次触发 `fallback`

::: code-group

```html [App.vue]
<script setup>
  import AsyncComp from './AsyncComp.vue'
</script>

<template>
  <!--
    首次渲染：AsyncComp 的 async setup 被 Suspense 追踪，
    suspense.deps > 0，展示 fallback，等 setup resolve 后切换到 default。

    后续点击按钮：根节点始终是 AsyncComp，类型不变，
    走 isSameVNodeType 为 true 的普通 patch 分支。
    registerDep 中 isInPendingSuspense 为 false（pendingBranch 已清空），
    即使 watch 内部触发了新的异步操作，Suspense 也不会感知，不会回退到 fallback。
  -->
  <Suspense>
    <template #default>
      <AsyncComp />
    </template>
    <template #fallback>
      <p style="padding: 20px; color: gray; font-size: 24px;">Loading…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncComp.vue]
<script setup>
  import { ref, watch } from 'vue'

  const count = ref(0)
  const watchResult = ref('')
  const pending = ref(false)

  // async setup → 被 Suspense 追踪，只有这一次会触发 fallback
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('setup 就绪'), 1000)
  })

  // watch 中的异步操作 → 不被 Suspense 追踪
  // Suspense 只追踪 setup 阶段注册的 Promise，watch 是运行时行为
  watch(count, async (newVal) => {
    pending.value = true
    watchResult.value = ''
    const result = await new Promise(resolve => {
      setTimeout(() => resolve(`watch 异步完成：count = ${newVal}`), 1000)
    })
    watchResult.value = result
    pending.value = false
  })
</script>

<template>
  <div style="padding: 20px;">
    <p style="font-size: 24px;">{{ data }}</p>
    <button @click="count++">count: {{ count }}</button>
    <!-- pending 状态由组件内部自行管理，与 Suspense 无关 -->
    <p v-if="pending" style="color: gray;">watch 异步中…</p>
    <p v-else style="color: green;">{{ watchResult }}</p>
  </div>
</template>
```

:::

![gif](./assets/1.gif)

## 16. 🔗 引用

- [Vue.js 官方文档 - Suspense][1]
- [Vue.js 官方文档 - `<Suspense>` API][2]
- [Vue.js 官方文档 - 异步组件][3]
- [Vue.js 官方文档 - `onErrorCaptured()`][4]

[1]: https://cn.vuejs.org/guide/built-ins/suspense.html
[2]: https://cn.vuejs.org/api/built-in-components.html#suspense
[3]: https://cn.vuejs.org/guide/components/async.html
[4]: https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured
