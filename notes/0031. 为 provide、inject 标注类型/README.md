# [0031. 为 provide、inject 标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0031.%20%E4%B8%BA%20provide%E3%80%81inject%20%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 如何为 provide、inject 标注类型？](#3-如何为-provideinject-标注类型)
  - [3.1. 推荐写法：使用 `InjectionKey<T>`](#31-推荐写法使用-injectionkeyt)
  - [3.2. `provide()` 也会被类型检查](#32-provide-也会被类型检查)
  - [3.3. 处理 `inject()` 的 `undefined`](#33-处理-inject-的-undefined)
    - [方式一：判断](#方式一判断)
    - [方式二：提供默认值](#方式二提供默认值)
    - [方式三：确定一定存在时使用非空断言](#方式三确定一定存在时使用非空断言)
    - [方式四：封装一个严格注入函数](#方式四封装一个严格注入函数)
  - [3.4. 为 `ref` 类型的 `provide` / `inject` 标注类型](#34-为-ref-类型的-provide--inject-标注类型)
  - [3.5. 如果不希望子组件修改 `ref`](#35-如果不希望子组件修改-ref)
  - [3.6. 提供一个上下文对象：实际项目最常见](#36-提供一个上下文对象实际项目最常见)
  - [3.7. 为 `reactive` 类型的 `provide` / `inject` 标注类型](#37-为-reactive-类型的-provide--inject-标注类型)
  - [3.8. 使用字符串 key 的写法](#38-使用字符串-key-的写法)
  - [3.9. 默认值的类型](#39-默认值的类型)
  - [3.10. 默认值使用工厂函数](#310-默认值使用工厂函数)
  - [3.11. `null` 类型要明确写出来](#311-null-类型要明确写出来)
  - [3.12. 全局 app.provide 的类型](#312-全局-appprovide-的类型)
  - [3.13. 常见坑](#313-常见坑)
    - [坑 1：provider 和 consumer 不能各自创建 Symbol](#坑-1provider-和-consumer-不能各自创建-symbol)
    - [坑 2：provide/inject 不会自动让普通对象变响应式](#坑-2provideinject-不会自动让普通对象变响应式)
    - [坑 3：注入 `ref` 后在 script 里仍然需要 `.value`](#坑-3注入-ref-后在-script-里仍然需要-value)
    - [坑 4：不要滥用 `inject(key)!`](#坑-4不要滥用-injectkey)
  - [3.14. 总结](#314-总结)

<!-- endregion:toc -->

## 1. 本节内容

- `InjectionKey<T>`
- 非空断言
- 封装注入函数解决 `inject()` 的 `undefined` 问题

## 2. 评价

在 Vue 3 + TypeScript + Composition API 中，`provide / inject` 最推荐的类型标注方式是：使用 `InjectionKey<T>`。它可以同时约束：

- `provide()` 提供的值类型
- `inject()` 注入得到的值的类型

## 3. 如何为 provide、inject 标注类型？

### 3.1. 推荐写法：使用 `InjectionKey<T>`

一般会把 key 单独抽离到一个文件里。

```ts
// injectionKeys.ts
import type { InjectionKey } from 'vue'

export interface User {
  id: number
  name: string
}

export const userKey = Symbol('user') as InjectionKey<User>
```

父级组件提供数据：

```html
<script setup lang="ts">
  import { provide } from 'vue'
  import { userKey } from './injectionKeys'

  provide(userKey, {
    id: 1,
    name: 'Tom',
  })
</script>
```

子孙组件注入数据：

```html
<script setup lang="ts">
  import { inject } from 'vue'
  import { userKey } from './injectionKeys'

  const user = inject(userKey)
  // 注意：这里的 user 被推到为 User | undefined 而不是 User
  // inject 接口定义：
  // node_modules/@vue/runtime-core/dist/runtime-core.d.ts
  // export declare function inject<T>(key: InjectionKey<T> | string): T | undefined;
  // 因为可能没有上层组件提供这个值，所以 inject() 默认返回：T | undefined
  // 所以这里 user 的类型是：User | undefined
</script>
```

### 3.2. `provide()` 也会被类型检查

如果你使用了 `InjectionKey<T>`，`provide()` 的值会被 TypeScript 检查。

```ts
// 正确：
provide(userKey, {
  id: 1,
  name: 'Tom',
})

// 错误：
provide(userKey, {
  id: '1', // id 应该是 number 类型，这里是 string 类型
  name: 'Tom',
})

// 错误：
provide(userKey, 'hello')
// userKey 对应的类型是 User，不是 string
```

### 3.3. 处理 `inject()` 的 `undefined`

因为 `inject(userKey)` 返回的是：

```ts
User | undefined
```

所以使用前需要处理。

#### 方式一：判断

```ts
const user = inject(userKey)

if (user) {
  console.log(user.name)
}
```

#### 方式二：提供默认值

```ts
const user = inject(userKey, {
  id: 0,
  name: 'Guest',
} as User)
// 此时 user 被推断为 User 类型
// 而非 User | undefined 类型
```

#### 方式三：确定一定存在时使用非空断言

```ts
const user = inject(userKey)!
// 此时 user 被推断为 User 类型
// 而非 User | undefined 类型
```

但是这种写法要谨慎。

只有当你非常确定祖先组件一定提供了这个依赖时才建议使用。

#### 方式四：封装一个严格注入函数

实际项目中很常见：

```ts
// injectStrict.ts
import { inject } from 'vue'
import type { InjectionKey } from 'vue'

export function injectStrict<T>(key: InjectionKey<T>): T {
  const value = inject(key)

  if (value === undefined) {
    throw new Error('Injection not found')
  }

  return value
}
```

使用：

```ts
import { injectStrict } from './injectStrict'
import { userKey } from './injectionKeys'

const user = injectStrict(userKey)
// 此时 user 被推断为 User 类型
// 而非 User | undefined 类型
```

这样既不用到处写 `!`，又能在运行时发现问题。

### 3.4. 为 `ref` 类型的 `provide` / `inject` 标注类型

如果你提供的是 `ref`，key 应该写成 `InjectionKey<Ref<T>>`。

```ts
// injectionKeys.ts
import type { InjectionKey, Ref } from 'vue'

export const countKey = Symbol('count') as InjectionKey<Ref<number>>
```

父级组件：

```html
<script setup lang="ts">
  import { ref, provide } from 'vue'
  import { countKey } from './injectionKeys'

  const count = ref(0)

  provide(countKey, count)
</script>
```

子孙组件：

```html
<script setup lang="ts">
  import { inject } from 'vue'
  import { countKey } from './injectionKeys'

  const count = inject(countKey)!

  count.value++
</script>
```

此时：

```ts
count // Ref<number>
count.value // number
```

注意：`inject()` 出来的 `ref` 不会在 `<script setup>` 中自动解包，仍然需要 `.value`。

### 3.5. 如果不希望子组件修改 `ref`

可以提供只读状态和修改函数。

```ts
// injectionKeys.ts
import type { InjectionKey, Ref } from 'vue'

export interface CounterContext {
  count: Readonly<Ref<number>>
  increment: () => void
}

export const counterKey = Symbol('counter') as InjectionKey<CounterContext>
```

父级组件：

```html
<script setup lang="ts">
  import { ref, readonly, provide } from 'vue'
  import { counterKey } from './injectionKeys'

  const count = ref(0)

  function increment() {
    count.value++
  }

  provide(counterKey, {
    count: readonly(count),
    increment,
  })
</script>
```

子孙组件：

```html
<script setup lang="ts">
  import { inject } from 'vue'
  import { counterKey } from './injectionKeys'

  const counter = inject(counterKey)!

  console.log(counter.count.value)

  counter.increment()

  counter.count.value = 100
  // TS 报错：只读
</script>
```

这种模式很推荐：

```ts
provide({
  readonly state,
  mutation functions
})
```

也就是：状态只读，修改通过函数完成。

### 3.6. 提供一个上下文对象：实际项目最常见

例如主题状态：

```ts
// themeContext.ts
import type { InjectionKey, Ref } from 'vue'

export type Theme = 'light' | 'dark'

export interface ThemeContext {
  theme: Ref<Theme>
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const themeKey = Symbol('theme') as InjectionKey<ThemeContext>
```

父级组件：

```html
<script setup lang="ts">
  import { ref, provide } from 'vue'
  import { themeKey } from './themeContext'
  import type { Theme } from './themeContext'

  const theme = ref<Theme>('light')

  function setTheme(value: Theme) {
    theme.value = value
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  provide(themeKey, {
    theme,
    setTheme,
    toggleTheme,
  })
</script>
```

子孙组件：

```html
<script setup lang="ts">
  import { inject } from 'vue'
  import { themeKey } from './themeContext'

  const themeContext = inject(themeKey)!

  themeContext.theme.value = 'dark'
  themeContext.setTheme('light')
  themeContext.toggleTheme()
</script>
```

如果你不希望外部直接改：

```ts
export interface ThemeContext {
  theme: Readonly<Ref<Theme>>
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}
```

父级提供时：

```ts
provide(themeKey, {
  theme: readonly(theme),
  setTheme,
  toggleTheme,
})
```

### 3.7. 为 `reactive` 类型的 `provide` / `inject` 标注类型

如果提供的是 `reactive` 对象：

```ts
// injectionKeys.ts
import type { InjectionKey } from 'vue'

export interface AppState {
  loading: boolean
  keyword: string
  page: number
}

export const appStateKey = Symbol('appState') as InjectionKey<AppState>
```

父级组件：

```html
<script setup lang="ts">
  import { reactive, provide } from 'vue'
  import { appStateKey } from './injectionKeys'
  import type { AppState } from './injectionKeys'

  const appState: AppState = reactive({
    loading: false,
    keyword: '',
    page: 1,
  })

  provide(appStateKey, appState)
</script>
```

子孙组件：

```html
<script setup lang="ts">
  import { inject } from 'vue'
  import { appStateKey } from './injectionKeys'

  const appState = inject(appStateKey)!

  appState.loading = true
  appState.keyword = 'vue'
  appState.page++
</script>
```

注意：`reactive` 对象没有 `.value`。

```ts
appState.page++ // 正确
appState.value // 错误
```

### 3.8. 使用字符串 key 的写法

也可以不用 `InjectionKey`，直接使用字符串 key。

父级：

```ts
provide('user', {
  id: 1,
  name: 'Tom',
})
```

子级：

```ts
const user = inject<User>('user')
```

此时：

```ts
user // User | undefined
```

但是字符串 key 有一个问题：

```ts
provide('user', 'hello')
```

TypeScript 不知道这个 `'user'` 应该对应 `User` 类型，所以它不会在 provider 和 injector 之间建立强类型关系。

也就是说：

```ts
const user = inject<User>('user')
```

只是告诉 TS：我认为注入得到的是 User。

但它无法保证 `provide('user', value)` 的 value 真的是 `User`。

所以在 TS 项目里更推荐：

```ts
const userKey = Symbol('user') as InjectionKey<User>
```

而不是直接使用字符串 `'user'` 的写法。

### 3.9. 默认值的类型

假设：

```ts
interface AppConfig {
  pageSize: number
  theme: 'light' | 'dark'
}

const appConfigKey = Symbol('appConfig') as InjectionKey<AppConfig>
```

注入时提供默认值：

```ts
const config = inject(appConfigKey, {
  pageSize: 20,
  theme: 'light',
} as AppConfig)
```

此时 config 的类型是 AppConfig：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-07-21-43-27.png)

如果不加 `as AppConfig` 断言，那么 config 将被推断为：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-07-21-42-55.png)

如果默认值不符合类型，会报错：

```ts
const config = inject(appConfigKey, {
  pageSize: '20',
  theme: 'light',
} as AppConfig)
// 会报错：pageSize 应该是 number
```

::: tip

上述的截图是 TS 语言服务给的提示，至于加不加断言，感觉并没有啥影响，因为在书写默认值的时候，都能正常检测类型异常的行为，及时给予警告，区别在于 TS 语言服务检测到的错误原因不一样罢了。

```ts
const config = inject(appConfigKey, {
  pageSize: 20,
  theme: 'light',
})
// 推断为：
// const config: {
//   pageSize: number
//   theme: string
// }

const config = inject(appConfigKey, {
  pageSize: 20,
  theme: 'light',
} as AppConfig)
// 推断为：AppConfig

// -- 测试错误的默认值类型 --

const config = inject(appConfigKey, {
  pageSize: '20',
  theme: 'light',
})
// 会报错：
// 不能将类型“string”分配给类型“number”。ts-plugin(2322)

const config = inject(appConfigKey, {
  pageSize: '20',
  theme: 'light',
} as AppConfig)
// 会报错：
// 类型 "{ pageSize: string; theme: "light"; }" 到类型 "AppConfig" 的转换可能是错误的，因为两种类型不能充分重叠。如果这是有意的，请先将表达式转换为 "unknown"。
//   属性“pageSize”的类型不兼容。
//     类型“string”不可与类型“number”进行比较。ts-plugin(2352)
```

2322 错误：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-07-21-51-33.png)

2352 错误：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-07-21-51-42.png)

:::

### 3.10. 默认值使用工厂函数

如果默认值是对象，并且你希望每次创建新的对象，可以使用工厂函数：

```ts
const config = inject(
  appConfigKey,
  () => ({
    pageSize: 20,
    theme: 'light',
  }),
  true,
)
```

第三个参数：`true`，表示把第二个参数当成默认值工厂函数执行。

如果你注入的值本身就是函数，就不要随便加第三个参数。

例如：

```ts
type Logger = (message: string) => void

const loggerKey = Symbol('logger') as InjectionKey<Logger>
```

注入函数默认值：

```ts
const logger = inject(loggerKey, (message: string) => {
  console.log(message)
})
```

这里第二个参数本身就是默认函数值，不是工厂函数。

### 3.11. `null` 类型要明确写出来

如果注入值可能是 `null`，类型里要包含 `null`。

```ts
interface User {
  id: number
  name: string
}

const currentUserKey = Symbol('currentUser') as InjectionKey<User | null>
```

父级：

```ts
provide(currentUserKey, null)
```

子级：

```ts
const currentUser = inject(currentUserKey, null)
```

此时：

```ts
currentUser // User | null
```

访问时：

```ts
console.log(currentUser?.name)
```

### 3.12. 全局 app.provide 的类型

也可以在 `main.ts` 里全局提供：

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { appConfigKey } from './injectionKeys'

const app = createApp(App)

app.provide(appConfigKey, {
  pageSize: 20,
  theme: 'light',
})

app.mount('#app')
```

组件中注入：

```ts
const config = inject(appConfigKey)!
// 类型仍然有效：
// const config: AppConfig
```

### 3.13. 常见坑

#### 坑 1：provider 和 consumer 不能各自创建 Symbol

错误：

```ts
// 父组件
const userKey = Symbol('user') as InjectionKey<User>
provide(userKey, user)
```

```ts
// 子组件
const userKey = Symbol('user') as InjectionKey<User>
const user = inject(userKey)
```

虽然描述都是 `'user'`，但这是两个不同的 Symbol。

正确做法是：从同一个文件导出并导入同一个 key。

```ts
// injectionKeys.ts
export const userKey = Symbol('user') as InjectionKey<User>
```

#### 坑 2：provide/inject 不会自动让普通对象变响应式

```ts
provide(userKey, {
  id: 1,
  name: 'Tom',
})
```

这个对象本身不是响应式的。

如果你需要响应式，应该提供：

```ts
const user = ref<User | null>(null)

provide(userKey, user)
```

或者：

```ts
const state = reactive({
  count: 0,
})

provide(stateKey, state)
```

#### 坑 3：注入 `ref` 后在 script 里仍然需要 `.value`

```ts
const count = inject(countKey)!

count.value++
```

不是：

```ts
count++
```

#### 坑 4：不要滥用 `inject(key)!`

```ts
const user = inject(userKey)!
```

这只是告诉 TypeScript：我确定它不是 undefined。

但如果运行时真的没有 provider，仍然会出问题。

更稳妥的是封装：注入函数，在注入函数中完成类型守卫工作。

```ts
const user = injectStrict(userKey)
```

### 3.14. 总结

`provide / inject` 标注类型最推荐：

```ts
import type { InjectionKey } from 'vue'

interface User {
  id: number
  name: string
}

export const userKey = Symbol('user') as InjectionKey<User>
```

提供：

```ts
provide(userKey, {
  id: 1,
  name: 'Tom',
})
```

注入：

```ts
const user = inject(userKey)
```

结果：

```ts
user // User | undefined
```

核心要点：

- TS 项目中优先使用 `InjectionKey<T>`
- 不推荐只用字符串 `key`，因为 `provider` 和 `injector` 类型无法强关联
- `inject()` 默认返回 `T | undefined`
- 可以用默认值、判断、非空断言或 `injectStrict()` 处理
- 提供 `ref` 时，`key` 写成 `InjectionKey<Ref<T>>`
- 提供 `reactive` 时，`key` 写成 `InjectionKey<State>`
- 如果不希望子组件修改状态，提供 `readonly(state)` 加修改函数
- `Symbol key` 必须从同一个文件导出复用，不能各自创建
