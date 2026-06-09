# [0035. 为模板引用标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0035.%20%E4%B8%BA%E6%A8%A1%E6%9D%BF%E5%BC%95%E7%94%A8%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. Vue 3.5+ 推荐：`useTemplateRef()`](#3-vue-35-推荐usetemplateref)
- [4. Vue 3.4 及以下：使用 `ref<T | null>(null)`](#4-vue-34-及以下使用-reft--nullnull)
- [5. 常见 DOM 元素类型](#5-常见-dom-元素类型)
- [6. 如果你不确定具体元素类型，也可以使用更宽泛的：`HTMLElement`](#6-如果你不确定具体元素类型也可以使用更宽泛的htmlelement)
- [7. Vue 3.5+ 可以自动推导](#7-vue-35-可以自动推导)
- [8. `v-for` 中的模板引用](#8-v-for-中的模板引用)
  - [8.1. 示例](#81-示例)
  - [8.2. 注意：收集到的模板引用列表顺序不可靠](#82-注意收集到的模板引用列表顺序不可靠)
- [9. `v-if` 会让模板引用在运行过程中重新变成 `null`](#9-v-if-会让模板引用在运行过程中重新变成-null)
- [10. 推荐写法总结](#10-推荐写法总结)
  - [10.1. Vue 3.5+ DOM ref](#101-vue-35-dom-ref)
  - [10.2. Vue 3.4 及以下 DOM ref](#102-vue-34-及以下-dom-ref)
  - [10.3. `v-for` ref](#103-v-for-ref)

<!-- endregion:toc -->

## 1. 本节内容

- `useTemplateRef<T>()`
- `ref<T | null>(null)`

## 2. 评价

模板引用，也就是 template ref，常见类型标注分为两类：DOM 元素引用、组件实例引用。

核心要点汇总：

- Vue 3.5+ 推荐使用 `useTemplateRef<T>()`
- Vue 3.4 及以下使用 `ref<T | null>(null)`
- DOM 引用类型写具体元素类型，比如 `HTMLInputElement`、`HTMLDivElement`
- 模板引用初始值是 `null`，访问时用可选链或类型守卫
- `v-for` 中的模板引用通常是数组类型
- 在 `<script setup>` 中访问模板引用需要 `.value`

## 3. Vue 3.5+ 推荐：`useTemplateRef()`

```html
<script setup lang="ts">
  import { useTemplateRef, onMounted } from 'vue'

  // DOM 元素引用示例：
  const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
  // 类型推断结果：
  // const inputRef: Readonly<ShallowRef<HTMLInputElement | null>>
  // 模板引用在组件挂载前是 null
  // 如果元素被 v-if 卸载，也可能再次变成 null

  onMounted(() => {
    // 访问时要注意 null
    // 可以使用 ?.
    inputRef.value?.focus()
  })
</script>

<template>
  <input ref="inputRef" />
</template>
```

## 4. Vue 3.4 及以下：使用 `ref<T | null>(null)`

```html
<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  // 这种写法现在依旧可以使用
  const inputRef = ref<HTMLInputElement | null>(null)
  // 注意初始值 null
  // 如果不写联合类型 HTMLInputElement | null
  // 直接写成下面这样，是会报错的
  // const inputRef = ref<HTMLInputElement>(null)

  onMounted(() => {
    inputRef.value?.focus()
  })
</script>

<template>
  <input ref="inputRef" />
</template>
```

## 5. 常见 DOM 元素类型

```ts
const divRef = useTemplateRef<HTMLDivElement>('divRef')
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
const textareaRef = useTemplateRef<HTMLTextAreaElement>('textareaRef')
const selectRef = useTemplateRef<HTMLSelectElement>('selectRef')
const buttonRef = useTemplateRef<HTMLButtonElement>('buttonRef')
const formRef = useTemplateRef<HTMLFormElement>('formRef')
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
const videoRef = useTemplateRef<HTMLVideoElement>('videoRef')
const audioRef = useTemplateRef<HTMLAudioElement>('audioRef')
```

示例：

```html
<script setup lang="ts">
  import { useTemplateRef, onMounted } from 'vue'

  const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    console.log(ctx)
  })
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
```

## 6. 如果你不确定具体元素类型，也可以使用更宽泛的：`HTMLElement`

```ts
const elRef = useTemplateRef<HTMLElement>('elRef')
// HTMLElement 是一个“宽类型”，只能安全使用通用 DOM API。

// 宽类型：
// 表示你在定义 elRef 时，不关心它到底是 input、div、button 还是其他具体元素。

// 适用场景：
// 模板元素可能变化，但都属于普通 HTML 元素。

// 精确类型：
// 如果你要访问具体元素才有的属性或方法，就需要更精确的类型，或者做类型守卫。
// - 如果实际业务依赖具体元素能力，推荐直接写具体类型，例如 HTMLInputElement、HTMLCanvasElement。
// - 如果元素可能是多种类型，可以写联合类型，或者用 instanceof 做类型守卫。
```

## 7. Vue 3.5+ 可以自动推导

对于静态模板引用，很多时候可以自动推导：

```html
<script setup lang="ts">
  import { useTemplateRef, onMounted } from 'vue'

  // 写法1：显式声明类型，类型更明确
  // const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
  // 写法2：等效，交给工具自行推导类型
  const inputRef = useTemplateRef('inputRef')

  onMounted(() => {
    inputRef.value?.focus()
  })
</script>

<template>
  <input ref="inputRef" />
</template>
```

这时工具可能会推导出：

```ts
inputRef.value // HTMLInputElement | null
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-09-13-39-56.png)

## 8. `v-for` 中的模板引用

### 8.1. 示例

如果一个 `ref` 出现在 `v-for` 中，拿到的会是一组元素。

Vue 3.5+：

```html
<script setup lang="ts">
  import { useTemplateRef, onMounted } from 'vue'

  const itemRefs = useTemplateRef<HTMLLIElement[]>('itemRefs')

  onMounted(() => {
    itemRefs.value?.forEach((el) => {
      console.log(el.textContent)
    })
  })
</script>

<template>
  <ul>
    <li v-for="item in 3" :key="item" ref="itemRefs">{{ item }}</li>
  </ul>
</template>
```

Vue 3.4 及以下：

```html
<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  const itemRefs = ref<HTMLLIElement[]>([])

  onMounted(() => {
    itemRefs.value.forEach((el) => {
      console.log(el.textContent)
    })
  })
</script>

<template>
  <ul>
    <li v-for="item in 3" :key="item" ref="itemRefs">{{ item }}</li>
  </ul>
</template>
```

### 8.2. 注意：收集到的模板引用列表顺序不可靠

`v-for` 中的模板引用会收集成数组，但这个数组只表示“收集到的元素集合”，不应该把 `itemRefs.value[index]` 直接当成 `items.value[index]` 对应的元素。列表发生排序、插入、删除、移动时，二者的索引关系不一定可靠。

```html
<script setup lang="ts">
  import { ref, useTemplateRef, onMounted, nextTick } from 'vue'

  interface Item {
    id: number
    text: string
  }

  const items = ref<Item[]>([
    { id: 1, text: 'A' },
    { id: 2, text: 'B' },
    { id: 3, text: 'C' },
  ])

  const itemRefs = useTemplateRef<HTMLLIElement[]>('itemRefs')

  function logOrder(label: string) {
    console.log(label)
    console.log('items 顺序：', items.value.map((item) => item.id).join(' -> '))
    console.log(
      'ref 顺序：',
      itemRefs.value?.map((el) => el.dataset.id).join(' -> '),
    )
  }

  onMounted(() => {
    logOrder('初始渲染后')
  })

  async function reverseList() {
    items.value = [...items.value].reverse()

    await nextTick()

    logOrder('反转列表后')
  }
</script>

<template>
  <button @click="reverseList">反转列表</button>

  <ul>
    <li v-for="item in items" :key="item.id" ref="itemRefs" :data-id="item.id">
      {{ item.text }}
    </li>
  </ul>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-09-14-13-12.png)

页面上列表已经变成 `3 -> 2 -> 1`，但 `itemRefs.value` 里收集到的 DOM 引用顺序可能仍然是之前的 `1 -> 2 -> 3`。

## 9. `v-if` 会让模板引用在运行过程中重新变成 `null`

不要在组件已挂载后把模板 `ref` 当成永久存在，尤其是它受 `v-if`、动态组件、条件插槽控制时。

```html
<script setup lang="ts">
  import { ref, useTemplateRef, nextTick } from 'vue'

  const visible = ref(false)
  const inputRef = useTemplateRef<HTMLInputElement>('inputRef')

  async function showAndFocus() {
    visible.value = true

    await nextTick()

    inputRef.value?.focus()
  }

  async function hideAndCheck() {
    visible.value = false

    await nextTick()

    console.log(inputRef.value) // null
  }
</script>

<template>
  <button @click="showAndFocus">显示并聚焦</button>
  <button @click="hideAndCheck">隐藏并检查</button>

  <input v-if="visible" ref="inputRef" />
</template>
```

对比 `v-show`：

- `v-if`：元素会被创建 / 销毁，ref 会在 `HTMLElement` 和 `null` 之间变化。
- `v-show`：元素一直存在，只是切换 `display`，ref 通常不会因为显示隐藏变成 `null`。

## 10. 推荐写法总结

### 10.1. Vue 3.5+ DOM ref

```ts
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
```

```html
<input ref="inputRef" />
```

### 10.2. Vue 3.4 及以下 DOM ref

```ts
const inputRef = ref<HTMLInputElement | null>(null)
```

```html
<input ref="inputRef" />
```

### 10.3. `v-for` ref

```ts
const itemRefs = useTemplateRef<HTMLLIElement[]>('itemRefs')
```
