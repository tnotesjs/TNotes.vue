# [0110. 深入响应式系统](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0110.%20%E6%B7%B1%E5%85%A5%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是响应性，为什么它本质上是在管理依赖？](#3-什么是响应性为什么它本质上是在管理依赖)
- [4. Vue 的 `reactive()` 和 `ref()` 底层大致是怎么工作的？](#4-vue-的-reactive-和-ref-底层大致是怎么工作的)
- [5. 为什么会出现解构失去响应性、代理不相等这些现象？](#5-为什么会出现解构失去响应性代理不相等这些现象)
  - [5.1. 解构会切断追踪链路](#51-解构会切断追踪链路)
  - [5.2. 代理和原对象不相等](#52-代理和原对象不相等)
- [6. 运行时响应性、调试钩子和外部状态集成该怎么理解？](#6-运行时响应性调试钩子和外部状态集成该怎么理解)
  - [6.1. 运行时响应性 vs 编译时响应性](#61-运行时响应性-vs-编译时响应性)
  - [6.2. 调试钩子](#62-调试钩子)
  - [6.3. 与外部状态系统集成](#63-与外部状态系统集成)
- [7. Vue 的 ref 和“signal”是什么关系？](#7-vue-的-ref-和signal是什么关系)
- [8. 引用](#8-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 响应性定义
- track trigger
- reactive ref
- 响应性陷阱
- 调试钩子
- 外部集成
- signal 对比
- 设计取舍

## 2. 评价

这一节是理解 Vue 心智模型的关键。平时你只需要会用 `ref()`、`reactive()` 和 `computed()`，但如果你想真正看懂为什么某个值没有更新、为什么某次渲染被触发、为什么和外部状态库集成要用 `shallowRef()`，就必须回到这套底层模型。

## 3. 什么是响应性，为什么它本质上是在管理依赖？

官方用电子表格举例最直观：一个单元格依赖其他单元格时，只要依赖变化，结果就会自动更新。

在 JavaScript 里，普通变量默认不会这样：

```js
let A0 = 1
let A1 = 2
let A2 = A0 + A1

A0 = 2
console.log(A2) // 仍然是 3
```

如果想让 `A2` 自动更新，核心就要建立三件事：

- 哪段逻辑会产生副作用，也就是 effect
- 这段逻辑依赖了哪些数据，也就是 dependencies
- 当依赖变化时，如何重新触发这个 effect

所以从本质上说，响应性就是一套“追踪依赖并在变化时重跑副作用”的机制。

## 4. Vue 的 `reactive()` 和 `ref()` 底层大致是怎么工作的？

Vue 3 的 `reactive()` 主要依赖 `Proxy`，而 `ref()` 则通过 getter / setter 形式拦截对 `.value` 的访问。

官方给出的简化伪代码如下：

```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      trigger(target, key)
    },
  })
}
```

```js
function ref(value) {
  const refObject = {
    get value() {
      track(refObject, 'value')
      return value
    },
    set value(newValue) {
      value = newValue
      trigger(refObject, 'value')
    },
  }

  return refObject
}
```

其中的关键就是：

- 读取时 `track()` 记录依赖
- 修改时 `trigger()` 通知订阅者重跑

当一个 effect 运行时，Vue 会把它设置为当前活跃 effect。之后在读取响应式值时，就能把这个 effect 收集进订阅集合。官方还特别指出，这些订阅关系会被存进一个类似 `WeakMap<target, Map<key, Set<effect>>>` 的结构里。

## 5. 为什么会出现解构失去响应性、代理不相等这些现象？

这类现象都能从底层实现推导出来。

### 5.1. 解构会切断追踪链路

当你把响应式对象的属性解构到本地变量时，后续访问这个本地变量，不再经过原始代理对象的 getter / setter，自然也就不会再触发依赖追踪或更新。

要注意，这种“失去响应性”只发生在变量绑定层。如果解构出来的是一个对象，继续修改它内部属性仍可能是响应式的。

### 5.2. 代理和原对象不相等

`reactive()` 返回的是代理对象，不是原对象本身，所以用 `===` 比较时不会相等。这不是 bug，而是代理机制的自然结果。

## 6. 运行时响应性、调试钩子和外部状态集成该怎么理解？

### 6.1. 运行时响应性 vs 编译时响应性

Vue 的响应式系统主要是运行时实现的，也就是在浏览器执行时动态追踪和触发。

优点是：

- 不一定依赖构建步骤
- 语义更接近原生 JavaScript
- 边界情况更少

缺点是会受 JavaScript 语法限制。Vue 团队曾试验过“响应性语法糖 / Reactivity Transform”，但最终认为它不适合正式纳入项目。

### 6.2. 调试钩子

如果你想知道“是谁被追踪了”或者“是谁触发了这次更新”，官方给了几组调试入口。

组件级：

```html
<script setup>
  import { onRenderTracked, onRenderTriggered } from 'vue'

  onRenderTracked(() => {
    debugger
  })

  onRenderTriggered(() => {
    debugger
  })
</script>
```

计算属性和侦听器也支持 `onTrack` / `onTrigger`，但这些能力都只在开发模式下工作。

### 6.3. 与外部状态系统集成

当外部状态系统本身也有代理、不可变更新、状态机或流式事件时，Vue 深度响应式往往不是最合适的封装方式。官方建议的总思路是：把外部状态放进 `shallowRef()` 里，然后在外部状态整体变更时替换 `.value`。

比如和 Immer 集成：

```js
import { produce } from 'immer'
import { shallowRef } from 'vue'

export function useImmer(baseState) {
  const state = shallowRef(baseState)
  const update = (updater) => {
    state.value = produce(state.value, updater)
  }

  return [state, update]
}
```

官方还给出了 XState 和 RxJS 的集成思路。

## 7. Vue 的 ref 和“signal”是什么关系？

官方的态度很明确：很多框架所说的 signal，从本质上看和 Vue 的 `ref` 是同一种响应性基础类型。它们都是：

- 读取时追踪依赖
- 变更时触发副作用
- 作为值容器存在

差异主要在 API 风格和设计取舍。

比如 Solid 倾向读写分离，Angular 信号则让 getter 本身挂上 `set` / `update` 方法。Vue 也完全可以基于 `shallowRef()` 自己拼出类似 API。

官方真正想表达的是：

- Vue 并不被现有 API 风格锁死
- 不同 signal 设计之间更多是权衡，而不是谁“绝对更先进”

## 8. 引用

- [Vue.js 官方文档 - 深入响应式系统][1]
- [Vue.js 官方文档 - 响应式基础][2]
- [Immer][3]
- [XState][4]
- [RxJS][5]

[1]: https://cn.vuejs.org/guide/extras/reactivity-in-depth.html
[2]: https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html
[3]: https://immerjs.github.io/immer/
[4]: https://xstate.js.org/
[5]: https://rxjs.dev/
