# [0090. 自定义指令](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0090.%20%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8C%87%E4%BB%A4)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是自定义指令，什么时候才该用？](#3--什么是自定义指令什么时候才该用)
- [4. 🤔 自定义指令要怎么注册和使用？](#4--自定义指令要怎么注册和使用)
  - [4.1. 在 `<script setup>` 中局部注册](#41-在-script-setup-中局部注册)
  - [4.2. 在组件选项中注册](#42-在组件选项中注册)
  - [4.3. 全局注册](#43-全局注册)
- [5. 🤔 指令对象有哪些生命周期钩子？](#5--指令对象有哪些生命周期钩子)
- [6. 🤔 binding 参数里到底有什么？](#6--binding-参数里到底有什么)
- [7. 🤔 什么时候可以用函数简写或对象字面量？](#7--什么时候可以用函数简写或对象字面量)
- [8. 🤔 为什么不推荐把自定义指令直接用在组件上？](#8--为什么不推荐把自定义指令直接用在组件上)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 使用时机
- 局部注册
- 全局注册
- 指令钩子
- binding
- 函数简写
- 对象字面量
- 组件限制

## 2. 🫧 评价

自定义指令在日常业务里没有组件、组合式函数那么高频，但它很适合解决「必须直接碰 DOM」的问题。你真正需要掌握的是使用边界、钩子时机和 `binding` 参数，避免把它滥用成“什么都往指令里塞”。

## 3. 🤔 什么是自定义指令，什么时候才该用？

自定义指令是 Vue 提供的一种扩展机制，用来复用「依赖底层 DOM 操作」的逻辑。

这句话要拆开看：

- 它不是组件的替代品。
- 它也不是组合式函数的替代品。
- 它主要解决的是“普通元素上的 DOM 行为复用”。

官方给出的判断标准很直接：只有当某个功能必须通过直接操作 DOM 才能实现时，才应该考虑自定义指令。

比如让一个输入框在插入页面后自动获取焦点，这就很适合用指令：

```vue
<template>
  <input v-focus />
</template>

<script setup>
const vFocus = {
  mounted(el) {
    el.focus()
  },
}
</script>
```

这个例子比原生 `autofocus` 更实用，因为它不仅能处理页面初次加载，也能处理 Vue 运行过程中动态插入的元素。

但如果你的需求本质上是：

- 抽 UI 结构
- 复用有状态逻辑
- 统一数据流

那你应该优先考虑组件、Props、插槽、组合式函数，而不是指令。

::: tip 优先声明式写法

官方建议尽量优先使用 `v-bind`、组件、组合式函数等声明式方案。它们通常更直观，也更利于 SSR。

只有当你绕不开原生 DOM API 时，再用自定义指令。

:::

## 4. 🤔 自定义指令要怎么注册和使用？

自定义指令有两种常见注册方式：局部注册和全局注册。

### 4.1. 在 `<script setup>` 中局部注册

在 `<script setup>` 里，只要变量名以 `v` 开头，并采用驼峰写法，就可以直接在模板里按短横线形式使用。

```vue
<template>
  <p v-highlight>这是一段重点内容</p>
</template>

<script setup>
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

这里的 `vHighlight` 会在模板中变成 `v-highlight`。

### 4.2. 在组件选项中注册

如果你不用 `<script setup>`，那就通过 `directives` 选项注册：

```js
export default {
  directives: {
    highlight: {
      mounted(el) {
        el.classList.add('is-highlight')
      },
    },
  },
}
```

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

## 5. 🤔 指令对象有哪些生命周期钩子？

一个完整的指令对象可以包含下面这些钩子：

- `created`
- `beforeMount`
- `mounted`
- `beforeUpdate`
- `updated`
- `beforeUnmount`
- `unmounted`

你可以把它理解成“针对元素节点的生命周期”，不是组件生命周期的简单拷贝。

```js
const vDemo = {
  created(el, binding, vnode) {},
  beforeMount(el, binding, vnode) {},
  mounted(el, binding, vnode) {},
  beforeUpdate(el, binding, vnode, prevVnode) {},
  updated(el, binding, vnode, prevVnode) {},
  beforeUnmount(el, binding, vnode) {},
  unmounted(el, binding, vnode) {},
}
```

通常最常用的是这几个：

- `mounted`：元素已经插入 DOM，可以安全操作 DOM。
- `updated`：绑定值更新后执行。
- `unmounted`：做清理工作，比如移除监听、取消订阅。

如果你的指令里注册了事件监听或第三方实例，别忘了在卸载阶段清理，不然同样可能留下内存泄漏。

## 6. 🤔 binding 参数里到底有什么？

指令钩子除了 `el` 之外，最重要的就是 `binding`。

它会把模板中写给指令的值、参数、修饰符都整理好交给你。

```html
<div v-demo:position.top.animate="200"></div>
```

```js
const vDemo = {
  mounted(el, binding) {
    console.log(binding.value)
    console.log(binding.oldValue)
    console.log(binding.arg)
    console.log(binding.modifiers)
    console.log(binding.instance)
    console.log(binding.dir)
  },
}
```

常用字段可以这样理解：

- `value`：当前绑定值。
- `oldValue`：上一次的值，只在更新钩子里有意义。
- `arg`：参数，比如 `v-demo:position` 里的 `position`。
- `modifiers`：修饰符对象，比如 `.top.animate` 会变成 `{ top: true, animate: true }`。
- `instance`：当前使用该指令的组件实例。
- `dir`：当前指令定义对象本身。

注意一个边界：除了 `el` 之外，其它参数都应该视为只读。你不要去修改 `binding` 或 `vnode`。如果不同钩子之间需要共享信息，更稳妥的做法是把状态挂到元素自身，比如使用 `dataset`。

## 7. 🤔 什么时候可以用函数简写或对象字面量？

如果你的指令只需要在 `mounted` 和 `updated` 两个阶段执行相同逻辑，可以直接使用函数简写。

```js
app.directive('color', (el, binding) => {
  el.style.color = binding.value
})
```

这个写法等价于“在 `mounted` 和 `updated` 都运行这段逻辑”。它非常适合一些简单场景，比如同步颜色、尺寸、属性值。

如果你需要一次传多个配置项，可以直接给指令传对象字面量：

```vue
<template>
  <div v-demo="{ color: 'white', text: 'hello' }"></div>
</template>
```

```js
app.directive('demo', (el, binding) => {
  el.style.color = binding.value.color
  el.textContent = binding.value.text
})
```

换句话说：

- 行为简单，优先函数简写。
- 参数很多，优先对象字面量。
- 时机复杂，需要完整指令对象。

## 8. 🤔 为什么不推荐把自定义指令直接用在组件上？

官方明确标了「不推荐」。

原因不是完全不能用，而是它的行为边界并不稳定。自定义指令应用在组件上时，实际上会落到组件的根节点上，和透传 attributes 有点像。

```vue
<MyPanel v-focus />
```

如果 `MyPanel` 最终只有一个根节点，指令会应用到那个根元素上；但如果这个组件是多根节点组件，指令会被忽略并给出警告。

这就意味着：

- 你很难从组件外部稳定控制它真正作用到哪个 DOM。
- 组件内部结构稍微变化，指令行为就可能跟着变化。
- 它也不能像 `$attrs` 那样轻松转发给内部另一个元素。

因此更稳妥的做法是：把指令直接写在你明确知道的原生元素上，而不是压在组件标签上赌实现细节。

## 9. 🔗 引用

- [Vue.js 官方文档 - 自定义指令][1]
- [Vue.js 官方文档 - 透传 Attributes][2]
- [MDN - HTMLElement.dataset][3]

[1]: https://cn.vuejs.org/guide/reusability/custom-directives.html
[2]: https://cn.vuejs.org/guide/components/attrs.html
[3]: https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/dataset
