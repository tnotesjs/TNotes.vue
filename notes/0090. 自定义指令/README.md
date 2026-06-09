# [0090. 自定义指令](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0090.%20%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8C%87%E4%BB%A4)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么是自定义指令，什么时候才该用？](#3-什么是自定义指令什么时候才该用)
  - [3.1. 自定义指令（Custom Directives）](#31-自定义指令custom-directives)
  - [3.2. 使用时机](#32-使用时机)
- [4. 自定义指令要怎么注册和使用？](#4-自定义指令要怎么注册和使用)
  - [4.1. 在 `<script setup>` 中局部注册](#41-在-script-setup-中局部注册)
  - [4.2. 在组件选项中注册](#42-在组件选项中注册)
  - [4.3. 全局注册](#43-全局注册)
- [5. 指令对象有哪些生命周期钩子？每个钩子的参数分别都有哪些？](#5-指令对象有哪些生命周期钩子每个钩子的参数分别都有哪些)
  - [5.1. 钩子列表](#51-钩子列表)
  - [5.2. 钩子参数](#52-钩子参数)
- [6. 封装一个自定义指令的时候使用函数简写是什么意思？](#6-封装一个自定义指令的时候使用函数简写是什么意思)
- [7. 自定义指令在模板中被使用时，可以直接通过对象字面量的形式传递整个对象吗？](#7-自定义指令在模板中被使用时可以直接通过对象字面量的形式传递整个对象吗)
- [8. 为什么不推荐把自定义指令直接用在组件上？](#8-为什么不推荐把自定义指令直接用在组件上)
- [9. 自定义指令的生命周期钩子和组件的生命周期钩子之间有什么关系吗？它们是互相独立的吗？【深入源码】](#9-自定义指令的生命周期钩子和组件的生命周期钩子之间有什么关系吗它们是互相独立的吗深入源码)
  - [9.1. 核心源码](#91-核心源码)
  - [9.2. 本质区别](#92-本质区别)
  - [9.3. 调用时机的关系](#93-调用时机的关系)
  - [9.4. 小结](#94-小结)
- [10. demos.1 - 局部注册与基本用法](#10-demos1---局部注册与基本用法)
- [11. demos.2 - 函数简写](#11-demos2---函数简写)
- [12. demos.3 - 指令钩子与 binding 参数](#12-demos3---指令钩子与-binding-参数)
- [13. demos.4 - 对象字面量传值](#13-demos4---对象字面量传值)
- [14. demos.5 - 全局注册](#14-demos5---全局注册)
- [15. demos.6 - 通过 dataset 共享钩子间数据](#15-demos6---通过-dataset-共享钩子间数据)
- [16. demos.7 - 指令不推荐用在组件上](#16-demos7---指令不推荐用在组件上)
- [17. demos.8 - 指令钩子与组件钩子的调用顺序](#17-demos8---指令钩子与组件钩子的调用顺序)
- [18. 引用](#18-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 使用时机
- 局部注册
- 全局注册
- 指令钩子
- binding
- 函数简写
- 对象字面量
- 组件限制

## 2. 评价

自定义指令在日常业务里没有组件、组合式函数那么高频，但它很适合解决“必须直接碰 DOM”的问题。

## 3. 什么是自定义指令，什么时候才该用？

::: tip 先来回顾一下指令的完整语法：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-20-15-59-38.png)

:::

### 3.1. 自定义指令（Custom Directives）

自定义指令（Custom Directives）是 Vue 提供的一种扩展机制，用来复用依赖底层 DOM 操作的逻辑。

自定义指令不是 Components 的替代品，也不是 Composables 的替代品，它主要解决的是普通元素上的 DOM 行为复用问题。

### 3.2. 使用时机

官方给出的判断标准很直接：只有当某个功能必须通过直接操作 DOM 才能实现时，才应该考虑自定义指令。

比如，让一个输入框在插入页面后自动获取焦点，这就很适合用指令：

```html
<template>
  <input v-focus />
</template>

<script setup>
  const vFocus = {
    // 完成挂载后自动聚焦
    mounted(el) {
      el.focus()
    },
  }
</script>
```

这个例子中使用自定义的 `v-focus` 指令，比 `<input>` 原生的 `autofocus` 属性更实用，因为它可以更好地集成 Vue 的相关能力，比如在组件生命周期内动态控制元素的聚焦行为。

如果你的需求本质上是：

- 抽 UI 结构
- 复用有状态逻辑
- 统一数据流
- ……

那你应该优先考虑 Components、Props、Slots、Composables，而不是 Custom Directives。

## 4. 自定义指令要怎么注册和使用？

自定义指令有两种常见注册方式：局部注册和全局注册。

### 4.1. 在 `<script setup>` 中局部注册

在 `<script setup>` 里，只要变量名以 `v` 开头，并采用驼峰写法，就可以直接在模板里按短横线形式使用。

```html
<template>
  <p>这是一段非高亮显式的非重点内容</p>
  <p v-highlight>这是一段高亮显式的重点内容</p>
</template>

<script setup>
  // 这里的 vHighlight 会在模板中变成 v-highlight
  const vHighlight = {
    mounted(el) {
      el.classList.add('is-highlight')
    },
  }
</script>

<style scoped>
  .is-highlight {
    background-color: #fff3bf;
  }
</style>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-20-16-28-27.png)

### 4.2. 在组件选项中注册

如果你不用 `<script setup>`，那就通过 `directives` 选项注册：

```html
<template>
  <p>这是一段非高亮显式的非重点内容</p>
  <p v-highlight>这是一段高亮显式的重点内容</p>
</template>

<script>
  export default {
    directives: {
      highlight: {
        mounted(el) {
          el.classList.add('is-highlight')
        },
      },
    },
  }
</script>

<style scoped>
  .is-highlight {
    background-color: #fff3bf;
  }
</style>
```

最终效果是一样的：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-20-16-28-27.png)

### 4.3. 全局注册

如果一个指令要在整个应用中都能用，可以注册到应用实例上：

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.directive('focus', {
  mounted(el) {
    el.focus()
  },
})

app.mount('#app')
```

这种方式适合全局通用的指令，比如 `v-focus`、`v-permission` 这类项目级能力。

## 5. 指令对象有哪些生命周期钩子？每个钩子的参数分别都有哪些？

### 5.1. 钩子列表

一个完整的指令对象可以包含下面这些钩子：

```js
const myDirective = {
  // 在绑定元素的 attribute 前或事件监听器应用前调用
  created(el, binding, vnode) {},

  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode) {},

  // 在绑定元素的父组件及他自己的所有子节点都挂载完成后调用
  // 元素已经插入 DOM，可以安全操作 DOM
  mounted(el, binding, vnode) {},

  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},

  // 在绑定元素的父组件及他自己的所有子节点都更新后调用
  // 绑定值更新后执行
  updated(el, binding, vnode, prevVnode) {},

  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode) {},

  // 绑定元素的父组件卸载后调用
  // 做清理工作，比如移除监听、取消订阅
  // 如果你的指令里注册了事件监听或第三方实例，别忘了在卸载阶段清理，不然同样可能留下内存泄漏
  unmounted(el, binding, vnode) {},
}
```

你可以把这些钩子理解成“针对元素节点的生命周期”，不是组件生命周期的简单拷贝。其中最常用的是这几个：`mounted`、`updated`、`unmounted`。

### 5.2. 钩子参数

指令的钩子会传递以下几种参数：

- `el`：指令绑定到的元素。这可以用于直接操作 DOM。
- `binding`：一个对象，包含以下属性。
  - `value`：传递给指令的值。例如在 `v-my-directive="1 + 1"` 中，值是 2。
  - `oldValue`：之前的值，仅在 `beforeUpdate` 和 `updated` 中可用。无论值是否更改，它都可用。
  - `arg`：传递给指令的参数 (如果有的话)。例如在 `v-my-directive:foo` 中，参数是 "foo"。
  - `modifiers`：一个包含修饰符的对象 (如果有的话)。例如在 `v-my-directive.foo.bar` 中，修饰符对象是 `{ foo: true, bar: true }`。
  - `instance`：使用该指令的组件实例。
  - `dir`：指令的定义对象。
- `vnode`：代表绑定元素的底层 VNode。
- `prevVnode`：代表之前的渲染中指令所绑定元素的 VNode。仅在 `beforeUpdate` 和 `updated` 钩子中可用。

举例来说，像下面这样使用指令：

```html
<div v-example:foo.bar="baz"></div>
```

`binding` 参数会是一个这样的对象：

```js
{
  value: ..., // 绑定的 baz 的值
  oldValue: ..., // 上一次更新时 baz 的值
  arg: 'foo', // 参数
  modifiers: { bar: true }, // 修饰符对象
  instance: /* 当前组件实例 */,
  dir: /* 指令定义对象 */,
}
```

和内置指令类似，自定义指令的参数也可以是动态的。举例来说：

```html
<div v-example:[arg]="value"></div>
```

这里指令的参数会基于组件的 arg 数据属性响应式地更新。

::: tip

除了 el 外，其他参数都是只读的，不要更改它们。若你需要在不同的钩子间共享信息，推荐通过元素的 dataset attribute 实现。

:::

## 6. 封装一个自定义指令的时候使用函数简写是什么意思？

如果你的指令只需要在指令的 `mounted` 和 `updated` 两个钩子中执行相同逻辑，可以直接使用函数简写。

```js
app.directive('color', (el, binding) => {
  // 这会在 mounted 和 updated 钩子中都调用
  el.style.color = binding.value
})
```

这个写法等价于“在 `mounted` 和 `updated` 钩子中都运行这段逻辑”。它非常适合一些简单场景，比如同步颜色、尺寸、属性值。

选择建议：

- 优先考虑函数简写：常见场景，比如只需要在指令的 `mounted` 和 `updated` 两个钩子中执行相同逻辑
- 需要走完整指令对象：场景较为复杂，比如需要在多个钩子中执行不同逻辑

## 7. 自定义指令在模板中被使用时，可以直接通过对象字面量的形式传递整个对象吗？

如果你需要一次传多个配置项，可以直接给指令传对象字面量：

```html
<template>
  <div v-demo="{ color: 'white', text: 'hello' }"></div>
</template>
```

在自定义指令中获取到的 `binding.value` 就是这个对象：

```js
app.directive('demo', (el, binding) => {
  el.style.color = binding.value.color // => 'white'
  el.textContent = binding.value.text // => 'hello'
})
```

## 8. 为什么不推荐把自定义指令直接用在组件上？

::: details 看看官方原话

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-20-17-52-06.png)

:::

原因不是完全不能用，而是它的行为边界并不稳定。自定义指令应用在组件上时，实际上会落到组件的根节点上，和透传 attributes 有点像。

```html
<MyPanel v-focus />
```

- 如果 `MyPanel` 最终只有一个根节点，指令会应用到那个根元素上
- 如果这个组件是多根节点组件，指令会被忽略并给出警告

核心原因：

- 指令拿到的 DOM 元素不可靠 => 你很难从组件外部稳定控制它真正作用到哪个 DOM，组件内部结构稍微变化，指令行为就可能跟着变化。
- 子组件内部无法派发指令到特定元素 => 透传 Attributes 可以在子组件内部通过 `$attrs` 精确派发调用方传入的 arrts 到特定元素身上，但指令不能像 `$attrs` 那样轻松转发给内部另一个元素。

因此，更稳妥的做法是：把指令直接写在你明确知道的原生元素上，而不是压在组件标签上赌实现细节。

## 9. 自定义指令的生命周期钩子和组件的生命周期钩子之间有什么关系吗？它们是互相独立的吗？【深入源码】

两者名称相似，但它们是「完全独立的两套机制」，作用对象、参数、调用位置都不同。不过它们的触发时机是由渲染器协调的，存在固定的先后顺序关系。

### 9.1. 核心源码

- github.com/vuejs/core -> packages/runtime-core/src/directives.ts
- github.com/vuejs/core -> packages/runtime-core/src/renderer.ts

### 9.2. 本质区别

|  | 组件钩子 | 指令钩子 |
| --- | --- | --- |
| 作用对象 | 组件实例 | DOM 元素 |
| 参数 | 无（通过 `this`/闭包访问） | `(el, binding, vnode, prevVNode)` |
| 存储位置 | `instance.m`、`instance.bu` 等 | `vnode.dirs[]` |
| 调用位置 | `mountComponent` / `updateComponent` | `mountElement` / `patchElement` / `unmount` |

指令钩子定义在 `ObjectDirective` 接口中，还比组件多一个 `created` 钩子（在元素创建后、props 设置前触发）：

```ts
// packages/runtime-core/src/directives.ts
export interface ObjectDirective<
  HostElement = any,
  Value = any,
  Modifiers extends string = string,
  Arg = any,
> {
  /**
   * @internal without this, ts-expect-error in directives.test-d.ts somehow
   * fails when running tsc, but passes in IDE and when testing against built
   * dts. Could be a TS bug.
   */
  __mod?: Modifiers
  created?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>
  beforeMount?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>
  mounted?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>
  beforeUpdate?: DirectiveHook<
    HostElement,
    VNode<any, HostElement>,
    Value,
    Modifiers,
    Arg
  >
  updated?: DirectiveHook<
    HostElement,
    VNode<any, HostElement>,
    Value,
    Modifiers,
    Arg
  >
  beforeUnmount?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>
  unmounted?: DirectiveHook<HostElement, null, Value, Modifiers, Arg>
  getSSRProps?: SSRDirectiveHook<Value, Modifiers, Arg>
  deep?: boolean
}
```

### 9.3. 调用时机的关系

::: code-group

```[挂载（Mount）]
[setupComponent 阶段]
组件 beforeCreate ──── 同步（仅 Options API）
组件 created ────────── 同步（仅 Options API）

[setupRenderEffect 阶段]
组件 beforeMount ────── 同步
  │
  └─ 渲染子树 patch() → mountElement()
       指令 created ──── 同步（子元素创建后、props 设置前）
       指令 beforeMount  同步（元素插入 DOM 前）
       指令 mounted ──── 排队（先入队）
       ↑ mountElement 结束
  │
组件 mounted ─────────── 排队（后入队）

── flush ──────────────────────────────────────
指令 mounted  ← 先执行
组件 mounted  ← 后执行
```

```[更新（Update）]
组件 beforeUpdate ────── 同步
  │
  └─ 重新渲染子树 patch() → patchElement()
       指令 beforeUpdate  同步（DOM patch 前）
       [patch children / patch props]
       指令 updated ────── 排队（先入队）
       ↑ patchElement 结束
  │
组件 updated ─────────── 排队（后入队）

── flush ──────────────────────────────────────
指令 updated  ← 先执行
组件 updated  ← 后执行
```

```[卸载（Unmount）]
组件 beforeUnmount ───── 同步
  │
  └─ 卸载子树 unmount() → 元素节点
       指令 beforeUnmount  同步（DOM 移除前）
       [移除 DOM]
       指令 unmounted ──── 排队（先入队）
       ↑ 子树卸载结束
  │
组件 unmounted ────────── 排队（后入队）

── flush ──────────────────────────────────────
指令 unmounted  ← 先执行
组件 unmounted  ← 后执行
```

:::

### 9.4. 小结

「自定义指令的生命周期钩子」和「组件的生命周期钩子」不是一个东西，它们是互相独立的，它们之间的触发顺序规律如下：

| 阶段 | 同步部分顺序 | 排队部分顺序 |
| --- | --- | --- |
| 挂载 | 组件 `beforeMount` => 指令 `created` => 指令 `beforeMount` | 指令 `mounted` => 组件 `mounted` |
| 更新 | 组件 `beforeUpdate` => 指令 `beforeUpdate` | 指令 `updated` => 组件 `updated` |
| 卸载 | 组件 `beforeUnmount` => 指令 `beforeUnmount` | 指令 `unmounted` => 组件 `unmounted` |

- `before*` 类钩子：组件先于指令（组件先开始渲染/更新/卸载，指令在子树处理中才触发）
- `mounted/updated/unmounted` 类钩子：指令先于组件（指令在子树处理中先入队，组件在子树处理完成后才入队）

## 10. demos.1 - 局部注册与基本用法

::: code-group

```html [App.vue]
<template>
  <!-- v-focus：页面加载后自动聚焦 -->
  <input v-focus placeholder="页面加载后我会自动聚焦" />

  <!-- v-highlight：插入 DOM 后添加高亮样式 -->
  <p v-highlight>这段文字被指令高亮了</p>
  <p>这段文字是普通的</p>
</template>

<script setup>
  // 在 <script setup> 中，变量名以 v 开头且驼峰命名即可直接在模板中使用
  // vFocus 模板中写 v-focus
  const vFocus = {
    mounted(el) {
      el.focus()
    },
  }

  // vHighlight 模板中写 v-highlight
  const vHighlight = {
    mounted(el) {
      el.style.backgroundColor = '#fff3bf'
    },
  }
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-21-16-42-38.png)

## 11. demos.2 - 函数简写

::: code-group

```html [App.vue]
<template>
  <p>颜色：<input v-model="color" /></p>
  <!-- 指令值变化时，函数简写会自动在 mounted 和 updated 中执行同一段逻辑 -->
  <p v-color="color">我的颜色会随输入变化（当前: {{ color }}）</p>
  <p v-color="'teal'">我是固定的 teal 色</p>
</template>

<script setup>
  import { ref } from 'vue'

  const color = ref('cornflowerblue')

  // 函数简写：等价于在 mounted + updated 中执行相同逻辑
  // 适合简单的值同步场景（颜色、尺寸、属性等）
  const vColor = (el, binding) => {
    el.style.color = binding.value
  }
</script>
```

:::

默认的 cornflowerblue：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-21-16-48-36.png)

改为 red：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-21-16-48-45.png)

## 12. demos.3 - 指令钩子与 binding 参数

::: code-group

```html [App.vue]
<template>
  <p>颜色：<input v-model="color" style="width:120px" /></p>
  <!--
    :color   → arg = 'color'
    .bold    → modifiers = { bold: true }
    "color"  → value = color ref 的当前值
  -->
  <p v-if="isVisible" v-demo:color.bold="color">
    打开控制台查看各钩子的触发与 binding 参数
  </p>
  <button @click="color = 'tomato'">改为 tomato</button>
  <button @click="color = 'cornflowerblue'">改为 cornflowerblue</button>
  <button @click="isVisible = false">卸载元素</button>
</template>

<script setup>
  import { ref } from 'vue'

  const color = ref('teal')
  const isVisible = ref(true)

  // 完整指令对象包含 7 个钩子，最常用的是 mounted / updated / unmounted
  const vDemo = {
    // created: 元素创建后、属性设置前
    created(el, binding) {
      console.log('[created]', {
        arg: binding.arg,
        modifiers: binding.modifiers,
      })
    },
    // beforeMount: 元素插入 DOM 前
    beforeMount(el, binding) {
      console.log('[beforeMount] value:', binding.value)
    },
    // mounted: 元素已插入 DOM，可安全操作
    mounted(el, binding) {
      // binding.value      → 绑定值
      // binding.arg        → 参数（冒号后的字符串）
      // binding.modifiers  → 修饰符对象
      // binding.instance   → 当前组件实例
      // binding.dir        → 指令定义对象
      console.log('[mounted]', {
        value: binding.value,
        arg: binding.arg,
        modifiers: binding.modifiers,
      })
      applyStyle(el, binding)
    },
    // beforeUpdate: 元素更新前，oldValue 可用
    beforeUpdate(el, binding) {
      console.log('[beforeUpdate]', {
        value: binding.value,
        oldValue: binding.oldValue,
      })
    },
    // updated: 元素及其子节点更新完成后
    updated(el, binding) {
      console.log('[updated]', {
        value: binding.value,
        oldValue: binding.oldValue,
      })
      applyStyle(el, binding)
    },
    beforeUnmount() {
      console.log('[beforeUnmount]')
    },
    unmounted() {
      console.log('[unmounted]')
    },
  }

  function applyStyle(el, binding) {
    el.style.color = binding.value
    el.style.fontWeight = binding.modifiers.bold ? 'bold' : 'normal'
  }
</script>
```

:::

测试流程：

1. 页面首次渲染
2. 点击「改为 tomato」
3. 点击「改为 cornflowerblue」
4. 点击「卸载元素」

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-21-30-40.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-21-30-53.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-21-31-06.png)

![4](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-21-17-03-11.png)

:::

控制台输出：

::: code-group

```[1]
[created] {
    "arg": "color",
    "modifiers": {
        "bold": true
    }
}
[beforeMount] value: teal
[mounted] {
    "value": "teal",
    "arg": "color",
    "modifiers": {
        "bold": true
    }
}
```

```[2]
[beforeUpdate] {value: 'tomato', oldValue: 'teal'}
[updated] {value: 'tomato', oldValue: 'teal'}
```

```[3]
[beforeUpdate] {value: 'cornflowerblue', oldValue: 'tomato'}
[updated] {value: 'cornflowerblue', oldValue: 'tomato'}
```

```[4]
[beforeUnmount]
[unmounted]
```

:::

## 13. demos.4 - 对象字面量传值

::: code-group

```html [App.vue]
<template>
  <!-- 传入对象字面量时，binding.value 就是整个对象 -->
  <p v-style="{ color: 'white', backgroundColor: 'teal', padding: '8px' }">
    通过对象字面量传入多个样式配置
  </p>
  <p
    v-style="{ color: 'white', backgroundColor: 'rebeccapurple', padding: '8px' }"
  >
    同一个指令，不同配置
  </p>
</template>

<script setup>
  // 适合一次传递多个配置项的场景
  const vStyle = (el, binding) => {
    // binding.value 就是传入的对象 { color, backgroundColor, padding }
    const { color, backgroundColor, padding } = binding.value
    Object.assign(el.style, { color, backgroundColor, padding })
  }
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-21-17-10-14.png)

## 14. demos.5 - 全局注册

::: code-group

```js [main.js]
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局注册：所有组件均可直接使用 v-focus，无需重复声明
app.directive('focus', {
  mounted(el) {
    el.focus()
  },
})

app.mount('#app')
```

```html [App.vue]
<template>
  <h4>App 中使用 v-focus</h4>
  <input v-focus placeholder="App 中的输入框" />
  <hr />
  <!-- 
  页面上的多个输入框无法同时聚焦
  如果将 ChildComp 注释掉，那么 App 组件中的 Input 会自动聚焦。
  如果渲染 ChildComp，那么后渲染的 ChildComp 中的 Input 会抢占焦点。
   -->
  <ChildComp />
</template>

<script setup>
  import ChildComp from './ChildComp.vue'
</script>
```

```html [ChildComp.vue]
<template>
  <h4>ChildComp 中使用 v-focus（无需局部注册）</h4>
  <input v-focus placeholder="子组件中的输入框" />
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-21-42-48.png)

## 15. demos.6 - 通过 dataset 共享钩子间数据

::: code-group

```html [App.vue]
<template>
  <!--
    binding 参数除 el 外都是只读的
    不同钩子间共享数据推荐通过 el.dataset 实现
  -->
  <p v-track="{ id: 101, event: 'click' }" @click="handleClick">
    点击我 —— 指令通过 dataset 存储了数据
  </p>
  <p v-if="info">{{ info }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const info = ref('')

  const vTrack = {
    mounted(el, binding) {
      // 写入 dataset，后续钩子或事件处理器均可读取
      el.dataset.trackId = binding.value.id
      el.dataset.trackEvent = binding.value.event
      el.style.cursor = 'pointer'
      el.style.textDecoration = 'underline'
    },
    updated(el, binding) {
      // updated 中可以读到 mounted 时写入的 dataset
      console.log('[updated] dataset:', { ...el.dataset })
    },
  }

  function handleClick(e) {
    const { trackId, trackEvent } = e.target.dataset
    info.value = `命中埋点 → id=${trackId}, event=${trackEvent}`
  }
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-21-49-33.png)

组件渲染之后，会触发钩子函数 `mounted`，在这个钩子函数中，我们通过 `el.dataset` 将一些数据存储在 DOM 元素上。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-21-49-57.png)

点击按钮之后的页面变化：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-21-44-36.png)

此时 `info` 的值被更新为 `命中埋点 → id=101, event=click`，说明我们成功地通过 `dataset` 在指令钩子和事件处理器之间共享了数据。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-21-48-03.png)

对应的控制台输出：

```
[updated] dataset: {trackId: '101', trackEvent: 'click'}
```

## 16. demos.7 - 指令不推荐用在组件上

::: code-group

```html [App.vue]
<template>
  <h4>1. 指令用在原生元素上 ✓ 推荐</h4>
  <input v-highlight placeholder="我会正常高亮" />

  <h4>2. 指令用在单根节点组件（行为不稳定）</h4>
  <!-- 指令会落到 MyInput 的根 <input> 上，但组件内部结构一旦变化行为就可能改变 -->
  <MyInput v-highlight placeholder="透传到根元素" />

  <h4>3. 指令用在多根节点组件（被忽略 + 控制台警告）</h4>
  <!-- Vue 无法确定应用到哪个根节点，直接忽略 -->
  <MultiRoot v-highlight />
</template>

<script setup>
  import MyInput from './MyInput.vue'
  import MultiRoot from './MultiRoot.vue'

  const vHighlight = {
    mounted(el) {
      el.style.backgroundColor = '#fff3bf'
      el.style.outline = '2px solid #f0c040'
      console.log('v-highlight 作用于:', el.tagName)
    },
  }
</script>
```

```html [MyInput.vue]
<template>
  <!-- 单根节点：指令会落到这个根元素上，但属于不可靠行为 -->
  <input placeholder="我是 MyInput 组件" />
</template>
```

```html [MultiRoot.vue]
<template>
  <!-- 多根节点：指令无法确定目标，会被忽略并产生警告 -->
  <input placeholder="input 1" />
  <input placeholder="input 2" />
</template>
```

:::

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-27-21-58-44.png)

::: warning

Vue 的警告信息如下：

```
[Vue warn]: Runtime directive used on component with non-element root node. The directives will not function as intended.
  at <MultiRoot>
  at <Repl>
```

:::

## 17. demos.8 - 指令钩子与组件钩子的调用顺序

::: code-group

```html [App.vue]
<template>
  <button @click="show = !show">挂载/卸载 Child</button>
  <button @click="count++">触发更新（count={{ count }}）</button>
  <hr />
  <Child v-if="show" :count="count" />
  <p>打开控制台查看完整的触发顺序</p>
</template>

<script setup>
  import { ref } from 'vue'
  import Child from './Child.vue'
  const show = ref(true)
  const count = ref(0)
</script>
```

```html [Child.vue]
<template>
  <p v-timing="count">count = {{ count }}</p>
</template>

<script setup>
  import {
    onBeforeMount,
    onMounted,
    onBeforeUpdate,
    onUpdated,
    onBeforeUnmount,
    onUnmounted,
  } from 'vue'

  defineProps({ count: Number })

  // ==================== 组件钩子 ====================
  // setup 本身等价于 Options API 的 created，最先执行
  console.log('① 组件 setup (同步)')
  onBeforeMount(() => console.log('② 组件 beforeMount (同步)'))
  onMounted(() => console.log('⑥ 组件 mounted (排队，后于指令)'))
  onBeforeUpdate(() => console.log('⑦ 组件 beforeUpdate (同步)'))
  onUpdated(() => console.log('⑩ 组件 updated (排队，后于指令)'))
  onBeforeUnmount(() => console.log('⑪ 组件 beforeUnmount (同步)'))
  onUnmounted(() => console.log('⑭ 组件 unmounted (排队，后于指令)'))

  // ==================== 指令钩子 ====================
  // 规律：
  //   before* 类 → 组件先触发，指令后触发（指令在子树处理中才同步执行）
  //   完成类     → 指令先入队，组件后入队（flush 时指令先执行）
  const vTiming = {
    created: () => console.log('③ 指令 created (同步)'),
    beforeMount: () => console.log('④ 指令 beforeMount (同步)'),
    mounted: () => console.log('⑤ 指令 mounted (排队，先于组件)'),
    beforeUpdate: () => console.log('⑧ 指令 beforeUpdate (同步)'),
    updated: () => console.log('⑨ 指令 updated (排队，先于组件)'),
    beforeUnmount: () => console.log('⑫ 指令 beforeUnmount (同步)'),
    unmounted: () => console.log('⑬ 指令 unmounted (排队，先于组件)'),
  }
</script>
```

:::

控制台输出：

1. 页面首次渲染
2. 点击更新按钮
3. 点击卸载按钮

::: code-group

```[1]
① 组件 setup (同步)
② 组件 beforeMount (同步)
③ 指令 created (同步)
④ 指令 beforeMount (同步)
⑤ 指令 mounted (排队，先于组件)
⑥ 组件 mounted (排队，后于指令)
```

```[2]
⑦ 组件 beforeUpdate (同步)
⑧ 指令 beforeUpdate (同步)
⑨ 指令 updated (排队，先于组件)
⑩ 组件 updated (排队，后于指令)
```

```[3]
⑪ 组件 beforeUnmount (同步)
⑫ 指令 beforeUnmount (同步)
⑬ 指令 unmounted (排队，先于组件)
⑭ 组件 unmounted (排队，后于指令)
```

:::

## 18. 引用

- [Vue.js 官方文档 - 自定义指令][1]
- [MDN - HTMLElement.dataset][2]

[1]: https://cn.vuejs.org/guide/reusability/custom-directives.html
[2]: https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/dataset
