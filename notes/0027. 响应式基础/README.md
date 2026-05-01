# [0027. 响应式基础](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0027.%20%E5%93%8D%E5%BA%94%E5%BC%8F%E5%9F%BA%E7%A1%80)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是响应式数据？](#3--什么是响应式数据)
- [4. 🤔 为什么代码示例都用 `<script setup>`？](#4--为什么代码示例都用-script-setup)
- [5. 🤔 ref 和 reactive 如何选择？](#5--ref-和-reactive-如何选择)
  - [5.1. reactive 的局限性](#51-reactive-的局限性)
  - [5.2. 为什么 ref 更值得优先使用](#52-为什么-ref-更值得优先使用)
  - [5.3. reactive 还有用武之地吗？](#53-reactive-还有用武之地吗)
  - [5.4. 为什么不用 reactive 还要介绍它呢？](#54-为什么不用-reactive-还要介绍它呢)
- [6. 🤔 Vue 2 的 Object.defineProperty 是如何实现响应式的？](#6--vue-2-的-objectdefineproperty-是如何实现响应式的)
- [7. 🤔 Vue 3 的 Proxy 是如何实现响应式的？](#7--vue-3-的-proxy-是如何实现响应式的)
- [8. 🤔 响应式系统有哪些局限性和注意事项？](#8--响应式系统有哪些局限性和注意事项)
  - [8.1. 响应式底层 API 的差异](#81-响应式底层-api-的差异)
  - [8.2. reactive 的整体替换问题](#82-reactive-的整体替换问题)
  - [8.3. reactive 的解构问题](#83-reactive-的解构问题)
  - [8.4. ref 的 .value 问题](#84-ref-的-value-问题)
  - [8.5. DOM 的异步更新机制](#85-dom-的异步更新机制)
  - [8.6. shallowRef 和 shallowReactive 的使用场景](#86-shallowref-和-shallowreactive-的使用场景)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 什么是响应式数据（Vue 中最大的“魔法”）
- 什么是数据驱动式开发
- 响应式系统底层的几个核心逻辑点
- ref 类型数据在模板中的自动解包机制
- ref 和 reactive 的区别与选用策略
- Vue 2 的 Object.defineProperty 实现
- Vue 3 的 Proxy 实现
- `<script setup>` 语法
- 响应式系统的局限性与注意事项
  - ref 解包细节
  - DOM 的更新时机
  - 深层数据的响应式处理方案（shallowRef、shallowReactive）

## 2. 🫧 评价

本节是 Vue 学习的核心转折点，内容会比较多，核心目的是帮你从“手动操作 DOM”切换到“数据驱动视图”的思维模式。核心就 1 件事 => 「理解 Vue 的数据响应式机制」。

对于响应式的实现原理部分可以先混个脸熟，大致了解 `Proxy` 在背后做了什么（`Object.defineProperty` 的 Vue2 方案已过时，感兴趣可以自行查阅更多细节）即可，以后踩坑再做深入了解。

## 3. 🤔 什么是响应式数据？

响应式数据（Reactive Data）是 Vue.js 最核心的概念之一，也是 Vue 能够实现声明式渲染的基础。所谓响应式，是指当数据发生变化时，所有依赖该数据的地方（模板 `<template>`、计算属性 `computed`、侦听器 `watch` 等）都会自动更新，而不需要开发者手动触发 DOM 操作。这种自动化的数据到视图的同步机制，就是 Vue 响应式系统的核心价值。

在传统的前端开发中，当你需要更新页面上的某个内容时，必须手动获取到 DOM 元素，然后修改它的属性或内容：

```js
// 传统方式：手动操作 DOM
const el = document.getElementById('count')
let count = 0

function increment() {
  count++
  el.textContent = count // 必须手动更新 DOM
}
```

而在 Vue 中，你只需要定义一个响应式变量，在模板中引用它，之后每次修改这个变量的值，页面上的显示就会自动更新：

```html
<!-- Vue：响应式 -->
<template>
  <p>{{ count }}</p>
  <button @click="count++">+1</button>
</template>

<script setup>
  import { ref } from 'vue'
  const count = ref(0) // 响应式数据，修改后视图自动更新
</script>
```

::: tip Vue 中的“魔法”

通过上述示例对比，你可能会觉得传统方式更加直观，因为它直接操作 DOM，而 Vue 的响应式机制看起来像是“魔法”，数据修改后页面自动更新，没有任何显式的 DOM 操作。这种“魔法”背后其实是 Vue 响应式系统的强大设计，它通过底层的依赖追踪和更新机制，实现了数据与视图的自动同步，让开发者可以专注于业务逻辑，而不必担心 DOM 的细节操作。

如果只是对比上述这样的简单示例的话，不否认，确实直接写原生 JS 更好。但这示例本身就具备一定的欺骗性，在真实项目开发中，我们的项目规模和复杂度远远超过这个示例，手动管理 DOM 的方式会变得非常麻烦和容易出错，而 Vue 的响应式系统则能大大提升开发效率和代码的可维护性。

Vue 的响应式系统可谓是 Vue 中最大的“魔法”了，如果你之前接触的是传统的原生 JS（命令式）开发方式，那么首次接触 Vue 的这种数据驱动的响应式开发方式会觉得很困惑，甚至觉得它是“魔法”。但当你深入了解了 Vue 响应式系统的原理和实现后，你会发现它其实是非常合理和高效的设计，完全不是“魔法”，而是现代前端框架中非常成熟的一种技术方案，写起来也会感觉更加自然一些，不会再感觉那么“神秘”了。

:::

Vue 的响应式系统在底层做了三件核心的事情：

- 第一，追踪依赖（Track）。当组件渲染时，模板中使用到了哪些响应式数据，Vue 会自动记录下来。这个过程被称为“依赖收集”。例如，模板中有 <span v-pre>`{{ count }}`</span>，Vue 就知道这个组件的渲染依赖于 count 这个变量。
- 第二，拦截变更（Intercept）。Vue 会拦截对响应式数据的所有修改操作。当你修改一个 ref 的 `.value` 或修改一个 reactive 对象的属性时，Vue 的拦截机制会捕获到这次修改。
- 第三，触发更新（Trigger）。一旦检测到数据变更，Vue 会通知所有依赖该数据的地方重新计算或重新渲染。这个过程是异步批量的 => Vue 会将同一事件循环中的多次数据修改合并为一次更新，避免不必要的重复渲染。

Vue 3 提供了两个主要的 API 来创建响应式数据：ref 和 reactive。

ref 用于创建一个包装单一值的响应式引用。它可以包装任何类型的值，包括原始类型（字符串、数字、布尔值等）和引用类型（对象、数组等）。在 JavaScript 代码中通过 `.value` 访问和修改其值，在模板中则会自动解包，不需要写 `.value`：

```html
<template>
  <p>{{ message }}</p>
  <!-- 模板中自动解包 -->
  <p>{{ count }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const message = ref('Hello') // 字符串
  const count = ref(0) // 数字
  const isVisible = ref(true) // 布尔值
  const items = ref([1, 2, 3]) // 数组
  const user = ref({ name: '张三' }) // 对象

  // 在 JS 中通过 .value 访问
  console.log(message.value) // 'Hello'
  message.value = 'World' // 修改值
  items.value.push(4) // 修改数组
  user.value.name = '李四' // 修改对象属性
</script>
```

reactive 用于创建一个响应式的对象或数组。与 ref 不同，reactive 只能用于对象类型（对象、数组、Map、Set），不能用于原始类型。访问 reactive 对象的属性时不需要 `.value`：

```html
<script setup>
  import { reactive } from 'vue'

  const state = reactive({
    count: 0,
    user: {
      name: '张三',
      age: 25,
    },
    items: ['苹果', '香蕉'],
  })

  // 直接访问和修改，不需要 .value
  state.count++
  state.user.name = '李四'
  state.items.push('橙子')
</script>
```

两者的选择通常遵循这样的原则：

- 对于原始类型的响应式值（number、string、boolean），无脑选 ref 即可，因为 reactive 不支持原始类型。
- 对于对象类型的数据，虽然 reactive 看起来也能用，但鉴于下文将介绍的 reactive 的各种局限性（无法整体替换、解构丢失响应性等），仍推荐使用 ref 统一管理所有状态。

## 4. 🤔 为什么代码示例都用 `<script setup>`？

上述示例中都使用了 `<script setup>` 语法。这是 Vue 3 单文件组件（SFC）中推荐使用的组合式 API 写法。在 `<script setup>` 中声明的顶层变量、函数和导入，可以直接在模板中使用，无需 `setup()` 函数手动返回。你可以理解为模板和 `<script setup>` 处在同一个作用域中。

如果你没有使用单文件组件，也可以通过 `setup()` 选项来使用组合式 API，但需要手动将变量和函数通过 `return` 暴露给模板。

## 5. 🤔 ref 和 reactive 如何选择？

先说结论：优先使用 ref，这是 Vue 官方现在明确推荐的策略。

::: details 来看看官方原话是咋说的 => `reactive()` 的局限性

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-29-08-08-32.png)

:::

ref 和 reactive 都能创建响应式数据，但 reactive 存在几个比较严重的“硬伤”，这些局限性直接决定了 ref 才是更通用、更安全的选择。

### 5.1. reactive 的局限性

有限的值类型 reactive 只能用于对象类型（对象、数组、`Map`、`Set` 等集合类型）。如果你尝试将一个原始类型（`string`、`number`、`boolean`）传入 reactive，不但不会正常工作，开发环境下还会直接报出警告。

```js
import { reactive } from 'vue'

// ❌ 错误用法
const count = reactive(0) // 警告：value cannot be made reactive: 0
```

这意味着一旦你需要管理一个数字、字符串或布尔值的响应式状态，你就必须使用 ref。在一个项目中同时混用两套 API 来区分“原始类型状态”和“对象类型状态”只会增加心智负担，直接全部使用 ref 反而是最一致的方案。

不能整体替换对象 Vue 的响应式跟踪依赖于对同一个代理对象的属性访问。当你用 reactive 创建一个响应式对象后，如果再直接给它赋一个新的对象，实际上是把变量指向了一个全新的代理（或普通对象），原先的响应式连接就彻底丢失了。

::: code-group

```js [reactive]
let state = reactive({ count: 0 })

// ❌ 错误：直接替换引用，响应性丢失
state = reactive({ count: 1 })
// 此时模板或 watch 等依赖原来 state 的代码都不会再更新

// 要“替换”整个对象，你只能小心翼翼地用 Object.assign 或逐属性赋值：
Object.assign(state, { count: 1, name: '新对象' })
// 这是一种正确但麻烦的解法
```

```js [ref]
const state = ref({ count: 0 })

// ✅ 可以直接整体替换
state.value = { count: 1, name: '新对象' }
// 响应性完好，不会受到影响
// ref 天生就是通过 .value 来持有数据的
// 替换整个对象就是一个简单的赋值操作，完全符合直觉
// 这在处理接口返回的完整数据替换、表单重置等场景时，优势非常明显
```

:::

解构操作会丢失响应性这是 reactive 在实际开发中最大的“坑”之一。当你试图从 reactive 对象中解构出某个属性，得到的是一个普通的值，与原始响应式对象之间的连接会立即断开：

```js
const state = reactive({ count: 0 })

// 解构后，count 只是一个独立的数字，不再是响应式的
let { count } = state
count++ // 不会影响 state.count，视图也不会更新
```

同样，当你将 reactive 对象的某个属性直接传递给一个函数时，函数收到的也是一个普通值，无法被追踪：

```js
function useCount(val) {
  // val 只是普通数字，无法响应式变化
}

useCount(state.count) // 丢失响应性
```

虽然 Vue 提供了 `toRefs()` 来“安全”解构：

```js
const { count } = toRefs(state)
// 现在 count 是一个 ref，与 state.count 保持同步
count.value++
```

但这又回到了需要 `.value` 的模式，而且多了一层 API 的使用成本。相比之下，如果从一开始就用 ref 来组织状态，每个状态天然就是独立的 ref，既可以单独传递、单独解构，又始终保持响应性。

---

### 5.2. 为什么 ref 更值得优先使用

- 统一心智模型：无论原始类型还是对象，创建方式完全一样，访问和修改都通过 `.value`（模板中自动解包，免去 `.value`）。
- 整体替换自然：ref 的响应性建立在 `.value` 这一层引用上，替换整个对象就是替换 `.value`，完全符合 JS 的赋值习惯。
- 传递与解构安全：每个 ref 本身就是独立的响应式容器，将它赋给其他变量、作为参数传递、甚至解构重组，都不会丢失响应性。
- 内部会复用 reactive：当你给 ref 传入一个对象时，它内部其实也是调用 reactive 来进行深层响应式处理。所以在性能上，ref 对对象的处理与直接使用 reactive 并无差别。
- 官方推荐：Vue 官方文档明确指出“由于这些限制，我们建议使用 `ref()` 作为声明响应式状态的主要 API”。

### 5.3. reactive 还有用武之地吗？

答：几乎没有，你就当它不存在就完事儿了。

虽然在一些场景下，reactive 依然能带来少许便利，例如用来定义整个表单状态：

```js
const form = reactive({
  username: '',
  password: '',
  remember: false,
})
// 模板中直接 form.username，不用 .value
```

但这种便利性是以“无法整体替换对象”和“解构需使用 `toRefs`”为代价的。随着项目状态复杂度上升，这点模板访问上的方便，往往不如 ref 带来的整体一致性重要。因此，reactive 可以保留作为一种有特定适用场景的补充手段，但在新代码中默认使用 ref 永远是最稳的选择。

简单记住一句话：能用 ref 的地方就用 ref，项目里几乎没什么场景是必须上 reactive 的。 当你彻底放弃 reactive，只用 ref 来管理所有响应式状态时，你会发现代码一致性变高了，因为“数据替换”、“解构传递”这些坑都不会再出现了。

### 5.4. 为什么不用 reactive 还要介绍它呢？

因为它是 Vue 3 响应式系统的一个重要组成部分，虽然不推荐使用，但了解它的设计初衷和局限性有助于更深入地理解 Vue 的响应式原理。同时，在一些遗留项目或特定场景下，你可能会遇到 reactive 的使用，了解它的行为和限制可以帮助你更好地维护和改进这些代码。除此之外，有些第三方教程中并没有明确推荐 ref，反而大量使用 reactive，这时候了解 reactive 的局限性就非常重要了，算是一份“防坑指南”了。

## 6. 🤔 Vue 2 的 Object.defineProperty 是如何实现响应式的？

::: tip 概述

在这一部分，主要会通过一些简单的伪代码片段来介绍 Vue 2 响应式系统的核心实现原理。

Vue 2 的响应式系统基于 ES5 的 Object.defineProperty API 实现，通过定义 getter 和 setter 来拦截对数据属性的访问和修改，从而实现依赖追踪和更新通知。

:::

Vue 2 的响应式系统基于 ES5 的 Object.defineProperty API 实现。这个 API 可以精确地定义或修改对象属性的行为，包括拦截属性的读取（get）和设置（set）操作。Vue 2 正是利用这一特性，在数据被读取时收集依赖，在数据被修改时通知更新。

Object.defineProperty 的基本用法如下。通过定义 getter 和 setter，可以拦截对属性的访问和修改：

```js
const data = {}
let internalValue = '初始值'

Object.defineProperty(data, 'message', {
  get() {
    console.log('message 被读取了')
    return internalValue
  },
  set(newValue) {
    console.log(`message 被修改为：${newValue}`)
    internalValue = newValue
  },
})

data.message // 输出：message 被读取了
data.message = '新值' // 输出：message 被修改为：新值
```

Vue 2 在初始化组件时，会遍历 data 返回的对象的所有属性，对每个属性使用 Object.defineProperty 进行拦截。以下是 Vue 2 响应式系统的简化实现原理：

```js
// 简化版的依赖管理类
class Dep {
  constructor() {
    this.subscribers = new Set()
  }
  depend() {
    if (Dep.activeWatcher) {
      this.subscribers.add(Dep.activeWatcher)
    }
  }
  notify() {
    this.subscribers.forEach((watcher) => watcher.update())
  }
}
Dep.activeWatcher = null

// 简化版的 Watcher（观察者/侦听者）
class Watcher {
  constructor(getter, callback) {
    this.getter = getter
    this.callback = callback
    this.value = this.get()
  }
  get() {
    Dep.activeWatcher = this
    const value = this.getter()
    Dep.activeWatcher = null
    return value
  }
  update() {
    const oldValue = this.value
    this.value = this.get()
    this.callback(this.value, oldValue)
  }
}

// 将普通对象转为响应式对象
function defineReactive(obj, key) {
  const dep = new Dep()
  let value = obj[key]

  // 如果值是对象，递归处理
  if (typeof value === 'object' && value !== null) {
    observe(value)
  }

  Object.defineProperty(obj, key, {
    get() {
      dep.depend() // 收集依赖
      return value
    },
    set(newValue) {
      if (newValue === value) return
      value = newValue
      if (typeof newValue === 'object' && newValue !== null) {
        observe(newValue)
      }
      dep.notify() // 通知更新
    },
  })
}

function observe(obj) {
  Object.keys(obj).forEach((key) => {
    defineReactive(obj, key)
  })
}
```

这段代码展示了 Vue 2 响应式系统的三个核心角色：

Observer（观察者）负责将普通对象转为响应式对象。它递归遍历对象的所有属性，使用 Object.defineProperty 为每个属性添加 getter 和 setter。

Dep（依赖管理器）是 getter 和 setter 之间的桥梁。每个被拦截的属性都有自己的 Dep 实例。当属性被读取时（getter），Dep 将当前活跃的 Watcher 记录为依赖者；当属性被修改时（setter），Dep 通知所有依赖者进行更新。

Watcher（观察者/侦听者）代表一个被观察的表达式或函数。组件的渲染函数、计算属性、用户定义的 watch 回调都是通过 Watcher 来实现的。当 Watcher 所依赖的数据发生变化时，Watcher 的 update 方法会被调用，触发重新计算或重新渲染。

对于数组的处理，Vue 2 采用了一种特殊的策略，重写数组的变异方法。因为 Object.defineProperty 无法拦截数组索引的直接赋值和 length 的变化，Vue 2 通过修改数组的原型，拦截了 push、pop、shift、unshift、splice、sort、reverse 这七个会修改原数组的方法：

```js
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
]

methodsToPatch.forEach((method) => {
  const original = arrayProto[method]
  Object.defineProperty(arrayMethods, method, {
    value: function mutator(...args) {
      const result = original.apply(this, args)
      const ob = this.__ob__
      let inserted
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args
          break
        case 'splice':
          inserted = args.slice(2)
          break
      }
      if (inserted) ob.observeArray(inserted) // 对新增元素做响应式处理
      // ob 是 Observer 实例，其 dep 用于数组变更通知
      ob.dep.notify() // 通知更新
      return result
    },
  })
})
```

## 7. 🤔 Vue 3 的 Proxy 是如何实现响应式的？

Vue 3 使用 ES6 的 Proxy API 重写了响应式系统，这是 Vue 3 最重要的底层架构变化之一。Proxy 可以拦截对象的几乎所有操作，包括属性读取、属性设置、属性删除、in 操作符、for...in 遍历等，从根本上解决了 Vue 2 中 Object.defineProperty 的各种局限性。

Proxy 的基本用法如下。通过创建一个 Proxy 实例，可以定义一个 handler 对象来拦截对目标对象的各种操作：

```js
const target = { name: '张三', age: 25 }

const handler = {
  get(target, key, receiver) {
    console.log(`读取 ${key}`)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    console.log(`设置 ${key} = ${value}`)
    return Reflect.set(target, key, value, receiver)
  },
  deleteProperty(target, key) {
    console.log(`删除 ${key}`)
    return Reflect.deleteProperty(target, key)
  },
  has(target, key) {
    console.log(`检查 ${key} 是否存在`)
    return Reflect.has(target, key)
  },
}

const proxy = new Proxy(target, handler)
proxy.name // 输出：读取 name
proxy.age = 30 // 输出：设置 age = 30
delete proxy.age // 输出：删除 age
'name' in proxy // 输出：检查 name 是否存在
```

Vue 3 的 reactive 函数就是基于 Proxy 实现的。以下是简化版的实现原理：

```js
// 全局的依赖追踪
let activeEffect = null
const targetMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  dep.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach((effect) => effect())
  }
}

// 简化版的 reactive
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      track(target, key) // 依赖收集
      // 如果值是对象，递归创建代理（惰性转换）
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }
      return result
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (oldValue !== value) {
        trigger(target, key) // 触发更新
      }
      return result
    },
    deleteProperty(target, key) {
      const hadKey = key in target
      const result = Reflect.deleteProperty(target, key)
      if (hadKey && result) {
        trigger(target, key) // 删除属性也会触发更新
      }
      return result
    },
  })
}

// 简化版的 effect（watchEffect 的底层实现）
function effect(fn) {
  activeEffect = fn
  fn() // 首次执行，触发 get，收集依赖
  activeEffect = null
}
```

这段代码展示了 Vue 3 响应式系统的核心机制：

当读取 reactive 对象的属性时（get trap），会调用 track 函数进行依赖收集，将当前的 activeEffect 记录到该属性的依赖集合中。

当修改 reactive 对象的属性时（set trap），会调用 trigger 函数通知更新，执行该属性所有依赖的 effect 函数。

当删除 reactive 对象的属性时（deleteProperty trap），同样会触发更新。

Vue 3 的 reactive 还使用了一个重要的设计 => 惰性代理（Lazy Proxy）。Vue 2 在初始化时会递归遍历整个数据对象，对所有属性进行响应式处理。Vue 3 的 reactive 则采用惰性策略：只有在实际访问到嵌套对象时，才会为其创建 Proxy。这种按需创建的方式在初始化大型对象时有显著的性能优势。

::: tip 注意

ref 不是惰性的与 reactive 不同，ref 在创建时就会对传入的对象值立即调用 reactive 进行深层响应式处理，而不是等到访问时才处理。因此"惰性代理"这个特点仅适用于 reactive，不适用于 ref。

:::

ref 的实现本质上是一个包含 value 属性的对象，通过类的 getter 和 setter 来拦截对 value 的读写。需要注意的是，当传入对象时，ref 内部会调用 reactive 进行深层响应式处理：

```js
// 简化版 ref 实现（含对对象类型的深层响应式处理）
function ref(rawValue) {
  // 如果传入的是对象，先用 reactive 进行深层响应式处理
  let reactiveValue =
    typeof rawValue === 'object' && rawValue !== null
      ? reactive(rawValue)
      : rawValue

  return {
    get value() {
      track(this, 'value')
      return reactiveValue
    },
    set value(newValue) {
      if (newValue !== reactiveValue) {
        // 新值如果是对象，也需要转换为响应式
        reactiveValue =
          typeof newValue === 'object' && newValue !== null
            ? reactive(newValue)
            : newValue
        // rawValue 在此仅用于后续对新旧值的比较（Vue 实际实现中还有更多用途）
        rawValue = newValue
        trigger(this, 'value')
      }
    },
  }
}
```

::: tip 为什么 ref 简化实现要包含 reactive 调用？

如果没有对对象的深层处理，`ref({ count: 0 })` 时，修改 `.value.count` 就不会被追踪，这完全背离了 Vue 3 ref 的真实行为。ref 对于对象类型的值，内部就是调用 reactive 进行深层响应式处理的，和直接使用 reactive 在响应式深度上没有区别。

:::

Vue 3 使用 Reflect 配合 Proxy 来执行原始操作，而不是直接操作目标对象。Reflect 的方法与 Proxy 的 trap 一一对应，它确保了在正确的 receiver（通常是 Proxy 本身）上执行操作，保证了 this 指向的正确性，特别是在处理继承和 getter/setter 链时尤为重要。

## 8. 🤔 响应式系统有哪些局限性和注意事项？

::: tip 概述

这一部分主要介绍一些在开发时经常会遇到的一些关于 Vue 响应式系统的局限性问题和注意事项。其中有些问题，在前面记录的笔记中也提到了，比如 reactive 的一些局限性问题。

:::

### 8.1. 响应式底层 API 的差异

尽管 Vue 3 的 Proxy 响应式系统已经比 Vue 2 的 Object.defineProperty 方案有了质的飞跃，但在实际使用中仍然存在一些需要注意的局限性和潜在的陷阱。了解这些注意事项可以帮助你避免常见的 bug 和性能问题。

Vue 2 的 Object.defineProperty 方案存在以下经典限制（Vue 3 已解决）：

无法检测对象属性的动态添加和删除。在 Vue 2 中，如果你在 data 初始化之后给对象添加新属性，这个新属性不会是响应式的：

```js
// Vue 2 的限制
export default {
  data() {
    return {
      user: { name: '张三' },
    }
  },
  methods: {
    addAge() {
      this.user.age = 25 // 不会触发更新
      // 必须使用 Vue.set 或 this.$set
      this.$set(this.user, 'age', 25) // 正确方式
    },
  },
}
```

无法通过索引直接设置数组元素或修改数组长度：

```js
// Vue 2 的限制
this.items[0] = '新值' // 不会触发更新
this.items.length = 0 // 不会触发更新

// 正确方式
this.$set(this.items, 0, '新值')
this.items.splice(0)
```

Vue 3 使用 Proxy 后，上述限制都已经不存在了。但 Vue 3 的响应式系统仍然有一些需要注意的地方：

### 8.2. reactive 的整体替换问题

reactive 返回的是目标对象的 Proxy，如果你直接替换整个对象的引用，会导致响应式连接丢失：

```html
<script setup>
  import { reactive } from 'vue'

  let state = reactive({ count: 0 })

  // 错误：直接替换引用，响应式丢失
  state = reactive({ count: 1 })

  // 正确：逐个属性赋值
  state.count = 1

  // 或者使用 Object.assign
  Object.assign(state, { count: 1 })
</script>
```

### 8.3. reactive 的解构问题

对 reactive 对象进行解构赋值时，提取出来的局部变量会失去响应式连接：

```html
<script setup>
  import { reactive, toRefs } from 'vue'

  const state = reactive({ count: 0, name: '张三' })

  // 错误：解构后失去响应式
  let { count, name } = state
  count++ // 不会触发更新

  // 正确：使用 toRefs 保持响应式
  const { count: countRef, name: nameRef } = toRefs(state)
  countRef.value++ // 会触发更新
</script>
```

### 8.4. ref 的 .value 问题

ref 在 JavaScript 中需要通过 .value 访问，但在模板中会自动解包。这种不一致在初学时容易造成困惑：

```html
<script setup>
  import { ref } from 'vue'

  const count = ref(0)

  // 在 JS 中必须使用 .value
  console.log(count.value)
  count.value++

  // 常见错误：忘记写 .value
  count++ // 错误！这是在操作 ref 对象本身，而非其值

  function increment() {
    count.value++ // 正确
  }
</script>

<template>
  <!-- 在模板中自动解包，不需要 .value -->
  <p>{{ count }}</p>
  <button @click="count++">+1</button>
</template>
```

ref 在 reactive 对象中会自动解包，这是一个便利特性，但也可能造成困惑：

```html
<script setup>
  import { ref, reactive } from 'vue'

  const count = ref(0)
  const state = reactive({ count })

  // ref 在 reactive 中自动解包
  state.count++ // 直接操作，不需要 .value
  console.log(count.value) // 1，两者是同步的

  // 但在数组和 Map 中不会自动解包
  const list = reactive([ref(0)])
  console.log(list[0].value) // 需要 .value
  // 注意：在模板中，通过数组索引访问 ref 元素也不会自动解包
  // <p>{{ list[0] }}</p> 输出的是 Ref 对象，而非数字
</script>
```

模板中 ref 解包的注意事项：虽然 ref 在模板中会自动解包，但这一行为只对顶级 ref 属性生效。如果一个 ref 嵌套在非响应式的普通对象中（而不是 reactive 对象），在模板中作为非顶级属性访问时不会被解包：

```html
<script setup>
  import { ref } from 'vue'

  const count = ref(0)
  const object = { id: ref(1) } // id 是 ref，但 object 不是响应式对象
</script>

<template>
  <!-- ✅ count 是顶级 ref，自动解包 -->
  <p>{{ count + 1 }}</p>
  <!-- ❌ object.id 不是顶级 ref，不会自动解包 -->
  <p>{{ object.id + 1 }}</p>
  <!-- 输出：[object Object]1，因为 object.id 仍是 ref 对象 -->

  <!-- ✅ 文本插值作为最终计算值时例外 -->
  <p>{{ object.id }}</p>
  <!-- 输出：1，文本插值 {{ }} 会特殊处理，等价于 {{ object.id.value }} -->
</template>
```

解决方法是将 ref 解构为顶级变量，或者确保使用 reactive 包裹包含 ref 的对象。

### 8.5. DOM 的异步更新机制

Vue 的 DOM 更新不是同步的，而是异步批量执行的。当你修改了响应式数据后，DOM 不会立即更新，而是会在下一个微任务（microtask）中批量更新。如果你需要在 DOM 更新后执行操作，需要使用 nextTick：

```html
<template>
  <p id="count">{{ count }}</p>
  <!-- 注意：模板中必须有对应的 id 属性才能通过 getElementById 获取 -->
</template>

<script setup>
  import { ref, nextTick } from 'vue'

  const count = ref(0)

  async function increment() {
    count.value++
    // 此时 DOM 还没有更新
    console.log(document.getElementById('count').textContent) // 旧值

    await nextTick()
    // 此时 DOM 已更新
    console.log(document.getElementById('count').textContent) // 新值
  }
</template>
```

### 8.6. shallowRef 和 shallowReactive 的使用场景

对于大型嵌套对象或不需要深层响应式的场景，可以使用浅层 API 来提升性能：

```html
<script setup>
  import { shallowRef, shallowReactive, triggerRef } from 'vue'

  // shallowRef 只有 .value 的变化是响应式的
  const largeObject = shallowRef({ nested: { count: 0 } })
  largeObject.value.nested.count++ // 不会触发更新
  largeObject.value = { nested: { count: 1 } } // 会触发更新

  // 如果需要强制触发更新
  largeObject.value.nested.count = 2
  triggerRef(largeObject) // 手动触发

  // shallowReactive 只有第一层属性是响应式的
  const state = shallowReactive({
    count: 0,
    nested: { value: 1 },
  })
  state.count++ // 会触发更新
  state.nested.value++ // 不会触发更新
</script>
```

响应式数据的类型限制。Proxy 不能代理原始类型（string、number、boolean 等），这也是为什么 ref 需要将原始值包装在一个对象中的原因。此外，reactive 对 Date、RegExp、DOM 元素等特殊对象类型不会进行代理，直接返回原值（通过类型判断后跳过代理）。在需要处理这些类型时，应该使用 ref 或 shallowRef 来包装。

性能方面的建议：避免将大型且不需要响应式的数据放入响应式系统中（如固定的配置项、常量数组等），可以使用 markRaw 或 Object.freeze 来跳过响应式处理；合理使用 shallowRef 和 shallowReactive 来控制响应式的深度；对于非常大的列表数据，考虑使用虚拟滚动等优化方案。

## 9. 🔗 引用

- [Vue.js 官方文档 - 响应式基础][1]

[1]: https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html
