# [0036. 为组件模板引用标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0036.%20%E4%B8%BA%E7%BB%84%E4%BB%B6%E6%A8%A1%E6%9D%BF%E5%BC%95%E7%94%A8%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 组件模板引用的类型 `InstanceType<typeof Child>`](#3-组件模板引用的类型-instancetypetypeof-child)
- [4. Vue 3.4 及以下写法](#4-vue-34-及以下写法)
- [5. 类型标注要使用 `InstanceType<typeof Child>` 而不是 `typeof Child` 或直接使用 `Child`](#5-类型标注要使用-instancetypetypeof-child-而不是-typeof-child-或直接使用-child)
- [6. `<script setup>` 封闭子组件需要 `defineExpose` 显示暴露需要被外部消费的成员](#6-script-setup-封闭子组件需要-defineexpose-显示暴露需要被外部消费的成员)
  - [6.1. 示例：使用 `defineExpose` 暴露组件内部方法](#61-示例使用-defineexpose-暴露组件内部方法)
  - [6.2. 注意：暴露 ref 时，父组件拿到的是解包后的值](#62-注意暴露-ref-时父组件拿到的是解包后的值)
- [7. 可以只标注组件暴露出来的公开接口](#7-可以只标注组件暴露出来的公开接口)
- [8. 如果只需要通用组件实例类型，可以使用 `ComponentPublicInstance`](#8-如果只需要通用组件实例类型可以使用-componentpublicinstance)
  - [8.1. `ComponentPublicInstance`](#81-componentpublicinstance)
  - [8.2. 示例](#82-示例)
  - [8.3. 适用场景](#83-适用场景)
- [9. 动态组件引用的类型标注](#9-动态组件引用的类型标注)
  - [9.1. 先给结论](#91-先给结论)
  - [9.2. 动态组件引用](#92-动态组件引用)
    - [示例：只需要通用组件实例的能力 `ComponentPublicInstance`](#示例只需要通用组件实例的能力-componentpublicinstance)
    - [示例；通过类型守卫访问自定义方法](#示例通过类型守卫访问自定义方法)
    - [示例：联合类型](#示例联合类型)
    - [示例：约定统一接口](#示例约定统一接口)
- [10. 泛型组件的成员类型标注](#10-泛型组件的成员类型标注)

<!-- endregion:toc -->

## 1. 本节内容

- `useTemplateRef<T>()`
- `ref<T | null>()`
- `InstanceType<typeof Child>`
- `defineExpose`
- `ComponentPublicInstance`
- `vue-component-type-helpers`

## 2. 评价

在 Vue 3 + TypeScript 中，为组件模板引用标注类型，最常用的是：

```ts
InstanceType<typeof Component>
```

如果是 Vue 3.5+，推荐配合：

```ts
useTemplateRef<T>()
```

核心要点汇总：

- 组件模板引用的类型通常写成：`InstanceType<typeof 组件名>`
- 如果子组件是 `<script setup>`，需要显式 `defineExpose()` 暴露成员给外部访问
- 模板引用在挂载前可能是 `null`，访问时要用 `?.` 或先判断收窄类型

```ts
// 引用明确的组件（Vue 3.5+）
useTemplateRef<InstanceType<typeof Child>>('childRef')

// 引用明确的组件（Vue 3.4 及以前）
ref<InstanceType<typeof Child> | null>(null)

// 只关心组件暴露的几个方法
useTemplateRef<ModalExpose>('modalRef')

// 不关心具体组件，只要一个通用组件实例
useTemplateRef<ComponentPublicInstance>('childRef')
```

## 3. 组件模板引用的类型 `InstanceType<typeof Child>`

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

## 4. Vue 3.4 及以下写法

```html
<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import Child from './Child.vue'

  // 如果你使用的是 Vue 3.4 及以下的版本，可以用 ref<T | null>() 来标注类型
  // 注意这里一定要包含 null，因为组件挂载前模板引用是 null
  const childRef = ref<InstanceType<typeof Child> | null>(null)

  onMounted(() => {
    childRef.value?.someMethod()
  })
</script>

<template>
  <Child ref="childRef" />
</template>
```

## 5. 类型标注要使用 `InstanceType<typeof Child>` 而不是 `typeof Child` 或直接使用 `Child`

```ts
// ❌ 错误写法
// 不要这样写：
const childRef = ref<Child | null>(null) // 错误
// 因为 Child 是一个组件值，不是实例类型。

// 也不要这样写：
const childRef = ref<typeof Child | null>(null)
// 不推荐，这表示组件定义本身，不是组件实例

// ✅ 正确写法
// 3.4 及以下版本：
const childRef = ref<InstanceType<typeof Child> | null>(null)
// Vue 3.5+ 版本：
const childRef = useTemplateRef<InstanceType<typeof Child>>('childRef')
```

## 6. `<script setup>` 封闭子组件需要 `defineExpose` 显示暴露需要被外部消费的成员

### 6.1. 示例：使用 `defineExpose` 暴露组件内部方法

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

### 6.2. 注意：暴露 ref 时，父组件拿到的是解包后的值

::: code-group

```html [App.vue]
<script setup lang="ts">
  import { useTemplateRef } from 'vue'
  import Counter from './Counter.vue'

  const counterRef = useTemplateRef<InstanceType<typeof Counter>>('counterRef')

  function handleClick() {
    counterRef.value?.increment()

    console.log(counterRef.value?.count)
    // ✅ 正确的访问方式：counterRef.value?.count
    // ❌ 错误的访问方式：counterRef.value?.count.value
    // 因为通过组件实例暴露出来的 ref 会被自动解包。
    // counterRef.value?.count 的类型：number | undefined
  }
</script>

<template>
  <button @click="handleClick">click me</button>
  <Counter ref="counterRef" />
</template>
```

```html [Counter.vue]
<script setup lang="ts">
  import { ref } from 'vue'

  const count = ref(0)

  function increment() {
    count.value++
  }

  defineExpose({
    count,
    increment,
  })
</script>
```

:::

## 7. 可以只标注组件暴露出来的公开接口

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

## 8. 如果只需要通用组件实例类型，可以使用 `ComponentPublicInstance`

### 8.1. `ComponentPublicInstance`

如果父组件不关心子组件的具体类型，也不需要访问子组件自定义暴露的方法，只想把模板引用标注为“某个 Vue 组件实例”，可以使用 `ComponentPublicInstance`。

这种写法常用于动态组件、组件库内部实现，或者只需要访问 `$el` 等通用实例属性的场景。普通业务代码中，如果需要调用子组件的自定义方法，更推荐使用 `InstanceType<typeof Component>` 或手动定义暴露接口。

### 8.2. 示例

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

### 8.3. 适用场景

你只想把这个模板引用标成“某个 Vue 组件实例”，但你不关心它具体是哪一个组件，也不打算访问它自定义暴露的方法。

- 动态组件类型不确定，只需要保存一个“组件实例引用”。
- 只访问 Vue 组件实例的通用能力，比如 `$el`、`$props`、`$attrs`、`$emit`、`$forceUpdate()` 等。
- 写一些偏底层的组件库、容器组件、动态渲染器时，不关心具体业务组件类型。
- 临时兜底：暂时不知道组件精确类型，但又不想写成 `any`。

## 9. 动态组件引用的类型标注

### 9.1. 先给结论

- 只访问 `$el`、`$attrs`、`$props` 这类通用实例能力：用 `ComponentPublicInstance`。
- 多个动态组件暴露同一套方法：更推荐定义统一接口，比如 `validate()`、`reset()`。
- 多个动态组件暴露不同方法，并且父组件确实要区分：用联合类型或 `ComponentPublicInstance + 类型守卫`。
- 组件来源不固定，比如低代码渲染器、插件系统：用 `ComponentPublicInstance`。

### 9.2. 动态组件引用

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

## 10. 泛型组件的成员类型标注

::: code-group

```html [App.vue]
<!-- 
vue-component-type-helpers 解决的是父组件通过组件实例访问泛型组件暴露成员的类型问题
-->
<script setup lang="ts">
  import { useTemplateRef, onMounted } from 'vue'
  import type { ComponentExposed } from 'vue-component-type-helpers'
  import GenericBox from './GenericBox.vue'

  // 泛型 T 被推导为 string
  const strBox =
    useTemplateRef<ComponentExposed<typeof GenericBox<string>>>('strBox')
  // 泛型 T 被推导为 number
  const numBox =
    useTemplateRef<ComponentExposed<typeof GenericBox<number>>>('numBox')

  onMounted(() => {
    const s1 = strBox.value?.value // s1 的类型推断结果：string | undefined
    const s2 = strBox.value?.getValue() // s2 的类型推断结果：string | undefined
    const n1 = numBox.value?.value // n1 的类型推断结果：number | undefined
    const n2 = numBox.value?.getValue() // n2 的类型推断结果：number | undefined
    console.log(s1, s2, n1, n2) // hello hello 123 123
  })
</script>

<template>
  <GenericBox ref="strBox" initial="hello" />
  <GenericBox ref="numBox" :initial="123" />
</template>
```

```html [GenericBox.vue]
<!-- 
可以使用 <script> 标签上的 generic 属性声明泛型类型参数
比如这里的 generic="T" 表示这个 SFC 是泛型组件

doc: https://cn.vuejs.org/api/sfc-script-setup.html#generics
-->
<script setup lang="ts" generic="T">
  import { ref } from 'vue'
  import type { Ref } from 'vue'

  const props = defineProps<{
    initial: T
  }>()

  const value = ref<T>(props.initial) as Ref<T>

  function getValue(): T {
    return value.value
  }

  defineExpose({ getValue, value })
</script>

<template>
  <p>value: {{ value }}</p>
  <p>type: {{ typeof value }}</p>
  <hr />
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-09-17-36-14.png)
