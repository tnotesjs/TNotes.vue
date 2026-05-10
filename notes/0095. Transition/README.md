# [0095. Transition](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0095.%20Transition)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `<Transition>` 解决的是什么问题？](#3--transition-解决的是什么问题)
- [4. 🤔 一次最基本的进入 / 离开过渡要怎么写？](#4--一次最基本的进入--离开过渡要怎么写)
- [5. 🤔 那 6 个过渡 class 分别在什么阶段生效？](#5--那-6-个过渡-class-分别在什么阶段生效)
- [6. 🤔 什么时候该用 `name`、`mode`、`appear` 和 `key`？](#6--什么时候该用-namemodeappear-和-key)
  - [6.1. `name`](#61-name)
  - [6.2. `mode`](#62-mode)
  - [6.3. `appear`](#63-appear)
  - [6.4. `key`](#64-key)
- [7. 🤔 JavaScript 钩子适合解决什么问题？](#7--javascript-钩子适合解决什么问题)
- [8. 🤔 使用 `<Transition>` 时有哪些性能和结构注意点？](#8--使用-transition-时有哪些性能和结构注意点)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 作用场景
- 基本写法
- 六个类名
- 命名过渡
- 模式切换
- JS 钩子
- key 过渡
- 性能优化

## 2. 🫧 评价

`<Transition>` 属于非常实用的内置组件，尤其在弹层、切页、动态组件切换时很常见。你最该掌握的是「它只包一个节点」「6 个 class 的阶段意义」「`mode`、`key`、JS 钩子的边界」，其余像可复用过渡组件可以先混个脸熟。

## 3. 🤔 `<Transition>` 解决的是什么问题？

`<Transition>` 用来给“进入 DOM”或“离开 DOM”的元素 / 组件添加过渡效果。

它能接住的典型触发场景有这些：

- `v-if` 切换
- `v-show` 切换
- 动态组件 `<component :is="...">` 切换
- 带 `key` 的节点替换

先记住一个核心前提：`<Transition>` 处理的是“切换”，不是普通样式动画。也就是说，得先有节点的进入、离开或替换，它才有用武之地。

另外它有一个非常重要的结构限制：默认插槽里只能有一个直接子元素或一个单根组件。

```vue
<Transition>
  <p v-if="visible">hello</p>
</Transition>
```

如果你往里面塞多个并列根节点，它就不知道该给谁套过渡流程了。

## 4. 🤔 一次最基本的进入 / 离开过渡要怎么写？

最常见的写法是 `v-if + <Transition> + CSS class`。

```vue
<template>
  <button @click="visible = !visible">切换</button>

  <Transition>
    <p v-if="visible">Hello Vue Transition</p>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(true)
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
```

这个例子里，Vue 会在元素进入和离开时自动加上对应 class，你只负责写 CSS。

如果检测到元素上有 CSS `transition` 或 `animation`，Vue 就会等待对应结束事件；如果你还监听了 JS 钩子，它也会在合适阶段调用。要是两者都没有，DOM 会在下一帧直接插入或移除，看起来就像没有动画。

## 5. 🤔 那 6 个过渡 class 分别在什么阶段生效？

这是 `<Transition>` 最值得吃透的一组规则。

进入阶段有 3 个 class：

- `v-enter-from`：进入前的起始状态
- `v-enter-active`：整个进入阶段都有效
- `v-enter-to`：进入后的结束状态

离开阶段也有 3 个：

- `v-leave-from`：离开前的起始状态
- `v-leave-active`：整个离开阶段都有效
- `v-leave-to`：离开后的结束状态

最常见的心智模型可以这样记：

- `from` 决定“从哪儿开始”
- `to` 决定“要到哪儿结束”
- `active` 决定“动画以什么节奏跑”

例如一个滑入淡出的效果：

```css
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
```

这里你会看到一个很实用的技巧：进入和离开完全可以使用不同的时长和速度曲线。

## 6. 🤔 什么时候该用 `name`、`mode`、`appear` 和 `key`？

这几个属性分别解决不同问题。

### 6.1. `name`

当你不想使用默认的 `v-` 前缀时，可以给过渡命名：

```vue
<Transition name="fade">
  <p v-if="visible">hello</p>
</Transition>
```

这样 class 就会变成：

- `fade-enter-from`
- `fade-enter-active`
- `fade-enter-to`
- `fade-leave-from`
- `fade-leave-active`
- `fade-leave-to`

这在同一个页面里有多套动画时非常有用。

### 6.2. `mode`

当你在互斥元素之间切换时，如果不加模式，进入和离开往往是同时发生的。这可能导致布局冲突。

```vue
<Transition mode="out-in">
  <button v-if="saved">Edit</button>
  <button v-else>Save</button>
</Transition>
```

`mode="out-in"` 的意思是：先等旧节点离开，再让新节点进入。这个最常用。

`mode="in-out"` 也支持，但实际项目里少很多。

### 6.3. `appear`

如果你希望组件“首次渲染”时也执行过渡，可以加 `appear`：

```vue
<Transition appear>
  <div>首次加载时也有动画</div>
</Transition>
```

### 6.4. `key`

有时你看起来是在“更新文本”，但 Vue 只是复用了同一个元素，这时不会触发过渡。给节点加 `key` 后，Vue 会把它当成新旧两个元素进行替换。

```vue
<template>
  <Transition>
    <span :key="count">{{ count }}</span>
  </Transition>
</template>
```

这在数字滚动、标题切换、状态标签切换时非常常见。

## 7. 🤔 JavaScript 钩子适合解决什么问题？

当 CSS 已经够用时，优先 CSS。JS 钩子主要适合这些场景：

- 你要接入 GSAP、Anime.js 这类动画库
- 你要按业务逻辑精细控制动画时机
- 你要做渐进式序列动画或复杂时间轴

```vue
<Transition
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @after-enter="onAfterEnter"
  @before-leave="onBeforeLeave"
  @leave="onLeave"
  @after-leave="onAfterLeave"
>
  <div v-if="visible">hello</div>
</Transition>
```

```js
function onBeforeEnter(el) {}

function onEnter(el, done) {
  done()
}

function onAfterEnter(el) {}

function onBeforeLeave(el) {}

function onLeave(el, done) {
  done()
}

function onAfterLeave(el) {}
```

如果你打算完全用 JavaScript 驱动动画，最好显式加上 `:css="false"`：

```vue
<Transition :css="false" @enter="onEnter" @leave="onLeave">
  <div v-if="visible">hello</div>
</Transition>
```

这样 Vue 就不会再去探测 CSS 过渡，也能避免 CSS 规则误伤 JS 动画。在这种模式下，`done` 回调就很关键，你必须在合适时机调用它，否则过渡不会被正确结束。

## 8. 🤔 使用 `<Transition>` 时有哪些性能和结构注意点？

先说性能。

动画优先考虑 `transform` 和 `opacity`，因为它们通常不会触发布局重排，浏览器优化空间也更大。像 `height`、`margin` 这种会牵动布局的属性，成本更高，能不用尽量不用。

再说结构边界。

1. 同一时间只处理一个直接子节点。
2. 嵌套过渡如果有延迟，可能要手动通过 `duration` 指定总时长。
3. 同时使用 CSS `transition` 和 `animation` 时，必要时通过 `type` 明确告诉 Vue 应该监听哪种结束事件。
4. 如果你想让某套动画在多个地方复用，可以把 `<Transition>` 再包成一个普通组件。

```vue
<template>
  <Transition name="fade" mode="out-in">
    <slot />
  </Transition>
</template>
```

另外，`<Transition>` 不只用于元素，也常用于动态组件切换：

```vue
<Transition name="fade" mode="out-in">
  <component :is="activeComponent" />
</Transition>
```

这类用法和路由页面切换结合得非常多。

## 9. 🔗 引用

- [Vue.js 官方文档 - Transition][1]
- [Vue.js 官方文档 - `<Transition>` API][2]
- [MDN - Using CSS transitions][3]
- [MDN - Using CSS animations][4]

[1]: https://cn.vuejs.org/guide/built-ins/transition.html
[2]: https://cn.vuejs.org/api/built-in-components.html#transition
[3]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions
[4]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations
