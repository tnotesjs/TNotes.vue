# [0021. 为 reactive() 标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0021.%20%E4%B8%BA%20reactive()%20%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 简单对象：让 TS 自动推导](#3-简单对象让-ts-自动推导)
- [4. 推荐：使用 interface 标注 reactive 变量](#4-推荐使用-interface-标注-reactive-变量)
- [5. 类型别名也可以](#5-类型别名也可以)
- [6. 空数组建议显式标注类型](#6-空数组建议显式标注类型)
- [7. 初始值是 null 的情况](#7-初始值是-null-的情况)
- [8. 可选属性](#8-可选属性)
- [9. 不推荐优先使用 `reactive<T>()`](#9-不推荐优先使用-reactivet)
- [10. 如果只想标注部分字段](#10-如果只想标注部分字段)
- [11. reactive 数组的类型](#11-reactive-数组的类型)
- [12. 如果对象需要整体替换，优先考虑 ref](#12-如果对象需要整体替换优先考虑-ref)
- [13. 总结](#13-总结)
  - [13.1. 简单对象：自动推导](#131-简单对象自动推导)
  - [13.2. 复杂对象：接口标注变量类型](#132-复杂对象接口标注变量类型)
  - [13.3. 小对象：字段断言](#133-小对象字段断言)
- [14. 官方提到的 `reactive()` 标注类型时的深层次 ref 解包问题是什么？](#14-官方提到的-reactive-标注类型时的深层次-ref-解包问题是什么)
  - [14.1. 官方文档原文内容](#141-官方文档原文内容)
  - [14.2. 问题](#142-问题)
  - [14.3. 示例](#143-示例)
    - [为什么 `reactive<Book>({ price })` 会报错](#为什么-reactivebook-price--会报错)
      - [写法 1：变量类型标注（不报错）](#写法-1变量类型标注不报错)
      - [写法 2：泛型参数（报错）](#写法-2泛型参数报错)
      - [总结](#总结)

<!-- endregion:toc -->

## 1. 本节内容

- `reactive<T>()`
- `ref` 类型的深层解包问题

## 2. 评价

在 Vue 3 + TS + Composition API 中，`reactive()` 标注类型主要有两种常用方式：

1. 让 TS 自动推导
2. 用接口 / 类型别名标注变量类型

实际开发中推荐：简单对象自动推导，复杂对象用接口标注变量类型。

::: tip `reactive()` 只需简单了解即可，遵循 `ref()` 优先原则

官方确实明确推荐把 `ref()` 作为声明响应式状态的主要 API。

整个项目主要甚至全部使用 `ref()` 没有问题，而且在 TS 项目里很常见。

:::

## 3. 简单对象：让 TS 自动推导

```ts
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  name: '',
  visible: false,
})
```

此时 TS 会自动推导：

```ts
state.count // number
state.name // string
state.visible // boolean
```

所以：

```ts
state.count = 1 // 正确

state.count = '1'
// TS 报错
```

简单状态通常不需要手动写类型。

## 4. 推荐：使用 interface 标注 reactive 变量

如果状态比较复杂，推荐先定义接口：

```ts
import { reactive } from 'vue'

interface User {
  id: number
  name: string
}

interface State {
  count: number
  user: User | null
  users: User[]
  loading: boolean
}

const state: State = reactive({
  count: 0,
  user: null,
  users: [],
  loading: false,
})
```

使用时：

```ts
state.count++

state.user = {
  id: 1,
  name: 'Tom',
}

state.users.push({
  id: 2,
  name: 'Jerry',
})
```

这种写法的好处是：

- `state` 有完整类型提示
- `null`、空数组等场景类型更清晰
- 不需要使用 `reactive<T>()`

## 5. 类型别名也可以

```ts
type Status = 'idle' | 'loading' | 'success' | 'error'

type State = {
  status: Status
  message: string
}

const state: State = reactive({
  status: 'idle',
  message: '',
})
```

之后：

```ts
state.status = 'loading' // 正确

state.status = 'pending'
// TS 报错
```

## 6. 空数组建议显式标注类型

如果直接写：

```ts
const state = reactive({
  users: [],
})
```

`users` 的类型可能会被推导得不理想，比如 `never[]`。

推荐：

```ts
interface User {
  id: number
  name: string
}

interface State {
  users: User[]
}

const state: State = reactive({
  users: [],
})
```

或者只给字段做类型断言：

```ts
const state = reactive({
  users: [] as User[],
})
```

## 7. 初始值是 null 的情况

如果某个字段一开始为空，之后才赋值对象：

```ts
interface User {
  id: number
  name: string
}

interface State {
  currentUser: User | null
}

const state: State = reactive({
  currentUser: null,
})
```

访问时要处理 `null`：

```ts
console.log(state.currentUser?.name)

if (state.currentUser) {
  console.log(state.currentUser.name)
}
```

## 8. 可选属性

```ts
interface State {
  keyword?: string
  selectedId?: number
}

const state: State = reactive({})
```

之后可以赋值：

```ts
state.keyword = 'vue'
state.selectedId = 1
```

这里：

```ts
state.keyword // string | undefined
state.selectedId // number | undefined
```

## 9. 不推荐优先使用 `reactive<T>()`

虽然你可能会看到这种写法：

```ts
const state = reactive<State>({
  count: 0,
  user: null,
  users: [],
  loading: false,
})
```

它在很多简单场景下可以工作，但官方更推荐：

```ts
const state: State = reactive({
  count: 0,
  user: null,
  users: [],
  loading: false,
})
```

原因是：`reactive()` 返回的类型会处理深层响应式和 ref 解包，返回类型不一定完全等于你传入的泛型类型。

例如：

```ts
import { reactive, ref } from 'vue'

const count = ref(0)

const state = reactive({
  count,
})
// 此时：state.count 是 number 类型
// 而不是 Ref<number> 类型
```

因为 `reactive()` 会对对象属性中的 `ref` 做自动解包。

所以如果你写接口时，要按使用时的形态来写：

```ts
interface State {
  count: number
}

const state: State = reactive({
  count,
})
```

而不是：

```ts
interface State {
  count: Ref<number>
}
```

## 10. 如果只想标注部分字段

有时候不想单独声明完整 `State`，也可以对字段做类型断言。

```ts
interface User {
  id: number
  name: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const state = reactive({
  user: null as User | null,
  users: [] as User[],
  status: 'idle' as Status,
})
```

这样也很常见，尤其适合小型状态对象。

## 11. reactive 数组的类型

如果你直接让一个数组响应式：

```ts
interface Todo {
  id: number
  title: string
  done: boolean
}

const todos: Todo[] = reactive([])
```

之后可以直接操作：

```ts
todos.push({
  id: 1,
  title: 'Learn Vue',
  done: false,
})
```

注意，`reactive()` 返回的是响应式数组，不需要 `.value`：

```ts
todos.push(...) // 正确
todos.value     // 错误
```

如果这个数组经常需要整体替换，通常更推荐用 `ref`：

```ts
const todos = ref<Todo[]>([])

todos.value = []
todos.value = [{ id: 1, title: 'Learn Vue', done: false }]
```

## 12. 如果对象需要整体替换，优先考虑 ref

`reactive()` 更适合维护同一个响应式对象：

```ts
const state: State = reactive({
  count: 0,
  user: null,
  users: [],
  loading: false,
})
```

如果你要更新整个对象，不推荐这样：

```ts
// 不推荐
state = newState
```

通常应该：

```ts
Object.assign(state, newState)
```

或者直接使用：

```ts
const state = ref<State>({
  count: 0,
  user: null,
  users: [],
  loading: false,
})

state.value = newState
```

## 13. 总结

`reactive()` 标注类型最推荐这几种方式：

### 13.1. 简单对象：自动推导

```ts
const state = reactive({
  count: 0,
  name: '',
})
```

### 13.2. 复杂对象：接口标注变量类型

```ts
interface State {
  count: number
  user: User | null
  users: User[]
}

const state: State = reactive({
  count: 0,
  user: null,
  users: [],
})
```

### 13.3. 小对象：字段断言

```ts
const state = reactive({
  user: null as User | null,
  users: [] as User[],
})
```

核心记住：

- 简单场景让 TS 自动推导。
- 复杂状态用 `interface State` 标注变量。
- 空数组、`null` 初始值、联合类型通常需要显式类型。
- 不推荐优先使用 `reactive<T>()`。
- `reactive()` 会自动解包对象属性中的 `ref`。
- 如果需要整体替换对象，考虑使用 `ref<State>()`。

## 14. 官方提到的 `reactive()` 标注类型时的深层次 ref 解包问题是什么？

### 14.1. 官方文档原文内容

`reactive()` 也会隐式地从它的参数中推导类型：

```ts
import { reactive } from 'vue'

// 推导得到的类型：{ title: string }
const book = reactive({ title: 'Vue 3 指引' })
```

要显式地标注一个 `reactive` 变量的类型，我们可以使用接口：

```ts
import { reactive } from 'vue'

interface Book {
  title: string
  year?: number
}

const book: Book = reactive({ title: 'Vue 3 指引' })
```

::: tip

不推荐使用 `reactive()` 的泛型参数，因为处理了深层次 ref 解包的返回值与泛型参数的类型不同。

:::

### 14.2. 问题

“不推荐使用 `reactive()` 的泛型参数，因为处理了深层次 ref 解包的返回值与泛型参数的类型不同。”

这句话是什么意思？

### 14.3. 示例

```html
<template>
  <div>
    <p>book1.price: {{ book1.price }}</p>
    <p>book2.price: {{ book2.price }}</p>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'

  interface Book {
    title: string
    price: number
  }

  const price = ref(99)

  /**
   * 写法 1：
   * Book 标注的是 reactive 返回后的 book1 变量类型。
   *
   * reactive 返回后，price 会从 Ref<number> 解包成 number，
   * 所以可以赋值给 Book。
   */
  const book1: Book = reactive({
    title: '变量类型标注',
    price,
  })

  /**
   * 写法 2：
   * Book 作为 reactive<Book>() 的泛型参数。
   *
   * 这里 Book 会约束传给 reactive 的原始对象。
   * 但是 Book.price 要求 number，
   * 你实际传进去的是 Ref<number>，
   * 所以 vue-tsc 应该报错。
   */
  const book2 = reactive<Book>({
    title: '泛型参数标注',
    price,
    // ^ 这里会报错：Type 'Ref<number, number>' is not assignable to type 'number'.
  })
</script>
```

VS Code 中的报错截图如下：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-05-08-17-05.png)

#### 为什么 `reactive<Book>({ price })` 会报错

关键在于 Vue 的 `reactive()` 泛型参数和变量类型标注的约束时机不同。

##### 写法 1：变量类型标注（不报错）

```ts
// 这里的 Book 约束的是 reactive 的输出
// 也就是 reactive 的返回值
// 是解包之后的 price 也就是 number
const book1: Book = reactive({
  title: '变量类型标注',
  price, // 此时 price 是 Ref<number>，但是返回值会被解包，也就是 number 类型
})
```

TypeScript 的处理顺序：

1. 先推导 `reactive({...})` 的返回值类型 => Vue 的类型声明会让 `reactive` 自动解包 `Ref`，所以 `price` 在返回值中变成 `number`
2. 再检查返回值是否可赋值给 `Book` => `{ title: string; price: number }` ✅

##### 写法 2：泛型参数（报错）

```ts
// Book 约束的是 reactive 的输入（原始对象）
// 此时 price ref 还没被解包
// price 的类型还是 Ref<number>
const book2 = reactive<Book>({
  title: '泛型参数标注',
  price, // 此时 price 是 Ref<number>，和泛型参数要求的 number 类型不一致，这里就报错了！
})
```

当 `reactive` 带上泛型参数 `<Book>` 时，TypeScript 的处理顺序：

1. 用 `Book` 去约束传给 `reactive` 的输入对象（原始对象字面量）
2. 原始对象中 `price` 的类型是 `Ref<number>`（因为 `ref(99)` 的类型就是 `Ref<number>`）
3. 而 `Book.price` 要求 `number`
4. `Ref<number>` 不能赋值给 `number` ❌

##### 总结

| 写法                         | 约束时机 | 解包是否生效 |
| ---------------------------- | -------- | ------------ |
| `const x: T = reactive(...)` | 约束输出 | ✅ 已解包    |
| `reactive<T>(...)`           | 约束输入 | ❌ 尚未解包  |

所以 `reactive<Book>({ price })` 中，TypeScript 期望你传入的原始对象里 `price` 就是 `number`，而不是 `Ref<number>`。
