# [0035. 为模板引用标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0035.%20%E4%B8%BA%E6%A8%A1%E6%9D%BF%E5%BC%95%E7%94%A8%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. Vue 3.5+ 推荐：`useTemplateRef()`](#3-vue-35-推荐usetemplateref)
- [4. Vue 3.4 及以下：使用 `ref<T | null>(null)`](#4-vue-34-及以下使用-reft--nullnull)
- [5. 常见 DOM 元素类型](#5-常见-dom-元素类型)
- [6. 如果你不确定具体元素类型，也可以使用更宽泛的：`HTMLElement`](#6-如果你不确定具体元素类型也可以使用更宽泛的htmlelement)
- [7. Vue 3.5+ 可以自动推导](#7-vue-35-可以自动推导)
- [8. 组件模板引用的类型 `InstanceType<typeof Child>`](#8-组件模板引用的类型-instancetypetypeof-child)
- [9. `<script setup>` 封闭子组件需要 `defineExpose` 显示暴露需要被外部消费的成员](#9-script-setup-封闭子组件需要-defineexpose-显示暴露需要被外部消费的成员)
- [10. 可以只标注组件暴露出来的公开接口](#10-可以只标注组件暴露出来的公开接口)
- [11. 如果只需要通用组件实例类型，可以使用 `ComponentPublicInstance`](#11-如果只需要通用组件实例类型可以使用-componentpublicinstance)
  - [11.1. `ComponentPublicInstance`](#111-componentpublicinstance)
  - [11.2. 示例](#112-示例)
  - [11.3. 适用场景](#113-适用场景)
  - [11.4. 小结](#114-小结)
- [12. 动态组件引用的类型标注](#12-动态组件引用的类型标注)
  - [12.1. 先给结论](#121-先给结论)
  - [12.2. 动态组件引用](#122-动态组件引用)
    - [示例：只需要通用组件实例的能力 `ComponentPublicInstance`](#示例只需要通用组件实例的能力-componentpublicinstance)
    - [示例；通过类型守卫访问自定义方法](#示例通过类型守卫访问自定义方法)
    - [示例：联合类型](#示例联合类型)
    - [示例：约定统一接口](#示例约定统一接口)
- [13. `v-for` 中的模板引用](#13-v-for-中的模板引用)
  - [13.1. 示例](#131-示例)
  - [13.2. 注意：收集到的模板引用列表顺序不可靠](#132-注意收集到的模板引用列表顺序不可靠)
- [14. `v-if` 会让模板引用在运行过程中重新变成 `null`](#14-v-if-会让模板引用在运行过程中重新变成-null)
- [15. 常见错误](#15-常见错误)
  - [15.1. 错误 1：忘记处理 null](#151-错误-1忘记处理-null)
  - [15.2. 错误 2：把模板引用标成普通元素类型](#152-错误-2把模板引用标成普通元素类型)
  - [15.3. 错误 3：组件引用忘记使用组件实例类型](#153-错误-3组件引用忘记使用组件实例类型)
- [16. 推荐写法总结](#16-推荐写法总结)
  - [16.1. Vue 3.5+ DOM ref](#161-vue-35-dom-ref)
  - [16.2. Vue 3.4 及以下 DOM ref](#162-vue-34-及以下-dom-ref)
  - [16.3. 组件 ref](#163-组件-ref)
  - [16.4. 组件只暴露指定方法](#164-组件只暴露指定方法)
  - [16.5. `v-for` ref](#165-v-for-ref)
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

## 8. 组件模板引用的类型 `InstanceType<typeof Child>`

::: code-group

```html [App.vue]
<script setup lang="ts">
  import { useTemplateRef, onMounted } from 'vue'
  import Child from './Child.vue'

  // 如果引用的是组件：<Child ref="childRef" />
  // 可以使用：InstanceType<typeof Child> 来获取 Child 组件类型
  const childRef = useTemplateRef<InstanceType<typeof Child>>('childRef')

  onMounted(() => {
    childRef.value?.someMethod()
    // childRef.value 的类型：
    // InstanceType<typeof Child> | null
    // 访问 someMethod 时需要使用 ?.
  })
</script>

<template>
  <!-- childRef 引用 Child 组件 -->
  <Child ref="childRef" />
</template>
```

```html [Child.vue]
<template>
  <h1>Child</h1>
</template>

<script setup lang="ts">
  const someMethod = () => {
    console.log('some methods...')
  }

  defineExpose({
    someMethod,
  })
</script>
```

:::

## 9. `<script setup>` 封闭子组件需要 `defineExpose` 显示暴露需要被外部消费的成员

::: code-group

```html [App.vue]
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

```html [ChildInput.vue]
<script setup lang="ts">
  // 如果子组件使用的是 <script setup>，它默认是“封闭”的。
  // 也就是说，父组件通过模板引用不能随便访问子组件内部变量或方法，子组件需要显式暴露。
  import { ref } from 'vue'

  const inputRef = ref<HTMLInputElement | null>(null)

  function focus() {
    inputRef.value?.focus()
  }

  // 可以通过 defineExpose() 来显示暴露需要被外部消费的内容
  // 如果没有 defineExpose()，父组件就不能通过模板引用访问 focus()。
  defineExpose({
    focus,
  })
</script>
<template>
  <input ref="inputRef" />
</template>
```

:::

## 10. 可以只标注组件暴露出来的公开接口

如果父组件只需要调用子组件暴露出来的少量方法，不想依赖整个组件实例类型，可以手动定义一个公开接口类型。

适用场景：这种写法适合弹窗、抽屉、表单、编辑器等有内部状态或 DOM 行为的组件。

注意边界：如果逻辑本身不依赖组件模板或 Vue 状态，就不应该通过组件 ref 暴露，直接封装工具函数或 composable 更合适。

示例：

::: code-group

```ts [Modal.types.ts]
export interface ModalExpose {
  open: () => void
  close: () => void
}
```

```html [Modal.vue]
<script setup lang="ts">
  import { ref } from 'vue'
  import type { ModalExpose } from './Modal.types'

  const visible = ref(false)

  function open() {
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  // 这种写法也很常见
  // 优点：
  // 1. 类型更简洁
  // 2. 符合最小必要导出原则
  defineExpose<ModalExpose>({
    open,
    close,
  })
</script>

<template>
  <div v-if="visible">
    <button @click="close">关闭</button>
    <slot />
  </div>
</template>
```

```html [App.vue]
<script setup lang="ts">
  import { useTemplateRef } from 'vue'
  import Modal from './Modal.vue'
  import type { ModalExpose } from './Modal.types'

  const modalRef = useTemplateRef<ModalExpose>('modalRef')

  function handleOpen() {
    modalRef.value?.open()
  }
</script>

<template>
  <Modal ref="modalRef">内容</Modal>
  <button @click="handleOpen">打开</button>
</template>
```

:::

## 11. 如果只需要通用组件实例类型，可以使用 `ComponentPublicInstance`

### 11.1. `ComponentPublicInstance`

如果父组件不关心子组件的具体类型，也不需要访问子组件自定义暴露的方法，只想把模板引用标注为“某个 Vue 组件实例”，可以使用 `ComponentPublicInstance`。

这种写法常用于动态组件、组件库内部实现，或者只需要访问 `$el` 等通用实例属性的场景。普通业务代码中，如果需要调用子组件的自定义方法，更推荐使用 `InstanceType<typeof Component>` 或手动定义暴露接口。

### 11.2. 示例

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

  function logRootEl() {
    console.log(childRef.value?.$el)
  }
</script>

<template>
  <Child ref="childRef" />
</template>
```

这种方式只能拿到比较通用的组件实例能力，不适合访问具体的自定义方法。

### 11.3. 适用场景

你只想把这个模板引用标成“某个 Vue 组件实例”，但你不关心它具体是哪一个组件，也不打算访问它自定义暴露的方法。

- 动态组件类型不确定，只需要保存一个“组件实例引用”。
- 只访问 Vue 组件实例的通用能力，比如 `$el`、`$props`、`$attrs`、`$emit`、`$forceUpdate()` 等。
- 写一些偏底层的组件库、容器组件、动态渲染器时，不关心具体业务组件类型。
- 临时兜底：暂时不知道组件精确类型，但又不想写成 `any`。

### 11.4. 小结

```ts
// 引用 DOM
useTemplateRef<HTMLInputElement>('inputRef')

// 引用明确的组件
useTemplateRef<InstanceType<typeof Child>>('childRef')

// 只关心组件暴露的几个方法
useTemplateRef<ModalExpose>('modalRef')

// 不关心具体组件，只要一个通用组件实例
useTemplateRef<ComponentPublicInstance>('childRef')
```

## 12. 动态组件引用的类型标注

### 12.1. 先给结论

- 只访问 `$el`、`$attrs`、`$props` 这类通用实例能力：用 `ComponentPublicInstance`。
- 多个动态组件暴露同一套方法：更推荐定义统一接口，比如 `validate()`、`reset()`。
- 多个动态组件暴露不同方法，并且父组件确实要区分：用联合类型或 `ComponentPublicInstance + 类型守卫`。
- 组件来源不固定，比如低代码渲染器、插件系统：用 `ComponentPublicInstance`。

### 12.2. 动态组件引用

```html
<component :is="currentComponent" ref="componentRef" />
```

#### 示例：只需要通用组件实例的能力 `ComponentPublicInstance`

```ts
import type { ComponentPublicInstance } from 'vue'

const componentRef = useTemplateRef<ComponentPublicInstance>('componentRef')

console.log(componentRef.value?.$el)
```

动态组件引用可以使用 `ComponentPublicInstance` 作为通用兜底类型。

如果父组件需要访问动态子组件暴露的自定义方法，更推荐根据场景使用统一暴露接口、联合类型，或配合类型守卫进一步收窄类型。

#### 示例；通过类型守卫访问自定义方法

```ts
import type { ComponentPublicInstance } from 'vue'

interface StepExpose {
  validate: () => boolean | Promise<boolean>
}

function hasValidate(
  instance: ComponentPublicInstance | null,
): instance is ComponentPublicInstance & StepExpose {
  return (
    typeof (instance as Partial<StepExpose> | null)?.validate === 'function'
  )
}
```

使用：

```ts
if (hasValidate(componentRef.value)) {
  await componentRef.value.validate()
}
```

#### 示例：联合类型

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

如果要精确定位具体的类型，可以再利用类型守卫进一步细分。

#### 示例：约定统一接口

如果你的动态组件本来就约定都要提供 `validate()`，那直接写成统一接口更清晰：

```ts
interface StepExpose {
  validate: () => boolean | Promise<boolean>
}

const stepRef = useTemplateRef<StepExpose>('stepRef')
```

## 13. `v-for` 中的模板引用

### 13.1. 示例

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

### 13.2. 注意：收集到的模板引用列表顺序不可靠

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

## 14. `v-if` 会让模板引用在运行过程中重新变成 `null`

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

## 15. 常见错误

### 15.1. 错误 1：忘记处理 null

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

### 15.2. 错误 2：把模板引用标成普通元素类型

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

### 15.3. 错误 3：组件引用忘记使用组件实例类型

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

### 16.1. Vue 3.5+ DOM ref

```ts
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
```

```html
<input ref="inputRef" />
```

### 16.2. Vue 3.4 及以下 DOM ref

```ts
const inputRef = ref<HTMLInputElement | null>(null)
```

```html
<input ref="inputRef" />
```

### 16.3. 组件 ref

```ts
import Child from './Child.vue'

const childRef = useTemplateRef<InstanceType<typeof Child>>('childRef')
```

```html
<Child ref="childRef" />
```

### 16.4. 组件只暴露指定方法

```ts
interface ModalExpose {
  open: () => void
  close: () => void
}

const modalRef = useTemplateRef<ModalExpose>('modalRef')
```

### 16.5. `v-for` ref

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
