# [0084. 透传 Attributes](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0084.%20%E9%80%8F%E4%BC%A0%20Attributes)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是透传 Attributes？什么时候会自动继承？](#3--什么是透传-attributes什么时候会自动继承)
  - [3.1. 透传 Attributes](#31-透传-attributes)
  - [3.2. 示例：单根节点](#32-示例单根节点)
  - [3.3. 示例：多根节点](#33-示例多根节点)
  - [3.4. 小结](#34-小结)
- [4. 🤔 `class`、`style` 和 `v-on` 监听器会怎么透传？](#4--classstyle-和-v-on-监听器会怎么透传)
  - [4.1. `class` 和 `style` 的透传](#41-class-和-style-的透传)
  - [4.2. `v-on` 监听器的透传](#42-v-on-监听器的透传)
    - [示例](#示例)
    - [执行顺序：为什么先输出 `2`，后输出 `1`？](#执行顺序为什么先输出-2后输出-1)
    - [Vue 2 与 Vue 3 的区别](#vue-2-与-vue-3-的区别)
    - [如何控制只触发一个监听器？](#如何控制只触发一个监听器)
  - [4.3. 深度透传机制](#43-深度透传机制)
- [5. 🤔 什么场景下要禁用透传 Attributes（即：自动继承机制）？](#5--什么场景下要禁用透传-attributes即自动继承机制)
- [6. 🤔 多根节点组件为什么不会自动透传？](#6--多根节点组件为什么不会自动透传)
- [7. 🤔 `$attrs` 和 `useAttrs()` 有什么用？使用时有哪些注意事项？](#7--attrs-和-useattrs-有什么用使用时有哪些注意事项)
- [8. 🤔 透传 Attributes 能代替 props、emits 吗？](#8--透传-attributes-能代替-propsemits-吗)
  - [8.1. 核心区别](#81-核心区别)
  - [8.2. 如果用透传 Attributes 代替 `props` 会怎样？](#82-如果用透传-attributes-代替-props-会怎样)
  - [8.3. 如果用透传 Attributes 代替 `emits` 会怎样？](#83-如果用透传-attributes-代替-emits-会怎样)
  - [8.4. 小结](#84-小结)
- [9. 🤔 透传 Attributes 的正确使用场景是什么？](#9--透传-attributes-的正确使用场景是什么)
- [10. 💻 demos.1 - 基本透传](#10--demos1---基本透传)
- [11. 🔗 引用](#11--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 自动继承机制
- 样式合并机制
- 监听器继承机制
- `inheritAttrs: false` 阻止自动继承
- 多根节点的自动继承限制
- `$attrs` 和 `useAttrs()` 的使用
- 透传 Attributes 的正确使用场景

## 2. 🫧 评价

关于透传 Attributes 机制，重点要搞清楚：

- 什么场景下父组件传递的 Attributes 会自动落到子组件的根元素
- 什么场景下需要手动接管父组件透传的 Attributes 的分发

## 3. 🤔 什么是透传 Attributes？什么时候会自动继承？

### 3.1. 透传 Attributes

父组件在调用子组件的时候可以传递一些东西 xxx，这个 xxx 可能是子组件中定义的 `props` 也可能是 `emits`，理想情况下，父组件传递过来的 xxx 都是子组件事先定义好的，子组件可以接住父组件传过来的 xxx 内容。但是，有时候父组件传递过来的 xxx 在子组件中没有对应的 `props` 或 `emits` 来接住，这时 Vue 就会把这些「剩余的」xxx 直接透传到子组件的根元素上，这就是所谓的「透传 Attributes」。

由此可见，透传本质上是 Vue 的一种特殊行为，目的为了处理当父组件传递过来的 Attributes 在子组件中没有定义对应的 `props` 或 `emits` 时的场景。

::: tip 来看看 Vue 官方的解释

“透传 attribute”（Fallthrough Attributes）指的是传递给一个组件，却没有被该组件声明为 `props` 或 `emits` 的 Attributes 或者 v-on 事件监听器。最常见的例子就是 class、style 和 id。

:::

### 3.2. 示例：单根节点

比如这里有一个子组件 `<MyButton>`：

```html
<template>
  <button>Click Me</button>
</template>
```

父组件这样使用：

```html
<MyButton class="large" id="submit-btn" />
```

由于 `MyButton` 并没有把 `class` 和 `id` 声明成 `props`，Vue 就会把它们自动加到根元素 `<button>` 上。

最终的 DOM 结构将会是：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-21-07-03.png)

### 3.3. 示例：多根节点

比如这里有一个子组件 `<MyButton>`，它有两个根节点：

```html
<template>
  <button>Click Me</button>
  <button>Click Me</button>
</template>
```

父组件这样使用：

```html
<MyButton class="large" id="submit-btn" />
```

此时的结果是 Vue 会给出警告，因为它不知道 `class` 和 `id` 应该加到哪个根节点上了。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-21-06-01.png)

::: warning 警告信息注解

【中文翻译】

[Vue 警告]：多余的、非 props 的属性 (class, id) 被传递给了组件，但是无法被自动继承，因为组件渲染的是片段、文本或 teleport 根节点。

在 `<MyButton class="large" id="submit-btn" >`

在 `<Repl>`

【解释说明】

父组件传递了 `class` 和 `id` 这两个非 props 的 Attributes 给 `<MyButton>` 组件，但由于 `<MyButton>` 渲染了一个 fragment（即多个根节点），Vue 无法自动将这些 Attributes 继承到某个特定的根节点上，因此发出了警告。

🤔 为什么这里要刻意介绍一下这个警告信息？

主要是想要强调一个关键术语 `automatically inherited`（自动继承），这个术语在 Vue 官方文档里是专门用来描述「当组件只有一个根元素时，未被声明消费掉的 Attributes 会自动透传到这个根元素上」这个行为的。

:::

最终的 DOM 结构将会是：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-21-06-39.png)

### 3.4. 小结

你可以先记住一个最核心的规则：当组件只有一个根元素时，未被声明消费掉的 Attributes 会自动透传到这个根元素上。

## 4. 🤔 `class`、`style` 和 `v-on` 监听器会怎么透传？

### 4.1. `class` 和 `style` 的透传

`class` 和 `style` 不只是「原样替换」，而是会和子组件根元素自身已有的值「智能合并」。

比如，子组件 `<MyButton>` 的实现是：

```html
<template>
  <button class="btn" style="color: red">Click Me</button>
</template>
```

父组件这样传：

```html
<MyButton class="large" style="font-size: 18px" />
```

最终渲染得到的真实 DOM 如下：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-22-15-40.png)

最终根元素会同时拥有两边的样式信息，而不是父组件把子组件原有值覆盖掉。

### 4.2. `v-on` 监听器的透传

事件监听器的透传逻辑也类似：

```html
<MyButton @click="handleClick" />
```

如果 `MyButton` 的根元素是一个原生 `<button>`，那这个 `click` 监听器会直接挂到这个按钮上。用户点击按钮时，父组件的 `handleClick` 就会执行。

#### 示例

::: code-group

```html [App.vue]
<template>
  <MyButton @click="handleClick" />
</template>

<script setup>
  import MyButton from './MyButton.vue'

  const handleClick = () => {
    console.log('1')
  }
</script>
```

```html [MyButton.vue]
<template>
  <button @click="handleClick">Click Me</button>
</template>

<script setup>
  const handleClick = () => {
    console.log('2')
  }
</script>
```

:::

点击按钮之后，会输出：

```
2
1
```

会发现子组件 `MyButton` 内部的 `handleClick` 先被调用，输出 `2`，然后父组件传递过来的 `handleClick` 才被调用，输出 `1`。

#### 执行顺序：为什么先输出 `2`，后输出 `1`？

事件监听器的执行顺序取决于它们被绑定到 DOM 元素上的先后顺序：

1. 子组件模板编译时，会先处理子组件自身模板中声明的 `@click="handleClick"`，将子组件的 `handleClick` 绑定到根 `<button>` 上。
2. 随后，Vue 处理父组件传递给子组件的透传 attribute（包括 `@click`），将父组件的 `handleClick` 也绑定到同一个 `<button>` 上。

因此，当按钮被点击时，DOM 元素上绑定的两个 `click` 监听器会按照绑定顺序依次调用：

- 先执行子组件自己的 `handleClick` -> 输出 `2`
- 再执行父组件透传的 `handleClick` -> 输出 `1`

这个过程与事件冒泡无关（两个监听器都在同一元素上，不存在冒泡），完全是绑定顺序决定的。

#### Vue 2 与 Vue 3 的区别

- Vue 2：父组件的 `@click` 默认不会自动透传到子组件的根元素，需要加上 `.native` 修饰符（`@click.native`）才能绑定到根元素。同时，如果子组件自己也绑定了 `@click`，两者都会触发，但顺序可能受内部实现影响。
- Vue 3：移除了 `.native` 修饰符，所有事件默认都是原生事件，完全依赖透传机制。这使得行为更一致、更可预测。

#### 如何控制只触发一个监听器？

如果你希望父组件的透传事件不干扰子组件内部逻辑，有两种常见做法：

- 做法 1：听「父组件」的 => 子组件不自己绑定同名事件，而是通过 `$emit` 向父组件通信。
- 做法 2：听「子组件」的 => 在子组件中阻止冒泡或停止传播（注意：停止传播只会影响后续监听器，对于同一元素上的多个监听器，`stopImmediatePropagation` 可以阻止后续监听器执行）。

```html
<!-- 子组件 -->
<template>
  <button @click="handleClick">Click Me</button>
</template>
<script setup>
  const handleClick = (event) => {
    event.stopImmediatePropagation() // 阻止同一元素上的其他监听器
    console.log('2')
    // 这种做法只会在控制台输出 2，不会触发父组件的 handleClick
  }
</script>
```

### 4.3. 深度透传机制

如果根节点本身渲染的是另一个组件，而不是原生元素，那么这些透传 Attributes 还会继续往下传：

```html
<template>
  <BaseButton />
</template>
```

这时 `MyButton` 接收到的透传 Attributes 会继续流向 `BaseButton`。

不过这里有个边界要注意：

1. 当前组件已经声明过的 `props` 不会出现在透传集合里。
2. 当前组件已经声明过的 `emits` 监听器也不会继续作为透传监听器下发。

换句话说，凡是被当前组件「正式接住」的输入，Vue 都会认为它已经被消费了，不再把它算进 `$attrs`。

## 5. 🤔 什么场景下要禁用透传 Attributes（即：自动继承机制）？

自动透传虽然方便，但在封装基础组件时，经常会遇到一个现实问题：真正应该接收这些 Attributes 的，不是根节点，而是根节点里面的某个内部元素。

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
2. `v-bind="$attrs"` 让你手动决定把透传 Attributes 放到哪里。

这通常是封装「外面是包装层，里面才是真实交互元素」的组件时最常见的做法。

## 6. 🤔 多根节点组件为什么不会自动透传？

如果一个组件有多个根节点，Vue 就不知道该把透传 Attributes 放到哪一个根节点上，所以不会自动处理。

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

## 7. 🤔 `$attrs` 和 `useAttrs()` 有什么用？使用时有哪些注意事项？

当你需要在模板或脚本里手动访问透传 Attributes 时，可以使用它们。

- `<template>` 模板中使用 => `$attrs`
- `<script setup>` 脚本中使用 => `useAttrs()`

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

- `foo-bar` 这种 Attributes 名在 JavaScript 里不会自动转成 camelCase，需要写成 `attrs['foo-bar']`。事件监听器会暴露成类似 `onClick` 这样的字段。如果忘记了这些细节，你也可以在控制台输出 `attrs` 来看看它的真实结构。
- `attrs` 会反映最新值，但它本身不是响应式对象，不能直接靠 `watch(attrs)` 来侦听变化。所以如果你真正需要「响应式地感知某个输入变化」，更合适的做法通常是把它定义成明确的 prop，而不是寄希望于 `$attrs`。

## 8. 🤔 透传 Attributes 能代替 props、emits 吗？

不能。

虽然从「父组件传了、子组件没声明」这个场景来看，使用透传 Attributes 也能把信息从父组件传递到子组件，似乎效果和 `props`/`emits` 一样，但它们的设计目的完全不同，混用会带来一系列问题。

### 8.1. 核心区别

| 维度 | `props` / `emits` | 透传 Attributes |
| --- | --- | --- |
| 声明 | 显式声明，有明确的契约 | 隐式传递，没有契约 |
| 类型校验 | 支持类型检查、默认值、必填校验 | 不支持任何校验 |
| 语义 | 表示「组件对外暴露的 API」 | 表示「组件没有消费的剩余输入」 |
| 可读性 | 一目了然，看声明就知道组件接受什么 | 需要翻看 `$attrs` 才知道传了什么 |
| 控制力 | 子组件完全掌控接收和验证逻辑 | 子组件无法提前约束父组件传什么 |

### 8.2. 如果用透传 Attributes 代替 `props` 会怎样？

假设你有一个封装的输入框组件，不声明 `props`，全靠透传：

```html
<!-- 不推荐的做法 -->
<template>
  <input v-bind="$attrs" />
</template>
```

父组件这样用：

```html
<MyInput placeholder="请输入" maxlength="20" typee="text" />
```

注意这里 `typee` 是个拼写错误，但因为你没有声明 `props`，Vue 不会给任何提示，它会直接透传到原生 `<input>` 上被浏览器忽略，bug 就这样悄悄溜走了。

而如果用 `props`：

```html
<script setup>
  defineProps({
    type: { type: String, default: 'text' },
    placeholder: String,
    maxlength: [String, Number],
  })
</script>
```

拼写错误 `typee` 就会被 Vue 当作一个意外的 Attributes，开发者可以在调试阶段快速发现问题。

### 8.3. 如果用透传 Attributes 代替 `emits` 会怎样？

```html
<!-- 不推荐的做法 -->
<template>
  <button @click="$attrs.onClick">Click Me</button>
</template>
```

这样做的问题在于：

- 父组件传过来的 `onClick` 只是一个普通的回调属性，不具备事件的语义。
- 子组件无法通过 `defineEmits` 声明自己会触发哪些事件，外部调用者无法通过类型提示或文档得知组件的行为。
- 多个同名监听器的合并行为可能导致意料之外的多次触发。

### 8.4. 小结

如果只从数据传输维度来看，透传 Attributes 确实也能把数据从父组件传递到子组件，但它缺乏 `props`/`emits` 的明确契约、类型校验和语义表达，容易导致代码可读性差、维护困难和潜在的运行时错误。

`props` 和 `emits` 是组件对外暴露的正式 API 契约，透传 Attributes 是处理「剩余输入」的安全网。

该声明的要声明，该透传的才透传，两者各司其职，不要试图用透传来替代 props 或 emits。

## 9. 🤔 透传 Attributes 的正确使用场景是什么？

透传 Attributes 不是用来替代 `props`/`emits` 的，它的定位更像是一个「兜底机制和灵活通道」，常见的使用场景包括：

- 包装型组件：组件的主要职责是包裹一个原生元素或另一个组件，你希望父组件传入的 Attributes 原封不动地落到内部真实元素上（配合 `inheritAttrs: false` + `v-bind="$attrs"`）。
- 透传非核心 Attributes：比如 `data-*`、`aria-*` 这类辅助性属性，组件本身不需要消费它们，但需要让它们落到 DOM 上以满足无障碍或测试需求。
- 高阶组件组合：在组件组合模式中，中间层组件不需要关心所有传入的 Attributes，只是把它们向下转发。

## 10. 💻 demos.1 - 基本透传

::: code-group

<<< demos/1/App.vue

<<< demos/1/FormField.vue

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-23-28-11.png)

## 11. 🔗 引用

- [Vue.js 官方文档 - 透传 Attributes][1]

[1]: https://cn.vuejs.org/guide/components/attrs.html
