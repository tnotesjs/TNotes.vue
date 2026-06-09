# [0112. 渲染函数 & JSX](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0112.%20%E6%B8%B2%E6%9F%93%E5%87%BD%E6%95%B0%20%26%20JSX)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 什么时候应该从模板进入渲染函数？](#3-什么时候应该从模板进入渲染函数)
- [4. `h()`、渲染函数返回值和 VNode 唯一性该怎么理解？](#4-h渲染函数返回值和-vnode-唯一性该怎么理解)
  - [4.1. `h()` 就是在创建 VNode](#41-h-就是在创建-vnode)
  - [4.2. `setup()` 返回渲染函数，而不是返回一次性结果](#42-setup-返回渲染函数而不是返回一次性结果)
  - [4.3. VNode 必须唯一](#43-vnode-必须唯一)
- [5. 模板里的常见能力换成渲染函数后分别怎么写？](#5-模板里的常见能力换成渲染函数后分别怎么写)
  - [5.1. 条件、列表和事件](#51-条件列表和事件)
  - [5.2. 插槽的读取和传递](#52-插槽的读取和传递)
  - [5.3. 内置组件、`v-model`、指令和模板引用](#53-内置组件v-model指令和模板引用)
- [6. JSX / TSX 和函数式组件有什么额外价值？](#6-jsx--tsx-和函数式组件有什么额外价值)
  - [6.1. JSX / TSX](#61-jsx--tsx)
  - [6.2. 函数式组件](#62-函数式组件)
- [7. 引用](#7-引用)

<!-- endregion:toc -->

## 1. 本节内容

- h 函数
- VNode
- render 函数
- JSX / TSX
- 插槽传递
- v-model 展开
- 自定义指令
- 函数式组件

## 2. 评价

这一节不是在推翻模板，而是在说明：当模板表达力不够、你需要 JavaScript 完整编程能力时，Vue 允许你直接构造 VNode。理解渲染函数之后，你会更清楚模板最终会被编译成什么，也更能读懂一些高级组件库和底层封装。

## 3. 什么时候应该从模板进入渲染函数？

官方的态度很明确：绝大多数情况下，仍然优先推荐模板。

因为模板：

- 更接近 HTML，可读性通常更好
- 更容易被编译器分析和优化
- 对常规业务页面已经足够灵活

渲染函数更适合这些场景：

- 需要用 JavaScript 动态拼装复杂结构
- 需要高度可编程的 UI 生成逻辑
- 模板写法反而别扭或重复

所以它更像“高级模式”，而不是默认模式。

## 4. `h()`、渲染函数返回值和 VNode 唯一性该怎么理解？

### 4.1. `h()` 就是在创建 VNode

最核心的 API 是 `h()`：

```js
import { h } from 'vue'

const vnode = h('div', { id: 'foo' }, 'hello')
```

这里的 3 个位置分别表示：

- 节点类型
- props
- children

它既可以写原生标签，也可以写组件：

```js
import { h } from 'vue'
import MyButton from './MyButton.vue'

export default {
  setup() {
    return () => h(MyButton, { type: 'primary' }, () => '保存')
  },
}
```

### 4.2. `setup()` 返回渲染函数，而不是返回一次性结果

```js
import { h, ref } from 'vue'

export default {
  setup(props) {
    const count = ref(1)

    return () => h('div', `${props.msg} ${count.value}`)
  },
}
```

注意这里返回的是一个函数。`setup()` 只执行一次，但这个渲染函数会被调用很多次。

### 4.3. VNode 必须唯一

同一个 VNode 不能在同一棵树里复用两次：

```js
function render() {
  const p = h('p', 'hi')

  return h('div', [p, p])
}
```

这段写法是无效的。因为一个 VNode 代表一次具体渲染输出，不是可重复使用的模板。要渲染多个相同节点，应该每次都重新创建。

## 5. 模板里的常见能力换成渲染函数后分别怎么写？

### 5.1. 条件、列表和事件

模板中的 `v-if`、`v-for`、`@click`，本质上都会回到普通 JavaScript 表达式：

```js
import { h, ref } from 'vue'

export default {
  setup() {
    const ok = ref(true)
    const items = ref([
      { id: 1, text: 'A' },
      { id: 2, text: 'B' },
    ])

    return () =>
      h('div', [
        ok.value ? h('p', 'yes') : h('span', 'no'),
        h(
          'ul',
          items.value.map((item) => h('li', { key: item.id }, item.text)),
        ),
        h('button', { onClick: () => console.log('click') }, 'Click Me'),
      ])
  },
}
```

事件修饰符里，像 `.capture`、`.once` 这类可以拼进事件名；像 `.self` 这类则可以用 `withModifiers()`。

### 5.2. 插槽的读取和传递

在渲染函数里，插槽本质上就是函数。

读取插槽：

```js
import { h } from 'vue'

export default {
  props: ['message'],
  setup(props, { slots }) {
    return () =>
      h('div', [
        h('div', slots.default?.()),
        h('div', slots.footer?.({ text: props.message })),
      ])
  },
}
```

传递插槽：

```js
h(MyComponent, null, {
  default: () => 'default slot',
  footer: () => h('span', 'footer'),
})
```

注意这里的 `null` 很重要，它用来避免插槽对象被误判为 props。

### 5.3. 内置组件、`v-model`、指令和模板引用

这些模板糖在渲染函数里都需要自己展开：

```js
import { h, Transition, useTemplateRef, withDirectives } from 'vue'

const focus = {
  mounted(el) {
    el.focus()
  },
}

export default {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inputRef = useTemplateRef('input-el')

    return () =>
      h(
        Transition,
        { mode: 'out-in' },
        {
          default: () =>
            withDirectives(
              h('input', {
                ref: 'input-el',
                value: props.modelValue,
                onInput: (event) =>
                  emit('update:modelValue', event.target.value),
              }),
              [[focus]],
            ),
        },
      )
  },
}
```

这里能看到几件事：

- `<Transition>` 这类内置组件需要显式导入
- `v-model` 需要手动展开为 `modelValue` 和 `onUpdate:modelValue`
- 自定义指令要通过 `withDirectives()` 应用
- 模板引用在 3.5+ 中可以通过字符串 `ref` 配合 `useTemplateRef()` 使用

## 6. JSX / TSX 和函数式组件有什么额外价值？

### 6.1. JSX / TSX

JSX 只是另一种写渲染函数的语法糖：

```tsx
const vnode = <div id={dynamicId}>hello, {userName}</div>
```

在 Vue 中使用 JSX / TSX 时，要注意：

- 语义并不是 React 那一套运行时
- `class`、`for` 可以直接写，不需要改成 `className`、`htmlFor`
- TypeScript 下通常要在 `tsconfig.json` 中配置 `jsx: 'preserve'`
- 从 Vue 3.4 开始，如需 JSX 类型推导，通常还要配置 `jsxImportSource: 'vue'`

### 6.2. 函数式组件

如果一个组件本身没有状态、没有实例需求，只是接收 props 并返回 VNode，那么它就可以写成函数式组件：

```tsx
import type { FunctionalComponent } from 'vue'

type Props = {
  message: string
}

const MessageButton: FunctionalComponent<Props> = (props, { emit }) => {
  return (
    <button onClick={() => emit('send', props.message)}>{props.message}</button>
  )
}

MessageButton.props = {
  message: {
    type: String,
    required: true,
  },
}

MessageButton.emits = ['send']
```

函数式组件不会创建组件实例，也没有 `this` 和常规生命周期钩子。它更轻、更直接，但也因此不适合需要实例状态的组件。

## 7. 引用

- [Vue.js 官方文档 - 渲染函数 & JSX][1]
- [Vue.js 官方文档 - 渲染机制][2]
- [Vue.js API - Render Function][3]
- [Vue JSX 插件][4]

[1]: https://cn.vuejs.org/guide/extras/render-function.html
[2]: https://cn.vuejs.org/guide/extras/rendering-mechanism.html
[3]: https://cn.vuejs.org/api/render-function.html
[4]: https://github.com/vuejs/babel-plugin-jsx
