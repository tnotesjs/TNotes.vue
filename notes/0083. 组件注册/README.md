# [0083. 组件注册](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0083.%20%E7%BB%84%E4%BB%B6%E6%B3%A8%E5%86%8C)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是组件注册？为什么组件使用前要先注册？](#3--什么是组件注册为什么组件使用前要先注册)
- [4. 🤔 全局注册和局部注册有什么区别？](#4--全局注册和局部注册有什么区别)
- [5. 🤔 在 `<script setup>` 和普通组件中，局部注册分别怎么写？](#5--在-script-setup-和普通组件中局部注册分别怎么写)
- [6. 🤔 组件名应该如何命名和使用？](#6--组件名应该如何命名和使用)
- [7. 🤔 全局组件和局部组件命名冲突怎么办？](#7--全局组件和局部组件命名冲突怎么办)
- [8. 🤔 组件注册时命名冲突的处理方案？](#8--组件注册时命名冲突的处理方案)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 注册作用
- 全局注册
- 局部注册
- script setup
- 命名约定
- 命名冲突

## 2. 🫧 评价

这一节最常用的是局部注册，尤其是 `<script setup>` 里「导入即可使用」这件事，你在日常写业务组件时几乎天天都会碰到。全局注册属于需要知道但别滥用的能力，通常放在应用入口或插件场景里理解即可。

## 3. 🤔 什么是组件注册？为什么组件使用前要先注册？

组件注册，简单来说，就是让 Vue 知道「模板里的这个标签，对应的是哪个组件实现」。

比如你在模板里写了一个 `<UserCard />`，Vue 在渲染模板时必须先知道 `UserCard` 这个名字对应的到底是什么组件，否则 Vue 就无法把它当成当前作用域里的组件来解析。

所以，组件注册的本质就是建立这样一层映射关系：

1. 模板里出现了某个组件名。
2. Vue 根据当前作用域查找这个名字对应的组件实现。
3. 找到之后，Vue 才能创建组件实例并继续渲染。

从使用范围来看，组件注册主要分成两种：

1. 全局注册：注册后，当前应用里的任意组件都能直接用。
2. 局部注册：只在当前组件里可用，出了这个组件就失效。

如果你在写 Vue 3 单文件组件，并且使用的是 `<script setup>`，体验上会觉得「我只是 import 了一下，没显式注册啊」。这是因为 `<script setup>` 帮你省掉了传统的 `components` 选项写法，但它仍然是在当前组件作用域里把导入的组件暴露给模板使用。

## 4. 🤔 全局注册和局部注册有什么区别？

全局注册是通过应用实例的 `app.component()` 来完成的。它适合一些整个应用都可能频繁复用的基础组件，或者插件在安装时顺手暴露的公共组件。

```js
import { createApp } from 'vue'
import App from './App.vue'
import BaseButton from './components/BaseButton.vue'
import AppCard from './components/AppCard.vue'

const app = createApp(App)

app.component('BaseButton', BaseButton)
app.component('AppCard', AppCard)

// app.component() 除了单独调用，也可以链式调用：
// app
//   .component('BaseButton', BaseButton)
//   .component('AppCard', AppCard)

app.mount('#app')
```

注册完成后，这两个组件在当前应用的任意组件模板里都可以直接使用。

局部注册更强调「谁使用，谁引入」。这让组件依赖关系更清楚，也更有利于打包优化。

::: code-group

```html [App.vue]
<template>
  <UserCard />
</template>

<script setup>
  import UserCard from './components/UserCard.vue'
</script>
```

```html [UserCard.vue]
<template>
  <article class="card">用户信息卡片</article>
</template>
```

:::

这两种方式的核心差异可以这样理解：

| 维度     | 全局注册            | 局部注册           |
| -------- | ------------------- | ------------------ |
| 可用范围 | 当前应用内任意组件  | 仅当前组件         |
| 依赖关系 | 不够直观            | 更清晰             |
| 打包优化 | 不利于 tree-shaking | 更友好             |
| 典型场景 | 基础组件、插件      | 业务组件、页面组件 |

官方更推荐我们优先使用局部注册。因为一旦全局注册过多，项目里很多组件「看起来能直接用」，但你很难快速判断它是从哪里来的，长期维护成本会升高。

## 5. 🤔 在 `<script setup>` 和普通组件中，局部注册分别怎么写？

如果你使用的是 `<script setup>`，导入后的组件可以直接在模板中使用，不需要再写 `components` 选项：

```html
<template>
  <PageHeader />
  <UserList />
</template>

<script setup>
  import PageHeader from './PageHeader.vue'
  import UserList from './UserList.vue'
</script>
```

如果你没有使用 `<script setup>`，那就需要通过 `components` 选项显式声明：

```js
import PageHeader from './PageHeader.vue'
import UserList from './UserList.vue'

export default {
  components: {
    PageHeader,
    UserList,
  },
}
```

这里有一个很容易忽略的点：局部注册只在「当前组件」里生效。

## 6. 🤔 组件名应该如何命名和使用？

官方更推荐我们使用 PascalCase 来命名组件，比如 `UserCard`、`BaseButton`、`AppHeader`。这样做有几个好处：

1. 它本身是合法的 JavaScript 标识符，导入和注册都更自然。
2. 在模板里一眼就能看出这是 Vue 组件，而不是原生 HTML 标签。
3. IDE 的自动补全通常也更友好。

在模板里，PascalCase 注册名既可以写成 PascalCase，也可以写成 kebab-case：

```html
<!-- PascalCase -->
<UserCard />
<!-- 或者 kebab-case -->
<user-card />
```

这两种写法在单文件组件模板里都能正常工作。

不过在日常项目里，比较常见的约定是：

1. JavaScript 导入和组件文件名使用 PascalCase。
2. 单文件组件模板里通常使用 PascalCase 或者 kebab-case，整个项目保持一致的风格即可。
3. 如果是 DOM 内模板，则优先使用 kebab-case，避免浏览器解析大小写时带来问题。

换句话说，命名这件事最重要的不是「能不能用」，而是整个项目是否保持一致。只要团队约定稳定，组件名就不会成为阅读障碍。

## 7. 🤔 全局组件和局部组件命名冲突怎么办？

当全局注册的组件和局部注册的组件名字冲突时，局部注册的组件会覆盖全局注册的组件。

```js
// 全局注册
app.component('MyButton', GlobalButton)

// 局部注册（优先级更高）
export default {
  components: {
    MyButton: LocalButton,
  },
}
```

最佳实践应该是避免这种命名冲突的行为出现，保持组件命名的唯一性和清晰性。

## 8. 🤔 组件注册时命名冲突的处理方案？

背景：当我们在使用一些第三方组件库时，可能会遇到组件命名冲突的情况，比如你自己也有一个叫 `Button` 的组件，而第三方库也有一个 `Button` 组件。

解决方案通常有以下几种：

- 做法 1：通过修复自定义组件名来解决：如果你发现自定义的组件名和引入的组件库中的某个内置组件名冲突，此时可以给自定义的组件名重新起一个名字，将它们区分开来。（推荐）
- 做法 2：通过使用别名来解决：在导入组件时给它们起一个不同的名字。
- 做法 3：通过局部注册优先原则来解决：在局部注册时，局部组件会覆盖全局组件，从而避免冲突。（不推荐）

做法 2：使用别名来解决冲突的写法

```js
import { Button as GlobalButton } from 'third-party-library'
import { Button as LocalButton } from './components/Button.vue'
```

为什么做法 3 不推荐使用呢？

如果依赖 Vue 的局部注册优先原则来解决上述注册时命名冲突的问题，会导致代码可读性变差，维护成本增加。因为 `Button` 有两个不同的实现，其他开发者在阅读代码时可能会不清楚到底哪个组件被使用了，尤其是在大型项目中，这种命名冲突会让代码变得混乱和难以理解。

## 9. 🔗 引用

- [Vue.js 官方文档 - 组件注册][1]

[1]: https://cn.vuejs.org/guide/components/registration.html
