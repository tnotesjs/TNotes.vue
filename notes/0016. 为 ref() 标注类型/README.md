# [0016. 为 ref() 标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0016.%20%E4%B8%BA%20ref()%20%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何为 ref() 标注类型？](#3--如何为-ref-标注类型)
  - [3.1. 让 TypeScript 自动推导类型](#31-让-typescript-自动推导类型)
  - [3.2. 使用泛型参数标注 ref 类型](#32-使用泛型参数标注-ref-类型)
  - [3.3. 初始值是 null 的情况](#33-初始值是-null-的情况)
  - [3.4. 没有初始值的情况](#34-没有初始值的情况)
  - [3.5. 不依赖类型推导：直接使用 `Ref<T>` 显式标注变量类型](#35-不依赖类型推导直接使用-reft-显式标注变量类型)
  - [3.6. 数组类型 ref](#36-数组类型-ref)
  - [3.7. 对象类型 ref](#37-对象类型-ref)
  - [3.8. 字面量联合类型 ref](#38-字面量联合类型-ref)
  - [3.9. DOM 元素 ref](#39-dom-元素-ref)
  - [3.10. 常用推荐写法总结](#310-常用推荐写法总结)
    - [简单类型：让它自动推导](#简单类型让它自动推导)
    - [联合类型：手动传泛型](#联合类型手动传泛型)
    - [初始值是 null：手动传泛型](#初始值是-null手动传泛型)
    - [空数组：手动传泛型](#空数组手动传泛型)
    - [没有初始值：注意会包含 undefined](#没有初始值注意会包含-undefined)
    - [模板 DOM 引用](#模板-dom-引用)
  - [3.11. 总结](#311-总结)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `Ref<T>`
- `ref<T>()`

## 2. 🫧 评价

在 Vue 3 + TypeScript + Composition API 中，`ref()` 的类型通常有三种处理方式：

1. 让 TypeScript 自动推导
2. 给 `ref()` 传泛型参数
3. 使用 `Ref<T>` 显式标注变量类型

实际开发中最常用的是前两种，显式通过 `Ref<T>` 来标注类型偶尔也会使用，不过 3 更多的使用场景是定义接收 `ref()` 类型的参数。

::: tip 小技巧

定义好变量之后，鼠标悬停到变量上看看内置的语言服务将这个变量推断为什么类型，如果确定是自己想要的类型，那直接走 1，如果不是想要的类型，则走 2 通过泛型进一步约束。

:::

## 3. 🤔 如何为 ref() 标注类型？

### 3.1. 让 TypeScript 自动推导类型

`ref()` 会根据初始值自动推导类型。

```ts
import { ref } from 'vue'

const count = ref(0)

// 对应的类型信息：
// count // Ref<number>
// count.value // number

count.value = 1 // ✅ 正确

count.value = '1' // ❌ 报错
// TS 报错：Type 'string' is not assignable to type 'number'

// 其它类型也是类似的，可以自行完成推导：
const name = ref('Tom') // Ref<string>
const visible = ref(false) // Ref<boolean>
const list = ref<string[]>([]) // Ref<string[]>
```

### 3.2. 使用泛型参数标注 ref 类型

如果初始值不能完整表达你想要的类型，可以手动传泛型。

例如一个值既可能是 `string`，也可能是 `number`：

```ts
import { ref } from 'vue'

const year = ref<string | number>('2020')
// 此时 year 的类型是 Ref<string | number>

year.value = '2024' // ok
year.value = 2024 // ok
```

### 3.3. 初始值是 null 的情况

这是非常常见的场景。

如果直接写：

```ts
const user = ref(null)
```

TypeScript 会推导为：

```ts
Ref<null>
```

这意味着后面不能赋值对象：

```ts
user.value = {
  id: 1,
  name: 'Tom',
}
// 报错
```

正确写法是：

```ts
interface User {
  id: number
  name: string
}

const user = ref<User | null>(null)

user.value = {
  id: 1,
  name: 'Tom',
}
```

访问时要处理 `null`：

```ts
console.log(user.value?.name)
```

或者使用类型守卫：

```ts
if (user.value) {
  console.log(user.value.name)
}
```

### 3.4. 没有初始值的情况

如果调用 `ref()` 时只传泛型，不传初始值：

```ts
const count = ref<number>()
```

得到的类型是：

```ts
Ref<number | undefined>
```

因为它初始值是 `undefined`。

所以访问时需要注意：

```ts
if (count.value !== undefined) {
  console.log(count.value + 1)
}
```

或者你可以给一个明确初始值：

```ts
const count = ref<number>(0)
```

这样就是：

```ts
Ref<number>
```

### 3.5. 不依赖类型推导：直接使用 `Ref<T>` 显式标注变量类型

```ts
import { ref } from 'vue'
import type { Ref } from 'vue'

// 直接使用 Ref<T> 显式标注变量类型
const year: Ref<string | number> = ref('2020')
// 不过实际开发中更常见的是直接给 ref() 传泛型：
// const year = ref<string | number>('2020')
// 因为这种写法更加简洁一些。

year.value = 2024
```

### 3.6. 数组类型 ref

数组可以这样写：

```ts
const names = ref<string[]>([])

names.value.push('Tom')
names.value.push('Jerry')
```

如果是对象数组：

```ts
interface User {
  id: number
  name: string
}

const users = ref<User[]>([])

users.value.push({
  id: 1,
  name: 'Tom',
})
```

如果不写泛型：

```ts
const users = ref([])
```

可能会被推导成比较不理想的类型，例如 `never[]`。所以空数组通常建议显式标注：

```ts
const users = ref<User[]>([])
```

### 3.7. 对象类型 ref

```ts
interface User {
  id: number
  name: string
  age?: number
}

const user = ref<User>({
  id: 1,
  name: 'Tom',
})
```

访问：

```ts
user.value.name
user.value.age
```

如果对象一开始不存在：

```ts
const user = ref<User | null>(null)
```

### 3.8. 字面量联合类型 ref

比如状态只能是几个固定值：

```ts
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

status.value = 'loading'
status.value = 'success'

status.value = 'pending'
// TS 报错
```

再比如主题：

```ts
const theme = ref<'light' | 'dark'>('light')
```

### 3.9. DOM 元素 ref

如果是模板引用，经常会这样写：

```html
<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  const inputRef = ref<HTMLInputElement | null>(null)

  onMounted(() => {
    inputRef.value?.focus()
  })
</script>

<template>
  <input ref="inputRef" />
</template>
```

这里必须包含 `null`，因为组件挂载前 DOM 还不存在：

```ts
HTMLInputElement | null
```

访问时推荐使用可选链：

```ts
inputRef.value?.focus()
```

### 3.10. 常用推荐写法总结

#### 简单类型：让它自动推导

```ts
const count = ref(0)
const name = ref('')
const visible = ref(false)
```

#### 联合类型：手动传泛型

```ts
const value = ref<string | number>('')
```

#### 初始值是 null：手动传泛型

```ts
const user = ref<User | null>(null)
```

#### 空数组：手动传泛型

```ts
const users = ref<User[]>([])
```

#### 没有初始值：注意会包含 undefined

```ts
const count = ref<number>()
// Ref<number | undefined>
```

#### 模板 DOM 引用

```ts
const el = ref<HTMLInputElement | null>(null)
```

### 3.11. 总结

给 `ref()` 标注类型，最常用的是：

```ts
const count = ref<number>(0)
```

或者：

```ts
const user = ref<User | null>(null)
```

核心规则：

- 有明确初始值时，优先让 TS 自动推导
- 初始值是 `null` 时，用 `ref<T | null>(null)`
- 初始值是空数组时，用 `ref<T[]>([])`
- 没有初始值时，结果会是 `Ref<T | undefined>`
- 需要联合类型时，用 `ref<A | B>()`
- `Ref<T>` 可以用，但通常 `ref<T>()` 更简洁
