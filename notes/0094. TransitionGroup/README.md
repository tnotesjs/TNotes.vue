# [0094. TransitionGroup](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0094.%20TransitionGroup)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `<TransitionGroup>` 和 `<Transition>` 到底差在哪？](#3--transitiongroup-和-transition-到底差在哪)
- [4. 🤔 列表的进入 / 离开动画要怎么写？](#4--列表的进入--离开动画要怎么写)
- [5. 🤔 为什么列表重排时会“跳”，移动动画怎么补上？](#5--为什么列表重排时会跳移动动画怎么补上)
- [6. 🤔 `moveClass` 和 JavaScript 钩子各自适合什么场景？](#6--moveclass-和-javascript-钩子各自适合什么场景)
- [7. 🤔 使用 `<TransitionGroup>` 时最容易踩什么坑？](#7--使用-transitiongroup-时最容易踩什么坑)
  - [7.1. 忘了写稳定 `key`](#71-忘了写稳定-key)
  - [7.2. 误以为它和 `<Transition>` 完全一样](#72-误以为它和-transition-完全一样)
  - [7.3. 只写 enter / leave，没写 move](#73-只写-enter--leave没写-move)
  - [7.4. 没处理离开项的定位](#74-没处理离开项的定位)
  - [7.5. 需要容器却忘了 `tag`](#75-需要容器却忘了-tag)
- [8. 🔗 引用](#8--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 组件区别
- 列表过渡
- 元素移动
- moveClass
- JS 钩子
- 渐进延迟
- tag 容器
- key 要求

## 2. 🫧 评价

`<TransitionGroup>` 的核心不多，但非常容易写出“能运行、却不丝滑”的列表动画。你需要重点理解它和 `<Transition>` 的差异、为什么列表重排需要额外的移动动画，以及为什么每一项必须提供稳定的 `key`。

## 3. 🤔 `<TransitionGroup>` 和 `<Transition>` 到底差在哪？

`<TransitionGroup>` 是给 `v-for` 列表准备的过渡组件，用来处理这三类变化：

- 列表项进入
- 列表项离开
- 列表项顺序变化

它和 `<Transition>` 很像，但有几个关键差异必须记牢：

1. `<TransitionGroup>` 面向列表，不是单节点切换。
2. 默认不会渲染额外容器；如果你需要容器，可以通过 `tag` 指定。
3. 列表中的每一项都必须有唯一 `key`。
4. 过渡 class 会加在列表项本身，而不是容器上。
5. `mode` 在这里不可用，因为它不是互斥切换。

```vue
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">
    {{ item.label }}
  </li>
</TransitionGroup>
```

简单来说：

- 单节点切换，用 `<Transition>`。
- 列表增删改排，用 `<TransitionGroup>`。

## 4. 🤔 列表的进入 / 离开动画要怎么写？

最基础的写法和 `<Transition>` 很接近，仍然是 `name + CSS class`。

```vue
<template>
  <button @click="addItem">添加</button>

  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item">
      {{ item }}
    </li>
  </TransitionGroup>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([1, 2, 3])

const addItem = () => {
  items.value.push(items.value.length + 1)
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

这里的进入和离开 class 规则与 `<Transition>` 基本一致，只是作用对象变成了列表中的每一项。

## 5. 🤔 为什么列表重排时会“跳”，移动动画怎么补上？

这是 `<TransitionGroup>` 最关键的知识点。

列表里插入或删除某一项时，周围元素的位置通常会立刻重排。如果你只写 enter / leave 动画，其他项会直接跳到新位置，看起来很生硬。

要让“位置变化”也有动画，你需要为移动中的元素提供 `*-move` 规则。

```css
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
```

这里有两个重点：

- `list-move` 用来处理“留下来的元素移动到新位置”的动画。
- 离开的元素通常要设置 `position: absolute`，让它脱离文档流，否则 Vue 很难正确计算其余元素的移动轨迹。

换句话说，列表动画不只是“新项进来、旧项出去”，还包括“中间项如何平滑挪位”。

## 6. 🤔 `moveClass` 和 JavaScript 钩子各自适合什么场景？

如果默认的 `name-move` 不够用，你可以通过 `moveClass` 自定义移动 class：

```vue
<TransitionGroup name="list" move-class="card-move">
  <div v-for="item in items" :key="item.id">
    {{ item.title }}
  </div>
</TransitionGroup>
```

这适合已有动画命名体系，或者你要接第三方 CSS 库时统一类名。

如果你要做“渐进延迟列表动画”，JavaScript 钩子会更灵活。官方示例就是通过元素上的 `data-index` 给每一项添加不同延迟。

```vue
<TransitionGroup
  tag="ul"
  :css="false"
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @leave="onLeave"
>
  <li
    v-for="(item, index) in items"
    :key="item.id"
    :data-index="index"
  >
    {{ item.label }}
  </li>
</TransitionGroup>
```

```js
function onEnter(el, done) {
  const delay = Number(el.dataset.index) * 150

  setTimeout(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateX(0)'
    done()
  }, delay)
}
```

所以可以这样选：

- 纯列表过渡，用 CSS。
- 有顺序感、节奏感、时间轴需求，用 JS 钩子。

## 7. 🤔 使用 `<TransitionGroup>` 时最容易踩什么坑？

最常见的坑基本就这几类：

### 7.1. 忘了写稳定 `key`

没有唯一 `key`，Vue 无法正确识别谁进、谁出、谁在移动，动画结果会非常混乱。

### 7.2. 误以为它和 `<Transition>` 完全一样

它们很像，但 `<TransitionGroup>` 没有 `mode`，也不是处理单节点互斥切换的。

### 7.3. 只写 enter / leave，没写 move

这会导致列表项重排时瞬移，看起来像掉帧。

### 7.4. 没处理离开项的定位

如果离开项还留在布局流里，其他项的位移计算会受影响，动画容易抖。

### 7.5. 需要容器却忘了 `tag`

默认情况下它不渲染容器。如果你依赖语义标签或布局容器，比如 `ul`、`div`，记得显式写 `tag`。

## 8. 🔗 引用

- [Vue.js 官方文档 - TransitionGroup][1]
- [Vue.js 官方文档 - Transition][2]
- [Vue.js 官方文档 - `<TransitionGroup>` API][3]

[1]: https://cn.vuejs.org/guide/built-ins/transition-group.html
[2]: https://cn.vuejs.org/guide/built-ins/transition.html
[3]: https://cn.vuejs.org/api/built-in-components.html#transitiongroup
