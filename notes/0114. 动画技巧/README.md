# [0114. 动画技巧](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0114.%20%E5%8A%A8%E7%94%BB%E6%8A%80%E5%B7%A7)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 除了 `Transition` 和 `TransitionGroup`，Vue 里还有哪些动画思路？](#3-除了-transition-和-transitiongroupvue-里还有哪些动画思路)
- [4. 什么是基于 CSS class 的动画？](#4-什么是基于-css-class-的动画)
- [5. 什么是状态驱动动画，为什么它特别适合 Vue？](#5-什么是状态驱动动画为什么它特别适合-vue)
- [6. 什么时候该用侦听器接动画库？](#6-什么时候该用侦听器接动画库)
- [7. 引用](#7-引用)

<!-- endregion:toc -->

## 1. 本节内容

- CSS animation
- class 切换
- 状态驱动
- style 插值
- watch 动画
- GSAP
- 数值补间
- 选型原则

## 2. 评价

这一篇最大的意义是把“动画”从内置过渡组件里解放出来。`Transition` 和 `TransitionGroup` 主要解决进入、离开和列表重排，而真实业务里的很多动画其实只是状态变化、类名切换、样式插值或数字补间。Vue 的响应式系统让这些写法都非常自然。

## 3. 除了 `Transition` 和 `TransitionGroup`，Vue 里还有哪些动画思路？

官方这一页没有继续讲内置组件，而是给了 3 条更通用的路线：

1. 基于 CSS class 的动画
2. 基于状态驱动的动画
3. 基于侦听器联动动画库的动画

它们分别适合不同问题：

- 某个状态触发一次视觉反馈，用 class 切换就够了
- 某些样式需要随着状态连续变化，适合状态驱动
- 需要更复杂的时间轴、补间、缓动控制，适合接 GSAP 这类库

## 4. 什么是基于 CSS class 的动画？

如果元素本身不会进入或离开 DOM，而只是某个状态变化后需要抖动、闪烁、强调，那么没必要强行上 `Transition`。直接通过类名切换配合 CSS 动画即可。

```html
<script setup>
  import { ref } from 'vue'

  const disabled = ref(false)

  function warnDisabled() {
    disabled.value = true

    setTimeout(() => {
      disabled.value = false
    }, 1500)
  }
</script>

<template>
  <div :class="{ shake: disabled }">
    <button @click="warnDisabled">Click me</button>
    <span v-if="disabled">This feature is disabled!</span>
  </div>
</template>

<style scoped>
  .shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }
</style>
```

这类动画实现简单、浏览器优化成熟，适合即时反馈类效果。

## 5. 什么是状态驱动动画，为什么它特别适合 Vue？

状态驱动动画的思路是：不是直接“操作动画”，而是修改响应式状态，让样式绑定自然插值。

```html
<script setup>
  import { ref } from 'vue'

  const x = ref(0)

  function onMousemove(event) {
    x.value = event.clientX
  }
</script>

<template>
  <div
    class="movearea"
    :style="{ backgroundColor: `hsl(${x}, 80%, 50%)` }"
    @mousemove="onMousemove"
  >
    <p>Move your mouse across this div...</p>
    <p>x: {{ x }}</p>
  </div>
</template>

<style scoped>
  .movearea {
    transition: 0.3s background-color ease;
  }
</style>
```

这里并没有直接写动画控制逻辑，而是让颜色跟着状态变化，CSS 负责补间。

这特别适合 Vue，因为：

- 状态变化天然就是响应式的
- 样式绑定本来就是声明式的
- 动画逻辑可以继续保持“状态驱动 UI”的统一思维

除了颜色，这种方式同样适合：

- `transform`
- 宽高变化
- SVG attribute
- 一些基于物理模拟的可视化参数

## 6. 什么时候该用侦听器接动画库？

如果动画目标不是简单 CSS 可处理的样式变化，而是：

- 数值补间
- 复杂时间轴
- 精细缓动控制
- 第三方动画生态集成

那么就可以用 `watch()` 监听响应式状态，再把变化交给 GSAP 之类的库。

```html
<script setup>
  import { reactive, ref, watch } from 'vue'
  import gsap from 'gsap'

  const number = ref(0)
  const tweened = reactive({
    number: 0,
  })

  watch(number, (nextValue) => {
    gsap.to(tweened, {
      duration: 0.5,
      number: Number(nextValue) || 0,
    })
  })
</script>

<template>
  <input v-model.number="number" type="number" />
  <p>{{ tweened.number.toFixed(0) }}</p>
</template>
```

这里用户输入的原始数字不直接显示，而是先经过 GSAP 补间，再渲染过渡中的值。

官方还特别提醒：如果数值超过 `Number.MAX_SAFE_INTEGER`，JavaScript 数字精度本身就会带来不准确问题。

实际选型时，可以这么理解：

- 进入离开动画：优先 `Transition` / `TransitionGroup`
- 短促反馈类动画：优先 class 切换
- 持续变化的样式：优先状态驱动
- 复杂补间和时间轴：用 `watch()` 接动画库

## 7. 引用

- [Vue.js 官方文档 - 动画技巧][1]
- [Vue.js 官方文档 - Transition][2]
- [Vue.js 官方文档 - TransitionGroup][3]
- [GSAP][4]

[1]: https://cn.vuejs.org/guide/extras/animation.html
[2]: https://cn.vuejs.org/guide/built-ins/transition.html
[3]: https://cn.vuejs.org/guide/built-ins/transition-group.html
[4]: https://gsap.com/
