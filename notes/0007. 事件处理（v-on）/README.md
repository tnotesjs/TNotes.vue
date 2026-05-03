# [0007. 事件处理（v-on）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0007.%20%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%EF%BC%88v-on%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是 `v-on` 指令？](#3--什么是-v-on-指令)
- [4. 🤔 内联事件处理和事件处理函数有什么区别？](#4--内联事件处理和事件处理函数有什么区别)
  - [4.1. 内联表达式](#41-内联表达式)
  - [4.2. 事件处理函数](#42-事件处理函数)
- [5. 🤔 如何在事件处理函数中获取原生事件对象 `$event`？](#5--如何在事件处理函数中获取原生事件对象-event)
  - [5.1. 方法引用方式](#51-方法引用方式)
  - [5.2. 内联调用方式](#52-内联调用方式)
- [6. 🤔 什么是事件修饰符？](#6--什么是事件修饰符)
  - [6.1. `.stop`](#61-stop)
  - [6.2. `.prevent`](#62-prevent)
  - [6.3. `.self`](#63-self)
  - [6.4. `.capture`](#64-capture)
  - [6.5. `.once`](#65-once)
  - [6.6. `.passive`](#66-passive)
- [7. 🤔 `.passive` 修饰符为何能够提升滚动性能？](#7--passive-修饰符为何能够提升滚动性能)
  - [7.1. 滚动事件的阻塞机制](#71-滚动事件的阻塞机制)
  - [7.2. passive 的作用](#72-passive-的作用)
  - [7.3. Vue 中的用法](#73-vue-中的用法)
  - [7.4. 为什么能提升性能？](#74-为什么能提升性能)
  - [7.5. 为什么移动端推荐设置 passive？](#75-为什么移动端推荐设置-passive)
  - [7.6. Vue 只负责参数传递，浏览器内核负责行为解析](#76-vue-只负责参数传递浏览器内核负责行为解析)
  - [7.7. 小结](#77-小结)
- [8. 🤔 什么是按键修饰符？](#8--什么是按键修饰符)
  - [8.1. `.enter`](#81-enter)
  - [8.2. `.tab`](#82-tab)
  - [8.3. `.delete`](#83-delete)
  - [8.4. `.esc`](#84-esc)
  - [8.5. `.space`](#85-space)
  - [8.6. `.up`、`.down`、`.left`、`.right`](#86-updownleftright)
  - [8.7. 系统修饰键（`.ctrl`、`.alt`、`.shift`、`.meta`）](#87-系统修饰键ctrlaltshiftmeta)
  - [8.8. `.exact`](#88-exact)
- [9. 🤔 什么是鼠标按键修饰符？](#9--什么是鼠标按键修饰符)
- [10. 🤔 绑定事件时有哪些最佳实践？](#10--绑定事件时有哪些最佳实践)
  - [10.1. 优先使用方法引用](#101-优先使用方法引用)
  - [10.2. 合理使用事件修饰符](#102-合理使用事件修饰符)
  - [10.3. 根据场景选用合适的事件参数传递方式](#103-根据场景选用合适的事件参数传递方式)
- [11. 🔗 引用](#11--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `v-on` 指令的基本用法与缩写语法
- 内联表达式与事件处理函数的区别及选用场景
- 事件处理函数的两种调用方式：方法引用 与 内联调用
- 原生事件对象 `$event` 的获取方式（自动传入 / 显式传递）
- 事件修饰符：`.stop`、`.prevent`、`.self`、`.capture`、`.once`、`.passive`
- `.passive` 修饰符提升滚动性能的原理
- 按键修饰符：`.enter`、`.tab`、`.delete`、`.esc`、`.space`、方向键、系统修饰键（`.ctrl`、`.alt`、`.shift`、`.meta`）、`.exact`
- 鼠标按键修饰符：`.left`、`.middle`、`.right`
- 事件绑定的最佳实践

## 2. 🫧 评价

事件处理这一章其实挺简单的，因为在真实开发中，我们使用最为频繁的主要是 `@click` 事件，其它的使用频率都非常低。

关于事件修饰符，这些内容本质上是 JS 原生事件系统的知识，Vue 只是提供了更方便的语法糖来使用这些功能，如果你对原生 JS 的事件系统比较熟悉，相比这部分内容理解起来也并不难。就个人的开发习惯而言，在真实项目开发中，和事件修饰符相关的逻辑，往往首先想到的是通过原生 JS 来实现，而不是优先想到使用事件修饰符来实现（虽然啰嗦一丢丢，但更加灵活且更加直观），所以事件修饰符相关的内容在实际开发中的使用频率并不高，也属于比较边缘的知识点，往往是写完笔记就忘的差不多了。

## 3. 🤔 什么是 `v-on` 指令？

`v-on` 指令用于监听 DOM 事件，并在事件触发时执行对应的 JavaScript 代码。它是 Vue 中处理用户交互的核心方式。

```html {2}
<template>
  <button v-on:click="count++">点击次数：{{ count }}</button>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>
```

`v-on` 指令有一个常用的缩写语法 `@`，上面的写法等价于：

```html {2}
<template>
  <button @click="count++">点击次数：{{ count }}</button>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>
```

## 4. 🤔 内联事件处理和事件处理函数有什么区别？

- 内联表达式：直接在模板中编写 JavaScript 表达式，适合简单的逻辑。
- 事件处理函数：将事件处理逻辑封装在组件的方法中，适合复杂的操作，提升代码可读性和维护性。

### 4.1. 内联表达式

对于简单的逻辑，可以直接在模板中编写内联表达式：

```html {2}
<template>
  <button @click="count++">点击次数：{{ count }}</button>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>
```

内联表达式适合简单的操作，如自增、赋值等。如果逻辑稍微复杂，代码的可读性会迅速下降。

### 4.2. 事件处理函数

对于包含多步操作的逻辑，推荐使用方法引用：

```html
<template>
  <button @click="increment">点击次数：{{ count }}</button>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)

  function increment() {
    count.value++
    console.log('count 增加了')
    // 假设这里还有其他复杂逻辑...
  }
</script>
```

如果需要在调用方法时传入自定义参数，可以使用内联调用的方式：

```html
<template>
  <button @click="add(5)">+5</button>
  <button @click="add(10)">+10</button>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)

  function add(num) {
    count.value += num
  }
</script>
```

## 5. 🤔 如何在事件处理函数中获取原生事件对象 `$event`？

在 Vue 的事件处理中，很多时候需要访问原生的 DOM 事件对象。根据不同的使用场景，获取方式有所不同。

- 方法引用方式：隐式传入（自动注入到引用函数的第一个参数中）
- 内联调用方式：显式传入（在模板中通过特殊变量 `$event` 在显示传递）

### 5.1. 方法引用方式

当直接使用方法引用且不需要传入额外参数时，Vue 会自动将原生事件对象作为第一个参数传入：

```html
<template>
  <button @click="handleClick">点击</button>
</template>

<script setup>
  function handleClick(event) {
    // event 是原生 Event 对象
    console.log(event.target) // 按钮元素
    console.log(event.type) // 'click'
  }
</script>
```

### 5.2. 内联调用方式

当需要同时传入自定义参数和事件对象时，可以通过 `$event` 变量显式传递：

```html
<template>
  <button @click="handleClick('param', $event)">点击</button>
</template>

<script setup>
  function handleClick(param, event) {
    console.log(param) // 'param'
    console.log(event.target) // 按钮元素
    console.log(event.type) // 'click'
  }
</script>
```

`$event` 是 Vue 在模板中提供的一个特殊变量，始终指向当前触发事件的原生事件对象。

## 6. 🤔 什么是事件修饰符？

事件修饰符是以点号开头的指令后缀，用于对事件进行额外的控制。Vue 提供了多种事件修饰符来处理常见的 DOM 事件需求。

Vue 的 DOM 事件修饰符一共有 6 个：

| 事件修饰符 | 说明                   |
| ---------- | ---------------------- |
| `.stop`    | 阻止事件冒泡           |
| `.prevent` | 阻止默认行为           |
| `.self`    | 仅当事件源是自身时触发 |
| `.capture` | 使用捕获模式           |
| `.once`    | 仅触发一次             |
| `.passive` | 提升滚动性能           |

### 6.1. `.stop`

`.stop` 修饰符会阻止事件继续冒泡到父元素，等同于在原生 JS 中调用 `event.stopPropagation()`。当嵌套元素绑定相同事件时，子元素的触发会沿 DOM 树逐层向上冒泡，`.stop` 可以阻止这一行为。

没有 `.stop` 时，点击子元素会同时触发父元素的事件处理函数：

```html
<template>
  <div class="outer" @click="handleOuter">
    <button @click="handleInner">点击我</button>
  </div>
</template>

<script setup>
  function handleOuter() {
    console.log('外层 div 被触发')
  }

  function handleInner() {
    console.log('按钮被触发')
  }
</script>
```

点击按钮后控制台输出：

```
按钮被触发
外层 div 被触发
```

添加 `.stop` 修饰符后，冒泡被截断，父元素不再响应：

```html {3}
<template>
  <div class="outer" @click="handleOuter">
    <button @click.stop="handleInner">点击我</button>
  </div>
</template>

<script setup>
  function handleOuter() {
    console.log('外层 div 被触发')
  }

  function handleInner() {
    console.log('按钮被触发')
  }
</script>
```

点击按钮后控制台输出：

```
按钮被触发
```

### 6.2. `.prevent`

`.prevent` 修饰符会阻止元素的默认行为，等同于在原生 JS 中调用 `event.preventDefault()`。最常见的场景是阻止表单的默认提交行为（页面刷新）和链接的默认跳转行为。

没有 `.prevent` 时，点击提交按钮会触发表单的默认提交行为（页面刷新）：

```html
<template>
  <form @submit="handleSubmit">
    <input type="text" placeholder="请输入内容" />
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
  function handleSubmit() {
    console.log('表单已提交')
  }
</script>
```

点击提交后，控制台输出 `表单已提交`，但页面会立即刷新，控制台的日志一闪而过。

添加 `.prevent` 修饰符后，默认的提交行为被阻止，页面不再刷新：

```html {2}
<template>
  <form @submit.prevent="handleSubmit">
    <input type="text" placeholder="请输入内容" />
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
  function handleSubmit() {
    console.log('表单已提交')
  }
</script>
```

点击提交后，控制台输出 `表单已提交`，页面不会刷新。

另一个常见场景是阻止链接的默认跳转行为：

```html
<template>
  <a href="https://vuejs.org" @click.prevent="handleClick">Vue 官网</a>
</template>

<script setup>
  function handleClick() {
    console.log('链接被点击，但不会跳转')
  }
</script>
```

点击链接后，控制台输出 `链接被点击，但不会跳转`，页面不会跳转到 Vue 官网。

### 6.3. `.self`

`.self` 修饰符只在事件是从元素自身触发时（即 `event.target` 是绑定事件的元素本身）才执行处理函数，子元素触发的冒泡事件不会激活该处理函数。

没有 `.self` 时，点击内部的按钮会冒泡到外层 `div`，触发其事件处理函数：

```html
<template>
  <div @click="handleOuter">
    <button @click="handleInner">点击我</button>
  </div>
</template>

<script setup>
  function handleOuter() {
    console.log('外层 div 被触发')
  }

  function handleInner() {
    console.log('按钮被触发')
  }
</script>
```

点击按钮后控制台输出：

```
按钮被触发
外层 div 被触发
```

添加 `.self` 修饰符后，只有直接点击 `div` 自身才会触发，点击内部按钮不会触发：

```html {2}
<template>
  <div @click.self="handleOuter">
    <button @click="handleInner">点击我</button>
  </div>
</template>

<script setup>
  function handleOuter() {
    console.log('外层 div 被触发')
  }

  function handleInner() {
    console.log('按钮被触发')
  }
</script>
```

点击按钮后控制台输出：

```
按钮被触发
```

只有直接点击 `div` 的空白区域时，才会输出 `外层 div 被触发`。

注意：`.self` 不会阻止事件冒泡的传播，它只是忽略冒泡上来的事件，事件仍然会继续冒泡到更外层的祖先元素。

```html
<template>
  <div class="wrapper" @click="handleWrapper">
    <div class="outer" @click.self="handleOuter">
      <button @click="handleInner">点击我</button>
    </div>
  </div>
</template>

<script setup>
  function handleWrapper() {
    console.log('wrapper clicked')
  }

  function handleOuter() {
    console.log('外层 div 被触发')
  }

  function handleInner() {
    console.log('按钮被触发')
  }
</script>

<style scoped>
  .wrapper {
    padding: 1rem;
    background-color: #666;
  }
  .outer {
    padding: 1rem;
    background-color: #333;
  }
</style>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-22-12-01.png)

点击「点击我」按钮之后，控制台输出结果：

```
按钮被触发
wrapper clicked
```

### 6.4. `.capture`

Vue 事件默认使用冒泡模式（事件从最深层的元素向外层传播）。`.capture` 修饰符将事件监听切换为捕获模式，使事件从最外层元素向内层元素传播，即从外到内依次触发。

没有 `.capture` 时，事件按冒泡顺序从内到外触发：

```html
<template>
  <div @click="handleOuter">
    <div @click="handleInner">
      <button>点击我</button>
    </div>
  </div>
</template>

<script setup>
  function handleInner() {
    console.log('内层 div 被触发')
  }

  function handleOuter() {
    console.log('外层 div 被触发')
  }
</script>
```

点击按钮后控制台输出：

```
内层 div 被触发
外层 div 被触发
```

添加 `.capture` 修饰符后，外层元素在捕获阶段先于内层元素触发：

```html {2}
<template>
  <div @click.capture="handleOuter">
    <div @click="handleInner">
      <button>点击我</button>
    </div>
  </div>
</template>

<script setup>
  function handleInner() {
    console.log('内层 div 被触发')
  }

  function handleOuter() {
    console.log('外层 div 被触发')
  }
</script>
```

点击按钮后控制台输出：

```
外层 div 被触发
内层 div 被触发
```

触发顺序被反转了 => 外层 `div` 在捕获阶段最先响应。

### 6.5. `.once`

`.once` 修饰符让事件处理函数在触发一次之后自动移除，后续的相同事件不会再执行该处理函数。等同于在原生 JS 中调用 `addEventListener` 时设置 `{ once: true }`。

没有 `.once` 时，每次点击按钮都会触发事件处理函数：

```html
<template>
  <button @click="handleClick">点击我</button>
</template>

<script setup>
  function handleClick() {
    console.log('按钮被点击')
  }
</script>
```

多次点击按钮后控制台输出：

```
按钮被点击
按钮被点击
按钮被点击
```

添加 `.once` 修饰符后，只有第一次点击会触发，后续点击不再执行：

```html {2}
<template>
  <button @click.once="handleClick">点击我</button>
</template>

<script setup>
  function handleClick() {
    console.log('按钮被点击')
  }
</script>
```

多次点击按钮后控制台输出：

```
按钮被点击
```

常见使用场景包括：首次点击获取数据、一次性弹窗确认、初始化操作等只需要执行一次的逻辑。

### 6.6. `.passive`

`.passive` 修饰符会为事件监听器添加 `passive` 标志，告诉浏览器该监听器不会调用 `preventDefault()`。这允许浏览器在监听器执行之前就开始默认行为（如滚动），从而提升滚动场景下的性能。

没有 `.passive` 时，浏览器必须等待监听器执行完毕才能确认是否会调用 `preventDefault()`，这可能导致滚动卡顿：

```html
<template>
  <div class="scroll-area" @scroll="handleScroll">
    <p v-for="i in 100" :key="i">第 {{ i }} 行内容</p>
  </div>
</template>

<script setup>
  function handleScroll(event) {
    console.log('滚动位置：', event.target.scrollTop)
  }
</script>

<style scoped>
  .scroll-area {
    height: 200px;
    overflow-y: scroll;
    border: 1px solid #ddd;
    text-align: center;
  }
</style>
```

添加 `.passive` 修饰符后，浏览器知道该监听器不会阻止默认滚动行为，可以立即执行滚动：

```html {2}
<template>
  <div class="scroll-area" @scroll.passive="handleScroll">
    <p v-for="i in 100" :key="i">第 {{ i }} 行内容</p>
  </div>
</template>

<script setup>
  function handleScroll(event) {
    console.log('滚动位置：', event.target.scrollTop)
  }
</script>

<style scoped>
  .scroll-area {
    height: 200px;
    overflow-y: scroll;
    border: 1px solid #ddd;
    text-align: center;
  }
</style>
```

注意事项：`.passive` 修饰符尤其适用于 `scroll`、`touchstart`、`touchmove` 等涉及滚动的事件。与 `.prevent` 不能同时使用，因为 `.passive` 的语义就是“不会阻止默认行为”，同时使用二者会产生矛盾。

## 7. 🤔 `.passive` 修饰符为何能够提升滚动性能？

`.passive` 修饰符能提升滚动性能，核心原因是它改变了浏览器处理触摸/滚轮事件的方式，让页面滚动不再被 JavaScript 阻塞。

### 7.1. 滚动事件的阻塞机制

浏览器的默认滚动行为是这样的：

```
用户触摸屏幕/滚动滚轮
  → 触发 touchstart / wheel 事件
  → 执行 JavaScript 事件处理函数
  → 等待函数执行完毕
  → 确认没有调用 preventDefault() 后，才开始真正的页面滚动
```

关键问题在于：浏览器必须先执行完 JavaScript，才能知道你有没有在事件处理函数里调用了 `event.preventDefault()`。如果处理函数耗时较长（哪怕只有几十毫秒），页面滚动就会出现明显的卡顿延迟。

### 7.2. passive 的作用

当你给事件监听器加上 `passive: true` 后，等于提前告诉浏览器：“我保证不会调用 `event.preventDefault()`，你放心滚动就好，不用等我。”

此时处理流程变成：

```
用户触摸屏幕/滚动滚轮
  → 触发事件，同时浏览器立即开始页面滚动（无需等待 JS 执行）
  → JavaScript 事件处理函数并行执行（不阻塞滚动）
```

### 7.3. Vue 中的用法

```html
<!-- 不加 passive：滚动可能卡顿 -->
<div @scroll="handleScroll">...</div>

<!-- 加了 passive：滚动更流畅 -->
<div @scroll.passive="handleScroll">...</div>

<!-- 典型场景：移动端触摸滚动 -->
<div @touchmove.passive="handleTouchMove">...</div>
```

### 7.4. 为什么能提升性能？

一张对比表：

| 对比项             | 无 passive                | 有 passive               |
| ------------------ | ------------------------- | ------------------------ |
| 滚动启动时机       | JS 回调执行完成后         | 立即启动，与 JS 并行     |
| 滚动卡顿风险       | 高（JS 执行慢则滚动延迟） | 低（滚动不依赖 JS 完成） |
| `preventDefault()` | 可用                      | 不可用（调用也会被忽略） |
| 典型 FPS 影响      | 移动端可能掉到 30fps 以下 | 稳定 60fps               |

### 7.5. 为什么移动端推荐设置 passive？

- 实际开发中，会阻止页面滚动的场景很少见：一些移动端浏览器在 `touchstart` 和 `touchmove` 事件上默认会等待 JS 执行完毕，这么做是为了确保开发者如果编写了阻止页面滚动的逻辑能够正常生效。但很多场景下（如页面整体滚动、列表滑到底加载）开发者根本不会去阻止滚动的默认行为。
- 忽略滚动阻止的监听逻辑，能让滚动性能有显著提升：谷歌 Chrome 团队统计发现，移动端页面若将 `touchstart` 和 `touchmove` 监听器标记为 passive，页面滚动响应时间平均可减少 20% 以上。正是基于这个原因，Chrome 和 iOS Safari 等主流浏览器甚至将 `passive` 作为某些事件的默认行为。

### 7.6. Vue 只负责参数传递，浏览器内核负责行为解析

Vue 并没有重写或拦截 preventDefault，而是通过 `{ passive: true }` 告诉浏览器“你可以放心跳过 preventDefault 的检查”，浏览器自己在底层保证了这一点。

```
@click.scroll.passive="handleScroll"
         │
         ▼
Vue 模板编译器识别 .passive 修饰符
         │
         ▼
运行时调用 addEventListener('scroll', handler, { passive: true }) <- 原生 JS API
         │
         ▼
浏览器内核将该事件标记为 passive
         │
         ├─→ 滚动时不再等待监听器，立即执行默认行为（性能优化）
         │
         └─→ 如果 handler 内调用 preventDefault()，浏览器直接忽略
```

### 7.7. 小结

passive 修饰符 = 提前声明“我不阻止默认行为” -> 浏览器可以立即开始滚动 -> 用户感知的滚动更顺滑

如果你的滚动/触摸事件处理中不需要调用 `e.preventDefault()`，始终加上 `.passive`，几乎零成本就能获得性能提升。

## 8. 🤔 什么是按键修饰符？

按键修饰符用于监听特定的键盘按键事件，在需要处理键盘交互的场景中非常实用。通过按键修饰符，可以避免手动判断 `event.key` 的值，让模板更加简洁。

| 按键修饰符 | 说明                                                 |
| ---------- | ---------------------------------------------------- |
| `.enter`   | 回车键                                               |
| `.tab`     | Tab 键                                               |
| `.delete`  | 删除键（同时匹配 `Delete` 和 `Backspace`）           |
| `.esc`     | Escape 键                                            |
| `.space`   | 空格键                                               |
| `.up`      | 上方向键                                             |
| `.down`    | 下方向键                                             |
| `.left`    | 左方向键                                             |
| `.right`   | 右方向键                                             |
| `.ctrl`    | Ctrl 键                                              |
| `.alt`     | Alt 键                                               |
| `.shift`   | Shift 键                                             |
| `.meta`    | Meta 键（Mac 上为 Command，Windows 上为 Windows 键） |
| `.exact`   | 精确匹配修饰键组合（不包含其他修饰键）               |
| `...`      | ...                                                  |

### 8.1. `.enter`

`.enter` 修饰符监听回车键的按下事件，最常见的场景是输入框按回车提交内容。

```html
<template>
  <input
    v-model="inputValue"
    @keyup.enter="handleSubmit"
    placeholder="输入后按回车提交"
  />
  <p v-if="submitted">已提交：{{ inputValue }}</p>
</template>

<script setup>
  import { ref } => 'vue'

  const inputValue = ref('')
  const submitted = ref(false)

  function handleSubmit() {
    if (inputValue.value.trim()) {
      submitted.value = true
    }
  }
</script>
```

在输入框中输入内容后按下回车键，页面显示已提交的内容。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-14-27-22.png)

### 8.2. `.tab`

`.tab` 修饰符监听 Tab 键的按下事件。由于 Tab 键默认用于切换焦点，通常需要配合 `.prevent` 来阻止默认的焦点切换行为。

```html
<template>
  <input @keydown.tab="handleTab" placeholder="按 Tab 键试试" />
  <input placeholder="下一个输入框" />
  <p>{{ message }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const message = ref('等待按 Tab 键...')

  function handleTab() {
    message.value = '检测到 Tab 键按下'
  }
</script>
```

::: swiper

![按下 tab 键之前](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-14-32-21.png)

![按下 tab 键之后](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-14-32-46.png)

:::

在输入框获得焦点后按下 Tab 键，页面会显示 `检测到 Tab 键按下`，同时焦点会按默认行为跳转到下一个元素。

如果需要阻止 Tab 键的默认焦点切换行为：

```html {2}
<template>
  <input @keydown.tab.prevent="handleTab" placeholder="按 Tab 键试试" />
  <input placeholder="下一个输入框" />
  <p>{{ message }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const message = ref('等待按 Tab 键...')

  function handleTab() {
    message.value = '检测到 Tab 键按下，焦点未切换'
  }
</script>
```

::: swiper

![按下 tab 键之前](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-14-32-21.png)

![按下 tab 键之后](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-14-33-30.png)

:::

::: tip 温馨提示 - 按键修饰符的时序问题

如果将上述示例中的 `@keydown.tab` 改为 `@keyup.tab`，你会发现事件处理函数将无法正常触发。这是因为 `@keyup.tab` 存在时序问题。按 Tab 键时，事件的执行顺序是：

1. `keydown` 触发
2. 浏览器执行默认行为（焦点切换到下一个元素）
3. `keyup` 触发 => 但此时焦点已经离开当前 input，事件不会在当前元素上触发

即使有 `.prevent`，`keyup` 事件也无法可靠触发，因为焦点切换的模型行为发生在 `keydown` 之后，`keyup` 时已经无法捕获到 Tab 键的事件了。

改用 `@keydown` 即可，`keydown` 在焦点切换之前触发，能够正确捕获 Tab 键事件，并且 `@keydown.prevent` 也可以正常阻止默认行为。

:::

### 8.3. `.delete`

`.delete` 修饰符同时匹配 `Delete` 键和 `Backspace` 键。适合需要清除输入内容的场景。

```html
<template>
  <input
    v-model="inputValue"
    @keyup.delete="handleDelete"
    placeholder="输入内容后按 Delete 或 Backspace"
  />
  <p>{{ message }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const inputValue = ref('')
  const message = ref('等待按键...')

  function handleDelete() {
    if (inputValue.value === '') {
      message.value = '输入框已为空，按下的是删除键'
    } else {
      message.value = '正在删除内容...'
    }
  }
</script>
```

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-14-51-38.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-14-51-50.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-14-51-57.png)

:::

1. 输入内容
2. 按下 Delete/Backspace 键开始删除内容
3. 内容全部删除后，显示提示信息「输入框已为空，按下的是删除键」

在输入框中先输入一些内容，然后按 `Delete` 或 `Backspace` 键清除内容，当输入框变为空时会显示提示信息。

### 8.4. `.esc`

`.esc` 修饰符监听 Escape 键的按下事件，最典型的场景是按 Esc 关闭弹窗或取消操作。

```html
<template>
  <button @click="showModal = true">打开弹窗</button>

  <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
    <div class="modal" @keyup.esc="showModal = false">
      <p>这是一个弹窗，按 Esc 关闭</p>
      <button @click="showModal = false">手动关闭</button>
    </div>
  </div>
</template>

<script setup>
  import { ref, nextTick } from 'vue'

  const showModal = ref(false)
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
  }
</style>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-15-03-20.png)

点击按钮打开弹窗后，需要点击「手动关闭」按钮才能将弹框关闭，按下 `Esc` 键无法关闭弹窗。因为上面的写法存在一个问题 => `@keyup.esc` 需要元素获得焦点才能触发，而弹窗的 `div` 默认无法接收键盘事件。

常见的解决方案是通过原生 JS 来监听 `document` 的 `keyup` 事件来实现全局的 Esc 键监听，但这会导致事件监听和组件生命周期的管理变得复杂（组件挂载时注册事件，组件销毁时注销事件），容易引发内存泄漏（组件卸载不小心忘记注销事件）等问题。更好的做法是让弹窗元素本身能够接收焦点，并在弹窗打开时自动聚焦，这样 `@keyup.esc` 就能正常工作了。

```html
<template>
  <button @click="showModal = true">打开弹窗</button>

  <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
    <div
      class="modal"
      @keyup.esc="showModal = false"
      tabindex="0"
      ref="modalRef"
    >
      <p>这是一个弹窗，按 Esc 关闭</p>
      <button @click="showModal = false">手动关闭</button>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, nextTick } from 'vue'

  const showModal = ref(false)
  const modalRef = ref(null)

  watch(showModal, async (val) => {
    if (val) {
      await nextTick()
      modalRef.value?.focus()
    }
  })
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
  }
</style>
```

关键点在于给 `div` 添加 `tabindex="0"` 使其可以接收焦点，并在弹窗打开后通过 `watch` + `nextTick` 自动聚焦，这样 `@keyup.esc` 才能正常工作。

::: tip `tabindex` 简介

`tabindex` 是一个 HTML 全局属性，用于控制元素是否可以通过键盘 Tab 键 获取焦点，以及焦点的遍历顺序：

| 值 | 说明 |
| --- | --- |
| `tabindex="0"` | 元素可聚焦，参与默认 Tab 顺序（按文档流顺序） |
| `tabindex="-1"` | 元素可聚焦，但 不参与 Tab 顺序，只能通过 `element.focus()` 编程式聚焦 |
| `tabindex="1"` 及以上 | 元素可聚焦，并按数值从小到大优先聚焦（不推荐，易造成可访问性问题） |

在这个弹窗场景中，给容器添加 `tabindex="0"` 可使其接收键盘事件（如 `@keyup.esc`），再配合 `focus()` 即可实现「打开弹窗 → 自动聚焦 → 按 Esc 关闭」的完整交互。

:::

### 8.5. `.space`

`.space` 修饰符监听空格键的按下事件。常见场景是用空格键触发与点击相同的操作。

```html
<template>
  <div class="radio-wrap">
    <div
      v-for="opt in options"
      :key="opt.value"
      class="radio-item"
      tabindex="0"
      :class="{ active: selected === opt.value }"
      @click="selected = opt.value"
      @keyup.space="selected = opt.value"
    >
      {{ opt.label }}
    </div>
  </div>
  <p>当前选中： {{ selected }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const selected = ref('apple')
  const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '橘子', value: 'orange' },
  ]
</script>

<style scoped>
  .radio-wrap {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
  }
  .radio-item {
    padding: 6px 12px;
    border: 2px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
    user-select: none;
  }
  .radio-item:focus {
    border-color: #409eff;
  }
  .radio-item.active {
    background: #ecf5ff;
    border-color: #409eff;
    color: #409eff;
  }
</style>
```

按钮获得焦点后，按下空格键和点击鼠标左键的效果相同，都会切换激活状态。

测试流程：

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-15-29-43.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-15-30-09.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-15-30-18.png)

:::

1. 点击苹果
2. 按下 Tab 键切换到香蕉（先切换到需要选中的成员，让选中的成员聚焦）
3. 按下空格键选中香蕉（就相当于点击了香蕉）

### 8.6. `.up`、`.down`、`.left`、`.right`

方向键修饰符分别监听上、下、左、右四个方向键。适合实现列表导航、棋盘移动等场景。

```html
<template>
  <p>棋盘是否已聚焦：{{ isFocused ? '是' : '否' }}</p>
  <p>使用方向键移动光标位置</p>
  <p>当前位置：({{ position.x }}, {{ position.y }})</p>

  <div
    class="grid"
    @focus="handleFocus"
    @blur="handleBlur"
    @keyup.up="move('up')"
    @keyup.down="move('down')"
    @keyup.left="move('left')"
    @keyup.right="move('right')"
    tabindex="0"
    ref="gridRef"
  >
    <span v-for="i in 9" :key="i" :class="{ current: i === currentIndex }">
      {{ i === currentIndex ? '★' : '·' }}
    </span>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'

  const gridRef = ref(null)
  const currentIndex = ref(5)
  const isFocused = ref(false)

  const position = computed(() => ({
    x: ((currentIndex.value - 1) % 3) + 1,
    y: Math.floor((currentIndex.value - 1) / 3) + 1,
  }))

  onMounted(() => {
    gridRef.value?.focus()
  })

  function handleFocus() {
    isFocused.value = true
  }

  function handleBlur() {
    isFocused.value = false
  }

  function move(direction) {
    const row = Math.floor((currentIndex.value - 1) / 3)
    const col = (currentIndex.value - 1) % 3

    switch (direction) {
      case 'up':
        if (row > 0) currentIndex.value -= 3
        break
      case 'down':
        if (row < 2) currentIndex.value += 3
        break
      case 'left':
        if (col > 0) currentIndex.value -= 1
        break
      case 'right':
        if (col < 2) currentIndex.value += 1
        break
    }
  }
</script>

<style scoped>
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 40px);
    gap: 4px;
    outline: none;
  }

  .grid span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid #ddd;
  }

  .current {
    background-color: #4caf50;
    color: white;
    border-radius: 4px;
  }
</style>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-15-39-12.png)

点击网格区域使其获得焦点后，使用方向键可以在 3x3 的格子中移动光标。

### 8.7. 系统修饰键（`.ctrl`、`.alt`、`.shift`、`.meta`）

系统修饰键不会单独触发事件，需要配合其他按键一起使用。例如 `.ctrl` 修饰符表示必须同时按下 Ctrl 键才会触发。

```html
<template>
  <input @keyup.ctrl.s="handleSave" placeholder="按 Ctrl + S 保存" />
  <input @keyup.meta.s="handleSave" placeholder="按 Command + S 保存" />
  <input @keyup.alt.enter="handleNewLine" placeholder="按 Alt + Enter 换行" />
  <input
    @keyup.shift.delete="handleHardDelete"
    placeholder="按 Shift + Delete 彻底删除"
  />
  <p>{{ message }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const message = ref('等待快捷键...')

  function handleSave() {
    message.value = '已保存'
  }

  function handleNewLine() {
    message.value = '插入换行'
  }

  function handleHardDelete() {
    message.value = '彻底删除'
  }
</script>
```

依次点击输入框并按下对应的组合键，会显示不同的提示信息。

注意：不同操作系统下系统修饰键的行为可能有所差异，开发时需要考虑跨平台兼容性。以修饰符 `.meta` 为例：

- 在 Mac 上对应 Command 键
- 在 Windows 上对应 Windows 键
- 在 Linux 上对应 Super 键

### 8.8. `.exact`

`.exact` 修饰符用于精确匹配修饰键的组合状态。当使用系统修饰键时，Vue 默认允许同时按下其他修饰键也会触发。`.exact` 可以确保只有指定的修饰键组合才触发事件。

```html
<template>
  <button @click.meta="handleMetaClick">Meta + 点击</button>
  <button @click.meta.exact="handleExactMetaClick">
    仅 Meta + 点击（不能有其他修饰键）
  </button>
  <button @click.exact="handleExactClick">仅点击（不能有任何修饰键）</button>
  <p>{{ message }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const message = ref('等待操作...')

  function handleMetaClick() {
    message.value = 'Meta + 点击触发（Shift + Meta + 点击也能触发）'
  }

  function handleExactMetaClick() {
    message.value = '仅 Meta + 点击触发（Shift + Meta + 点击不会触发）'
  }

  function handleExactClick() {
    message.value = '仅普通点击触发（按住任何修饰键都不会触发）'
  }
</script>
```

对比前两个按钮的行为：

- `@click.meta`：按住 Meta 点击会触发，同时按住 Shift + Meta 点击也会触发
- `@click.meta.exact`：按住 Meta 点击会触发，但同时按住 Shift + Meta 点击不会触发
- `@click.exact`：只有不按住任何修饰键的普通点击才会触发

## 9. 🤔 什么是鼠标按键修饰符？

鼠标按键修饰符用于区分鼠标的左右中键，适用于需要针对不同鼠标按键执行不同逻辑的场景。

| 修饰符    | 对应按键 | 触发事件      |
| --------- | -------- | ------------- |
| `.left`   | 鼠标左键 | `click`       |
| `.middle` | 鼠标中键 | `click`       |
| `.right`  | 鼠标右键 | `contextmenu` |

```html
<template>
  <div
    class="box"
    @click.left="handleClick('左键')"
    @click.middle="handleClick('中键')"
    @click.right.prevent="handleClick('右键')"
  >
    在此区域测试鼠标按键
  </div>
  <p>{{ message }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const message = ref('等待操作...')

  function handleClick(button) {
    message.value = `你点击了${button}`
  }
</script>

<style scoped>
  .box {
    width: 200px;
    height: 100px;
    background: #f0f0f0;
    border: 2px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
  }
</style>
```

注意：右键修饰符 `.right` 绑定的是 `contextmenu` 事件而非 `click`，并且需要加 `.prevent` 阻止浏览器默认右键菜单弹出。在这个示例中，`@contextmenu.right.prevent` 和 `@click.right.prevent` 的效果是一样的。

## 10. 🤔 绑定事件时有哪些最佳实践？

### 10.1. 优先使用方法引用

对于多步操作，将逻辑封装到函数中，避免在模板中写入复杂的内联表达式。

```html
<!-- ❌ bad：模板中塞入多步操作 -->
<button @click="count++; console.log(count); if (count > 10) alert('too many')">
  递增
</button>

<!-- ✅ good：逻辑抽离到函数 -->
<button @click="increment">递增</button>

<!-- 
 在 script 中定义 increment 方法：
 function increment() {
  count.value++
  console.log(count.value)
  if (count.value > 10) alert('too many')
}
 -->
```

### 10.2. 合理使用事件修饰符

修饰符可以让模板更加简洁，但不要过度链式串联，以免降低代码可读性。

```html
<!-- ❌ bad：修饰符滥用，逻辑不清 -->
<button @click.stop.prevent.self.once.capture="doSomething">复杂按钮</button>

<!-- ✅ good：按需使用，意图明确 -->
<form @submit.prevent="handleSubmit">提交</form>
<button @click.stop="handleClick">点我</button>
<!-- 只添加必要的修饰符，避免无意义的链式串联。 -->
```

### 10.3. 根据场景选用合适的事件参数传递方式

不需要传参时使用函数名，需要传参时使用内联函数调用并通过 `$event` 传递原生事件对象。

- 不需要参数时，直接写函数名（更简洁）
- 需要参数时，用内联调用通过 `$event` 显式传递事件对象

```html
<!-- ❌ bad：不需要参数时画蛇添足 -->
<button @click="handleClick()">按钮</button>

<!-- ✅ good：直接引用 -->
<button @click="handleClick">按钮</button>

<!-- ✅ good：需要事件参数时也可以显式传入，不依赖 vue 默认的注入行为，更加直观 -->
<button @click="handleClick($event)">按钮</button>

<!-- ✅ good：同时传入自定义参数和事件对象时必须显式传入 $event -->
<button @click="add(5, $event)">+5</button>
```

## 11. 🔗 引用

- [Vue.js 官方文档 - 事件处理][1]

[1]: https://cn.vuejs.org/guide/essentials/event-handling
