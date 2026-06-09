# [0091. Suspense](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0091.%20Suspense)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `<Suspense>` 是什么？](#3-suspense-是什么)
  - [3.1. suspense 这个英文单词的含义是？](#31-suspense-这个英文单词的含义是)
  - [3.2. 作用](#32-作用)
  - [3.3. 稳定性](#33-稳定性)
- [4. 哪些东西会被 `<Suspense>` 视为异步依赖？](#4-哪些东西会被-suspense-视为异步依赖)
  - [4.1. 异步依赖](#41-异步依赖)
  - [4.2. `async setup()`](#42-async-setup)
  - [4.3. 异步组件](#43-异步组件)
- [5. `<Suspense>` 都有哪些插槽？](#5-suspense-都有哪些插槽)
  - [5.1. `default` 和 `fallback` 插槽](#51-default-和-fallback-插槽)
  - [5.2. 注意：插槽内容中的节点数量](#52-注意插槽内容中的节点数量)
    - [示例：单个根节点](#示例单个根节点)
    - [示例：特殊的 `v-if` 注释节点](#示例特殊的-v-if-注释节点)
    - [示例：多个子节点，无法确定单一根](#示例多个子节点无法确定单一根)
  - [5.3. `default` 和 `fallback` 插槽的切换逻辑是什么？什么情况下会再次回退到 `fallback`？](#53-default-和-fallback-插槽的切换逻辑是什么什么情况下会再次回退到-fallback)
    - [初次渲染](#初次渲染)
    - [后续更新](#后续更新)
    - [示例：根节点类型变化，回退到 `fallback`](#示例根节点类型变化回退到-fallback)
    - [示例：持续触发异步，但只有首次触发 `fallback`](#示例持续触发异步但只有首次触发-fallback)
- [6. `<Suspense>` 都有哪些属性？](#6-suspense-都有哪些属性)
  - [6.1. `SuspenseProps` 接口](#61-suspenseprops-接口)
  - [6.2. `timeout`](#62-timeout)
    - [`timeout` 的作用](#timeout-的作用)
    - [`timeout` 仅影响切换，不影响首次渲染](#timeout-仅影响切换不影响首次渲染)
  - [6.3. `suspensible`（Vue 3.3+）](#63-suspensiblevue-33)
    - [对比：“无 suspensible” vs “有 suspensible”](#对比无-suspensible-vs-有-suspensible)
    - [示例：对比有无 `suspensible`](#示例对比有无-suspensible)
- [7. `<Suspense>` 都有哪些事件？](#7-suspense-都有哪些事件)
  - [7.1. `<Suspense>` 一共有 3 个事件：`@pending`、`@fallback`、`@resolve`](#71-suspense-一共有-3-个事件pendingfallbackresolve)
  - [7.2. `@pending` 和 `@fallback` 的区别](#72-pending-和-fallback-的区别)
- [8. `<Suspense>` 如何做错误处理？](#8-suspense-如何做错误处理)
  - [8.1. 官方原话](#81-官方原话)
  - [8.2. 示例：`onErrorCaptured()` + `v-if` 条件渲染](#82-示例onerrorcaptured--v-if-条件渲染)
  - [8.3. 示例：用 `<Suspense>` 的嵌套做优雅降级](#83-示例用-suspense-的嵌套做优雅降级)
- [9. `<Suspense>` 和 `<Transition>`、`<KeepAlive>`、`<RouterView>` 该怎么配合？](#9-suspense-和-transitionkeepaliverouterview-该怎么配合)
- [10. 如何处理嵌套的动态异步组件加载状态？](#10-如何处理嵌套的动态异步组件加载状态)
  - [10.1. `<Suspense>` 不感知内层 update](#101-suspense-不感知内层-update)
  - [10.2. 示例：单层 `<Suspense>` 解决不了内层动态组件切换时的空节点问题](#102-示例单层-suspense-解决不了内层动态组件切换时的空节点问题)
  - [10.3. 解决空节点问题的做法：嵌套 `<Suspense>`](#103-解决空节点问题的做法嵌套-suspense)
- [11. 异步组件和 `<Suspense>` 是什么关系？](#11-异步组件和-suspense-是什么关系)
  - [11.1. 两者之间的关系](#111-两者之间的关系)
  - [11.2. 配合使用](#112-配合使用)
  - [11.3. 示例：异步组件 `defineAsyncComponent` 与 `<Suspense>` 配合使用](#113-示例异步组件-defineasynccomponent-与-suspense-配合使用)
  - [11.4. 小结](#114-小结)
- [12. 引用](#12-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 功能定位
- 异步依赖
- 顶层 await
- fallback
- timeout
- 三个事件
- 错误处理
- 嵌套边界

## 2. 评价

`<Suspense>` 的价值主要体现在复杂异步组件树里，可用于统一管理异步加载期间的页面 UI 状态。但它是实验性功能，上生产的话可能还有风险。在使用时，需要关注“初次渲染”和“后续更新”两个阶段，这两个阶段的很多行为细节是不一样的。

## 3. `<Suspense>` 是什么？

### 3.1. suspense 这个英文单词的含义是？

Suspense 在英语中的本意是：

- 悬而未决、暂时中止
- 一种等待、不确定、悬念的状态

在文学或影视中，“suspense” 通常指那种紧张地等待某个结果揭晓的感觉。

### 3.2. 作用

`<Suspense>` 用来协调“整棵组件子树里的异步依赖”。

如果没有它，当一个页面里有多个异步组件或多个 `async setup()` 组件时，常见情况是：

- 这里一个 loading
- 那里一个 loading
- 内容分批出现
- 页面完成时机不统一

`<Suspense>` 的目标就是把这些异步依赖收口到一个上层边界里，在它们都准备好之前，用统一的后备内容兜底。

### 3.3. 稳定性

至少现在（26.05 Vue 3.5）还不是一个稳定版，还是一个实验性功能。

官方文档的开头就说明了：

::: warning 实验性功能

`<Suspense>` 是一项实验性功能。它不一定会最终成为稳定功能，并且在稳定之前相关 API 也可能会发生变化。

:::

## 4. 哪些东西会被 `<Suspense>` 视为异步依赖？

### 4.1. 异步依赖

官方文档明确提到两类：

1. 带异步 `setup()` 的组件
2. 异步组件

::: tip 如果组件不是异步组件，也没有顶层 await 的逻辑，那还有必要使用 `<Suspense>` 吗？

没必要。

如果组件树中既没有异步组件，也没有任何顶层 await，那么 `<Suspense>` 不会捕获到任何异步依赖。它会认为所有内容都已就绪，直接从开始就显示 default 插槽，fallback 永远不会被触发。

这种情况下使用 `<Suspense>` 是多余的，没有实际意义，直接渲染组件即可。

:::

### 4.2. `async setup()`

```js
export default {
  async setup() {
    const response = await fetch('/api/posts')
    const posts = await response.json()

    return { posts }
  },
}
```

如果你使用 `<script setup>`，顶层 `await` 也会让这个组件自动成为异步依赖：

```html
<script setup>
  const response = await fetch('/api/posts')
  const posts = await response.json()
</script>

<template> {{ posts }} </template>
```

### 4.3. 异步组件

异步组件默认就是 `suspensible` 的，也就是说如果组件树上层存在 `<Suspense>`，它会被纳入这个边界统一管理。

```js
const AsyncPanel = defineAsyncComponent(
  () => import('./components/AsyncPanel.vue'),
  // 默认就是 suspensible: true
)
```

如果你显式把异步组件设为 `suspensible: false`，那它就不再交给 `<Suspense>` 统一控制，而是自己处理加载态。

```js
const AsyncPanel = defineAsyncComponent(
  () => import('./components/AsyncPanel.vue'),
  suspensible: false, // 这个组件自己管自己的加载状态，不受 Suspense 影响
)
```

## 5. `<Suspense>` 都有哪些插槽？

### 5.1. `default` 和 `fallback` 插槽

`<Suspense>` 有两个插槽：

- `#default`，默认插槽，异步内容就绪后显示的内容
- `#fallback`，后备插槽，异步内容未就绪时显示的内容

```html
<Suspense>
  <template #default>
    <!-- 默认插槽：
     异步内容最终就绪后实际渲染的内容。
     只有当所有异步依赖全部 resolve 后，才会展示该插槽。 -->
    <AsyncComponent />
  </template>
  <template #fallback>
    <!-- fallback 插槽：
     当有异步内容尚未就绪时，会显示 #fallback 插槽中的后备内容。
     通常会在这个插槽中显示加载状态或占位符。 -->
    <Loading />
    <!-- 或者直接显示一段占位提示文案，比如：正在加载... -->
  </template>
</Suspense>
```

### 5.2. 注意：插槽内容中的节点数量

`default` 和 `fallback` 插槽只允许一个“可识别”的直接子节点。

| 情况                       | 结果                                  |
| -------------------------- | ------------------------------------- |
| 单个根节点                 | 正常工作                              |
| 多个子节点，无法确定单一根 | 开发模式下警告，变为 Comment 空占位符 |

::: tip “可识别”的直接子节点

❌ 错误说法：`default` 和 `fallback` 插槽只允许一个直接子节点。

✅ 正确说法：`default` 和 `fallback` 插槽只允许一个“可识别”的直接子节点。

当插槽内容是数组（识别到多个节点）时，会调用 `filterSingleRoot` 寻找单一根节点。

- 在搜索过程中，会自动过滤掉普通注释节点。
- 这里有个小细节：如果是 `<!--v-if-->` 注释节点，Vue 也会把它当成一个占位符节点来处理，不会被过滤。因为源码实现层面的判定逻辑是 `if (child.type !== Comment || child.children === 'v-if') { ... }`。正常情况下，不会有人刻意写 `<!--v-if-->` 这个注释，它是 Vue 编译器自动生成的一个占位注释，代表"这个位置原本应该有一个节点"的语义占位符。如果你想要验证的话，可以利用下面的 DEMO 在 Vue SFC 中快速验证下。

在 vuejs/core 中相关源码位置：

- `packages/runtime-core/src/components/Suspense.ts` => `normalizeSuspenseSlot`
- `packages/runtime-core/src/vnode.ts` => `normalizeVNode`
- `packages/runtime-core/src/componentRenderUtils.ts` => `filterSingleRoot`

:::

#### 示例：单个根节点

::: code-group

```html [App.vue]
<script setup>
  import AsyncComp from './AsyncComp.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <!-- 可以有额外的注释节点 -->
      <AsyncComp />
    </template>
    <template #fallback>
      <!-- 可以有额外的注释节点 -->
      <p>Loading…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncComp.vue]
<script setup>
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('Hello, Suspense!'), 1000)
  })
</script>

<template>
  <div>{{ data }}</div>
</template>
```

:::

最终效果：

1. 先展示 Loading...
2. 1s 后展示 Hello, Suspense!

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-14-29-36.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-14-29-45.png)

:::

#### 示例：特殊的 `v-if` 注释节点

::: code-group

```html [App.vue]
<script setup>
  import AsyncComp from './AsyncComp.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <!--v-if-->
      <AsyncComp />
    </template>
    <template #fallback>
      <p>Loading…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncComp.vue]
<script setup>
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('Hello, Suspense!'), 1000)
  })
</script>

<template>
  <div>{{ data }}</div>
</template>
```

:::

这种情况下，页面无法正常渲染，并且会在开发环境下抛出警告信息：

::: warning

`[Vue warn]: <Suspense> slots expect a single root node.`

:::

#### 示例：多个子节点，无法确定单一根

::: code-group

```html [App.vue]
<script setup>
  import AsyncA from './AsyncA.vue'
  import AsyncB from './AsyncB.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <AsyncA />
      <AsyncB />
    </template>
    <template #fallback>
      <p>Loading…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncA.vue]
<script setup>
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('A'), 1000)
  })
</script>

<template>
  <div>{{ data }}</div>
</template>
```

```html [AsyncB.vue]
<script setup>
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('B'), 2000)
  })
</script>

<template>
  <div>{{ data }}</div>
</template>
```

:::

这种情况下，页面无法正常渲染，并且会在开发环境下抛出警告信息：

::: warning

`[Vue warn]: <Suspense> slots expect a single root node.`

:::

对应的真实 DOM 结构中，会插入一个空的注释节点：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-14-55-47.png)

### 5.3. `default` 和 `fallback` 插槽的切换逻辑是什么？什么情况下会再次回退到 `fallback`？

`default` 和 `fallback` 插槽的执行逻辑可以分成两个阶段理解：

#### 初次渲染

初次渲染时，Vue 会先在内存里尝试渲染 `default` 内容。

- 如果没碰到异步依赖，直接进入完成状态，显示默认内容。
- 如果碰到了异步依赖，就进入挂起状态，显示 `fallback`，等所有异步依赖都解析完成后，再把默认内容真正显示出来。

#### 后续更新

进入完成状态后，并不是子树里任何一个深层异步依赖更新都会触发重新挂起。是否重新进入挂起状态，取决于默认插槽根节点的 VNode 类型是否改变：

- 根节点 VNode 类型不变（如同一个组件的 props 或事件更新） => 只走普通 patch，不会显示 fallback。
- 根节点 VNode 类型改变（例如从组件 A 切换到组件 B） => `<Suspense>` 才“可能”重新进入挂起状态。

注意这里的“可能”：即使根节点类型变了，如果新分支内部没有异步依赖，也会立即 resolve，不会展示 fallback。

也就是说，`<Suspense>` 不是一个“全树任何异步都自动闪 fallback”的组件，它只会在根节点类型切换时重新评估是否需要进入挂起状态。

那么如果一个组件的异步行为完成之后，再次触发异步行为，会回退到挂起状态 `fallback` 吗？

不会。因为 `<Suspense>` 只追踪通过 `setup` 返回的 Promise（即顶层 `await` 或 `async setup()`）注册的异步依赖，且 `setup` 只执行一次。组件内部的其他异步操作（如 `watchEffect`、事件处理器中的 `await` 等）不会被 `<Suspense>` 感知，不会触发 fallback。

#### 示例：根节点类型变化，回退到 `fallback`

::: code-group

```html [App.vue]
<script setup>
  import { ref } from 'vue'
  import AsyncA from './AsyncA.vue'
  import AsyncB from './AsyncB.vue'

  const flag = ref(true)
</script>

<template>
  <div style="padding: 20px;">
    <button @click="flag = !flag">切换组件</button>
    <!--
      timeout="0"：根节点类型切换时，立即展示 fallback，不做延迟。
      每次点击按钮，根节点从 AsyncA ↔ AsyncB 切换，
      isSameVNodeType 返回 false，进入 else 分支重新挂起。
      因为新组件有 async setup（suspense.deps > 0），所以会展示 fallback。
    -->
    <Suspense timeout="0">
      <template #default>
        <AsyncA v-if="flag" />
        <AsyncB v-else />
      </template>
      <template #fallback>
        <p style="color: gray; font-size: 24px; padding: 20px;">Loading…</p>
      </template>
    </Suspense>
  </div>
</template>
```

```html [AsyncA.vue]
<script setup>
  // async setup → 被 Suspense 追踪为异步依赖
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('A（等待 1s）'), 1000)
  })
</script>

<template>
  <div style="color: blue; font-size: 24px; padding: 20px;">{{ data }}</div>
</template>
```

```html [AsyncB.vue]
<script setup>
  // async setup → 被 Suspense 追踪为异步依赖
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('B（等待 1.5s）'), 1500)
  })
</script>

<template>
  <div style="color: red; font-size: 24px; padding: 20px;">{{ data }}</div>
</template>
```

:::

每次点击切换组件，页面会在下面状态中依次改变：

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-16-51-29.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-16-51-44.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-16-51-29.png)

![4](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-16-52-09.png)

:::

如果不加 `timeout="0"`，`Loading...` 只会在首次加载的时候出现，后续 A B 之间的切换都不会出现。

| `timeout` 值 | 后续更新有异步依赖时的行为 |
| --- | --- |
| 未设置（内部为 `-1`） | 继续显示旧内容，等新内容 resolve 后再切换，不显示 fallback |
| `0` | 立即切换到 fallback |
| `> 0`（如 `10`） | 等待 N 毫秒后切换到 fallback |

#### 示例：持续触发异步，但只有首次触发 `fallback`

::: code-group

```html [App.vue]
<script setup>
  import AsyncComp from './AsyncComp.vue'
</script>

<template>
  <!--
    首次渲染：AsyncComp 的 async setup 被 Suspense 追踪，
    suspense.deps > 0，展示 fallback，等 setup resolve 后切换到 default。

    后续点击按钮：根节点始终是 AsyncComp，类型不变，
    走 isSameVNodeType 为 true 的普通 patch 分支。
    registerDep 中 isInPendingSuspense 为 false（pendingBranch 已清空），
    即使 watch 内部触发了新的异步操作，Suspense 也不会感知，不会回退到 fallback。
  -->
  <Suspense>
    <template #default>
      <AsyncComp />
    </template>
    <template #fallback>
      <p style="padding: 20px; color: gray; font-size: 24px;">Loading…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncComp.vue]
<script setup>
  import { ref, watch } from 'vue'

  const count = ref(0)
  const watchResult = ref('')
  const pending = ref(false)

  // async setup → 被 Suspense 追踪，只有这一次会触发 fallback
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('setup 就绪'), 1000)
  })

  // watch 中的异步操作 → 不被 Suspense 追踪
  // Suspense 只追踪 setup 阶段注册的 Promise，watch 是运行时行为
  watch(count, async (newVal) => {
    pending.value = true
    watchResult.value = ''
    const result = await new Promise(resolve => {
      setTimeout(() => resolve(`watch 异步完成：count = ${newVal}`), 1000)
    })
    watchResult.value = result
    pending.value = false
  })
</script>

<template>
  <div style="padding: 20px;">
    <p style="font-size: 24px;">{{ data }}</p>
    <button @click="count++">count: {{ count }}</button>
    <!-- pending 状态由组件内部自行管理，与 Suspense 无关 -->
    <p v-if="pending" style="color: gray;">watch 异步中…</p>
    <p v-else style="color: green;">{{ watchResult }}</p>
  </div>
</template>
```

:::

![gif](./assets/1.gif)

## 6. `<Suspense>` 都有哪些属性？

### 6.1. `SuspenseProps` 接口

```ts
interface SuspenseProps {
  timeout?: string | number
  suspensible?: boolean
}
```

### 6.2. `timeout`

#### `timeout` 的作用

`timeout` 控制的是切换场景下 `fallback` 的展示时机，即 `<Suspense>` 已经渲染着 `default` 内容，新的异步依赖出现需要重新加载时，等多久才展示 `fallback`。

三种行为对比：

| `timeout` 值 | 后续更新有异步依赖时的行为 |
| --- | --- |
| 未设置（内部为 `-1`） | 继续显示旧内容，等新内容 resolve 后再切换，不显示 fallback |
| `0` | 立即切换到 fallback |
| `> 0`（如 `10`） | 等待 N 毫秒后切换到 fallback |

当 `<Suspense>` 已经处于完成状态后，如果默认内容被新的异步内容替换，它不会立刻显示 `fallback`，而是会先继续展示旧内容一段时间，这个等待时长可以用 `timeout` 控制：

```html
<!-- timeout="0" 表示一旦进入新的挂起状态，立即切到 fallback -->
<Suspense :timeout="0">
  <Dashboard />

  <template #fallback> 正在加载... </template>
</Suspense>
```

#### `timeout` 仅影响切换，不影响首次渲染

```html
<Suspense timeout="2000">
  <template #default>
    <AsyncComp />
  </template>
  <template #fallback>
    <p>Loading…</p>
  </template>
</Suspense>
```

首次加载时，`timeout` 不起作用。

- 如果有异步依赖，会立即展示 `fallback`
- 如果没有异步依赖，直接进入完成状态，不展示 `fallback`

### 6.3. `suspensible`（Vue 3.3+）

`suspensible` 让嵌套的 `<Suspense>` 仍然创建自己的边界，但同时将自己注册为父级 `<Suspense>` 的一个依赖，父级会等所有子级依赖都 resolve 后才完成渲染。

```
嵌套使用：

<Suspense>
  <template #default>
    <CompA />              ← ✅ 解析（直接子节点）
    <CompB>
      <CompC />            ← ✅ 解析（嵌套深层，只要没有内层 Suspense）
      <CompD />            ← ✅ 同上
    </CompB>

    <Suspense>             ← ⚠️ 这里创建了新边界
      <CompE />            ← ❌ 外层不管它了，由内层 Suspense 负责
    </Suspense>
  </template>
</Suspense>
```

#### 对比：“无 suspensible” vs “有 suspensible”

::: code-group

```text [❌ 默认嵌套（无 suspensible）]
<Suspense>                    ← 父级只管自己的异步依赖
  <AsyncParent>
    <Suspense>                ← 独立运作，父级不知道它的存在
      <AsyncChild />
    </Suspense>
  </AsyncParent>
</Suspense>

时间线：父级先 resolve → 用户看到 AsyncParent + 子级 fallback（半成品页面）
```

```text [✅ 嵌套 + suspensible]
<Suspense>                    ← 父级同时等待 AsyncParent + AsyncChild
  <AsyncParent>
    <Suspense suspensible>   ← 自己仍然有边界，但注册为父级的依赖
      <AsyncChild />
    </Suspense>
  </AsyncParent>
</Suspense>

时间线：父级等全部就绪 → 一次性渲染完整页面
```

:::

| 对比维度         | 默认           | `suspensible`                  |
| ---------------- | -------------- | ------------------------------ |
| 子 Suspense 边界 | 独立运作       | 仍独立，但额外注册为父级依赖   |
| 父级等什么       | 仅直属异步依赖 | 直属 + 所有 `suspensible` 子级 |

#### 示例：对比有无 `suspensible`

::: code-group

```html [App.vue]
<script setup>
  import AsyncPage from './AsyncPage.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <AsyncPage />
    </template>
    <template #fallback>
      <p>整体加载中…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncPage.vue]
<script setup>
  import AsyncChild from './AsyncChild.vue'

  // 快速组件：500ms
  await new Promise(r => setTimeout(r, 500))
  const parent = '页面主内容'
</script>

<template>
  <h1>{{ parent }}</h1>
  <!--
    加上 suspensible：外层 Suspense 会等这个子级一起 resolve
    去掉 suspensible：外层先 resolve，用户会先看到本组件 + 子级 fallback
  -->
  <Suspense suspensible>
    <template #default>
      <AsyncChild />
    </template>
    <template #fallback>
      <p>子级加载中…（加了 suspensible 时你看不到这行）</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncChild.vue]
<script setup>
  // 慢速组件：2000ms，故意拉大与父级的时间差
  await new Promise(r => setTimeout(r, 2000))
  const child = '子组件数据'
</script>

<template>
  <p>{{ child }}</p>
</template>
```

:::

- 如果没有 `suspensible` 会有 3 个状态 1、2、3
- 如果有 `suspensible` 只会有 2 个状态 1、3

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-20-51-07.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-20-51-14.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-20-51-00.png)

:::

最终效果：

| - | 0 ~ 500ms | 500ms ~ 2000ms | 2000ms 之后 |
| --- | --- | --- | --- |
| 有 `suspensible` | `整体加载中…` | `整体加载中…`（仍在等子级） | 完整页面一次性出现 |
| 无 `suspensible` | `整体加载中…` | `页面主内容` + `子级加载中…`（半成品） | 完整页面 |

## 7. `<Suspense>` 都有哪些事件？

### 7.1. `<Suspense>` 一共有 3 个事件：`@pending`、`@fallback`、`@resolve`

| 事件        | 触发时机                              |
| ----------- | ------------------------------------- |
| `@pending`  | 在进入挂起状态时触发                  |
| `@fallback` | 在 `fallback` 插槽的内容显示时触发    |
| `@resolve`  | 在 `default` 插槽完成获取新内容时触发 |

这些事件很适合用来驱动全局 loading 条、骨架屏埋点或页面切换反馈。

::: code-group

```html [App.vue]
<script setup>
  import AsyncComp from './AsyncComp.vue'

  const onPending = () => console.log('[onPending]: 在进入挂起状态时触发')
  const onFallback = () =>
    console.log('[onFallback]: 在 fallback 插槽的内容显示时触发')
  const onResolve = () =>
    console.log('[onResolve]: 在 default 插槽完成获取新内容时触发')
</script>

<template>
  <Suspense @pending="onPending" @fallback="onFallback" @resolve="onResolve">
    <template #default>
      <!-- 可以有额外的注释节点 -->
      <AsyncComp />
    </template>
    <template #fallback>
      <!-- 可以有额外的注释节点 -->
      <p>Loading…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncComp.vue]
<script setup>
  const data = await new Promise(resolve => {
    setTimeout(() => resolve('Hello, Suspense!'), 1000)
  })
</script>

<template>
  <div>{{ data }}</div>
</template>
```

:::

控制台输出：

```
[onPending]: 在进入挂起状态时触发
[onFallback]: 在 fallback 插槽的内容显示时触发
[onResolve]: 在 default 插槽完成获取新内容时触发
```

### 7.2. `@pending` 和 `@fallback` 的区别

两者的核心区别在于触发时机不同，`@pending` 比 `@fallback` 更早，且 `@fallback` 不一定会触发。

初次渲染时，两者同时触发，紧挨着调用：

```ts
triggerEvent(vnode, 'onPending')
triggerEvent(vnode, 'onFallback')
```

后续更新时，`@pending` 触发后，`@fallback` 不一定会触发：

| 情况 | `@pending` | `@fallback` |
| --- | --- | --- |
| 新分支无异步依赖（立即 resolve） | ✅ 触发 | ❌ 不触发 |
| 有异步依赖，`timeout` 未设置（默认 `-1`） | ✅ 触发 | ❌ 不触发（继续显示旧内容） |
| 有异步依赖，`timeout === 0` | ✅ 触发 | ✅ 触发（立即切换到 fallback） |
| 有异步依赖，`timeout > 0` 且超时 | ✅ 触发 | ✅ 触发（超时后切换） |

## 8. `<Suspense>` 如何做错误处理？

### 8.1. 官方原话

`<Suspense>` 组件自身目前还不提供错误处理，不过你可以使用 `errorCaptured` 选项或者 `onErrorCaptured()` 钩子，在使用到 `<Suspense>` 的父组件中捕获和处理异步错误。

### 8.2. 示例：`onErrorCaptured()` + `v-if` 条件渲染

::: code-group

```html [App.vue]
<script setup>
  import { ref, onErrorCaptured } from 'vue'
  import AsyncUser from './AsyncUser.vue'

  const error = ref(null)

  onErrorCaptured((err) => {
    error.value = err
    return false
  })

  function reload() {
    error.value = null
  }
</script>

<template>
  <div v-if="error">
    <p>出错了：{{ error.message }}</p>
    <button @click="reload">重试</button>
  </div>

  <Suspense v-else>
    <template #default>
      <AsyncUser />
    </template>
    <template #fallback>
      <p>加载中…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncUser.vue]
<script setup>
  // 模拟异步请求，随机成功或失败
  function mockFetch() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve({ name: '张三', email: 'zhangsan@example.com' });
        } else {
          reject(new Error('模拟接口异常（概率触发）'));
        }
      }, 800);
    });
  }

  const user = await mockFetch();
</script>

<template>
  <h2>{{ user.name }}</h2>
  <p>{{ user.email }}</p>
</template>
```

:::

成功是失败的概率各占 50%，可以多刷新几次，验证错误处理逻辑。

1. 成功示例
2. 失败示例

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-19-36-10.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-19-36-03.png)

:::

### 8.3. 示例：用 `<Suspense>` 的嵌套做优雅降级

::: code-group

```html [App.vue]
<script setup>
  import ErrorBoundary from './ErrorBoundary.vue'
  import AsyncWidgetA from './AsyncWidgetA.vue'
  import AsyncWidgetB from './AsyncWidgetB.vue'
</script>

<template>
  <h1>仪表盘</h1>

  <!--
    关键：ErrorBoundary 包在 Suspense 外面（作为父级）
    这样 onErrorCaptured 才能正确捕获异步错误
    WidgetA 失败不影响 WidgetB
  -->
  <ErrorBoundary>
    <Suspense>
      <template #default>
        <AsyncWidgetA />
      </template>
      <template #fallback>
        <p>WidgetA 加载中…</p>
      </template>
    </Suspense>
  </ErrorBoundary>

  <ErrorBoundary>
    <Suspense>
      <template #default>
        <AsyncWidgetB />
      </template>
      <template #fallback>
        <p>WidgetB 加载中…</p>
      </template>
    </Suspense>
  </ErrorBoundary>
</template>
```

```html [ErrorBoundary.vue]
<!--
  通用错误边界组件
  必须作为 <Suspense> 的父级使用，不能放在 Suspense 的 default slot 内部
-->
<script setup>
  import { ref, onErrorCaptured } from 'vue'

  const error = ref(null)

  onErrorCaptured((err) => {
    error.value = err
    return false // 阻止冒泡，实现局部隔离
  })

  function retry() {
    // 置空后 slot 重新渲染，Suspense 及其子组件会重新创建，再次触发异步
    error.value = null
  }
</script>

<template>
  <slot v-if="!error" />
  <div v-else>
    <p>{{ error.message }}</p>
    <button @click="retry">重试此组件</button>
  </div>
</template>
```

```html [AsyncWidgetA.vue]
<script setup>
  // 模拟异步请求，50% 概率失败
  function mockFetch() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve({ title: 'A 组件数据', value: 42 })
        } else {
          reject(new Error('WidgetA 接口异常'))
        }
      }, 500)
    })
  }

  const data = await mockFetch()
</script>

<template>
  <div>
    <h3>{{ data.title }}</h3>
    <p>数值：{{ data.value }}</p>
  </div>
</template>
```

```html [AsyncWidgetB.vue]
<script setup>
  // 模拟异步请求，50% 概率失败
  function mockFetch() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve({ title: 'B 组件数据', count: 128 })
        } else {
          reject(new Error('WidgetB 接口异常'))
        }
      }, 500)
    })
  }

  const data = await mockFetch()
</script>

<template>
  <div>
    <h3>{{ data.title }}</h3>
    <p>数量：{{ data.count }}</p>
  </div>
</template>
```

:::

![gif](./assets/3.gif)

## 9. `<Suspense>` 和 `<Transition>`、`<KeepAlive>`、`<RouterView>` 该怎么配合？

这部分官方特别强调了嵌套顺序。

常见写法如下：

```html
<RouterView v-slot="{ Component }">
  <template v-if="Component">
    <Transition mode="out-in">
      <KeepAlive>
        <Suspense>
          <!-- 主要内容 -->
          <component :is="Component"></component>

          <!-- 加载中状态 -->
          <template #fallback> 正在加载... </template>
        </Suspense>
      </KeepAlive>
    </Transition>
  </template>
</RouterView>
```

这套组合里：

- `<Transition>` 负责切换动画
- `<KeepAlive>` 负责页面缓存
- `<Suspense>` 负责异步依赖协调

注意：Vue Router 的路由懒加载虽然也用了动态导入，但它和“异步组件”不是一回事，因此路由懒加载本身目前不会触发 `<Suspense>`。不过路由组件内部如果继续使用了异步组件或异步 `setup()`，这些后代依赖仍然会触发 `<Suspense>`。

## 10. 如何处理嵌套的动态异步组件加载状态？

### 10.1. `<Suspense>` 不感知内层 update

当我们有多个类似于下方的异步组件 (常见于嵌套或基于布局的路由) 时：

```html
<Suspense>
  <component :is="DynamicAsyncOuter">
    <component :is="DynamicAsyncInner" />
  </component>
</Suspense>
```

`<Suspense>` 创建了一个边界，它将如预期的那样解析树下的所有异步组件。然而，当我们更改 `DynamicAsyncOuter` 时，`<Suspense>` 会正确地等待它，但当我们更改 `DynamicAsyncInner` 时，嵌套的 `DynamicAsyncInner` 会呈现为一个空节点，直到它被解析为止。

流程：Outer 不变（只是 update）-> 内部卸载旧 Inner、挂载新 Inner -> Suspense 不感知 -> Inner 空节点（Inner resolve 完成之前） -> 直到新 Inner 完成挂载。

### 10.2. 示例：单层 `<Suspense>` 解决不了内层动态组件切换时的空节点问题

::: code-group

```html [App.vue]
<script setup>
  import { shallowRef } from 'vue'
  import AsyncOuterA from './AsyncOuterA.vue'
  import AsyncOuterB from './AsyncOuterB.vue'
  import AsyncInnerA from './AsyncInnerA.vue'
  import AsyncInnerB from './AsyncInnerB.vue'

  const currentOuter = shallowRef(AsyncOuterA)
  const currentInner = shallowRef(AsyncInnerA)

  function toggleOuter() {
    currentOuter.value =
      currentOuter.value === AsyncOuterA ? AsyncOuterB : AsyncOuterA
  }
  function toggleInner() {
    currentInner.value =
      currentInner.value === AsyncInnerA ? AsyncInnerB : AsyncInnerA
  }
</script>

<template>
  <button @click="toggleOuter">切换 Outer</button>
  <button @click="toggleInner">切换 Inner</button>
  <Suspense timeout="0">
    <template #default>
      <component :is="currentOuter">
        <!-- Suspense 不感知内层 update -->
        <component :is="currentInner" />
      </component>
    </template>
    <template #fallback>
      <p>Suspense fallback…</p>
    </template>
  </Suspense>
</template>
```

```html [AsyncOuterA.vue]
<script setup>
  await new Promise(r => setTimeout(r, 1000))
</script>

<template>
  <div>
    <p>Outer-A</p>
    <slot />
  </div>
</template>
```

```html [AsyncOuterB.vue]
<script setup>
  await new Promise(r => setTimeout(r, 1000))
</script>

<template>
  <div>
    <p>Outer-B</p>
    <slot />
  </div>
</template>
```

```html [AsyncInnerA.vue]
<script setup>
  await new Promise(r => setTimeout(r, 2000))
</script>

<template>
  <p>Inner-A</p>
</template>
```

```html [AsyncInnerB.vue]
<script setup>
  await new Promise(r => setTimeout(r, 2000))
</script>

<template>
  <p>Inner-B</p>
</template>
```

:::

实际效果：

| 操作       | Suspense fallback？ | 结果                                   |
| ---------- | ------------------- | -------------------------------------- |
| 切换 Outer | ✅ 出现             | Suspense 走 mount 流程，正确等待       |
| 切换 Inner | ❌ 不出现           | Suspense 不感知内层 update，显示空节点 |

- 打开页面，首次渲染阶段：1 -> 2
  - 等待时间 2s
- 点击“切换 Outer”时：2 -> 3 -> 4
  - 中途出现了 Suspense fallback
  - 等待时间 2s
- 点击“切换 Inner”时：4 -> 5 -> 6
  - 中途显示空节点
  - 等待时间 2s

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-23-43-59.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-23-44-36.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-23-43-59.png)

![4](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-23-44-50.png)

![5](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-23-44-57.png)

![6](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-03-23-45-05.png)

:::

### 10.3. 解决空节点问题的做法：嵌套 `<Suspense>`

- 在内部使用 `<Suspense>` 包裹内层的 inner 动态异步组件，创建一个独立的边界来维护 inner 的切换状态。
- 如果要让切换快的 outer 等切换慢的 inner，还可以给内层的 `<Suspense>` 加上 `suspensible`，将其注册为父级的依赖，这样在切换 outer 的时候，如果 outer 先完成了，不会立刻 resolve，而是继续等未完成的 inner 完成之后才会 resolve。

比如可以将 App.vue 改为下面这样来验证：

```html
<script setup>
  import { shallowRef } from 'vue'
  import AsyncOuterA from './AsyncOuterA.vue'
  import AsyncOuterB from './AsyncOuterB.vue'
  import AsyncInnerA from './AsyncInnerA.vue'
  import AsyncInnerB from './AsyncInnerB.vue'

  const currentOuter = shallowRef(AsyncOuterA)
  const currentInner = shallowRef(AsyncInnerA)

  function toggleOuter() {
    currentOuter.value =
      currentOuter.value === AsyncOuterA ? AsyncOuterB : AsyncOuterA
  }
  function toggleInner() {
    currentInner.value =
      currentInner.value === AsyncInnerA ? AsyncInnerB : AsyncInnerA
  }
</script>

<template>
  <button @click="toggleOuter">切换 Outer</button>
  <button @click="toggleInner">切换 Inner</button>
  <hr />
  <Suspense timeout="0">
    <template #default>
      <component :is="currentOuter">
        <!-- 对比有无 suspensible
        有 suspensible，让内层边界注册为外层的依赖
        切换 outer 的时候会等 inner 也完成，也就是一共等 2s

        无 suspensible，内部的 <Suspense> 会被视为一个同步组件
        切换 outer 的时候不会等 inner 完成
        outer 的切换 1s 完成
        inner 的切换 2s 完成 -->
        <Suspense suspensible timeout="0">
          <template #default>
            <component :is="currentInner" />
          </template>
          <template #fallback>
            <p>Inner fallback…</p>
          </template>
        </Suspense>
      </component>
    </template>
    <template #fallback>
      <p>Suspense fallback…</p>
    </template>
  </Suspense>
</template>
```

## 11. 异步组件和 `<Suspense>` 是什么关系？

### 11.1. 两者之间的关系

异步组件（defineAsyncComponent）可以和 Vue 的内置组件 `<Suspense>` 配合使用。

你可以把它们理解成两层不同的职责：

- 异步组件负责「这个组件如何延迟加载」
- `<Suspense>` 负责「当子树里出现异步依赖时，整个区域如何统一显示 fallback 内容」

异步组件 => 自己管自己的加载状态：

```js
const Comp = defineAsyncComponent(() => import('./Comp.vue'))
```

`<Suspense>` => 管的是下层组件的异步依赖：

```html
<Suspense>
  <template #default><SyncComp /></template>
  <template #fallback>加载中...</template>
</Suspense>
```

### 11.2. 配合使用

```js
const AsyncComp = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  suspensible: true, // 默认值，交给 Suspense 管
})
// suspensible: true => 状态由 Suspense 统一管理
// suspensible: false => 状态由组件自己的 loadingComponent 管
```

异步组件默认就是“suspensible”的。这意味着如果组件关系链上有一个 `<Suspense>`，那么这个异步组件就会被当作这个 `<Suspense>` 的一个异步依赖。在这种情况下，加载状态是由 `<Suspense>` 控制，而该组件自己的加载、报错、延时和超时等选项都将被忽略。

```html
<Suspense>
  <template #default>
    <AsyncComp />
  </template>
  <template #fallback> 加载中... </template>
</Suspense>
```

AsyncComp 的 chunk 加载是一个异步的 Promise，所以 `<Suspense>` 会等它加载完成后再切换到 `#default`。如果 AsyncComp 内部还有 async setup，那么 `<Suspense>` 还会继续等 async setup 里的异步操作完成。

```html
<Suspense>
  <template #default>
    <AsyncComp />
    <!-- 异步组件，内部还有 async setup -->
  </template>
  <template #fallback> 加载中... </template>
</Suspense>
```

在上述这种情况下，两个阶段叠加：

1. Suspense 等 AsyncComp 的 chunk 加载完成
2. Suspense 等 AsyncComp 内部的 async setup 完成
3. 两者都完成 -> 显示 `#default` 内容

### 11.3. 示例：异步组件 `defineAsyncComponent` 与 `<Suspense>` 配合使用

::: code-group

```html [App.vue]
<script setup>
  import { defineAsyncComponent, ref } from 'vue'

  // 异步组件默认是 "suspensible" 的
  // 被 Suspense 包裹后，自身的 loadingComponent / errorComponent / delay / timeout 均被忽略
  // 加载状态统一由 Suspense 的 #fallback 插槽控制
  const AsyncWidget = defineAsyncComponent(() => import('./AsyncWidget.vue'))

  const show = ref(true)
</script>

<template>
  <div>
    <button @click="show = !show">{{ show ? '卸载' : '重新挂载' }}</button>
    <div style="margin-top: 12px;">
      <!--
        Suspense 等待其 #default 插槽下所有异步依赖完成：
        1. AsyncWidget 的 chunk 加载（取决于网络环境，通常比较快）
        2. AsyncWidget 内部的 async setup（约 3s，这是组件内部通过 setTimeout 模拟的时间）
        两者都完成后，才展示 #default 的内容。
      -->
      <Suspense v-if="show">
        <template #default>
          <AsyncWidget />
        </template>
        <template #fallback>
          <p>⏳ Suspense 统一 loading...</p>
        </template>
      </Suspense>
    </div>
  </div>
</template>
```

```html [AsyncWidget.vue]
<script setup>
  // 异步 setup：Suspense 会等待它完成
  const res = await new Promise((resolve) => {
    setTimeout(() => resolve({ status: 'ok', data: [1, 2, 3] }), 3000)
  })
</script>

<template>
  <div style="padding: 8px; border: 1px solid #4fc08d;">
    <p>✅ 数据已就绪：{{ res.data.join(', ') }}</p>
    <p style="font-size: 13px; color: #888;">
      async setup 完成后，Suspense 才切换到 default 插槽
    </p>
  </div>
</template>
```

:::

![gif](./assets/2.gif)

### 11.4. 小结

- 如果你的页面里只是单个低频组件想做延迟加载，通常直接用异步组件就够了
- 如果是一整片组件子树都可能进入异步等待态，`<Suspense>` 会更适合统一管理加载体验

::: tip

需要注意的是，Suspense 目前仍是实验性功能，API 可能在未来版本中发生变化。但其核心概念 => 「协调异步依赖的加载状态」在实际开发中已经被广泛使用。

:::

## 12. 引用

- [Vue.js 官方文档 - Suspense][1]
- [Vue.js 官方文档 - `<Suspense>` API][2]
- [Vue.js 官方文档 - 异步组件][3]
- [Vue.js 官方文档 - `onErrorCaptured()`][4]

[1]: https://cn.vuejs.org/guide/built-ins/suspense.html
[2]: https://cn.vuejs.org/api/built-in-components.html#suspense
[3]: https://cn.vuejs.org/guide/components/async.html
[4]: https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured
