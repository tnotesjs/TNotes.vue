# [0012. 为组件的 emits 标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0012.%20%E4%B8%BA%E7%BB%84%E4%BB%B6%E7%9A%84%20emits%20%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何为组件的 emits 标注类型？](#3--如何为组件的-emits-标注类型)
  - [3.1. 推荐写法：基于类型声明 emits](#31-推荐写法基于类型声明-emits)
  - [3.2. 多个参数的事件](#32-多个参数的事件)
  - [3.3. 可选参数](#33-可选参数)
  - [3.4. 没有参数的事件](#34-没有参数的事件)
  - [3.5. 带特殊事件名的写法](#35-带特殊事件名的写法)
  - [3.6. 抽离 Emits 类型](#36-抽离-emits-类型)
  - [3.7. 另一种类型声明写法：函数重载形式](#37-另一种类型声明写法函数重载形式)
  - [3.8. 运行时声明 emits](#38-运行时声明-emits)
    - [只声明事件名](#只声明事件名)
    - [带运行时校验的声明](#带运行时校验的声明)
  - [3.9. 类型声明和运行时声明不能混用](#39-类型声明和运行时声明不能混用)
  - [3.10. 类型声明和运行时声明的区别](#310-类型声明和运行时声明的区别)
  - [3.11. 实际项目推荐写法](#311-实际项目推荐写法)
  - [3.12. 总结](#312-总结)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 类型声明
- 运行时声明
- `defineEmits<Emits>()`
- 元组写法

## 2. 🫧 评价

在 Vue 3 + TypeScript + Composition API 中，组件的 `emits` 主要通过 `defineEmits()` 标注类型。

默认场景：

```html
<script setup lang="ts">
  const emit = defineEmits()
</script>
```

核心目标是：让 `emit()` 在触发事件时有事件名和参数类型检查。

## 3. 🤔 如何为组件的 emits 标注类型？

### 3.1. 推荐写法：基于类型声明 emits

Vue 3.3+ 推荐使用这种更简洁的写法：

```html
<script setup lang="ts">
  const emit = defineEmits<{
    change: [id: number]
    update: [value: string]
    close: []
  }>()

  emit('change', 1)
  emit('update', 'hello')
  emit('close')
</script>
```

含义是：

```ts
change 事件需要一个 number 类型的 id
update 事件需要一个 string 类型的 value
close 事件不需要参数
```

如果写错，TypeScript 会报错：

```ts
emit('change', '1')
// ❌ 报错：change 的参数应该是 number

emit('update', 123)
// ❌ 报错：update 的参数应该是 string

emit('close', 'abc')
// ❌ 报错：close 不需要参数

emit('submit')
// ❌ 报错：submit 不是已声明事件
```

### 3.2. 多个参数的事件

可以使用元组类型：

```ts
const emit = defineEmits<{
  select: [id: number, name: string]
}>()

emit('select', 1, 'Vue')

// select: [id: number, name: string]
// 表示触发方式是：emit('select', id, name)
// 而不是：emit('select', [id, name])
```

### 3.3. 可选参数

可以这样写：

```ts
const emit = defineEmits<{
  search: [keyword?: string]
}>()

emit('search')
emit('search', 'vue')
```

如果某个事件有多个参数，其中部分参数可选：

```ts
const emit = defineEmits<{
  change: [value: string, immediate?: boolean]
}>()

emit('change', 'hello')
emit('change', 'hello', true)
```

### 3.4. 没有参数的事件

没有参数时用空元组：

```ts
const emit = defineEmits<{
  close: []
  cancel: []
}>()

emit('close')
emit('cancel')
```

### 3.5. 带特殊事件名的写法

如果事件名里有 `-`、`:` 等字符，需要加引号。

比如自定义事件：

```ts
const emit = defineEmits<{
  'row-click': [rowId: number]
}>()

emit('row-click', 1)
```

比如 `v-model` 对应的事件：

```ts
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

emit('update:modelValue', 'hello')
```

如果是多个 `v-model`：

```ts
const emit = defineEmits<{
  'update:title': [value: string]
  'update:visible': [value: boolean]
}>()
```

### 3.6. 抽离 Emits 类型

如果事件很多，可以单独声明类型：

```html
<script setup lang="ts">
  interface Emits {
    change: [id: number]
    update: [value: string]
    close: []
  }

  const emit = defineEmits<Emits>()
</script>
```

也可以从外部文件导入：

```ts
// types.ts
export interface UserCardEmits {
  select: [id: number]
  remove: [id: number]
}
```

组件中：

```html
<script setup lang="ts">
  import type { UserCardEmits } from './types'

  const emit = defineEmits<UserCardEmits>()
</script>
```

### 3.7. 另一种类型声明写法：函数重载形式

Vue 3.3 之前更常见的是这种写法：

```ts
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
  (e: 'close'): void
}>()
```

使用方式一样：

```ts
emit('change', 1)
emit('update', 'hello')
emit('close')
```

这种写法本质上是在给 `emit` 函数声明多个调用签名。

在 Vue 3.3+ 中支持元组写法：

```ts
const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
  close: []
}>()
```

这种写法更加简洁。

### 3.8. 运行时声明 emits

除了类型声明，也可以使用运行时声明。

#### 只声明事件名

```html
<script setup>
  const emit = defineEmits(['change', 'update'])

  emit('change')
  emit('update')
</script>
```

这种写法主要是 Vue 运行时声明。

如果在 TS 环境中：

```html
<script setup lang="ts">
  const emit = defineEmits(['change', 'update'])

  emit('change')
  emit('update')
  emit('submit') // 事件名可能会被检查出来
</script>
```

它可以一定程度上限制事件名，但对事件参数的类型控制比较弱。

#### 带运行时校验的声明

```html
<script setup lang="ts">
  const emit = defineEmits({
    change: (id: number) => {
      return typeof id === 'number'
    },
    update: (value: string) => {
      return typeof value === 'string'
    },
  })

  emit('change', 1)
  emit('update', 'hello')
</script>
```

这里有两层含义：

第一，Vue 运行时会使用这些函数校验事件参数：

```ts
change: (id: number) => {
  return typeof id === 'number'
}
// 返回：true，表示校验通过。
// 返回：false，表示校验失败，开发环境下 Vue 会给出警告。
```

第二，在 `lang="ts"` 下，函数参数上的类型标注也可以帮助 TypeScript 推导 `emit` 的参数类型。

不过要注意：`id: number` 这个类型标注本身只属于 TypeScript，运行时会被擦除。

真正的运行时校验来自：`typeof id === 'number'`。

### 3.9. 类型声明和运行时声明不能混用

下面这种写法是不推荐也不允许的：

```ts
const emit = defineEmits<{
  change: [id: number]
}>(['change'])
```

`defineEmits()` 和 `defineProps()` 类似，要么使用运行时声明：

```ts
const emit = defineEmits(['change'])
```

要么使用类型声明：

```ts
const emit = defineEmits<{
  change: [id: number]
}>()
```

二选一。

### 3.10. 类型声明和运行时声明的区别

| 对比 | 运行时声明 | 类型声明 |
| --- | --- | --- |
| 写法 | `defineEmits([...])` 或 `defineEmits({...})` | `defineEmits<Emits>()` |
| 是否强依赖 TS | 不强依赖 | 强依赖 |
| 是否需要 `lang="ts"` | 不一定 | 需要 |
| 是否能做运行时校验 | 可以，尤其是对象写法 | 不能校验 payload |
| 参数类型体验 | 较弱，或依赖 validator 参数标注 | 最强 |
| 推荐场景 | 需要运行时校验时 | TS 项目中常规推荐 |

### 3.11. 实际项目推荐写法

如果你是 TS 项目，通常推荐：

```html
<script setup lang="ts">
  interface Emits {
    submit: [payload: { username: string; password: string }]
    cancel: []
    changeVisible: [visible: boolean]
  }

  const emit = defineEmits<Emits>()

  function handleSubmit() {
    emit('submit', {
      username: 'admin',
      password: '123456',
    })
  }

  function handleCancel() {
    emit('cancel')
  }

  function closeDialog() {
    emit('changeVisible', false)
  }
</script>
```

如果涉及 `v-model`，可以这样：

```html
<script setup lang="ts">
  interface Props {
    modelValue: string
  }

  interface Emits {
    'update:modelValue': [value: string]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  function updateValue(value: string) {
    emit('update:modelValue', value)
  }
</script>
```

### 3.12. 总结

在 TS + Composition API 中，为 `emits` 标注类型最推荐：

```ts
const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
  close: []
}>()
```

记住几个点：

- `defineEmits<Emits>()` 是类型声明，强依赖 TS
- Vue 3.3+ 推荐使用对象 + 元组写法
- 没有参数的事件写成 `close: []`
- 多参数事件写成 `select: [id: number, name: string]`
- `v-model` 事件写成 `'update:modelValue': [value: string]`
- 运行时声明可以不依赖 TS，但参数类型控制较弱
- 类型声明和运行时声明不能同时使用
