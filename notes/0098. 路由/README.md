# [0098. 路由](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0098.%20%E8%B7%AF%E7%94%B1)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是路由，为什么应用一大就需要它？](#3--什么是路由为什么应用一大就需要它)
- [4. 🤔 客户端路由和服务端路由有什么区别？](#4--客户端路由和服务端路由有什么区别)
  - [4.1. 服务端路由](#41-服务端路由)
  - [4.2. 客户端路由](#42-客户端路由)
- [5. 🤔 Vue 官方为什么推荐直接用 Vue Router？](#5--vue-官方为什么推荐直接用-vue-router)
- [6. 🤔 不引入路由库，能不能自己实现一个简单路由？](#6--不引入路由库能不能自己实现一个简单路由)
- [7. 🤔 什么场景适合手写简单路由，什么场景不适合？](#7--什么场景适合手写简单路由什么场景不适合)
- [8. 🔗 引用](#8--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 路由定义
- 客户端路由
- 服务端路由
- 官方方案
- 简单实现
- hash 方案
- 适用边界
- 选型判断

## 2. 🫧 评价

路由本身不难，关键是别把“页面切换”只理解成几个条件渲染。对大多数 SPA 来说，官方路线就是 Vue Router；真正值得学的是它为什么存在，以及什么时候可以偷懒自己做一个极简版本。

## 3. 🤔 什么是路由，为什么应用一大就需要它？

路由本质上是在回答一个问题：当前 URL 对应应该渲染哪个视图。

当应用只有一个主页面时，这个问题不明显；但一旦出现：

- 首页
- 详情页
- 设置页
- 用户页

你就需要一个机制把 URL、导航行为和渲染内容对应起来。

如果没有路由，页面切换往往会退化成：

- 大量 `v-if`
- 手动维护当前页面状态
- 导航和浏览器地址栏不同步

这会让应用越长越像“一个巨型组件”，维护成本很高。

## 4. 🤔 客户端路由和服务端路由有什么区别？

这是理解路由的第一步。

### 4.1. 服务端路由

服务端路由的意思是：浏览器访问不同 URL 时，服务器直接返回不同 HTML 页面。

点击链接后通常会整页刷新。

### 4.2. 客户端路由

客户端路由常见于 SPA。它会在浏览器端拦截导航行为，利用 History API 或 `hashchange` 事件切换当前视图，而不是重新加载整个页面。

优点是：

- 切换更流畅
- 页面状态更容易保留
- 更像“应用”而不是“文档跳转”

这也是 Vue 在 SPA 场景下主要面对的路由问题。

## 5. 🤔 Vue 官方为什么推荐直接用 Vue Router？

因为大多数 Vue 应用最终都会超出“手写几个 if”能优雅维护的范围。

官方在路由页说得很直接：对于绝大多数 SPA，都推荐使用官方支持的 Vue Router。

原因其实不难理解。一个真正可用的路由系统往往不只包含“当前渲染哪个组件”，还会逐渐涉及：

- URL 与视图同步
- 嵌套路由
- 动态参数
- 导航守卫
- 懒加载
- 404 页面
- 滚动行为管理

这些东西你当然可以自己做，但越做越会走到“那我为什么不直接用官方路由库”。

## 6. 🤔 不引入路由库，能不能自己实现一个简单路由？

可以，官方文档也给了一个最小示例，核心思路是：

- 监听 hash 变化
- 根据当前 hash 映射组件
- 用动态组件渲染

```vue
<script setup>
import { computed, ref } from 'vue'
import About from './About.vue'
import Home from './Home.vue'
import NotFound from './NotFound.vue'

const routes = {
  '/': Home,
  '/about': About,
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || NotFound
})
</script>

<template>
  <a href="#/">Home</a>
  <a href="#/about">About</a>
  <a href="#/missing">Broken Link</a>

  <component :is="currentView" />
</template>
```

这个例子非常适合帮助你理解路由最底层的工作方式：路由本质上就是“路径变化 -> 当前视图变化”。

## 7. 🤔 什么场景适合手写简单路由，什么场景不适合？

适合手写简单路由的场景：

- 只有 2 到 3 个视图
- 不需要嵌套路由
- 不需要守卫
- 不需要复杂参数
- 只是一个 demo 或非常轻量的工具页

不适合的场景：

- 正常的业务 SPA
- 需要路由参数、权限控制、懒加载
- 页面结构会继续增长
- 团队协作项目

你可以把手写方案理解成“帮助理解路由本质的教学版”，不是大多数生产项目的长期答案。

## 8. 🔗 引用

- [Vue.js 官方文档 - 路由][1]
- [Vue Router 官方文档][2]
- [MDN - History API][3]
- [MDN - hashchange][4]

[1]: https://cn.vuejs.org/guide/scaling-up/routing.html
[2]: https://router.vuejs.org/zh/
[3]: https://developer.mozilla.org/en-US/docs/Web/API/History
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event
