# 0001. 属性

## 📝 summary

- 运行时声明（runtime declarations）
- 基于类型的声明（type-based declarations）
- Prop 命名规范
- v-bind 传递整个对象
- 单向数据流
- demo - 属性声明
  - 使用泛型声明 props
  - 可选属性
  - 属性默认值（runtime declarations）配置 default
  - 属性默认值（type-based declarations）编译宏 withDefaults
  - 使用类型别名声明 props
  - 使用接口声明 props
  - 使用对象式声明 props
  - 使用对象简写声明 props
  - 使用数组简写声明 props
  - 声明多个 props
  - 为单个 prop 指定多种可能的类型
  - 使用 v-bind 一次性传递多个 prop
- demo - 属性访问
  - 在 script setup 中访问使用 defineProps 定义的 props
  - 在非 script setup 中访问 props
  - 在模板 template 中访问使用 defineProps 定义的 props
- demo - 属性校验
  - prop 校验
  - validator 配置
  - watch
- demo - PropType 细化类型
  - 使用 PropType 在运行时声明（runtime declarations）中细化类型
- demo - toRefs 保持属性的响应式状态
  - 直接解构 props，会导致响应式丢失
  - 在解构 props 时，可以使用 toRefs **保持** 属性的响应式状态

在本节的示例中，都有对应的视频讲解，通过多个 demo 来了解有关 props 的相关内容。

## ⏰ todos

- [ ] 内容细分，粒度：一条视频对应一篇文档。
  - 现在这篇文档中的内容太多了。

## 🔗 links

- https://cn.vuejs.org/guide/typescript/composition-api.html
  - Vue，TypeScript，TS 与组合式 API。
- https://cn.vuejs.org/guide/components/props.html
  - Vue，深入组件，Props。
- https://cn.vuejs.org/api/utility-types.html#proptype-t
  - Vue，进阶 API，TypeScript 工具类型。

## 📺 video - 视频概述

| 标题     | 简述                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 属性声明 | 在 `<script lang='ts' setup>` 中，如何声明 props。                                     |
| 属性访问 | 如何在 `<script>` 和 `<template>` 中访问 props。                                       |
| 属性校验 | 介绍 validator 字段；介绍如何不用 validator，使用 watch 来监听 props，自定义校验规则。 |
| PropType | 介绍 PropType 的应用场景 - 细化类型                                                    |
| toRefs   | 介绍 toRefs 的应用场景 - 解构 props 时保持响应式                                       |

> 视频录制的时候正好刚跑完步，喝着雪碧，所以会时不时有点儿打嗝的声音。

## ❌ error - 错误说明

- 在 Props 系列的视频中 `declarations`（声明 `/ ˌdekləˈreɪʃnz /`） 这个单词的发音错误，读成了 `direction`（方向 `/ daɪˈrekʃn /`）。

## 📒 notes - 属性 - 运行时声明 vs. 基于类型的声明

- Q：**什么是“运行时声明”（runtime props declarations）、“基于类型的声明”（type-based props declarations）？**
- **“运行时声明”（runtime props declarations）**

```vue
<script setup lang="ts">
const props = defineProps({
  foo: { type: String, required: true },
  bar: Number
})

props.foo // string
props.bar // number | undefined
</script>
<!--
上述写法被称之为“运行时声明”（runtime props declarations）
因为传递给 defineProps() 的参数会作为运行时的 props 选项使用。
-->
```

- **“基于类型的声明”（type-based props declarations）**

```vue
<script setup lang="ts">
const props = defineProps<{
  foo: string
  bar?: number
}>()
</script>
<!--
上述写法被称之为“基于类型的声明”（type-based props declarations）
编译器会尽可能地尝试根据类型参数推导出等价的运行时选项。

在这种场景下
该例子中编译出的运行时选项和上一个是完全一致的
即，两种写法是等效的

这两种声明方式，在本节的 demo 中都会介绍。
如果想要更好地结合 TS 的类型系统，让方便类型被更好地复用，
type-based props declarations 是更好的选择。
-->
```

