# [0023. 邂逅 Vue.js](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0023.%20%E9%82%82%E9%80%85%20Vue.js)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是 Vue.js？](#3--什么是-vuejs)
- [4. 🤔 Vue.js 的发展历史与版本变迁是怎样的？](#4--vuejs-的发展历史与版本变迁是怎样的)
- [5. 🤔 如何理解 Vue 的渐进式框架理念？](#5--如何理解-vue-的渐进式框架理念)
- [6. 🤔 声明式渲染和命令式渲染有什么区别？](#6--声明式渲染和命令式渲染有什么区别)
- [7. 🤔 如何安装和引入 Vue？](#7--如何安装和引入-vue)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 什么是 Vue.js
- Vue.js 的发展历史与版本变迁
- 渐进式框架的理解
- 声明式渲染 vs 命令式渲染
- 安装与引入 Vue（CDN、NPM、Vite）

## 2. 🫧 评价

- todo

## 3. 🤔 什么是 Vue.js？

Vue.js 是一个用于构建用户界面的渐进式 JavaScript 框架，由尤雨溪（Evan You）于 2014 年创建并开源。Vue 的核心设计思想是通过声明式的方式将数据渲染到 DOM 中，开发者只需要关注数据本身的变化，框架会自动将这些变化映射到视图上，无需手动操作 DOM 元素。

Vue 的名字来源于法语中的"vue"，意为"视图"，这恰好反映了它的核心定位——专注于视图层的构建。与 React 和 Angular 等同类前端框架相比，Vue 的学习曲线更加平缓，API 设计也更加直观。Vue 的官方文档以其清晰、全面、友好著称，这让初学者能够快速上手，同时也让有经验的开发者能够深入理解其设计理念。

Vue 的核心特性可以从以下几个方面来理解：

响应式数据绑定是 Vue 最核心的特性之一。当你在 Vue 中定义一个响应式数据，比如 ref 或 reactive 对象，Vue 的响应式系统会自动追踪这个数据的依赖关系。当数据发生变化时，所有依赖该数据的视图都会自动更新。这种机制极大地简化了开发流程，开发者不再需要手动调用 DOM API 来更新页面内容。

组件化架构是 Vue 的另一大核心设计。Vue 将 UI 界面拆分为独立的、可复用的组件，每个组件封装了自己的模板（template）、逻辑（script）和样式（style）。这种组件化的设计方式不仅让代码更加清晰、可维护，也使得团队协作变得更加高效。

虚拟 DOM 是 Vue 内部的渲染优化机制。Vue 不会直接操作真实 DOM，而是先在内存中构建一棵虚拟 DOM 树（Virtual DOM Tree），当数据变化时，Vue 会生成一棵新的虚拟 DOM 树，然后通过 diff 算法比较新旧两棵树的差异，最终只将真正发生变化的部分应用到真实 DOM 上。这种方式大幅减少了不必要的 DOM 操作，提升了渲染性能。

下面是一个最简单的 Vue 3 应用示例：

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
```

在这个例子中，通过 createApp 创建了一个 Vue 应用实例，使用 ref 定义了两个响应式数据 message 和 count。模板中的 `{{ message }}` 是插值语法，会将 message 的值渲染到页面上。`@click` 是 `v-on:click` 的缩写，用于监听点击事件。当用户点击按钮时，count 的值会自增，页面上的显示也会随之自动更新。

Vue 在全球范围内拥有庞大的社区和丰富的生态系统。在国内，阿里巴巴、百度、腾讯、字节跳动等大厂都广泛使用 Vue 来构建前端应用。在国际上，GitLab、Apple、任天堂等企业也在其产品中采用了 Vue。Vue 在 GitHub 上拥有超过 40 万颗星标，是最受欢迎的前端框架之一。

## 4. 🤔 Vue.js 的发展历史与版本变迁是怎样的？

Vue.js 的发展历程是一段从个人项目成长为全球顶级前端框架的传奇故事，了解这段历史有助于我们理解 Vue 各个版本的设计决策和技术演进方向。

2013 年，尤雨溪在 Google Creative Lab 工作期间开始构思 Vue 的雏形。当时他在多个项目中使用 Angular，发现 Angular 虽然功能强大，但过于沉重，很多场景下只需要一个轻量级的数据绑定工具。于是他开始尝试从 Angular 中提取出最有价值的部分——声明式的数据绑定和组件化——将其封装为一个更轻量、更灵活的工具。

2014 年 2 月，Vue.js 正式对外发布 0.x 版本。这个最初的版本已经具备了响应式数据绑定和指令系统等核心特性，但功能相对简单，更像是一个视图层的模板引擎。即便如此，Vue 简洁直观的 API 设计已经开始吸引一批开发者的关注。

2015 年 10 月，Vue 1.0 版本（代号 Evangelion，即"新世纪福音战士"）正式发布。1.0 版本引入了许多重要改进，包括优化后的模板编译器、改进的组件系统、过渡效果系统等。这个版本标志着 Vue 从实验性质的项目真正走向了可用于生产环境的成熟框架。同时期，vue-router 和 vuex 等官方配套工具也陆续推出，形成了初步的 Vue 生态系统。

2016 年 10 月，Vue 2.0 版本（代号 Ghost in the Shell，即"攻壳机动队"）发布，这是 Vue 发展史上的一次重大飞跃。Vue 2 引入了虚拟 DOM 机制，大幅提升了渲染性能。同时，Vue 2 保持了与 1.x 版本极高的 API 兼容性，降低了迁移成本。Vue 2 还支持了服务端渲染（SSR），进一步扩展了 Vue 的应用场景。在 Vue 2 时代，Vue 的用户量迅速增长，成为与 React、Angular 并列的三大前端框架之一。

Vue 2 的响应式系统基于 Object.defineProperty 实现。这个 API 可以拦截对象属性的读取和设置操作，从而实现数据变化的自动追踪。但 Object.defineProperty 也存在一些局限性——它无法检测对象属性的添加和删除，也无法监听数组索引的直接赋值。Vue 2 通过 Vue.set 和数组变异方法等方式来弥补这些不足，但这些限制始终是开发者在使用过程中需要注意的问题。

2020 年 9 月，Vue 3.0 版本（代号 One Piece，即"海贼王"）正式发布，这是 Vue 发展史上最重要的里程碑之一。Vue 3 带来了全面的架构升级。

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
- 性能优化：通过静态提升（Static Hoisting）、Patch Flags、Tree Shaking 等编译时优化手段，Vue 3 的渲染性能比 Vue 2 提升了约 1.3 到 2 倍，打包体积也减小了约 41%。
- 更好的 TypeScript 支持：Vue 3 本身就是用 TypeScript 编写的，原生提供了完善的类型推导能力。
- 新的内置组件：引入了 Teleport（传送门）、Suspense（异步组件加载）和 Fragment（多根节点） 等新组件。

2022 年 1 月，Vue 3 正式成为 Vue 的默认版本，npm 上的 `vue` 包直接指向 Vue 3。同年，Vue 3 的配套生态也趋于成熟——Vue Router 4、Pinia（替代 Vuex 的新一代状态管理工具）、Vite（新一代构建工具）等都已经稳定可用。

Vue 3.3（2023 年 5 月）引入了泛型组件、defineSlots、defineOptions 等特性，进一步完善了 TypeScript 开发体验。Vue 3.4（2024 年 1 月）对模板解析器进行了重写，性能提升约 2 倍，并引入了 defineModel 稳定版。Vue 3.5（2024 年 9 月）优化了响应式系统的内存使用，引入了 useTemplateRef 和 useId 等新的组合式函数。

## 5. 🤔 如何理解 Vue 的渐进式框架理念？

"渐进式框架"（Progressive Framework）是 Vue 最核心的设计哲学之一，也是 Vue 与其他前端框架的重要区别所在。理解这个概念对于正确使用 Vue 以及选择合适的技术栈至关重要。

所谓"渐进式"，是指 Vue 的设计允许你根据项目的实际需求，逐步引入和使用框架的各个部分，而不是一开始就要求你接受整个框架的所有理念和工具。你可以把 Vue 想象成一组同心圆——最内层是核心的声明式渲染能力，往外依次是组件系统、客户端路由、大规模状态管理、构建工具链等。你可以只使用内层的功能，也可以根据需要逐步向外扩展。

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

第五层是服务端渲染（SSR）。当你的应用需要更好的 SEO 表现或首屏加载性能时，可以使用 Nuxt.js 框架来实现服务端渲染，或者使用 Vue 官方提供的 SSR 方案。

这种渐进式的理念与 Angular 形成了鲜明对比。Angular 是一个"全家桶"式的框架，它从一开始就要求开发者接受整套技术方案——包括模块系统、路由、表单处理、HTTP 客户端、依赖注入等。Angular 的学习成本较高，但一旦掌握就能获得一个完整的开发体系。React 则走了另一个极端——它只关注视图层的渲染，路由、状态管理等功能全部由社区提供，开发者需要自行选择和组合各种第三方库。

Vue 的渐进式设计恰好处于 Angular 和 React 之间。Vue 的核心库只关注视图层，保持了轻量和灵活。同时，Vue 官方维护了一系列高质量的配套工具（Vue Router、Pinia、Vite 等），开发者可以按需引入。这些官方工具之间有着良好的集成和一致的设计风格，使用起来就像一个整体，但任何一个都可以被替换或省略。

渐进式设计还体现在 Vue 的 API 风格上。Vue 3 同时支持选项式 API（Options API）和组合式 API（Composition API），前者更直观、更适合初学者，后者更灵活、更适合大型项目。开发者可以在同一个项目中混合使用两种 API，根据具体场景选择最合适的方式。这种"没有唯一正确用法"的设计哲学，正是渐进式框架理念的深层体现。

## 6. 🤔 声明式渲染和命令式渲染有什么区别？

声明式渲染（Declarative Rendering）和命令式渲染（Imperative Rendering）是两种截然不同的 UI 编程范式，理解它们的区别是掌握 Vue.js 设计哲学的关键。

命令式渲染关注的是"如何做"（How）。在命令式的编程方式中，开发者需要逐步告诉计算机每一个操作步骤——创建哪个 DOM 元素、设置什么属性、把它插入到哪个位置、什么时候更新内容等。传统的 DOM 操作和 jQuery 就是典型的命令式编程方式：

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

在上面的例子中，开发者需要手动创建 DOM 元素、手动设置文本内容、手动添加事件监听器，还需要在事件回调中手动更新 DOM。每一步都是明确的、具体的指令。这种方式在简单场景下还可以接受，但当应用变得复杂时，手动管理 DOM 状态会变得极其困难——你需要追踪每一个可能变化的 DOM 节点，确保在每次数据变化时都正确地更新了所有相关的 UI 元素。

声明式渲染关注的是"是什么"（What）。在声明式的编程方式中，开发者只需要描述 UI 应该呈现什么样子，而不需要关心具体的更新步骤。Vue.js 就是声明式渲染的典型代表：

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

同样的功能，声明式的写法要简洁得多。模板中的 `{{ message }}` 和 `{{ count }}` 声明了"这里应该显示什么数据"，`@click="count++"` 声明了"点击时数据应该怎样变化"。至于 DOM 的创建、更新、事件绑定等底层操作，全部由 Vue 框架自动完成。

两种范式的核心差异可以总结为以下几点：

在关注点方面，命令式渲染要求开发者同时管理数据状态和 DOM 状态，需要手动保持两者的同步。声明式渲染则让开发者专注于数据状态的管理，DOM 状态的同步由框架自动处理。

在代码可维护性方面，命令式代码的可读性和可维护性往往较差，因为业务逻辑和 DOM 操作交织在一起。声明式代码将数据和视图的关系以直观的方式表达出来，代码更容易阅读和理解。

在性能方面，命令式渲染在理论上可以达到最优性能，因为开发者可以精确控制每一次 DOM 操作。声明式渲染由于需要框架在中间做一层转换（虚拟 DOM diff 等），会引入一定的性能开销。但在实际开发中，框架的自动优化通常能够满足绝大多数场景的性能需求，而且手动优化命令式代码的成本往往远高于声明式方案。

来看一个更复杂的对比。假设我们需要实现一个待办事项列表，支持添加和删除操作：

```js
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

```html
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

在声明式版本中，模板清晰地描述了 UI 结构——一个输入框、一个按钮、一个由 v-for 渲染的列表。数据和视图的关系一目了然。相比之下，命令式版本中的 DOM 操作和事件处理逻辑交织在一起，很难快速理解代码的意图。

Vue 选择声明式渲染作为核心范式，是因为它能够在保持足够性能的前提下，极大地降低开发和维护的复杂度。当然，Vue 也并没有完全排斥命令式的方式——在某些需要直接操作 DOM 的场景中（如自定义指令、第三方库集成等），Vue 仍然允许开发者使用命令式的方式进行底层操作。

## 7. 🤔 如何安装和引入 Vue？

Vue 提供了多种安装和引入方式，开发者可以根据项目的规模和需求选择最合适的方案。从最简单的 CDN 引入到完整的工程化方案，Vue 的渐进式设计让每种场景都能找到合适的接入方式。

CDN 引入是最快速的上手方式，适合学习、原型开发或在已有的 HTML 页面中局部使用 Vue。你可以直接在 HTML 文件的 script 标签中引入 Vue 的 CDN 地址：

```html
<!-- 开发版本，包含完整的警告和调试信息 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<!-- 生产版本，经过压缩优化 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
```

使用 CDN 引入后，Vue 会被注册为一个全局变量，你可以直接使用：

```html
<div id="app">
  <p>{{ message }}</p>
</div>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  const { createApp, ref } = Vue

  createApp({
    setup() {
      const message = ref('通过 CDN 引入 Vue')
      return { message }
    },
  }).mount('#app')
</script>
```

CDN 引入还有一种 ES Module 的方式，适合在现代浏览器中使用原生模块系统：

```html
<div id="app">
  <p>{{ message }}</p>
</div>
<script type="module">
  import {
    createApp,
    ref,
  } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

  createApp({
    setup() {
      const message = ref('通过 ES Module 引入 Vue')
      return { message }
    },
  }).mount('#app')
</script>
```

通过 Import Map，还可以让引入路径更加简洁：

```html
<script type="importmap">
  {
    "imports": {
      "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
    }
  }
</script>

<script type="module">
  import { createApp, ref } from 'vue'
  // 后续代码与上面相同
</script>
```

NPM 安装是正式项目开发中最常用的方式。通过 npm 或其他包管理器安装 Vue，可以充分利用模块化和构建工具的能力：

```bash
# 使用 npm
npm install vue

# 使用 pnpm
pnpm add vue

# 使用 yarn
yarn add vue
```

安装后在项目中通过 ES Module 的方式导入：

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

使用 Vite 创建项目是目前官方推荐的方式，也是最主流的 Vue 项目初始化方案。Vite 是一个由尤雨溪开发的新一代前端构建工具，它利用原生 ES Module 实现了极快的开发服务器启动和热更新：

```bash
# 使用 npm
npm create vue@latest

# 使用 pnpm
pnpm create vue@latest

# 使用 yarn
yarn create vue@latest
```

执行上面的命令后，create-vue 脚手架会引导你进行一系列配置选择：

```
✔ 请输入项目名称 … my-vue-app
✔ 是否使用 TypeScript 语法？ … 否 / 是
✔ 是否启用 JSX 支持？ … 否 / 是
✔ 是否引入 Vue Router 进行单页面应用开发？ … 否 / 是
✔ 是否引入 Pinia 用于状态管理？ … 否 / 是
✔ 是否引入 Vitest 用于单元测试？ … 否 / 是
✔ 是否引入 ESLint 用于代码质量检测？ … 否 / 是
```

完成选择后，脚手架会自动生成项目结构：

```bash
cd my-vue-app
pnpm install
pnpm dev
```

生成的项目结构通常如下：

```
my-vue-app/
├── index.html          # 入口 HTML 文件
├── package.json        # 项目配置和依赖
├── vite.config.js      # Vite 配置文件
├── src/
│   ├── main.js         # 应用入口文件
│   ├── App.vue         # 根组件
│   ├── components/     # 组件目录
│   ├── assets/         # 静态资源
│   └── views/          # 页面视图（如果启用了路由）
└── public/             # 公共静态资源
```

入口文件 main.js 的典型内容如下：

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

需要注意的是，Vue 3 提供了两种不同的构建版本。完整版（vue.global.js）包含模板编译器，可以在运行时编译模板字符串。运行时版（vue.runtime.global.js）不包含模板编译器，体积更小，但不支持运行时模板编译。当你使用 .vue 单文件组件和构建工具时，模板会在构建阶段被预编译为 JavaScript 渲染函数，因此项目中只需要引入运行时版即可。Vite 和 webpack 等工具链默认就使用运行时版，开发者无需额外配置。
