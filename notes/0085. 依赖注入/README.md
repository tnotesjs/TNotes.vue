# [0085. 依赖注入](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0085.%20%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `provide` / `inject` 主要解决什么问题？](#3--provide--inject-主要解决什么问题)
- [4. 🤔 如何在组件中 provide 和 inject？](#4--如何在组件中-provide-和-inject)
- [5. 🤔 什么是应用层 Provide？](#5--什么是应用层-provide)
- [6. 🤔 注入不到值时怎么办？默认值怎么写？](#6--注入不到值时怎么办默认值怎么写)
- [7. 🤔 `provide` / `inject` 和响应式数据应该如何配合？](#7--provide--inject-和响应式数据应该如何配合)
- [8. 🤔 为什么推荐用 `Symbol` 作为注入名？](#8--为什么推荐用-symbol-作为注入名)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 逐级透传
- Provide
- Inject
- 默认值
- 响应式共享
- Symbol 键

## 2. 🫧 评价

依赖注入不是最先学、也不是最高频的组件通信方式，但它一旦出现，通常就是在解决「跨很多层传值太麻烦」这种真正的结构问题。你不需要把它用成状态管理替代品，但至少要掌握 provide、inject、默认值、响应式共享和 Symbol key 这些核心规则。

## 3. 🤔 `provide` / `inject` 主要解决什么问题？

当一个较深层的后代组件需要祖先组件里的数据时，如果只靠 props 往下一级一级传，就会出现典型的 prop 逐级透传问题。

也就是说：

1. 真正需要数据的是深层组件。
2. 中间很多组件其实根本不用这份数据。
3. 但这些中间组件仍然要被迫接收并继续向下传。

这种链路一长，组件接口就会被很多「只是路过」的 props 污染，维护起来也很烦。

`provide` / `inject` 就是用来解决这个问题的：

1. 祖先组件负责「提供」一份依赖。
2. 任意深度的后代组件都可以按 key 把它「注入」进来。

所以它本质上是一种跨层级依赖共享机制，不需要中间组件层层转手。

## 4. 🤔 如何在组件中 provide 和 inject？

在 Vue 3 里，最常见的写法是直接在 `<script setup>` 中使用 `provide()` 和 `inject()`。

::: code-group

```html [Provider.vue]
<script setup>
  import { provide } from 'vue'

  provide('theme', 'dark')
</script>

<template>
  <slot />
</template>
```

```html [DeepChild.vue]
<script setup>
  import { inject } from 'vue'

  const theme = inject('theme')
</script>

<template>
  <p>当前主题：{{ theme }}</p>
</template>
```

:::

如果没有使用 `<script setup>`，`provide()` 和 `inject()` 也都应该在 `setup()` 里同步调用，不要放到异步回调里。否则当前组件实例的上下文可能已经丢了。

这里有几个基础规则：

1. `provide()` 的第一个参数是注入名，第二个参数是值。
2. 注入名可以是字符串，也可以是 `Symbol`。
3. 一个组件可以多次 `provide()` 不同依赖。
4. `inject()` 会沿着父组件链向上查找，取最近的那个提供者。

如果提供的是一个 ref，注入方拿到的仍然是这个 ref 对象，而不会自动解包。这样做的好处是，供给方和注入方之间可以保持响应式连接。

## 5. 🤔 什么是应用层 Provide？

除了在具体组件里 provide 之外，你还可以直接在应用实例上提供依赖：

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.provide('apiBaseUrl', 'https://example.com/api')

app.mount('#app')
```

这样，当前应用内的任意组件都可以注入这份数据。

这种方式特别适合：

1. 插件安装时注入配置
2. 应用级共享服务
3. 不依赖具体组件层级的全局配置

换句话说，组件级 provide 更像「某棵子树内共享」，应用级 provide 更像「整个应用作用域内共享」。

## 6. 🤔 注入不到值时怎么办？默认值怎么写？

默认情况下，如果你 `inject()` 的 key 没有被任何祖先提供，Vue 会给出运行时警告。

如果这个依赖本身就是可选的，你应该给它一个默认值：

```js
const locale = inject('locale', 'zh-CN')
```

如果默认值的创建成本比较高，还可以使用工厂函数：

```js
const service = inject('service', () => createService(), true)
```

这里第三个参数 `true` 的意思是：把第二个参数当成工厂函数，而不是把函数本身当作默认值。

所以默认值这一块你可以记成：

1. 简单值，直接传。
2. 昂贵对象或类实例，用工厂函数。

## 7. 🤔 `provide` / `inject` 和响应式数据应该如何配合？

依赖注入最常见的真实用法，不是传一个普通字符串，而是传一份响应式状态。

```html
<script setup>
  import { provide, ref } from 'vue'

  const count = ref(0)

  provide('count', count)
</script>
```

后代组件拿到后，和供给方会共享同一个 ref。

不过官方更推荐你把「状态修改动作」尽量保留在提供者组件内部，再把修改函数也一起 provide 出去：

```html
<script setup>
  import { provide, ref } from 'vue'

  const location = ref('North Pole')

  function updateLocation() {
    location.value = 'South Pole'
  }

  provide('locationContext', {
    location,
    updateLocation,
  })
</script>
```

注入方：

```html
<script setup>
  import { inject } from 'vue'

  const { location, updateLocation } = inject('locationContext')
</script>

<template>
  <button @click="updateLocation">{{ location }}</button>
</template>
```

这样做的好处是「状态定义」和「状态修改规则」仍然内聚在提供者一侧，代码更容易维护。

如果你只想让注入方读取，完全不想让它改，还可以在 provide 时用 `readonly()` 包一层。

## 8. 🤔 为什么推荐用 `Symbol` 作为注入名？

小项目里用字符串 key 没什么问题：

```js
provide('theme', theme)
const theme = inject('theme')
```

但如果项目比较大、依赖比较多，或者你在写组件库，字符串 key 就可能撞名。

这时更稳妥的方式是使用 `Symbol`：

```js
// keys.js
export const themeKey = Symbol('theme')
```

```js
// provider
import { provide } from 'vue'
import { themeKey } from './keys'

provide(themeKey, 'dark')
```

```js
// consumer
import { inject } from 'vue'
import { themeKey } from './keys'

const theme = inject(themeKey)
```

这样做的主要价值不是「写法更高级」，而是避免 key 冲突，让依赖关系更稳定、更适合复用和跨文件维护。

## 9. 🔗 引用

- [Vue.js 官方文档 - 依赖注入][1]

[1]: https://cn.vuejs.org/guide/components/provide-inject.html
