# [0024. Vue 实例与生命周期](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0024.%20Vue%20%E5%AE%9E%E4%BE%8B%E4%B8%8E%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何创建一个 Vue 应用？](#3--如何创建一个-vue-应用)
  - [3.1. createApp](#31-createapp)
  - [3.2. Vue2、Vue3 创建应用的差异对比](#32-vue2vue3-创建应用的差异对比)
- [4. 🤔 Vue 的生命周期钩子函数是什么？](#4--vue-的生命周期钩子函数是什么)
  - [4.1. Vue 实例的生命周期图表](#41-vue-实例的生命周期图表)
  - [4.2. 生命周期的四个阶段](#42-生命周期的四个阶段)
    - [创建阶段](#创建阶段)
    - [挂载阶段](#挂载阶段)
    - [更新阶段](#更新阶段)
    - [卸载阶段](#卸载阶段)
  - [4.3. 特殊场景下的生命周期钩子](#43-特殊场景下的生命周期钩子)
- [5. 💻 demos.1 - 生命周期钩子：Vue 3 的组合式 API](#5--demos1---生命周期钩子vue-3-的组合式-api)
  - [5.1. 示例](#51-示例)
  - [5.2. 注意事项](#52-注意事项)
- [6. 🔗 引用](#6--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 应用创建流程
- 应用挂载与卸载
- 生命周期阶段
- 选项式钩子
- 组合式钩子
- 钩子注册约束

## 2. 🫧 评价

这篇笔记介绍的 Vue 生命周期钩子主要以 composition api 风格为主，因为它更符合现代 Vue3 项目的主流写法，选项式 API 的钩子仅作为补充。但是，无论是组合式还是选项式，核心的生命周期概念和触发时机都是一样的，掌握任意一种风格的基本用法，另一种自然是触类旁通的。

`createApp`、应用挂载与卸载、`mounted` / `unmounted` 以及副作用清理是高频基础，必须掌握。

`activated`、`deactivated`、`errorCaptured` 和更细的时序差异相对进阶，先理解触发时机与同步注册边界即可。

## 3. 🤔 如何创建一个 Vue 应用？

创建一个 Vue 应用是学习 Vue.js 的第一步，也是一个 Vue 应用实例的生命周期起点。在 Vue 3 中，应用的创建方式与 Vue 2 有所不同，Vue 3 使用 `createApp` 函数来创建应用实例，取代了 Vue 2 中直接 `new Vue()` 的方式。这种变化不仅让 API 更加清晰，也为同一页面中运行多个 Vue 应用提供了更好的支持。

### 3.1. createApp

一个 Vue 应用从创建应用实例开始。`createApp` 函数接收一个根组件作为参数，这个根组件是整个组件树的起点。随后调用 `mount` 方法将应用挂载到一个 DOM 元素上：

```js
import { createApp } from 'vue'

// 最简单的根组件
const app = createApp({
  data() {
    return {
      message: '你好，Vue 3！',
    }
  },
})

// 将应用挂载到 id 为 app 的 DOM 元素上
app.mount('#app')
```

在实际项目中，根组件通常是一个 SFC（Single File Component），即：单文件组件（`.vue` 文件）。完整的应用创建流程如下：

::: code-group

```js [main.js]
// main.js —— 应用入口文件
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 可以在挂载之前进行全局配置
app.config.errorHandler = (err) => {
  console.error('全局错误：', err)
}

// 挂载应用
app.mount('#app')
```

```html [App.vue]
<!-- App.vue —— 根组件 -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>欢迎来到我的第一个 Vue 3 应用</p>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const title = ref('Hello Vue 3')
</script>
```

```html [index.html]
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>我的 Vue 应用</title>
  </head>
  <body>
    <!-- 对应的 HTML 文件中需要提供一个挂载点： -->
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

:::

createApp 返回的应用实例对象提供了一系列方法，用于在挂载之前对应用进行全局配置。这些配置操作必须在调用 `mount` 之前完成，因为 `mount` 方法会触发应用的渲染流程：

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import MyComponent from './components/MyComponent.vue'

const app = createApp(App)

// 注册全局组件
app.component('MyComponent', MyComponent)

// 注册全局指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  },
})

// 使用插件
app.use(router)
app.use(pinia)

// 提供全局数据
app.provide('appName', '我的应用')

// 最后挂载
app.mount('#app')
```

### 3.2. Vue2、Vue3 创建应用的差异对比

Vue 3 与 Vue 2 在创建应用时有几个重要区别。

- 表面上看，是 API 差异：Vue 2 使用 `new Vue()` 构造函数，而 Vue 3 使用 `createApp()` 工厂函数。
- 更本质的差异是全局配置的影响范围：Vue 2 的全局 API（如 `Vue.component()`、`Vue.directive()`）是挂载在 Vue 构造函数上的，这意味着所有通过 `new Vue()` 创建的实例都会共享这些全局配置，在测试或微前端场景中容易产生污染。Vue 3 的全局 API 都挂载在应用实例上，不同应用之间完全隔离。

```js
// Vue 3 支持同一页面运行多个独立的应用
const app1 = createApp(App1)
app1.component('SharedComponent', Component1)
app1.mount('#app1')

const app2 = createApp(App2)
app2.component('SharedComponent', Component2) // 不会影响 app1
app2.mount('#app2')
```

`mount` 方法的参数可以是一个 CSS 选择器字符串，也可以是一个实际的 DOM 元素对象。挂载时，Vue 会将根组件的模板渲染结果替换掉挂载点元素的 `innerHTML`。需要注意的是，一个应用实例只能调用一次 `mount`，重复调用会被忽略。

如果你想卸载一个已挂载的应用，可以调用 `unmount` 方法。这在单页面应用的路由切换或动态加载场景中可能会用到：

```js
const app = createApp(App)
app.mount('#app')

// 稍后卸载应用
app.unmount()
```

## 4. 🤔 Vue 的生命周期钩子函数是什么？

Vue 组件的生命周期是指一个组件从创建到销毁的完整过程。在这个过程中，Vue 会在特定的时间点调用一系列预定义的函数，这些函数就被称为生命周期钩子（Lifecycle Hooks）。理解生命周期钩子的触发时机和使用场景，对于正确管理组件的状态、执行副作用操作以及优化性能至关重要。

### 4.1. Vue 实例的生命周期图表

下面是官方提供的 Vue 实例的生命周期图表：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-09-20-38-31.png)

你现在并不需要完全理解图中的所有内容，但以后它将是一个有用的参考。

### 4.2. 生命周期的四个阶段

Vue 组件的生命周期可以分为四个主要阶段：

1. 创建阶段
2. 挂载阶段
3. 更新阶段
4. 卸载阶段

如果你第一次接触生命周期，建议先记住最常用的三个钩子：`mounted`、`updated`、`unmounted`，以及组合式 API 中对应的 `onMounted`、`onUpdated`、`onUnmounted`。

::: tip

这里的划分标准是笔记中为了方便介绍来分的，并非官方标准。官方文档只说了具体有哪些生命周期钩子，并没有明确划分成几个阶段。你也可以根据自己的理解和记忆习惯来划分不同的阶段，重要的是理解每个钩子的触发时机和适用场景。

:::

#### 创建阶段

创建阶段包含 `beforeCreate` 和 `created` 两个钩子。`beforeCreate` 在组件实例初始化之后、数据观测和事件配置之前被调用，此时 `data`、`computed`、`methods` 等选项还没有被处理，无法访问。`created` 在组件实例创建完成后被调用，此时数据观测、计算属性、方法、侦听器等都已经设置好，可以访问和操作响应式数据，但组件尚未挂载到 DOM 上，无法访问 `$el`：

```js
export default {
  data() {
    return {
      message: 'Hello',
    }
  },
  beforeCreate() {
    // 此时 this.message 为 undefined
    console.log('beforeCreate：组件实例刚被创建')
  },
  created() {
    // 此时可以访问 this.message
    console.log('created：', this.message)
    // 适合在此处进行数据初始化、API 请求等
    this.fetchInitialData()
  },
}
```

#### 挂载阶段

挂载阶段包含 `beforeMount` 和 `mounted` 两个钩子。`beforeMount` 在组件被挂载到 DOM 之前调用，模板已经编译完成但还没有渲染到页面上。`mounted` 在组件被挂载到 DOM 之后调用，此时可以访问到真实的 DOM 元素：

```js
export default {
  mounted() {
    // 此时可以访问 DOM
    console.log('mounted：组件已挂载到 DOM')

    // 适合进行 DOM 操作
    this.$refs.input.focus()

    // 适合初始化第三方库
    this.chart = new Chart(this.$refs.canvas, {
      type: 'bar',
      data: this.chartData,
    })

    // 适合添加事件监听
    window.addEventListener('resize', this.handleResize)
  },
}
```

#### 更新阶段

更新阶段包含 `beforeUpdate` 和 `updated` 两个钩子。当组件的响应式数据发生变化并导致重新渲染时，这两个钩子会被触发。`beforeUpdate` 在 DOM 更新之前调用，此时数据已经是最新的，但 DOM 还是旧的。`updated` 在 DOM 更新之后调用：

```js
export default {
  data() {
    return {
      count: 0,
    }
  },
  beforeUpdate() {
    console.log('beforeUpdate：DOM 即将更新')
    // 可以在此处获取更新前的 DOM 状态
  },
  updated() {
    console.log('updated：DOM 已更新')
    // 注意：避免在此处修改数据，否则可能导致无限循环
  },
}
```

#### 卸载阶段

卸载阶段包含 `beforeUnmount`（Vue 2 中为 `beforeDestroy`）和 `unmounted`（Vue 2 中为 `destroyed`）两个钩子。`beforeUnmount` 在组件卸载之前调用，此时组件实例仍然完全可用。`unmounted` 在组件卸载之后调用：

```js
export default {
  beforeUnmount() {
    console.log('beforeUnmount：组件即将卸载')
    // 清理工作：移除事件监听、取消定时器、销毁第三方库实例等
    window.removeEventListener('resize', this.handleResize)
    clearInterval(this.timer)

    if (this.chart) {
      this.chart.destroy()
    }
  },
  unmounted() {
    console.log('unmounted：组件已卸载')
  },
}
```

### 4.3. 特殊场景下的生命周期钩子

除了上述核心生命周期钩子外，Vue 还提供了一些特殊场景的钩子：

activated 和 deactivated 钩子与 keep-alive 组件配合使用。当一个被 keep-alive 缓存的组件被激活时触发 activated，被停用时触发 deactivated：

```html
<script setup>
  import { onActivated, onDeactivated } from 'vue'

  onActivated(() => {
    console.log('组件被激活，刷新数据')
    fetchLatestData()
  })

  onDeactivated(() => {
    console.log('组件被停用')
  })
</script>
```

errorCaptured 钩子用于捕获来自后代组件的错误：

```html
<script setup>
  import { onErrorCaptured } from 'vue'

  onErrorCaptured((err, instance, info) => {
    console.error('捕获到子组件错误：', err)
    console.log('错误信息：', info)
    // 返回 false 可以阻止错误继续向上传播
    return false
  })
</script>
```

在实际开发中，各生命周期钩子的典型使用场景如下：`created/setup` 中适合进行 API 数据请求、初始化数据；`mounted/onMounted` 中适合进行 DOM 操作、初始化第三方库、添加事件监听；`beforeUnmount/onBeforeUnmount` 中适合进行清理工作——移除事件监听、取消定时器、断开 WebSocket 连接等。`updated/onUpdated` 在实际开发中使用较少，通常可以用 `watch` 或 `watchEffect` 来代替。

## 5. 💻 demos.1 - 生命周期钩子：Vue 3 的组合式 API

在 Vue 3 的组合式 API 中，生命周期钩子以函数的形式使用，需要从 vue 中导入。

组合式 API 并没有提供对应 `beforeCreate` 和 `created` 的注册函数，因为 `setup()` 会在所有选项式 API 生命周期钩子之前执行，很多原本会放在 `beforeCreate` / `created` 阶段的初始化工作，通常都直接在 `setup()` 里完成。

### 5.1. 示例

::: code-group

<<< ./demos/1/App.vue

<<< ./demos/1/TestLifeCycle.vue

:::

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-09-21-03-08.png)

测试步骤说明：

1. 刷新页面，查看页面首次加载时 `TestLifeCycle.vue` 组件「挂载阶段」日志
2. 点击「+1」按钮 3 次，查看数据更新时 `TestLifeCycle.vue` 组件「更新阶段」日志
3. 点击「切换组件显示/隐藏」按钮，查看 `TestLifeCycle.vue` 组件「卸载阶段」日志
4. 再次点击「切换组件显示/隐藏」按钮，查看组件重新挂载后的「挂载阶段」日志
5. 点击「+1」按钮 3 次，查看组件重新挂载后的「更新阶段」日志

最终各个步骤输出的日志：

::: code-group

```[1]
[setup          ] | countDOMText: null       | count:  0 | 组件实例正在创建
[onBeforeMount  ] | countDOMText: null       | count:  0 | 即将挂载
[onMounted      ] | countDOMText: count: 0   | count:  0 | 已挂载
```

```[2]
[onBeforeUpdate ] | countDOMText: count: 0   | count:  1 | 即将更新
[onUpdated      ] | countDOMText: count: 1   | count:  1 | 已更新
[onBeforeUpdate ] | countDOMText: count: 1   | count:  2 | 即将更新
[onUpdated      ] | countDOMText: count: 2   | count:  2 | 已更新
[onBeforeUpdate ] | countDOMText: count: 2   | count:  3 | 即将更新
[onUpdated      ] | countDOMText: count: 3   | count:  3 | 已更新
```

```[3]
[onBeforeUnmount] | countDOMText: count: 3   | count:  3 | 即将卸载
[onUnmounted    ] | countDOMText: null       | count:  3 | 已卸载
```

```[4]
[setup          ] | countDOMText: null       | count:  0 | 组件实例正在创建
[onBeforeMount  ] | countDOMText: null       | count:  0 | 即将挂载
[onMounted      ] | countDOMText: count: 0   | count:  0 | 已挂载
```

```[5]
[onBeforeUpdate ] | countDOMText: count: 0   | count:  1 | 即将更新
[onUpdated      ] | countDOMText: count: 1   | count:  1 | 已更新
[onBeforeUpdate ] | countDOMText: count: 1   | count:  2 | 即将更新
[onUpdated      ] | countDOMText: count: 2   | count:  2 | 已更新
[onBeforeUpdate ] | countDOMText: count: 2   | count:  3 | 即将更新
[onUpdated      ] | countDOMText: count: 3   | count:  3 | 已更新
```

:::

下面是对各个步骤输出内容的解读：

1. 页面首次加载时
   - `setup` 最先执行，输出「组件实例正在创建」，此时 `countDOMText` 是 `null`，因为 DOM 还没有被挂载。
   - 随后 `onBeforeMount` 输出「即将挂载」，此时 `countDOMText` 仍然是 `null`。
   - 最后 `onMounted` 输出「已挂载」，此时 `countDOMText` 显示为 `count: 0`，说明 DOM 已经被正确渲染。
2. 点击「+1」按钮 3 次
   - 每次都会先触发 `onBeforeUpdate` 输出「即将更新」，此时 `countDOMText` 显示为更新前的值，虽然 `count` 已经是最新的了，但 DOM 还没有更新。
   - 随后触发 `onUpdated` 输出「已更新」，此时 `countDOMText` 显示为更新后的值，说明 DOM 已经完成更新。
3. 点击「切换组件显示/隐藏」按钮
   - 触发 `onBeforeUnmount` 输出「即将卸载」，此时 `countDOMText` 仍然显示为 `count: 3`，说明组件实例还没有被销毁。
   - 随后触发 `onUnmounted` 输出「已卸载」，此时 `countDOMText` 变为 `null`，说明组件实例已经被销毁，相关的 DOM 也被移除了，但 `count` 的值仍然是 3，因为它是组件实例的响应式数据，虽然实例被销毁了，但这个变量还在内存里，直到垃圾回收机制回收它。
4. 再次点击「切换组件显示/隐藏」按钮
   - 组件重新挂载，触发 `setup`、`onBeforeMount`、`onMounted`，输出与首次加载时相同，说明组件实例被重新创建并挂载。
   - 需要注意的是，重新挂载后 `count` 的值又回到了初始值 0，因为这是一个全新的组件实例。
5. 点击「+1」按钮 3 次
   - 触发 `onBeforeUpdate` 和 `onUpdated`，输出与之前相同，此时 `count` 是新实例的响应式数据，和之前的实例完全独立，因此会重新从 0 开始计数。

### 5.2. 注意事项

组合式 API 的生命周期钩子必须在组件初始化阶段同步注册。Vue 在执行 `setup()` 时，会把“当前正在初始化的组件实例”作为活跃上下文，`onMounted()` 这类调用会把回调注册到这个上下文上；一旦你把注册动作放进异步回调里，这个上下文就丢失了。

下面这种写法就是错误示例：

```html
<script setup>
  import { onMounted } from 'vue'

  setTimeout(() => {
    onMounted(() => {
      console.log('这段注册不会按预期工作')
    })
  }, 100)
</script>
```

不过，这并不意味着 `onMounted()` 只能直接写在 `setup()` 或 `<script setup>` 的顶层。只要调用栈是同步的，且最终起源自 `setup()`，就可以把这段逻辑抽到外部函数里，这也是很多组合式函数（composable）能正常工作的原因。

::: code-group

```js [useLogger.js]
import { onMounted } from 'vue'

export function useLogger(name) {
  onMounted(() => {
    console.log(`${name} 已挂载`)
  })
}
```

```html [MyComponent.vue]
<script setup>
  import { useLogger } from './useLogger'

  useLogger('MyComponent')
</script>
```

:::

只要 `useLogger()` 是在 `setup()` 的同步调用链里执行的，里面的 `onMounted()` 就能被正常注册。

## 6. 🔗 引用

- [Vue 官方文档 - 生命周期钩子][3]
- [Vue 官方文档 - 组合式 API：生命周期钩子][1]
- [Vue 官方文档 - 选项式 API：生命周期钩子][2]

[1]: https://cn.vuejs.org/api/composition-api-lifecycle
[2]: https://cn.vuejs.org/api/options-lifecycle
[3]: https://cn.vuejs.org/guide/essentials/lifecycle.html