- 由此可见，type-based 是定义属性的另一种写法，它和 runtime 式写法都是一样的，都是用来声明 props，并没有扩展任何额外的功能，因为 **type-based 式写法，最终是会被编译器推断为 runtime 式写法。**

## 📒 notes - 属性 - `defineProps()` 宏中的参数不能是变量

- `defineProps()` 宏中的参数 **不可以** 访问 `<script setup>` 中定义的其他变量，因为在编译时整个表达式都会被移到外部的函数中。

## 📒 notes - 属性 - Prop 命名规范

- 子组件定义 props 的时候，属性名建议采用小驼峰式写法，比如 `greetingMessage`。
- 父组件在调用子组件并传递 props 时，属性名建议和 HTML 的 attribute 写法对齐，采用中划线式写法，比如 `greeting-message`。

```ts
defineProps({
  greetingMessage: String
})
// 如果一个 prop 的名字很长，应使用 camelCase 形式，
// 它们是合法的 JavaScript 标识符
// 可以直接在模板的表达式中使用
// 也可以避免在作为属性 key 名时必须加上引号

// 在模板中
// <span>{{ greetingMessage }}</span>

// 虽然理论上你也可以在向子组件传递 props 时使用 camelCase 形式
// 但实际上为了和 HTML attribute 对齐，我们通常会将其写为 kebab-case 形式

// 在父组件中
// <MyComponent greeting-message="hello" />

// 对于组件名我们推荐使用 PascalCase，
// 因为这提高了模板的可读性，
// 能帮助我们区分 Vue 组件和原生 HTML 元素。

// 然而对于传递 props 来说，
// 使用 camelCase 并没有太多优势，
// 因此我们推荐更贴近 HTML 的书写风格。
```

## 📒 notes - 属性 - 静态 vs. 动态 Props

- 动态属性可以通过 `v-bind` 来传。

```vue
<!--
静态形式的 props
-->
<BlogPost title="My journey with Vue" />

<!--
动态形式的 props
使用 v-bind 或缩写 : 来进行动态绑定的 props
-->
<!-- 根据一个变量的值动态传入 -->
<BlogPost :title="post.title" />

<!-- 根据一个更复杂表达式的值动态传入 -->
<BlogPost :title="post.title + ' by ' + post.author.name" />
```

## 📒 notes - 属性 - 传递不同的值类型

```vue
<!-- Number -->
<!-- 虽然 `42` 是个常量，我们还是需要使用 v-bind -->
<!-- 因为这是一个 JavaScript 表达式而不是一个字符串 -->
<BlogPost :likes="42" />

<!-- 根据一个变量的值动态传入 -->
<BlogPost :likes="post.likes" />



<!-- Boolean -->
<!-- 仅写上 prop 但不传值，会隐式转换为 `true` -->
<BlogPost is-published />

<!-- 虽然 `false` 是静态的值，我们还是需要使用 v-bind -->
<!-- 因为这是一个 JavaScript 表达式而不是一个字符串 -->
<BlogPost :is-published="false" />

<!-- 根据一个变量的值动态传入 -->
<BlogPost :is-published="post.isPublished" />



<!-- Array -->
<!-- 虽然这个数组是个常量，我们还是需要使用 v-bind -->
<!-- 因为这是一个 JavaScript 表达式而不是一个字符串 -->
<BlogPost :comment-ids="[234, 266, 273]" />

<!-- 根据一个变量的值动态传入 -->
<BlogPost :comment-ids="post.commentIds" />



<!-- Object -->
<!-- 虽然这个对象字面量是个常量，我们还是需要使用 v-bind -->
<!-- 因为这是一个 JavaScript 表达式而不是一个字符串 -->
<BlogPost
  :author="{
    name: 'Veronica',
    company: 'Veridian Dynamics'
  }"
 />

<!-- 根据一个变量的值动态传入 -->
<BlogPost :author="post.author" />
```

## 📒 notes - 属性 - `v-bind` 一次传递整个对象

