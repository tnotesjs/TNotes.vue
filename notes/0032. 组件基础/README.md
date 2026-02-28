# [0032. 组件基础](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0032.%20%E7%BB%84%E4%BB%B6%E5%9F%BA%E7%A1%80)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 组件的定义与注册有哪些方式？全局注册和局部注册有什么区别？](#3--组件的定义与注册有哪些方式全局注册和局部注册有什么区别)
- [4. 🤔 单文件组件（SFC）的结构是怎样的？](#4--单文件组件sfc的结构是怎样的)
- [5. 🤔 Vue 组件的命名规范有哪些要求？](#5--vue-组件的命名规范有哪些要求)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 组件的定义与注册（全局注册 vs 局部注册）
- 单文件组件（SFC）的结构与使用
- 组件的命名规范

## 2. 🫧 评价

- todo

## 3. 🤔 组件的定义与注册有哪些方式？全局注册和局部注册有什么区别？

在 Vue 中，组件是可复用的 UI 构建单元。每个组件本质上是一个拥有预设选项的 Vue 实例（Vue 2）或一个包含模板、逻辑和样式的独立模块（Vue 3）。组件可以通过全局注册和局部注册两种方式来使用。

全局注册是指在应用级别注册组件，注册后可以在应用中任何组件的模板中直接使用，无需额外导入：

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import MyButton from './components/MyButton.vue'
import MyCard from './components/MyCard.vue'

const app = createApp(App)

// 全局注册组件
app.component('MyButton', MyButton)
app.component('MyCard', MyCard)

app.mount('#app')
```

```html
<!-- 在任何组件中都可以直接使用，无需 import -->
<template>
  <div>
    <MyButton>点击我</MyButton>
    <MyCard title="卡片标题">卡片内容</MyCard>
  </div>
</template>
```

全局注册的便利性是显而易见的，但它有几个明显的缺点：

第一，全局注册的组件即使没有被使用，也会被包含在最终的构建产物中，无法被 tree-shaking 移除。这意味着用户将下载一些永远用不到的 JavaScript 代码。

第二，全局注册使得组件之间的依赖关系变得不够明确。在大型应用中，很难追踪一个全局组件究竟在哪些地方被使用了，也很难确定一个组件的所有依赖。这和使用过多全局变量导致的问题类似。

局部注册是在组件内部通过 import 导入其他组件后使用。在 Vue 3 的 `<script setup>` 语法中，导入的组件可以直接在模板中使用而无需显式注册：

```html
<!-- ParentComponent.vue -->
<template>
  <div>
    <MyButton @click="handleClick">提交</MyButton>
    <MyCard title="用户信息">
      <UserProfile :user="currentUser" />
    </MyCard>
  </div>
</template>

<script setup>
  import MyButton from './MyButton.vue'
  import MyCard from './MyCard.vue'
  import UserProfile from './UserProfile.vue'
  import { ref } from 'vue'

  const currentUser = ref({ name: '张三', age: 25 })

  function handleClick() {
    console.log('按钮被点击')
  }
</script>
```

如果不使用 `<script setup>`，则需要在 components 选项中显式注册：

```html
<script>
  import MyButton from './MyButton.vue'
  import MyCard from './MyCard.vue'

  export default {
    components: {
      MyButton,
      MyCard,
    },
    // ...
  }
</script>
```

局部注册的优势对应着全局注册的缺点：依赖关系明确，未使用的组件可以被 tree-shaking 移除，组件之间的关系在代码中清晰可见。在实际项目中，推荐以局部注册为主。只有那些使用频率极高的基础 UI 组件（如按钮、输入框、图标等），才值得全局注册。

在 Vue 2 中还可以定义函数式组件，它是一种无状态、无实例的轻量级组件。在 Vue 3 中，由于普通组件的性能已经足够好，函数式组件的优势不再明显，但仍然可以通过纯函数来定义：

```js
// FunctionalHeading.js
import { h } from 'vue'

export default function FunctionalHeading(props, { slots }) {
  return h(`h${props.level}`, {}, slots.default())
}
```

## 4. 🤔 单文件组件（SFC）的结构是怎样的？

单文件组件（Single-File Component，SFC）是 Vue 中最推荐的组件编写方式。一个 .vue 文件将组件的模板（HTML）、逻辑（JavaScript）和样式（CSS）封装在一个文件中，每个部分由对应的顶级标签块定义——template、script 和 style。

一个典型的 SFC 结构如下：

```html
<template>
  <div class="user-card">
    <img :src="user.avatar" :alt="user.name" class="avatar" />
    <div class="info">
      <h3>{{ user.name }}</h3>
      <p>{{ user.bio }}</p>
      <span class="tag" v-for="tag in user.tags" :key="tag">{{ tag }}</span>
    </div>
    <button @click="toggleFollow" :class="{ following: isFollowing }">
      {{ isFollowing ? '已关注' : '关注' }}
    </button>
  </div>
</template>

<script setup>
  import { ref, defineProps, defineEmits } from 'vue'

  const props = defineProps({
    user: {
      type: Object,
      required: true,
    },
  })

  const emit = defineEmits(['follow', 'unfollow'])

  const isFollowing = ref(false)

  function toggleFollow() {
    isFollowing.value = !isFollowing.value
    emit(isFollowing.value ? 'follow' : 'unfollow', props.user.id)
  }
</script>

<style scoped>
  .user-card {
    display: flex;
    align-items: center;
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    margin-right: 16px;
  }

  .info {
    flex: 1;
  }

  .tag {
    display: inline-block;
    padding: 2px 8px;
    margin: 2px;
    background: #f0f0f0;
    border-radius: 4px;
    font-size: 12px;
  }

  button.following {
    background: #42b883;
    color: white;
  }
</style>
```

template 块定义组件的 HTML 结构。一个 SFC 文件中只能有一个顶级 template 块。在 Vue 3 中，template 支持多个根节点（Fragment），不再像 Vue 2 那样强制要求单一根节点：

```html
<!-- Vue 2：必须有且仅有一个根节点 -->
<template>
  <div>
    <header>头部</header>
    <main>内容</main>
  </div>
</template>

<!-- Vue 3：支持多个根节点 -->
<template>
  <header>头部</header>
  <main>内容</main>
  <footer>底部</footer>
</template>
```

script 块包含组件的逻辑代码。Vue 3 推荐使用 `<script setup>` 语法糖，它是组合式 API 的编译时语法糖，可以显著减少样板代码。在 `<script setup>` 中，顶层的变量、函数、import 的组件都可以直接在模板中使用：

```html
<!-- 传统写法 -->
<script>
  import { ref, computed } from 'vue'
  import ChildComponent from './ChildComponent.vue'

  export default {
    components: { ChildComponent },
    setup() {
      const count = ref(0)
      const double = computed(() => count.value * 2)
      function increment() {
        count.value++
      }
      return { count, double, increment }
    },
  }
</script>

<!-- script setup 写法：更简洁 -->
<script setup>
  import { ref, computed } from 'vue'
  import ChildComponent from './ChildComponent.vue'

  const count = ref(0)
  const double = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
</script>
```

style 块定义组件的样式。可以添加 scoped 属性来限制样式只作用于当前组件，避免样式污染。scoped 的实现原理是 Vue 编译器会为组件中的每个元素添加一个唯一的 data 属性（如 `data-v-7a7a37b1`），然后将 CSS 选择器转换为属性选择器：

```html
<!-- 编译前 -->
<style scoped>
  .title {
    color: red;
  }
</style>

<!-- 编译后（大致效果） -->
<style>
  .title[data-v-7a7a37b1] {
    color: red;
  }
</style>
```

SFC 还支持 CSS Modules、预处理器（Sass、Less、Stylus）和 TypeScript 等特性，可以在相应的标签上通过 lang 属性指定：

```html
<template lang="pug"> div.container h1 {{ title }} </template>

<script setup lang="ts">
  import { ref } from 'vue'
  const title = ref<string>('Hello')
</script>

<style lang="scss" scoped>
  .container {
    h1 {
      color: $primary-color;
    }
  }
</style>
```

## 5. 🤔 Vue 组件的命名规范有哪些要求？

组件命名是 Vue 开发中常常被忽视但非常重要的规范。合理的命名不仅能提高代码的可读性和可维护性，还能避免一些隐蔽的 bug。Vue 官方风格指南对组件命名给出了详细的建议。

组件名有两种常见风格：PascalCase（大驼峰）和 kebab-case（短横线连接）。在 JavaScript 和 SFC 模板中，推荐使用 PascalCase；在 DOM 模板（即直接在 HTML 文件中使用 Vue）中，必须使用 kebab-case：

```html
<!-- SFC 模板中推荐使用 PascalCase -->
<template>
  <MyComponent />
  <UserProfile :user="user" />
  <TodoList :items="todos" />
</template>

<!-- DOM 模板中必须使用 kebab-case -->
<div id="app">
  <my-component></my-component>
  <user-profile :user="user"></user-profile>
  <todo-list :items="todos"></todo-list>
</div>
```

Vue 在 SFC 模板中注册了 PascalCase 名称的组件后，会自动解析对应的 kebab-case 标签。也就是说，注册为 MyComponent 的组件，在模板中可以用 `<MyComponent>` 或 `<my-component>` 来引用。但推荐统一使用 PascalCase，因为它可以和原生 HTML 元素区分开来。

关于文件命名，组件文件名同样推荐使用 PascalCase：

```
# 推荐
components/
  MyButton.vue
  UserProfile.vue
  SearchInput.vue
  TodoItem.vue

# 也可以接受（kebab-case）
components/
  my-button.vue
  user-profile.vue
  search-input.vue
  todo-item.vue

# 不推荐（混合风格）
components/
  myButton.vue      # camelCase
  Todoitem.vue      # 不规范的大小写
```

Vue 官方风格指南中有几条重要的命名规则：

组件名应该始终是多个单词的组合，避免使用单个单词。这是为了避免和现有的或未来的 HTML 元素冲突，因为 HTML 元素都是单个单词（如 div、span、header）：

```js
// 不推荐：单词组件名
app.component('Todo', {
  /* ... */
})
app.component('Table', {
  /* ... */
}) // 容易和 <table> 冲突

// 推荐：多词组件名
app.component('TodoItem', {
  /* ... */
})
app.component('DataTable', {
  /* ... */
})

// 唯一的例外：应用根组件
app.component('App', {
  /* ... */
}) // 可以
```

基础组件（展示类、无逻辑的组件）应该使用统一的前缀，如 Base、App 或 V：

```
components/
  BaseButton.vue
  BaseIcon.vue
  BaseInput.vue
  BaseCard.vue
```

单例组件（每个页面只使用一次，不接受 props）应该以 The 作为前缀：

```
components/
  TheHeader.vue
  TheSidebar.vue
  TheFooter.vue
  TheNavigation.vue
```

紧密耦合的子组件应该以父组件名作为前缀命名：

```
# 推荐
components/
  TodoList.vue
  TodoListItem.vue
  TodoListItemButton.vue

# 不推荐
components/
  TodoList.vue
  Item.vue
  Button.vue
```

组件名中单词的顺序应该以高级别的词开头，以描述性的修饰词结尾：

```
# 推荐
SearchButtonClear.vue
SearchButtonRun.vue
SearchInputQuery.vue
SettingsCheckboxTerms.vue
SettingsCheckboxNewsletter.vue

# 不推荐
ClearSearchButton.vue
RunSearchButton.vue
QuerySearchInput.vue
```

这种命名方式的好处是，在文件系统中相关的组件会自然地排列在一起，在编辑器的文件侧栏中一目了然。

Prop 的命名在声明时使用 camelCase，在模板中使用 kebab-case：

```html
<script setup>
  defineProps({
    greetingMessage: String,
    userName: String,
    isVisible: Boolean,
  })
</script>

<!-- 模板中使用 kebab-case -->
<template>
  <MyComponent greeting-message="你好" user-name="张三" :is-visible="true" />
</template>
```

事件名在 emit 声明时使用 camelCase，在模板中监听时使用 kebab-case：

```html
<!-- 子组件 -->
<script setup>
  const emit = defineEmits(['updateProfile', 'closeDialog'])
</script>

<!-- 父组件模板中使用 kebab-case -->
<template>
  <ChildComponent @update-profile="handleUpdate" @close-dialog="handleClose" />
</template>
```
