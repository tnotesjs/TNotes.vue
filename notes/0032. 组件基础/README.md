# [0032. 组件基础](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0032.%20%E7%BB%84%E4%BB%B6%E5%9F%BA%E7%A1%80)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是组件？为什么 Vue 应用通常会形成组件树？](#3--什么是组件为什么-vue-应用通常会形成组件树)
- [4. 🤔 组件的定义与注册有哪些方式？全局注册和局部注册有什么区别？](#4--组件的定义与注册有哪些方式全局注册和局部注册有什么区别)
  - [4.1. 使用构建工具时，最推荐的定义方式是 SFC](#41-使用构建工具时最推荐的定义方式是-sfc)
  - [4.2. 不使用构建工具时，也可以直接用 JavaScript 对象定义组件](#42-不使用构建工具时也可以直接用-javascript-对象定义组件)
  - [4.3. 全局注册和局部注册的区别是什么？](#43-全局注册和局部注册的区别是什么)
- [5. 💻 demos.1 - 直接使用 JS 对象定义组件](#5--demos1---直接使用-js-对象定义组件)
- [6. 🤔 单文件组件（SFC）的结构是怎样的？](#6--单文件组件sfc的结构是怎样的)
- [7. 🤔 父组件如何通过 props 向子组件传递数据？](#7--父组件如何通过-props-向子组件传递数据)
- [8. 🤔 子组件如何通过自定义事件通知父组件？](#8--子组件如何通过自定义事件通知父组件)
- [9. 🤔 插槽在组件中解决的是什么问题？](#9--插槽在组件中解决的是什么问题)
- [10. 🤔 动态组件是做什么的？什么时候要配合 `KeepAlive`？](#10--动态组件是做什么的什么时候要配合-keepalive)
- [11. 🤔 直接在 DOM 中写模板时，有哪些解析限制？](#11--直接在-dom-中写模板时有哪些解析限制)
  - [11.1. 大小写不敏感，所以组件名、prop 名、事件名都要写成 kebab-case](#111-大小写不敏感所以组件名prop-名事件名都要写成-kebab-case)
  - [11.2. 组件标签不能自闭合，必须显式写结束标签](#112-组件标签不能自闭合必须显式写结束标签)
  - [11.3. 某些原生元素对子元素有限制，这时要借助 `is="vue:..."`](#113-某些原生元素对子元素有限制这时要借助-isvue)
- [12. 🤔 Vue 组件的命名规范有哪些要求？](#12--vue-组件的命名规范有哪些要求)
- [13. 🔗 引用](#13--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 组件是什么，以及为什么应用通常会形成组件树
- 组件的定义方式：SFC 与非构建方式
- 组件的注册方式：全局注册与局部注册
- 组件复用时实例为什么彼此独立
- 单文件组件（SFC）的结构与常见写法
- 父组件如何通过 props 向子组件传递数据
- 子组件如何通过自定义事件通知父组件
- 插槽在组件中承担什么角色
- 动态组件与 `KeepAlive` 的基础用法
- DOM 内模板解析注意事项与组件命名规范

## 2. 🫧 评价

- 这一节是 Vue 的高频基础章节，`props`、`emits`、插槽、局部注册这些内容你几乎每天都会遇到。
- 动态组件和 DOM 内模板解析限制在日常业务里没那么高频，但你至少要知道它们解决什么问题，否则遇到 Tab 切换、原生 DOM 模板、表格中放组件这些场景时会很容易卡住。
- 如果这一节你已经真正理解了，后面再去看组件注册、Props、组件事件、插槽、`KeepAlive` 这些独立章节，会轻松很多。

## 3. 🤔 什么是组件？为什么 Vue 应用通常会形成组件树？

简单来说，组件就是一块「可以独立思考、独立复用」的 UI 单元。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-06-08-05-54.png)

你可以把一个按钮、一张卡片、一个评论区、一个页面头部，甚至一个完整页面，都写成组件。每个组件都可以封装自己的模板、逻辑和样式，然后继续在别的组件里被使用。

这和原生 HTML 元素的嵌套方式很像：`<main>` 里面可以放 `<header>`、`<section>`、`<footer>`。同样地，一个 Vue 组件里也可以继续使用别的 Vue 组件。

所以一个稍微复杂一点的 Vue 应用，通常都会形成这样的结构：

- 根组件在最上层。
- 根组件下面拆成页面级、布局级组件。
- 页面级组件下面继续拆成更细的业务组件和基础组件。

这就是我们常说的「组件树」。

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

### 4.2. 不使用构建工具时，也可以直接用 JavaScript 对象定义组件

如果你没有使用构建步骤，Vue 组件也可以直接写成一个普通的 JavaScript 对象：

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

### 4.3. 全局注册和局部注册的区别是什么？

全局注册是在应用入口统一注册：

```js
import { createApp } from 'vue'
import App from './App.vue'
import BaseButton from './components/BaseButton.vue'

const app = createApp(App)

app.component('BaseButton', BaseButton)

app.mount('#app')
```

注册完成后，`BaseButton` 就可以在当前应用里的任意组件模板中直接使用，不需要每次都手动导入。

局部注册则更贴近我们现在的日常写法：哪个组件要用，就在哪个组件里导入它。

- 全局注册的优点是省事，适合按钮、图标、布局容器这类高频基础组件。
- 全局注册的缺点是依赖关系不够直观，而且未使用的全局组件也更难被构建工具移除。
- 局部注册的优点是依赖关系清晰，更利于维护和按需组织代码。
- 所以在真实项目里，通常都是「局部注册为主，全局注册为辅」。

如果你不用 `<script setup>`，那还可以通过 `components` 选项显式注册局部组件：

```js
import ButtonCounter from './ButtonCounter.vue'

export default {
  components: {
    ButtonCounter,
  },
}
```

## 5. 💻 demos.1 - 直接使用 JS 对象定义组件

::: code-group

<<< ./demos/1/1.html

<<< ./demos/1/1.js

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-06-08-30-32.png)

## 6. 🤔 单文件组件（SFC）的结构是怎样的？

单文件组件（Single-File Component，SFC）是 Vue 最主流的组件写法。一个 `.vue` 文件通常由三部分组成：

- `<template>`：写结构。
- `<script setup>` 或 `<script>`：写逻辑。
- `<style>`：写样式。

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

这里有几个基础点你要知道：

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

## 7. 🤔 父组件如何通过 props 向子组件传递数据？

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

这里有几个关键点：

- `defineProps()` 是 `<script setup>` 专用的编译宏，不需要手动导入。
- 它会返回一个 props 对象，你可以在脚本里通过 `props.xxx` 访问。
- 在父组件里，静态值可以直接写，动态值通常通过 `v-bind` 传递，也就是 `:title="post.title"` 这种形式。
- 一个组件可以声明多个 props。基础阶段你先把它理解成「组件对外开放的数据输入口」就够了。

如果你没有使用 `<script setup>`，那就通过 `props` 选项声明，并在 `setup(props)` 里读取：

```js
export default {
  props: ['title'],
  setup(props) {
    console.log(props.title)
  },
}
```

## 8. 🤔 子组件如何通过自定义事件通知父组件？

如果说 `props` 是「父传子」，那自定义事件就是「子通知父」。

子组件不会直接去改父组件的数据，而是通过抛出一个事件，告诉父组件「你该做点什么了」。父组件决定要不要响应，以及怎么响应。

::: code-group

```html [App.vue]
<template>
  <section :style="{ fontSize: fontSize + 'em' }">
    <TextPanel @enlarge-text="fontSize += 0.1" />
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

这里你可以顺手记住两件事：

- `defineEmits()` 也是 `<script setup>` 的编译宏，不需要导入。
- 它返回的 `emit` 函数，本质上就是你在模板里看到的 `$emit` 的脚本版本。

如果不使用 `<script setup>`，也可以通过 `emits` 选项声明，再从 `setup(props, ctx)` 的第二个参数里拿到 `ctx.emit`：

```js
export default {
  emits: ['enlarge-text'],
  setup(props, ctx) {
    ctx.emit('enlarge-text')
  },
}
```

## 9. 🤔 插槽在组件中解决的是什么问题？

有时候父组件不只是想传一两个数据，而是想把一整段内容交给子组件决定放在哪里显示。

这种场景下，`props` 不够顺手，插槽就很合适。

子组件通过 `<slot />` 提供一个占位位置，父组件把内容写在组件标签之间，最后内容会渲染到这个位置。

::: code-group

```html [App.vue]
<template>
  <AlertBox> 网络请求失败，请稍后再试。 </AlertBox>
</template>

<script setup>
  import AlertBox from './AlertBox.vue'
</script>
```

```html [AlertBox.vue]
<template>
  <div class="alert-box">
    <strong>提示：</strong>
    <slot />
  </div>
</template>

<script setup></script>

<style scoped>
  .alert-box {
    padding: 12px;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    background: #fffbeb;
  }
</style>
```

:::

你可以先把插槽理解成「组件内部留出来的一块可插入内容的区域」。

## 10. 🤔 动态组件是做什么的？什么时候要配合 `KeepAlive`？

动态组件解决的是「同一个位置，要在多个组件之间切换显示」的问题。

最常见的场景就是 Tab、步骤面板、设置面板切换这类界面。

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

这里的关键点是：

- `<component :is="...">` 是 Vue 提供的动态组件入口。
- `:is` 的值既可以是组件名，也可以是导入后的组件对象。
- 如果不加 `KeepAlive`，切走的组件会被卸载，回切时重新创建。
- 如果加上 `KeepAlive`，切走的组件会被缓存，像输入框里的本地状态就能保留下来。

## 11. 🤔 直接在 DOM 中写模板时，有哪些解析限制？

这一节很多人第一次看会觉得陌生，因为现在大多数项目都用 SFC。

但你还是要知道一个前提：下面这些限制只出现在「直接在 DOM 中写模板」的场景里，比如原生 HTML 文件里的模板内容。SFC、`template: '...'` 这种字符串模板，不受这些限制。

### 11.1. 大小写不敏感，所以组件名、prop 名、事件名都要写成 kebab-case

浏览器原生 HTML 解析器不会保留大小写，所以你在 DOM 模板里不能指望它识别 PascalCase 的组件标签，也不能直接写 camelCase 的 prop 或事件名。

```html
<div id="app">
  <blog-post post-title="组件基础" @update-post="handleUpdate"></blog-post>
</div>
```

也就是说：

- JavaScript 里可以是 `BlogPost`、`postTitle`、`updatePost`。
- DOM 模板里要写成 `blog-post`、`post-title`、`update-post`。

### 11.2. 组件标签不能自闭合，必须显式写结束标签

在 SFC 里你可以写：

```html
<MyComponent />
```

但在 DOM 模板里要写成：

```html
<my-component></my-component>
```

原因不复杂：浏览器只允许极少数原生标签省略结束标签。对于普通自定义标签，如果你写成 `<my-component />`，浏览器并不会按 Vue 的规则去理解它。

### 11.3. 某些原生元素对子元素有限制，这时要借助 `is="vue:..."`

像 `<table>`、`<ul>`、`<select>` 这类标签，对里面能放什么元素是有要求的。

比如你不能在原生 HTML 解析阶段，直接在 `<table>` 里面随便放一个自定义组件标签，否则浏览器可能会把它当作无效结构处理掉。

```html
<table>
  <tr is="vue:blog-post-row"></tr>
</table>
```

这里的 `vue:` 前缀是必须的。它的作用是告诉 Vue：这是一个 Vue 组件，而不是浏览器原生的自定义内置元素语法。

## 12. 🤔 Vue 组件的命名规范有哪些要求？

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
</template>
```

- 在脚本里，props 和事件名常见的是 `userName`、`updateProfile` 这种写法。
- 在模板标签上，则统一写成 `user-name`、`update-profile`。

这样做的价值不是「显得规范」，而是你看到名字时就能快速判断：这是基础组件、布局组件，还是某个父组件下面的专属子组件。

## 13. 🔗 引用

- [Vue.js 官方文档 - 组件基础][1]
- [Vue.js 官方文档 - 组件注册][2]
- [Vue.js 官方文档 - 单文件组件][3]
- [Vue.js 官方文档 - 风格指南][4]
- [StackBlitz][5]

[1]: https://cn.vuejs.org/guide/essentials/component-basics.html
[2]: https://cn.vuejs.org/guide/components/registration.html
[3]: https://cn.vuejs.org/guide/scaling-up/sfc.html
[4]: https://cn.vuejs.org/style-guide/rules-strongly-recommended.html
[5]: https://stackblitz.com/edit/vitejs-vite-s5ndmort
