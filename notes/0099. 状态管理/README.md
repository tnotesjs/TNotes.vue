# [0099. 状态管理](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0099.%20%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是状态管理，为什么它会在应用变大后变成问题？](#3-什么是状态管理为什么它会在应用变大后变成问题)
- [4. 为什么“把状态提到父组件”有时还是不够？](#4-为什么把状态提到父组件有时还是不够)
- [5. 只用响应式 API，能不能做一个简单 store？](#5-只用响应式-api能不能做一个简单-store)
- [6. 为什么建议把修改逻辑集中到 store 方法里？](#6-为什么建议把修改逻辑集中到-store-方法里)
- [7. SSR 场景下为什么要额外小心全局单例状态？](#7-ssr-场景下为什么要额外小心全局单例状态)
- [8. Pinia 为什么会成为 Vue 现在的官方推荐？](#8-pinia-为什么会成为-vue-现在的官方推荐)
- [9. 引用](#9-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 状态定义
- 单向流动
- 共享状态
- 简单 store
- 动作集中
- SSR 注意
- Pinia 推荐
- 选型判断

## 2. 评价

状态管理是 Vue 项目进入中大型之后最容易“突然变难”的部分。你最该掌握的是：什么时候只用响应式 API 就够了，什么时候该上 Pinia，以及为什么 SSR 会让全局单例状态出现额外风险。

## 3. 什么是状态管理，为什么它会在应用变大后变成问题？

从 Vue 视角看，组件本身就在管理状态。

一个最简单的计数器组件里，通常就包含 3 个部分：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-02-07-57-43.png)

- `State` => 状态：比如 `count`
- `View` => 视图：比如模板里显示 `count`
- `Actions` => 动作：比如点击按钮执行 `increment`

这就是最基础的单向数据流：状态驱动视图，用户交互再反过来修改状态。

问题在于，当应用变大后，状态不再只属于一个组件：

- 多个组件会同时依赖同一份数据
- 多个地方都可能要修改这份数据

一旦共享状态出现，单个组件内部那种“自己管自己”的简单模式就不够用了。

## 4. 为什么“把状态提到父组件”有时还是不够？

在共享状态刚出现时，最直觉的办法是“状态提升”：把共享状态提到共同祖先，再通过 Props 往下传。

这在小范围内没问题，但项目一复杂就会开始出现两个经典问题：

1. Prop 逐级透传
2. 多个组件维护状态副本，修改逻辑分散

前者会让组件层层转发自己并不真正使用的数据，后者则会让状态同步越来越脆弱。

这时更直接的思路是：把共享状态抽到组件树外，变成一个集中管理的数据源。

## 5. 只用响应式 API，能不能做一个简单 store？

可以，而且官方先给出的就是这个最小方案。

```js
import { reactive } from 'vue'

export const store = reactive({
  count: 0,
})
```

然后在不同组件中直接导入：

```html
<script setup>
  import { store } from './store.js'
</script>

<template>
  <p>{{ store.count }}</p>
</template>
```

只要 `store.count` 改了，所有引用它的组件都会同步更新。

除了 `reactive()`，你也可以用：

- `ref()`
- `computed()`
- 返回全局状态的组合式函数

比如：

```js
import { ref } from 'vue'

const globalCount = ref(1)

export function useCount() {
  const localCount = ref(1)

  return {
    globalCount,
    localCount,
  }
}
```

这个例子很好地说明了 Vue 响应式系统和组件层是解耦的，状态不一定非得写在组件里。

## 6. 为什么建议把修改逻辑集中到 store 方法里？

因为“谁都能改”在小项目里方便，在大项目里基本等于混乱。

如果任意组件都可以直接写：

```html
<button @click="store.count++">+1</button>
```

那随着项目增长，你会越来越难追踪：

- 到底谁在改状态
- 为什么要这样改
- 哪些更新是合法入口

所以官方建议把动作也集中到 store 里：

```js
import { reactive } from 'vue'

export const store = reactive({
  count: 0,
  increment() {
    this.count++
  },
})
```

调用时这样写：

```html
<button @click="store.increment()">{{ store.count }}</button>
```

这样做的意义是：状态和修改意图都集中起来了。后面如果你要做日志、权限、调试、重构，都会更容易。

## 7. SSR 场景下为什么要额外小心全局单例状态？

因为在纯客户端应用里，页面刷新一次，模块通常就重新初始化一次；但在 SSR 里，服务端进程会长期运行，同一个模块可能会被多个请求复用。

如果你把共享状态直接做成模块级单例：

```js
export const store = reactive({
  user: null,
})
```

那么一个请求里写进去的用户状态，就有可能污染到另一个请求，这就是“跨请求状态污染”。

所以在 SSR 场景里，推荐做法是：

- 每个请求都创建一份新的应用实例
- 每个请求都创建一份新的 store 实例
- 再通过应用级 `provide` 注入给组件树

这也是为什么官方文档会把 SSR 的状态管理细节单独拎出来讲。

## 8. Pinia 为什么会成为 Vue 现在的官方推荐？

因为当应用进入真正的生产规模后，只靠一个手写 reactive store 往往不够。

官方列出的规模化需求包括：

- 更清晰的团队协作约定
- 更好的 DevTools 集成
- 时间线与调试能力
- HMR
- SSR 支持
- 更好的 TypeScript 类型推导

Pinia 正是针对这些问题设计的，而且由 Vue 核心团队维护。

官方对新项目的建议也很明确：

- 新项目优先用 Pinia
- Vuex 仍可用，但已经进入维护模式

简单来说可以这样判断：

- 共享状态很少，逻辑也简单，用响应式 API 就够
- 状态越来越多、多人协作、要 SSR / TS / DevTools 深度支持，就上 Pinia

## 9. 引用

- [Vue.js 官方文档 - 状态管理][1]
- [Vue.js 官方文档 - 响应式基础][2]
- [Vue.js 官方文档 - SSR 中的跨请求状态污染][3]
- [Pinia 官方文档][4]

[1]: https://cn.vuejs.org/guide/scaling-up/state-management.html
[2]: https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html
[3]: https://cn.vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution
[4]: https://pinia.vuejs.org/zh/
