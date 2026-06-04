# [0021. 为 reactive() 标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0021.%20%E4%B8%BA%20reactive()%20%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何为 reactive() 标注类型？](#3--如何为-reactive-标注类型)
  - [3.1. 简单对象：让 TS 自动推导](#31-简单对象让-ts-自动推导)
  - [3.2. 推荐：使用 interface 标注 reactive 变量](#32-推荐使用-interface-标注-reactive-变量)
  - [3.3. 类型别名也可以](#33-类型别名也可以)
  - [3.4. 空数组建议显式标注类型](#34-空数组建议显式标注类型)
  - [3.5. 初始值是 null 的情况](#35-初始值是-null-的情况)
  - [3.6. 可选属性](#36-可选属性)
  - [3.7. 不推荐优先使用 `reactive<T>()`](#37-不推荐优先使用-reactivet)
  - [3.8. 如果只想标注部分字段](#38-如果只想标注部分字段)
  - [3.9. reactive 数组的类型](#39-reactive-数组的类型)
  - [3.10. 如果对象需要整体替换，优先考虑 ref](#310-如果对象需要整体替换优先考虑-ref)
  - [3.11. 总结](#311-总结)
    - [简单对象：自动推导](#简单对象自动推导)
    - [复杂对象：接口标注变量类型](#复杂对象接口标注变量类型)
    - [小对象：字段断言](#小对象字段断言)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- todo

## 2. 🫧 评价

在 Vue 3 + TS + Composition API 中，`reactive()` 标注类型主要有两种常用方式：

1. 让 TS 自动推导
2. 用接口 / 类型别名标注变量类型

实际开发中推荐：简单对象自动推导，复杂对象用接口标注变量类型。

## 3. 🤔 如何为 reactive() 标注类型？

### 3.1. 简单对象：让 TS 自动推导

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

### 3.2. 推荐：使用 interface 标注 reactive 变量

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

### 3.3. 类型别名也可以

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

### 3.4. 空数组建议显式标注类型

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

### 3.5. 初始值是 null 的情况

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

### 3.6. 可选属性

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

### 3.7. 不推荐优先使用 `reactive<T>()`

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
```

此时：

```ts
state.count // number
```

而不是：

```ts
Ref<number>
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

### 3.8. 如果只想标注部分字段

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

### 3.9. reactive 数组的类型

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

### 3.10. 如果对象需要整体替换，优先考虑 ref

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

### 3.11. 总结

`reactive()` 标注类型最推荐这几种方式：

#### 简单对象：自动推导

```ts
const state = reactive({
  count: 0,
  name: '',
})
```

#### 复杂对象：接口标注变量类型

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

#### 小对象：字段断言

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