```vue
<script>
// 示例
const post = {
  id: 1,
  title: 'My Journey with Vue'
}

// 如果你想要将一个对象的所有属性都当作 props 传入，
// 你可以使用没有参数的 v-bind，
// 即只使用 v-bind 而非 :prop-name。
</script>
<template>
  <!-- 写法 1（更简洁） -->
  <BlogPost v-bind="post" />
  <!-- 写法 2 -->
  <BlogPost :id="post.id" :title="post.title" />

  <!-- 写法 1 和 写法 2 是等效的-->
</template>
```

## 📒 notes - 属性 - 单向数据流

- 所有的 props 都遵循着 **单向绑定** 原则，props 因父组件的更新而变化，自然地将新的状态向下流往子组件，而不会逆向传递。这避免了子组件意外修改父组件的状态的情况，不然应用的数据流将很容易变得混乱而难以理解。
- 另外，每次父组件更新后，所有的子组件中的 props 都会被更新到最新值，这意味着你不应该在子组件中去更改一个 prop。若你这么做了，Vue 会在控制台上向你抛出警告：

```ts
const props = defineProps(['foo'])

// ❌ 警告！prop 是只读的！
props.foo = 'bar'
// props 是来自父组件的数据，作为子组件，你只有读的份。
// 虽然 JS 的引用传值的特性让你拥有了修改来自父组件数据的能力。
// 但是这种能力最好不要在这里去用，否则会破坏单向数据流。
```

- 导致你想要更改一个 prop 的需求通常来源于以下两种场景：
  - 【场景 1】**prop 被用于传入初始值；而子组件想在之后将其作为一个局部数据属性。**在这种情况下，最好是新定义一个局部数据属性，从 props 上获取初始值即可：
  - 【场景 2】**需要对传入的 prop 值做进一步的转换。**在这种情况中，最好是基于该 prop 值定义一个计算属性：

```ts
// 【场景 1】
const props = defineProps(['initialCounter'])

// 计数器只是将 props.initialCounter 作为初始值
// 像下面这样做就使 prop 和后续更新无关了
const counter = ref(props.initialCounter)
// 修改 counter 不会影响到 props.initialCounter 的值



// 【场景 2】
const props = defineProps(['size'])

// 该 prop 变更时计算属性也会自动更新
const normalizedSize = computed(() => props.size.trim().toLowerCase())
```

### 引用类型 - 更改对象 / 数组类型的 props

- 当对象或数组作为 props 被传入时，虽然子组件无法更改 props 绑定，但仍然可以更改对象或数组内部的值。这是因为 JavaScript 的对象和数组是按 **引用** 传递，对 Vue 来说，阻止这种更改需要付出的代价异常昂贵。
- 这种更改的主要缺陷是它允许了子组件以某种不明显的方式影响父组件的状态，可能会使数据流在将来变得更难以理解。在最佳实践中，你应该尽可能避免这样的更改，除非父子组件在设计上本来就需要紧密耦合。在大多数场景下，子组件应该抛出一个事件来通知父组件做出改变。

### 小结

- **无论是什么场景，始终记得不要去破坏单向数据流**。对于不同的场景有不同的处理方案，其核心思想在于：
  - 如果你确实有修改属性值的需求，请 **拷贝** 一份数据出来再去修改。
  - 或者将改动行为封装成一个 **事件**，通过通知父组件的方式来触发值的修改（在子组件中通知，值的修改还是发生在父组件中）。

## 📒 notes - 示例切换说明

```js
// src/main.ts
import { createApp } from 'vue'
import App from './demos/demo1/App.vue'
// import App from './demos/demo{n}/App.vue'
// 通过改变 n 来切换不同的 demo

createApp(App).mount('#app')
```

## 💻 demo1 - 使用泛型声明 props

```vue
<!-- src/demos/demo1/Comp.vue -->
<script setup lang="ts">
defineProps<{ msg: string }>()
// 约束
// msg 是 string 类型
// msg 是必填的

// 这种方式利用 TypeScript 的泛型来定义 props 的类型，简单直观。
// 适合简单类型的 props 定义，写起来比较简洁，且属性类型清晰。
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>
```

```vue
<!-- src/demos/demo1/App.vue -->
<script setup lang="ts">
import Comp from './Comp.vue'
</script>

<template>
  <Comp msg="Hello World!" />
</template>
```

![](md-imgs/2024-10-19-01-05-30.png)

