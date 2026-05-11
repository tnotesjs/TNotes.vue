# [0101. 服务端渲染（SSR）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0101.%20%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93%EF%BC%88SSR%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是 SSR，它和普通 SPA 有什么本质区别？](#3--什么是-ssr它和普通-spa-有什么本质区别)
- [4. 🤔 为什么有人需要 SSR，但很多项目其实不需要？](#4--为什么有人需要-ssr但很多项目其实不需要)
- [5. 🤔 SSR 和 SSG 应该怎么区分？](#5--ssr-和-ssg-应该怎么区分)
  - [5.1. SSR](#51-ssr)
  - [5.2. SSG](#52-ssg)
- [6. 🤔 一个最基础的 Vue SSR 流程长什么样？](#6--一个最基础的-vue-ssr-流程长什么样)
- [7. 🤔 为什么官方更推荐上层方案，而不是从零手搓一套？](#7--为什么官方更推荐上层方案而不是从零手搓一套)
- [8. 🤔 写 SSR 友好代码时，最容易踩哪些坑？](#8--写-ssr-友好代码时最容易踩哪些坑)
  - [8.1. 浏览器专属 API 直接在通用代码中访问](#81-浏览器专属-api-直接在通用代码中访问)
  - [8.2. 在 `setup()` 根作用域里写需要清理的副作用](#82-在-setup-根作用域里写需要清理的副作用)
  - [8.3. 跨请求状态污染](#83-跨请求状态污染)
  - [8.4. 服务端与客户端渲染预期不一致](#84-服务端与客户端渲染预期不一致)
- [9. 🤔 激活不匹配、指令和 Teleport 在 SSR 下有什么特殊点？](#9--激活不匹配指令和-teleport-在-ssr-下有什么特殊点)
  - [9.1. 激活不匹配](#91-激活不匹配)
  - [9.2. 自定义指令](#92-自定义指令)
  - [9.3. Teleport](#93-teleport)
- [10. 🔗 引用](#10--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- SSR 定义
- Hydration
- 适用场景
- SSR vs SSG
- 基础流程
- 上层方案
- 友好代码
- 常见陷阱

## 2. 🫧 评价

SSR 是一个典型“收益很大、复杂度也很高”的主题。你最需要掌握的不是手写完整 SSR 框架，而是判断何时值得用、核心流程是什么、为什么跨请求状态污染和 hydration mismatch 会成为真实问题，以及为什么官方强烈建议优先考虑 Nuxt 这类上层方案。

## 3. 🤔 什么是 SSR，它和普通 SPA 有什么本质区别？

SSR 是服务端渲染（Server-Side Rendering）。

在默认的 SPA 模式下，Vue 主要在浏览器里生成和操作 DOM；而在 SSR 模式下，Vue 会先在服务端把应用渲染成 HTML 字符串返回给浏览器，然后浏览器再把这段静态 HTML“激活”为可交互的客户端应用。

这一步激活通常也叫 hydration。

所以 SSR 和普通 SPA 的本质区别可以概括成一句话：

- SPA：先拿到壳，再在浏览器里渲染内容
- SSR：先拿到渲染好的内容，再在浏览器里接管交互

## 4. 🤔 为什么有人需要 SSR，但很多项目其实不需要？

SSR 的主要收益有 3 个：

1. 更快的首屏可见内容
2. 更好的 SEO
3. 服务端和客户端统一组件化心智模型

这对以下场景很有价值：

- 内容站点
- 营销页
- 首屏速度直接影响转化的产品
- 依赖搜索引擎抓取的页面

但它也有明确成本：

- 开发约束更多
- 构建和部署更复杂
- 服务器负载更高
- 第三方库兼容问题更多

所以官方特别提醒：不是所有项目都值得上 SSR。比如一个内部管理后台，首屏慢几百毫秒通常不是什么决定性问题，这类项目未必值得把复杂度抬这么高。

## 5. 🤔 SSR 和 SSG 应该怎么区分？

很多人研究 SSR，其实最后更适合的是 SSG。

### 5.1. SSR

每次请求到来时，在服务端渲染页面。

适合：

- 内容依赖实时请求
- 不同用户看到的内容不同
- 需要动态服务端处理

### 5.2. SSG

在构建阶段就把页面预生成成静态 HTML。

适合：

- 文档站
- 博客
- 营销页
- 数据更新频率低、可重新部署的站点

官方判断很务实：如果你只是想优化少量营销页 SEO，往往更该考虑 SSG，而不是 SSR。

## 6. 🤔 一个最基础的 Vue SSR 流程长什么样？

最小流程其实可以拆成 3 步：

1. 在服务端创建 SSR 应用
2. 用 `renderToString()` 输出 HTML
3. 在客户端用同样的应用结构执行 hydration

```js
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

const app = createSSRApp({
  data: () => ({ count: 1 }),
  template: `<button>{{ count }}</button>`,
})

const html = await renderToString(app)
```

服务端拿到 `html` 后，会把它塞进完整页面外壳中返回给浏览器。

而客户端侧要用 `createSSRApp()` 挂载，而不是普通的 `createApp()`：

```js
import { createSSRApp } from 'vue'

const app = createSSRApp({
  // 和服务端一致
})

app.mount('#app')
```

这里的 `mount` 不再是“新建 DOM”，而是对现有预渲染 DOM 执行接管和激活。

## 7. 🤔 为什么官方更推荐上层方案，而不是从零手搓一套？

因为“把第一个 SSR demo 跑起来”和“做一个生产可用的 SSR 应用”之间差着一整套工程问题。

真正的 SSR 项目还要继续处理：

- 客户端 / 服务端双构建
- 资源注入与 preload / prefetch
- 路由、数据、状态的通用组织
- SSG / SSR 切换
- 部署和缓存策略
- 第三方库兼容

所以官方强烈建议优先考虑更高层的解决方案，比如：

- Nuxt
- Quasar
- 基于 Vite SSR 的成熟方案

其中官方尤其推荐先试 Nuxt，因为它把大量 SSR 复杂度都提前封装掉了。

## 8. 🤔 写 SSR 友好代码时，最容易踩哪些坑？

官方把这部分总结得很系统，最关键的坑主要有 4 类。

### 8.1. 浏览器专属 API 直接在通用代码中访问

像 `window`、`document` 这类对象在服务端根本不存在。

解决思路通常是：

- 在 `onMounted()` 里再访问浏览器 API
- 或者封装平台差异层

### 8.2. 在 `setup()` 根作用域里写需要清理的副作用

比如 `setInterval()` 这类副作用，如果写在服务端执行路径里，会很难正确清理，因为服务端不会经历普通客户端那套卸载过程。

### 8.3. 跨请求状态污染

模块级单例状态在 SSR 里会被多个请求复用，所以每个请求都应该创建新的应用、router、store 实例，而不是共享同一个全局实例。

### 8.4. 服务端与客户端渲染预期不一致

比如随机数、时区、本地时间、非法 HTML 结构，都可能造成激活不匹配。

## 9. 🤔 激活不匹配、指令和 Teleport 在 SSR 下有什么特殊点？

### 9.1. 激活不匹配

如果服务端输出的 DOM 结构和客户端期望不一致，就会出现 hydration mismatch。

常见原因包括：

- 非法 HTML 被浏览器自动修正
- 随机数导致内容不一致
- 服务端和客户端时区不同

Vue 遇到不匹配时通常会尝试自动恢复，但这会带来额外开销，最好还是尽量避免。

### 9.2. 自定义指令

大多数自定义指令依赖 DOM 操作，因此在 SSR 期间通常会被忽略。

如果你确实需要在服务端控制指令输出，可以提供 `getSSRProps`：

```js
const myDirective = {
  mounted(el, binding) {
    el.id = binding.value
  },
  getSSRProps(binding) {
    return {
      id: binding.value,
    }
  },
}
```

### 9.3. Teleport

Teleport 在 SSR 中需要特殊处理。它传送的内容不会自动出现在主应用 HTML 字符串里，而是会挂到 SSR 上下文的 `teleports` 属性中，你需要手动把对应 HTML 放到页面正确位置。

官方还特别提醒：SSR 场景下不要把 Teleport 目标直接设为 `body`，更推荐给它一个独立容器。

## 10. 🔗 引用

- [Vue.js 官方文档 - 服务端渲染（SSR）][1]
- [Vue.js 官方文档 - SSR API][2]
- [Nuxt][3]
- [Vite SSR Guide][4]
- [Pinia SSR 指南][5]

[1]: https://cn.vuejs.org/guide/scaling-up/ssr.html
[2]: https://cn.vuejs.org/api/ssr.html
[3]: https://nuxt.com/
[4]: https://cn.vitejs.dev/guide/ssr.html
[5]: https://pinia.vuejs.org/zh/ssr/
