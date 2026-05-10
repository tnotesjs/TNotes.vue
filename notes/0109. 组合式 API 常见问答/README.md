# [0109. 组合式 API 常见问答](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0109.%20%E7%BB%84%E5%90%88%E5%BC%8F%20API%20%E5%B8%B8%E8%A7%81%E9%97%AE%E7%AD%94)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 组合式 API 到底是什么，它不是函数式编程吗？](#3--组合式-api-到底是什么它不是函数式编程吗)
- [4. 🤔 Vue 为什么要引入组合式 API？](#4--vue-为什么要引入组合式-api)
- [5. 🤔 它和选项式 API、Class API 是什么关系？](#5--它和选项式-apiclass-api-是什么关系)
- [6. 🤔 组合式 API 会不会让代码更乱？](#6--组合式-api-会不会让代码更乱)
- [7. 🤔 它和 React Hooks 最关键的差异是什么？](#7--它和-react-hooks-最关键的差异是什么)
- [8. 🔗 引用](#8--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 概念定义
- 引入动机
- 逻辑复用
- 代码组织
- TS 推导
- 与选项式关系
- Hooks 对比
- 迁移边界

## 2. 🫧 评价

这一篇 FAQ 的重点不是“教你怎么写组合式 API”，而是解释“为什么 Vue 3 要这么设计”。如果你理解了它背后的问题意识，就不会把组合式 API 误解成单纯的语法换皮，也不会把它和选项式 API 关系看成零和竞争。

## 3. 🤔 组合式 API 到底是什么，它不是函数式编程吗？

组合式 API 是一组用函数来组织组件逻辑的 API 集合，主要包括：

- 响应式 API：`ref()`、`reactive()`、`computed()`、`watch()` 等
- 生命周期钩子：`onMounted()`、`onUnmounted()` 等
- 依赖注入：`provide()`、`inject()`

典型写法如下：

```vue
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

onMounted(() => {
  console.log(`The initial count is ${count.value}.`)
})
</script>

<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>
```

它是“函数式风格的组件组织方式”，但不是函数式编程。因为 Vue 的底层仍是可变的、细粒度的响应式系统，而函数式编程通常强调不可变数据。

## 4. 🤔 Vue 为什么要引入组合式 API？

官方把原因总结得很清楚，主要有 4 个。

### 4.1. 更好的逻辑复用

Vue 2 时代的主要复用机制是 mixins，但 mixins 存在命名冲突、来源不清晰、逻辑耦合等问题。组合式 API 用组合式函数把逻辑复用变得更直接，也催生了 VueUse 这样的生态。

### 4.2. 更灵活的代码组织

选项式 API 会把同一个逻辑关注点拆散到：

- `data`
- `methods`
- `computed`
- `watch`

这些不同区域里。组件一大，阅读和抽取都会变难。组合式 API 则允许你把同一个逻辑关注点的代码放在一起，再按需抽成外部函数。

### 4.3. 更好的类型推导

这一点在 TypeScript 项目里尤其明显。选项式 API 为了推导 `this` 类型，需要做大量复杂类型体操；组合式 API 则主要依赖普通变量和函数，本身就更容易被 TypeScript 理解。

### 4.4. 更小的生产包和更少的运行时开销

搭配 `<script setup>` 时，组合式 API 在编译后更接近直接作用域变量访问，比依赖组件实例代理和 `this` 的选项式 API 更利于压缩与优化。

## 5. 🤔 它和选项式 API、Class API 是什么关系？

### 5.1. 和选项式 API 的关系

组合式 API 不是来“废掉”选项式 API 的。

官方明确说了：

- 选项式 API 不会被废弃
- 对中小型项目来说，它仍然是一个不错的选择

组合式 API 能覆盖所有状态逻辑需求。除此之外，组件层面只剩少数选项仍常用，比如：

- `props`
- `emits`
- `name`
- `inheritAttrs`

从 Vue 3.3 开始，像 `name`、`inheritAttrs` 这样的配置也可以通过 `defineOptions` 在 `<script setup>` 中声明。

### 5.2. 能不能混用？

可以。你完全可以在选项式 API 组件中通过 `setup()` 接入组合式 API。

但官方建议把这种混用主要视为迁移和兼容手段，而不是新项目的长期常态。

### 5.3. 和 Class API 的关系

官方已经不再推荐 Vue 3 里使用 Class API。原因主要有两点：

- 它依赖曾长期不稳定的装饰器提案
- 在逻辑复用和代码组织上，它并没有解决选项式 API 的核心限制

## 6. 🤔 组合式 API 会不会让代码更乱？

这是最常见的误解之一。

如果只是把原来分散在各个选项里的代码机械地搬到 `setup()` 里，当然可能更乱。但这不是组合式 API 的问题，而是没有按“逻辑关注点”组织代码。

官方的观点其实更接近这样：

- 选项式 API 默认帮你按固定区域分类
- 组合式 API 则把“如何组织代码”的自由交给你

自由意味着需要更强的代码组织意识，但也意味着更低的重构成本和更强的抽象能力。写组合式 API 时，应该像写普通 JavaScript 模块一样使用良好的命名、分组和提取习惯。

## 7. 🤔 它和 React Hooks 最关键的差异是什么？

官方专门拿这一点做了对比。

React Hooks 的主要问题集中在：

- 每次渲染都会重新调用组件函数
- 调用顺序有严格限制
- 容易出现闭包过期问题
- 需要手动维护依赖数组
- 经常需要 `useMemo` / `useCallback` 做记忆化优化

相比之下，Vue 的组合式 API 有几条非常关键的不同：

1. `setup()` 或 `<script setup>` 只执行一次，不存在组件函数每次更新都重跑的问题。
2. 响应式系统会自动收集计算属性和侦听器依赖，不需要手写依赖数组。
3. 组合式 API 没有 Hooks 那样的调用顺序限制，可以在条件里调用。
4. Vue 的细粒度响应式系统能在大多数情况下自动避免不必要更新，通常不需要手动记忆化子组件回调。

所以两者在“逻辑可组合”这个目标上很接近，但 Vue 依靠的是另一套响应式模型。

## 8. 🔗 引用

- [Vue.js 官方文档 - 组合式 API 常见问答][1]
- [Vue.js 官方文档 - 组合式函数][2]
- [VueUse][3]
- [React Hooks][4]

[1]: https://cn.vuejs.org/guide/extras/composition-api-faq.html
[2]: https://cn.vuejs.org/guide/reusability/composables.html
[3]: https://vueuse.org/
[4]: https://react.dev/reference/react
