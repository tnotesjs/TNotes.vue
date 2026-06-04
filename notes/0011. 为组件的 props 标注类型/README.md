# [0011. 为组件的 props 标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0011.%20%E4%B8%BA%E7%BB%84%E4%BB%B6%E7%9A%84%20props%20%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何为组件的 props 标注类型？](#3--如何为组件的-props-标注类型)
  - [3.1. 推荐写法：基于类型声明 props](#31-推荐写法基于类型声明-props)
  - [3.2. 使用 interface 标注 props](#32-使用-interface-标注-props)
  - [3.3. 从外部文件导入 Props 类型](#33-从外部文件导入-props-类型)
  - [3.4. 给 props 设置默认值](#34-给-props-设置默认值)
    - [Vue 3.5+ 推荐：解构默认值](#vue-35-推荐解构默认值)
    - [Vue 3.4 及以下：使用 withDefaults](#vue-34-及以下使用-withdefaults)
  - [3.5. 复杂类型 props](#35-复杂类型-props)
  - [3.6. 数组类型 props](#36-数组类型-props)
  - [3.7. 联合类型 props](#37-联合类型-props)
  - [3.8. 运行时声明 props](#38-运行时声明-props)
  - [3.9. 运行时声明中的复杂类型](#39-运行时声明中的复杂类型)
  - [3.10. 不能同时使用运行时声明和类型声明](#310-不能同时使用运行时声明和类型声明)
  - [3.11. 最常用的标准写法](#311-最常用的标准写法)
  - [3.12. 总结](#312-总结)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 基于类型声明 props
- 基于运行时声明 props

## 2. 🫧 评价

在 Vue 3 + TypeScript + Composition API 中，给组件 `props` 标注类型主要有两种方式：

1. 运行时声明
2. 基于类型的声明

实际开发中，使用 TS 时更推荐第二种：基于类型的声明。

## 3. 🤔 如何为组件的 props 标注类型？

### 3.1. 推荐写法：基于类型声明 props

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string
  count?: number
}>()
</script>
```

这里表示：

```ts
props.title // string
props.count // number | undefined
```

解释：

- `title: string` 是必传 prop
- `count?: number` 是可选 prop
- 可选 prop 的类型会包含 `undefined`

### 3.2. 使用 interface 标注 props

如果 props 比较多，更推荐用 `interface`：

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  disabled?: boolean
}

const props = defineProps<Props>()
</script>
```

这样可读性更好，也方便复用。

### 3.3. 从外部文件导入 Props 类型

可以把 props 类型单独放到一个文件里。

```ts
// types.ts
export interface UserCardProps {
  name: string
  age?: number
  avatar?: string
}
```

组件中使用：

```vue
<script setup lang="ts">
import type { UserCardProps } from './types'

const props = defineProps<UserCardProps>()
</script>
```

注意使用 `import type`，因为这里只导入类型。

### 3.4. 给 props 设置默认值

如果使用基于类型的声明：

```ts
interface Props {
  msg?: string
  labels?: string[]
}
```

这些字段本身是可选的。如果想设置默认值，可以使用两种方式。

---

#### Vue 3.5+ 推荐：解构默认值

```vue
<script setup lang="ts">
interface Props {
  msg?: string
  labels?: string[]
}

const { msg = 'hello', labels = ['one', 'two'] } = defineProps<Props>()
</script>
```

这样父组件不传时：

```ts
msg // string
labels // string[]
```

---

#### Vue 3.4 及以下：使用 withDefaults

```vue
<script setup lang="ts">
interface Props {
  msg?: string
  labels?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two'],
})
</script>
```

注意：数组、对象这种引用类型默认值，推荐用函数返回：

```ts
labels: () => ['one', 'two']
```

不要直接写：

```ts
labels: ['one', 'two']
```

否则可能导致多个组件实例共享同一个默认值。

### 3.5. 复杂类型 props

比如一个组件接收一本书：

```vue
<script setup lang="ts">
interface Book {
  title: string
  author: string
  year: number
}

interface Props {
  book: Book
}

const props = defineProps<Props>()
</script>
```

使用时：

```ts
props.book.title
props.book.author
props.book.year
```

这些都有完整的类型提示。

也可以写成：

```ts
const props = defineProps<{
  book: Book
}>()
```

### 3.6. 数组类型 props

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
}

interface Props {
  users: User[]
}

const props = defineProps<Props>()
</script>
```

使用：

```ts
props.users.forEach((user) => {
  user.id
  user.name
})
```

### 3.7. 联合类型 props

```vue
<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  status: 'success' | 'warning' | 'error'
}

const props = defineProps<Props>()
</script>
```

这样可以限制传入值：

```vue
<MyButton size="small" status="success" />
```

如果写成：

```vue
<MyButton size="big" status="success" />
```

TypeScript 会报错，因为 `'big'` 不在允许范围内。

### 3.8. 运行时声明 props

也可以这样写：

```vue
<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  count: Number,
})
</script>
```

Vue 会根据运行时 props 配置推导类型：

```ts
props.title // string
props.count // number | undefined
```

这种写法叫 运行时声明，因为传给 `defineProps()` 的对象会作为 Vue 的运行时 props 配置。

### 3.9. 运行时声明中的复杂类型

如果你用运行时声明，并且 prop 是复杂对象类型，需要用 `PropType`：

```vue
<script setup lang="ts">
import type { PropType } from 'vue'

interface Book {
  title: string
  author: string
  year: number
}

const props = defineProps({
  book: {
    type: Object as PropType<Book>,
    required: true,
  },
})
</script>
```

不过在 TS 项目中，更推荐直接用类型声明：

```ts
const props = defineProps<{
  book: Book
}>()
```

### 3.10. 不能同时使用运行时声明和类型声明

下面这种写法是错误的：

```ts
const props = defineProps<{
  title: string
}>({
  title: String,
})
```

`defineProps` 只能二选一：

要么运行时声明：

```ts
const props = defineProps({
  title: String,
})
```

要么类型声明：

```ts
const props = defineProps<{
  title: string
}>()
```

### 3.11. 最常用的标准写法

实际项目中我会推荐这样写：

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  size: 'medium',
})
</script>
```

或者在 Vue 3.5+ 中：

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  size?: 'small' | 'medium' | 'large'
}

const { title, count = 0, size = 'medium' } = defineProps<Props>()
</script>
```

### 3.12. 总结

在 TS + Composition API 中，给 props 标注类型最推荐：

```ts
interface Props {
  title: string
  count?: number
}

const props = defineProps<Props>()
```

如果需要默认值：

```ts
const props = withDefaults(defineProps<Props>(), {
  count: 0,
})
```

或者 Vue 3.5+：

```ts
const { title, count = 0 } = defineProps<Props>()
```

核心记住：

- `defineProps<Props>()` 是 TS 项目里最常用写法
- `?` 表示可选 prop
- 默认值用 `withDefaults` 或解构默认值
- 复杂类型直接用 interface
- 运行时声明和类型声明不能混用
