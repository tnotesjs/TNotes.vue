# [0023. Vue 简介](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0023.%20Vue%20%E7%AE%80%E4%BB%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是 Vue？](#3--什么是-vue)
  - [3.1. 核心特性](#31-核心特性)
    - [响应式数据绑定](#响应式数据绑定)
    - [组件化架构](#组件化架构)
    - [虚拟 DOM](#虚拟-dom)
  - [3.2. 基本示例](#32-基本示例)
    - [CDN 方式](#cdn-方式)
    - [单文件组件（SFC）](#单文件组件sfc)
- [4. 🤔 Vue.js 的发展历史与版本变迁是怎样的？](#4--vuejs-的发展历史与版本变迁是怎样的)
- [5. 🤔 如何理解 Vue 的渐进式框架理念？](#5--如何理解-vue-的渐进式框架理念)
- [6. 🤔 声明式渲染和命令式渲染有什么区别？](#6--声明式渲染和命令式渲染有什么区别)
  - [6.1. 命令式](#61-命令式)
  - [6.2. 声明式](#62-声明式)
  - [6.3. 对比小结](#63-对比小结)
- [7. 🤔 SFC 是什么？](#7--sfc-是什么)
- [8. 🤔 Vue 的两种 API 风格是什么？如何选择？](#8--vue-的两种-api-风格是什么如何选择)
  - [8.1. 选项式 API（Options API）](#81-选项式-apioptions-api)
  - [8.2. 组合式 API（Composition API）](#82-组合式-apicomposition-api)
  - [8.3. 如何选择？](#83-如何选择)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 什么是 Vue.js
- Vue.js 的发展历史与版本变迁
- 渐进式框架的理解
- 声明式渲染 vs 命令式渲染
- 安装与引入 Vue（CDN、NPM、Vite）

## 2. 🫧 评价

这篇笔记主要是参考 [Vue.js 官方文档 - 简介][2] 来写的，可以结合着一起看。

## 3. 🤔 什么是 Vue？

::: tip 官方描述

Vue (发音为 /vjuː/，类似 view) 是一款用于构建用户界面的 JavaScript 框架。它基于标准 HTML、CSS 和 JavaScript 构建，并提供了一套声明式的、组件化的编程模型，帮助你高效地开发用户界面。无论是简单还是复杂的界面，Vue 都可以胜任。

:::

Vue 是一个用于构建用户界面的渐进式 JavaScript 框架，由尤雨溪（Evan You）于 2014 年创建并开源。Vue 的核心设计思想是通过声明式的方式将数据渲染到 DOM 中，开发者只需要关注数据本身的变化，框架会自动将这些变化映射到视图上，无需手动操作 DOM 元素。

Vue 的名字来源于法语中的“vue”，意为“视图”，这恰好反映了它的核心定位 => 专注于视图层的构建。与 React 和 Angular 等同类前端框架相比，Vue 的学习曲线更加平缓，API 设计也更加直观。Vue 的官方文档以其清晰、全面、友好著称，这让初学者能够快速上手，同时也让有经验的开发者能够深入理解其设计理念。

Vue 在全球范围内拥有庞大的社区和丰富的生态系统。在国内，阿里巴巴、百度、腾讯、字节跳动等大厂都广泛使用 Vue 来构建前端应用。在国际上，GitLab、Apple、任天堂等企业也在其产品中采用了 Vue。Vue 在 GitHub 上拥有超过 40 万颗星标，是最受欢迎的前端框架之一。

### 3.1. 核心特性

Vue 的核心特性可以从以下几个方面来理解：

#### 响应式数据绑定

响应式数据绑定是 Vue 最核心的特性之一。当你在 Vue 中定义一个响应式数据，比如 ref 或 reactive 对象，Vue 的响应式系统会自动追踪这个数据的依赖关系。当数据发生变化时，所有依赖该数据的视图都会自动更新。这种机制极大地简化了开发流程，开发者不再需要手动调用 DOM API 来更新页面内容。

#### 组件化架构

组件化架构是 Vue 的另一大核心设计。Vue 将 UI 界面拆分为独立的、可复用的组件，每个组件封装了自己的模板（template）、逻辑（script）和样式（style）。这种组件化的设计方式不仅让代码更加清晰、可维护，也使得团队协作变得更加高效。

#### 虚拟 DOM

虚拟 DOM 是 Vue 内部的渲染优化机制。Vue 不会直接操作真实 DOM，而是先在内存中构建一棵虚拟 DOM 树（Virtual DOM Tree），当数据变化时，Vue 会生成一棵新的虚拟 DOM 树，然后通过 diff 算法比较新旧两棵树的差异，最终只将真正发生变化的部分应用到真实 DOM 上。这种方式大幅减少了不必要的 DOM 操作，提升了渲染性能。

### 3.2. 基本示例

下面是一个最简单的 Vue 3 应用示例：

#### CDN 方式

```html
<!doctype html>
<html>
  <head>
    <title>Hello Vue</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  </head>
  <body>
    <div id="app">
      <h1>{{ message }}</h1>
      <button @click="count++">点击次数：{{ count }}</button>
    </div>
    <script>
      const { createApp, ref } = Vue
      createApp({
        setup() {
          const message = ref('Hello Vue!')
          const count = ref(0)
          return { message, count }
        },
      }).mount('#app')
    </script>
  </body>
</html>
<!-- 
解释：
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
通过 CDN 引入了 Vue 3 的全局构建版本，这个版本包含了 Vue 的核心功能和编译器，可以直接在浏览器中使用。

createApp( ... ).mount('#app')
在这个例子中，通过 createApp 创建了一个 Vue 应用实例，挂载到 id 为 app 的 DOM 元素上。
这个实例包含了一个 setup 函数，setup 是 Vue 3 组合式 API 的入口函数，用于定义组件的响应式数据和逻辑。

const message = ref('Hello Vue!')
const count = ref(0)
使用 ref 定义了两个响应式数据 message 和 count。
当这些数据发生变化时，Vue 会自动更新视图。

return { message, count }
setup 函数返回一个对象，这个对象中的属性会暴露给模板使用。

<h1>{{ message }}</h1>
模板中的 {{ message }} 是插值语法，会将 message 的值渲染到页面上。

<button @click="count++">点击次数：{{ count }}</button>
@click 是 v-on:click 的缩写，用于监听点击事件，当用户点击按钮时，count 的值会自增，页面上的显示也会随之自动更新。
-->
```

#### 单文件组件（SFC）

在实际开发中，我们更多是采用这种单文件组件的形式来封装 Vue 组件：

```html
<script setup>
  import { ref } from 'vue'

  const message = ref('Hello Vue!')
  const count = ref(0)
</script>

<template>
  <h1>{{ message }}</h1>
  <button @click="count++">点击次数：{{ count }}</button>
</template>
```

你可以在 [Vue Playground][1] 中在线实验这个组件（初学者推荐），或者在本地使用 Vite 创建一个 Vue 项目来运行它。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-26-12-04-09.png)

上面的示例展示了 Vue 的两个核心功能：

- 声明式渲染：Vue 基于标准 HTML 拓展了一套模板语法，使得我们可以声明式地描述最终输出的 HTML 和 JavaScript 状态之间的关系。
- 响应性：Vue 会自动跟踪 JavaScript 状态并在其发生变化时响应式地更新 DOM。

## 4. 🤔 Vue.js 的发展历史与版本变迁是怎样的？

Vue.js 的发展历程是一段从个人项目成长为全球顶级前端框架的传奇故事，了解这段历史有助于我们理解 Vue 各个版本的设计决策和技术演进方向。

2013 年，尤雨溪在 Google Creative Lab 工作期间开始构思 Vue 的雏形。当时他在多个项目中使用 Angular，发现 Angular 虽然功能强大，但过于沉重，很多场景下只需要一个轻量级的数据绑定工具。于是他开始尝试从 Angular 中提取出最有价值的部分「声明式的数据绑定和组件化」将其封装为一个更轻量、更灵活的工具。

2014 年 2 月，Vue.js 正式对外发布 0.x 版本。这个最初的版本已经具备了响应式数据绑定和指令系统等核心特性，但功能相对简单，更像是一个视图层的模板引擎。即便如此，Vue 简洁直观的 API 设计已经开始吸引一批开发者的关注。

2015 年 10 月，Vue 1.0 版本（代号 Evangelion，即“新世纪福音战士”）正式发布。1.0 版本引入了许多重要改进，包括优化后的模板编译器、改进的组件系统、过渡效果系统等。这个版本标志着 Vue 从实验性质的项目真正走向了可用于生产环境的成熟框架。同时期，vue-router 和 vuex 等官方配套工具也陆续推出，形成了初步的 Vue 生态系统。

2016 年 10 月，Vue 2.0 版本（代号 Ghost in the Shell，即“攻壳机动队”）发布，这是 Vue 发展史上的一次重大飞跃。Vue 2 引入了虚拟 DOM 机制，大幅提升了渲染性能。同时，Vue 2 保持了与 1.x 版本极高的 API 兼容性，降低了迁移成本。Vue 2 还支持了服务端渲染（SSR），进一步扩展了 Vue 的应用场景。在 Vue 2 时代，Vue 的用户量迅速增长，成为与 React、Angular 并列的三大前端框架之一。

Vue 2 的响应式系统基于 Object.defineProperty 实现。这个 API 可以拦截对象属性的读取和设置操作，从而实现数据变化的自动追踪。但 Object.defineProperty 也存在一些局限性 => 它无法检测对象属性的添加和删除，也无法监听数组索引的直接赋值。Vue 2 通过 Vue.set 和数组变异方法等方式来弥补这些不足，但这些限制始终是开发者在使用过程中需要注意的问题。

2020 年 9 月，Vue 3.0 版本（代号 One Piece，即“海贼王”）正式发布，这是 Vue 发展史上最重要的里程碑之一。Vue 3 带来了全面的架构升级。

```js
// Vue 2 的选项式 API
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}

// Vue 3 的组合式 API
import { ref } from 'vue'
export default {
  setup() {
    const count = ref(0)
    const increment = () => count.value++
    return { count, increment }
  }
}
```

Vue 3 的几项关键改进包括：

- 组合式 API（Composition API）：提供了一种更灵活的代码组织方式，可以按照功能逻辑而非选项类型来组织代码，极大地改善了代码的可复用性和可维护性。
- 基于 Proxy 的响应式系统：使用 ES6 的 Proxy 替代了 Object.defineProperty，能够拦截对象的所有操作，包括属性的添加、删除和数组的索引赋值等，彻底解决了 Vue 2 的响应式局限性问题。
- 性能优化：通过静态提升（Static Hoisting）、Patch Flags 等编译时优化手段，Vue 3 的渲染性能比 Vue 2 提升了约 1.3 到 2 倍。同时，Vue 3 的源码采用 ES Module 结构，天然支持 Tree Shaking，打包工具可以移除未使用的 API，使打包体积减小了约 41%。
- 更好的 TypeScript 支持：Vue 3 本身就是用 TypeScript 编写的，原生提供了完善的类型推导能力。
- 新的内置组件：引入了 Teleport（传送门）和 Suspense（异步组件加载）等新组件。此外，Vue 3 的模板支持多个根节点，编译器会自动将其包裹在一个隐式的 Fragment 中，这是编译层面的特性而非可显式使用的组件标签。

2022 年 2 月，Vue 3 正式成为 Vue 的默认版本，npm 上的 `vue` 包直接指向 Vue 3。同年，Vue 3 的配套生态也趋于成熟 => Vue Router 4、Pinia（替代 Vuex 的新一代状态管理工具）、Vite（新一代构建工具）等都已经稳定可用。

Vue 3.3（2023 年 5 月）引入了泛型组件、defineSlots、defineOptions 等特性，进一步完善了 TypeScript 开发体验。Vue 3.4（2023 年 12 月）对模板解析器进行了重写，性能提升约 2 倍，并引入了 defineModel 稳定版。Vue 3.5（2024 年 9 月）优化了响应式系统的内存使用，引入了 useTemplateRef 和 useId 等新的组合式函数。

## 5. 🤔 如何理解 Vue 的渐进式框架理念？

::: tip 官方描述

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-26-15-51-52.png)

以下内容更多是对官方描述的这部分内容做一些解读。

:::

“渐进式框架”（Progressive Framework）是 Vue 最核心的设计哲学之一，也是 Vue 与其他前端框架的重要区别所在。理解这个概念对于正确使用 Vue 以及选择合适的技术栈至关重要。

所谓“渐进式”，是指 Vue 的设计允许你根据项目的实际需求，逐步引入和使用框架的各个部分，而不是一开始就要求你接受整个框架的所有理念和工具。你可以把 Vue 想象成一组同心圆 => 最内层是核心的声明式渲染能力，往外依次是组件系统、客户端路由、大规模状态管理、构建工具链等。你可以只使用内层的功能，也可以根据需要逐步向外扩展。

这种设计理念在实际开发中有着非常具体的体现。以下是 Vue 渐进式使用的不同层次：

第一层是最基础的用法，你可以像使用 jQuery 一样，通过 CDN 引入 Vue，然后在一个 HTML 页面中直接使用。这种方式适合快速原型开发、小型项目或者在已有项目中逐步引入 Vue：

```html
<!-- 最简单的渐进式用法：直接在 HTML 中引入 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<div id="app">
  <p>{{ greeting }}</p>
</div>
<script>
  Vue.createApp({
    data() {
      return { greeting: '你好，世界！' }
    },
  }).mount('#app')
</script>
```

第二层是使用单文件组件（SFC）和构建工具。当项目规模增长时，你可以引入 Vite 或 webpack 等构建工具，使用 .vue 文件来组织代码，享受热模块替换（HMR）、代码分割等工程化能力：

```html
<!-- App.vue 单文件组件 -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <MyComponent />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import MyComponent from './MyComponent.vue'

  const title = ref('使用单文件组件')
</script>

<style scoped>
  h1 {
    color: #42b883;
  }
</style>
```

第三层是引入路由管理。当你的应用需要多个页面或视图切换时，可以引入 Vue Router 来管理客户端路由：

```js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
})
```

第四层是引入状态管理。当组件之间的数据共享变得复杂时，可以引入 Pinia 来集中管理应用状态：

```js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    isLoggedIn: false,
  }),
  actions: {
    login(name) {
      this.name = name
      this.isLoggedIn = true
    },
  },
})
```

第五层是服务端渲染（SSR）。当你的应用需要更好的 SEO 表现或首屏加载性能时，可以直接使用 Vue 官方提供的 SSR API（如 `createSSRApp` 和 `@vue/server-renderer`），也可以选择基于这些 API 构建的 Nuxt 等上层框架，后者提供了更完整的项目结构和开发约定。

这种渐进式的理念与 Angular 形成了鲜明对比。Angular 是一个“全家桶”式的框架，它从一开始就要求开发者接受整套技术方案：包括模块系统、路由、表单处理、HTTP 客户端、依赖注入等。Angular 的学习成本较高，但一旦掌握就能获得一个完整的开发体系。React 则走了另一个极端：它只关注视图层的渲染，路由、状态管理等功能全部由社区提供，开发者需要自行选择和组合各种第三方库。

Vue 的渐进式设计恰好处于 Angular 和 React 之间。Vue 的核心库只关注视图层，保持了轻量和灵活。同时，Vue 官方维护了一系列高质量的配套工具（Vue Router、Pinia、Vite 等），开发者可以按需引入。这些官方工具之间有着良好的集成和一致的设计风格，使用起来就像一个整体，但任何一个都可以被替换或省略。

渐进式设计还体现在 Vue 的 API 风格上。Vue 3 同时支持选项式 API（Options API）和组合式 API（Composition API），前者更直观、更适合初学者，后者更灵活、更适合大型项目。开发者可以在同一个项目中混合使用两种 API，根据具体场景选择最合适的方式。这种“没有唯一正确用法”的设计哲学，正是渐进式框架理念的深层体现。

## 6. 🤔 声明式渲染和命令式渲染有什么区别？

声明式渲染（Declarative Rendering）和命令式渲染（Imperative Rendering）是两种截然不同的 UI 编程范式，理解它们的区别是掌握 Vue.js 设计哲学的关键。

### 6.1. 命令式

命令式渲染关注的是“如何做”（How）。在命令式的编程方式中，开发者需要逐步告诉计算机每一个操作步骤：创建哪个 DOM 元素、设置什么属性、把它插入到哪个位置、什么时候更新内容等。传统的 DOM 操作和 jQuery 就是典型的命令式编程方式：

```js
// 命令式渲染：逐步告诉浏览器怎么做
const container = document.getElementById('app')

// 第一步：创建元素
const heading = document.createElement('h1')
heading.textContent = 'Hello World'
container.appendChild(heading)

// 第二步：创建按钮
const button = document.createElement('button')
let count = 0
button.textContent = '点击次数：0'
container.appendChild(button)

// 第三步：绑定事件，手动更新 DOM
button.addEventListener('click', () => {
  count++
  button.textContent = `点击次数：${count}`
})
```

在上面的例子中，开发者需要手动创建 DOM 元素、手动设置文本内容、手动添加事件监听器，还需要在事件回调中手动更新 DOM。每一步都是明确的、具体的指令。这种方式在简单场景下还可以接受，但当应用变得复杂时，手动管理 DOM 状态会变得极其困难：你需要追踪每一个可能变化的 DOM 节点，确保在每次数据变化时都正确地更新了所有相关的 UI 元素。

### 6.2. 声明式

声明式渲染关注的是“是什么”（What）。在声明式的编程方式中，开发者只需要描述 UI 应该呈现什么样子，而不需要关心具体的更新步骤。Vue.js 就是声明式渲染的典型代表：

```html
<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="count++">点击次数：{{ count }}</button>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const message = ref('Hello World')
  const count = ref(0)
</script>
```

同样的功能，声明式的写法要简洁得多。模板中的 <span v-pre>`{{ message }}`</span> 和 <span v-pre>`{{ count }}`</span> 声明了“这里应该显示什么数据”，`@click="count++"` 声明了“点击时数据应该怎样变化”。至于 DOM 的创建、更新、事件绑定等底层操作，全部由 Vue 框架自动完成。

### 6.3. 对比小结

两种范式的核心差异可以总结为以下几点：

在关注点方面，命令式渲染要求开发者同时管理数据状态和 DOM 状态，需要手动保持两者的同步。声明式渲染则让开发者专注于数据状态的管理，DOM 状态的同步由框架自动处理。

在代码可维护性方面，命令式代码的可读性和可维护性往往较差，因为业务逻辑和 DOM 操作交织在一起。声明式代码将数据和视图的关系以直观的方式表达出来，代码更容易阅读和理解。

在性能方面，命令式渲染在理论上可以达到最优性能，因为开发者可以精确控制每一次 DOM 操作。声明式渲染由于需要框架在中间做一层转换（响应式追踪与组件更新调度），会引入一定的性能开销。但在实际开发中，框架的编译时优化（如静态提升、Patch Flags）能够生成高度定向的更新代码，大幅减少不必要的比对工作，通常能够满足绝大多数场景的性能需求，而且手动优化命令式代码的成本往往远高于声明式方案。

来看一个更复杂的对比。假设我们需要实现一个待办事项列表，支持添加和删除操作：

::: code-group

```js [命令式方式]
// 命令式方式
const ul = document.createElement('ul')
const input = document.createElement('input')
const addBtn = document.createElement('button')
addBtn.textContent = '添加'
document.getElementById('app').append(input, addBtn, ul)

addBtn.addEventListener('click', () => {
  if (!input.value.trim()) return
  const li = document.createElement('li')
  li.textContent = input.value
  const delBtn = document.createElement('button')
  delBtn.textContent = '删除'
  delBtn.addEventListener('click', () => li.remove())
  li.appendChild(delBtn)
  ul.appendChild(li)
  input.value = ''
})
```

```html [声明式方式（Vue）]
<!-- 声明式方式（Vue） -->
<template>
  <div>
    <input v-model="newTodo" @keyup.enter="addTodo" />
    <button @click="addTodo">添加</button>
    <ul>
      <li v-for="(todo, index) in todos" :key="index">
        {{ todo }}
        <button @click="todos.splice(index, 1)">删除</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const newTodo = ref('')
  const todos = ref([])

  function addTodo() {
    if (!newTodo.value.trim()) return
    todos.value.push(newTodo.value)
    newTodo.value = ''
  }
</script>
```

:::

在声明式版本中，模板清晰地描述了 UI 结构：一个输入框、一个按钮、一个由 v-for 渲染的列表。数据和视图的关系一目了然。相比之下，命令式版本中的 DOM 操作和事件处理逻辑交织在一起，很难快速理解代码的意图。

Vue 选择声明式渲染作为核心范式，是因为它能够在保持足够性能的前提下，极大地降低开发和维护的复杂度。当然，Vue 也并没有完全排斥命令式的方式：在某些需要直接操作 DOM 的场景中（如自定义指令、第三方库集成等），Vue 仍然允许开发者使用命令式的方式进行底层操作。

## 7. 🤔 SFC 是什么？

SFC 是 Single File Component（单文件组件）的缩写，是 Vue 中一种使用 `.vue` 后缀文件来定义组件的开发方式。一个 `.vue` 文件将组件的模板（template）、逻辑（script）和样式（style）封装在同一个文件中，这也是 Vue 最推荐的组件组织方式。

```html
<template>
  <button @click="count++">点击次数：{{ count }}</button>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>

<style scoped>
  button {
    font-size: 1.2em;
    padding: 0.5em 1em;
    color: #42b883;
  }
</style>
```

SFC 的核心优势在于：

- 关注点内聚：将组件的模板、逻辑和样式放在一起，便于理解和维护。修改一个组件时，所有相关代码都在同一个文件中。
- 编译时优化：`.vue` 文件在构建阶段会经过 Vue 编译器处理，模板被预编译为渲染函数，`<style scoped>` 中的样式会被自动添加 CSS 作用域标识，避免了全局样式污染。
- IDE 支持：VSCode 的 Volar 扩展为 `.vue` 文件提供了语法高亮、类型检查、智能补全等完善的开发体验。

SFC 需要通过构建工具（如 Vite、webpack）来使用，不能直接在浏览器中运行。对于不需要构建工具的场景，可以退而使用内联模板或 JSX 等其他书写方式。

## 8. 🤔 Vue 的两种 API 风格是什么？如何选择？

Vue 3 提供了两种 API 风格来组织组件逻辑：选项式 API（Options API）和组合式 API（Composition API）。

### 8.1. 选项式 API（Options API）

选项式 API 是 Vue 2 时代就存在的经典写法，也是很多初学者最先接触的 Vue 写法。它通过一个包含多个选项的对象来定义组件，每个选项对应一个特定的功能区域：

```html
<template>
  <div>
    <p>{{ message }}</p>
    <p>计数：{{ count }}，翻倍：{{ doubleCount }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
  export default {
    // 响应式数据
    data() {
      return { count: 0, message: 'Hello' }
    },
    // 计算属性
    computed: {
      doubleCount() {
        return this.count * 2
      },
    },
    // 侦听器
    watch: {
      count(newVal, oldVal) {
        console.log(`count 从 ${oldVal} 变为 ${newVal}`)
      },
    },
    // 方法
    methods: {
      increment() {
        this.count++
      },
    },
    // 生命周期钩子
    mounted() {
      console.log('组件已挂载')
    },
  }
</script>
```

优点：结构清晰，每个选项有固定的位置和语义，初学者可以快速理解组件的组成部分。`this` 的隐式绑定让模板中的数据和方法调用看起来非常简洁。

缺点：当组件逻辑变得复杂时，相关的代码片段（如某个功能的数据、计算属性、方法）会被分散到不同的选项中，导致逻辑碎片化，难以提取和复用。

### 8.2. 组合式 API（Composition API）

组合式 API 是 Vue 3 引入的新风格，它允许开发者按照功能逻辑而非选项类型来组织代码。核心思路是将相关逻辑聚合在一起，而不是分散在各个选项中：

```html
<template>
  <div>
    <p>{{ message }}</p>
    <p>计数：{{ count }}，翻倍：{{ doubleCount }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue'

  // 响应式数据
  const count = ref(0)
  const message = ref('Hello')

  // 计算属性
  const doubleCount = computed(() => count.value * 2)

  // 侦听器
  watch(count, (newVal, oldVal) => {
    console.log(`count 从 ${oldVal} 变为 ${newVal}`)
  })

  // 方法
  function increment() {
    count.value++
  }

  // 生命周期钩子
  onMounted(() => {
    console.log('组件已挂载')
  })
</script>
```

组合式 API 通常配合 `<script setup>` 语法糖使用，这是 Vue 3.2 引入的简化写法。在 `<script setup>` 中，顶层的变量、函数和导入都可以直接在模板中使用，无需 `return`。

优点：

- 逻辑聚合：相关的数据、计算、方法和生命周期钩子可以写在一起，代码更内聚、可读性更强。
- 逻辑复用：可以通过组合式函数（composables）将可复用的逻辑提取到独立的函数中，比选项式 API 的 mixins 更加灵活和清晰。
- 更好的类型推导：组合式 API 天然支持 TypeScript 类型推导，在 `<script setup>` 中配合泛型使用体验极佳。

缺点：对于初学者来说，组合式 API 需要理解 `ref`、`reactive`、`computed` 等响应式 API 的概念，学习曲线比选项式 API 稍陡。

### 8.3. 如何选择？

两种 API 风格并非互斥关系，Vue 官方允许在同一个项目中甚至同一个组件中混合使用两者。选择建议如下：

- 初学者或简单场景：推荐选项式 API。它的结构一目了然，学习成本低，足以应对大部分中小型组件的需求。
- 中大型项目或复杂组件：推荐组合式 API。它能更好地组织复杂逻辑，方便提取和复用代码，配合 TypeScript 使用体验更佳。
- 团队已有约定：以团队的技术栈和约定为准，保持项目内风格统一即可。

两种风格的核心差异不在于能力，而在于代码的组织方式。选项式 API 按选项类型分组，组合式 API 按功能逻辑分组。在底层实现上，选项式 API 实际上是基于组合式 API 实现的，因此无论选择哪种风格，最终获得的都是同一个 Vue 响应式系统的全部能力。

## 9. 🔗 引用

- [Vue.js 官方文档 - 简介][2]
- [play.vuejs.org][1]

[1]: https://play.vuejs.org/
[2]: https://cn.vuejs.org/guide/introduction.html
