# [0007. 事件处理](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0007.%20%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86)

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
- [9. 🤔 什么是鼠标按键修饰符？](#9--什么是鼠标按键修饰符)
- [10. 🤔 绑定事件时有哪些最佳实践？](#10--绑定事件时有哪些最佳实践)
- [11. 🔗 引用](#11--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 使用 `v-on` 指令监听 DOM 事件
- 事件处理函数的基本写法：内联表达式与方法调用
- 事件对象 `$event` 的获取与使用
- 事件修饰符（`stop`、`prevent`、`capture`、`self`、`once`、`passive`）
- 按键修饰符与鼠标按键修饰符
- 在模板中绑定事件的最佳实践

## 2. 🫧 评价

todo

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

按键修饰符用于监听特定的键盘事件，在需要处理键盘输入的场景中非常实用。

```html
<!-- 只在按下 Enter 键时触发 -->
<input @keyup.enter="submit" />

<!-- 组合使用 -->
<input @keyup.ctrl.enter="submitWithCtrl" />

<!-- 监听具体按键 -->
<input @keyup.page-down="onPageDown" />
```

Vue 为常用的按键提供了别名：

- `.enter` - 回车键
- `.tab` - Tab 键
- `.delete` - 删除键（同时处理 Delete 和 Backspace）
- `.esc` - Escape 键
- `.space` - 空格键
- `.up` / `.down` / `.left` / `.right` - 方向键

系统修饰键：

- `.ctrl`
- `.alt`
- `.shift`
- `.meta`（Mac 上为 Command 键，Windows 上为 Windows 键）

## 9. 🤔 什么是鼠标按键修饰符？

鼠标按键修饰符用于区分鼠标的左右中键，适用于需要针对不同鼠标按键执行不同逻辑的场景。

```html
<!-- 只在鼠标左键点击时触发 -->
<button @click.left="handleLeftClick">左键</button>

<!-- 只在鼠标中键点击时触发 -->
<button @click.middle="handleMiddleClick">中键</button>

<!-- 只在鼠标右键点击时触发 -->
<button @click.right="handleRightClick">右键</button>
```

## 10. 🤔 绑定事件时有哪些最佳实践？

- 优先使用方法引用：对于多步操作，将逻辑封装到函数中，避免在模板中写入复杂的内联表达式。
- 合理使用事件修饰符：修饰符可以让模板更加简洁，但不要过度链式串联，以免降低代码可读性。
- 根据场景选用合适的参数传递方式：不需要传参时使用函数名，需要传参时使用内联函数调用并通过 `$event` 传递原生事件对象。

## 11. 🔗 引用

- [Vue.js 官方文档 - 事件处理][1]

[1]: https://cn.vuejs.org/guide/essentials/event-handling
