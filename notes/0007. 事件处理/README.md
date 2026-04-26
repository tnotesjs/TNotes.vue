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
  - [6.1. `.stop` - 阻止事件冒泡](#61-stop---阻止事件冒泡)
  - [6.2. `.prevent` - 阻止默认行为](#62-prevent---阻止默认行为)
  - [6.3. `.capture` - 使用捕获模式](#63-capture---使用捕获模式)
  - [6.4. `.self` - 仅当事件源是自身时触发](#64-self---仅当事件源是自身时触发)
  - [6.5. `.once` - 仅触发一次](#65-once---仅触发一次)
  - [6.6. `.passive` - 提升滚动性能](#66-passive---提升滚动性能)
- [7. 🤔 什么是按键修饰符？](#7--什么是按键修饰符)
- [8. 🤔 什么是鼠标按键修饰符？](#8--什么是鼠标按键修饰符)
- [9. 🤔 绑定事件时有哪些最佳实践？](#9--绑定事件时有哪些最佳实践)
- [10. 🔗 引用](#10--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 使用 `v-on` 指令监听 DOM 事件
- 事件处理函数的基本写法：内联表达式与方法调用
- 事件对象 `$event` 的获取与使用
- 事件修饰符（`stop`、`prevent`、`capture`、`self`、`once`、`passive`）
- 按键修饰符与鼠标按键修饰符
- 在模板中绑定事件的最佳实践

## 2. 🫧 评价

这篇笔记主要是参考 [Vue.js 官方文档 - 事件处理][1] 来写的，可以结合着一起看。

## 3. 🤔 什么是 `v-on` 指令？

`v-on` 指令用于监听 DOM 事件，并在事件触发时执行对应的 JavaScript 代码。它是 Vue 中处理用户交互的核心方式。

```html
<template>
  <button v-on:click="count++">点击次数：{{ count }}</button>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>
```

`v-on` 指令有一个常用的缩写语法 `@`，上面的写法等价于：

```html
<button @click="count++">点击次数：{{ count }}</button>
```

## 4. 🤔 内联事件处理和事件处理函数有什么区别？

### 4.1. 内联表达式

对于简单的逻辑，可以直接在模板中编写内联表达式：

```html
<template>
  <button @click="count++">点击次数：{{ count }}</button>
</template>
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
    console.log(event) // 原生 Event 对象
    console.log(event.target)
  }
</script>
```

`$event` 是 Vue 在模板中提供的一个特殊变量，始终指向当前触发事件的原生事件对象。

## 6. 🤔 什么是事件修饰符？

事件修饰符是以点号开头的指令后缀，用于对事件进行额外的控制。Vue 提供了多种事件修饰符来处理常见的 DOM 事件需求。

### 6.1. `.stop` - 阻止事件冒泡

```html
<!-- 点击按钮时，不会触发父元素的 click 事件 -->
<div @click="parentClick">
  <button @click.stop="childClick">点击</button>
</div>
```

### 6.2. `.prevent` - 阻止默认行为

```html
<!-- 提交表单时，不会触发页面刷新 -->
<form @submit.prevent="onSubmit">
  <button type="submit">提交</button>
</form>
```

### 6.3. `.capture` - 使用捕获模式

```html
<!-- 在捕获阶段触发事件，而非冒泡阶段 -->
<div @click.capture="handleClick">点击</div>
```

### 6.4. `.self` - 仅当事件源是自身时触发

```html
<!-- 只在点击 div 本身时触发，点击子元素不触发 -->
<div @click.self="handleClick">
  <button>点击按钮不会触发父元素事件</button>
</div>
```

### 6.5. `.once` - 仅触发一次

```html
<!-- 事件只触发一次，之后自动解绑 -->
<button @click.once="handleClick">只触发一次</button>
```

### 6.6. `.passive` - 提升滚动性能

```html
<!-- 告诉浏览器不阻止默认行为，优化滚动性能 -->
<div @scroll.passive="handleScroll">滚动区域</div>
```

修饰符可以串联使用，以下组合会同时阻止冒泡和默认行为：

```html
<button @click.stop.prevent="handleClick">点击</button>
```

## 7. 🤔 什么是按键修饰符？

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

## 8. 🤔 什么是鼠标按键修饰符？

鼠标按键修饰符用于区分鼠标的左右中键，适用于需要针对不同鼠标按键执行不同逻辑的场景。

```html
<!-- 只在鼠标左键点击时触发 -->
<button @click.left="handleLeftClick">左键</button>

<!-- 只在鼠标中键点击时触发 -->
<button @click.middle="handleMiddleClick">中键</button>

<!-- 只在鼠标右键点击时触发 -->
<button @click.right="handleRightClick">右键</button>
```

## 9. 🤔 绑定事件时有哪些最佳实践？

- **优先使用方法引用**：对于多步操作，将逻辑封装到函数中，避免在模板中写入复杂的内联表达式。
- **合理使用事件修饰符**：修饰符可以让模板更加简洁，但不要过度链式串联，以免降低代码可读性。
- **根据场景选用合适的参数传递方式**：不需要传参时使用函数名，需要传参时使用内联函数调用并通过 `$event` 传递原生事件对象。

## 10. 🔗 引用

- [Vue.js 官方文档 - 事件处理][1]

[1]: https://cn.vuejs.org/guide/essentials/event-handling
