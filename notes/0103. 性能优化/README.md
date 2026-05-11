# [0103. 性能优化](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0103.%20%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue 性能优化到底在优化什么？](#3--vue-性能优化到底在优化什么)
- [4. 🤔 为什么优化前要先量化，而不是先猜？](#4--为什么优化前要先量化而不是先猜)
- [5. 🤔 页面加载性能该优先从哪些地方下手？](#5--页面加载性能该优先从哪些地方下手)
  - [5.1. 先选对架构](#51-先选对架构)
  - [5.2. 关注包体积和 tree-shaking](#52-关注包体积和-tree-shaking)
  - [5.3. 做代码分割](#53-做代码分割)
- [6. 🤔 更新性能为什么常常卡在组件边界上？](#6--更新性能为什么常常卡在组件边界上)
  - [6.1. Props 稳定性](#61-props-稳定性)
  - [6.2. `v-once`](#62-v-once)
  - [6.3. `v-memo`](#63-v-memo)
  - [6.4. 计算属性稳定性](#64-计算属性稳定性)
- [7. 🤔 Vue 官方给了哪些通用优化手段？](#7--vue-官方给了哪些通用优化手段)
  - [7.1. 大型列表做虚拟化](#71-大型列表做虚拟化)
  - [7.2. 减少大型不可变数据的深层响应式开销](#72-减少大型不可变数据的深层响应式开销)
  - [7.3. 避免不必要的组件抽象](#73-避免不必要的组件抽象)
- [8. 🔗 引用](#8--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 性能维度
- 分析工具
- 架构选择
- 包体积
- 代码分割
- 更新优化
- 大列表
- 响应性开销

## 2. 🫧 评价

性能优化最容易走偏的地方，是一上来就开始堆技巧。官方文档的结构其实很清楚：先分清“加载性能”和“更新性能”，先测再改，然后再根据瓶颈选择架构、包体积、代码分割、组件更新策略和大数据结构优化。

## 3. 🤔 Vue 性能优化到底在优化什么？

官方先把性能问题分成了两类：

1. 页面加载性能
2. 更新性能

页面加载性能关注的是：

- 首屏内容多快可见
- 页面多快可交互

常用指标包括：

- LCP
- INP

更新性能关注的是：

- 用户输入后界面多久响应
- 路由切换、列表更新、筛选搜索是否流畅

这两类性能有时会互相影响，所以优化前先分清楚自己到底是在优化“首屏慢”还是“交互卡”。

## 4. 🤔 为什么优化前要先量化，而不是先猜？

因为性能问题通常并不长在你第一眼以为的地方。

官方推荐的分析工具包括：

- PageSpeed Insights
- WebPageTest
- Chrome DevTools Performance 面板
- Vue DevTools 性能分析
- `app.config.performance`

其中 `app.config.performance` 会在 Chrome 性能时间线里打出 Vue 特有的性能标记，方便你看组件创建、更新等关键节点。

如果没有量化手段，你很容易把时间花在“看起来很聪明”的微优化上，却没碰到真实瓶颈。

## 5. 🤔 页面加载性能该优先从哪些地方下手？

### 5.1. 先选对架构

如果你的场景对首屏性能很敏感，就不要默认把一切都做成纯客户端 SPA。

官方建议：

- 首屏、SEO 敏感页面考虑 SSR 或 SSG
- 营销页、博客、关于页尽量独立成静态页面

### 5.2. 关注包体积和 tree-shaking

Vue 在现代构建工具下具备良好的 tree-shaking 能力。只要没用到的 API、组件、模块，就应尽量不要进产物。

官方强调的几个点：

- 尽量使用构建步骤
- 模板预编译能减少约 14kb 编译器体积并去掉运行时编译开销
- 引入依赖时关注真实包体积
- 优先选择 ESM 友好的包，比如 `lodash-es`

如果只是做轻量渐进增强，官方甚至建议直接考虑 `petite-vue`。

### 5.3. 做代码分割

代码分割就是把不是首屏必须的代码延后加载。

```js
function loadLazy() {
  return import('./lazy.js')
}
```

在 Vue 组件层面可以这样做：

```js
import { defineAsyncComponent } from 'vue'

const Foo = defineAsyncComponent(() => import('./Foo.vue'))
```

如果用了 Vue Router，官方强烈建议把路由组件做懒加载。

## 6. 🤔 更新性能为什么常常卡在组件边界上？

很多更新性能问题，本质上是“更新传播范围太大”。

### 6.1. Props 稳定性

如果父组件每次都给子组件传一个会整体变化的值，整个列表可能就会全部更新。

官方示例强调的核心是：

- 不要把 `activeId` 直接传给每一项
- 更好的做法是在父组件里算出 `active` 再传下去

```vue
<ListItem v-for="item in list" :id="item.id" :active="item.id === activeId" />
```

这样只有状态真正变化的项才需要更新。

### 6.2. `v-once`

对那些“依赖运行时数据，但未来不需要再更新”的内容，可以用 `v-once` 直接跳过后续更新。

### 6.3. `v-memo`

对大型子树或 `v-for` 列表，可以用 `v-memo` 根据依赖条件跳过更新。

### 6.4. 计算属性稳定性

Vue 3.4+ 中，计算属性只有在结果变化时才触发相关副作用。

```js
const isEven = computed(() => count.value % 2 === 0)
```

但如果你每次都返回一个新对象，就会破坏这种稳定性：

```js
const computedObj = computed((oldValue) => {
  const newValue = {
    isEven: count.value % 2 === 0,
  }

  if (oldValue && oldValue.isEven === newValue.isEven) {
    return oldValue
  }

  return newValue
})
```

## 7. 🤔 Vue 官方给了哪些通用优化手段？

### 7.1. 大型列表做虚拟化

真正拖慢浏览器的往往不是 Vue，而是一次渲染了成千上万个 DOM 节点。

官方建议：大列表优先做虚拟列表，只渲染视口内可见部分。社区常见方案包括：

- `vue-virtual-scroller`
- `vue-virtual-scroll-grid`
- `VVirtualList`

### 7.2. 减少大型不可变数据的深层响应式开销

默认响应式是深层的，大数据结构下会增加依赖追踪成本。

这时可以考虑：

- `shallowRef()`
- `shallowReactive()`

```js
const shallowArray = shallowRef([])

shallowArray.value = [...shallowArray.value, newObject]
```

代价是你必须把深层对象当成不可变数据处理，更新时通过替换根引用触发变更。

### 7.3. 避免不必要的组件抽象

组件实例比普通 DOM 节点贵得多。对少量组件来说问题不大，但在大型列表里，额外包一层无渲染组件或高阶组件，可能会成倍放大实例数量。

所以官方建议是：

- 抽象有价值时再抽象
- 特别关注列表场景下的组件层级

## 8. 🔗 引用

- [Vue.js 官方文档 - 性能优化][1]
- [Web Vitals][2]
- [PageSpeed Insights][3]
- [WebPageTest][4]
- [Vue Router - 懒加载路由][5]

[1]: https://cn.vuejs.org/guide/best-practices/performance.html
[2]: https://web.dev/vitals/
[3]: https://pagespeed.web.dev/
[4]: https://www.webpagetest.org/
[5]: https://router.vuejs.org/zh/guide/advanced/lazy-loading.html
