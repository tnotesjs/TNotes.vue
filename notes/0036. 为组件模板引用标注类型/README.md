# [0036. 为组件模板引用标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0036.%20%E4%B8%BA%E7%BB%84%E4%BB%B6%E6%A8%A1%E6%9D%BF%E5%BC%95%E7%94%A8%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 如何为组件模板引用标注类型？](#3-如何为组件模板引用标注类型)
  - [3.1. Vue 3.5+ 推荐写法](#31-vue-35-推荐写法)
    - [子组件 `ChildInput.vue`](#子组件-childinputvue)
    - [父组件](#父组件)
  - [3.2. Vue 3.4 及以下写法](#32-vue-34-及以下写法)
  - [3.3. 为什么要用 `InstanceType<typeof Child>`？](#33-为什么要用-instancetypetypeof-child)
  - [3.4. `<script setup>` 子组件必须使用 `defineExpose`](#34-script-setup-子组件必须使用-defineexpose)
  - [3.5. 如果只想暴露部分方法，可以自定义类型](#35-如果只想暴露部分方法可以自定义类型)
  - [3.6. 暴露 ref 时，父组件拿到的是解包后的值](#36-暴露-ref-时父组件拿到的是解包后的值)
  - [3.7. 动态组件引用](#37-动态组件引用)
  - [3.8. 泛型组件引用](#38-泛型组件引用)
  - [3.9. 不关心具体方法时使用 `ComponentPublicInstance`](#39-不关心具体方法时使用-componentpublicinstance)
  - [3.10. `v-for` 中的组件 ref](#310-v-for-中的组件-ref)
  - [3.11. 常见错误](#311-常见错误)
    - [错误 1：忘记处理 null](#错误-1忘记处理-null)
    - [错误 2：使用 `typeof Child` 而不是实例类型](#错误-2使用-typeof-child-而不是实例类型)
    - [错误 3：子组件没有 `defineExpose`](#错误-3子组件没有-defineexpose)
  - [3.12. 推荐写法总结](#312-推荐写法总结)
    - [Vue 3.5+](#vue-35)
    - [Vue 3.4 及以下](#vue-34-及以下)
    - [子组件使用 `<script setup>` 时](#子组件使用-script-setup-时)
    - [只关心暴露方法时](#只关心暴露方法时)

<!-- endregion:toc -->

## 1. 本节内容

- todo

## 2. 评价

在 Vue 3 + TypeScript 中，为组件模板引用标注类型，最常用的是：

```ts
InstanceType<typeof Component>
```

如果是 Vue 3.5+，推荐配合：

```ts
useTemplateRef<T>()
```

## 3. 如何为组件模板引用标注类型？

### 3.1. Vue 3.5+ 推荐写法

#### 子组件 `ChildInput.vue`

```html
<script setup lang="ts">
  function focus() {
    console.log('focus')
  }

  function clear() {
    console.log('clear')
  }

  defineExpose({
    focus,
    clear,
  })
</script>

<template>
  <input />
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
    childInputRef.value?.clear()
  })
</script>

<template>
  <ChildInput ref="childInputRef" />
</template>
```

这里：

```ts
childInputRef.value
```

的类型是：

```ts
InstanceType<typeof ChildInput> | null
```

所以访问时通常要写：

```ts
childInputRef.value?.focus()
```

### 3.2. Vue 3.4 及以下写法

如果你还没有使用 Vue 3.5，可以用普通 `ref()`：

```html
<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import ChildInput from './ChildInput.vue'

  const childInputRef = ref<InstanceType<typeof ChildInput> | null>(null)

  onMounted(() => {
    childInputRef.value?.focus()
  })
</script>

<template>
  <ChildInput ref="childInputRef" />
</template>
```

注意这里一定要包含 `null`：

```ts
ref<InstanceType<typeof ChildInput> | null>(null)
```

因为组件挂载前模板引用是 `null`。

### 3.3. 为什么要用 `InstanceType<typeof Child>`？

不要这样写：

```ts
const childRef = ref<ChildInput | null>(null)
// 错误
```

因为 `ChildInput` 是一个组件值，不是实例类型。

也不要这样写：

```ts
const childRef = ref<typeof ChildInput | null>(null)
// 不推荐，这表示组件定义本身，不是组件实例
```

正确写法是：

```ts
const childRef = ref<InstanceType<typeof ChildInput> | null>(null)
```

或者 Vue 3.5+：

```ts
const childRef = useTemplateRef<InstanceType<typeof ChildInput>>('childRef')
```

### 3.4. `<script setup>` 子组件必须使用 `defineExpose`

如果子组件使用的是 `<script setup>`，默认情况下，父组件通过模板引用不能随便访问子组件内部变量和方法。

子组件需要显式暴露：

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

父组件才可以：

```ts
modalRef.value?.open()
modalRef.value?.close()
```

如果子组件没有写：

```ts
defineExpose({
  open,
  close,
})
```

那么父组件访问：

```ts
modalRef.value?.open()
```

通常会报类型错误。

### 3.5. 如果只想暴露部分方法，可以自定义类型

有时候你不想使用整个组件实例类型，只关心它暴露的方法，可以自己定义一个接口。

```ts
interface ModalExpose {
  open: () => void
  close: () => void
}
```

父组件：

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

这种写法的好处是类型更简洁。

不过要注意：这种方式是你手动声明类型，TypeScript 不一定能自动校验它是否和子组件实际 `defineExpose()` 的内容一致。

### 3.6. 暴露 ref 时，父组件拿到的是解包后的值

子组件：

```html
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

父组件：

```html
<script setup lang="ts">
  import { useTemplateRef } from 'vue'
  import Counter from './Counter.vue'

  const counterRef = useTemplateRef<InstanceType<typeof Counter>>('counterRef')

  function handleClick() {
    counterRef.value?.increment()

    console.log(counterRef.value?.count)
  }
</script>

<template>
  <Counter ref="counterRef" />
</template>
```

这里父组件访问的是：

```ts
counterRef.value?.count
```

而不是：

```ts
counterRef.value?.count.value
```

因为通过组件实例暴露出来的 `ref` 会被自动解包。

### 3.7. 动态组件引用

如果是动态组件：

```html
<component :is="currentComponent" ref="componentRef" />
```

可以使用联合类型：

```ts
import { useTemplateRef } from 'vue'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

type FooInstance = InstanceType<typeof Foo>
type BarInstance = InstanceType<typeof Bar>

const componentRef = useTemplateRef<FooInstance | BarInstance>('componentRef')
```

如果两个组件都有相同的方法，更推荐定义统一接口：

```ts
interface DialogExpose {
  open: () => void
  close: () => void
}

const dialogRef = useTemplateRef<DialogExpose>('dialogRef')
```

这样调用更方便：

```ts
dialogRef.value?.open()
dialogRef.value?.close()
```

### 3.8. 泛型组件引用

如果子组件是泛型组件，`InstanceType<typeof Component>` 有时不够准确。

这时可以使用：

```ts
ComponentExposed
```

示例：

```ts
import { useTemplateRef } from 'vue'
import type { ComponentExposed } from 'vue-component-type-helpers'
import GenericModal from './GenericModal.vue'

const modalRef =
  useTemplateRef<ComponentExposed<typeof GenericModal>>('modalRef')
```

模板：

```html
<GenericModal ref="modalRef" />
```

这是官方文档里推荐处理泛型组件模板引用的方式。

### 3.9. 不关心具体方法时使用 `ComponentPublicInstance`

如果你只是想拿到一个通用组件实例，而不访问具体业务方法，可以用：

```ts
import type { ComponentPublicInstance } from 'vue'

const childRef = useTemplateRef<ComponentPublicInstance>('childRef')
```

例如：

```ts
childRef.value?.$el
```

但这种方式不能安全访问子组件自定义的：

```ts
childRef.value?.open()
childRef.value?.focus()
```

因为 `ComponentPublicInstance` 不知道这些方法存在。

### 3.10. `v-for` 中的组件 ref

如果组件模板引用出现在 `v-for` 中，会得到一个数组。

```html
<script setup lang="ts">
  import { useTemplateRef, onMounted } from 'vue'
  import ItemCard from './ItemCard.vue'

  const itemRefs = useTemplateRef<InstanceType<typeof ItemCard>[]>('itemRefs')

  onMounted(() => {
    itemRefs.value?.forEach((item) => {
      item.refresh()
    })
  })
</script>

<template>
  <ItemCard v-for="item in 3" :key="item" ref="itemRefs" />
</template>
```

注意：`v-for` 中 ref 数组的顺序不建议在复杂场景下强依赖。

### 3.11. 常见错误

#### 错误 1：忘记处理 null

```ts
childRef.value.open()
// 报错：childRef.value 可能是 null
```

正确：

```ts
childRef.value?.open()
```

或者：

```ts
if (childRef.value) {
  childRef.value.open()
}
```

#### 错误 2：使用 `typeof Child` 而不是实例类型

```ts
const childRef = ref<typeof Child | null>(null)
// 不推荐
```

正确：

```ts
const childRef = ref<InstanceType<typeof Child> | null>(null)
```

#### 错误 3：子组件没有 `defineExpose`

子组件：

```html
<script setup lang="ts">
  function open() {}
</script>
```

父组件：

```ts
modalRef.value?.open()
// 可能报错
```

正确：

```html
<script setup lang="ts">
  function open() {}

  defineExpose({
    open,
  })
</script>
```

### 3.12. 推荐写法总结

#### Vue 3.5+

```ts
import { useTemplateRef } from 'vue'
import Child from './Child.vue'

const childRef = useTemplateRef<InstanceType<typeof Child>>('childRef')
```

```html
<Child ref="childRef" />
```

#### Vue 3.4 及以下

```ts
import { ref } from 'vue'
import Child from './Child.vue'

const childRef = ref<InstanceType<typeof Child> | null>(null)
```

```html
<Child ref="childRef" />
```

#### 子组件使用 `<script setup>` 时

```ts
defineExpose({
  open,
  close,
})
```

#### 只关心暴露方法时

```ts
interface ModalExpose {
  open: () => void
  close: () => void
}

const modalRef = useTemplateRef<ModalExpose>('modalRef')
```

核心记住：

> 组件模板引用的类型通常写成：  
> `InstanceType<typeof 组件名>`
>
> 如果子组件是 `<script setup>`，需要 `defineExpose()`。
>
> 模板引用在挂载前可能是 `null`，访问时要用 `?.` 或先判断。
