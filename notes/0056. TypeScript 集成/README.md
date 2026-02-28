# [0056. TypeScript 集成](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0056.%20TypeScript%20%E9%9B%86%E6%88%90)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何使用 TypeScript 创建 Vue 项目？](#3--如何使用-typescript-创建-vue-项目)
- [4. 🤔 如何为组件的 Props 和 Emits 定义类型？](#4--如何为组件的-props-和-emits-定义类型)
- [5. 🤔 如何为 ref 和 reactive 定义类型？](#5--如何为-ref-和-reactive-定义类型)
- [6. 🤔 Vue 项目中的类型声明文件如何组织和使用？](#6--vue-项目中的类型声明文件如何组织和使用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 使用 TypeScript 创建 Vue 项目
- 为组件 Props、Emits 定义类型
- 为 ref、reactive 定义类型
- 类型声明文件的使用

## 2. 🫧 评价

- todo

## 3. 🤔 如何使用 TypeScript 创建 Vue 项目？

使用 TypeScript 创建 Vue 项目有两种主流方式：通过 create-vue（推荐）或通过 Vite 模板。

```bash
# 方式一：create-vue（Vue 官方脚手架）
npm create vue@latest
# 在交互式选项中选择"是否使用 TypeScript？"-> 是

# 方式二：Vite 模板
npm create vite@latest my-project -- --template vue-ts
```

项目创建后的关键配置文件：

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "env.d.ts"]
}
```

env.d.ts 类型声明文件（让 TypeScript 识别 .vue 文件和 Vite 环境变量）：

```ts
// env.d.ts
/// <reference types="vite/client" />

// .vue 文件类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 环境变量类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

IDE 配置——VS Code 推荐安装 Vue - Official 扩展（原 Volar）：

```json
// .vscode/extensions.json
{
  "recommendations": [
    "Vue.volar"
  ]
}

// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

main.ts 入口文件：

```ts
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

类型检查命令：

```json
{
  "scripts": {
    "type-check": "vue-tsc --build --force",
    "build": "vue-tsc --build --force && vite build"
  }
}
```

vue-tsc 是专门用于 Vue SFC 的 TypeScript 类型检查工具，它基于 Volar 的核心引擎，能够检查 .vue 文件中 template 和 script 的类型错误。

## 4. 🤔 如何为组件的 Props 和 Emits 定义类型？

Vue 3 的 script setup 结合 TypeScript 提供了非常优雅的 Props 和 Emits 类型定义方式。

Props 类型定义：

```html
<script setup lang="ts">
  // 方式一：纯类型声明（推荐）
  interface User {
    id: number
    name: string
    email: string
    avatar?: string
  }

  const props = defineProps<{
    // 必填 prop
    user: User

    // 可选 prop
    title?: string

    // 联合类型
    size?: 'small' | 'medium' | 'large'

    // 数组类型
    tags: string[]

    // 函数类型
    formatter?: (value: number) => string

    // 复杂泛型
    items: Map<string, User>
  }>()

  // 方式二：带默认值（使用 withDefaults）
  const props2 = withDefaults(
    defineProps<{
      title?: string
      count?: number
      tags?: string[]
      user?: User | null
    }>(),
    {
      title: '默认标题',
      count: 0,
      tags: () => [], // 对象/数组类型的默认值需要使用函数
      user: null,
    },
  )

  // 方式三：运行时声明（与 JS 一致，仍有类型推导）
  const props3 = defineProps({
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      default: 18,
      validator: (value: number) => value >= 0 && value <= 150,
    },
  })
</script>
```

Emits 类型定义：

```html
<script setup lang="ts">
  // 方式一：纯类型声明
  const emit = defineEmits<{
    (e: 'update', value: string): void
    (e: 'delete', id: number): void
    (e: 'submit', data: { name: string; email: string }): void
  }>()

  // 方式二（Vue 3.3+ 更简洁的语法）
  const emit2 = defineEmits<{
    update: [value: string]
    delete: [id: number]
    submit: [data: { name: string; email: string }]
  }>()

  // 使用
  emit('update', 'new value') // 类型安全
  emit('delete', 42) // 类型安全
  // emit('delete', 'string')      // 编译错误：参数类型不匹配
  // emit('unknown')                // 编译错误：无此事件
</script>
```

defineModel 的类型定义（Vue 3.4+）：

```html
<script setup lang="ts">
  // 基本 v-model
  const modelValue = defineModel<string>()

  // 带默认值
  const modelValue2 = defineModel<string>({ default: '' })

  // 命名 v-model
  const title = defineModel<string>('title')
  const count = defineModel<number>('count', { default: 0 })

  // 必填
  const required = defineModel<string>({ required: true })
</script>
```

defineSlots 的类型定义（Vue 3.3+）：

```html
<script setup lang="ts">
  const slots = defineSlots<{
    // 默认插槽，接收 props
    default(props: { item: User; index: number }): any

    // 具名插槽
    header(props: { title: string }): any

    // 无参数的插槽
    footer(): any
  }>()
</script>
```

泛型组件（Vue 3.3+）：

```html
<script setup lang="ts" generic="T extends { id: number }">
  // T 是泛型参数，约束为必须有 id 属性
  defineProps<{
    items: T[]
    selected?: T
  }>()

  defineEmits<{
    select: [item: T]
  }>()

  defineSlots<{
    default(props: { item: T; index: number }): any
  }>()
</script>

<!-- 使用时会自动推导 T -->
<!-- <GenericList :items="users" @select="handleSelect" /> -->
<!-- 此时 T 被推导为 User 类型 -->
```

## 5. 🤔 如何为 ref 和 reactive 定义类型？

在组合式 API 中，ref 和 reactive 的类型通常可以自动推导，但在某些情况下需要手动标注。

ref 的类型标注：

```ts
import { ref, type Ref } from 'vue'

// 自动推导
const count = ref(0) // Ref<number>
const message = ref('hello') // Ref<string>
const isActive = ref(true) // Ref<boolean>

// 显式类型标注（当初始值无法推导所需类型时）
const user = ref<User | null>(null) // Ref<User | null>
const items = ref<string[]>([]) // Ref<string[]>
const status = ref<'loading' | 'success' | 'error'>('loading')

// 复杂类型
interface FormState {
  username: string
  password: string
  errors: Record<string, string>
}

const form = ref<FormState>({
  username: '',
  password: '',
  errors: {},
})

// 类型标注也可以通过 Ref 类型
const score: Ref<number> = ref(0)
```

reactive 的类型标注：

```ts
import { reactive } from 'vue'

// 自动推导（大多数情况足够）
const state = reactive({
  count: 0,
  name: 'hello',
})
// 类型为 { count: number; name: string }

// 显式类型标注（使用 interface）
interface AppState {
  user: User | null
  settings: {
    theme: 'light' | 'dark'
    language: string
  }
  notifications: Notification[]
}

const appState: AppState = reactive({
  user: null,
  settings: {
    theme: 'light',
    language: 'zh-CN',
  },
  notifications: [],
})

// 不推荐使用泛型参数（会导致深层 ref 解包问题）
// const state = reactive<AppState>({...})  // 不推荐
```

computed 的类型标注：

```ts
import { computed, type ComputedRef } from 'vue'

// 自动推导返回类型
const doubleCount = computed(() => count.value * 2) // ComputedRef<number>

// 显式标注（复杂场景）
const activeUsers = computed<User[]>(() => {
  return users.value.filter((u) => u.isActive)
})

// 可写 computed
const fullName = computed<string>({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(value: string) {
    const [first, last] = value.split(' ')
    firstName.value = first
    lastName.value = last
  },
})
```

函数参数中的类型：

```ts
// watch 的类型推导
watch(count, (newVal, oldVal) => {
  // newVal 和 oldVal 自动推导为 number
})

// provide / inject 的类型安全
import { type InjectionKey, provide, inject } from 'vue'

// 定义类型安全的注入 key
const UserKey: InjectionKey<User> = Symbol('user')

// 提供
provide(UserKey, { id: 1, name: '张三', email: 'test@example.com' })

// 注入（自动获得 User 类型）
const user = inject(UserKey) // User | undefined
const userWithDefault = inject(UserKey, { id: 0, name: '游客', email: '' })
```

## 6. 🤔 Vue 项目中的类型声明文件如何组织和使用？

类型声明文件（.d.ts）用于为非 TypeScript 的代码提供类型信息。在 Vue 项目中，需要管理几类类型声明。

项目类型声明的推荐目录结构：

```
src/
  types/
    index.ts          # 统一导出
    user.ts           # 用户相关类型
    product.ts        # 商品相关类型
    api.ts            # API 响应类型
    enums.ts          # 枚举类型
  global.d.ts         # 全局类型声明
  env.d.ts            # 环境变量类型
```

业务类型定义：

```ts
// src/types/user.ts
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  role: UserRole
  createdAt: string
}

export enum UserRole {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}
```

```ts
// src/types/api.ts
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
```

```ts
// src/types/index.ts
export type { User, UserRole, LoginRequest, LoginResponse } from './user'
export type { ApiResponse, PaginatedResponse } from './api'
```

全局类型增强：

```ts
// src/global.d.ts

// 扩展 Vue 组件的 globalProperties 类型
import 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $formatDate: (date: string | Date) => string
    $http: import('./utils/http').HttpClient
  }
}

// 扩展 vue-router 的 meta 类型
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: string[]
    keepAlive?: boolean
  }
}

// 扩展 Pinia Store
// 通常不需要手动声明，Pinia 会自动推导
```

为第三方库补充类型声明：

```ts
// src/types/shims-modules.d.ts

// 没有类型声明的 npm 包
declare module 'some-untyped-package' {
  export function doSomething(input: string): number
  export default class SomeClass {
    constructor(options?: Record<string, unknown>)
    init(): void
  }
}

// 非代码资源
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}
```

在组件中使用类型：

```html
<script setup lang="ts">
  import type { User, ApiResponse, PaginatedResponse } from '@/types'

  const props = defineProps<{
    userId: number
  }>()

  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)

  async function fetchUsers(page: number) {
    const response = await fetch(`/api/users?page=${page}`)
    const result: ApiResponse<PaginatedResponse<User>> = await response.json()

    users.value = result.data.items
  }
</script>
```

工具类型的使用：

```ts
// 从组件中提取 Props 类型
import type { ComponentProps } from 'vue'
import MyComponent from './MyComponent.vue'
type MyComponentProps = ComponentProps<typeof MyComponent>

// Partial、Required、Pick 等 TS 工具类型
type UserFormData = Pick<User, 'name' | 'email' | 'avatar'>
type UserUpdate = Partial<Omit<User, 'id' | 'createdAt'>>
```
