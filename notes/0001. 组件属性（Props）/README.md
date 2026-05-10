# [0001. 组件属性（Props）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0001.%20%E7%BB%84%E4%BB%B6%E5%B1%9E%E6%80%A7%EF%BC%88Props%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Props 是什么？父组件如何把数据传给子组件？](#3--props-是什么父组件如何把数据传给子组件)
- [4. 🤔 Props 应该如何声明？](#4--props-应该如何声明)
- [5. 🤔 父组件如何传递不同类型的 props？](#5--父组件如何传递不同类型的-props)
- [6. 🤔 为什么说 props 是单向数据流？如果我想改它怎么办？](#6--为什么说-props-是单向数据流如果我想改它怎么办)
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

最常见的使用方式如下：

::: code-group

```html [App.vue]
<template>
  <UserCard name="Ada" :age="18" :is-vip="true" :tags="['Vue', 'TypeScript']" />
</template>

<script setup>
  import UserCard from './UserCard.vue'
</script>
```

```html [UserCard.vue]
<template>
  <article class="card">
    <h3>{{ props.name }}</h3>
    <p>年龄：{{ props.age }}</p>
    <p>会员：{{ props.isVip ? '是' : '否' }}</p>
    <p>标签：{{ props.tags.join('、') }}</p>
  </article>
</template>

<script setup>
  const props = defineProps({
    name: String,
    age: Number,
    isVip: Boolean,
    tags: Array,
  })
</script>
```

:::

这里你可以先记住一句话：

1. 父组件负责提供数据。
2. 子组件负责声明自己接收哪些数据。
3. 未被声明的 attribute 不会自动变成 prop，而是会按透传 attribute 规则处理。

## 4. 🤔 Props 应该如何声明？

在 Vue 3 的 `<script setup>` 中，最常见的声明方式是使用 `defineProps()`。

如果不用 `<script setup>`，本质上还是通过组件的 `props` 选项来声明；`defineProps()` 只是 `<script setup>` 下对应的编译宏。

最简单的写法是字符串数组：

```html
<script setup>
  const props = defineProps(['title', 'author'])
</script>
```

这种写法适合快速演示，但在真实项目里更推荐对象写法，因为它可以顺手把类型、是否必填、默认值和校验规则都写清楚：

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

1. 纯字符串可以直接写。
2. 只要是 JavaScript 表达式，就要用 `v-bind`，也就是 `:`。

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

如果你已经有一个对象，并且它的字段名正好和子组件 props 对应，还可以直接把整个对象展开过去：

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

另外，prop 名在声明时通常使用 camelCase，但在模板上传递时更推荐使用 kebab-case：

```js
defineProps({
  greetingMessage: String,
})
```

```html
<WelcomeCard greeting-message="hello" />
```

## 6. 🤔 为什么说 props 是单向数据流？如果我想改它怎么办？

Props 遵循的是单向数据流，也就是「父传子」。父组件更新后，子组件里的 props 会同步刷新到最新值；但子组件不应该反过来直接改 props。

下面这种写法就是不对的：

```html
<script setup>
  const props = defineProps(['count'])

  props.count++
</script>
```

Vue 会把 prop 视为只读数据，并在开发环境下给出警告。

你真正想「修改 prop」时，通常是下面两种需求：

1. 把 prop 当成初始值，后续在子组件内部自己维护。
2. 基于 prop 再做一次格式化或派生计算。

这两种场景的推荐写法分别是本地状态和计算属性：

```html
<script setup>
  import { computed, ref } from 'vue'

  const props = defineProps({
    initialCount: Number,
    size: String,
  })

  const localCount = ref(props.initialCount)

  const normalizedSize = computed(() => {
    return props.size?.trim().toLowerCase()
  })
</script>
```

还有一个边界要知道：如果传入的是对象或数组，子组件虽然不能替换整个 prop 绑定，但仍然能修改它内部的内容，因为 JavaScript 对象和数组是按引用传递的。这种写法不是语法错误，但通常会让数据流变得不透明，所以除非父子组件就是强耦合设计，否则尽量别这么做。

## 7. 🤔 Props 如何设置默认值和校验？

对象写法最大的好处之一，就是可以把 prop 的约束写完整。

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

这里有几个高频规则：

1. 所有 prop 默认都是可选的，除非你写了 `required: true`。
2. 数组和对象的默认值必须通过工厂函数返回。
3. `validator()` 返回 `true` 才表示校验通过。
4. 校验失败时，Vue 会在开发环境给出控制台警告。

还有一个经常被忽略的限制：`defineProps()` 里的运行时配置不能访问 `<script setup>` 里后面定义的局部变量，因为这个宏会在编译阶段被提升处理。

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
