# [0012. 内置组件 keep-alive](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0012.%20%E5%86%85%E7%BD%AE%E7%BB%84%E4%BB%B6%20keep-alive)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `<keep-alive>` 是什么？有什么用？](#3--keep-alive-是什么有什么用)
  - [3.1. `<keep-alive>` 简介](#31-keep-alive-简介)
  - [3.2. keep-alive 提供的三个 props：`include`、`exclude`、`max`](#32-keep-alive-提供的三个-propsincludeexcludemax)
  - [3.3. 两个独有的生命周期钩子](#33-两个独有的生命周期钩子)
  - [3.4. 配合 `<component>` 和 Vue Router 使用](#34-配合-component-和-vue-router-使用)
- [4. 💻 demos.4 - `<keep-alive>` - 基本用法](#4--demos4---keep-alive---基本用法)
- [5. 💻 demos.5 - `<keep-alive>` - include / exclude / max](#5--demos5---keep-alive---include--exclude--max)
- [6. 💻 demos.6 - `<keep-alive>` - onActivated / onDeactivated 生命周期](#6--demos6---keep-alive---onactivated--ondeactivated-生命周期)
- [7. 🔗 引用](#7--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `<keep-alive>`

## 2. 🫧 评价

- todo

## 3. 🤔 `<keep-alive>` 是什么？有什么用？

### 3.1. `<keep-alive>` 简介

keep-alive 是 Vue 的一个内置组件，用于缓存动态组件的实例而不是销毁它们。当组件在 keep-alive 中被切换时，它会被「停用」而非「销毁」，其 DOM 元素和组件状态都会被保留在内存中。当再次激活时，之前的状态会完整恢复。

- 无 keep-alive，切换 = 销毁重建，状态会自动重置
- 有 keep-alive，切换 = 存入内存/从内存取出，状态可以持久化

一些常见的使用场景：

| 场景                           | 是否需要 keep-alive                |
| ------------------------------ | ---------------------------------- |
| 弹窗 / 抽屉等短期展示的组件    | 不需要，销毁重建开销小             |
| 标签页切换，需保持各标签页状态 | 需要                               |
| 列表、详情页来回切换           | 需要，保持列表滚动位置和筛选条件   |
| 多步骤表单，切换步骤时保持输入 | 需要                               |
| 大体积图表组件，只展示一次     | 不需要，配合异步组件做懒加载更合适 |

### 3.2. keep-alive 提供的三个 props：`include`、`exclude`、`max`

keep-alive 提供三个 props 来精细化控制缓存行为：

| Prop | 作用 | 接收类型 |
| --- | --- | --- |
| `include` | 只缓存匹配的组件 | 字符串（逗号分隔）、正则、数组 |
| `exclude` | 不缓存匹配的组件 | 字符串（逗号分隔）、正则、数组 |
| `max` | 最大缓存实例数，超出时按 LRU 策略淘汰 | 数字 |

::: code-group

```html [script]
<script>
  // 匹配依据是组件的 name 选项
  export default { name: 'MyName' }
</script>
```

```html [script setup]
<!-- 
在 <script setup> 中，组件名默认从文件名推断
比如 CounterA.vue -> CounterA
-->
<script setup>
  // ...
</script>

<!-- 
如需显式指定，可添加一个额外的 <script> 块：
-->
<script>
  export default { name: 'MyName' }
</script>
```

:::

### 3.3. 两个独有的生命周期钩子

被 keep-alive 缓存的组件拥有两个独有的生命周期钩子：

| 钩子            | 触发时机                          |
| --------------- | --------------------------------- |
| `onActivated`   | 首次挂载时 + 每次从缓存中被激活时 |
| `onDeactivated` | 从 DOM 移除、进入缓存时           |

注意和普通生命周期的区别：被 keep-alive 缓存的组件不会触发 `onUnmounted`，只有真正从缓存中移除（如 keep-alive 被卸载、或被 max 淘汰）时才会触发。

实际应用场景：

- 在 `onActivated` 主要实现状态恢复逻辑，比如：刷新数据或恢复轮询
- 在 `onDeactivated` 主要实现清理逻辑，比如：停止定时器或取消请求

### 3.4. 配合 `<component>` 和 Vue Router 使用

在实际项目中，keep-alive 最常配合 Vue Router 使用，缓存路由页面：

```html
<template>
  <router-view v-slot="{ Component }">
    <KeepAlive :include="cachedViews">
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>

<script setup>
  import { ref } from 'vue'

  // 动态管理需要缓存的页面（组件 name 必须匹配）
  const cachedViews = ref(['UserList', 'UserDetail'])
</script>
```

这种模式下，用户从列表页进入详情页再返回时，列表页的滚动位置、搜索条件、分页状态都会被保留，无需重新请求数据。

## 4. 💻 demos.4 - `<keep-alive>` - 基本用法

下面这个示例用一个计数器直观对比「有 / 无 keep-alive」的效果差异：

::: code-group

```html [App.vue]
<script setup>
  import { ref } from 'vue'
  import CounterA from './CounterA.vue'
  import CounterB from './CounterB.vue'

  const current = ref('A')
</script>

<template>
  <button @click="current = 'A'">组件 A</button>
  <button @click="current = 'B'">组件 B</button>

  <h4>无 keep-alive（切换后计数归零）：</h4>
  <CounterA v-if="current === 'A'" />
  <CounterB v-else />

  <h4>有 keep-alive（切换后计数保持）：</h4>
  <KeepAlive>
    <CounterA v-if="current === 'A'" />
    <CounterB v-else />
  </KeepAlive>
</template>
```

```html [CounterA.vue]
<script setup>
  import { ref } from 'vue'
  const count = ref(0)
</script>

<template>
  <p>
    组件 A | count: {{ count }}
    <button @click="count++">+1</button>
  </p>
</template>
```

```html [CounterB.vue]
<script setup>
  import { ref } from 'vue'
  const count = ref(0)
</script>

<template>
  <p>
    组件 B | count: {{ count }}
    <button @click="count++">+1</button>
  </p>
</template>
```

:::

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-20-09-59-45.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-20-10-02-10.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-20-10-02-19.png)

![4](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-20-10-02-27.png)

:::

操作步骤：

1. 先在组件 A 点击「+1」让 count 变成 1
2. 再切换到组件 B 点击「+1」让 count 变成 2
3. 然后切换回到组件 A，观察 count 的值，会发现：
   - 无 keep-alive：count 归零，因为组件被销毁重建了
   - 有 keep-alive：count 仍然是 1，因为组件被缓存而非销毁
4. 然后切换回到组件 B，观察 count 的值，会发现：
   - 无 keep-alive：count 归零，因为组件被销毁重建了
   - 有 keep-alive：count 仍然是 2，因为组件被缓存而非销毁

## 5. 💻 demos.5 - `<keep-alive>` - include / exclude / max

下面的示例演示了三个 prop 的用法：

::: code-group

```html [App.vue]
<script setup>
  import { ref } from 'vue'
  import CounterA from './CounterA.vue'
  import CounterB from './CounterB.vue'
  import CounterC from './CounterC.vue'

  const components = { A: CounterA, B: CounterB, C: CounterC }
  const current = ref('A')
</script>

<template>
  <button
    v-for="(_, key) in components"
    :key="key"
    @click="current = key"
    :style="{ fontWeight: current === key ? 'bold' : 'normal' }"
  >
    组件 {{ key }}
  </button>

  <!-- 1. include：只缓存 A 和 B，C 不缓存 -->
  <h4>include="CounterA,CounterB"（C 切换后状态丢失）</h4>
  <KeepAlive include="CounterA,CounterB">
    <component :is="components[current]" />
  </KeepAlive>

  <!-- 2. exclude：缓存所有组件，但排除 B -->
  <h4>exclude="CounterB"（B 切换后状态丢失）</h4>
  <KeepAlive exclude="CounterB">
    <component :is="components[current]" />
  </KeepAlive>

  <!-- 3. max：最多缓存 2 个实例，超出时淘汰最久未访问的 -->
  <h4>max="2"（依次切换 A -> B -> C，再回 A，A 的状态已丢失）</h4>
  <KeepAlive :max="2">
    <component :is="components[current]" />
  </KeepAlive>
</template>
```

```html [CounterA.vue]
<script>
  export default { name: 'CounterA' }
</script>
<script setup>
  import { ref } from 'vue'
  const count = ref(0)
</script>

<template>
  <p>
    CounterA | count: {{ count }}
    <button @click="count++">+1</button>
  </p>
</template>
```

```html [CounterB.vue]
<script>
  export default { name: 'CounterB' }
</script>
<script setup>
  import { ref } from 'vue'
  const count = ref(0)
</script>

<template>
  <p>
    CounterB | count: {{ count }}
    <button @click="count++">+1</button>
  </p>
</template>
```

```html [CounterC.vue]
<script>
  export default { name: 'CounterC' }
</script>
<script setup>
  import { ref } from 'vue'
  const count = ref(0)
</script>

<template>
  <p>
    CounterC | count: {{ count }}
    <button @click="count++">+1</button>
  </p>
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-20-10-13-59.png)

验证方法：分别在三组场景中点击 +1，切换组件后切回来，观察 count 是否保留。

- include：A、B 的 count 保留，C 的 count 归零
- exclude：A、C 的 count 保留，B 的 count 归零
- max：依次 A->B->C->A，A 的 count 归零（因为缓存上限为 2，A 已被淘汰）
  - 注意事项：当你切换到一个组件的时候，这个组件就会占一个位置，比如你在 A、B 点击了 +1 之后，如果你继续只在 A、B 之间切换，那么它们的状态都会被保留，因为它们都在缓存中；但是一旦你切换到 C，C 就会占用一个新的缓存位置，此时缓存已经满了（A、B、C 三个组件），根据 LRU 策略，最久未访问的组件就会被淘汰掉。此时如果你是从 B 切到 C，那么 B 的状态保留，A 的状态被重置；如果你是从 A 切到 C，那么 A 的状态保留，B 的状态被重置。

## 6. 💻 demos.6 - `<keep-alive>` - onActivated / onDeactivated 生命周期

::: code-group

```html [App.vue]
<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { KeepAlive } from 'vue'
  import ChildA from './ChildA.vue'
  import ChildB from './ChildB.vue'

  const current = ref('A')
  const components = { A: ChildA, B: ChildB }

  onMounted(() => console.log('App mounted'))
  onUnmounted(() => console.log('App unmounted'))
</script>

<template>
  <p>打开控制台观察生命周期日志</p>
  <button @click="current = 'A'">切换到 A</button>
  <button @click="current = 'B'">切换到 B</button>

  <KeepAlive>
    <component :is="components[current]" />
  </KeepAlive>
</template>
```

```html [ChildA.vue]
<script setup>
  import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

  const count = ref(0)

  onMounted(() => console.log('[A] onMounted（首次挂载）'))
  onUnmounted(() =>
    console.log('[A] onUnmounted（不会触发，除非从缓存中被移除）'),
  )
  onActivated(() => console.log('[A] onActivated（从缓存中激活）'))
  onDeactivated(() => console.log('[A] onDeactivated（进入缓存）'))
</script>

<template>
  <p>
    组件 A | count: {{ count }}
    <button @click="count++">+1</button>
  </p>
</template>
```

```html [ChildB.vue]
<script setup>
  import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

  const count = ref(0)

  onMounted(() => console.log('[B] onMounted（首次挂载）'))
  onUnmounted(() =>
    console.log('[B] onUnmounted（不会触发，除非从缓存中被移除）'),
  )
  onActivated(() => console.log('[B] onActivated（从缓存中激活）'))
  onDeactivated(() => console.log('[B] onDeactivated（进入缓存）'))
</script>

<template>
  <p>
    组件 B | count: {{ count }}
    <button @click="count++">+1</button>
  </p>
</template>
```

:::

首次加载时控制台输出：

```
[A] onMounted（首次挂载）
[A] onActivated（从缓存中激活）
App mounted
```

点击「切换到 B」后：

```
[A] onDeactivated（进入缓存）
[B] onMounted（首次挂载）
[B] onActivated（从缓存中激活）
```

从 B 切回 A 后：

```
[B] onDeactivated（进入缓存）
[A] onActivated（从缓存中激活）
```

注意：此时 A 的 onMounted 不会再触发，因为它来自缓存，不是重新挂载。

## 7. 🔗 引用

- [Vuejs 官方文档 - 内置组件 - KeepAlive][1]

[1]: https://cn.vuejs.org/guide/built-ins/keep-alive.html
