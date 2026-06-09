# [0075. 模板引用](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0075.%20%E6%A8%A1%E6%9D%BF%E5%BC%95%E7%94%A8)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 模板引用是什么，为什么 Vue 还需要它？](#3-模板引用是什么为什么-vue-还需要它)
- [4. 在组合式 API 中，如何访问元素的模板引用？](#4-在组合式-api-中如何访问元素的模板引用)
  - [4.1. Vue 3.5+ 的推荐写法：`useTemplateRef`](#41-vue-35-的推荐写法usetemplateref)
  - [4.2. Vue 3.5 前的常见写法](#42-vue-35-前的常见写法)
  - [4.3. `useTemplateRef()` 和 `ref(null)` 只有语义差异吗？](#43-usetemplateref-和-refnull-只有语义差异吗)
- [5. 为什么模板引用只能在挂载后访问，而且它有时会是 null？](#5-为什么模板引用只能在挂载后访问而且它有时会是-null)
- [6. 组件上的 ref 得到的是什么？为什么 `<script setup>` 组件默认私有？](#6-组件上的-ref-得到的是什么为什么-script-setup-组件默认私有)
  - [6.1. 为什么 `<script setup>` 默认私有？`defineExpose()` 的意义是什么？](#61-为什么-script-setup-默认私有defineexpose-的意义是什么)
  - [6.2. 选项式 API 子组件和 `<script setup>` 子组件有什么区别？](#62-选项式-api-子组件和-script-setup-子组件有什么区别)
  - [6.3. 如果父组件只想拿到子组件内部某个真实 DOM，该怎么做？](#63-如果父组件只想拿到子组件内部某个真实-dom该怎么做)
- [7. `v-for` 中的模板引用有什么特点？](#7-v-for-中的模板引用有什么特点)
  - [7.1. 模板引用获取到的是挂载后的元素数组](#71-模板引用获取到的是挂载后的元素数组)
  - [7.2. 注意：官方特别提醒 => `ref` 数组并不保证和源数组顺序完全一致](#72-注意官方特别提醒--ref-数组并不保证和源数组顺序完全一致)
- [8. 什么是「函数模板引用」？](#8-什么是函数模板引用)
- [9. 模板引用应该怎么用，才不容易把组件写得越来越耦合？](#9-模板引用应该怎么用才不容易把组件写得越来越耦合)
  - [9.1. 模板引用的使用建议](#91-模板引用的使用建议)
  - [9.2. 不该优先想到模板引用的情况](#92-不该优先想到模板引用的情况)
  - [9.3. 模板引用的使用边界总结](#93-模板引用的使用边界总结)
- [10. 如果真正需要 DOM 的是 composable，谁应该拥有 ref？【实战经验】](#10-如果真正需要-dom-的是-composable谁应该拥有-ref实战经验)
- [11. 为何 Vue 不保证 `ref` 数组和源数组顺序的一致性？【深入 diff 原理】](#11-为何-vue-不保证-ref-数组和源数组顺序的一致性深入-diff-原理)
- [12. 引用](#12-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 模板引用是什么，适合解决什么问题
- 组合式 API 中如何访问元素模板引用
- Vue 3.5+ 的 `useTemplateRef` 与 3.5 前的写法
- 为什么模板引用只能在挂载后访问，以及为什么它可能是 `null`
- 组件上的 `ref` 会拿到什么，和元素 `ref` 有什么区别
- `<script setup>` 组件为什么默认私有，如何通过 `defineExpose` 暴露内容
- `v-for` 中的模板引用是什么形态，有哪些注意点
- 什么是函数模板引用，以及它和字符串 `ref` 的区别
- 模板引用的使用边界与最佳实践

## 2. 评价

实战建议：优先使用 Vue 的声明式方案，只有当你真的需要碰 DOM、第三方库、或者子组件公开接口时，再考虑使用模板引用的方案。

- `useTemplateRef`、`defineExpose`、组件 `ref` 这些知识点在实战里比较常见，学习 Vue 的模板引用，主要也就是学习这几个 API 的使用。
- 高频场景主要是「元素聚焦」、「读取底层 DOM」、「初始化第三方库（挂载到某个元素上）」、「调用子组件公开方法」。
- 「只能在挂载后访问」、「值可能为 `null`」、「组件 `ref` 容易造成父子高耦合」是最容易踩坑的点。
- `v-for` 中的模板引用和函数模板引用相对低频一些，但知道它们的行为和限制后，处理复杂 DOM 收集会方便很多。

## 3. 模板引用是什么，为什么 Vue 还需要它？

简单来说，模板引用就是让你在元素或子组件挂载后，拿到它们的直接引用。

Vue 的主流思路是「声明式渲染」=> 你通常只需要关心状态，不需要自己去找 DOM、改 DOM。但在少数场景下，直接访问底层元素仍然是必要的，比如：

- 组件挂载后让输入框自动聚焦
- 读取元素尺寸、滚动位置、`textContent`
- 初始化第三方库（挂载到某个元素上）
- 调用子组件显式暴露的方法

这时候就可以使用特殊的 `ref` attribute：

```html
<input ref="my-input" />
```

`ref` 和 `key` 一样，都是 Vue 模板中的特殊 attribute。不同的是，`key` 用来帮助 Vue 识别节点，`ref` 用来在挂载后拿到元素或组件实例的直接引用。

::: tip 什么时候该用，什么时候不该用？

如果一个需求可以通过 `props`、`emits`、计算属性、条件渲染这些声明式方式完成，就优先用声明式方案。

模板引用更适合处理「必须拿到底层对象」的情况，而不是把它当成日常数据流的主要手段。

:::

## 4. 在组合式 API 中，如何访问元素的模板引用？

在 Vue 3.5+ 里，组合式 API 获取模板引用的推荐写法是 `useTemplateRef()`。

### 4.1. Vue 3.5+ 的推荐写法：`useTemplateRef`

```html
<script setup>
  import { onMounted, useTemplateRef } from 'vue'

  // 这里的参数必须和模板中的 ref 值一致
  const input = useTemplateRef('keyword-input')

  onMounted(() => {
    input.value && input.value.focus()
  })
</script>

<template>
  <input ref="keyword-input" placeholder="页面挂载后自动聚焦" />
</template>
```

这个例子里：

- 模板中的 `ref="keyword-input"` 为元素起了一个名字。
- `useTemplateRef('keyword-input')` 根据这个名字，拿到对应的模板引用。
- 组件挂载后，`input.value` 指向真实的 DOM 元素，所以可以直接调用 `focus()`。

### 4.2. Vue 3.5 前的常见写法

在 Vue 3.5 之前，通常是自己先声明一个 `ref(null)`：

```html
<script setup>
  import { onMounted, ref } from 'vue'

  const input = ref(null)

  onMounted(() => {
    input.value && input.value.focus()
  })
</script>

<template>
  <input ref="input" placeholder="3.5 前的常见写法" />
</template>
```

这两种写法本质上都能工作，但现在更推荐 `useTemplateRef()`，因为它的意图更清晰，也更贴近这个能力本身。

### 4.3. `useTemplateRef()` 和 `ref(null)` 只有语义差异吗？

不只是语义差异，它们在模板引用场景里的定位也不完全一样。

先看最直观的一点：连接方式不同。

在 Vue 3.5 前的常见写法里，你通常会先声明一个同名的 `ref(null)`，再让模板里的字符串 `ref` 去填充它：

```html
<script setup>
  import { ref } from 'vue'

  const input = ref(null)
</script>

<template>
  <input ref="input" />
</template>
```

而 `useTemplateRef()` 是通过参数显式指定要连接的模板引用名：

```html
<script setup>
  import { useTemplateRef } from 'vue'

  const el = useTemplateRef('keyword-input')
</script>

<template>
  <input ref="keyword-input" />
</template>
```

这意味着：

- 旧写法里，变量名通常会和模板中的 `ref` 名称保持一致。
- `useTemplateRef()` 里，变量名和模板名字可以不一致，真正建立连接的是函数参数，这意味着比旧写法多了一层，这可以让你更灵活地命名变量。

另外，从官方 API 类型定义来看，`useTemplateRef()` 返回的是 `Readonly<ShallowRef<T | null>>`，而不是普通的 `ref()`。这更符合模板引用的用途：它主要用来同步 DOM 元素或组件实例本身，而不是拿来做一般业务状态的深层响应式管理。

最后是类型推断。官方文档明确提到，在 TypeScript 场景下，`useTemplateRef()` 可以根据匹配到的模板元素或组件自动推断类型，这也是它相对于旧写法的一项优势。

综上，我们可以得到一下结论：

- `ref(null)` 是“通用响应式 ref 在模板引用场景里的旧写法”。
- `useTemplateRef()` 则是 Vue 3.5+ 为模板引用专门提供的、更明确也更贴合场景的写法。它不仅在语义上更清晰，还在类型推断和连接方式上提供了更好的支持，所以在 Vue 3.5+ 的项目里，推荐使用 `useTemplateRef()` 来处理模板引用。

::: tip 补充：关于使用 useTemplateRef 的 TS 支持

如果你使用的是 TypeScript，Vue 的 IDE 支持和 `vue-tsc` 会根据匹配到的元素或组件，自动推断模板引用的类型。

测试代码：

```html
<script setup>
  import { onMounted, useTemplateRef } from 'vue'

  // 这里的参数必须和模板中的 ref 值一致
  const input = useTemplateRef('keyword-input-1')

  onMounted(() => {
    input.value && input.value.focus()
  })
</script>

<template>
  <input ref="keyword-input-1" placeholder="页面挂载后自动聚焦" />
  <input ref="keyword-input-2" placeholder="页面挂载后自动聚焦" />
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-18-39-43.png)

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-18-42-13.png)

这里我们以 Vue Playground 为例来展示这个 IDE 智能提示的功能。你会发现当你使用 `useTemplateRef()` 输入引号 `useTemplateRef('')` 后，IDE 就会提示你可选的模板引用名称（`keyword-input-1`、`keyword-input-2`），这些名称都是你在模板里用 `ref` 定义的。并且当你输入其中一个模板引用名称之后，会有一个下划线提示你，你可以 Ctrl/Cmd + 鼠标左键快速跳转到这个 ref 引用对应的元素所在位置。

另外，如果你用的是选项式 API，通常会在 `mounted` 后通过 `this.$refs.xxx` 访问模板引用。但这篇笔记以组合式 API 为主，正文示例优先使用 `useTemplateRef()`。

:::

## 5. 为什么模板引用只能在挂载后访问，而且它有时会是 null？

因为模板引用对应的元素或组件，只有在它真正被渲染出来之后才存在。

在初次渲染之前，对应的元素还没挂载到页面上，所以模板引用自然拿不到值；如果这个元素之后又被卸载了，比如通过 `v-if` 控制隐藏（本质是移除 DOM 元素），它的模板引用又会重新变回 `null`。

```html
<script setup>
  import { ref, useTemplateRef, watch, nextTick } from 'vue'

  const showInput = ref(false)
  const input = useTemplateRef('name-input')

  watch(
    showInput,
    async (newVal) => {
      if (newVal) {
        await nextTick()
        input.value?.focus()
      } else {
        console.log('当前还拿不到 input，可能还没挂载，或者已经被卸载了')
      }
    },
    { immediate: true },
  )
</script>

<template>
  <button @click="showInput = !showInput">
    {{ showInput ? '隐藏输入框' : '显示输入框' }}
  </button>

  <input v-if="showInput" ref="name-input" placeholder="显示后会自动聚焦" />
</template>
```

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-18-59-01.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-18-59-08.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-18-59-01.png)

:::

控制台输出结果：

```
当前还拿不到 input，可能还没挂载，或者已经被卸载了 // 1 页面首次渲染时打印
当前还拿不到 input，可能还没挂载，或者已经被卸载了 // 从 2 切换到 3 时打印
```

这个例子里：

1. 初始时 `showInput` 是 `false`，输入框根本没渲染出来，所以 `input.value` 是 `null`。
2. 点击按钮后，输入框被挂载，`input.value` 才会指向真实的 DOM 元素。
3. 再次点击按钮后，输入框被卸载，`input.value` 又会回到 `null`。

::: tip 为什么示例里要写 `input.value?.focus()` 而不是 `input.value.focus()`？

这本质上是一种书写习惯，目的是提醒你：模板引用的值可能是 `null`，所以在访问它的方法或属性之前，最好先检查一下它是否存在。如果你直接写 `input.value.focus()`，当 `input.value` 是 `null` 时，就会抛出一个错误，导致整个组件崩溃。而使用可选链 `?.`，当 `input.value` 是 `null` 时，表达式会短路返回 `undefined`，不会抛出错误，这样就更安全了。

始终记住：模板引用不是一直存在的值，它会随着挂载和卸载变化。只要有 `v-if`、条件渲染、异步组件等情况，就必须考虑它为 `null` 的可能性。你也可以养成书写习惯，无论是否在程序中书写了可能导致模板引用为空的逻辑，都使用可选链 `input.value?.xxx` 来访问模板引用的方法或属性，这样可以避免很多潜在的错误。

:::

## 6. 组件上的 ref 得到的是什么？为什么 `<script setup>` 组件默认私有？

- 给元素加 `ref` 时，拿到的是 DOM 元素。
- 给子组件加 `ref` 时，拿到的是组件实例，这意味着，父组件可以通过组件 `ref` 去调用子组件显式公开的方法。

::: code-group

```html [App.vue]
<script setup>
  import { useTemplateRef } from 'vue'
  import ChildInput from './ChildInput.vue'

  const child = useTemplateRef('child')

  function handleFocus() {
    child.value?.focusInput()
  }

  function handleClear() {
    child.value?.clearInput()
  }
</script>

<template>
  <ChildInput ref="child" />

  <button @click="handleFocus">让子组件聚焦</button>
  <button @click="handleClear">清空子组件输入框</button>
</template>
```

```html [ChildInput.vue]
<script setup>
  import { useTemplateRef } from 'vue'

  const input = useTemplateRef('input')

  function focusInput() {
    input.value?.focus()
  }

  function clearInput() {
    if (input.value) {
      input.value.value = ''
    }
  }

  defineExpose({
    focusInput,
    clearInput,
  })
</script>

<template>
  <input ref="input" placeholder="我是子组件里的 input" />
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-20-05-32.png)

父组件通过 `ref="child"` 拿到的是 `<ChildInput />` 的组件实例。但因为子组件使用了 `<script setup>`，默认是私有的，所以父组件只能访问 `defineExpose()` 暴露出来的方法。

### 6.1. 为什么 `<script setup>` 默认私有？`defineExpose()` 的意义是什么？

因为 Vue 不希望父组件天然拿到子组件内部的全部实现细节。

如果父组件想访问子组件，就应该由子组件主动决定暴露什么，这也是 `defineExpose()` 的意义：它不是“把子组件打开”，而是“只公开一小部分真正需要的公共接口”。

如果你使用的是 Vue 3.5 之前的写法，组件 `ref` 的思路也一样，只是通常先在 `<script setup>` 里自己声明 `const child = ref(null)`，再通过 `<Child ref="child" />` 去接收组件实例。

::: tip `defineExpose()` 调用的注意事项

`defineExpose()` 必须在任何 `await` 之前调用。否则，在 `await` 之后才暴露的属性和方法，父组件将无法访问。

:::

### 6.2. 选项式 API 子组件和 `<script setup>` 子组件有什么区别？

这是组件 `ref` 里很关键的一个边界：

| 子组件写法 | 父组件通过 ref 能拿到什么 |
| --- | --- |
| 选项式 API 或普通 `<script>` | 拿到完整组件实例，和子组件的 `this` 基本一致 |
| `<script setup>` | 默认拿不到内部内容，只能拿到 `defineExpose()` 暴露出的部分 |

也就是说，如果子组件是选项式 API，父组件几乎可以访问它的全部属性和方法，这会让父子组件很容易变得高耦合。

同样的，如果子组件使用的是 `<script setup>`，那你本来就不应该期待父组件拿到它的“完整内部细节”。这是 Vue 故意设置的边界：它希望你优先通过 `props`、`emits`、状态提升、`provide/inject` 等方式来实现跨组件的协作。如果确实需要父组件直接介入，再通过 `defineExpose()` 暴露最小必要接口。

所以在实际开发里，更推荐你把组件 `ref` 当成一种「最后手段」：只有当 `props` / `emits` 不合适、并且确实需要父组件主动控制子组件时，再使用它。

### 6.3. 如果父组件只想拿到子组件内部某个真实 DOM，该怎么做？

最常见的做法有两种。

第一种是让子组件自己拿到元素引用，再通过 `defineExpose()` 主动暴露给父组件。这种方式的控制权在子组件手里，更符合“子组件封装细节，对外只暴露必要接口”的思路。

::: code-group

```html [Child.vue]
<script setup>
  import { useTemplateRef } from 'vue'

  const input = useTemplateRef('input')

  defineExpose({ input })
</script>

<template>
  <input ref="input" placeholder="子组件内部的输入框" />
</template>
```

```html [App.vue]
<script setup>
  import { useTemplateRef } from 'vue'
  import Child from './Child.vue'

  const child = useTemplateRef('child')

  function focusChildInput() {
    child.value?.input?.focus()
  }
</script>

<template>
  <Child ref="child" />
  <button @click="focusChildInput">聚焦子组件内部输入框</button>
</template>
```

:::

第二种是由外部把一个 setter 或 ref 传给子组件，让子组件负责绑定到目标元素上。这种模式下，控制权会更偏向外部调用方。

它不是官方文档的主线写法，但在“父组件或 composable 需要灵活接管子组件内部某个 DOM”时会用到。

::: tip 怎么选？

- 如果子组件想对外暴露一个稳定接口，优先 `defineExpose()`。
- 如果真正消费 DOM 的是外部逻辑（比如某个特定的 composable），而子组件只负责把某个元素绑定出去，setter / 函数 `ref` 模式会更灵活。

:::

## 7. `v-for` 中的模板引用有什么特点？

### 7.1. 模板引用获取到的是挂载后的元素数组

当你在 `v-for` 中使用模板引用时，拿到的不再是单个元素，而是一组元素组成的数组。

```html
<script setup>
  import { onMounted, ref, useTemplateRef } from 'vue'

  const frameworks = ref([
    { id: 1, name: 'Vue' },
    { id: 2, name: 'React' },
    { id: 3, name: 'Svelte' },
  ])

  const itemRefs = useTemplateRef('items')

  onMounted(() => {
    console.log(itemRefs.value.map((el) => el.textContent))
  })
</script>

<template>
  <ul>
    <li v-for="item in frameworks" :key="item.id" ref="items">
      {{ item.name }}
    </li>
  </ul>
</template>
```

组件挂载后，`itemRefs.value` 里会包含整组 `li` 元素。

这很适合处理「批量读取 DOM 元素，然后统一做某种初始化」这类需求。

如果你使用的是 Vue 3.5 之前的版本，通常需要自己声明一个数组引用，例如 `const itemRefs = ref([])`，然后在模板里写 `ref="itemRefs"`。无论哪种写法，官方都强调了：这个数组的顺序不保证和源数组完全一致。

### 7.2. 注意：官方特别提醒 => `ref` 数组并不保证和源数组顺序完全一致

所以如果你需要稳定地根据某个业务 id 找到对应元素，不要过度依赖数组下标，更稳妥的做法通常是使用函数模板引用，自己按 id 建立映射关系。

```html
<script setup>
  import { ref } from 'vue'

  const items = ref([
    { id: 1, name: 'Vue' },
    { id: 2, name: 'React' },
    { id: 3, name: 'Svelte' },
  ])

  // 自己维护一个 id -> DOM 的映射
  const elMap = {}

  function setRef(el, id) {
    if (el) {
      elMap[id] = el // 挂载时存进去
    } else {
      delete elMap[id] // 卸载时删掉
    }
  }
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id" :ref="(el) => setRef(el, item.id)">
      {{ item.name }}
    </li>
  </ul>
</template>
```

对比一下两种写法的区别：

```html
<!-- 字符串 ref：Vue 帮你存成数组，顺序不保证 -->
<li v-for="item in items" :key="item.id" ref="itemRefs"></li>

<!-- 函数 ref：你自己按 id 存，顺序完全可控 -->
<li
  v-for="item in items"
  :key="item.id"
  :ref="(el) => setRef(el, item.id)"
></li>
```

## 8. 什么是「函数模板引用」？

除了写成字符串名字，`ref` 还可以绑定成一个函数。这样 Vue 在元素挂载、更新、卸载时，都会调用这个函数，并把元素引用传给你。

```html
<script setup>
  import { ref } from 'vue'

  const frameworks = ref([
    { id: 1, name: 'Vue' },
    { id: 2, name: 'React' },
    { id: 3, name: 'Svelte' },
  ])

  const itemElementMap = ref({})

  function setItemRef(el, id) {
    if (el) {
      itemElementMap.value[id] = el
    } else {
      delete itemElementMap.value[id]
    }
  }

  function highlightVue() {
    const VueId = frameworks.value.find((item) => item.name === 'Vue')?.id
    VueId && itemElementMap.value[VueId]?.classList.add('active')
  }

  function removeReact() {
    const ReactId = frameworks.value.find((item) => item.name === 'React')?.id
    ReactId &&
      (frameworks.value = frameworks.value.filter(
        (item) => item.id !== ReactId,
      ))
  }
</script>

<template>
  <ul>
    <li
      v-for="item in frameworks"
      :key="item.id"
      :ref="(el) => setItemRef(el, item.id)"
    >
      <!-- 这里必须使用动态绑定的 :ref 不能使用字符串 ref -->
      <!-- 官方要求「函数模板引用」的语法规则就是要使用动态的 :ref 绑定来传入一个函数。 -->
      {{ item.name }}
    </li>
  </ul>

  <button @click="highlightVue">高亮 Vue</button>
  <button @click="removeReact">移除 React</button>
</template>

<style scoped>
  .active {
    color: #0f766e;
    font-weight: 600;
  }
</style>
```

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-22-52-57.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-22-53-03.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-22-52-48.png)

:::

1. 初始状态
2. 点击「高亮 Vue」按钮之后的状态
3. 点击「移除 React」按钮之后的状态

这个写法的特点是：

- 你可以自己决定怎么存元素，不必依赖 Vue 帮你生成的数组结构（`frameworks` 是我们自定义的一个对象数组，具体的对象结构我们说了算）
- 这里我们按 `id` 建立映射，后面就可以稳定地通过 `itemElementMap.value[id]` 找元素（不依赖源数组顺序，即使数组顺序发生变化也不会影响访问）
- 当某个元素被卸载时，函数还会再被调用一次，我们可以顺手把映射删除掉（这时传入的 `el` 会是 `null`，我们可以将 `frameworks` 中为 null 的元素从映射中删除）

## 9. 模板引用应该怎么用，才不容易把组件写得越来越耦合？

模板引用很好用，但越好用的能力，越需要有边界。

你可以把它理解成「对声明式方案的补充」，而不是替代。

### 9.1. 模板引用的使用建议

更稳妥的实践方式通常是：

- 需要聚焦、滚动、测量、初始化第三方库时，用元素模板引用。
- 需要父组件主动调用子组件公开方法时，用组件 `ref` + `defineExpose()`。
- 需要稳定地管理一批 DOM 引用时，优先考虑函数模板引用。
- 只要可能为 `null`，就先做判空处理。
- 只暴露最小必要接口，不要把子组件整个内部状态都暴露给父组件。

### 9.2. 不该优先想到模板引用的情况

反过来说，下面这些场景通常不该优先想到模板引用：

- 父组件只是想把数据传给子组件 => 优先 `props`
- 子组件只是想通知父组件 => 优先 `emits`
- 只是想根据状态切换界面 => 优先条件渲染、类名绑定、样式绑定

### 9.3. 模板引用的使用边界总结

- 模板引用适合解决「我必须拿到底层对象」的问题。
- 如果只是数据流和界面状态问题，优先继续沿着 Vue 的声明式思路走。

## 10. 如果真正需要 DOM 的是 composable，谁应该拥有 ref？【实战经验】

这里有一个很实用的判断标准：谁消费 DOM，谁就拥有 ref。

如果某个 DOM 元素真正是给某个 composable 使用的，那么更自然的做法通常不是让父组件创建一个 ref 再层层传下去，而是让 composable 自己持有这个 ref，再暴露一个 setter 交给子组件去绑定。

::: code-group

```js [useAutoScroll.js]
// useAutoScroll.js — composable 自己拥有 ref，自己消费
export function useAutoScroll() {
  const scrollContainer = ref(null) // scrollContainer 这个 ref 只被这个 composable 自己消费
  // 秉持着谁的数据谁负责的原则，composable 自己创建 ref，也应该自己管理它的生命周期
  // 对于外部的调用者来说，完全不需要关心 scrollContainer 的存在，他们只需要通过 setScrollContainer 这个接口把 DOM 元素传进来就好了

  function setScrollContainer(el) {
    scrollContainer.value = el
  }

  // 内部逻辑依赖这个 DOM 元素
  function scrollToBottom() {
    scrollContainer.value?.scrollTo({
      top: scrollContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  }

  // 其他逻辑...

  return { setScrollContainer, scrollToBottom }
}
```

```html [ChatMessages.vue]
<!-- ChatMessages.vue — 子组件只负责绑定，不关心谁在用 -->
<script setup>
  defineProps({
    setContainerRef: { type: Function, required: true },
  })
</script>

<template>
  <div :ref="(el) => setContainerRef(el)" class="messages">
    <slot />
  </div>
</template>
```

```html [ChatPage.vue]
<!-- ChatPage.vue — 父组件只负责调度，不持有 ref -->
<script setup>
  import { useAutoScroll } from './useAutoScroll'
  import ChatMessages from './ChatMessages.vue'

  const { setScrollContainer, scrollToBottom } = useAutoScroll()
</script>

<template>
  <ChatMessages :set-container-ref="setScrollContainer">
    <!-- 消息内容 -->
  </ChatMessages>
  <button @click="scrollToBottom">滚到底部</button>
</template>
```

:::

这种写法的好处是：

- 父组件只负责调度和连接，不负责“代持”一个自己并不消费的 ref。
- composable 自己拥有 ref，也自己消费 ref，内聚性更好。
- 子组件只负责把真实 DOM 绑定出去，不需要知道外部到底是谁在用它。

当然，如果某个 composable 只会被某个特定子组件使用，那最简单的做法往往是直接把 composable 放进子组件内部，而不是再提升到父组件做统一调度。

## 11. 为何 Vue 不保证 `ref` 数组和源数组顺序的一致性？【深入 diff 原理】

ref 数组的顺序取决于 Vue 内部 diff 算法的处理顺序，而不是源数组的逻辑顺序。两者在简单场景下恰好一致，但在元素重排时可能不同。

::: tip 为什么 Vue 不承诺顺序？

因为 ref 的收集时机绑定在内部 patch 流程上，这是一个内部实现细节，不是公开的 API 契约。Vue 的不同版本可能会调整 diff 算法的内部实现，如果官方承诺了顺序，后续优化就会受限。所以官方文档会直接告诉你「不要依赖这个顺序」。

:::

这里我们来看一个示例来证明数据重排时 ref 数组顺序可能和源数组不一致的情况：

::: details 版本说明

以下测试示例的截图是基于 Vue Playground 中的 Vue 3.5.33 版本测试的结果，后续 Vue 版本迭代可能会优化 diff 算法的实现细节，导致结果和截图不一致，如果要复现，尽可能保持一致的版本去测试。

:::

```html
<script setup>
  import { ref, nextTick } from 'vue'

  const items = ref([1, 2, 3, 4, 5])
  const collectOrder = ref([])
  const log = ref('')

  // 用普通数组记录，避免在 patch 过程中触发响应式更新
  const _collect = []

  function track(el, id) {
    if (el) {
      _collect.push(id)
    }
  }

  async function prepend() {
    _collect.length = 0
    items.value = [items.value.length + 1, ...items.value]
    await nextTick()
    // patch 完成后，再同步到响应式数据以触发页面更新
    collectOrder.value = [..._collect]
    log.value += `源数组: [${items.value}] → 收集顺序: [${_collect}]\n`
  }
</script>

<template>
  <button @click="prepend">头部插入</button>
  <p>源数组顺序：{{ items }}</p>
  <p>ref 收集顺序：{{ collectOrder }}</p>
  <pre>{{ log }}</pre>
  <ul>
    <li v-for="item in items" :key="item" :ref="(el) => track(el, item)">
      {{ item }}
    </li>
  </ul>
</template>
```

::: swiper

![初始状态](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-21-59-44.png)

![点击「头部插入」按钮之后的状态](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-21-59-34.png)

:::

点击「头部插入」后，为什么会输出：`[5, 4, 3, 2, 1, 6]`，而不是数据源的顺序：`[6, 1, 2, 3, 4, 5]`？

Vue 的 `patchKeyedChildren` 分三步处理这个变化：

```
旧：[1, 2, 3, 4, 5]
新：[6, 1, 2, 3, 4, 5]

第 1 步 - 从头部同步：
  6 vs 1 → key 不同 → 停止

第 2 步 - 从尾部同步：
  5 vs 5 → 匹配 → patch 5  ← 收集顺序：[5]
  4 vs 4 → 匹配 → patch 4  ← 收集顺序：[5, 4]
  3 vs 3 → 匹配 → patch 3  ← 收集顺序：[5, 4, 3]
  2 vs 2 → 匹配 → patch 2  ← 收集顺序：[5, 4, 3, 2]
  1 vs 1 → 匹配 → patch 1  ← 收集顺序：[5, 4, 3, 2, 1]

第 3 步 - 挂载剩余新节点：
  mount 6                    ← 收集顺序：[5, 4, 3, 2, 1, 6]
```

从尾部同步时，Vue 从右往左依次 patch，所以收集顺序是 `[5, 4, 3, 2, 1]`。最后才挂载新节点 `6`。最终收集顺序和源数组顺序完全不同。

现在来思考一个问题：`ref` 数组的顺序和源数组顺序不一致，具体会导致啥子问题呢？

会导致的直接问题：我们在实际开发中无法正确地通过下标访问到对应的元素。比如我们想通过 `itemRefs.value[0]` 来访问 `6`，通过 `itemRefs.value[1]` 来访问 `1`，但实际上 `itemRefs.value[0]` 是 `5`，`itemRefs.value[1]` 是 `4`，完全不对。

你会发现，顺序不一致，本质上就是一个查找的问题。我们无法直接通过下标安全地访问到对应的元素了。但是，要解决这个问题本身并不难，我们只能通过元素的某个属性（比如 `id`）来建立一个映射关系，这样就可以通过这个属性来访问到对应的元素了，而不需要依赖数组的顺序了。

```html
<script setup>
  import { ref, nextTick, onMounted } from 'vue'

  const items = ref([1, 2, 3, 4, 5])
  const log = ref('')

  // 用普通对象维护 id → el 的映射
  const elMap = {}

  function track(el, id) {
    if (el) {
      elMap[id] = el
    } else {
      delete elMap[id]
    }
  }

  function printMap(tag) {
    const ids = Object.keys(elMap).map(Number)
    log.value += `[${tag}] elMap 中的 id: [${ids}]\n`
    ids.forEach((id) => {
      log.value += `  elMap[${id}].textContent = "${elMap[id].textContent}"\n`
    })
    log.value += '\n'
  }

  onMounted(() => {
    printMap('初始挂载')
  })

  async function prepend() {
    items.value = [items.value.length + 1, ...items.value]
    await nextTick()
    printMap('头部插入后')
  }
</script>

<template>
  <button @click="prepend">头部插入</button>
  <p>源数组顺序：{{ items }}</p>
  <pre>{{ log }}</pre>
  <ul>
    <li v-for="item in items" :key="item" :ref="(el) => track(el, item)">
      {{ item }}
    </li>
  </ul>
</template>
```

::: swiper

![初始状态](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-22-28-56.png)

![点击「头部插入」按钮之后的状态](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-22-29-03.png)

:::

在这个示例中，我们利用数组项的值（也可以是一个唯一的 `id`）来建立了一个 `elMap` 映射，这样无论 Vue 内部如何处理 DOM 元素，我们都可以通过 `elMap[item]` 来访问到对应的元素了，而不需要依赖 `ref` 数组的顺序了。但这个示例本身就具备一定的特殊性，它没有考虑数组成员重复的场景（如果数组里有重复的值，映射就会被覆盖了）。所以在实际开发中，如果你需要处理这种复杂的 DOM 收集场景，自己维护一个 `items[n]` -> `id` -> `el` 的映射关系，通常是更可靠的做法。

## 12. 引用

- [Vue.js 官方文档 - 模板引用][1]
- [Vue.js API - `useTemplateRef`][2]
- [Vue.js 官方文档 - `<script setup>`][3]
- [Vue.js 官方文档 - 为模板引用标注类型][4]

[1]: https://cn.vuejs.org/guide/essentials/template-refs.html
[2]: https://cn.vuejs.org/api/composition-api-helpers.html#usetemplateref
[3]: https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose
[4]: https://cn.vuejs.org/guide/typescript/composition-api.html#typing-template-refs
