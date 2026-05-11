# [0087. 组件 v-model](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0087.%20%E7%BB%84%E4%BB%B6%20v-model)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 组件上的 `v-model` 到底是什么？](#3--组件上的-v-model-到底是什么)
- [4. 🤔 `defineModel()` 是什么？](#4--definemodel-是什么)
- [5. 🤔 如何使用带参数的 `v-model`？](#5--如何使用带参数的-v-model)
- [6. 🤔 一个组件里可以同时存在多个 `v-model` 吗？](#6--一个组件里可以同时存在多个-v-model-吗)
- [7. 🤔 `v-model` 修饰符在组件上应该怎么处理？](#7--v-model-修饰符在组件上应该怎么处理)
- [8. 🤔 使用 `defineModel()` 时有哪些边界和注意事项？](#8--使用-definemodel-时有哪些边界和注意事项)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 双向绑定
- defineModel
- 底层机制
- 参数绑定
- 多个模型
- 修饰符

## 2. 🫧 评价

组件上的 `v-model` 本质上还是 prop + 事件这一套，只不过 Vue 帮你把常见模式封装成了统一语法。你真正要掌握的是它的展开规则、参数写法、多模型绑定和修饰符处理，这样无论是用 `defineModel()` 还是手写旧写法，都不会被语法糖带偏。

## 3. 🤔 组件上的 `v-model` 到底是什么？

你在原生表单元素上已经见过 `v-model`，它表示把「当前值」和「更新动作」绑定在一起。组件上的 `v-model` 也是同一件事，只不过绑定对象从原生元素变成了自定义组件。

从 Vue 3.4 开始，官方推荐你使用 `defineModel()` 来实现组件级 `v-model`：

::: code-group

```html [BaseInput.vue]
<template>
  <input v-model="model" />
</template>

<script setup>
  const model = defineModel()
</script>
```

```html [App.vue]
<template>
  <BaseInput v-model="keyword" />
  <p>keyword: {{ keyword }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import BaseInput from './BaseInput.vue'

  const keyword = ref('Vue')
</script>
```

:::

这里的 `model` 是一个 ref，它的值会和父组件 `v-model` 绑定的值同步，当你在子组件里改 `model.value`，父组件绑定的数据也会更新。

组件级的 `v-model` 和表单输入绑定中的 `v-model` 类似，都是把 `v-bind`「接收值」和 `v-on`「通知更新」这两个动作捏成了一个更顺手的 API。

## 4. 🤔 `defineModel()` 是什么？

`defineModel()` 是一个编译宏，本质上是语法糖。默认情况下，它会帮你生成两部分内容：

1. 一个名为 `modelValue` 的 prop。
2. 一个名为 `update:modelValue` 的事件。

```html
<!-- 写法 1：语法糖 -->
<template>
  <input v-model="model" />
</template>

<script setup>
  const model = defineModel()
</script>

<!-- 写法 2：底层写法 -->
<template>
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
  const props = defineProps(['modelValue'])
  const emit = defineEmits(['update:modelValue'])
</script>
```

写法 1 和写法 2 是等价的。`defineModel()` 的作用就是帮你把写法 2 里「定义 prop、定义事件、写绑定逻辑」这三步都自动生成出来。

对应地，父组件中使用 `v-model`：

```html
<!-- 语法糖 -->
<Child v-model="title" />

<!-- 对应的底层写法 -->
<Child :modelValue="title" @update:modelValue="(value) => (title = value)" />
```

开发建议：

- 如果你使用的版本是 Vue 3.4+，优先使用 `defineModel()`，它可以让组件 `v-model` 的实现更简洁。
- 如果你维护的项目还在 Vue 3.3 或更早版本，直接使用对应的底层写法也完全没问题。

在排查组件 `v-model` 异常时，不要只盯着语法糖看，直接退回到 `prop + emit` 这个底层模型，思路会清楚很多。

## 5. 🤔 如何使用带参数的 `v-model`？

组件上的 `v-model` 不一定只能绑定 `modelValue`。你可以通过参数指定绑定哪一个字段。

父组件这样写：

```html
<BookEditor v-model:title="bookTitle" />
```

子组件可以这样接：

```html
<template>
  <input v-model="title" />
</template>

<script setup>
  const title = defineModel('title')
</script>
```

这时它底层对应的是：

1. prop 名变成 `title`
2. 事件名变成 `update:title`

如果你还想顺手给这个模型字段加约束，也可以继续传配置对象：

```js
const title = defineModel('title', {
  required: true,
})
```

这个参数写法很适合那些一个组件里本来就有多个「可双向绑定字段」的场景，比如表单组件、筛选器组件、日期范围组件等。

## 6. 🤔 一个组件里可以同时存在多个 `v-model` 吗？

可以，而且这正是参数式 `v-model` 的典型用法。

```html
<template>
  <input v-model="firstName" placeholder="first name" />
  <input v-model="lastName" placeholder="last name" />
</template>

<script setup>
  const firstName = defineModel('firstName')
  const lastName = defineModel('lastName')
</script>
```

父组件就可以这样绑定：

```html
<UserName v-model:first-name="first" v-model:last-name="last" />
```

这样做的好处是非常明确：每个 `v-model` 都绑定一个独立字段，不需要你再把多个值硬塞进同一个对象里去拆。

## 7. 🤔 `v-model` 修饰符在组件上应该怎么处理？

原生输入元素支持 `.trim`、`.number`、`.lazy` 这些修饰符。组件上的 `v-model` 也支持修饰符，只是要由你在子组件里主动处理。

你可以通过解构 `defineModel()` 的返回值拿到修饰符对象：

```html
<script setup>
  const [model, modifiers] = defineModel()

  console.log(modifiers)
  // 比如父组件写了 v-model.capitalize
  // 这里会得到 { capitalize: true }
</script>
```

如果你想根据修饰符改变写入逻辑，可以使用 `set`：

```html
<script setup>
  const [model, modifiers] = defineModel({
    set(value) {
      if (modifiers.capitalize) {
        return value.charAt(0).toUpperCase() + value.slice(1)
      }

      return value
    },
  })
</script>

<template>
  <input v-model="model" />
</template>
```

父组件可以这样使用：

```html
<MyInput v-model.capitalize="text" />
```

如果是带参数的 `v-model`，同样也能拿到对应模型字段自己的修饰符。

## 8. 🤔 使用 `defineModel()` 时有哪些边界和注意事项？

第一，`defineModel()` 是 Vue 3.4+ 的写法。如果你维护的是旧项目，可能还会看到手写 `modelValue` 和 `update:modelValue` 的实现，这不是「过时错误」，只是版本差异。

第二，如果你给 `defineModel()` 配了 `default`，但父组件没有提供任何值，就可能出现父子两端初始值不同步的问题。

```html
<script setup>
  const model = defineModel({
    default: 1,
  })
</script>
```

如果父组件绑定的是一个初始值为 `undefined` 的 ref，那么子组件内部 `model` 会先拿到默认值 `1`，而父组件那边仍然是 `undefined`。这在初始化表单组件时很容易埋坑，所以要么让父组件显式给值，要么谨慎使用默认值。

第三，别把组件 `v-model` 理解成「谁都能随便改的共享状态」。它依然遵循组件边界，只不过默认约定了输入字段和更新事件名。

换句话说：

1. 需要自己定义输入字段时，用参数式 `v-model`。
2. 需要同时绑定多个字段时，用多个 `v-model`。
3. 需要处理输入值读写逻辑时，用修饰符配合 `get` / `set`。
4. 需要排错时，退回到底层的 prop + emit 模型去看。

## 9. 🔗 引用

- [Vue.js 官方文档 - 组件 v-model][1]

[1]: https://cn.vuejs.org/guide/components/v-model.html
