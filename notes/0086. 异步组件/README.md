# [0086. 异步组件](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0086.%20%E5%BC%82%E6%AD%A5%E7%BB%84%E4%BB%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是异步组件？为什么需要它？](#3--什么是异步组件为什么需要它)
- [4. 🤔 `defineAsyncComponent()` 的基本用法怎么写？](#4--defineasynccomponent-的基本用法怎么写)
- [5. 🤔 加载状态和错误状态应该怎么处理？](#5--加载状态和错误状态应该怎么处理)
- [6. 🤔 异步组件的真正加载时机是什么？](#6--异步组件的真正加载时机是什么)
- [7. 🤔 Vue 3.5+ 的惰性激活是什么？](#7--vue-35-的惰性激活是什么)
- [8. 🤔 异步组件和 `<Suspense>` 是什么关系？](#8--异步组件和-suspense-是什么关系)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 异步加载
- 异步定义
- 加载状态
- 错误状态
- 惰性激活
- Suspense

## 2. 🫧 评价

异步组件是工程化场景里的实用能力，它的重点不是「语法会不会写」，而是你是否知道它为什么能帮助做代码分割，以及加载、报错、SSR 激活这些边界该怎么处理。日常项目里最常见的是 `defineAsyncComponent(() => import(...))`，其余高级能力在大项目和 SSR 场景里会更有价值。

## 3. 🤔 什么是异步组件？为什么需要它？

异步组件，简单来说，就是「只有在真正需要渲染它时，才去加载它的组件实现」。

在大型项目里，页面和组件越来越多，如果所有组件都在首屏一次性打进主包里，首屏加载体积会变大，用户一开始就要下载很多暂时根本用不到的代码。

异步组件的目标就是把组件变成按需加载：

1. 先只加载当前必须用到的代码。
2. 某个组件真正被渲染时，再去请求它对应的代码块。

所以它的核心价值不是「写法更酷」，而是和构建工具的代码分割能力配合，降低首包压力。

## 4. 🤔 `defineAsyncComponent()` 的基本用法怎么写？

Vue 提供了 `defineAsyncComponent()` 来定义异步组件。它接收一个返回 Promise 的加载函数。

如果这个 Promise 最终 reject，异步组件就会进入失败分支；如果你配置了错误组件，它就会被渲染出来。

```js
import { defineAsyncComponent } from 'vue'

const AsyncPanel = defineAsyncComponent(
  () => import('./components/AsyncPanel.vue'),
)
```

然后它的使用方式和普通组件没有区别：

```html
<template>
  <AsyncPanel />
</template>
```

这里最常见的写法就是结合动态导入 `import()`，因为 Vite、Webpack 这类构建工具会把它识别成天然的代码分割点。

异步组件既可以局部定义：

```html
<script setup>
  import { defineAsyncComponent } from 'vue'

  const AdminPage = defineAsyncComponent(
    () => import('./components/AdminPage.vue'),
  )
</script>
```

也可以在应用入口做全局注册：

```js
app.component(
  'AdminPage',
  defineAsyncComponent(() => import('./components/AdminPage.vue')),
)
```

还有一个很容易被忽略的点：异步组件只是「外面包了一层加载器」的包装组件。它接收到的 props 和 slots 最终都会继续传给真正加载出来的内部组件，所以你可以相对无缝地把普通组件替换成异步版本。

## 5. 🤔 加载状态和错误状态应该怎么处理？

异步加载一定会遇到两个现实问题：

1. 组件还没加载完时显示什么？
2. 组件加载失败时显示什么？

`defineAsyncComponent()` 支持对象写法来处理这些状态：

```js
import { defineAsyncComponent } from 'vue'
import LoadingCard from './LoadingCard.vue'
import ErrorCard from './ErrorCard.vue'

const AsyncChart = defineAsyncComponent({
  loader: () => import('./ChartPanel.vue'),
  loadingComponent: LoadingCard,
  delay: 200,
  errorComponent: ErrorCard,
  timeout: 3000,
})
```

这里几个配置项的含义分别是：

1. `loader`：真正的异步加载函数。
2. `loadingComponent`：加载期间先显示的组件。
3. `delay`：延迟多久再显示 loading，默认是 200ms。
4. `errorComponent`：加载报错或超时时显示的组件。
5. `timeout`：超时时间，超时后会进入错误状态。

默认的 200ms 延迟其实很合理，因为网络快的时候，如果 loading 一闪而过，视觉上反而会有闪烁感。

## 6. 🤔 异步组件的真正加载时机是什么？

定义异步组件时，并不会立刻去请求那个组件文件。真正的加载时机，是这个异步组件首次被渲染的时候。

也就是说：

```html
<template>
  <AsyncDialog v-if="visible" />
</template>
```

如果 `visible` 一直是 `false`，那它对应的 `loader` 根本不会执行。

这也是为什么异步组件特别适合：

1. 弹窗
2. 管理后台二级页面
3. 大体积图表组件
4. 低频使用的配置面板

这些内容天然不是首屏就必须出现，按需加载收益比较明显。

## 7. 🤔 Vue 3.5+ 的惰性激活是什么？

如果你正在使用 SSR，Vue 3.5+ 还为异步组件提供了惰性激活能力。这里的重点已经不是「什么时候下载组件代码」，而是「什么时候让服务端输出的 HTML 真正完成客户端激活」。

官方提供了几种内置策略：

1. 空闲时激活：`hydrateOnIdle()`
2. 可见时激活：`hydrateOnVisible()`
3. 媒体查询匹配时激活：`hydrateOnMediaQuery()`
4. 交互时激活：`hydrateOnInteraction()`

这些内置策略都需要按需导入，这样在没有使用时才能被 tree-shake 掉。

例如：

```js
import { defineAsyncComponent, hydrateOnVisible } from 'vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  hydrate: hydrateOnVisible({ rootMargin: '100px' }),
})
```

这个能力只在 SSR 场景下才有意义。如果你是纯客户端应用，可以先把它理解成「高级性能优化选项」，知道有这回事就够了。

如果内置策略还不够，你也可以传入自定义激活策略函数，自行决定何时调用 `hydrate()`。

## 8. 🤔 异步组件和 `<Suspense>` 是什么关系？

异步组件可以和内置的 `<Suspense>` 配合使用。

你可以把它们理解成两层不同的职责：

1. 异步组件负责「这个组件如何延迟加载」。
2. `<Suspense>` 负责「当子树里出现异步依赖时，整个区域如何统一显示 fallback 内容」。

所以如果你的页面里只是单个低频组件想做延迟加载，通常直接用异步组件就够了；但如果是一整片组件子树都可能进入异步等待态，`<Suspense>` 会更适合统一管理加载体验。

## 9. 🔗 引用

- [Vue.js 官方文档 - 异步组件][1]

[1]: https://cn.vuejs.org/guide/components/async.html
