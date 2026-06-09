# [0035. 为模板引用标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0035.%20%E4%B8%BA%E6%A8%A1%E6%9D%BF%E5%BC%95%E7%94%A8%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. Vue 3.5+ 推荐：`useTemplateRef()`](#3-vue-35-推荐usetemplateref)
- [4. Vue 3.4 及以下：使用 `ref<T | null>(null)`](#4-vue-34-及以下使用-reft--nullnull)
- [5. 常见 DOM 元素类型](#5-常见-dom-元素类型)
- [6. 如果你不确定具体元素类型，也可以使用更宽泛的：`HTMLElement`](#6-如果你不确定具体元素类型也可以使用更宽泛的htmlelement)
- [7. Vue 3.5+ 可以自动推导](#7-vue-35-可以自动推导)
- [8. 组件模板引用的类型](#8-组件模板引用的类型)
- [9. `<script setup>` 子组件需要 `defineExpose`](#9-script-setup-子组件需要-defineexpose)
    - [子组件 ChildInput.vue](#子组件-childinputvue)
    - [父组件](#父组件)
- [10. 也可以手动定义组件暴露类型](#10-也可以手动定义组件暴露类型)
    - [子组件](#子组件)
    - [父组件](#父组件)
- [11. 如果不关心具体组件类型](#11-如果不关心具体组件类型)
- [12. 动态组件引用](#12-动态组件引用)
- [13. `v-for` 中的模板引用](#13-v-for-中的模板引用)
- [14. `v-if` 下的模板引用](#14-v-if-下的模板引用)
- [15. 常见错误](#15-常见错误)
    - [错误 1：忘记处理 null](#错误-1忘记处理-null)
    - [错误 2：把模板引用标成普通元素类型](#错误-2把模板引用标成普通元素类型)
    - [错误 3：组件引用忘记使用组件实例类型](#错误-3组件引用忘记使用组件实例类型)
- [16. 推荐写法总结](#16-推荐写法总结)
    - [Vue 3.5+ DOM ref](#vue-35-dom-ref)
    - [Vue 3.4 及以下 DOM ref](#vue-34-及以下-dom-ref)
    - [组件 ref](#组件-ref)
    - [组件只暴露指定方法](#组件只暴露指定方法)
    - [`v-for` ref](#v-for-ref)
- [17. 核心要点](#17-核心要点)

<!-- endregion:toc -->

## 1. 本节内容

- `useTemplateRef<T>()`
- `ref<T | null>(null)`

## 2. 评价

模板引用，也就是 template ref，常见类型标注分为两类：DOM 元素引用、组件实例引用。

- 如果你使用的是 Vue 3.5+，推荐使用：`useTemplateRef<T>()`
- 如果是 Vue 3.4 及以下，通常使用：`ref<T | null>(null)`

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

不过实际项目里，如果你希望类型更明确，仍然可以手动写：

```ts
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
```

## 8. 组件模板引用的类型

如果引用的是组件：

```html
<Child ref="childRef" />
```

可以使用：

```ts
InstanceType<typeof Child>
```

示例：

```html
<script setup lang="ts">
  import { useTemplateRef, onMounted } from 'vue'
  import Child from './Child.vue'

  const childRef = useTemplateRef<InstanceType<typeof Child>>('childRef')

  onMounted(() => {
    childRef.value?.someMethod()
  })
</script>

<template>
  <Child ref="childRef" />
</template>
```

这里：

```ts
childRef.value // InstanceType<typeof Child> | null
```

所以也要使用：

```ts
childRef.value?.someMethod()
```

## 9. `<script setup>` 子组件需要 `defineExpose`

如果子组件使用的是 `<script setup>`，它默认是“封闭”的。

也就是说，父组件通过模板引用不能随便访问子组件内部变量或方法，子组件需要显式暴露。

#### 子组件 ChildInput.vue

```html
<script setup lang="ts">
  import { ref } from 'vue'

  const inputRef = ref<HTMLInputElement | null>(null)

  function focus() {
    inputRef.value?.focus()
  }

  defineExpose({
    focus,
  })
</script>

<template>
  <input ref="inputRef" />
</template>
```

#### 父组件

```html
<script setup lang="ts">
  import { useTemplateRef, onMounted } from 'vue'
  import ChildInput from './ChildInput.vue'

  const childInputRef =
    useTemplateRef<InstanceType<typeof ChildInput>>('childInputRef')

  onMounted(() => {
    childInputRef.value?.focus()
  })
</script>

<template>
  <ChildInput ref="childInputRef" />
</template>
```

如果没有 `defineExpose()`，父组件就不能通过模板引用访问 `focus()`。

## 10. 也可以手动定义组件暴露类型

有时候你不想依赖整个组件实例类型，只关心它暴露出来的方法，可以自己定义一个类型。

#### 子组件

```html
<script setup lang="ts">
  function open() {
    console.log('open')
  }

  function close() {
    console.log('close')
  }

  defineExpose({
    open,
    close,
  })
</script>
```

#### 父组件

```html
<script setup lang="ts">
  import { useTemplateRef } from 'vue'
  import Modal from './Modal.vue'

  interface ModalExpose {
    open: () => void
    close: () => void
  }

  const modalRef = useTemplateRef<ModalExpose>('modalRef')

  function handleOpen() {
    modalRef.value?.open()
  }
</script>

<template>
  <Modal ref="modalRef" />
  <button @click="handleOpen">打开</button>
</template>
```

这种写法也很常见，优点是类型更简洁。

## 11. 如果不关心具体组件类型

可以使用 Vue 提供的 `ComponentPublicInstance`。

```ts
import type { ComponentPublicInstance } from 'vue'

const childRef = useTemplateRef<ComponentPublicInstance>('childRef')
```

示例：

```html
<script setup lang="ts">
  import { useTemplateRef } from 'vue'
  import type { ComponentPublicInstance } from 'vue'
  import Child from './Child.vue'

  const childRef = useTemplateRef<ComponentPublicInstance>('childRef')
</script>

<template>
  <Child ref="childRef" />
</template>
```

这种方式只能拿到比较通用的组件实例能力，不适合访问具体的自定义方法。

## 12. 动态组件引用

如果是动态组件：

```html
<component :is="currentComponent" ref="componentRef" />
```

可以使用联合类型：

```ts
import Foo from './Foo.vue'
import Bar from './Bar.vue'

type FooInstance = InstanceType<typeof Foo>
type BarInstance = InstanceType<typeof Bar>

const componentRef = useTemplateRef<FooInstance | BarInstance>('componentRef')
```

使用时：

```ts
if (componentRef.value) {
  console.log(componentRef.value)
}
```

如果两个组件都暴露了相同方法，也可以定义统一接口：

```ts
interface DialogExpose {
  open: () => void
  close: () => void
}

const dialogRef = useTemplateRef<DialogExpose>('dialogRef')
```

## 13. `v-for` 中的模板引用

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

注意：`v-for` 中的 ref 数组顺序不一定总是和源数组完全一致，复杂场景不要过度依赖索引对应关系。

## 14. `v-if` 下的模板引用

```html
<script setup lang="ts">
  import { ref, useTemplateRef } from 'vue'

  const visible = ref(false)
  const inputRef = useTemplateRef<HTMLInputElement>('inputRef')

  function focusInput() {
    inputRef.value?.focus()
  }
</script>

<template>
  <input v-if="visible" ref="inputRef" />
  <button @click="focusInput">聚焦</button>
</template>
```

因为有 `v-if`，元素可能不存在，所以：

```ts
inputRef.value // HTMLInputElement | null
```

必须处理 `null`。

## 15. 常见错误

#### 错误 1：忘记处理 null

```ts
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')

inputRef.value.focus()
// 报错：inputRef.value 可能是 null
```

正确：

```ts
inputRef.value?.focus()
```

或者：

```ts
if (inputRef.value) {
  inputRef.value.focus()
}
```

#### 错误 2：把模板引用标成普通元素类型

```ts
const inputRef: HTMLInputElement = ref(null)
// 错误
```

因为 `ref()` 返回的是：

```ts
Ref<T>
```

而不是：

```ts
T
```

正确：

```ts
const inputRef = ref<HTMLInputElement | null>(null)
```

或者 Vue 3.5+：

```ts
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
```

#### 错误 3：组件引用忘记使用组件实例类型

```ts
const childRef = useTemplateRef<Child>('childRef')
// 错误，Child 不是类型
```

正确：

```ts
import Child from './Child.vue'

const childRef = useTemplateRef<InstanceType<typeof Child>>('childRef')
```

## 16. 推荐写法总结

#### Vue 3.5+ DOM ref

```ts
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
```

```html
<input ref="inputRef" />
```

#### Vue 3.4 及以下 DOM ref

```ts
const inputRef = ref<HTMLInputElement | null>(null)
```

```html
<input ref="inputRef" />
```

#### 组件 ref

```ts
import Child from './Child.vue'

const childRef = useTemplateRef<InstanceType<typeof Child>>('childRef')
```

```html
<Child ref="childRef" />
```

#### 组件只暴露指定方法

```ts
interface ModalExpose {
  open: () => void
  close: () => void
}

const modalRef = useTemplateRef<ModalExpose>('modalRef')
```

#### `v-for` ref

```ts
const itemRefs = useTemplateRef<HTMLLIElement[]>('itemRefs')
```

## 17. 核心要点

- Vue 3.5+ 推荐使用 `useTemplateRef<T>()`
- Vue 3.4 及以下使用 `ref<T | null>(null)`
- DOM 引用类型写具体元素类型，比如 `HTMLInputElement`、`HTMLDivElement`
- 模板引用初始值是 `null`，访问时用可选链或类型守卫
- 组件引用使用 `InstanceType<typeof Component>`
- `<script setup>` 子组件要通过 `defineExpose()` 暴露给父组件访问
- `v-for` 中的模板引用通常是数组类型
- 在 `<script setup>` 中访问模板引用需要 `.value`
