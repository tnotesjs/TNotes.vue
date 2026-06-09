# [0096. 单文件组件](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0096.%20%E5%8D%95%E6%96%87%E4%BB%B6%E7%BB%84%E4%BB%B6)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是单文件组件（SFC）？](#3-什么是单文件组件sfc)
- [4. 为什么 Vue 官方推荐用 SFC 组织组件？](#4-为什么-vue-官方推荐用-sfc-组织组件)
  - [4.1. 组织更自然](#41-组织更自然)
  - [4.2. 开发体验更好](#42-开发体验更好)
  - [4.3. 编译优化更多](#43-编译优化更多)
- [5. 一个 `.vue` 文件是怎么工作的？](#5-一个-vue-文件是怎么工作的)
- [6. 使用 SFC 会不会违背“关注点分离”？](#6-使用-sfc-会不会违背关注点分离)
- [7. 什么场景下不一定要用 SFC？](#7-什么场景下不一定要用-sfc)
- [8. 引用](#8-引用)

<!-- endregion:toc -->

## 1. 本节内容

- SFC 定义
- 文件结构
- 使用原因
- 预编译
- 作用域样式
- HMR 支持
- 编译流程
- 适用场景

## 2. 评价

SFC 是 Vue 项目里最基础、也最重要的工程化能力之一。你不需要死记底层编译细节，但必须理解它为什么能把模板、逻辑、样式自然组织在一起，以及为什么它几乎总是现代 Vue 项目的默认答案。

## 3. 什么是单文件组件（SFC）？

单文件组件（Single-File Component，简称 SFC）就是 `*.vue` 文件。

它允许你把一个组件的三部分内容写在同一个文件里：

- `<template>`：视图结构
- `<script>` 或 `<script setup>`：逻辑代码
- `<style>`：样式

```html
<script setup>
  import { ref } from 'vue'

  const greeting = ref('Hello World!')
</script>

<template>
  <p class="greeting">{{ greeting }}</p>
</template>

<style>
  .greeting {
    color: red;
    font-weight: bold;
  }
</style>
```

这其实就是把传统前端里的 HTML、CSS、JavaScript 三种能力，以“组件”为单位重新组织了一次。

## 4. 为什么 Vue 官方推荐用 SFC 组织组件？

因为它同时解决了组织、体验和性能三个问题。

### 4.1. 组织更自然

在现代 UI 开发里，一个组件的模板、逻辑和样式本来就是强相关的。把它们放在同一个文件中，反而更容易维护。

### 4.2. 开发体验更好

SFC 配合构建工具后，可以获得：

- 模板预编译
- 更好的 IDE 智能提示
- 组件级样式作用域
- `<script setup>` 的简洁语法
- 热更新（HMR）

### 4.3. 编译优化更多

因为模板和逻辑在编译阶段可以被一起分析，Vue 能做更多静态提升和编译时优化。

官方也明确说明了：只要你的项目值得引入构建步骤，SFC 就通常是推荐方案，尤其适用于：

- 单页面应用（SPA）
- 静态站点生成（SSG）
- 中大型组件化项目

## 5. 一个 `.vue` 文件是怎么工作的？

`.vue` 文件不是浏览器原生认识的格式，它必须先经过编译。

Vue 官方提供的编译器是 `@vue/compiler-sfc`，构建工具会把 `.vue` 文件转换成标准的 JavaScript 模块和 CSS。

```js
import MyComponent from './MyComponent.vue'

export default {
  components: {
    MyComponent,
  },
}
```

从使用者角度看，你导入的就像一个普通 ES 模块；从工具链角度看，背后其实做了这些事：

1. 解析 `<template>`、`<script>`、`<style>` 等区块。
2. 把模板编译成渲染逻辑。
3. 处理样式注入、抽取、作用域等逻辑。
4. 最终输出可被打包工具继续处理的 JS / CSS。

开发环境下，`<style>` 往往会以原生 `<style>` 标签的形式注入页面，方便热更新；生产环境下，样式通常会被抽离并合并成独立 CSS 文件。

## 6. 使用 SFC 会不会违背“关注点分离”？

这是很多刚接触 SFC 的同学最常见的疑问。

如果你把“关注点分离”理解成“HTML、CSS、JS 必须分成三个文件”，那 SFC 看起来确实像在反着来。

但 Vue 官方给出的观点更务实：

- 现代前端真正的关注点应该先按“组件职责”分
- 再考虑这个组件内部的模板、逻辑、样式如何协作

也就是说，SFC 不是取消分离，而是把分离维度从“文件类型”切换成了“组件边界”。

在真实 UI 开发里，一个按钮组件的结构、交互和样式本来就是耦合的。把它们拆散到不同目录，未必更清晰，反而可能更难追踪。

## 7. 什么场景下不一定要用 SFC？

官方并没有说“任何场景都必须上 SFC”。

如果你的需求只是：

- 给静态 HTML 加一点交互
- 做轻量级渐进增强
- 不想引入构建步骤

那就不一定要上 SFC。Vue 也支持无构建步骤的使用方式。

在这类场景下，官方还特别提到了 [petite-vue](https://github.com/vuejs/petite-vue)，它更适合轻量交互增强。

所以合理判断是：

- 想要完整的 Vue 组件化开发体验，用 SFC。
- 只想轻量增强现有页面，可以考虑无构建方案。

## 8. 引用

- [Vue.js 官方文档 - 单文件组件][1]
- [Vue.js 官方文档 - SFC 语法说明][2]
- [Vue.js 官方文档 - `<script setup>`][3]
- [Vue.js 官方文档 - SFC CSS 特性][4]

[1]: https://cn.vuejs.org/guide/scaling-up/sfc.html
[2]: https://cn.vuejs.org/api/sfc-spec.html
[3]: https://cn.vuejs.org/api/sfc-script-setup.html
[4]: https://cn.vuejs.org/api/sfc-css-features.html
