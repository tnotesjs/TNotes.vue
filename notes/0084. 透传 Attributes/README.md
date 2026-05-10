# [0084. 透传 Attributes](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0084.%20%E9%80%8F%E4%BC%A0%20Attributes)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是透传 Attributes？什么时候会自动继承？](#3--什么是透传-attributes什么时候会自动继承)
- [4. 🤔 `class`、`style` 和 `v-on` 监听器会怎么透传？](#4--classstyle-和-v-on-监听器会怎么透传)
- [5. 🤔 为什么有时要禁用自动继承？](#5--为什么有时要禁用自动继承)
- [6. 🤔 多根节点组件为什么不会自动透传？](#6--多根节点组件为什么不会自动透传)
- [7. 🤔 `$attrs` 和 `useAttrs()` 有哪些注意事项？](#7--attrs-和-useattrs-有哪些注意事项)
- [8. 🔗 引用](#8--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 自动继承
- 样式合并
- 监听器继承
- inheritAttrs
- 多根节点
- useAttrs

## 2. 🫧 评价

透传 Attributes 是基础组件封装时很高频的细节，尤其是按钮、输入框、弹窗这类「外面包一层、里面还是真实元素」的组件，几乎一定会遇到。你不需要把它背成术语表，但一定要搞清楚哪些 attribute 会自动落到根元素、哪些会被 props / emits 消费、哪些场景要手动接管。

## 3. 🤔 什么是透传 Attributes？什么时候会自动继承？

所谓「透传 Attributes」，指的是父组件传给一个组件，但这个组件没有把它声明为 `props` 或 `emits` 的那部分 attribute 和 `v-on` 监听器。

最常见的就是：

1. `class`
2. `style`
3. `id`
4. `data-*`
5. `@click` 这种监听器

比如这个组件：

```html
<template>
  <button>Click Me</button>
</template>
```

父组件这样使用：

```html
<MyButton class="large" id="submit-btn" />
```

由于 `MyButton` 并没有把 `class` 和 `id` 声明成 `props`，Vue 就会把它们自动加到根元素 `<button>` 上。最终效果相当于：

```html
<button class="large" id="submit-btn">Click Me</button>
```

所以你可以先记住一个最核心的规则：当组件只有一个根元素时，未被声明消费掉的 attribute 会自动透传到这个根元素上。

## 4. 🤔 `class`、`style` 和 `v-on` 监听器会怎么透传？

`class` 和 `style` 不只是「原样替换」，而是会和子组件根元素自身已有的值合并。

```html
<template>
  <button class="btn" style="color: red">Click Me</button>
</template>
```

父组件这样传：

```html
<MyButton class="large" style="font-size: 18px" />
```

最终根元素会同时拥有两边的样式信息，而不是父组件把子组件原有值覆盖掉。

事件监听器的透传逻辑也类似：

```html
<MyButton @click="handleClick" />
```

如果 `MyButton` 的根元素是一个原生 `<button>`，那这个 `click` 监听器会直接挂到这个按钮上。用户点击按钮时，父组件的 `handleClick` 就会执行。

如果根节点本身渲染的是另一个组件，而不是原生元素，那么这些透传 attribute 还会继续往下传：

```html
<template>
  <BaseButton />
</template>
```

这时 `MyButton` 接收到的透传 attribute 会继续流向 `BaseButton`。

不过这里有个边界要注意：

1. 当前组件已经声明过的 `props` 不会出现在透传集合里。
2. 当前组件已经声明过的 `emits` 监听器也不会继续作为透传监听器下发。

换句话说，凡是被当前组件「正式接住」的输入，Vue 都会认为它已经被消费了，不再把它算进 `$attrs`。

## 5. 🤔 为什么有时要禁用自动继承？

自动透传虽然方便，但在封装基础组件时，经常会遇到一个现实问题：真正应该接收这些 attribute 的，不是根节点，而是根节点里面的某个内部元素。

比如你做了一个按钮包装组件：

```html
<template>
  <div class="btn-wrapper">
    <button class="btn">Click Me</button>
  </div>
</template>
```

如果不做处理，父组件传进来的 `class`、`id`、`@click` 都会默认落到外层 `<div>` 上，而很多时候你真正想要的是把它们加到内部的 `<button>` 上。

这时就应该禁用自动继承：

```html
<script setup>
  defineOptions({
    inheritAttrs: false,
  })
</script>

<template>
  <div class="btn-wrapper">
    <button class="btn" v-bind="$attrs">Click Me</button>
  </div>
</template>
```

这里的关键点有两个：

1. `inheritAttrs: false` 关闭默认自动透传。
2. `v-bind="$attrs"` 让你手动决定把透传 attribute 放到哪里。

这通常是封装「外面是包装层，里面才是真实交互元素」的组件时最常见的做法。

## 6. 🤔 多根节点组件为什么不会自动透传？

如果一个组件有多个根节点，Vue 就不知道该把透传 attribute 放到哪一个根节点上，所以不会自动处理。

```html
<template>
  <header>header</header>
  <main>content</main>
  <footer>footer</footer>
</template>
```

这时父组件这样写：

```html
<CustomLayout class="page-layout" />
```

Vue 会给出警告，因为它没法自动判断 `class` 应该挂在 `header`、`main` 还是 `footer`。

正确做法是你显式指定一个接收位置：

```html
<template>
  <header>header</header>
  <main v-bind="$attrs">content</main>
  <footer>footer</footer>
</template>
```

一旦你显式绑定了 `$attrs`，Vue 就知道该往哪里放，也就不会再警告。

## 7. 🤔 `$attrs` 和 `useAttrs()` 有哪些注意事项？

当你需要在模板或脚本里手动访问透传 attribute 时，可以用：

1. 模板中的 `$attrs`
2. `<script setup>` 里的 `useAttrs()`

```html
<script setup>
  import { useAttrs } from 'vue'

  const attrs = useAttrs()

  console.log(attrs.class)
  console.log(attrs.onClick)
  console.log(attrs['data-id'])
</script>
```

这里有几个细节要记住：

1. `foo-bar` 这种 attribute 名在 JavaScript 里不会自动转成 camelCase，需要写成 `attrs['foo-bar']`。
2. 事件监听器会暴露成类似 `onClick` 这样的字段。
3. `attrs` 会反映最新值，但它本身不是响应式对象，不能直接靠 `watch(attrs)` 来侦听变化。

所以如果你真正需要「响应式地感知某个输入变化」，更合适的做法通常是把它定义成明确的 prop，而不是寄希望于 `$attrs`。

## 8. 🔗 引用

- [Vue.js 官方文档 - 透传 Attributes][1]

[1]: https://cn.vuejs.org/guide/components/attrs.html
