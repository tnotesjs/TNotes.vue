# [0070. 创建一个应用](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0070.%20%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E5%BA%94%E7%94%A8)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是 Vue 应用实例？](#3--什么是-vue-应用实例)
- [4. 🤔 什么是根组件？](#4--什么是根组件)
- [5. 🤔 应用实例有哪些核心方法？](#5--应用实例有哪些核心方法)
  - [5.1. 常用 API](#51-常用-api)
    - [`app.mount()`](#appmount)
    - [`app.component()`](#appcomponent)
    - [`app.directive()`](#appdirective)
    - [`app.use()`](#appuse)
    - [`app.provide()`](#appprovide)
  - [5.2. 小结](#52-小结)
- [6. 🤔 为什么需要 `mount`？](#6--为什么需要-mount)
- [7. 🤔 为什么 `mount` 方法必须在所有配置完成之后调用？](#7--为什么-mount-方法必须在所有配置完成之后调用)
- [8. 🤔 如何在一个页面中创建多个 Vue 应用？](#8--如何在一个页面中创建多个-vue-应用)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 通过 `createApp` 创建一个 Vue 应用实例
- 应用实例的核心配置与常用方法
- 根组件的作用与挂载方式
- 多个应用实例的共存
- 模板语法的基本使用

## 2. 🫧 评价

这篇笔记主要是参考 [Vue.js 官方文档 - 创建一个应用][1] 来写的，可以结合着一起看。笔记中只对应用实例相关 API 进行了简单介绍，详细信息请直接查阅官方文档。

关于应用实例 API，比如 `createApp()`，我们在实际开发项目中通常只会调用一次，主要用于创建一个根实例（也就是我们的 Vue 应用程序），在后续的学习中，很少会看到它的身影。如果你要处理的逻辑的是跟整个 Vue 应用直接相关的（通常是一些全局性质的逻辑），要能想起它即可。

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

```html {16-33}
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="importmap">
      {
        "imports": {
          "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
        }
      }
    </script>
    <title>Document</title>
  </head>
  <body>
    <div id="app">
      <!-- 根组件渲染的内容会出现在这里 -->
    </div>
    <script type="module">
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
    </script>
  </body>
</html>
```

最终渲染结果：

::: swiper

![页面预览](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-26-22-24-19.png)

![元素结构](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-26-22-25-01.png)

:::

在实际的项目开发中，我们通常使用单文件组件（SFC）来定义根组件：

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

这里 `App.vue` 就是根组件，它包含了应用的顶层布局和全局逻辑。

## 5. 🤔 应用实例有哪些核心方法？

`createApp` 返回的应用实例提供了多个方法用于配置和控制应用，这里主要介绍几个相对来说比较常用的：

### 5.1. 常用 API

#### `app.mount()`

`mount()` 方法用于将 Vue 应用挂载到指定的 DOM 元素上。它接受一个 CSS 选择器或实际的 DOM 元素作为参数：

```js
// 使用 CSS 选择器
app.mount('#app') // 使用第一个匹配到的元素

// 使用实际的 DOM 元素
app.mount(document.getElementById('app'))
```

`mount()` 方法必须在应用的所有配置完成之后调用，且每个应用实例只能调用一次。

#### `app.component()`

`component()` 方法用于注册全局组件，注册后可在应用内的任何组件中使用：

```js
app.component('MyComponent', {
  template: `<p>这是一个全局组件</p>`,
})
```

#### `app.directive()`

`directive()` 方法用于注册全局自定义指令：

```js
app.directive('focus', {
  mounted(el) {
    el.focus()
  },
})
```

#### `app.use()`

`use()` 方法用于安装 Vue 插件，比如 Vue Router 和 Pinia：

```js
import { createRouter } from 'vue-router'

const router = createRouter({ ... })
app.use(router)
```

#### `app.provide()`

`provide()` 方法用于在应用级别提供数据，所有组件都可以通过 `inject` 获取：

```js
app.provide('config', {
  apiBaseUrl: 'https://api.example.com',
})
```

### 5.2. 小结

上述内容只是对 `app` 实例的一部分核心方法进行了简单的介绍，Vue 应用实例还提供了其他一些方法和属性，如 `app.mixin()`、`app.config` 等等。

有关 `app` 实例相关 API 的详细说明，可自行查阅：Vue 官方文档 --> API 模块 --> 创建应用。

::: tip

上面提到的这些方法通常支持链式调用：

```js
createApp(App)
  .component('MyComponent', { ... })
  .directive('focus', { ... })
  .use(router)
  .mount('#app')
```

具体可以结合接口的类型声明来看，如果返回值是 `this`，那么就表示返回的还是 `app` 实例本身，你可以继续调用其他方法。

:::

## 6. 🤔 为什么需要 `mount`？

如果没有 `mount()`，应用实例就只是一个孤立的 JavaScript 对象，它不知道该把自己渲染到页面上的哪个位置，也不会产生任何可见的 UI 输出。

```js
import { createApp } from 'vue'

// 创建应用实例
const app = createApp({
  data() {
    return { message: 'Hello Vue!' }
  },
  template: `<h1>{{ message }}</h1>`,
})

// 在挂载之前，我们只是创建了一个孤立的 JS 对象
// 它和 UI 页面之间没有任何联系

// 挂载到 DOM 元素，Vue 才能控制这个 DOM 元素
app.mount('#app')
```

Vue 的设计理念是声明式地将数据渲染到 DOM，但在这之前，Vue 需要知道两件事：

1. 渲染什么？ ==> 由根组件（template 或组件树）定义
2. 渲染到哪里？ ==> 由 `mount()` 指定的 DOM 挂载点定义

`mount()` 就是连接“渲染什么”和“渲染到哪里”的桥梁。没有它，应用实例就无法和 DOM 建立联系。

此外，`mount()` 的调用时机还体现了一种设计思想：配置优先，渲染在后。

- 在调用 `mount()` 之前，你可以对应用进行各种全局配置（注册全局组件、安装插件、设置全局指令等）
- 一旦调用 `mount()`，应用就被“冻住”并开始渲染，后续再修改全局配置就不会生效了

## 7. 🤔 为什么 `mount` 方法必须在所有配置完成之后调用？

一旦调用 `mount()`，Vue 会立即执行以下操作：

1. 编译根组件模板（如果没有预编译的话）
2. 创建组件实例并运行组件的初始化逻辑
3. 执行渲染函数生成虚拟 DOM 树
4. 将虚拟 DOM 渲染为真实 DOM，替换掉挂载点

从 `mount()` 被调用的那一刻起，应用就进入了运行阶段。如果在 `mount()` 之后再修改全局配置（比如注册组件、安装插件），这些配置对已经渲染出来的组件是不生效的 ==> 因为它们已经被“定型”了。

```js
// ✅ 正确：先配置，再挂载
const app = createApp(App)
app.component('MyComponent', { ... })
app.use(router)
app.mount('#app')

// ❌ 错误：挂载之后再注册组件，不会影响已渲染的内容
const app = createApp(App)
app.mount('#app')
app.component('MyComponent', { ... }) // 无效
```

这也符合 Vue 应用的生命周期逻辑：创建 --> 配置 --> 挂载 --> 运行。

## 8. 🤔 如何在一个页面中创建多个 Vue 应用？

Vue 3 的 `createApp` API 支持在同一页面中创建多个独立的应用实例，每个实例都有自己的全局配置和组件树：

```html {16-43}
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="importmap">
      {
        "imports": {
          "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
        }
      }
    </script>
    <title>Document</title>
  </head>
  <body>
    <!-- 第一个 Vue 应用 -->
    <div id="app1">
      <h1>{{ title }}</h1>
    </div>
    <!-- 第二个 Vue 应用 -->
    <div id="app2">
      <p>{{ message }}</p>
    </div>

    <script type="module">
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
    </script>
  </body>
</html>
```

页面最终渲染结果如下：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-26-22-43-09.png)

这种多实例的设计在实际开发中适用于微前端架构或需要将 Vue 逐步引入现有页面的场景。

更多情况下，我们的应用就是一个单实例的 SPA（单页应用），这时我们只需要创建一个根实例，并通过组件化的方式来组织应用的结构即可。

## 9. 🔗 引用

- [Vue.js 官方文档 - 创建一个应用][1]
- [Vue.js 官方文档 - 应用实例 API - createApp()][2]

[1]: https://cn.vuejs.org/guide/essentials/application
[2]: https://cn.vuejs.org/api/application
