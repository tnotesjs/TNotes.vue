# [0032. 组件基础](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0032.%20%E7%BB%84%E4%BB%B6%E5%9F%BA%E7%A1%80)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是组件？为什么 Vue 应用通常会形成组件树？什么是根组件？](#3--什么是组件为什么-vue-应用通常会形成组件树什么是根组件)
- [4. 🤔 组件的定义与注册有哪些方式？全局注册和局部注册有什么区别？](#4--组件的定义与注册有哪些方式全局注册和局部注册有什么区别)
  - [4.1. 使用构建工具时，最推荐的定义方式是 SFC](#41-使用构建工具时最推荐的定义方式是-sfc)
  - [4.2. 不使用构建工具时，也可以直接用 JS 对象定义组件](#42-不使用构建工具时也可以直接用-js-对象定义组件)
  - [4.3. 全局注册和局部注册的区别是什么？](#43-全局注册和局部注册的区别是什么)
    - [全局注册](#全局注册)
    - [局部注册](#局部注册)
    - [如何选择？](#如何选择)
- [5. 💻 demos.1 - 直接使用 JS 对象定义组件](#5--demos1---直接使用-js-对象定义组件)
  - [5.1. 写法 1](#51-写法-1)
  - [5.2. 写法 2](#52-写法-2)
    - [写法 2 是怎么工作的？](#写法-2-是怎么工作的)
  - [5.3. 小结](#53-小结)
- [6. 🤔 单文件组件（SFC）的结构是怎样的？](#6--单文件组件sfc的结构是怎样的)
- [7. 🤔 本节会介绍哪些组件间通信的方式？](#7--本节会介绍哪些组件间通信的方式)
- [8. 🤔 父组件如何通过 props 向子组件传递数据？](#8--父组件如何通过-props-向子组件传递数据)
  - [8.1. `props` 的基本使用](#81-props-的基本使用)
  - [8.2. 选项式 API vs 组合式 API](#82-选项式-api-vs-组合式-api)
- [9. 🤔 子组件如何通过自定义事件通知父组件？](#9--子组件如何通过自定义事件通知父组件)
- [10. 🤔 插槽在组件中解决的是什么问题？](#10--插槽在组件中解决的是什么问题)
- [11. 🤔 动态组件是做什么的？什么时候要配合 `KeepAlive`？](#11--动态组件是做什么的什么时候要配合-keepalive)
  - [11.1. 动态组件](#111-动态组件)
  - [11.2. `KeepAlive`](#112-keepalive)
  - [11.3. 动态组件 vs 条件渲染](#113-动态组件-vs-条件渲染)
    - [条件渲染](#条件渲染)
    - [动态组件](#动态组件)
    - [小结](#小结)
- [12. 🤔 直接在 DOM 中写模板时，有哪些注意事项？](#12--直接在-dom-中写模板时有哪些注意事项)
  - [12.1. 大小写不敏感，所以组件名、prop 名、事件名都要写成 kebab-case](#121-大小写不敏感所以组件名prop-名事件名都要写成-kebab-case)
  - [12.2. 组件标签不能自闭合，必须显式写结束标签](#122-组件标签不能自闭合必须显式写结束标签)
  - [12.3. 某些原生元素对子元素有限制，这时要借助 `is="vue:..."`](#123-某些原生元素对子元素有限制这时要借助-isvue)
  - [12.4. 小结](#124-小结)
    - [这节内容重要吗？](#这节内容重要吗)
    - [那需要掌握到什么程度呢？](#那需要掌握到什么程度呢)
- [13. 🤔 Vue 组件的命名规范有哪些要求？](#13--vue-组件的命名规范有哪些要求)
- [14. 🔗 引用](#14--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 组件定义与组件树
- 组件实例独立
- 全局注册与局部注册
- 单文件组件（SFC）结构
- Props 父传子
- 自定义事件子传父
- 插槽传递内容
- 动态组件与 KeepAlive
- DOM 模板解析限制
- 组件命名规范

## 2. 🫧 评价

组件复用时实例彼此独立、`props`、`emits`、插槽、局部注册这些内容是组件开发的基础，必须掌握。

全局注册的适用场景、动态组件、`KeepAlive`、DOM 内模板注意事项等内容相对边缘，在少数特定场景中会用到，可以先做简单了解。

## 3. 🤔 什么是组件？为什么 Vue 应用通常会形成组件树？什么是根组件？

简单来说，组件就是一块「可以独立思考、独立复用」的 UI 单元。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-06-08-05-54.png)

你可以把一个按钮、一张卡片、一个评论区、一个页面头部，甚至一个完整页面，都写成组件。每个组件都可以封装自己的模板、逻辑和样式，然后继续在别的组件里被使用。

这和原生 HTML 元素的嵌套方式很像：`<main>` 里面可以放 `<header>`、`<section>`、`<footer>`。同样地，一个 Vue 组件里也可以继续使用别的 Vue 组件。

所以一个稍微复杂一点的 Vue 应用，通常都会形成这样的结构：

- 根组件（Root Component）在最上层 => 这是一个 Vue 应用的起点
- 根组件下面往往挂着：布局级组件 + 页面级组件 => 用于控制应用的整体布局
- 页面级组件下面继续拆成具体的：业务组件 + 基础组件 => 用于处理具体业务细节逻辑和具体的交互展示效果

这就是我们常说的「组件树」，每个组件各司其职，从层次上来看，你会发现组件树的结构和我们平时写 HTML 的结构很像，只不过标签名从原生元素变成了我们自己定义的组件名。

「根组件（Root Component）」 是组件树的最顶层组件，也是 Vue 应用的入口组件。它通常是我们在 `createApp()` 里传入的那个组件，例如：

```js
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')
```

在上述这个示例中，`App.vue` 就是根组件。它是整个组件树的起点，下面会有各种子组件、孙组件，最终构成完整的应用界面。

## 4. 🤔 组件的定义与注册有哪些方式？全局注册和局部注册有什么区别？

Vue 组件的「定义」和「注册」其实是两件事。

- 定义：这个组件长什么样、内部逻辑怎么写。
- 注册：这个组件要在哪些地方可以被当作标签使用。

### 4.1. 使用构建工具时，最推荐的定义方式是 SFC

如果你使用的是 Vite 这类构建工具，最推荐的方式就是把组件写成 `.vue` 文件，也就是单文件组件（SFC）。

在 `<script setup>` 语法里，导入进来的组件可以直接在模板中使用：

::: code-group

```html [App.vue]
<template>
  <h2>这里有 3 个独立的计数器组件</h2>
  <ButtonCounter />
  <ButtonCounter />
  <ButtonCounter />
</template>

<script setup>
  import ButtonCounter from './ButtonCounter.vue'
</script>
```

```html [ButtonCounter.vue]
<template>
  <button @click="count++">点击了 {{ count }} 次</button>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-06-08-18-53.png)

每使用一次组件，就会创建一个新的组件实例，所以这 3 个 `ButtonCounter` 会各自维护自己的 `count`，互不影响。你可以第一个按钮点 1 次，第二个按钮点 2 次，第三个按钮点 3 次，它们的计数结果分别是 1、2、3。

::: tip

组件可以被重用任意多次，但每次使用拿到的都是新的组件实例，因此本地状态默认彼此独立。

:::

### 4.2. 不使用构建工具时，也可以直接用 JS 对象定义组件

如果你没有使用构建步骤，Vue 组件也可以直接写成一个普通的 JS 对象：

```js
import { ref } from 'vue'

export const CounterButton = {
  setup() {
    const count = ref(0)
    return { count }
  },
  template: `
    <button @click="count++">
      点击了 {{ count }} 次
    </button>
  `,
}
```

这里的 `template` 是运行时编译的字符串模板。除了直接写字符串，你也可以让 `template` 指向一个原生 `<template>` 元素的 ID。

另外，一个 `.js` 文件里也不一定只能导出一个组件，你既可以默认导出，也可以具名导出多个组件。

例如，你可以在同一个文件里这样写：

```js
export const WelcomeMessage = {
  template: `<h2>你好，Vue 组件</h2>`,
}

export const AlertBox = {
  template: `<div>这是一条提示信息</div>`,
}
```

使用时再按需导入即可，例如：`import { WelcomeMessage, AlertBox } from './components.js'`。

### 4.3. 全局注册和局部注册的区别是什么？

#### 全局注册

全局注册是在应用入口统一注册：

```js
import { createApp } from 'vue'
import App from './App.vue'
import BaseButton from './components/BaseButton.vue'
import BaseCard from './components/BaseCard.vue'

const app = createApp(App)

app.component('BaseButton', BaseButton).component('BaseCard', BaseCard)

app.mount('#app')
```

注册完成后，`BaseButton` 和 `BaseCard` 就可以在当前应用里的任意组件模板中直接使用，不需要每次都手动导入。这不只包括父组件，也包括任意子组件、孙组件；换句话说，全局注册的组件彼此内部也能直接使用。

局部注册则更贴近我们现在的日常写法：哪个组件要用，就在哪个组件里导入它。

- 全局注册的优点是省事，适合按钮、图标、布局容器这类高频基础组件。
- 全局注册的缺点是依赖关系不够直观，而且未使用的全局组件也更难被构建工具移除。

#### 局部注册

如果使用的是 `<script setup>`，导入后就可以直接在模板中使用：

```html
<template>
  <ComponentA />
</template>

<script setup>
  import ComponentA from './ComponentA.vue'
</script>
```

如果没有使用 `<script setup>`，则需要通过 `components` 选项显式注册：

```js
import ComponentA from './ComponentA.vue'

export default {
  components: {
    ComponentA,
  },
  setup() {
    // ...
  },
}
```

需要注意：这种注册只在当前组件内生效，不会自动让后代组件也直接拿到 `ComponentA`。

- 局部注册的优点是依赖关系清晰，更利于维护和按需组织代码。
- 局部注册的缺点是需要在每个使用组件的地方都导入它，稍微麻烦一些。

#### 如何选择？

在真实项目里，通常都是「局部注册为主，全局注册为辅」，随着项目的迭代，逐渐把一些高频使用的基础组件抽离出来全局注册，其他组件则保持局部注册。所以真实的流程是：统一都先写成局部注册，后续根据具体组件的引用情况来决定要不要将某些组件提升为全局注册的形式。

判断标准：如果你发现某个组件在很多地方被使用了，或者它是一个非常基础的组件，那么就可以考虑把它全局注册一下。

## 5. 💻 demos.1 - 直接使用 JS 对象定义组件

### 5.1. 写法 1

::: code-group

<<< ./demos/1/1.html

<<< ./demos/1/1.js

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-06-08-30-32.png)

每个组件都是独立的 Vue 实例，它们之间的数据是互不干扰的。你可以在第一个计数器里点 1 次，在第二个计数器里点 2 次，它们的计数结果分别是 1、2。

`1.js` 里的 `template` 是运行时编译的字符串模板。除了直接写字符串，你也可以让 `template` 指向一个原生 `<template>` 元素的 ID。

### 5.2. 写法 2

::: code-group

<<< ./demos/1/2.html

<<< ./demos/1/2.js

:::

页面上的最终渲染结果和写法 1 是一样的：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-06-08-30-32.png)

#### 写法 2 是怎么工作的？

浏览器原生的 `<template>` 元素有一个特点：它里面的内容不会被渲染到页面上，但会被浏览器解析成 DOM 存在内存里。

Vue 在运行时拿到 `template: '#counter-tpl'` 后，会：

1. 用 `document.querySelector('#counter-tpl')` 找到这个 `<template>` 元素
2. 取出它的 `innerHTML`（即模板字符串）
3. 编译成渲染函数

所以本质上和写字符串是一样的，只是模板的存放位置从 JS 代码里搬到了 HTML 的 `<template>` 元素里，好处是：

- 模板有 HTML 语法高亮
- JS 代码更干净，不用塞一大段模板字符串

### 5.3. 小结

两种方式最终效果完全一样，只是模板的“寄存地”不同。

在实际项目中，如果你用了构建工具（Vite），基本都走 SFC 的 `<template>` 块，这两种写法都很少直接用到。

这个示例只需要简单了解一下即可，通常都是在传统的 `xxx.html` 文件中写一些临时演示 demo 时可能会用到。

## 6. 🤔 单文件组件（SFC）的结构是怎样的？

单文件组件（Single-File Component，SFC）是 Vue 最主流的组件写法。前面我们介绍的很多示例，其实都是单文件组件 SFC 的写法。一个 SFC 也就是一个 `xxx.vue` 文件通常由三部分组成：

- `<template>`：写结构
- `<script>`：写逻辑
- `<style>`：写样式

一个最小可运行的 SFC 可以长这样：

```html
<template>
  <button class="counter" @click="count++">点击了 {{ count }} 次</button>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>

<style scoped>
  .counter {
    padding: 8px 12px;
    border: 1px solid #d4d4d8;
    border-radius: 8px;
    background: #fff;
  }
</style>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-06-21-50-10.png)

这里有几个基础要点需要知晓：

- 一个 SFC 只能有一个顶级 `<template>` 块。
- Vue 3 的 `<template>` 支持多个根节点，不再强制要求单根。
- `<script setup>` 是组合式 API 的编译时语法糖，写起来更短，也更符合现在的主流风格。
- `<style scoped>` 会把样式限制在当前组件内部，避免样式互相污染。

Vue 3 支持多根节点的 `<template>`，例如：

```html
<template>
  <header>头部</header>
  <main>内容</main>
  <footer>底部</footer>
</template>
```

`scoped` 的实现原理可以先粗略理解成：Vue 会给当前组件生成一个独特标记，再把样式选择器转换成只匹配当前组件的形式。效果大致类似下面这样：

```html
<style scoped>
  .title {
    color: red;
  }
</style>

<!-- 编译后的大致效果 -->
<style>
  .title[data-v-xxxxxxx] {
    color: red;
  }
</style>
```

如果你要配合 TypeScript、Sass、Less、Stylus 等工具，也可以在对应块上通过 `lang` 指定语言：

```html
<script setup lang="ts">
  import { ref } from 'vue'

  const title = ref<string>('组件标题')
</script>

<style scoped lang="scss">
  .card {
    padding: 16px;
  }
</style>
```

## 7. 🤔 本节会介绍哪些组件间通信的方式？

- `props`：父组件向子组件传递数据
- 自定义事件：子组件向父组件发送通知
- slots：父组件向子组件传递一段内容，由子组件决定放在哪里显示

组件之间的通信方式有很多种，除了上面提到的这几种之外，还有 `provide/inject`、`v-model`、Vuex、Pinia、EventBus 等等。在这里，我们主要介绍「组件基础」的相关内容，会先从最基础、最常见的几种通信方式讲起，主要介绍这两种通信方式最基础的用法。至于其他的组件间通信方式，会用专门的笔记来介绍。

## 8. 🤔 父组件如何通过 props 向子组件传递数据？

### 8.1. `props` 的基本使用

`props` 用来做「父传子」。父组件把数据放在组件标签上，子组件显式声明后接收它。

这是组件通信里最基础、最常见的一种方式。

::: code-group

```html [App.vue]
<template>
  <BlogPost v-for="post in posts" :key="post.id" :title="post.title" />
</template>

<script setup>
  import { ref } from 'vue'
  import BlogPost from './BlogPost.vue'

  const posts = ref([
    { id: 1, title: '我的第一篇 Vue 笔记' },
    { id: 2, title: '为什么组合式 API 更适合复用逻辑' },
    { id: 3, title: 'SFC 到底解决了什么问题' },
  ])
</script>
```

```html [BlogPost.vue]
<template>
  <article class="post">
    <h3>{{ props.title }}</h3>
  </article>
</template>

<script setup>
  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
  })
</script>
```

:::

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-07-07-35-27.png)

这里有几个关键点需要知晓：

- `defineProps()` 是 `<script setup>` 专用的编译宏，不需要手动导入。它会返回一个 props 对象，你可以在脚本里通过 `props.xxx` 访问。
- 在父组件里，静态值可以直接写，动态值通常通过 `v-bind` 传递，也就是 `:title="post.title"` 这种形式。
- 一个组件可以声明多个 props。基础阶段你先把它理解成「组件对外开放的数据输入口」就够了，通过这个输入口，父组件就能把数据传递给子组件了。

### 8.2. 选项式 API vs 组合式 API

除了使用 `<script setup>` 中的组合式 API 的方式之外，还可以像早期 Vue2 那种选项式 API 的形式，通过 `props` 选项来声明 `props`，并在 `setup(props)` 里读取：

```html
<!-- BlogPost.vue -->
<template>
  <article class="post">
    <h3>{{ props.title }}</h3>
  </article>
</template>

<!-- 写法 1：选项式 API -->
<script>
  export default {
    props: ['title'],
    setup(props) {
      console.log(props.title)
      return {
        props,
      }
    },
  }
</script>

<!-- 写法 2：组合式 API -->
<!-- 
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>
 -->
```

写法 1 和写法 2 最终效果是一样的，都是在组件里声明了一个 `title` 的 prop，并且父组件通过 `:title="post.title"` 把数据传递给它。

在现代 Vue3 项目中，写法 2 更常见一些，因为它更简洁，也更符合现在的主流风格。你可以到 Vue.js 官方 GitHub 仓库下看看一些官方维护的核心库（比如 Vue Router、Pinia 等）的源码，它们的 `xxx.vue` 文件基本上都是使用 `<script setup>` 这种组合式 API 的写法来实现的。

::: details 展开查看：Vue 官方文档对选项式 API 和组合式 API 的选择建议

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-07-07-50-25.png)

:::

## 9. 🤔 子组件如何通过自定义事件通知父组件？

如果说 `props` 是「父传子」，那自定义事件就是「子通知父」。

子组件不会直接去改父组件的数据，而是通过抛出一个事件，告诉父组件「你该做点什么了」。父组件决定要不要响应，以及怎么响应。

::: code-group

```html [App.vue]
<template>
  <section :style="{ fontSize: fontSize + 'em' }">
    <TextPanel @enlarge-text="fontSize += 0.5" />
  </section>
</template>

<script setup>
  import { ref } from 'vue'
  import TextPanel from './TextPanel.vue'

  const fontSize = ref(1)
</script>
```

```html [TextPanel.vue]
<template>
  <div>
    <p>点击按钮后，父组件会把文字变大。</p>
    <button @click="emit('enlarge-text')">放大文字</button>
  </div>
</template>

<script setup>
  const emit = defineEmits(['enlarge-text'])
</script>
```

:::

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-07-08-18-24.png)

点击「放大文字」按钮后，父组件里的 `fontSize` 会增加 0.5，导致文字变大。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-07-08-20-04.png)

`defineEmits()` 也是 `<script setup>` 的编译宏，不需要导入。它返回的 `emit` 函数，本质上就是你在模板里看到的 `$emit` 的脚本版本。

如果不使用 `<script setup>`，也可以通过 `emits` 选项声明，再从 `setup(props, ctx)` 的第二个参数里拿到 `ctx.emit`：

```html
<template>
  <div>
    <p>点击按钮后，父组件会把文字变大。</p>
    <button @click="emit('enlarge-text')">放大文字</button>
  </div>
</template>

<!-- 写法 1：选项式 API -->
<script>
  export default {
    emits: ['enlarge-text'],
    setup(props, ctx) {
      return {
        emit: ctx.emit,
      }
    },
  }
</script>

<!-- 写法 2：组合式 API -->
<!--
<script setup>
const emit = defineEmits(['enlarge-text'])
</script>
-->
```

两种写法最终效果是一样的，都是在组件里声明了一个 `enlarge-text` 的事件，并且父组件通过 `@enlarge-text="fontSize += 0.5"` 来监听它。

通过这个示例，你会发现写法 2 明显比写法 1 更简洁一些。

## 10. 🤔 插槽在组件中解决的是什么问题？

有时候父组件不只是想传一两个数据，而是想把一整段内容交给子组件决定放在哪里显示。

这种场景下，`props` 不够顺手，插槽就很合适。

子组件通过 `<slot />` 提供一个占位位置，父组件把内容写在组件标签之间，最后内容会渲染到这个位置。

::: code-group

```html [App.vue]
<template>
  <FancyButton>
    <!-- slot content - 插槽内容 -->
    Click me!
  </FancyButton>
</template>

<script setup>
  import FancyButton from './FancyButton.vue'
</script>
```

```html [FancyButton.vue]
<template>
  <button class="fancy-btn">
    <slot></slot>
    <!-- slot outlet - 插槽出口 -->
  </button>
</template>

<script setup></script>

<style scoped>
  .fancy-btn {
    padding: 8px 16px;
    border: 2px solid #4f46e5;
    border-radius: 8px;
    background: #eef2ff;
    color: #4f46e5;
    font-weight: bold;
    cursor: pointer;
  }
</style>
```

:::

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-07-18-49-40.png)

你可以先把插槽理解成「组件内部留出来的一块可插入内容的区域」。

`<slot>` 元素是一个插槽出口（slot outlet），标示了父元素提供的插槽内容（slot content）将在哪里被渲染。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-07-18-47-55.png)

最终渲染出来的 DOM 结构：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-07-18-51-50.png)

通过使用插槽，`<FancyButton>` 仅负责渲染外层的 `<button>` (以及相应的样式)，而其内部的内容由父组件提供。

## 11. 🤔 动态组件是做什么的？什么时候要配合 `KeepAlive`？

### 11.1. 动态组件

动态组件解决的是「同一个位置，要在多个组件之间切换显示」的问题。动态组件需要通过 Vue 提供的的 `<component>` 元素和特殊的 `is` 属性实现。你可以认为 `<component :is="...">` 就是一个动态组件。它相当于是一个占位组件，会根据 `:is` 的值来决定最终渲染哪个组件。

介绍到此，不难发现「动态组件」和「条件渲染」非常类似，它们都是根据某个状态来决定显示哪个组件。两者的核心区别在于：

- 条件渲染是在模板里写逻辑
- 动态组件是用数据驱动模板

动态组件最常见的使用场景就是 Tab、步骤面板、设置面板切换这类界面。

::: code-group

```html [App.vue]
<template>
  <div>
    <button @click="activeTab = 'profile'">资料面板</button>
    <button @click="activeTab = 'settings'">设置面板</button>
  </div>

  <KeepAlive>
    <component :is="tabs[activeTab]" />
  </KeepAlive>
</template>

<script setup>
  import { ref } from 'vue'
  import ProfilePanel from './ProfilePanel.vue'
  import SettingsPanel from './SettingsPanel.vue'

  const activeTab = ref('profile')

  const tabs = {
    profile: ProfilePanel,
    settings: SettingsPanel,
  }
</script>
```

```html [ProfilePanel.vue]
<template>
  <div>
    <h3>资料面板</h3>
    <input v-model="draftName" placeholder="输入昵称后切换 Tab" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const draftName = ref('')
</script>
```

```html [SettingsPanel.vue]
<template>
  <div>
    <h3>设置面板</h3>
    <input v-model="themeName" placeholder="输入主题名后切换 Tab" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const themeName = ref('浅色主题')
</script>
```

:::

`<component :is="...">` 是 Vue 提供的动态组件入口，`:is` 的值既可以是组件名，也可以是导入后的组件对象。

### 11.2. `KeepAlive`

`KeepAlive` 是 Vue 提供的一个内置组件，用来缓存动态组件的状态。在这个实例中，`<KeepAlive>` 包裹了动态组件 `<component :is="tabs[activeTab]" />`。

- 如果不加 `KeepAlive`，切走的组件会被卸载，回切时重新创建。
- 如果加上 `KeepAlive`，切走的组件会被缓存，像输入框里的本地状态就能保留下来。

::: tip

`KeepAlive` 缓存的是组件实例及其本地状态（如 ref、输入框内容等），但不会阻止子组件自身的副作用执行（如 `onMounted` 只在首次挂载时触发，再次切回时触发的是 `onActivated` 而非 `onMounted`）。

:::

### 11.3. 动态组件 vs 条件渲染

上面的示例，如果你要使用条件渲染的写法来实现，好像也是可以实现切换需求的，它本质不就是根据不同的状态，在页面上渲染不同的内容嘛！

#### 条件渲染

下面是条件渲染的写法：

```html
<template>
  <div>
    <button @click="activeTab = 'profile'">资料面板</button>
    <button @click="activeTab = 'settings'">设置面板</button>
  </div>

  <ProfilePanel v-if="activeTab === 'profile'" />
  <SettingsPanel v-else-if="activeTab === 'settings'" />
  <!-- 如果还有更多 tab，继续 v-else-if ... -->
</template>
```

两个 Tab 的时候确实没毛病，能跑。但一旦 tab 变多，差距就出来了。

```html
<!-- 5 个 tab 就得写 5 个分支 -->
<ProfilePanel v-if="activeTab === 'profile'" />
<SettingsPanel v-else-if="activeTab === 'settings'" />
<SecurityPanel v-else-if="activeTab === 'security'" />
<NotifyPanel v-else-if="activeTab === 'notify'" />
<AboutPanel v-else-if="activeTab === 'about'" />
```

每新增一个 tab，你要：

1. 写一个新组件文件
2. 回来改模板，加一行 `v-else-if`

模板和 tab 列表绑死了。

#### 动态组件

动态组件：模板不变，只改数据。

```html
<!-- 不管多少个 tab，模板永远只有一行 -->
<component :is="tabs[activeTab]" />
```

```js
const tabs = {
  profile: ProfilePanel,
  settings: SettingsPanel,
  security: SecurityPanel,
  notify: NotifyPanel,
  about: AboutPanel,
}
```

每新增一个 tab，你只需要：

1. 写一个新组件文件
2. 在数据里加一行

模板的改动量很小，通常只需要添加一个导航入口即可。

#### 小结

|  | 条件渲染 `v-if` | 动态组件 `<component :is>` |
| --- | --- | --- |
| 2~3 个 tab | 够用，很直观 | 也行 |
| 10 个 tab | 模板膨胀，一长串 `v-else-if` | 模板不变，还是那一行 |
| tab 列表从后端/配置来 | 不支持（SFC 的模板里无法 v-if 一个未知数量的列表） | 天然支持，遍历数据对象就行 |
| 配合 `KeepAlive` | 可以，但要包多个组件，语义不够清晰 | 直接包 `<component>` 即可 |
| 新增 tab 的改动范围 | 模板 + 数据（两处） | 数据（一处） |

条件渲染是在模板里写逻辑，动态组件是用数据驱动模板。数据的管理比模板的管理要灵活地多。

两三个 tab 用 `v-if` 没问题；但凡 tab 数量可能增长、或者 tab 列表本身是动态的，动态组件就是更干净的选择。

::: tip

表格中提到“tab 列表从后端/配置来”，条件渲染不支持这个场景。原因很简单：使用 v-if 时，你必须在模板里逐个写死每个组件标签，模板语法本身没有提供“根据一个数组自动生成 N 个 v-if 分支”的写法。

当然，理论上也可以通过手写 render 函数来实现，但成本远高于直接用动态组件。

:::

## 12. 🤔 直接在 DOM 中写模板时，有哪些注意事项？

::: tip 背景介绍

当你不是用 `.vue` 文件写模板，而是直接在 HTML 页面里写 Vue 模板时，会涉及到本节介绍的内容。通常是你在利用传统的 `.html` 文件来写一些临时演示 demo，或者在一些特殊场景下需要直接在 DOM 中写模板时，才会遇到这些解析限制。

核心原因是：SFC 的模板是由 Vue 的编译器处理的，它理解 Vue 的语法（PascalCase、自闭合等）。但“直接在 DOM 中写模板”时，模板是先经过浏览器原生的 HTML 解析器，再交给 Vue 的。浏览器不认识 Vue 语法，会按照 HTML 规范“纠正”你的写法，导致问题。

而熟悉浏览器原生 HTML 解析规则，就能理解为什么会有这些限制，以及如何规避它们。

:::

这一节很多人第一次看会觉得陌生，因为现在大多数项目都用 SFC，写的都是 `.vue` 文件，直接在 DOM 中写模板的场景并不常见。

下面这些限制只出现在「直接在 DOM 中写模板」的场景里，比如原生 HTML 文件里的模板内容。

### 12.1. 大小写不敏感，所以组件名、prop 名、事件名都要写成 kebab-case

浏览器原生 HTML 解析器不会保留大小写，所以你在 DOM 模板里不能指望它识别 PascalCase 的组件标签，也不能直接写 camelCase 的 prop 或事件名。

```html
<div id="app">
  <blog-post post-title="组件基础" @update-post="handleUpdate"></blog-post>
</div>
```

也就是说：

- JS 里可以是 `BlogPost`、`postTitle`、`updatePost`。
- DOM 模板里要写成 `blog-post`、`post-title`、`update-post`。

### 12.2. 组件标签不能自闭合，必须显式写结束标签

在 SFC 里你可以写：

```html
<MyComponent />
```

但在 DOM 模板里要写成：

```html
<my-component></my-component>
```

在 HTML 解析规范中，`<my-component />` 里的 `/` 会被浏览器直接忽略，它只被当作一个开始标签 `<my-component>`，而不是自闭合。只有 SVG、MathML 等特定命名空间下的标签才允许自闭合。

### 12.3. 某些原生元素对子元素有限制，这时要借助 `is="vue:..."`

像 `<table>`、`<ul>`、`<select>` 这类标签，对里面能放什么元素是有要求的。

比如你不能在原生 HTML 解析阶段，直接在 `<table>` 里面随便放一个自定义组件标签，否则浏览器可能会把它当作无效结构处理掉。

```html
<table>
  <tr is="vue:blog-post-row"></tr>
</table>
```

这里的 `vue:` 前缀是必须的。它的作用是告诉 Vue：这是一个 Vue 组件，而不是浏览器原生的自定义内置元素语法。

### 12.4. 小结

#### 这节内容重要吗？

不重要！你只需要有个印象即可。

因为如果你不是刻意去写一些教程示例程序啥的，大概率是不会遇到在 `.html` 文件里写 Vue 模板的需求场景的。

#### 那需要掌握到什么程度呢？

当你在 `.html` 里写 Vue 示例程序，要记得 `.vue` 内部的 `<template>` 中的书写规则不能照搬到 `.html` 文件中，因为它们的解析环境不同。

具体规则都有哪些差异，忘了就忘了，但是需要知道这个差异是存在的，否则当你遇到一些奇怪的行为时，会摸不着头脑。

如果确实遇到在 `.html` 中书写 Vue 应用的场景时，再询问 AI 或者到官方文档中查询不同环境下 Vue 模板的解析差异即可。

## 13. 🤔 Vue 组件的命名规范有哪些要求？

组件命名看起来像是小事，但它直接影响可读性、可维护性，以及团队里的人能不能快速猜出这个组件是做什么的。

你可以先记住这几条最常用的规则：

- 在 SFC 模板里，组件标签推荐使用 PascalCase，例如 `<BlogPost />`、`<UserProfile />`。
- 在直接写 DOM 模板时，组件标签要写成 kebab-case，例如 `<blog-post></blog-post>`。
- 组件名尽量使用多个单词，避免和原生 HTML 元素冲突，例如不要把组件直接命名成 `Table`、`Header`。
- 组件文件名推荐使用 PascalCase，例如 `BlogPost.vue`、`UserProfile.vue`。

下面这些约定在真实项目里也很常见：

- 基础展示组件通常加 `Base` 前缀，例如 `BaseButton.vue`、`BaseInput.vue`。
- 页面里只会出现一次的布局组件通常加 `The` 前缀，例如 `TheHeader.vue`、`TheSidebar.vue`。
- 紧密耦合的子组件可以以前缀表达归属关系，例如 `TodoList.vue`、`TodoListItem.vue`。

关于 props 和事件名，也建议保持这一套转换规律：

```html
<template>
  <UserCard user-name="huyouda" @update-profile="handleUpdateProfile" />
  <!-- 下面写法是等效的：
  组件名：UserCard 可以写为 user-card
  属性名：userName 可以写为 user-name
  事件名：updateProfile 可以写为 update-profile
  -->
</template>
```

- 在脚本里，props 和事件名常见的是 `userName`、`updateProfile` 这种写法。
- 在模板标签上，则统一写成 `user-name`、`update-profile`。

这样做的价值不是「显得规范」，而是你看到名字时就能快速判断：这是基础组件、布局组件，还是某个父组件下面的专属子组件。

::: tip

这些规范具体是否需要应用到项目中，需要你和你的团队一并商量决定。规范的目的不是为了规范而规范，而是为了让代码更清晰、更易维护。如果你觉得某些规范不适合你的项目，也完全可以不使用它们。

比如组件的命名方式：组件文件的命名使用大驼峰，这一点毋庸置疑，也是非常常见的做法；但是组件的使用不一定非得遵循大驼峰的方式。

在官方文档中看到的组件示例代码，基本都是大驼峰的方式在 template 中引用，但是在一些知名开源项目或者组件库的官方文档示例中，关于组件的引用写法，它们基本都是中划线方式，比如 element Plus、ant design vue、tdesign vue 等等。就组件在 template 中是采用大驼峰还是中划线的方式，就可以根据你们团队的习惯来定，确实觉得按照 HTML 解析规范走中划线的方式也无可厚非，重在保持一致性即可。

同理，关于模板中组件属性的写法，虽然官方示例中多采用中划线的方式来命名，比如 `<MyComponent greeting-message="hello" />`，但是这又跟 vue 3.4 推出的同名属性简写语法冲突。

```html
<!-- 写法 1 和写法 2 是等效的 -->
<!-- 写法 1 -->
<MyComponent :greetingMessage="greetingMessage"></MyComponent>
<!-- 写法 2 -->
<MyComponent :greetingMessage></MyComponent>

<!-- 但是如果你把一个属性写为中划线的形式，由于 JS 变量不允许出现 - 符号，你就无法使用 vue3.4 给你提供的同名属性简写特性 -->
<!-- 写法 3 -->
<MyComponent :greeting-message="greetingMessage"></MyComponent>
<!-- 写法 3 无法简写，你无法定义一个名为 greeting-message 的 JS 变量 -->
```

由此可见，对于模板中的属性名，使用小驼峰的形式好像反而还更好，因为它可以与 JS 变量名保持一致，从而支持 vue 3.4 的同名属性简写特性。

:::

## 14. 🔗 引用

- [Vue.js 官方文档 - 组件基础][1]
- [Vue.js 官方文档 - 组件注册][2]
- [Vue.js 官方文档 - 单文件组件][3]
- [StackBlitz][5]
- [Vue.js 官方 GitHub 仓库][6]

[1]: https://cn.vuejs.org/guide/essentials/component-basics.html
[2]: https://cn.vuejs.org/guide/components/registration.html
[3]: https://cn.vuejs.org/guide/scaling-up/sfc.html
[5]: https://stackblitz.com/edit/vitejs-vite-s5ndmort
[6]: https://github.com/vuejs
