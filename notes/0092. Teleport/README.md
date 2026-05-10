# [0092. Teleport](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0092.%20Teleport)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `<Teleport>` 到底解决了什么问题？](#3--teleport-到底解决了什么问题)
- [4. 🤔 最常见的模态框场景应该怎么写？](#4--最常见的模态框场景应该怎么写)
- [5. 🤔 被传送的内容换了位置后，组件关系会不会变？](#5--被传送的内容换了位置后组件关系会不会变)
- [6. 🤔 `to`、`disabled`、多个目标共享分别怎么理解？](#6--todisabled多个目标共享分别怎么理解)
  - [6.1. `to`](#61-to)
  - [6.2. `disabled`](#62-disabled)
  - [6.3. 多个 Teleport 共享同一目标](#63-多个-teleport-共享同一目标)
- [7. 🤔 `defer` 是干什么的，什么时候需要它？](#7--defer-是干什么的什么时候需要它)
- [8. 🤔 使用 Teleport 时有哪些边界和注意点？](#8--使用-teleport-时有哪些边界和注意点)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 使用动机
- 模态框
- to 目标
- 逻辑关系
- disabled
- 共享目标
- defer
- 使用边界

## 2. 🫧 评价

`<Teleport>` 很实用，尤其是模态框、抽屉、全局浮层、气泡层这类 UI。你真正要掌握的是「它只改 DOM 位置，不改组件逻辑关系」「目标节点必须存在」「`disabled` 和 `defer` 分别解决的是不同阶段的问题」。

## 3. 🤔 `<Teleport>` 到底解决了什么问题？

`<Teleport>` 解决的是这样一种矛盾：

- 某段模板在逻辑上属于当前组件
- 但它在 DOM 结构上又应该渲染到更外层的位置

最典型的例子就是模态框。

从逻辑上讲，打开按钮、关闭状态、弹层内容都属于同一个组件，写在一个单文件组件里最自然；但从页面布局上讲，模态框通常应该直接挂到 `body` 或者应用根层的浮层容器下，否则容易被祖先元素的 `transform`、`filter`、`z-index`、`overflow` 之类样式影响。

所以你可以把 `<Teleport>` 理解成一句话：

“模板归我管，但 DOM 别放我这儿。”

## 4. 🤔 最常见的模态框场景应该怎么写？

官方用模态框示例说明得非常典型。

```vue
<template>
  <button @click="open = true">打开弹层</button>

  <Teleport to="body">
    <div v-if="open" class="modal">
      <p>Hello from the modal!</p>
      <button @click="open = false">关闭</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<style scoped>
.modal {
  position: fixed;
  top: 20%;
  left: 50%;
  z-index: 999;
  width: 320px;
  margin-left: -160px;
}
</style>
```

这里的关键点在于：`<div class="modal">` 依然写在当前组件模板里，但实际渲染时会被移动到 `body` 下面。

`to` 属性既可以是 CSS 选择器字符串，也可以直接传一个 DOM 元素对象。最常见的写法还是：

- `to="body"`
- `to="#modals"`

## 5. 🤔 被传送的内容换了位置后，组件关系会不会变？

不会。

这是 Teleport 最容易误解的地方。它改变的是最终 DOM 挂载位置，不是 Vue 内部的组件树关系。

这意味着：

- Props 传递不受影响。
- 组件事件照常触发。
- `provide / inject` 照常工作。
- Vue Devtools 里它仍然挂在逻辑上的父组件下面。

换句话说，Teleport 只是把“渲染结果”搬家了，没把“组件归属关系”改掉。

所以如果你在 Teleport 里放一个子组件，它依然是当前组件的孩子，而不是目标 DOM 节点的某个“新父组件的孩子”。

## 6. 🤔 `to`、`disabled`、多个目标共享分别怎么理解？

### 6.1. `to`

`to` 用来指定目标容器。

```vue
<Teleport to="#modals">
  <div>Modal A</div>
</Teleport>
```

目标节点在 Teleport 挂载时必须已经存在。理想情况下，这个目标容器是应用外层的静态 DOM，比如 HTML 里预留的：

```html
<div id="app"></div>
<div id="modals"></div>
```

### 6.2. `disabled`

有时你想在桌面端把内容做成浮层，但在移动端又希望它保持原位渲染，这时可以动态禁用 Teleport：

```vue
<Teleport to="body" :disabled="isMobile">
  <div class="panel">内容</div>
</Teleport>
```

`disabled` 为 `true` 时，内容会留在组件原本的位置，不再被传送。

### 6.3. 多个 Teleport 共享同一目标

多个 Teleport 可以把内容传到同一个容器里，后挂载的内容会按顺序追加进去：

```vue
<Teleport to="#modals">
  <div>A</div>
</Teleport>

<Teleport to="#modals">
  <div>B</div>
</Teleport>
```

最终结果类似：

```html
<div id="modals">
  <div>A</div>
  <div>B</div>
</div>
```

这对可复用弹层组件特别有用。

## 7. 🤔 `defer` 是干什么的，什么时候需要它？

`defer` 是 Vue 3.5+ 提供的能力，用来“延迟解析 Teleport 目标”。

它解决的不是“目标晚很多秒才出现”，而是“目标在同一次挂载 / 更新周期里稍后才渲染出来”。

```vue
<Teleport defer to="#late-div">
  <div>hello</div>
</Teleport>

<div id="late-div"></div>
```

这个场景通常出现在：目标节点也是 Vue 渲染出来的，而且它在模板里排在更后面。

但要注意一个边界：即使用了 `defer`，目标也必须在同一个挂载或更新周期内出现。如果你打算一秒后再异步创建目标节点，Teleport 仍然会报错。

## 8. 🤔 使用 Teleport 时有哪些边界和注意点？

可以把注意点概括成 5 条：

1. 目标节点必须存在，除非你明确使用 `defer` 处理同周期延迟解析。
2. Teleport 只改变 DOM 位置，不改变组件逻辑层级。
3. 它非常适合和 `<Transition>` 组合，用来做带动画的模态框。
4. 如果只是普通布局重排，而不是浮层脱离文档流，未必需要 Teleport。
5. SSR 场景下 Teleport 也有专门处理规则，不能完全按纯客户端思路想当然。

另外还有一个很务实的判断：

- 遇到 `z-index` 被祖先压住、`position: fixed` 失效、弹层被裁切，优先想到 Teleport。
- 遇到只是样式没写好，不要把 Teleport 当成万能修复器。

## 9. 🔗 引用

- [Vue.js 官方文档 - Teleport][1]
- [Vue.js 官方文档 - `<Teleport>` API][2]
- [Vue.js 官方文档 - SSR 中处理 Teleports][3]

[1]: https://cn.vuejs.org/guide/built-ins/teleport.html
[2]: https://cn.vuejs.org/api/built-in-components.html#teleport
[3]: https://cn.vuejs.org/guide/scaling-up/ssr.html#teleports
