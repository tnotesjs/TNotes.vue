# [0002. 组件事件（Emits）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0002.%20%E7%BB%84%E4%BB%B6%E4%BA%8B%E4%BB%B6%EF%BC%88Emits%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 组件事件是什么？父组件如何监听子组件事件？](#3--组件事件是什么父组件如何监听子组件事件)
- [4. 🤔 事件参数是如何传递的？](#4--事件参数是如何传递的)
- [5. 🤔 为什么推荐显式声明 `emits`？](#5--为什么推荐显式声明-emits)
- [6. 🤔 组件事件如何做校验和类型标注？](#6--组件事件如何做校验和类型标注)
- [7. 🤔 事件名写法和传播机制有哪些边界？](#7--事件名写法和传播机制有哪些边界)
- [8. 🔗 引用](#8--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 事件触发
- 参数传递
- Emits 声明
- 事件校验
- 命名边界

## 2. 🫧 评价

自定义事件是组件通信里「子通知父」的标准做法，所以触发、监听、传参这三件事必须熟练。`defineEmits()` 的声明和校验细节没有前面三项高频，但它直接影响组件边界是否清晰，写组件库或公共组件时尤其值得重视。

## 3. 🤔 组件事件是什么？父组件如何监听子组件事件？

如果说 props 是「父传子」，那组件事件就是「子通知父」。

子组件不会直接修改父组件的数据，而是通过触发一个自定义事件，把变化意图或结果告诉父组件，再由父组件决定如何处理。

::: code-group

```html [CounterButton.vue]
<template>
  <button @click="emit('increase')">+1</button>
</template>

<script setup>
  const emit = defineEmits(['increase'])
</script>
```

```html [App.vue]
<template>
  <p>count: {{ count }}</p>
  <CounterButton @increase="count++" />
</template>

<script setup>
  import { ref } from 'vue'
  import CounterButton from './CounterButton.vue'

  const count = ref(0)
</script>
```

:::

在模板里，子组件可以通过 `$emit('事件名')` 触发事件；如果你在 `<script setup>` 中写逻辑，一般会先通过 `defineEmits()` 拿到 `emit` 函数，再在函数里调用它。

父组件则通过 `v-on`，也就是 `@事件名` 的方式来监听。

组件事件监听器同样支持 `.once` 这类修饰符：

```html
<MyDialog @confirm.once="handleConfirm" />
```

## 4. 🤔 事件参数是如何传递的？

触发事件时，你可以在事件名后面继续传递任意数量的参数，它们会原样进入父组件监听器。

::: code-group

```html [ChildButton.vue]
<template>
  <button @click="emit('increaseBy', 2)">+2</button>
</template>

<script setup>
  const emit = defineEmits(['increaseBy'])
</script>
```

```html [App.vue]
<template>
  <p>count: {{ count }}</p>
  <ChildButton @increase-by="increaseCount" />
</template>

<script setup>
  import { ref } from 'vue'
  import ChildButton from './ChildButton.vue'

  const count = ref(0)

  function increaseCount(step) {
    count.value += step
  }
</script>
```

:::

如果子组件这样写：

```js
emit('submit', formData, isDraft, source)
```

那么父组件的监听器就会依次收到这三个参数。

这个机制很直接，所以组件事件尤其适合表达「我发生了什么」和「我带来了什么数据」，比如：

1. `submit`
2. `change`
3. `select`
4. `update:modelValue`

## 5. 🤔 为什么推荐显式声明 `emits`？

Vue 并不强制你一定声明所有组件事件，但官方明确推荐你这么做。原因主要有三点：

1. 它能把组件会抛出哪些事件写成一份「公开文档」。
2. 它能帮助 Vue 区分哪些监听器属于组件自定义事件，哪些应该按透传 attribute 处理。
3. 它能避免一些和原生 DOM 事件同名时的边界问题。

在 `<script setup>` 中，最常见的写法是：

```html
<script setup>
  const emit = defineEmits(['focus', 'blur', 'submit'])
</script>
```

和 `defineProps()` 一样，`defineEmits()` 也是 `<script setup>` 专用的编译宏，应该直接写在顶层作用域里，不要放进条件分支或普通函数内部。

如果不用 `<script setup>`，则可以写成 `emits` 选项：

```js
export default {
  emits: ['focus', 'blur', 'submit'],
  setup(props, { emit }) {
    emit('submit')
  },
}
```

有一个很重要的边界：如果你把 `click` 这种原生事件名声明进了 `emits`，那么父组件上的 `@click` 将只监听组件自己触发的 `click` 事件，而不会再自动响应根元素上的原生点击事件。

这也是为什么「组件会抛出什么事件」最好明确定义，不要完全靠猜。

## 6. 🤔 组件事件如何做校验和类型标注？

和 props 一样，事件也可以做校验。

```html
<script setup>
  const emit = defineEmits({
    change: null,
    submit(payload) {
      if (payload.email && payload.password) {
        return true
      }

      console.warn('submit 事件参数不合法')
      return false
    },
  })

  function handleSubmit() {
    emit('submit', {
      email: 'ada@example.com',
      password: '123456',
    })
  }
</script>
```

这里的规则很简单：

1. 对应的值是 `null`，表示不校验。
2. 对应的值是函数，表示用这个函数校验参数。
3. 返回 `true` 才算通过。

如果你在用 TypeScript，还可以直接给事件签名加类型：

```html
<script setup lang="ts">
  const emit = defineEmits<{
    (e: 'change', id: number): void
    (e: 'submit', payload: { email: string; password: string }): void
  }>()
</script>
```

这种写法在编辑器里体验很好，事件名和参数形状都会有明确提示。

## 7. 🤔 事件名写法和传播机制有哪些边界？

组件事件的命名规则和 props 很像。

你在子组件里触发事件时可以使用 camelCase：

```js
emit('updateCount')
```

父组件在模板中监听时更推荐使用 kebab-case：

```html
<MyCounter @update-count="handleUpdate" />
```

Vue 会帮你做这层格式转换。

另外还有一个很关键的点：组件事件不会像原生 DOM 事件那样冒泡。

也就是说：

1. 父组件只能监听直接子组件抛出的事件。
2. 平级组件不能靠组件事件直接通信。
3. 跨多层通信也不适合靠一层层转抛事件来硬接。

如果通信跨层级、跨区域、跨页面，通常要考虑：

1. props + emits 逐层传递
2. provide / inject
3. 状态管理方案

所以你可以把 emits 理解成一种「局部、直接、短链路」的通信方式，它非常适合父子组件，但不适合当全局消息系统来用。

## 8. 🔗 引用

- [Vue.js 官方文档 - 组件事件][1]

[1]: https://cn.vuejs.org/guide/components/events.html
