# [0091. Suspense](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0091.%20Suspense)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `<Suspense>` 是什么？](#3--suspense-是什么)
  - [3.1. suspense 这个词表达的含义是什么？](#31-suspense-这个词表达的含义是什么)
    - [字面含义](#字面含义)
    - [在 Vue / React 组件中的寓意](#在-vue--react-组件中的寓意)
  - [3.2. `<Suspense>` 解决的核心问题是什么？](#32-suspense-解决的核心问题是什么)
  - [3.3. 如果组件不是异步组件，也没有顶层 await 的逻辑，那还有必要使用 `<Suspense>` 吗？](#33-如果组件不是异步组件也没有顶层-await-的逻辑那还有必要使用-suspense-吗)
- [4. 🤔 哪些东西会被 `<Suspense>` 视为异步依赖？](#4--哪些东西会被-suspense-视为异步依赖)
  - [4.1. `async setup()`](#41-async-setup)
  - [4.2. 异步组件](#42-异步组件)
- [5. 🤔 `default` 和 `fallback` 插槽是怎么工作的？](#5--default-和-fallback-插槽是怎么工作的)
  - [5.1. 初次渲染](#51-初次渲染)
  - [5.2. 后续更新](#52-后续更新)
- [6. 🤔 `timeout`、事件和错误处理分别负责什么？](#6--timeout事件和错误处理分别负责什么)
  - [6.1. `timeout`](#61-timeout)
  - [6.2. 事件](#62-事件)
  - [6.3. 错误处理](#63-错误处理)
- [7. 🤔 `<Suspense>` 和 `<Transition>`、`<KeepAlive>`、`<RouterView>` 该怎么配合？](#7--suspense-和-transitionkeepaliverouterview-该怎么配合)
- [8. 🤔 嵌套 Suspense 时 `suspensible` 有什么用？](#8--嵌套-suspense-时-suspensible-有什么用)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 功能定位
- 异步依赖
- 顶层 await
- fallback
- timeout
- 三个事件
- 错误处理
- 嵌套边界

## 2. 🫧 评价

`<Suspense>` 的价值主要体现在复杂异步组件树里，但它本身仍是实验性功能，所以你既要知道怎么用，也要知道别把它当成“全能异步方案”。高频考点是异步依赖识别、插槽行为、`timeout` 和与其他内置组件的嵌套顺序。

## 3. 🤔 `<Suspense>` 是什么？

### 3.1. suspense 这个词表达的含义是什么？

#### 字面含义

Suspense 在英语中的本意是：

- 悬而未决、暂时中止
- 一种等待、不确定、悬念的状态

在文学或影视中，“suspense” 通常指那种紧张地等待某个结果揭晓的感觉。

#### 在 Vue / React 组件中的寓意

给这个组件起名 `Suspense`，是将其视为一个状态边界：

- 当异步内容还未准备好时，组件树悬浮在一种“等待”状态，展示 fallback 内容
- 一旦异步操作完成（谜底揭晓），就立即切换到真实内容

整个过程中，用户看到的不是崩溃白屏，而是“正在为您准备内容，请稍候”这种被妥善管理的悬停状态。

你也可以把它理解为：“让等待这件事，有了一个优雅的容器”。

所以，`<Suspense>` 就是专门用来管理这种“尚未就绪”的悬停态的组件，名字直接点明了它的职责。

### 3.2. `<Suspense>` 解决的核心问题是什么？

`<Suspense>` 用来协调“整棵组件子树里的异步依赖”。

如果没有它，当一个页面里有多个异步组件或多个 `async setup()` 组件时，常见情况是：

- 这里一个 loading
- 那里一个 loading
- 内容分批出现
- 页面完成时机不统一

`<Suspense>` 的目标就是把这些异步依赖收口到一个上层边界里，在它们都准备好之前，用统一的后备内容兜底。

不过这里要先记一个官方前提：`<Suspense>` 目前仍然是实验性功能，未来 API 仍可能变化。

### 3.3. 如果组件不是异步组件，也没有顶层 await 的逻辑，那还有必要使用 `<Suspense>` 吗？

没必要。

如果组件树中既没有异步组件，也没有任何顶层 await，那么 `<Suspense>` 不会捕获到任何异步依赖。它会认为所有内容都已就绪，直接从开始就显示 default 插槽，fallback 永远不会被触发。

这种情况下使用 `<Suspense>` 是多余的，没有实际意义，直接渲染组件即可。

## 4. 🤔 哪些东西会被 `<Suspense>` 视为异步依赖？

官方文档明确提到两类：

1. 带异步 `setup()` 的组件。
2. 异步组件。

### 4.1. `async setup()`

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

```vue
<script setup>
const response = await fetch('/api/posts')
const posts = await response.json()
</script>

<template>
  {{ posts }}
</template>
```

### 4.2. 异步组件

异步组件默认就是 `suspensible` 的，也就是说如果组件树上层存在 `<Suspense>`，它会被纳入这个边界统一管理。

如果你显式把异步组件设为 `suspensible: false`，那它就不再交给 `<Suspense>` 统一控制，而是自己处理加载态。

## 5. 🤔 `default` 和 `fallback` 插槽是怎么工作的？

`<Suspense>` 有两个最重要的插槽：

- `#default`
- `#fallback`

```vue
<Suspense>
  <Dashboard />

  <template #fallback>
    正在加载...
  </template>
</Suspense>
```

这两个插槽都只允许一个直接子节点。

它的执行逻辑可以分成两个阶段理解：

### 5.1. 初次渲染

初次渲染时，Vue 会先在内存里尝试渲染 `default` 内容。

- 如果没碰到异步依赖，直接进入完成状态，显示默认内容。
- 如果碰到了异步依赖，就进入挂起状态，显示 `fallback`。

等所有异步依赖都解析完成后，再把默认内容真正显示出来。

### 5.2. 后续更新

进入完成状态后，并不是组件树里任何一个更深层异步依赖更新都会重新回退。只有默认插槽的根节点被替换时，`<Suspense>` 才可能重新进入挂起状态。

这点很重要，它意味着 `<Suspense>` 不是一个“全树任何异步都自动闪 fallback”的组件。

## 6. 🤔 `timeout`、事件和错误处理分别负责什么？

### 6.1. `timeout`

当 `<Suspense>` 已经处于完成状态后，如果默认内容被新的异步内容替换，它不会立刻显示 `fallback`，而是会先继续展示旧内容一段时间。

这个等待时长可以用 `timeout` 控制：

```vue
<Suspense :timeout="0">
  <Dashboard />

  <template #fallback>
    正在加载...
  </template>
</Suspense>
```

`timeout="0"` 表示一旦进入新的挂起状态，立即切到 `fallback`。

### 6.2. 事件

`<Suspense>` 会触发 3 个事件：

- `pending`
- `resolve`
- `fallback`

它们分别表示：

- 进入挂起状态
- 默认内容完成解析
- 后备内容真正显示出来

这些事件很适合用来驱动全局 loading 条、骨架屏埋点或页面切换反馈。

### 6.3. 错误处理

`<Suspense>` 自己不负责错误处理。

如果异步依赖内部抛错，你需要在父级组件中通过：

- `errorCaptured`
- `onErrorCaptured()`

来捕获和处理。

这意味着 `<Suspense>` 解决的是“等待什么、何时显示 fallback”，不是“如何处理异常”。

## 7. 🤔 `<Suspense>` 和 `<Transition>`、`<KeepAlive>`、`<RouterView>` 该怎么配合？

这部分官方特别强调了嵌套顺序。

常见写法如下：

```vue
<RouterView v-slot="{ Component }">
  <template v-if="Component">
    <Transition mode="out-in">
      <KeepAlive>
        <Suspense>
          <component :is="Component" />

          <template #fallback>
            正在加载...
          </template>
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

另外还有一个很容易误会的点：Vue Router 的路由懒加载虽然也用了动态导入，但它和“异步组件”不是一回事，因此路由懒加载本身目前不会触发 `<Suspense>`。不过路由组件内部如果继续使用了异步组件或异步 `setup()`，这些后代依赖仍然会触发 `<Suspense>`。

## 8. 🤔 嵌套 Suspense 时 `suspensible` 有什么用？

这个能力在 3.3+ 才支持。

假设你有外层异步组件和内层异步组件：

```vue
<Suspense>
  <component :is="DynamicAsyncOuter">
    <Suspense suspensible>
      <component :is="DynamicAsyncInner" />
    </Suspense>
  </component>
</Suspense>
```

如果不给内部 `<Suspense>` 加 `suspensible`，它会被父级视为同步组件，然后自己维护自己的 fallback 和修补周期。这样在双层动态异步切换时，可能会出现空节点或多次 patch，体验并不理想。

加上 `suspensible` 后，内部边界会把异步依赖处理权交给父级 `<Suspense>`，从而让整个异步协调更加统一。

你可以把它理解成：

- 不加 `suspensible`，子边界自己兜底。
- 加了 `suspensible`，子边界把控制权上交给父边界。

## 9. 🔗 引用

- [Vue.js 官方文档 - Suspense][1]
- [Vue.js 官方文档 - `<Suspense>` API][2]
- [Vue.js 官方文档 - 异步组件][3]
- [Vue.js 官方文档 - `onErrorCaptured()`][4]

[1]: https://cn.vuejs.org/guide/built-ins/suspense.html
[2]: https://cn.vuejs.org/api/built-in-components.html#suspense
[3]: https://cn.vuejs.org/guide/components/async.html
[4]: https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured
