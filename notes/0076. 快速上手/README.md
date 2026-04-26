# [0076. 快速上手](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0076.%20%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 本地开发环境和线上学习环境如何选择？](#3--本地开发环境和线上学习环境如何选择)
- [4. 🤔 如何安装和引入 Vue？](#4--如何安装和引入-vue)
- [5. 💻 demos.1 - 通过 CDN 的方式引入 Vue](#5--demos1---通过-cdn-的方式引入-vue)
- [6. 💻 demos.2 - 通过 NPM 包的方式引入 Vue](#6--demos2---通过-npm-包的方式引入-vue)
- [7. 🔗 引用](#7--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Vue 开发环境搭建简介

## 2. 🫧 评价

## 3. 🤔 本地开发环境和线上学习环境如何选择？

Vue 开发环境推荐直接在本地搭建，因为日常项目开发中我们都是在本地初始化一个 Vue 项目环境来进行开发的，提前熟悉本地环境的搭建流程能够让你更快地上手 Vue 的开发，并且在实际项目中能够更加得心应手。

通过本地搭建环境，你可以更好地理解 Vue 的构建过程、模块化机制以及与其他工具的集成方式，这些都是在在线环境中难以全面体验到的。此外，使用本地环境还可以让你更灵活地配置项目结构、安装依赖和使用各种插件，从而更深入地掌握 Vue 的开发流程和最佳实践。

如果你还不清楚本地手动搭建 Vue 开发环境的具体步骤，可以参考下笔记中的内容。

如果你更倾向于使用在线环境快速验证一些 Vue 相关的概念和代码片段，也可以使用 CodeSandbox、StackBlitz 等在线 IDE 平台，这些平台提供了预配置的 Vue 模板，能够让你快速上手并进行实验。你可以在 [Vue 官方文档 - 快速上手][1] 这篇文档中找到官方推荐的线上尝试 Vue 的方式。

::: tip 小结

- 追求真实的开发环境：优先推荐走本地手动搭建的方式
- 追求便携且示例代码简单：直接使用 Vue 官方提供的演练场（Playground）

:::

## 4. 🤔 如何安装和引入 Vue？

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

## 5. 💻 demos.1 - 通过 CDN 的方式引入 Vue

## 6. 💻 demos.2 - 通过 NPM 包的方式引入 Vue

## 7. 🔗 引用

- [Vue 官方文档 - 快速上手][1]

[1]: https://cn.vuejs.org/guide/quick-start.html
