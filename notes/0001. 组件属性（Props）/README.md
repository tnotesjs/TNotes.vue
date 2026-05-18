# [0001. 组件属性（Props）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0001.%20%E7%BB%84%E4%BB%B6%E5%B1%9E%E6%80%A7%EF%BC%88Props%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Props 是什么？父组件如何把数据传给子组件？](#3--props-是什么父组件如何把数据传给子组件)
- [4. 🤔 Props 应该如何声明？](#4--props-应该如何声明)
  - [4.1. `defineProps()`](#41-defineprops)
  - [4.2. 结合 TypeScript](#42-结合-typescript)
- [5. 🤔 什么是“运行时声明”（runtime props declarations）、“基于类型的声明”（type-based props declarations）？](#5--什么是运行时声明runtime-props-declarations基于类型的声明type-based-props-declarations)
  - [5.1. “运行时声明”（runtime props declarations）](#51-运行时声明runtime-props-declarations)
  - [5.2. “基于类型的声明”（type-based props declarations）](#52-基于类型的声明type-based-props-declarations)
- [6. 🤔 `defineProps()` 宏中的参数为什么不能是 `<script setup>` 中定义的其他变量？](#6--defineprops-宏中的参数为什么不能是-script-setup-中定义的其他变量)
  - [6.1. `<script setup>` 编译后的大致结构](#61-script-setup-编译后的大致结构)
  - [6.2. 编译器的检查逻辑](#62-编译器的检查逻辑)
  - [6.3. 一些例外](#63-一些例外)
    - [`LITERAL_CONST` 是例外](#literal_const-是例外)
    - [`import` 的变量也是例外](#import-的变量也是例外)
- [7. 🤔 父组件如何传递不同类型的 props？](#7--父组件如何传递不同类型的-props)
- [8. 🤔 Prop 命名规范是？](#8--prop-命名规范是)
  - [8.1. 声明时 - camelCase](#81-声明时---camelcase)
  - [8.2. 在模板中使用时 - camelCase](#82-在模板中使用时---camelcase)
- [9. 🤔 为什么说 props 是单向数据流？子组件应该如何正确使用 props？](#9--为什么说-props-是单向数据流子组件应该如何正确使用-props)
- [10. 🤔 Props 如何设置默认值和校验？](#10--props-如何设置默认值和校验)
- [11. 🤔 Boolean prop 有什么需要注意的特殊转换规则？](#11--boolean-prop-有什么需要注意的特殊转换规则)
- [12. 🤔 响应式 Props 解构有哪些注意事项？](#12--响应式-props-解构有哪些注意事项)
  - [12.1. Vue 3.5 之前：解构会丢失响应式](#121-vue-35-之前解构会丢失响应式)
    - [当时的解决方案：toRefs](#当时的解决方案torefs)
  - [12.2. Vue 3.5+：解构自动保持响应式](#122-vue-35解构自动保持响应式)
    - [编译器做了什么？](#编译器做了什么)
    - [核心源码](#核心源码)
  - [12.3. watch 和 watchEffect（3.5+）](#123-watch-和-watcheffect35)
    - [核心源码：`watch()` 是如何识别响应式数据源的？](#核心源码watch-是如何识别响应式数据源的)
  - [12.4. 不同场景对比](#124-不同场景对比)
- [13. 💻 demos.1 - 属性声明 - 使用泛型声明 props](#13--demos1---属性声明---使用泛型声明-props)
- [14. 💻 demos.2 - 属性声明 - 使用泛型声明可选的 props（type-based）](#14--demos2---属性声明---使用泛型声明可选的-propstype-based)
- [15. 💻 demos.3 - 属性声明 - 使用类型别名声明 props](#15--demos3---属性声明---使用类型别名声明-props)
- [16. 💻 demos.4 - 属性声明 - 使用接口声明 props](#16--demos4---属性声明---使用接口声明-props)
- [17. 💻 demos.5 - 属性声明 - 使用对象式声明 props](#17--demos5---属性声明---使用对象式声明-props)
- [18. 💻 demos.6 - 属性声明 - 使用对象简写声明 props](#18--demos6---属性声明---使用对象简写声明-props)
- [19. 💻 demos.7 - 属性声明 - 使用数组简写声明 props](#19--demos7---属性声明---使用数组简写声明-props)
- [20. 💻 demos.16 - 属性声明 - 为单个 prop 指定多种可能的类型](#20--demos16---属性声明---为单个-prop-指定多种可能的类型)
- [21. 💻 demos.11 - 属性声明 - 属性默认值（runtime）](#21--demos11---属性声明---属性默认值runtime)
- [22. 💻 demos.12 - 属性声明 - 属性默认值（type-based）](#22--demos12---属性声明---属性默认值type-based)
- [23. 💻 demos.8 - 属性访问 - 在 script setup 中访问使用 defineProps 定义的 props](#23--demos8---属性访问---在-script-setup-中访问使用-defineprops-定义的-props)
- [24. 💻 demos.17 - 属性访问 - 在非 script setup 中访问 props](#24--demos17---属性访问---在非-script-setup-中访问-props)
- [25. 💻 demos.14 - 属性校验 - Prop 校验（type-based）](#25--demos14---属性校验---prop-校验type-based)
- [26. 💻 demos.15 - 属性校验 - Prop 校验（runtime）](#26--demos15---属性校验---prop-校验runtime)
- [27. 💻 demos.9 - PropType 属性类型细化 - PropType 细化类型](#27--demos9---proptype-属性类型细化---proptype-细化类型)
- [28. 💻 demos.10 - PropType 属性类型细化 - 使用 type-based 式写法来处理复杂类型](#28--demos10---proptype-属性类型细化---使用-type-based-式写法来处理复杂类型)
- [29. 💻 demos.13 - toRefs 保持属性的响应式状态 - toRefs 保持响应式](#29--demos13---torefs-保持属性的响应式状态---torefs-保持响应式)
- [30. 🔗 引用](#30--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Props 声明
- 动态传值
- 单向数据流
- Prop 校验
- 布尔转换
- 响应式解构

## 2. 🫧 评价

Props 是组件通信里最高频的入口，你至少要掌握声明、传值、单向数据流和校验这几件事，因为它们几乎决定了一个组件的输入边界。像 Boolean 转换、响应式解构这类细节不算天天手写，但很容易在排错时卡你一下，所以也值得顺手吃透。

## 3. 🤔 Props 是什么？父组件如何把数据传给子组件？

简单来说，props 可以理解成「组件对外公开的输入参数」。父组件通过 props 把数据传给子组件，子组件再根据这些输入去决定自己渲染什么。

基本规则：

- 子组件负责声明自己接收哪些数据
- 父组件负责提供数据
- 未被声明的 attribute 不会自动变成 prop，而是会按透传 attribute 规则处理

示例：

::: code-group

```html [App.vue]
<template>
  <UserCard name="Abc" :age="18" :is-vip="true" :tags="['Vue', 'TypeScript']" />
  <!-- 
   父组件在调用子组件 UserCard 的时候传递 props：
   name => 字符串 "Abc"
   age => 数字 18
   isVip => 布尔值 true
   tags => 字符串数组 ['Vue', 'TypeScript']
    -->
</template>

<script setup>
  import UserCard from './UserCard.vue'
</script>
```

```html [UserCard.vue]
<template>
  <article class="card">
    <!-- 子组件可以在模板中访问父组件传递过来的 props -->
    <h3>{{ props.name }}</h3>
    <p>年龄：{{ props.age }}</p>
    <p>会员：{{ props.isVip ? '是' : '否' }}</p>
    <p>标签：{{ props.tags.join('、') }}</p>
  </article>
</template>

<script setup>
  // 子组件通过 defineProps 声明自己需要哪些 props：
  const props = defineProps({
    name: String,
    age: Number,
    isVip: Boolean,
    tags: Array,
  })
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-17-19-34-42.png)

## 4. 🤔 Props 应该如何声明？

- 在 Vue 3 的 `<script setup>` 中，最常见的声明方式是使用编译宏 `defineProps()` 来声明属性
- 在早期的 Vue 2 版本的写法，也就是选项式 API 中，则是通过组件的 `props` 选项来声明属性

### 4.1. `defineProps()`

最简单的 `defineProps()` 写法是字符串数组：

```html
<script setup>
  // 声明了两个 prop：title 和 author，类型默认为 any
  // 这是最简单的声明方式，但缺点是没有类型约束、默认值和校验规则。
  // 适合快速演示，但不推荐在真实项目里使用。
  const props = defineProps(['title', 'author'])
</script>
```

在真实项目里更推荐对象写法，因为它可以顺手把类型、是否必填、默认值和校验规则都写清楚：

```html
<script setup>
  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: '匿名',
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      validator(value) {
        return ['draft', 'published', 'archived'].includes(value)
      },
    },
  })
</script>
```

### 4.2. 结合 TypeScript

如果你在用 TypeScript，也可以直接用类型声明：

```html
<script setup lang="ts">
  interface Props {
    title: string
    author?: string
    pageSize?: number
  }

  const props = defineProps<Props>()
</script>
```

如果是可选属性，还想给默认值，通常会配合 `withDefaults()`：

```html
<script setup lang="ts">
  interface Props {
    title: string
    author?: string
    tags?: string[]
  }

  const props = withDefaults(defineProps<Props>(), {
    author: '匿名',
    tags: () => [],
  })
</script>
```

## 5. 🤔 什么是“运行时声明”（runtime props declarations）、“基于类型的声明”（type-based props declarations）？

### 5.1. “运行时声明”（runtime props declarations）

```html
<script setup lang="ts">
  const props = defineProps({
    foo: { type: String, required: true },
    bar: Number,
  })

  props.foo // string
  props.bar // number | undefined
</script>
<!--
上述写法被称之为“运行时声明”（runtime props declarations）
因为传递给 defineProps() 的参数会作为运行时的 props 选项使用。
-->
```

### 5.2. “基于类型的声明”（type-based props declarations）

```html
<script setup lang="ts">
  const props = defineProps<{
    foo: string
    bar?: number
  }>()
</script>
<!--
上述写法被称之为“基于类型的声明”（type-based props declarations）
编译器会尽可能地尝试根据类型参数推导出等价的运行时选项。

在这种场景下
该例子中编译出的运行时选项和上一个是完全一致的
即，两种写法是等效的

这两种声明方式，在本节的 demos 中都会介绍。
如果想要更好地结合 TS 的类型系统，让方便类型被更好地复用，
type-based props declarations 是更好的选择。
-->
```

由此可见，type-based 是定义属性的另一种写法，它和 runtime 式写法都是一样的，都是用来声明 props，并没有扩展任何额外的功能，因为 type-based 式写法，最终是会被编译器推断为 runtime 式写法。

## 6. 🤔 `defineProps()` 宏中的参数为什么不能是 `<script setup>` 中定义的其他变量？

`defineProps()` 宏中的参数不可以访问 `<script setup>` 中定义的其他变量，根本原因在于 `defineProps()` 的参数会被「提升（hoist）到 `setup()` 函数外部」，成为组件选项对象的一部分，而 `<script setup>` 中定义的局部变量只存在于 `setup()` 函数内部，在模块作用域中根本不存在。

示例：

```html
<script setup>
  let bar = 1 // 只存在于 setup() 内部
  defineProps({
    foo: { default: () => bar }, // ← 这段会被提升到 setup() 外部
  }) //   bar 在那里不存在，报错
</script>
```

这不是 Vue 的任意限制，而是编译输出的结构决定的：`defineProps` 的参数最终成为组件选项对象的一部分，生命周期早于 `setup()` 的执行，自然无法访问 `setup()` 内部的局部变量。

### 6.1. `<script setup>` 编译后的大致结构

```js
// 模块作用域（setup() 外部）
export default defineComponent({
  props: {
    /* ⬅️ defineProps() 的参数被提升到这里 */
  },
  setup(__props) {
    // setup() 内部
    let bar = 1 // ⬅️ <script setup> 中定义的变量在这里
    // ...
  },
})
```

`defineProps({ foo: { default: () => bar } })` 中的参数会被提取出来放到组件选项的 `props:` 字段，而 `bar` 只在 `setup()` 内部存在，在模块作用域中根本访问不到。

### 6.2. 编译器的检查逻辑

编译器在处理完所有声明之后，会调用 `checkInvalidScopeReference` 来检查 `defineProps` 的参数是否引用了 `setup` 作用域内的变量：

```ts
// github.com/vuejs/core/packages/compiler-sfc/src/compileScript.ts

function checkInvalidScopeReference(node: Node | undefined, method: string) {
  if (!node) return
  walkIdentifiers(node, (id) => {
    const binding = setupBindings[id.name]
    if (binding && binding !== BindingTypes.LITERAL_CONST) {
      ctx.error(
        `\`${method}()\` in <script setup> cannot reference locally ` +
          `declared variables because it will be hoisted outside of the ` +
          `setup() function. If your component options require initialization ` +
          `in the module scope, use a separate normal <script> to export ` +
          `the options instead.`,
        id,
      )
    }
  })
}

// 4. check macro args to make sure it doesn't reference setup scope
// variables
checkInvalidScopeReference(ctx.propsRuntimeDecl, DEFINE_PROPS)
checkInvalidScopeReference(ctx.propsRuntimeDefaults, DEFINE_PROPS)
checkInvalidScopeReference(ctx.propsDestructureDecl, DEFINE_PROPS)
checkInvalidScopeReference(ctx.emitsRuntimeDecl, DEFINE_EMITS)
```

`checkInvalidScopeReference` 遍历参数的 AST，对每个标识符检查它是否在 `setupBindings` 中有记录，且类型不是 `LITERAL_CONST`。如果是，就报错：

> `defineProps()` in `<script setup>` cannot reference locally declared variables because it will be hoisted outside of the `setup()` function.

### 6.3. 一些例外

#### `LITERAL_CONST` 是例外

注意检查条件是 `binding !== BindingTypes.LITERAL_CONST`。`const bar = 1` 这样的字面量常量（`LITERAL_CONST`）是被允许的，因为编译器会将它们也提升（hoist）到模块作用域，所以在 `props:` 字段中引用它们是安全的。

#### `import` 的变量也是例外

从外部 `import` 的绑定（如 `import { propsModel } from './props'`）本身就在模块作用域，不在 `setupBindings` 中，所以不会被 `checkInvalidScopeReference` 拦截，可以正常使用。

```ts
// github.com/vuejs/core/packages/compiler-sfc/__tests__/compileScript/defineProps.spec.ts

test('w/ external definition', () => {
  const { content } = compile(`
    <script setup>
    import { propsModel } from './props'
    const props = defineProps(propsModel)
    </script>
      `)
  assertCode(content)
  expect(content).toMatch(`export default {
  props: propsModel,`)
})
```

## 7. 🤔 父组件如何传递不同类型的 props？

Props 在模板里既可以传静态值，也可以传动态值。

- 纯字符串可以直接写
- 只要是 JavaScript 表达式，就要用 `v-bind`，也就是 `:`

```html
<template>
  <BlogPost
    title="静态标题"
    :likes="42"
    :is-published="true"
    :comment-ids="[1, 2, 3]"
    :author="{ name: 'Ada' }"
  />
</template>
```

这里看起来 `42`、`true`、数组、对象都是常量，但它们本质上仍然是 JavaScript 表达式，不是普通字符串，所以也要加 `:`。

如果你已经有一个对象，并且它的字段名正好和子组件 props 对应，还可以直接使用 `v-bind` 绑定整个对象：

```html
<script setup>
  const post = {
    title: 'Vue 组件通信',
    likes: 99,
  }
</script>

<template>
  <BlogPost v-bind="post" />
</template>
```

## 8. 🤔 Prop 命名规范是？

- 子组件定义 props 的时候，属性名建议采用小驼峰式写法，比如 `greetingMessage`。
- 父组件在调用子组件并传递 props 时，属性名建议和 HTML 的 attribute 写法对齐，采用中划线式写法，比如 `greeting-message`。

```ts
defineProps({
  greetingMessage: String,
})
// 如果一个 prop 的名字很长，应使用 camelCase 形式，
// 它们是合法的 JavaScript 标识符
// 可以直接在模板的表达式中使用
// 也可以避免在作为属性 key 名时必须加上引号

// 在模板中
// <span>{{ greetingMessage }}</span>

// 虽然理论上你也可以在向子组件传递 props 时使用 camelCase 形式
// 但实际上为了和 HTML attribute 对齐，我们通常会将其写为 kebab-case 形式

// 在父组件中:
// <MyComponent greeting-message="hello" />

// 对于组件名我们推荐使用 PascalCase，因为这提高了模板的可读性，能帮助我们区分 Vue 组件和原生 HTML 元素。

// 然而对于传递 props 来说，使用 camelCase 并没有太多优势，因此我们推荐更贴近 HTML 的书写风格。
```

### 8.1. 声明时 - camelCase

prop 名在声明时通常使用 camelCase：

```js
const { greetingMessage } = defineProps({
  greetingMessage: String,
})
```

### 8.2. 在模板中使用时 - camelCase

但在模板上传递时则更推荐使用 kebab-case：（官方建议）

```html
<WelcomeCard :greeting-message="greetingMessage" />
```

如果你想要使用 Vue 3.4+ 提供的同名简写语法糖，在模板中也可以保持 camelCase：（个人建议）

```html
<WelcomeCard :greetingMessage />
```

## 9. 🤔 为什么说 props 是单向数据流？子组件应该如何正确使用 props？

Props 遵循的是单向数据流，也就是「父传子」，数据是父组件生产的，子组件作为消费方只有读的份儿，数据的维护权在父组件。

下面这种写法就是不对的：

```html
<script setup>
  const props = defineProps(['count'])

  // ❌ 错误做法：视图直接修改父组件传递过来的 props
  props.count++
</script>
```

Vue 会把 prop 视为只读数据，并在开发环境下给出警告。

虽然你无法直接修改 props，但你可以在子组件里基于 prop 创建一个本地状态来维护它的值，或者用计算属性来对 prop 做一次格式化或派生计算：

```html
<script setup>
  import { computed, ref } from 'vue'

  const props = defineProps({
    initialCount: Number,
    size: String,
  })

  // ✅ 正确做法：在子组件里基于 prop 创建一个本地状态来维护它的值
  const localCount = ref(props.initialCount)

  // ✅ 正确做法：用计算属性对 prop 做一次格式化或派生计算
  const normalizedSize = computed(() => {
    return props.size?.trim().toLowerCase()
  })
</script>
```

在上面的示例中，子组件没有直接修改来自父组件的 `props.initialCount`，而是创建了一个新的响应式变量 `localCount` 来维护它的值。同时，计算属性 `normalizedSize` 也没有修改 `props.size`，而是基于它进行了一些处理来得到一个新的值。这种做法是符合单向数据流原则的，同时也避免了直接修改 props 导致的潜在问题。

## 10. 🤔 Props 如何设置默认值和校验？

使用对象写法来定义 Props 最大的好处之一，就是可以把 prop 的约束写得更加完整。

- 默认值可以通过 `default` 字段设置
- 校验规则可以通过 `validator()` 函数设置

```html
<script setup>
  const props = defineProps({
    id: {
      type: [String, null],
      required: true,
    },
    pageSize: {
      type: Number,
      default: 20,
    },
    tags: {
      type: Array,
      default: () => [],
    },
    config: {
      type: Object,
      default: () => ({
        theme: 'light',
      }),
    },
    status: {
      type: String,
      validator(value, props) {
        return ['draft', 'published', 'archived'].includes(value)
      },
    },
  })
</script>
```

基本规则：

- 所有 prop 默认都是可选的，除非你写了 `required: true`
- 数组和对象的默认值必须通过工厂函数返回
  - 背后原因：因为引用类型共享地址，工厂函数创建独立副本，这么做可以防止多个组件实例之间互相污染
- `validator()` 返回 `true` 表示校验通过，当校验失败时，Vue 会在开发环境给出控制台警告
  - 注意：`validator()` 是哨兵，而不是门卫
  - 即便 `validator()` 验证失败，并不会影响传值，只是控制台多了条警告而已
  - Vue 的 `validator()` 定位是开发阶段的辅助提醒，而不是运行时的拦截器
- `defineProps()` 里的运行时配置不能访问 `<script setup>` 里后面定义的局部变量
  - 背后原因：因为 `defineProps()` 这个宏会在编译阶段被提升处理

## 11. 🤔 Boolean prop 有什么需要注意的特殊转换规则？

如果一个 prop 被声明成 `Boolean`，Vue 会尽量让它的行为接近原生布尔属性。

```js
defineProps({
  disabled: Boolean,
})
```

这时：

```html
<!-- 相当于 :disabled="true"，此时传递的是 true -->
<MyButton disabled />
<!-- 相当于 :disabled="false"，此时传递的是 false -->
<MyButton />
<!-- 如果你显式写成 :disabled="false"，此时传递的是 false -->
<MyButton :disabled="false" />
```

当 Boolean 和 String 一起出现在联合类型里时，还要注意顺序问题：

```js
defineProps({
  disabled: [Boolean, String],
  // <MyButton disabled /> 更倾向于按 Boolean 规则处理，相当于传递了 true
})

defineProps({
  disabled: [String, Boolean],
  // <MyButton disabled /> 更倾向于按 String 规则处理，相当于传递了空字符串 ""
})
```

## 12. 🤔 响应式 Props 解构有哪些注意事项？

这个问题需要分 Vue 版本来看，不同版本情况截然不同。

先说结论：Vue 3.5 之前解构会丢响应式，Vue 3.5 及之后的版本不会了。因为在 Vue 3.5 的编译器层面在帮你做了兜底处理，如果你还在用 3.4 或更早版本，需要手动 `toRefs`。

### 12.1. Vue 3.5 之前：解构会丢失响应式

```js
// ❌ 这样写会丢失响应式
const { title, likes } = defineProps({
  title: String,
  likes: Number,
})
```

`defineProps` 返回的是一个响应式 Proxy 对象，但 JavaScript 的解构赋值本质上是取值操作：

```js
// 解构等价于将 props 的 getter 提前触发了
// 拿到的是当时的 Proxy 的快照值，和 Proxy 对象之间就断开联系了
const {
  title, // 拿到的是一个普通字符串
  likes, // 拿到的是一个普通数字
} = defineProps({
  title: String,
  likes: Number,
})
```

你拿到的是那一刻的快照值，和原始响应式对象断开了联系。父组件后续更新 `likes`，子组件里解构出来的 `likes` 不会跟着变。

#### 当时的解决方案：toRefs

```js
// ✅ 手动保持响应式
const props = defineProps({ title: String, likes: Number })
const { title, likes } = toRefs(props)
```

`toRefs` 把每个属性转成 `ref`，解构后依然保持响应式连接。

### 12.2. Vue 3.5+：解构自动保持响应式

从 Vue 3.5 开始，以下写法不再有问题：

```js
// ✅ Vue 3.5+ 编译器自动处理
const { title, likes } = defineProps({
  title: String,
  likes: Number,
})
```

这不是 JavaScript 行为变了，而是 Vue 的编译器在背后做了转换。

#### 编译器做了什么？

你写的代码：

```js
const { title, likes } = defineProps({ title: String, likes: Number })
```

编译器实际生成的（简化示意）：

```js
const __props = defineProps({ title: String, likes: Number })

// 编译器并不是真的执行解构赋值
// 而是在所有使用 title / likes 的地方（模板、computed、watchEffect 等）
// 将它们重写为 __props.title / __props.likes 的访问
// 从而让每次使用都经过 Proxy，保持响应式
```

编译器把“一次性取值”变成了惰性访问，在模板中使用时自然就具备了响应式。

#### 核心源码

```ts
// github.com/vuejs/core/packages/compiler-sfc/src/script/definePropsDestructure.ts
// x --> __props.x
ctx.s.overwrite(
  id.start! + ctx.startOffset!,
  id.end! + ctx.startOffset!,
  genPropsAccessExp(propsLocalToPublicMap[id.name]),
)

// github.com/vuejs/core/packages/shared/src/general.ts
export function genPropsAccessExp(name: string): string {
  return identRE.test(name)
    ? `__props.${name}`
    : `__props[${JSON.stringify(name)}]`
}
```

### 12.3. watch 和 watchEffect（3.5+）

- `watch` 需要包成 getter
- `watchEffect` 可以直接使用解构变量

在 Vue 3.5+ 里，`defineProps()` 解构出来的变量在同一个 `<script setup>` 代码块中是具备响应式语义的：

```html
<script setup>
  const { foo } = defineProps(['foo'])

  // watchEffect 写法
  watchEffect(() => {
    console.log(foo)
  })
  // watchEffect 中直接访问 foo 不会丢失响应式，根本原因是因为回调的执行时机是滞后的（在定义 watchEffect 之后）

  // watch 写法
  watch(
    () => foo,
    (value) => {
      console.log(value)
    },
  )
  // watch 的第一个参数如果直接写 foo 的话，会立刻取值（在定义 watch 的同时完成取值），这时就会丢失响应式，所以需要包成 getter
</script>
```

这段代码在 3.5+ 中会随着 `foo` 变化而重新执行，因为编译器会把这里的 `foo` 转回 `props.foo` 来追踪依赖。

如果把解构得到的 prop 直接传给 `watch()` 之类需要「响应式数据源」的函数时，依然应该包成 getter：

```html
<script setup>
  import { watch, toRef } from 'vue'
  const { foo } = defineProps(['foo'])

  // ❌ 直接传属性值
  watch(
    foo, // 如果你把 foo 直接传进去，传过去的只是当前值，不是一个可追踪的响应式来源。
    (value) => {
      console.log(value)
    },
  )

  // 正确做法：

  // ✅ 使用 getter 包装属性值
  watch(
    () => foo, // 把 foo 包成一个 getter 传进去，这样 watch 内部就能正确追踪到 foo 的变化。
    (value) => {
      console.log(value)
    },
  )

  // 其它可行的方式：

  // ✅ 使用 toRef 包装 props 对象里的属性
  watch(
    toRef(props, 'foo'), // toRef 会返回一个 ref 对象，watch 内部可以正确追踪到它的变化。
    (value) => {
      console.log(value)
    },
  )

  // ✅ 传整个响应式对象
  watch(props, (newProps) => {
    console.log(newProps.foo)
  })
</script>
```

watch 的第一个参数必须是可追踪的响应式数据源，如果你直接传一个普通值（比如解构出来的 `foo`），它就无法追踪到变化了。

#### 核心源码：`watch()` 是如何识别响应式数据源的？

`watch()` 的内部逻辑只接受以下几种类型作为数据源：

- `isRef(source)` -> 追踪 `.value`
- `isReactive(source)` -> 追踪整个对象
- `isArray(source)` -> 追踪数组中的每个元素
- `isFunction(source)` -> 作为 getter 执行，在执行过程中收集依赖

```ts
// github.com/vuejs/core/packages/reactivity/src/watch.ts
if (isRef(source)) {
  getter = () => source.value
  forceTrigger = isShallow(source)
} else if (isReactive(source)) {
  getter = () => reactiveGetter(source)
  forceTrigger = true
} else if (isArray(source)) {
  isMultiSource = true
  forceTrigger = source.some((s) => isReactive(s) || isShallow(s))
  getter = () =>
    source.map((s) => {
      if (isRef(s)) {
        return s.value
      } else if (isReactive(s)) {
        return reactiveGetter(s)
      } else if (isFunction(s)) {
        return call ? call(s, WatchErrorCodes.WATCH_GETTER) : s()
      } else {
        __DEV__ && warnInvalidSource(s)
      }
    })
} else if (isFunction(source)) {
  if (cb) {
    // getter with cb
    getter = call
      ? () => call(source, WatchErrorCodes.WATCH_GETTER)
      : (source as () => any)
  } else {
    // no cb -> simple effect
    getter = () => {
      if (cleanup) {
        pauseTracking()
        try {
          cleanup()
        } finally {
          resetTracking()
        }
      }
      const currentEffect = activeWatcher
      activeWatcher = effect
      try {
        return call
          ? call(source, WatchErrorCodes.WATCH_CALLBACK, [boundCleanup])
          : source(boundCleanup)
      } finally {
        activeWatcher = currentEffect
      }
    }
  }
} else {
  getter = NOOP
  __DEV__ && warnInvalidSource(source)
}
```

一个普通的原始值（如字符串、数字）不属于以上任何一种，会走到最后的 `else` 分支，触发 `warnInvalidSource` 警告，并且 getter 被设为 `NOOP`（空函数），永远不会触发。

现在再来看这个问题 => 「为什么 `() => foo` 可以工作」，背后的原理自然也就更加清晰了。

1. 当你写 `watch(() => foo, ...)` 时，编译器将其转换为 `watch(() => __props.foo, ...)`。
2. `() => __props.foo` 是一个函数，会进入 `if (isFunction(source)) { ... }` 分支。
3. `watch` 会将其作为 getter 执行。每次 getter 运行时，它会访问 `__props.foo` => 而 `__props` 是一个响应式对象，访问其属性会建立响应式依赖追踪。
4. 追踪关系建立滞后，当 `props.foo` 变化时，getter 返回新值，watcher 就会触发。

### 12.4. 不同场景对比

| 子组件访问 props 的不同场景 | 是否响应式 | 原因 |
| --- | --- | --- |
| `props.title` 直接访问（3.5+、3.4-） | 是 | Proxy 对象始终响应式 |
| `const { title } = defineProps(...)`（3.5+） | 是 | 编译器转换为 getter |
| `const { title } = defineProps(...)`（3.4-） | 否 | JavaScript 解构断开了引用 |
| `const { title } = toRefs(props)`（3.5+、3.4-） | 是 | ref 保持响应式 |
| `watch(() => title, ...)`（3.5+） | 是 | getter 内部被编译器重写 |

## 13. 💻 demos.1 - 属性声明 - 使用泛型声明 props

::: code-group

```html [App.vue]
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp msg="Hello World!" />
</template>
```

```html [Comp.vue]
<script setup lang="ts">
  defineProps<{ msg: string }>()
  // 约束
  // msg 是 string 类型
  // msg 是必填的

  // 这种方式利用 TypeScript 的泛型来定义 props 的类型，简单直观。
  // 适合简单类型的 props 定义，写起来比较简洁，且属性类型清晰。
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-18-10-58-30.png)

## 14. 💻 demos.2 - 属性声明 - 使用泛型声明可选的 props（type-based）

```html
<!-- src/demos/demo2/Comp.vue -->
<script setup lang="ts">
  defineProps<{ msg?: string }>()
  // 约束
  // msg 是 string 类型

  // demo1 中的写法，相当于定义了一个必填的 msg 属性，并且要求类型为 string。
  // 如果想要表达这是一个可选属性，和 TS 中的做法是一样的，只需要加一个问号即可。
</script>

<template>
  <h1>值：{{ msg }}</h1>
  <h1>类型：{{ typeof msg }}</h1>
</template>
```

```html
<!-- src/demos/demo2/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp />
  <hr />
  <Comp msg="Hello World!" />
</template>
```

![](assets/2024-10-19-07-35-53.png)

## 15. 💻 demos.3 - 属性声明 - 使用类型别名声明 props

```html
<!-- src/demos/demo3/Comp.vue -->
<script setup lang="ts">
  type Props = {
    msg: string
  }
  defineProps<Props>()
  // 约束
  // msg 是 string 类型
  // msg 是必填的

  // 类型别名提供了一种结构化的方式来定义 props 类型。
  // 适合需要复用类型定义的情况，可以定义复杂的类型结构，便于复用。
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>
```

```html
<!-- src/demos/demo3/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp msg="Hello World!" />
</template>
```

![](assets/2024-10-19-07-36-56.png)

## 16. 💻 demos.4 - 属性声明 - 使用接口声明 props

```html
<!-- src/demos/demo4/Comp.vue -->
<script setup lang="ts">
  interface Props {
    msg: string
  }
  defineProps<Props>()
  // 约束
  // msg 是 string 类型
  // msg 是必填的

  // 接口声明类似于类型别名，但更适用于面向对象编程风格。
  // 适合复杂类型的定义和继承，支持接口继承和扩展，结构更清晰。
  // 如果想要使用 TS 中接口的一些特性，比较适合使用这种声明方式。
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>
```

```html
<!-- src/demos/demo4/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp msg="Hello World!" />
</template>
```

![](assets/2024-10-19-07-38-25.png)

## 17. 💻 demos.5 - 属性声明 - 使用对象式声明 props

```html
<!-- src/demos/demo5/Comp.vue -->
<script setup lang="ts">
  defineProps({
    msg: {
      type: String,
      required: true,
    },
  })
  // 约束
  // msg 是 string 类型
  // msg 是必填的

  // 对象式声明提供了更详细的配置选项，如类型、默认值和验证规则等配置项。
  // 在需要详细配置 props 的场景下，这种写法是特别常见的。
  // 相对于其它写法，对象式声明 props 支持更多选项，灵活性高。
  // 对象声明也有简化版，只需要写明一个类型信息即可，详情见 demo6。
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>
```

```html
<!-- src/demos/demo5/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp msg="Hello World!" />
</template>
```

![](assets/2024-10-19-07-38-25.png)

## 18. 💻 demos.6 - 属性声明 - 使用对象简写声明 props

```html
<!-- src/demos/demo6/Comp.vue -->
<script setup lang="ts">
  defineProps({
    msg: String,
  })
  // 等效
  // defineProps({
  //   msg: {
  //     type: String
  //   },
  // })

  // 约束
  // msg 是 string 类型

  // 这是对象简写形式是对象式声明的简化版。
  // 适用于简单类型的快速声明。
  // 相较于 demo5，这种写法更加简洁明了，代码量更少。

  // 注意
  // key 键是 prop 的名称；
  // val 值是该 prop 预期类型的构造函数，不要误将 String 写为 string。
</script>

<template>
  <h1>值：{{ msg }}</h1>
  <h1>类型：{{ typeof msg }}</h1>
</template>
```

```html
<!-- src/demos/demo6/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp />
  <hr />
  <Comp msg="Hello World!" />
</template>
```

![](assets/2024-10-19-07-40-25.png)

## 19. 💻 demos.7 - 属性声明 - 使用数组简写声明 props

```html
<!-- src/demos/demo7/Comp.vue -->
<script setup lang="ts">
  defineProps(['a', 'b', 'c'])
  // 无约束
  // 这些属性可有可无，可以是任意类型。

  // 上述写法相当于：
  // 声明了 3 个属性分别是 a、b、c
  // 它们都是 any 类型
  // 如果没有传递值的话，那么它们将是 undefined

  // 数组简写形式是最简单的 props 声明方式。
  // 适用于不需要类型检查的小型项目或快速开发。
  // 这种声明方式缺乏类型信息。
  // a、b、c 可以是任意类型
  // 传啥类型都 ok
  // a、b、c 是可选的属性
  // 若在使用该组件时没有传递 msg 属性，是不会报错的。
</script>

<template>
  <p>a - 值：{{ a }}，类型：{{ typeof a }}</p>
  <p>b - 值：{{ b }}，类型：{{ typeof b }}</p>
  <p>c - 值：{{ c }}，类型：{{ typeof c }}</p>
  <hr />
</template>
```

```html
<!-- src/demos/demo7/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp a="Hello World!" b="123" c="true" />
  <!-- 可以传递任意类型 -->
  <Comp :a="'Hello World!'" :b="123" :c="true" />
  <!-- 可以只传部分值 -->
  <Comp :a="{msg: 'Hello World!'}" :b="['1', 2, 3]" />
  <!-- 可以啥都不传 -->
  <Comp />
  <!-- 可以使用 v-bind 来简化 -->
  <Comp v-bind="{a: {msg: 'Hello World!'}, b: 123, c: false}" />
</template>
```

![](assets/2024-10-19-07-41-42.png)

## 20. 💻 demos.16 - 属性声明 - 为单个 prop 指定多种可能的类型

```html
<!-- src/demos/demo16/Comp.vue -->
<script setup lang="ts">
  // type-based declaration
  // interface Props {
  //   a: number | string, // a 可以是 number 或者 string
  //   b: boolean | number // b 可以是 boolean 或者 number
  // }
  // defineProps<Props>()

  // runtime declaration
  defineProps({
    a: {
      type: [Number, String],
      required: true,
    },
    b: {
      type: [Boolean, Number],
      required: true,
    },
  })

  // 上述两种写法是等效的。
</script>

<template>
  <div>a 值：{{ a }}，类型：{{ typeof a }}</div>
  <div>b 值：{{ b }}，类型：{{ typeof b }}</div>
</template>
```

```html
<!-- src/demos/demo16/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp a="1" :b="true" />
  <Comp :a="1" :b="2" />
</template>
```

## 21. 💻 demos.11 - 属性声明 - 属性默认值（runtime）

```html
<!-- src/demos/demo11/Comp.vue -->
<script setup lang="ts">
  defineProps({
    msg: {
      type: String,
      default: 'hello',
      // 一旦设置了 default 值
      // 就意味着 msg 是可选的
      // 如果 msg 没有被传递
      // 那么 msg 将为 default 设置的值

      required: true,
      // 即便再去设置 required 为 true 也是无效的
      // 可以认为一个属性如果有默认值，那么它一定是可选的
    },
  })
</script>

<template>
  <p>msg: {{ msg }}</p>
</template>
```

```html
<!-- src/demos/demo11/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp />
  <Comp msg="Hello World!" />
</template>
```

![](assets/2024-10-19-07-43-09.png)

## 22. 💻 demos.12 - 属性声明 - 属性默认值（type-based）

```html
<!-- src/demos/demo12/Comp.vue -->
<script setup lang="ts">
  export interface Props {
    msg?: string
    labels?: string[]
  }
  // type-based-props-declaration
  // defineProps<Props>()
  // 当使用基于类型的声明时，我们失去了为 props 声明默认值的能力。
  // 这可以通过 withDefaults 编译器宏解决。
  const props = withDefaults(defineProps<Props>(), {
    msg: 'hello',
    labels: () => ['one', 'two'],
  })
  // 这将被编译为等效的运行时 props default 选项。
  // 此外，withDefaults 帮助程序为默认值提供类型检查，
  // 并确保返回的 props 类型删除了已声明默认值的属性的可选标志。

  console.log('[props.msg]', props.msg)
  console.log('[props.labels]', props.labels)
  console.log('------------------------------')
</script>

<template>
  <p>msg: {{ msg }}</p>
  <pre>{{ labels }}</pre>
  <hr />
</template>
```

```html
<!-- src/demos/demo12/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
  import { Props } from './Comp.vue'
  const p1: Props = {
    msg: 'Hello Vue 3.0!',
  }
  const p2: Props = {
    msg: 'Hello Vue 3.0!',
    labels: ['1', '2'],
  }
</script>

<template>
  <Comp />
  <Comp msg="Hello World!" />
  <Comp msg="123" :labels="['one']" />
  <Comp v-bind="p1" />
  <Comp v-bind="p2" />
</template>
```

![](assets/2024-10-19-07-44-08.png)

![](assets/2024-10-19-07-44-15.png)

## 23. 💻 demos.8 - 属性访问 - 在 script setup 中访问使用 defineProps 定义的 props

```html
<!-- src/demos/demo8/Comp.vue -->
<script setup lang="ts">
  const props = defineProps<{ msg: string }>()
  console.log('props.msg:', props.msg)
  debugger
  // 定义一个变量 props 接收 defineProps 的返回值
  // props 变量中存放的就是父组件使用时传入的 msg
  // props 是一个 Proxy 类型
  // 访问这个 Proxy 的 msg 字段，可以获取到父组件传递过来的属性值
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>
```

```html
<!-- src/demos/demo8/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp msg="Hello World!" />
</template>
```

![](assets/2024-10-19-07-46-33.png)

![](assets/2024-10-19-07-46-40.png)

## 24. 💻 demos.17 - 属性访问 - 在非 script setup 中访问 props

```html
<!-- src/demos/demo17/Comp.vue -->
<script lang="ts">
  // 如果不使用 script setup 的方式来声明 props
  export default {
    props: {
      msg: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      console.log(props.msg)
    },
  }
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>
```

```html
<!-- src/demos/demo17/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
</script>

<template>
  <Comp msg="Hello World!" />
</template>
```

![](assets/2024-10-19-07-47-27.png)

## 25. 💻 demos.14 - 属性校验 - Prop 校验（type-based）

```html
<!-- src/demos/demo14/Comp.vue -->
<script setup lang="ts">
  import { computed, defineProps, toRefs, watch } from 'vue'

  // 定义 Props 类型
  export interface Props {
    firstName: string
    lastName: string
    age?: number
  }

  // 定义 Props
  const props = defineProps<Props>()

  // 使用 toRefs 保持响应性
  const { firstName, lastName, age } = toRefs(props)

  // @ts-ignore
  window.firstName = firstName
  // @ts-ignore
  window.lastName = lastName
  // @ts-ignore
  window.age = age

  // 自定义验证函数
  function validateProps() {
    if (!firstName.value || firstName.value.length === 0) {
      throw new Error('First name is required and should not be empty')
      // setTimeout(() => {
      //   throw new Error('First name is required and should not be empty')
      // }, 1000);
    }
    if (!lastName.value || lastName.value.length === 0) {
      throw new Error('Last name is required and should not be empty')
      // setTimeout(() => {
      //   throw new Error('Last name is required and should not be empty')
      // }, 1000);
    }
    if (
      age.value !== undefined &&
      (!Number.isInteger(age.value) || age.value <= 0)
    ) {
      throw new Error('Age should be a positive integer if provided')
      // setTimeout(() => {
      //   throw new Error('Age should be a positive integer if provided')
      // }, 1000)
    }
  }

  // 调用验证函数
  validateProps()

  watch(
    () => [props.firstName, props.lastName, props.age],
    () => {
      // 当 Props 更新时重新验证
      validateProps()
    },
    { immediate: true },
  )

  // 计算 fullName
  const fullName = computed(() => `${firstName.value} ${lastName.value}`)
</script>

<template>
  <p>First Name: {{ firstName }}</p>
  <p>Last Name: {{ lastName }}</p>
  <p>Age: {{ age }}</p>
  <p>Full Name: {{ fullName }}</p>
</template>
```

```html
<!-- src/demos/demo14/App.vue -->
<script setup lang="ts">
  import { ref } from 'vue'
  import Comp from './Comp.vue'
  import type { Props } from './Comp.vue'
  const prop = ref<Props>({
    firstName: '1',
    lastName: 'a',
    age: 18,
  })
  // 传入无法通过校验的字段
  function updatePropsError() {
    prop.value.firstName = ''
    prop.value.lastName = ''
    prop.value.age = 1.1
  }
  // 传入可以通过校验的字段
  function updatePropsCorrect() {
    prop.value.firstName = '2'
    prop.value.lastName = 'b'
    prop.value.age = 28
  }
  function resetProp() {
    prop.value.firstName = '1'
    prop.value.lastName = 'a'
    prop.value.age = 18
  }
</script>

<template>
  <p><button @click="resetProp">resetProp</button></p>
  <p><button @click="updatePropsError">Error Update</button></p>
  <p><button @click="updatePropsCorrect">Correct Update</button></p>
  <Comp v-bind="prop" />
</template>
```

## 26. 💻 demos.15 - 属性校验 - Prop 校验（runtime）

```html
<!-- src/demos/demo15/Comp.vue -->
<script setup lang="ts">
  import { reactive, computed, watch } from 'vue'

  const props = defineProps({
    firstName: {
      type: String,
      required: true,
      validator: (value: string) => value.length > 0,
      // 使用 validator 字段可以帮助你在【开发阶段】捕获潜在的问题，
      // 确保组件接收到的 props 数据是符合预期的。
    },
    lastName: {
      type: String,
      required: true,
      validator: (value: string) => value.length > 0,
    },
    age: {
      type: Number,
      required: false,
      validator: (value: number) => Number.isInteger(value) && value > 0,
    },
  })

  // 将 props 拷贝一份出来，以防破坏单向数据流。
  // 将 props 转为响应式数据
  const state = reactive({
    firstName: props.firstName,
    lastName: props.lastName,
    age: props.age,
  })

  // @ts-ignore
  window.state = state

  watch(
    () => props,
    (newProps) => {
      console.log(newProps)
      state.firstName = newProps.firstName
      state.lastName = newProps.lastName
      state.age = newProps.age
    },
    { immediate: true, deep: true },
  )

  const fullName = computed(() => `${state.firstName}${state.lastName}`)
</script>

<template>
  <p>First Name: {{ state.firstName }}</p>
  <p>Last Name: {{ state.lastName }}</p>
  <p>Age: {{ state.age }}</p>
  <p>Full Name: {{ fullName }}</p> </template
><!-- src/demos/demo15/Comp.vue -->
<script setup lang="ts">
  import { reactive, computed, watch } from 'vue'

  const props = defineProps({
    firstName: {
      type: String,
      required: true,
      validator: (value: string) => value.length > 0,
      // 使用 validator 字段可以帮助你在【开发阶段】捕获潜在的问题，
      // 确保组件接收到的 props 数据是符合预期的。
    },
    lastName: {
      type: String,
      required: true,
      validator: (value: string) => value.length > 0,
    },
    age: {
      type: Number,
      required: false,
      validator: (value: number) => Number.isInteger(value) && value > 0,
    },
  })

  // 将 props 拷贝一份出来，以防破坏单向数据流。
  // 将 props 转为响应式数据
  const state = reactive({
    firstName: props.firstName,
    lastName: props.lastName,
    age: props.age,
  })

  // @ts-ignore
  window.state = state

  watch(
    () => props,
    (newProps) => {
      console.log(newProps)
      state.firstName = newProps.firstName
      state.lastName = newProps.lastName
      state.age = newProps.age
    },
    { immediate: true, deep: true },
  )

  const fullName = computed(() => `${state.firstName}${state.lastName}`)
</script>

<template>
  <p>First Name: {{ state.firstName }}</p>
  <p>Last Name: {{ state.lastName }}</p>
  <p>Age: {{ state.age }}</p>
  <p>Full Name: {{ fullName }}</p>
</template>
```

```html
<!-- src/demos/demo15/App.vue -->
<script setup lang="ts">
  import { ref } from 'vue'
  import Comp from './Comp.vue'
  const prop = ref({
    firstName: '1',
    lastName: 'a',
    age: 18,
  })
  // @ts-ignore
  window.prop = prop

  // 传入无法通过校验的字段
  function updatePropsError() {
    prop.value.firstName = ''
    prop.value.lastName = ''
    prop.value.age = 1.1
  }
  // 传入可以通过校验的字段
  function updatePropsCorrect() {
    prop.value.firstName = '2'
    prop.value.lastName = 'b'
    prop.value.age = 28
  }
  function resetProp() {
    prop.value.firstName = '1'
    prop.value.lastName = 'a'
    prop.value.age = 18
  }
</script>

<template>
  <p><button @click="resetProp">resetProp</button></p>
  <p><button @click="updatePropsError">Error Update</button></p>
  <p><button @click="updatePropsCorrect">Correct Update</button></p>
  <Comp v-bind="prop" />
</template>
```

- ![](assets/2024-10-19-07-49-34.png)
- ![](assets/2024-10-19-07-49-40.png)
- 更新错误的数据，控制台会报警告提示。
  - ![](assets/2024-10-19-07-49-59.png)

## 27. 💻 demos.9 - PropType 属性类型细化 - PropType 细化类型

```html
<!-- src/demos/demo9/Comp.vue -->
<script setup lang="ts">
  import type { PropType } from 'vue'
  // Used to annotate a prop with more advanced types
  // when using runtime props declarations.
  // 当使用运行时属性声明的时候
  // 用来标注一个更加复杂的属性类型
  // 通常用来精细化一个约束比较宽泛的类型

  export interface Book {
    title: string
    author: string
    year: number
  }

  defineProps({
    book: {
      // type: Book
      // 不能直接这么写，会报错
      // 因为 Book 是一个接口，而不是一个 JS 的构造函数

      // type: {
      //   title: String,
      //   author: String,
      //   year: Number
      // },
      // 这么写也是不允许的，会报错
      // 不满足 defineProps 的语法规则

      // type: Object,
      // 虽然可以写 Object，并且不会报错
      // 但是 Object 约束不明确
      // 只要是一个对象类型就可以传

      type: Object as PropType<Book>,
      // 使用类型工具 PropType<Book>
      // 可以进一步约束属性 book 的类型为 Book

      required: true,
    },
  })
</script>

<template>
  <pre>{{ book }}</pre>
</template>
```

```html
<!-- src/demos/demo9/App.vue -->
<script setup lang="ts">
  import { ref } from 'vue'
  import type { Book } from './Comp.vue'
  import Comp from './Comp.vue'
  const book = ref<Book>({
    title: '123',
    author: 'abc',
    year: 2024,
  })
</script>

<template>
  <Comp :book="book" />
  <Comp :book='{ title: "456", author: "ABC", year: 2025 }' />

  <!--
    如果将 book 的类型约束设置为 Object
    那么下面这种也是 ok 的
    如果 book 的类型约束设置为 Object as PropType<Book>
    那么下面这种就会报错
  -->
  <!-- <Comp :book='{a: 1, b: 2}' /> -->
</template>
```

![](assets/2024-10-19-07-51-01.png)

## 28. 💻 demos.10 - PropType 属性类型细化 - 使用 type-based 式写法来处理复杂类型

```html
<!-- src/demos/demo10/Comp.vue -->
<script setup lang="ts">
  export interface Book {
    title: string
    author: string
    year: number
  }

  defineProps<{ book: Book }>()
  // type-based props declarations
  // 通过基于类型的声明，一个 prop 可以像使用其他任何类型一样使用一个复杂类型。

  // 对比 runtime props declarations
  // type-based props declarations 的语法更简洁
</script>

<template>
  <pre>{{ book }}</pre>
</template>
```

```html
<!-- src/demos/demo10/App.vue -->
<script setup lang="ts">
  import { ref } from 'vue'
  import type { Book } from './Comp.vue'
  import Comp from './Comp.vue'
  const book = ref<Book>({
    title: '123',
    author: 'abc',
    year: 2024,
  })
</script>

<template>
  <Comp :book="book" />
  <Comp :book='{ title: "456", author: "ABC", year: 2025 }' />
</template>
```

![](assets/2024-10-19-07-51-39.png)

## 29. 💻 demos.13 - toRefs 保持属性的响应式状态 - toRefs 保持响应式

```html
<!-- src/demos/demo13/Comp.vue -->
<script setup lang="ts">
  import { toRefs, computed } from 'vue'

  export interface Props {
    firstName: string
    lastName: string
  }
  const props = defineProps<Props>()

  // 如果 props 是响应式数据，那么使用 toRefs 解构可以保持响应式
  // 如果 props 本身就不是一个响应式数据，那么跟直接解构无异
  const { firstName: f1, lastName: l1 } = toRefs(props)
  const full1 = computed(() => `${f1.value}${l1.value}`)

  // 直接解构，会失去响应式
  const { firstName: f2, lastName: l2 } = props
  const full2 = computed(() => `${f2}${l2}`)
</script>

<template>
  <h3>保持响应式</h3>
  <p>firstName: {{ f1 }}, lastName: {{ l1 }}, fullName: {{ full1 }}</p>
  <h3>保持响应式</h3>
  <p>
    firstName: {{ props.firstName }}, lastName: {{ props.lastName }}, fullName:
    {{ props.firstName + props.lastName }}
  </p>
  <h3>不保持响应式</h3>
  <p>firstName: {{ f2 }}, lastName: {{ l2 }}, fullName: {{ full2 }}</p>
  <hr />
</template>
```

```html
<!-- src/demos/demo13/App.vue -->
<script setup lang="ts">
  import Comp from './Comp.vue'
  import { Props } from './Comp.vue'
  import { ref, isRef } from 'vue'
  const p1 = ref<Props>({
    firstName: 'a',
    lastName: '1',
  })
  const p2: Props = {
    firstName: 'b',
    lastName: '2',
  }
  // @ts-ignore
  window.p2 = p2

  const isP1Ref = isRef(p1)
  const isP2Ref = isRef(p2)
</script>

<template>
  <p>isRef(p1) -> {{ isP1Ref }}，p1 是响应式数据</p>
  <p>p1.firstName:{{ p1.firstName }}</p>
  <p>
    <button @click="p1.firstName = p1.firstName === 'A' ? 'a' : 'A'">
      切换 p1.firstName 大小写
    </button>
  </p>
  <Comp v-bind="p1" />

  <p>isRef(p2) -> {{ isP2Ref }}，p2 不是响应式数据</p>
  <p>p2.firstName:{{ p2.firstName }}</p>
  <p>
    <button @click="p2.firstName = p2.firstName === 'B' ? 'b' : 'B'">
      切换大小写 p2.firstName
    </button>
  </p>
  <Comp v-bind="p2" />
</template>
```

![](assets/demo13.gif)

## 30. 🔗 引用

- [Vue.js 官方文档 - Props][1]
- [Vue.js 官方文档 - TypeScript 工具类型][2]
- [Vue.js 官方文档 - TypeScript 与组合式 API][3]

[1]: https://cn.vuejs.org/guide/components/props.html
[2]: https://cn.vuejs.org/api/utility-types.html
[3]: https://cn.vuejs.org/guide/typescript/composition-api
