# [0087. 组件 v-model](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0087.%20%E7%BB%84%E4%BB%B6%20v-model)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 组件上的 `v-model` 到底是什么？](#3--组件上的-v-model-到底是什么)
- [4. 🤔 `defineModel()` 是什么？](#4--definemodel-是什么)
- [5. 🤔 如何使用带参数的 `v-model`？](#5--如何使用带参数的-v-model)
- [6. 🤔 一个组件里可以同时存在多个 `v-model` 吗？](#6--一个组件里可以同时存在多个-v-model-吗)
- [7. 🤔 `v-model` 修饰符在组件上应该怎么处理？](#7--v-model-修饰符在组件上应该怎么处理)
- [8. 🤔 使用 `defineModel()` 时有哪些边界和注意事项？](#8--使用-definemodel-时有哪些边界和注意事项)
  - [8.1. 版本差异问题](#81-版本差异问题)
  - [8.2. 默认值问题](#82-默认值问题)
  - [8.3. 数据边界问题](#83-数据边界问题)
- [9. 🤔 这篇笔记对应的官方文档有什么特点？](#9--这篇笔记对应的官方文档有什么特点)
- [10. 💻 demos.1 - `defineModel()` 基本用法](#10--demos1---definemodel-基本用法)
  - [10.1. 使用 v-model + defineModel() 的写法实现](#101-使用-v-model--definemodel-的写法实现)
  - [10.2. 使用原生 props + emits 的写法实现](#102-使用原生-props--emits-的写法实现)
  - [10.3. 小结](#103-小结)
- [11. 💻 demos.2 - `defineModel()` 的底层机制（prop + emit）](#11--demos2---definemodel-的底层机制prop--emit)
- [12. 💻 demos.3 - 带参数的 `v-model`](#12--demos3---带参数的-v-model)
- [13. 💻 demos.4 - 多个 `v-model` 绑定](#13--demos4---多个-v-model-绑定)
- [14. 💻 demos.5 - `v-model` 修饰符与 get/set](#14--demos5---v-model-修饰符与-getset)
- [15. 💻 demos.6 - `defineModel()` 默认值导致的父子不同步问题](#15--demos6---definemodel-默认值导致的父子不同步问题)
- [16. 🔗 引用](#16--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 双向绑定
- defineModel
- 底层机制
- 参数绑定
- 多个模型
- 修饰符

## 2. 🫧 评价

组件上的 `v-model` 本质上还是 prop + 事件这一套，只不过 Vue 帮你把常见模式封装成了统一语法。你真正要掌握的是它的展开规则、参数写法、多模型绑定和修饰符处理，这样无论是用 `defineModel()` 还是手写旧写法，都不会被语法糖带偏。

实践建议：

- 需要自己定义输入字段时，用参数式 `v-model`。
- 需要同时绑定多个字段时，用多个 `v-model`。
- 需要处理输入值读写逻辑时，用修饰符配合 `get` / `set`。
- 需要排错时，退回到底层的 prop + emit 模型去看。

## 3. 🤔 组件上的 `v-model` 到底是什么？

你在原生表单元素上已经见过 `v-model`，它表示把「当前值」和「更新动作」绑定在一起。组件上的 `v-model` 也是同一件事，只不过绑定对象从原生元素变成了自定义组件。

从 Vue 3.4 开始，官方推荐你使用 `defineModel()` 来实现组件级 `v-model`：

::: code-group

```html [BaseInput.vue]
<template>
  <input v-model="model" />
</template>

<script setup>
  const model = defineModel()
</script>
```

```html [App.vue]
<template>
  <BaseInput v-model="keyword" />
  <p>keyword: {{ keyword }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import BaseInput from './BaseInput.vue'

  const keyword = ref('Vue')
</script>
```

:::

这里的 `model` 是一个 ref，它的值会和父组件 `v-model` 绑定的值同步，当你在子组件里改 `model.value`，父组件绑定的数据也会更新。

组件级的 `v-model` 和表单输入绑定中的 `v-model` 类似，都是把 `v-bind`「接收值」和 `v-on`「通知更新」这两个动作捏成了一个更顺手的 API。

## 4. 🤔 `defineModel()` 是什么？

`defineModel()` 是一个编译宏，本质上是语法糖。默认情况下，它会帮你生成两部分内容：

1. 一个名为 `modelValue` 的 prop，本地 ref 的值与其同步
2. 一个名为 `update:modelValue` 的事件，当本地 ref 的值发生变更时触发

```html
<!-- 写法 1：语法糖 -->
<template>
  <input v-model="model" />
</template>

<script setup>
  const model = defineModel()
</script>

<!-- 写法 2：底层写法 -->
<template>
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
  const props = defineProps(['modelValue'])
  const emit = defineEmits(['update:modelValue'])
</script>
```

写法 1 和写法 2 是等价的。`defineModel()` 的作用就是帮你把写法 2 里「定义 prop、定义事件、写绑定逻辑」这三步都自动生成出来。

对应地，父组件中使用 `v-model`：

```html
<!-- 语法糖 -->
<Child v-model="title" />

<!-- 对应的底层写法 -->
<Child :modelValue="title" @update:modelValue="(value) => (title = value)" />
```

开发建议：

- 如果你使用的版本是 Vue 3.4+，优先使用 `defineModel()`，它可以让组件 `v-model` 的实现更简洁。
- 如果你维护的项目还在 Vue 3.3 或更早版本，直接使用对应的底层写法也完全没问题。

在排查组件 `v-model` 异常时，不要只盯着语法糖看，直接退回到 `prop + emit` 这个底层模型，思路会清楚很多。

## 5. 🤔 如何使用带参数的 `v-model`？

组件上的 `v-model` 不一定只能绑定 `modelValue`。你可以通过参数指定绑定哪一个字段。

父组件这样写：

```html
<BookEditor v-model:title="bookTitle" />
```

子组件可以这样接：

```html
<template>
  <input v-model="title" />
</template>

<script setup>
  const title = defineModel('title')
</script>
```

这时它底层对应的是：

1. prop 名变成 `title`
2. 事件名变成 `update:title`

如果你还想顺手给这个模型字段加约束，也可以继续传配置对象：

```js
const title = defineModel('title', {
  required: true,
})
// 相当于：
// defineProps({
//   title: {
//     required: true
//   }
// })
// defineEmits(['update:title'])
```

这个参数写法很适合那些一个组件里本来就有多个「可双向绑定字段」的场景，比如表单组件、筛选器组件、日期范围组件等。

## 6. 🤔 一个组件里可以同时存在多个 `v-model` 吗？

可以，而且这正是参数式 `v-model` 的典型用法。

```html
<template>
  <input v-model="firstName" placeholder="first name" />
  <input v-model="lastName" placeholder="last name" />
</template>

<script setup>
  const firstName = defineModel('firstName')
  const lastName = defineModel('lastName')
</script>
```

父组件就可以这样绑定：

```html
<UserName v-model:first-name="first" v-model:last-name="last" />
```

这样做的好处是非常明确：每个 `v-model` 都绑定一个独立字段，不需要你再把多个值硬塞进同一个对象里去拆。

## 7. 🤔 `v-model` 修饰符在组件上应该怎么处理？

原生输入元素支持 `.trim`、`.number`、`.lazy` 这些修饰符。组件上的 `v-model` 也支持修饰符，只是要由你在子组件里主动处理。

你可以通过解构 `defineModel()` 的返回值拿到修饰符对象：

```html
<script setup>
  const [model, modifiers] = defineModel()

  console.log(modifiers)
  // 比如父组件写了 v-model.capitalize
  // 这里会得到 { capitalize: true }
</script>
```

如果你想根据修饰符改变写入逻辑，可以使用 `set`：

```html
<script setup>
  const [model, modifiers] = defineModel({
    set(value) {
      if (modifiers.capitalize) {
        return value.charAt(0).toUpperCase() + value.slice(1)
      }

      return value
    },
  })
</script>

<template>
  <input v-model="model" />
</template>
```

父组件可以这样使用：

```html
<MyInput v-model.capitalize="text" />
```

如果是带参数的 `v-model`，同样也能拿到对应模型字段自己的修饰符。

## 8. 🤔 使用 `defineModel()` 时有哪些边界和注意事项？

### 8.1. 版本差异问题

`defineModel()` 是 Vue 3.4+ 的写法。如果你维护的是旧项目，可能还会看到手写 `modelValue` 和 `update:modelValue` 的实现，这不是「过时错误」，只是版本差异。

### 8.2. 默认值问题

如果你给 `defineModel()` 配了 `default`，但父组件没有提供任何值，就可能出现父子两端初始值不同步的问题。

```html
<script setup>
  const model = defineModel({
    default: 1,
  })
</script>
```

如果父组件绑定的是一个初始值为 `undefined` 的 ref，那么子组件内部 `model` 会先拿到默认值 `1`，而父组件那边仍然是 `undefined`。这在初始化表单组件时很容易埋坑，所以要么让父组件显式给值，要么谨慎使用默认值。

### 8.3. 数据边界问题

别把组件 `v-model` 理解成「谁都能随便改的共享状态」。它依然遵循组件边界（谁的数据谁负责），只不过默认约定了输入字段和更新事件名。

## 9. 🤔 这篇笔记对应的官方文档有什么特点？

这篇笔记对应的官方文档是：[Vue.js 官方文档 - 组件 v-model][1]。

里面有大量对比 Vue 3.4 之前和之后两种写法差异的对比示例代码，如果你的项目还在 Vue 3.3 或更早版本，可以重点看看文档中记录的 Vue 3.4 之前的用法。

比如：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-11-20-45-13.png)

::: tip

这其实也在提醒我们，`defineModel` 这个便利宏并非必须的，它仅仅是提供了一些封装的便利，理解它背后的底层模型（prop + emit）才是关键。无论你使用的 Vue 版本已经支持这个编译宏，你都可以通过之前的写法（prop + emit）来实现 `defineModel` 所能实现的功能。

:::

## 10. 💻 demos.1 - `defineModel()` 基本用法

### 10.1. 使用 v-model + defineModel() 的写法实现

::: code-group

```html [App.vue（1）]
<template>
  <!--
    父组件用 v-model 绑定一个 ref 到子组件
    子组件内部修改 model 值时，父组件的 count 会同步更新
  -->
  <Counter v-model="count" />
  <p>父组件 count: {{ count }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import Counter from './Counter.vue'

  const count = ref(0)
</script>
```

```html [Counter.vue（2）]
<template>
  <div>
    <p>子组件 model: {{ model }}</p>
    <button @click="model++">子组件 +1</button>
  </div>
</template>

<script setup>
  // defineModel() 返回一个 ref，其 .value 与父组件 v-model 绑定的值同步
  // 修改 model.value 会自动触发父组件的值更新
  const model = defineModel()
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-19-20-05.png)

点击 + 1 按钮之后，子组件的 model 从 0 变成 1，父组件的 count 也从 0 变成 1，说明它们之间实现了双向绑定。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-19-20-21.png)

### 10.2. 使用原生 props + emits 的写法实现

::: code-group

```html [App.vue（3）]
<template>
  <Counter :modelValue="count" @update:modelValue="count = $event" />
  <p>父组件 count: {{ count }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import Counter from './Counter.vue'

  const count = ref(0)
</script>
```

```html [Counter.vue（4）]
<template>
  <div>
    <p>子组件 model: {{ modelValue }}</p>
    <button @click="$emit('update:modelValue', modelValue + 1)">
      子组件 +1
    </button>
  </div>
</template>

<script setup>
  defineProps({
    modelValue: {
      type: Number,
      required: true,
    },
  })

  defineEmits(['update:modelValue'])
</script>
```

:::

### 10.3. 小结

上述示例中，两种写法（1 + 2 = 3 + 4）完全是等效的，并且，1 + 4 和 3 + 2 的组合也是等效的。

$$
1 + 2 = 3 + 4 = 1 + 4 = 3 + 2
$$

通过对比上面两种写法，我们可以看到 `defineModel()` 的作用就是帮你把「定义 prop、定义事件、写绑定逻辑」这三步都自动生成出来，让组件 `v-model` 的实现更简洁。

| 语法糖 | 等效的原始写法 |
| --- | --- |
| `const model = defineModel()` | `defineProps` 接收 `modelValue` + `defineEmits` 注册 `update:modelValue` |
| `model.value = newVal` | `emit('update:modelValue', newVal)` |
| 父组件 `<Child v-model="count" />` | 父组件 `<Child :modelValue="count" @update:modelValue="count = $event" />` |

`v-model="count"` 本质上就是 `:modelValue="count"` + `@update:modelValue="count = $event"` 的语法糖。而 `defineModel()` 只是把 props 声明 + emits 声明 + 读写桥接这些模板代码进一步封装了，运行时行为完全一致。

## 11. 💻 demos.2 - `defineModel()` 的底层机制（prop + emit）

::: code-group

```html [App.vue]
<template>
  <!--
    这两个组件效果完全一致：
    v-model="msg" 编译后就是 :modelValue="msg" + @update:modelValue="..."
  -->
  <h3>语法糖写法</h3>
  <SugarInput v-model="msg" />

  <h3>底层写法</h3>
  <RawInput :modelValue="msg" @update:modelValue="msg = $event" />

  <p>msg: {{ msg }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import SugarInput from './SugarInput.vue'
  import RawInput from './RawInput.vue'

  const msg = ref('hello')
</script>
```

```html [SugarInput.vue]
<template>
  <input v-model="model" />
</template>

<script setup>
  // 语法糖：defineModel() 编译器会自动展开为 modelValue prop + update:modelValue 事件
  const model = defineModel()
</script>
```

```html [RawInput.vue]
<template>
  <!--
    手动实现与 defineModel() 等价的逻辑：
    1. 通过 props 接收 modelValue
    2. 通过 emit 触发 update:modelValue
  -->
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
  const props = defineProps(['modelValue'])
  const emit = defineEmits(['update:modelValue'])
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-20-12-49.png)

更新输入框中的内容，实现双向绑定的效果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-20-13-11.png)

## 12. 💻 demos.3 - 带参数的 `v-model`

::: code-group

```html [App.vue]
<template>
  <!--
    v-model:title="bookTitle" 表示绑定的 prop 名是 title（而非默认的 modelValue）
    底层等价于 :title="bookTitle" + @update:title="..."
  -->
  <BookEditor v-model:title="bookTitle" />
  <p>bookTitle: {{ bookTitle }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import BookEditor from './BookEditor.vue'

  const bookTitle = ref('Vue.js 设计与实现')
</script>
```

```html [BookEditor.vue]
<template>
  <input v-model="title" />
</template>

<script setup>
  // 传入字符串参数 'title'，底层会生成 title prop + update:title 事件
  const title = defineModel('title')
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-20-15-42.png)

更新输入框中的内容，实现双向绑定的效果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-20-15-35.png)

## 13. 💻 demos.4 - 多个 `v-model` 绑定

::: code-group

```html [App.vue]
<template>
  <!--
    单个组件上同时使用多个 v-model，每个绑定不同字段
    注意：模板中用 kebab-case (first-name)，JS 中用 camelCase (firstName)
  -->
  <UserName v-model:first-name="first" v-model:last-name="last" />
  <p>全名: {{ first }} {{ last }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import UserName from './UserName.vue'

  const first = ref('张')
  const last = ref('三')
</script>
```

```html [UserName.vue]
<template>
  <input v-model="firstName" placeholder="姓" />
  <input v-model="lastName" placeholder="名" />
</template>

<script setup>
  // 多次调用 defineModel()，每次传不同参数，各自独立维护双向绑定
  const firstName = defineModel('firstName')
  const lastName = defineModel('lastName')
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-20-17-14.png)

更新输入框中的内容，实现双向绑定的效果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-20-17-21.png)

## 14. 💻 demos.5 - `v-model` 修饰符与 get/set

::: code-group

```html [App.vue]
<template>
  <!--
    自定义修饰符 capitalize：将输入的首字母自动大写
    注意：这里的 .capitalize 是自定义修饰符，不是 Vue 内置的
  -->
  <MyInput v-model.capitalize="text" />
  <p>text: {{ text }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import MyInput from './MyInput.vue'

  const text = ref('')
</script>
```

```html [MyInput.vue]
<template>
  <input v-model="model" />
</template>

<script setup>
  // defineModel() 解构返回 [model, modifiers]
  // modifiers 是一个对象，如 { capitalize: true }
  const [model, modifiers] = defineModel({
    // set 在 model.value 被赋值时触发，返回处理后的值
    // 通过 set 拦截写入，实现修饰符的自定义逻辑
    set(value) {
      if (modifiers.capitalize && value) {
        return value.charAt(0).toUpperCase() + value.slice(1)
      }
      return value
    },
  })
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-20-18-58.png)

更新输入框中的内容，实现双向绑定的效果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-20-19-07.png)

## 15. 💻 demos.6 - `defineModel()` 默认值导致的父子不同步问题

::: code-group

```html [App.vue]
<template>
  <!--
    警告场景：
    子组件 defineModel({ default: 1 }) 设置了默认值
    但父组件的 ref 没有给初始值（undefined）
    结果：子组件 model 显示 1，父组件 myRef 仍为 undefined
    点击按钮观察父子值差异
  -->
  <Child v-model="myRef" />
  <p>父组件 myRef: {{ myRef }} (类型: {{ typeof myRef }})</p>
  <p>注意：子组件显示的是默认值 1，但父组件仍为 undefined</p>
  <p>点击子组件按钮后父子才会同步</p>
</template>

<script setup>
  import { ref } from 'vue'
  import Child from './Child.vue'

  const myRef = ref() // 未提供初始值，初始为 undefined
</script>
```

```html [Child.vue]
<template>
  <div>
    <p>子组件 model: {{ model }}</p>
    <button @click="model++">子组件 +1</button>
  </div>
</template>

<script setup>
  // 配置了 default: 1，当父组件未传值时，子组件会使用默认值 1
  // 但父组件那边仍是 undefined，造成父子初始值不同步
  // 建议：要么父组件显式给初始值，要么谨慎使用 default
  const model = defineModel({ default: 1 })
</script>
```

:::

初始状态不一致：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-20-21-08.png)

点击子组件的 +1 按钮后，父组件和子组件的值才会同步：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-15-20-21-41.png)

## 16. 🔗 引用

- [Vue.js 官方文档 - 组件 v-model][1]

[1]: https://cn.vuejs.org/guide/components/v-model.html
