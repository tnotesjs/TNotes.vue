# [0088. 组合式函数](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0088.%20%E7%BB%84%E5%90%88%E5%BC%8F%E5%87%BD%E6%95%B0)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是组合式函数？](#3--什么是组合式函数)
- [4. 🤔 为什么要把逻辑提取成组合式函数？](#4--为什么要把逻辑提取成组合式函数)
- [5. 🤔 组合式函数应该怎么接收参数？](#5--组合式函数应该怎么接收参数)
- [6. 🤔 为什么推荐返回多个 ref，而不是 reactive 对象？](#6--为什么推荐返回多个-ref而不是-reactive-对象)
- [7. 🤔 组合式函数里可以写副作用吗？](#7--组合式函数里可以写副作用吗)
- [8. 🤔 组合式函数只能在什么地方调用？](#8--组合式函数只能在什么地方调用)
- [9. 🤔 组合式函数和 mixin、无渲染组件有什么区别？](#9--组合式函数和-mixin无渲染组件有什么区别)
  - [9.1. 和 mixin 的区别](#91-和-mixin-的区别)
  - [9.2. 和无渲染组件的区别](#92-和无渲染组件的区别)
  - [9.3. 和 React Hooks 的区别](#93-和-react-hooks-的区别)
- [10. 🔗 引用](#10--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 概念定义
- 逻辑复用
- use 命名
- 响应式参数
- 返回 ref
- 副作用清理
- 调用限制
- 模式对比

## 2. 🫧 评价

这一节的高频内容是「怎么写、怎么用、怎么设计返回值」，你在业务开发里会频繁遇到。像和 mixin、无渲染组件的对比属于理解型知识点，先知道为什么官方更推荐组合式函数就够了。

## 3. 🤔 什么是组合式函数？

组合式函数（Composable）本质上就是「利用组合式 API 封装可复用逻辑的函数」。

你可以把它理解成组件内部逻辑的抽离版本。原来某段逻辑写在组件里，现在把它提取到一个普通函数里，并在函数内部继续使用 `ref`、`computed`、`watchEffect`、生命周期钩子等组合式 API，然后把需要暴露的状态和方法返回出去。

它和普通工具函数的关键区别在于：

- 普通工具函数更适合处理无状态逻辑，比如格式化日期、拼接字符串。
- 组合式函数更适合处理有状态逻辑，比如鼠标位置、请求状态、表单校验、滚动监听。

官方约定组合式函数使用驼峰命名，并以 `use` 开头，比如 `useMouse`、`useFetch`、`useForm`。这个命名一眼就能告诉你：这不是普通函数，而是一段可复用的响应式逻辑。

## 4. 🤔 为什么要把逻辑提取成组合式函数？

最直接的原因是「复用」和「整理结构」。

先看一个经典的鼠标跟踪例子。如果你直接把逻辑写在组件里，代码没有错，但一旦多个组件都要用，你就会开始复制粘贴。

::: code-group

```js [useMouse.js]
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  const update = (event) => {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```vue [App.vue]
<template>
  <p>鼠标位置：{{ x }}，{{ y }}</p>
</template>

<script setup>
import { useMouse } from './useMouse'

const { x, y } = useMouse()
</script>
```

:::

这样做有两个明显好处：

- 逻辑可以在多个组件里复用。
- 组件代码会更聚焦于「怎么渲染」，复杂逻辑则拆到独立文件中。

官方还特别强调了一点：抽取组合式函数不只是为了复用，也可以为了代码组织。一个大组件里如果同时处理搜索、分页、拖拽、请求、权限判断，读起来会很痛苦。把这些逻辑按主题拆成多个 `useXxx()` 之后，组件会清爽很多。

::: tip 每次调用都会得到独立状态

像 `useMouse()` 这样的组合式函数，每调用一次，都会创建一份新的 `x`、`y` 状态。也就是说，不同组件之间默认不会共享状态。

如果你想跨组件共享同一份状态，那已经不是单纯的逻辑复用问题了，更接近「状态管理」。

:::

## 5. 🤔 组合式函数应该怎么接收参数？

组合式函数的参数最好既支持普通值，也支持 `ref` 或 getter。这样调用方在不同场景下会更自由。

官方在 `useFetch()` 示例里重点说明了这一点。最开始你可能只会写成下面这样：

```js
import { ref } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  fetch(url)
    .then((response) => response.json())
    .then((json) => (data.value = json))
    .catch((err) => (error.value = err))

  return { data, error }
}
```

这能用，但它只能处理静态字符串。如果 `url` 会变化，你还得让它能够接收响应式输入。

```js
import { ref, toValue, watchEffect } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  watchEffect(() => {
    data.value = null
    error.value = null

    fetch(toValue(url))
      .then((response) => response.json())
      .then((json) => (data.value = json))
      .catch((err) => (error.value = err))
  })

  return { data, error }
}
```

这里有两个关键点：

- `toValue()` 可以把普通值、`ref`、getter 统一规整成最终值。
- 要在 `watchEffect()` 内部调用 `toValue(url)`，这样 getter 或 `ref` 里访问到的依赖才会被正确追踪。

调用时你就可以这样写：

```js
const postId = ref(1)
const { data } = useFetch(() => `/api/posts/${postId.value}`)
```

换句话说，组合式函数的参数设计不要只盯着「现在能不能跑」，还得考虑调用方以后会不会需要把响应式值传进来。

## 6. 🤔 为什么推荐返回多个 ref，而不是 reactive 对象？

官方推荐的约定是：组合式函数返回一个普通对象，对象里放多个 `ref`。

```js
const { x, y } = useMouse()
```

这样做的核心原因是「解构之后仍然保留响应性」。如果你返回的是一个 `reactive` 对象，调用方一旦直接解构，响应性连接就可能丢失。

```js
const state = reactive({ x: 0, y: 0 })
const { x, y } = state

// 此时 x、y 只是普通值，不再和原对象保持响应式联动
```

而 `ref` 不一样，它本身就是响应式容器：

```js
const { x, y } = useMouse()

console.log(x.value)
```

如果你更喜欢对象属性访问的写法，也可以在消费端再包一层：

```js
import { reactive } from 'vue'

const mouse = reactive(useMouse())
console.log(mouse.x)
```

简单来说，返回「普通对象 + 多个 ref」兼容性最高，也最符合组合式函数的解构使用方式。

## 7. 🤔 组合式函数里可以写副作用吗？

可以，而且很多组合式函数本来就是为了封装副作用。

比如：

- 监听 DOM 事件
- 发起异步请求
- 注册定时器
- 订阅外部数据源

但这里有两个规则必须记住：

1. 要在合适的生命周期里启动副作用。
2. 要在组件卸载时清理副作用。

还是以事件监听为例：

```js
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target, event, callback) {
  onMounted(() => target.addEventListener(event, callback))
  onUnmounted(() => target.removeEventListener(event, callback))
}
```

如果你漏掉清理逻辑，就可能造成内存泄漏，或者让已经销毁的组件还在响应旧事件。

对于 SSR，也要额外注意：依赖浏览器 DOM 的代码不能在服务端执行，所以这类逻辑应该放在 `onMounted()` 这类仅浏览器端触发的钩子里。

## 8. 🤔 组合式函数只能在什么地方调用？

组合式函数不是任何地方都能随便调。

官方给出的限制是：

- 只能在 `<script setup>` 中调用。
- 或者在组件的 `setup()` 中调用。
- 一般要求同步调用。

这样做不是 Vue 在故意限制你，而是因为组合式函数内部经常会注册生命周期、计算属性和侦听器。Vue 需要知道「当前正在为哪个组件实例注册这些东西」，否则这些绑定关系就立不住。

```vue
<script setup>
import { useMouse } from './useMouse'

const { x, y } = useMouse()
</script>
```

在选项式 API 中也能使用组合式函数，但要放在 `setup()` 里：

```js
import { useMouse } from './useMouse'

export default {
  setup() {
    const { x, y } = useMouse()
    return { x, y }
  },
}
```

有一个例外值得记一下：`<script setup>` 对异步场景支持更好。即便你在其中用了 `await`，编译器也会帮你恢复当前组件实例上下文，这一点比普通 `setup()` 更省心。

## 9. 🤔 组合式函数和 mixin、无渲染组件有什么区别？

这部分官方主要是在回答一个问题：为什么 Vue 3 更推荐组合式函数，而不是继续重度依赖老方案。

### 9.1. 和 mixin 的区别

mixin 在 Vue 2 时代很常见，但它有几个老问题：

- 数据和方法的来源不清晰。
- 多个 mixin 之间容易发生命名冲突。
- mixin 之间可能靠约定属性名隐式耦合。

组合式函数更像普通函数调用，依赖关系是显式的，返回什么、传入什么都写在代码上，读起来更可控。

### 9.2. 和无渲染组件的区别

无渲染组件可以通过插槽复用逻辑和部分渲染控制，但它会引入额外组件实例。

如果你只是想复用纯逻辑，组合式函数更轻量，因为它不会多创建组件层级。只有当你既想复用逻辑，又想复用渲染结构时，无渲染组件才更合适。

### 9.3. 和 React Hooks 的区别

组合式函数和 React Hooks 在「抽离逻辑」这件事上很像，但底层模型不一样。

Vue 的组合式函数是建立在细粒度响应式系统上的，不依赖每次组件重渲染都重新执行整套 Hook 逻辑。所以它们在依赖追踪方式、心智负担和性能特征上都和 React Hooks 不完全相同。

你可以把它理解成：两者解决的问题很像，但 Vue 走的是响应式驱动路线，不是调用顺序驱动路线。

## 10. 🔗 引用

- [Vue.js 官方文档 - 组合式函数][1]
- [Vue.js 官方文档 - 状态管理][2]
- [Vue.js 官方文档 - 测试组合式函数][3]

[1]: https://cn.vuejs.org/guide/reusability/composables.html
[2]: https://cn.vuejs.org/guide/scaling-up/state-management.html
[3]: https://cn.vuejs.org/guide/scaling-up/testing.html#testing-composables
