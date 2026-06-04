# [0106. TS 与组合式 API](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0106.%20TS%20%E4%B8%8E%E7%BB%84%E5%90%88%E5%BC%8F%20API)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么 TypeScript 和组合式 API 天然更合拍？](#3--为什么-typescript-和组合式-api-天然更合拍)
- [4. 🤔 Props 和 Emits 在 `<script setup>` 里应该怎么写类型？](#4--props-和-emits-在-script-setup-里应该怎么写类型)
  - [4.1. Props 有两套写法，但不能混用](#41-props-有两套写法但不能混用)
  - [4.2. Props 默认值](#42-props-默认值)
  - [4.3. Emits 也支持运行时和基于类型两种声明](#43-emits-也支持运行时和基于类型两种声明)
- [5. 🤔 `ref()`、`reactive()`、`computed()` 在 TS 下各有什么要点？](#5--refreactivecomputed-在-ts-下各有什么要点)
  - [5.1. `ref()`](#51-ref)
  - [5.2. `reactive()`](#52-reactive)
  - [5.3. `computed()`](#53-computed)
- [6. 🤔 DOM 事件、provide/inject、模板 ref 该怎么标类型？](#6--dom-事件provideinject模板-ref-该怎么标类型)
  - [6.1. DOM 事件](#61-dom-事件)
  - [6.2. provide / inject](#62-provide--inject)
  - [6.3. 模板 ref](#63-模板-ref)
- [7. 🤔 组件实例和全局指令类型什么时候需要显式声明？](#7--组件实例和全局指令类型什么时候需要显式声明)
  - [7.1. 组件模板引用](#71-组件模板引用)
  - [7.2. 全局自定义指令](#72-全局自定义指令)
- [8. 🔗 引用](#8--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 组合式推导
- Props 类型
- Emits 类型
- ref reactive
- computed 类型
- inject key
- 模板引用
- 指令类型

## 2. 🫧 评价

Vue 官方明确推荐：如果你使用 TypeScript，更推荐搭配组合式 API。原因很简单，组合式 API 的类型信息大多直接体现在变量、函数参数和返回值上，TypeScript 更容易推导，也更少依赖 `this` 上下文。

## 3. 🤔 为什么 TypeScript 和组合式 API 天然更合拍？

因为组合式 API 的核心写法本来就是普通函数和变量声明，而 TypeScript 最擅长理解的正是这些结构。

你在组合式 API 里经常写的是：

- `const count = ref(0)`
- `const props = defineProps<Props>()`
- `function handleChange(event: Event) {}`

这些类型关系都比较直接，不需要依赖 `this` 的动态上下文推导，所以整体会比选项式 API 更简单、稳定。

## 4. 🤔 Props 和 Emits 在 `<script setup>` 里应该怎么写类型？

### 4.1. Props 有两套写法，但不能混用

官方把 `defineProps()` 的写法分成两类：

1. 运行时声明
2. 基于类型的声明

运行时声明：

```html
<script setup lang="ts">
  const props = defineProps({
    foo: { type: String, required: true },
    bar: Number,
  })
</script>
```

基于类型的声明：

```html
<script setup lang="ts">
  interface Props {
    foo: string
    bar?: number
  }

  const props = defineProps<Props>()
</script>
```

一般来说，基于类型的声明更直接。但要记住：这两种写法只能选一种，不能同时使用。

### 4.2. Props 默认值

如果你用了基于类型的声明，默认值常见有两种做法。

Vue 3.5+ 可以直接用响应式 Props 解构：

```ts
interface Props {
  msg?: string
  labels?: string[]
}

const { msg = 'hello', labels = ['one', 'two'] } = defineProps<Props>()
```

在 3.4 及更低版本，官方建议用 `withDefaults`：

```ts
interface Props {
  msg?: string
  labels?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two'],
})
```

其中数组、对象这类可变默认值要用函数包一层，避免多个组件实例共享同一份引用。

### 4.3. Emits 也支持运行时和基于类型两种声明

```ts
const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
}>()
```

这种写法在 Vue 3.3+ 里更简洁。它的好处是：

- 事件名有自动补全
- 参数类型受检查
- 触发未声明事件会报错

## 5. 🤔 `ref()`、`reactive()`、`computed()` 在 TS 下各有什么要点？

### 5.1. `ref()`

`ref()` 会根据初始值自动推导：

```ts
const year = ref(2020)
```

上面会得到 `Ref<number>`。

如果你想显式扩展类型，可以传泛型：

```ts
const year = ref<string | number>('2020')
```

如果你只写泛型、不传初始值，结果会带上 `undefined`：

```ts
const n = ref<number>()
```

### 5.2. `reactive()`

`reactive()` 也会自动推导对象类型：

```ts
interface Book {
  title: string
  year?: number
}

const book: Book = reactive({ title: 'Vue 3 指引' })
```

官方特别提醒：不推荐直接给 `reactive()` 传泛型参数，因为它返回的类型和泛型本身在深层 ref 解包场景下并不完全一致。

### 5.3. `computed()`

`computed()` 会根据返回值推导：

```ts
const double = computed(() => count.value * 2)
```

如果你想显式约束返回类型，也可以这样：

```ts
const double = computed<number>(() => count.value * 2)
```

## 6. 🤔 DOM 事件、provide/inject、模板 ref 该怎么标类型？

### 6.1. DOM 事件

如果不开类型，事件参数很容易变成隐式 `any`：

```ts
function handleChange(event: Event) {
  console.log((event.target as HTMLInputElement).value)
}
```

### 6.2. provide / inject

官方推荐用 `InjectionKey` 在提供者和消费者之间同步类型：

```ts
import { provide, inject } from 'vue'
import type { InjectionKey } from 'vue'

const key = Symbol() as InjectionKey<string>

provide(key, 'foo')
const foo = inject(key)
```

此时 `foo` 的类型是 `string | undefined`。

如果提供默认值，`undefined` 就会消失：

```ts
const foo = inject<string>('foo', 'bar')
```

### 6.3. 模板 ref

在 Vue 3.5 和较新的语言工具中，`useTemplateRef()` 对静态模板引用已经能自动推导很多类型；但在无法自动推导时，仍可以手动指定：

```ts
const el = useTemplateRef<HTMLInputElement>('el')
```

因为模板 ref 在挂载前是 `null`，访问时通常要配合可选链或类型守卫。

## 7. 🤔 组件实例和全局指令类型什么时候需要显式声明？

### 7.1. 组件模板引用

如果 ref 指向的是组件实例而不是 DOM 元素，常见做法是用 `InstanceType` 提取实例类型：

```ts
import Foo from './Foo.vue'

type FooType = InstanceType<typeof Foo>
const child = useTemplateRef<FooType>('child')
```

如果你不关心具体实例类型，只想拿公共实例能力，可以退到 `ComponentPublicInstance`。

如果组件是泛型组件，`InstanceType` 可能不够用，官方建议使用 `vue-component-type-helpers` 中的 `ComponentExposed`。

### 7.2. 全局自定义指令

要给 `app.directive()` 注册的全局指令补类型，可以扩展 `ComponentCustomProperties`：

```ts
import type { Directive } from 'vue'

export type HighlightDirective = Directive<HTMLElement, string>

declare module 'vue' {
  interface ComponentCustomProperties {
    vHighlight: HighlightDirective
  }
}
```

这样模板里使用 `v-highlight` 时就能获得类型提示和校验。

## 8. 🔗 引用

- [Vue.js 官方文档 - TS 与组合式 API][1]
- [Vue.js 官方文档 - TS 总览][2]
- [TypeScript - Generics][3]
- [vue-component-type-helpers][4]

[1]: https://cn.vuejs.org/guide/typescript/composition-api.html
[2]: https://cn.vuejs.org/guide/typescript/overview.html
[3]: https://www.typescriptlang.org/docs/handbook/2/generics.html
[4]: https://www.npmjs.com/package/vue-component-type-helpers
