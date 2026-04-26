# [0070. 创建一个应用](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0070.%20%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E5%BA%94%E7%94%A8)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是 Vue 应用实例？](#3--什么是-vue-应用实例)
- [4. 🤔 什么是根组件？](#4--什么是根组件)
- [5. 🤔 应用实例有哪些核心方法？](#5--应用实例有哪些核心方法)
  - [5.1. `mount()`](#51-mount)
  - [5.2. `component()`](#52-component)
  - [5.3. `directive()`](#53-directive)
  - [5.4. `use()`](#54-use)
  - [5.5. `provide()`](#55-provide)
- [6. 🤔 如何在一个页面中创建多个 Vue 应用？](#6--如何在一个页面中创建多个-vue-应用)
- [7. 🔗 引用](#7--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 通过 `createApp` 创建一个 Vue 应用实例
- 应用实例的核心配置与常用方法
- 根组件的作用与挂载方式
- 多个应用实例的共存
- 模板语法的基本使用

## 2. 🫧 评价

这篇笔记主要是参考 [Vue.js 官方文档 - 创建一个应用][1] 来写的，可以结合着一起看。

## 3. 🤔 什么是 Vue 应用实例？

每个 Vue 应用都会通过 `createApp` 函数创建一个应用实例（Application Instance）。这个实例是 Vue 应用的起点，它封装了应用的全局配置，并负责管理整个组件树。

```js
import { createApp } from 'vue'

const app = createApp({
  /* 根组件选项 */
})
```

应用实例在 Vue 3 中取代了 Vue 2 中的 `new Vue()` 全局构造函数。这种设计使得多个 Vue 应用可以在同一页面中共存，而不会相互干扰全局配置。

## 4. 🤔 什么是根组件？

传递给 `createApp` 的对象就是这个应用的根组件（Root Component）。根组件是 Vue 组件树的起点，其他所有组件都是它的子组件或后代组件。

当一个 Vue 应用被挂载后，根组件的模板会被渲染到挂载点中：

```html
<div id="app">
  <!-- 根组件渲染的内容会出现在这里 -->
</div>
```

```js
import { createApp } from 'vue'

const app = createApp({
  data() {
    return { message: 'Hello Vue!' }
  },
  template: `
    <h1>{{ message }}</h1>
    <p>欢迎学习 Vue 3</p>
  `,
})

app.mount('#app')
```

在实际的项目开发中，我们通常使用单文件组件（SFC）来定义根组件：

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

这里 `App.vue` 就是根组件，它包含了应用的顶层布局和全局逻辑。

## 5. 🤔 应用实例有哪些核心方法？

`createApp` 返回的应用实例提供了多个方法用于配置和控制应用：

### 5.1. `mount()`

`mount()` 方法用于将 Vue 应用挂载到指定的 DOM 元素上。它接受一个 CSS 选择器或实际的 DOM 元素作为参数：

```js
// 使用 CSS 选择器
app.mount('#app')

// 使用实际的 DOM 元素
app.mount(document.getElementById('app'))
```

`mount()` 方法必须在应用的所有配置完成之后调用，且每个应用实例只能调用一次。

### 5.2. `component()`

`component()` 方法用于注册全局组件，注册后可在应用内的任何组件中使用：

```js
app.component('MyComponent', {
  template: `<p>这是一个全局组件</p>`,
})
```

### 5.3. `directive()`

`directive()` 方法用于注册全局自定义指令：

```js
app.directive('focus', {
  mounted(el) {
    el.focus()
  },
})
```

### 5.4. `use()`

`use()` 方法用于安装 Vue 插件，比如 Vue Router 和 Pinia：

```js
import { createRouter } from 'vue-router'

const router = createRouter({ ... })
app.use(router)
```

### 5.5. `provide()`

`provide()` 方法用于在应用级别提供数据，所有组件都可以通过 `inject` 获取：

```js
app.provide('config', {
  apiBaseUrl: 'https://api.example.com',
})
```

这些方法通常支持链式调用：

```js
createApp(App)
  .component('MyComponent', { ... })
  .directive('focus', { ... })
  .use(router)
  .mount('#app')
```

## 6. 🤔 如何在一个页面中创建多个 Vue 应用？

Vue 3 的 `createApp` API 支持在同一页面中创建多个独立的应用实例，每个实例都有自己的全局配置和组件树：

```html
<div id="app1">
  <h1>{{ title }}</h1>
</div>

<div id="app2">
  <p>{{ message }}</p>
</div>
```

```js
import { createApp } from 'vue'

// 第一个应用
const app1 = createApp({
  data() {
    return { title: '应用一' }
  },
})
app1.mount('#app1')

// 第二个应用
const app2 = createApp({
  data() {
    return { message: '这是第二个独立的应用' }
  },
})
app2.mount('#app2')
```

这种多实例的设计在实际开发中适用于微前端架构或需要将 Vue 逐步引入现有页面的场景。

## 7. 🔗 引用

- [Vue.js 官方文档 - 创建一个应用][1]

[1]: https://cn.vuejs.org/guide/essentials/application
