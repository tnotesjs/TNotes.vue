# [0001. 组件属性（Props）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0001.%20%E7%BB%84%E4%BB%B6%E5%B1%9E%E6%80%A7%EF%BC%88Props%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Props 是什么？父组件如何把数据传给子组件？](#3--props-是什么父组件如何把数据传给子组件)
- [4. 🤔 Props 应该如何声明？](#4--props-应该如何声明)
  - [4.1. `defineProps()`](#41-defineprops)
  - [4.2. 结合 TypeScript](#42-结合-typescript)
- [5. 🤔 父组件如何传递不同类型的 props？](#5--父组件如何传递不同类型的-props)
- [6. 🤔 为什么说 props 是单向数据流？子组件应该如何正确使用 props？](#6--为什么说-props-是单向数据流子组件应该如何正确使用-props)
- [7. 🤔 Props 如何设置默认值和校验？](#7--props-如何设置默认值和校验)
- [8. 🤔 Boolean prop 为什么有特殊的转换规则？](#8--boolean-prop-为什么有特殊的转换规则)
- [9. 🤔 响应式 Props 解构有哪些注意事项？](#9--响应式-props-解构有哪些注意事项)
- [10. 🔗 引用](#10--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Props 声明
- 动态传值
- 单向数据流
- Prop 校验
- 布尔转换
- 响应式解构

## 2. 🫧 评价

Props 是组件通信里最高频的入口，你至少要掌握声明、传值、单向数据流和校验这几件事，因为它们几乎决定了一个组件的输入边界。像 Boolean 转换、响应式解构这类细节不算天天手写，但很容易在排错时卡你一下，所以也值得顺手吃透。

## 3. 🤔 Props 是什么？父组件如何把数据传给子组件？

简单来说，props 可以理解成「组件对外公开的输入参数」。父组件通过 props 把数据传给子组件，子组件再根据这些输入去决定自己渲染什么。

基本规则：

- 子组件负责声明自己接收哪些数据
- 父组件负责提供数据
- 未被声明的 attribute 不会自动变成 prop，而是会按透传 attribute 规则处理

示例：

::: code-group

```html [App.vue]
<template>
  <UserCard name="Abc" :age="18" :is-vip="true" :tags="['Vue', 'TypeScript']" />
  <!-- 
   父组件在调用子组件 UserCard 的时候传递 props：
   name => 字符串 "Abc"
   age => 数字 18
   isVip => 布尔值 true
   tags => 字符串数组 ['Vue', 'TypeScript']
    -->
</template>

<script setup>
  import UserCard from './UserCard.vue'
</script>
```

```html [UserCard.vue]
<template>
  <article class="card">
    <!-- 子组件可以在模板中访问父组件传递过来的 props -->
    <h3>{{ props.name }}</h3>
    <p>年龄：{{ props.age }}</p>
    <p>会员：{{ props.isVip ? '是' : '否' }}</p>
    <p>标签：{{ props.tags.join('、') }}</p>
  </article>
</template>

<script setup>
  // 子组件通过 defineProps 声明自己需要哪些 props：
  const props = defineProps({
    name: String,
    age: Number,
    isVip: Boolean,
    tags: Array,
  })
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-17-19-34-42.png)

## 4. 🤔 Props 应该如何声明？

- 在 Vue 3 的 `<script setup>` 中，最常见的声明方式是使用编译宏 `defineProps()` 来声明属性
- 在早期的 Vue 2 版本的写法，也就是选项式 API 中，则是通过组件的 `props` 选项来声明属性

### 4.1. `defineProps()`

最简单的 `defineProps()` 写法是字符串数组：

```html
<script setup>
  // 声明了两个 prop：title 和 author，类型默认为 any
  // 这是最简单的声明方式，但缺点是没有类型约束、默认值和校验规则。
  // 适合快速演示，但不推荐在真实项目里使用。
  const props = defineProps(['title', 'author'])
</script>
```

在真实项目里更推荐对象写法，因为它可以顺手把类型、是否必填、默认值和校验规则都写清楚：

```html
<script setup>
  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: '匿名',
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      validator(value) {
        return ['draft', 'published', 'archived'].includes(value)
      },
    },
  })
</script>
```

### 4.2. 结合 TypeScript

如果你在用 TypeScript，也可以直接用类型声明：

```html
<script setup lang="ts">
  interface Props {
    title: string
    author?: string
    pageSize?: number
  }

  const props = defineProps<Props>()
</script>
```

如果是可选属性，还想给默认值，通常会配合 `withDefaults()`：

```html
<script setup lang="ts">
  interface Props {
    title: string
    author?: string
    tags?: string[]
  }

  const props = withDefaults(defineProps<Props>(), {
    author: '匿名',
    tags: () => [],
  })
</script>
```

## 5. 🤔 父组件如何传递不同类型的 props？

Props 在模板里既可以传静态值，也可以传动态值。

- 纯字符串可以直接写
- 只要是 JavaScript 表达式，就要用 `v-bind`，也就是 `:`

```html
<template>
  <BlogPost
    title="静态标题"
    :likes="42"
    :is-published="true"
    :comment-ids="[1, 2, 3]"
    :author="{ name: 'Ada' }"
  />
</template>
```

这里看起来 `42`、`true`、数组、对象都是常量，但它们本质上仍然是 JavaScript 表达式，不是普通字符串，所以也要加 `:`。

如果你已经有一个对象，并且它的字段名正好和子组件 props 对应，还可以直接使用 `v-bind` 绑定整个对象：

```html
<script setup>
  const post = {
    title: 'Vue 组件通信',
    likes: 99,
  }
</script>

<template>
  <BlogPost v-bind="post" />
</template>
```

prop 名在声明时通常使用 camelCase：

```js
const { greetingMessage } = defineProps({
  greetingMessage: String,
})
```

但在模板上传递时则更推荐使用 kebab-case：

```html
<WelcomeCard :greeting-message="greetingMessage" />
```

如果你想要使用 Vue 3.4+ 提供的同名简写语法糖，在模板中也可以保持 camelCase：

```html
<WelcomeCard :greetingMessage />
```

## 6. 🤔 为什么说 props 是单向数据流？子组件应该如何正确使用 props？

Props 遵循的是单向数据流，也就是「父传子」，数据是父组件生产的，子组件作为消费方只有读的份儿，数据的维护权在父组件。

下面这种写法就是不对的：

```html
<script setup>
  const props = defineProps(['count'])

  // ❌ 错误做法：视图直接修改父组件传递过来的 props
  props.count++
</script>
```

Vue 会把 prop 视为只读数据，并在开发环境下给出警告。

虽然你无法直接修改 props，但你可以在子组件里基于 prop 创建一个本地状态来维护它的值，或者用计算属性来对 prop 做一次格式化或派生计算：

```html
<script setup>
  import { computed, ref } from 'vue'

  const props = defineProps({
    initialCount: Number,
    size: String,
  })

  // ✅ 正确做法：在子组件里基于 prop 创建一个本地状态来维护它的值
  const localCount = ref(props.initialCount)

  // ✅ 正确做法：用计算属性对 prop 做一次格式化或派生计算
  const normalizedSize = computed(() => {
    return props.size?.trim().toLowerCase()
  })
</script>
```

在上面的示例中，子组件没有直接修改来自父组件的 `props.initialCount`，而是创建了一个新的响应式变量 `localCount` 来维护它的值。同时，计算属性 `normalizedSize` 也没有修改 `props.size`，而是基于它进行了一些处理来得到一个新的值。这种做法是符合单向数据流原则的，同时也避免了直接修改 props 导致的潜在问题。

## 7. 🤔 Props 如何设置默认值和校验？

使用对象写法来定义 Props 最大的好处之一，就是可以把 prop 的约束写得更加完整。

- 默认值可以通过 `default` 字段设置
- 校验规则可以通过 `validator()` 函数设置

```html
<script setup>
  const props = defineProps({
    id: {
      type: [String, null],
      required: true,
    },
    pageSize: {
      type: Number,
      default: 20,
    },
    tags: {
      type: Array,
      default: () => [],
    },
    config: {
      type: Object,
      default: () => ({
        theme: 'light',
      }),
    },
    status: {
      type: String,
      validator(value, props) {
        return ['draft', 'published', 'archived'].includes(value)
      },
    },
  })
</script>
```

基本规则：

- 所有 prop 默认都是可选的，除非你写了 `required: true`
- 数组和对象的默认值必须通过工厂函数返回
  - 背后原因：因为引用类型共享地址，工厂函数创建独立副本，这么做可以防止多个组件实例之间互相污染
- `validator()` 返回 `true` 表示校验通过，当校验失败时，Vue 会在开发环境给出控制台警告
  - 注意：`validator()` 是哨兵，而不是门卫
  - 即便 `validator()` 验证失败，并不会影响传值，只是控制台多了条警告而已
  - Vue 的 `validator()` 定位是开发阶段的辅助提醒，而不是运行时的拦截器
- `defineProps()` 里的运行时配置不能访问 `<script setup>` 里后面定义的局部变量
  - 背后原因：因为 `defineProps()` 这个宏会在编译阶段被提升处理

## 8. 🤔 Boolean prop 为什么有特殊的转换规则？

如果一个 prop 被声明成 `Boolean`，Vue 会尽量让它的行为接近原生布尔属性。

```js
defineProps({
  disabled: Boolean,
})
```

这时：

```html
<MyButton disabled /> <MyButton />
```

等价于：

1. 第一种传入 `true`。
2. 第二种传入 `false`。

如果你显式写成：

```html
<MyButton :disabled="false" />
```

那自然就是 `false`。

当 Boolean 和 String 一起出现在联合类型里时，还要注意顺序问题：

```js
defineProps({
  disabled: [Boolean, String],
})
```

这种写法里，`<MyButton disabled />` 更倾向于按 Boolean 规则处理；而如果把顺序写成 `[String, Boolean]`，解析结果就可能变成空字符串，这一点在排查表单组件行为时很值得留意。

## 9. 🤔 响应式 Props 解构有哪些注意事项？

在 Vue 3.5+ 里，`defineProps()` 解构出来的变量在同一个 `<script setup>` 代码块中是具备响应式语义的：

```html
<script setup>
  const { foo } = defineProps(['foo'])

  watchEffect(() => {
    console.log(foo)
  })
</script>
```

这段代码在 3.5+ 中会随着 `foo` 变化而重新执行，因为编译器会把这里的 `foo` 转回 `props.foo` 来追踪依赖。

不过有一个边界不要忘：把解构得到的 prop 直接传给 `watch()` 之类需要「响应式数据源」的函数时，依然应该包成 getter：

```html
<script setup>
  const { foo } = defineProps(['foo'])

  watch(
    () => foo,
    (value) => {
      console.log(value)
    },
  )
</script>
```

如果你把 `foo` 直接传进去，传过去的只是当前值，不是一个可追踪的响应式来源。

## 10. 🔗 引用

- [Vue.js 官方文档 - Props][1]

[1]: https://cn.vuejs.org/guide/components/props.html
