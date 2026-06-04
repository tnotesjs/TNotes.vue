# [0081. 内置组件](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0081.%20%E5%86%85%E7%BD%AE%E7%BB%84%E4%BB%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue 一共有几个内置组件？](#3--vue-一共有几个内置组件)
- [4. 🤔 “Vue 内置组件”和“用户自定义组件”有什么区别？](#4--vue-内置组件和用户自定义组件有什么区别)
  - [4.1. 用户自定义组件的本质](#41-用户自定义组件的本质)
  - [4.2. 内置组件的本质](#42-内置组件的本质)
  - [4.3. 核心区别：有没有框架级特权](#43-核心区别有没有框架级特权)
  - [4.4. 举几个典型例子](#44-举几个典型例子)
    - [`<Teleport>`](#teleport)
    - [`<KeepAlive>`](#keepalive)
    - [`<Transition>`](#transition)
    - [`<Suspense>`](#suspense)
  - [4.5. 不是所有内置组件都“完全无法模拟”](#45-不是所有内置组件都完全无法模拟)
  - [4.6. 本质总结](#46-本质总结)
- [5. 🤔 Vue 的内置组件封装是传统的 SFC .vue 文件吗？](#5--vue-的内置组件封装是传统的-sfc-vue-文件吗)
- [6. 🤔 内置组件的使用频率排名是？](#6--内置组件的使用频率排名是)
  - [6.1. 如果只算 Vue 3 官方内置组件](#61-如果只算-vue-3-官方内置组件)
  - [6.2. `<Transition>`：最常见](#62-transition最常见)
  - [6.3. `<KeepAlive>`：在后台系统里很常见](#63-keepalive在后台系统里很常见)
  - [6.4. `<Teleport>`：直接用不一定最多，但间接使用很多](#64-teleport直接用不一定最多但间接使用很多)
  - [6.5. `<TransitionGroup>`：比 `<Transition>` 少很多](#65-transitiongroup比-transition-少很多)
  - [6.6. `<Suspense>`：能力强，但直接使用较少](#66-suspense能力强但直接使用较少)
  - [6.7. 如果把特殊内置标签也算进去](#67-如果把特殊内置标签也算进去)
    - [`<template>`](#template)
    - [`<slot>`](#slot)
    - [`<component>`](#component)
  - [6.8. 总结](#68-总结)
- [7. 🤔 如何学习 Vue 的内置组件？](#7--如何学习-vue-的内置组件)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `<Transition>`
- `<TransitionGroup>`
- `<KeepAlive>`
- `<Teleport>`
- `<Suspense>`

## 2. 🫧 评价

在 Vue 官方文档的“内置组件”章节，一共介绍了 5 个内置组件：Transition、TransitionGroup、KeepAlive、Teleport、Suspense。使用时会有不少坑，回顾笔记的时候可以把重点放在示例上，关注每个示例解决的具体问题场景。

内置组件的核心价值，是让开发者用组件语法去使用 Vue 底层渲染能力。这种设计的弊端，感觉最明显的就是这些组件的使用很特殊，长得像普通组件，但使用起来却和普通组件差异很大（能实现很多普通组件实现不了的功能），因为它封装了 Vue 底层的一些能力，使用起来感觉又加重了“Vue 的魔法感”。

<N :ids='[
  "0095",
  "0094",
  "0093",
  "0092",
  "0091",
]'/>

## 3. 🤔 Vue 一共有几个内置组件？

如果按 Vue 3 核心官方的“内置组件” 来算，一共有 5 个：

| 内置组件            | 作用                                    |
| ------------------- | --------------------------------------- |
| `<Transition>`      | 单个元素/组件的进入、离开动画           |
| `<TransitionGroup>` | 列表元素的进入、离开、移动动画          |
| `<KeepAlive>`       | 缓存动态组件实例                        |
| `<Teleport>`        | 把子树 DOM 渲染到指定 DOM 节点          |
| `<Suspense>`        | 处理异步组件或 `async setup` 的等待状态 |

所以严格回答是：Vue 3 核心内置组件一共有 5 个，分别是：Transition、TransitionGroup、KeepAlive、Teleport、Suspense。

但如果你把 Vue 模板里的“特殊内置元素”也算进去，还要加 3 个：

| 特殊元素      | 作用                     |
| ------------- | ------------------------ |
| `<component>` | 动态组件                 |
| `<slot>`      | 插槽出口                 |
| `<template>`  | 模板分组，不渲染真实 DOM |

这样从广义上可以说：5 个内置组件 + 3 个特殊元素 = 8 个内置语法结构

## 4. 🤔 “Vue 内置组件”和“用户自定义组件”有什么区别？

自定义组件是普通渲染单元，内置组件是框架级控制单元。

- 用户自定义组件是“使用 Vue 公开能力写出来的组件”
- 内置组件是“Vue 框架自身定义的、被编译器或运行时赋予特殊语义的组件”

### 4.1. 用户自定义组件的本质

普通自定义组件大致是：

```html
<MyComponent :msg="msg">
  <div>Hello</div>
</MyComponent>
```

它的本质是：props + slots + state => VNode 子树

- 接收 props
- 接收 slots
- 执行 `setup` / `render`
- 返回一棵 VNode
- 交给 Vue renderer 正常挂载、更新、卸载
- ...

它只能在 Vue 给它的规则内工作，不支持框架级的控制能力：

- 子节点最终挂载到哪里
- 子组件是否真的被卸载
- DOM 删除是否延迟
- 子树中的异步依赖如何收集
- renderer 如何 patch、move、remove 节点

### 4.2. 内置组件的本质

内置组件虽然也用组件标签写：

```html
<KeepAlive>
  <component :is="current" />
</KeepAlive>

<Teleport to="body">
  <Modal />
</Teleport>

<Transition>
  <div v-if="show">hello</div>
</Transition>
```

但它们不是普通业务组件。

它们是 Vue runtime / compiler 认识的特殊结构。

例如：

- `<Teleport>` 会被 Vue 识别为特殊 VNode 类型
- `<Suspense>` 会被 Vue 特殊处理
- `<KeepAlive>` 会和组件卸载流程配合
- `<Transition>`、`<TransitionGroup>` 会和 DOM 插入、删除流程配合

它们的作用不是简单地返回一棵 DOM，而是改变子树的渲染行为。

### 4.3. 核心区别：有没有框架级特权

可以用这个表理解：

| 对比项               | 用户自定义组件         | Vue 内置组件         |
| -------------------- | ---------------------- | -------------------- |
| 谁定义               | 用户                   | Vue 框架             |
| 是否需要注册         | 通常需要 import / 注册 | 不需要，Vue 直接识别 |
| 编译器是否特殊识别   | 一般不会               | 会                   |
| runtime 是否特殊处理 | 一般按普通组件处理     | 很多会走特殊逻辑     |
| 能力来源             | Vue 公开 API           | Vue 内部机制         |
| 本质                 | 渲染一段 UI            | 控制子树渲染行为     |

### 4.4. 举几个典型例子

#### `<Teleport>`

```html
<Teleport to="body">
  <Modal />
</Teleport>
```

它可以让组件逻辑上仍然属于当前组件树，但 DOM 实际渲染到 `body` 下。

普通组件很难完整实现这个效果。

你当然可以在普通组件里手动：

```js
document.body.appendChild(el)
```

但这样会破坏很多 Vue 的语义，比如：

- 生命周期管理
- 事件冒泡关系
- provide / inject
- 组件树关系
- SSR / hydration
- 卸载清理

`<Teleport>` 是 Vue renderer 直接支持的能力。

#### `<KeepAlive>`

```html
<KeepAlive>
  <component :is="currentView" />
</KeepAlive>
```

它不是简单地 `display: none`。

它真正做的是：

- 缓存组件实例
- 阻止组件被正常卸载
- 在需要时重新激活
- 触发 `activated` / `deactivated` 生命周期

普通组件没有权限拦截 Vue 的卸载流程，所以无法完整实现 `<KeepAlive>`。

#### `<Transition>`

```html
<Transition>
  <div v-if="show">hello</div>
</Transition>
```

普通情况下，`v-if="false"` 时 DOM 会立刻删除。

但 `<Transition>` 可以让 Vue：

1. 先执行 leave 动画
2. 等动画结束
3. 再真正移除 DOM

这需要和 renderer 的 remove 阶段配合，不是普通组件单靠 `render` 函数就能完全做到的。

#### `<Suspense>`

```html
<Suspense>
  <AsyncComponent />
  <template #fallback> Loading... </template>
</Suspense>
```

它可以感知后代组件里的异步依赖，比如：

```js
async setup() {
  const data = await fetchData()
  return { data }
}
```

普通组件无法自动知道整棵子树中有哪些组件在等待异步任务，也无法控制它们完成前显示 fallback。

这需要 Vue 在组件挂载过程中主动收集异步依赖。

### 4.5. 不是所有内置组件都“完全无法模拟”

需要注意一点：不是所有内置组件都百分百无法用普通组件模拟。

比如动态组件：

```html
<component :is="current" />
```

它本质上是一个动态解析组件类型的语法能力。

你可以用 render 函数模拟一部分：

```js
import { h, resolveDynamicComponent } from 'vue'

export default {
  props: ['is'],
  setup(props, { slots }) {
    return () => h(resolveDynamicComponent(props.is), null, slots)
  },
}
```

所以不能简单说：内置组件 = 用户完全实现不了。

更准确的说法是：

- 内置组件拥有 Vue 预留的框架级语义
- 普通自定义组件只能使用公开 API，不能修改 Vue renderer 的核心行为

### 4.6. 本质总结

内置组件和用户自定义组件的本质区别不是“长得像不像组件”，而是：

- 自定义组件是 Vue 渲染系统的使用者
- 内置组件是 Vue 渲染系统的一部分

或者换句话说：

- 自定义组件负责描述 UI
- 内置组件负责改变某些 UI 子树的渲染规则

所以：

- `<MyButton>` 是业务抽象
- `<MyDialog>` 是 UI 抽象
- `<KeepAlive>` 是缓存策略
- `<Teleport>` 是挂载位置控制
- `<Transition>` 是插入/删除时机控制
- `<Suspense>` 是异步渲染边界

这些内置组件之所以由 Vue 提供，是因为它们需要和 Vue 的编译、挂载、更新、卸载、异步调度等内部机制配合。

## 5. 🤔 Vue 的内置组件封装是传统的 SFC .vue 文件吗？

不是。

Vue 的内置组件的源码实现里不是用传统的 `.vue` SFC 文件写的，而是用 TypeScript 直接实现的组件对象或特殊运行时对象。

例如概念上类似这样：

```ts
export const KeepAlive = {
  name: 'KeepAlive',
  props: {
    /* ... */
  },
  setup(props, { slots }) {
    return () => {
      // 手写渲染逻辑
    }
  },
}
```

或者更底层一些，例如 `Teleport`、`Suspense` 这类组件会参与 Vue renderer 的特殊处理，并不只是普通的模板组件。

而 `.vue` SFC 本质上是开发时的文件格式：

```html
<template>
  <div>Hello</div>
</template>

<script setup></script>

<style scoped></style>
```

它最终也会被编译成 JavaScript 组件定义和 render 函数。

所以可以理解为：

1. SFC 是用户写组件的一种语法格式
2. Vue 内置组件本身直接用 TS 书写组件定义和 render 函数，而不是通过 `.vue` 文件

SFC 偏“编译输入”，内置组件的 TS 实现偏“运行时机制源码”。但最终它们都会变成 JS，在 Vue runtime 中执行。

## 6. 🤔 内置组件的使用频率排名是？

::: tip

没有官方公开的“使用频率排行榜”，只能按多数 Vue 项目的实际经验来粗略判断。

:::

### 6.1. 如果只算 Vue 3 官方内置组件

大致可以排成这样：

| 排名 | 内置组件 | 使用频率 | 常见场景 |
| --- | --- | --- | --- |
| 1 | `<Transition>` | 较高 | 显隐动画、页面切换动画、弹窗动画 |
| 2 | `<KeepAlive>` | 中高 | 路由页面缓存、动态 Tab 缓存 |
| 3 | `<Teleport>` | 中高 | Modal、Drawer、Tooltip、Dropdown 等浮层 |
| 4 | `<TransitionGroup>` | 中低 | 列表增删、排序动画 |
| 5 | `<Suspense>` | 较低 | 异步组件、`async setup`、SSR/框架内部场景 |

可以简化成：Transition > KeepAlive ≈ Teleport > TransitionGroup > Suspense

### 6.2. `<Transition>`：最常见

```html
<Transition>
  <div v-if="show">内容</div>
</Transition>
```

它用来做进入、离开动画。

常见于：

- 弹窗显示隐藏
- 菜单展开收起
- 页面切换
- toast / notification
- collapse 动画

所以它的直接使用频率通常最高。

### 6.3. `<KeepAlive>`：在后台系统里很常见

```html
<KeepAlive>
  <component :is="currentView" />
</KeepAlive>
```

或者配合 `router-view`：

```html
<RouterView v-slot="{ Component }">
  <KeepAlive>
    <component :is="Component" />
  </KeepAlive>
</RouterView>
```

常见于：

- 后台管理系统
- 多标签页系统
- 移动端页面缓存
- 表单状态保留
- 列表页返回后保留滚动位置

不过如果是普通官网、营销页、内容页，它的使用频率会低很多。

### 6.4. `<Teleport>`：直接用不一定最多，但间接使用很多

```html
<Teleport to="body">
  <Modal />
</Teleport>
```

常见于：

- 弹窗
- 抽屉
- tooltip
- popover
- dropdown
- select 下拉面板
- 右键菜单

如果你自己写弹窗组件，`<Teleport>` 很常用。

但很多项目用 Element Plus、Naive UI、Ant Design Vue 这类组件库，开发者自己可能很少直接写 `<Teleport>`，因为组件库内部已经帮你用了。

所以它的特点是：

- 直接使用频率：中等
- 间接使用频率：很高

### 6.5. `<TransitionGroup>`：比 `<Transition>` 少很多

```html
<TransitionGroup tag="ul">
  <li v-for="item in list" :key="item.id">{{ item.text }}</li>
</TransitionGroup>
```

它主要用于列表动画，比如：

- todo 列表增加删除动画
- 拖拽排序动画
- 卡片列表移动动画
- 消息列表动画

但大部分业务列表只是增删查改，不一定需要动画，所以频率低于 `<Transition>`。

### 6.6. `<Suspense>`：能力强，但直接使用较少

```html
<Suspense>
  <AsyncComponent />

  <template #fallback> Loading... </template>
</Suspense>
```

它主要用于处理异步组件、`async setup()` 等场景。

但在普通业务项目中，很多人更习惯手动写：

```html
<div v-if="loading">Loading...</div>
<div v-else>内容</div>
```

或者由 Nuxt、路由、数据请求库、组件库帮忙处理异步状态。

所以 `<Suspense>` 的直接使用频率通常最低。

### 6.7. 如果把特殊内置标签也算进去

Vue 还有一些“内置特殊元素”，严格来说不完全等同于内置组件，例如：

- `<template>`
- `<slot>`
- `<component>`

如果把它们也算进去，排名会变化很大：template > slot / component > Transition > KeepAlive ≈ Teleport > TransitionGroup > Suspense

#### `<template>`

使用频率非常高：

```html
<template v-if="ok">
  <div>A</div>
  <div>B</div>
</template>
```

但它不是普通组件，而是编译时辅助结构。

#### `<slot>`

在封装组件、组件库里很常见：

```html
<button>
  <slot />
</button>
```

业务页面中可能不多，但组件库中使用频率非常高。

#### `<component>`

动态组件场景常见：

```html
<component :is="currentComponent" />
```

常用于：

- 动态 Tab
- 动态表单
- 动态布局
- CMS 渲染
- 低代码平台

### 6.8. 总结

如果你问的是 Vue 官方内置组件的常见使用频率，大致是：Transition > KeepAlive ≈ Teleport > TransitionGroup > Suspense

如果把特殊内置标签也算上，大致是：template > slot / component > Transition > KeepAlive ≈ Teleport > TransitionGroup > Suspense

## 7. 🤔 如何学习 Vue 的内置组件？

可以按这个路线学：

1. 先理解它解决什么问题
2. 再理解普通组件为什么做不到
3. 然后学核心 API
4. 接着学常见组合场景
5. 最后补常见坑和源码机制

推荐顺序：

```txt
template / slot / component
        ↓
Teleport
        ↓
Transition
        ↓
KeepAlive
        ↓
TransitionGroup
        ↓
Suspense
```

每个内置组件都对应 Vue 渲染流程里的一个特殊控制点。学它时先问：

1. 它解决什么问题？
2. 它是如何解决该问题的？
3. 它改变了 Vue 渲染流程的哪一步？
4. 核心 API 是什么？
5. 常见坑是什么？

最重要的是别只背 API，而要记住：内置组件的核心价值，是让开发者用组件语法使用 Vue 底层渲染能力。
