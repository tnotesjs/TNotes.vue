# [0022. 为 computed() 标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0022.%20%E4%B8%BA%20computed()%20%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何为 `computed()` 标注类型？](#3--如何为-computed-标注类型)
  - [3.1. 自动推导类型](#31-自动推导类型)
  - [3.2. 使用泛型标注 computed 类型](#32-使用泛型标注-computed-类型)
  - [3.3. 标注字符串、布尔值、联合类型](#33-标注字符串布尔值联合类型)
  - [3.4. 对象类型 computed](#34-对象类型-computed)
  - [3.5. 数组类型 computed](#35-数组类型-computed)
  - [3.6. `null` / `undefined` 场景](#36-null--undefined-场景)
  - [3.7. 使用 `ComputedRef<T>` 显式标注变量类型](#37-使用-computedreft-显式标注变量类型)
  - [3.8. 可写 computed 的类型标注](#38-可写-computed-的类型标注)
  - [3.9. 可写 computed 配合 v-model](#39-可写-computed-配合-v-model)
  - [3.10. 使用 `WritableComputedRef<T>` 标注](#310-使用-writablecomputedreft-标注)
  - [3.11. 常见错误](#311-常见错误)
    - [错误 1：把 computed 标注成普通值](#错误-1把-computed-标注成普通值)
    - [错误 2：忘记 `.value`](#错误-2忘记-value)
    - [错误 3：异步 computed 的误解](#错误-3异步-computed-的误解)
  - [3.12. 总结](#312-总结)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- todo

## 2. 🫧 评价

在 Vue 3 + TypeScript + Composition API 中，`computed()` 的类型通常有三种处理方式：

1. 让 TypeScript 自动推导
2. 给 `computed()` 传泛型参数
3. 使用 `ComputedRef<T>` / `WritableComputedRef<T>` 显式标注

最常用的是前两种。

## 3. 🤔 如何为 `computed()` 标注类型？

### 3.1. 自动推导类型

大多数情况下不用手动标注，TS 会根据 getter 的返回值自动推导。

```ts
import { ref, computed } from 'vue'

const count = ref(1)

const double = computed(() => count.value * 2)
// 推导结果：
// double // ComputedRef<number>
// double.value // number

// 使用：
double.value.toFixed(2) // 正确

double.value = 10
// 报错：只读 computed 不能赋值
```

`computed()` 返回的是一个类似 `ref` 的对象，所以在 `<script setup>` 中访问需要 `.value`：

```ts
console.log(double.value)
```

在模板中会自动解包：

```html
<template>
  <div>{{ double }}</div>
</template>
```

### 3.2. 使用泛型标注 computed 类型

如果想明确指定返回类型，可以这样写：

```ts
const double = computed<number>(() => {
  return count.value * 2
})
```

如果返回值类型不匹配，TS 会报错：

```ts
const double = computed<number>(() => {
  return 'hello'
  // 报错：string 不能赋值给 number
})
```

这是最常用的手动标注方式。

### 3.3. 标注字符串、布尔值、联合类型

```ts
const keyword = ref('')

const hasKeyword = computed<boolean>(() => {
  return keyword.value.length > 0
})
```

联合类型：

```ts
type Status = 'idle' | 'loading' | 'success' | 'error'

const loading = ref(false)
const error = ref(false)

const status = computed<Status>(() => {
  if (loading.value) return 'loading'
  if (error.value) return 'error'
  return 'idle'
})
```

此时：

```ts
status.value // 'idle' | 'loading' | 'success' | 'error'
```

### 3.4. 对象类型 computed

```ts
interface User {
  id: number
  firstName: string
  lastName: string
}

const user = ref<User>({
  id: 1,
  firstName: 'Tom',
  lastName: 'Smith',
})

const displayUser = computed(() => {
  return {
    id: user.value.id,
    fullName: `${user.value.firstName} ${user.value.lastName}`,
  }
})
```

TS 可以自动推导：

```ts
displayUser.value.id // number
displayUser.value.fullName // string
```

如果想显式标注：

```ts
interface DisplayUser {
  id: number
  fullName: string
}

const displayUser = computed<DisplayUser>(() => {
  return {
    id: user.value.id,
    fullName: `${user.value.firstName} ${user.value.lastName}`,
  }
})
```

### 3.5. 数组类型 computed

```ts
interface User {
  id: number
  name: string
  active: boolean
}

const users = ref<User[]>([])

const activeUsers = computed<User[]>(() => {
  return users.value.filter((user) => user.active)
})
```

或者让 TS 自动推导也可以：

```ts
const activeUsers = computed(() => {
  return users.value.filter((user) => user.active)
})
```

如果 `computed` 返回空数组，建议手动标注：

```ts
const emptyUsers = computed<User[]>(() => [])
```

否则可能会被推导成不理想的类型，比如 `never[]`。

### 3.6. `null` / `undefined` 场景

比如根据 id 查找用户：

```ts
const selectedId = ref<number | null>(null)
const users = ref<User[]>([])
```

如果使用 `find`：

```ts
const selectedUser = computed(() => {
  return users.value.find((user) => user.id === selectedId.value)
})
```

因为 `find()` 可能找不到，所以类型是：

```ts
ComputedRef<User | undefined>
```

如果你希望它是 `User | null`，可以这样写：

```ts
const selectedUser = computed<User | null>(() => {
  return users.value.find((user) => user.id === selectedId.value) ?? null
})
```

访问时：

```ts
selectedUser.value?.name
```

或者：

```ts
if (selectedUser.value) {
  console.log(selectedUser.value.name)
}
```

### 3.7. 使用 `ComputedRef<T>` 显式标注变量类型

也可以从 `vue` 中导入 `ComputedRef`：

```ts
import { computed } from 'vue'
import type { ComputedRef } from 'vue'

const double: ComputedRef<number> = computed(() => {
  return count.value * 2
})
```

不过实际开发中更常用：

```ts
const double = computed<number>(() => {
  return count.value * 2
})
```

因为更简洁。

### 3.8. 可写 computed 的类型标注

普通 `computed()` 是只读的：

```ts
const double = computed(() => count.value * 2)

double.value = 10
// 报错
```

如果需要可写 computed，要传入 `get` 和 `set`：

```ts
const count = ref(1)

const double = computed<number>({
  get() {
    return count.value * 2
  },
  set(value) {
    count.value = value / 2
  },
})
```

使用：

```ts
double.value = 10

console.log(count.value) // 5
```

这里：

```ts
value
```

会被推导为 `number`。

### 3.9. 可写 computed 配合 v-model

比较常见的场景是封装 `v-model`：

```html
<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    modelValue: string
  }

  interface Emits {
    'update:modelValue': [value: string]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const model = computed<string>({
    get() {
      return props.modelValue
    },
    set(value) {
      emit('update:modelValue', value)
    },
  })
</script>

<template>
  <input v-model="model" />
</template>
```

这里 `model` 是一个可写 computed：

```ts
model.value // string
model.value = 'hello' // 会触发 emit
```

### 3.10. 使用 `WritableComputedRef<T>` 标注

如果你需要显式声明变量类型，可以使用：

```ts
import { computed } from 'vue'
import type { WritableComputedRef } from 'vue'

const model: WritableComputedRef<string> = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
```

不过更常见的写法仍然是：

```ts
const model = computed<string>({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
```

### 3.11. 常见错误

#### 错误 1：把 computed 标注成普通值

```ts
const double: number = computed(() => count.value * 2)
// 错误
```

因为 `computed()` 返回的是：

```ts
ComputedRef<number>
```

不是 `number`。

正确写法：

```ts
const double = computed<number>(() => count.value * 2)

double.value // number
```

#### 错误 2：忘记 `.value`

```ts
const double = computed(() => count.value * 2)

console.log(double + 1)
// 错误
```

正确：

```ts
console.log(double.value + 1)
```

模板中例外，模板会自动解包：

```html
<template>
  <div>{{ double + 1 }}</div>
</template>
```

#### 错误 3：异步 computed 的误解

如果这样写：

```ts
const data = computed(async () => {
  const res = await fetch('/api/user')
  return res.json()
})
```

它的类型不是：

```ts
ComputedRef<User>
```

而是：

```ts
ComputedRef<Promise<User>>
```

也就是说：

```ts
data.value // Promise<User>
```

一般不推荐用 `computed` 直接处理异步请求。异步数据更适合用：

```ts
const data = ref<User | null>(null)
const loading = ref(false)
```

然后配合 `watch`、`watchEffect` 或请求函数处理。

### 3.12. 总结

`computed()` 标注类型最常用的是：

```ts
const value = computed<T>(() => {
  return ...
})
```

例如：

```ts
const double = computed<number>(() => count.value * 2)
```

复杂对象：

```ts
interface DisplayUser {
  id: number
  fullName: string
}

const displayUser = computed<DisplayUser>(() => ({
  id: user.value.id,
  fullName: `${user.value.firstName} ${user.value.lastName}`,
}))
```

可写 computed：

```ts
const model = computed<string>({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
```

核心记住：

- 简单场景让 TS 自动推导。
- 需要约束返回值时用 `computed<T>()`。
- `computed()` 返回的是 `ComputedRef<T>`，访问值要用 `.value`。
- 可写 computed 使用 `{ get, set }`。
- `ComputedRef<T>`、`WritableComputedRef<T>` 可以显式标注，但通常不如泛型写法简洁。
