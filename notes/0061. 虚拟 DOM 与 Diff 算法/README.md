# [0061. 虚拟 DOM 与 Diff 算法](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0061.%20%E8%99%9A%E6%8B%9F%20DOM%20%E4%B8%8E%20Diff%20%E7%AE%97%E6%B3%95)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 虚拟 DOM 的设计思想是什么？为什么要引入虚拟 DOM？](#3--虚拟-dom-的设计思想是什么为什么要引入虚拟-dom)
- [4. 🤔 Vue 2 和 Vue 3 的 Diff 算法有什么区别？](#4--vue-2-和-vue-3-的-diff-算法有什么区别)
- [5. 🤔 静态提升和 Patch Flags 是什么？如何优化性能？](#5--静态提升和-patch-flags-是什么如何优化性能)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 虚拟 DOM 的设计思想
- Vue 2 与 Vue 3 的 Diff 算法对比
- 静态提升与 Patch Flags

## 2. 🫧 评价

- todo

## 3. 🤔 虚拟 DOM 的设计思想是什么？为什么要引入虚拟 DOM？

虚拟 DOM（Virtual DOM）是用 JavaScript 对象来描述真实 DOM 结构的一种抽象表示。每个虚拟 DOM 节点（VNode）本质上就是一个普通的 JS 对象，包含标签名、属性、子节点等信息。

```js
// 真实 DOM
// <div id="app" class="container">
//   <h1>Hello</h1>
//   <p>World</p>
// </div>

// 对应的虚拟 DOM（VNode 对象）
const vnode = {
  type: 'div',
  props: {
    id: 'app',
    class: 'container',
  },
  children: [
    {
      type: 'h1',
      props: null,
      children: 'Hello',
    },
    {
      type: 'p',
      props: null,
      children: 'World',
    },
  ],
}
```

Vue 中使用 h 函数（hyperscript）来创建 VNode：

```js
import { h } from 'vue'

// h(标签, 属性, 子节点)
const vnode = h('div', { id: 'app', class: 'container' }, [
  h('h1', null, 'Hello'),
  h('p', null, 'World'),
])
```

引入虚拟 DOM 的核心原因不是"比直接操作 DOM 更快"（这是一个常见误解），而是解决以下问题：

第一，声明式编程的性能保障。如果不用虚拟 DOM，声明式框架在数据变化时最简单的做法是销毁所有旧 DOM 并重建——这显然性能极差。虚拟 DOM 通过 Diff 算法找出前后两棵虚拟 DOM 树的差异，只对真正变化的部分进行最小化 DOM 操作：

```
数据变化 -> 生成新的 VNode 树 -> Diff 对比新旧 VNode 树 -> 生成补丁（Patch）-> 只更新变化的真实 DOM
```

第二，跨平台能力。虚拟 DOM 是平台无关的 JS 对象，Vue 的渲染器可以将 VNode 渲染到不同平台：浏览器 DOM、服务端字符串（SSR）、Canvas、原生移动端（如 Weex）等。渲染逻辑和平台操作解耦：

```js
// 不同平台的渲染器实现不同的节点操作
// 浏览器渲染器
const browserOps = {
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(child, parent) {
    parent.appendChild(child)
  },
}

// 自定义渲染器（比如 Canvas）
const canvasOps = {
  createElement(tag) {
    return { tag, children: [] }
  },
  setElementText(el, text) {
    el.text = text
  },
  insert(child, parent) {
    parent.children.push(child)
  },
}
```

第三，组件化抽象。VNode 不仅可以描述原生 DOM 元素，还可以描述组件。组件在虚拟 DOM 中也是一个 VNode 节点，其 type 是组件对象本身：

```js
import MyComponent from './MyComponent.vue'

// 组件也是 VNode
const componentVNode = h(MyComponent, {
  title: 'Hello',
  onClose: () => console.log('closed'),
})
```

虚拟 DOM 的性能权衡：原生 DOM 操作在简单场景下确实比虚拟 DOM 快（少了一层 JS 对象创建和 Diff 的开销）。虚拟 DOM 的价值在于"在保留声明式编程体验的前提下，通过最小化 DOM 操作获得足够好的性能"。Vue 3 通过编译时优化（静态提升、Patch Flags）进一步减少了运行时的 Diff 开销。

## 4. 🤔 Vue 2 和 Vue 3 的 Diff 算法有什么区别？

Diff 算法的核心任务是：对比新旧两组子节点，找出最小的 DOM 操作方式来完成更新。

Vue 2 使用的是双端 Diff 算法。它维护四个指针——旧头、旧尾、新头、新尾，每轮比较尝试四种匹配：

```
旧子节点：[A] [B] [C] [D]
            ↑               ↑
          oldStart        oldEnd

新子节点：[D] [A] [B] [C]
            ↑               ↑
          newStart        newEnd
```

双端 Diff 的比较步骤（每轮依次尝试）：

1. oldStart vs newStart（头头比较）
2. oldEnd vs newEnd（尾尾比较）
3. oldStart vs newEnd（头尾比较）
4. oldEnd vs newStart（尾头比较）
5. 都不匹配：在旧节点中查找 newStart 对应的节点

```js
// 双端 Diff 简化伪代码
function patchChildren(oldChildren, newChildren) {
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = newChildren.length - 1

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (sameVNode(oldStart, newStart)) {
      // 头头匹配，两组指针都右移
      patch(oldStart, newStart)
      oldStartIdx++
      newStartIdx++
    } else if (sameVNode(oldEnd, newEnd)) {
      // 尾尾匹配，两组指针都左移
      patch(oldEnd, newEnd)
      oldEndIdx--
      newEndIdx--
    } else if (sameVNode(oldStart, newEnd)) {
      // 头尾匹配，将 oldStart 移到 oldEnd 之后
      patch(oldStart, newEnd)
      insert(oldStart.el, parent, oldEnd.el.nextSibling)
      oldStartIdx++
      newEndIdx--
    } else if (sameVNode(oldEnd, newStart)) {
      // 尾头匹配，将 oldEnd 移到 oldStart 之前
      patch(oldEnd, newStart)
      insert(oldEnd.el, parent, oldStart.el)
      oldEndIdx--
      newStartIdx++
    } else {
      // 暴力查找
      // ...
    }
  }
}
```

Vue 3 使用的是快速 Diff 算法，借鉴了 ivi 和 inferno 框架的思路。它在双端 Diff 的基础上增加了"最长递增子序列"（LIS）优化：

```js
// Vue 3 快速 Diff 的步骤

// 第一步：从头部开始预处理相同节点
// 旧：A B C D E F G
// 新：A B D C E H G
// A、B 头部相同，直接 patch

// 第二步：从尾部开始预处理相同节点
// G 尾部相同，直接 patch

// 第三步：处理中间部分 [C D E F] vs [D C E H]
// 构建新节点的 key -> index 映射
// 计算最长递增子序列 LIS
// LIS 中的节点不需要移动，只移动不在 LIS 中的节点
```

最长递增子序列（LIS）优化的关键作用：

```
旧中间节点索引：[C:2, D:3, E:4, F:5]
新中间节点索引：[D:0, C:1, E:2, H:3]

在新序列中，旧节点对应的位置：D->0, C->1, E->2
从旧序列角度看索引为：[3, 2, 4]（D在旧的第3位，C在旧的第2位，E在旧的第4位）
对应的 source 数组：[1, 0, 2, -1]  (新位置到旧位置的映射，-1 表示新增)

LIS(source) = [0, 2]  即 D 和 E 不需要移动
只需要移动 C，新增 H，删除 F
```

Vue 3 快速 Diff 相比 Vue 2 双端 Diff 的优势：通过 LIS 算法找到最长不需要移动的子序列，最大限度减少 DOM 移动操作。加上编译时插入的 Patch Flags，很多静态节点在 Diff 阶段可以直接跳过。

## 5. 🤔 静态提升和 Patch Flags 是什么？如何优化性能？

静态提升（Static Hoisting）和 Patch Flags 是 Vue 3 编译器的两个关键优化手段，它们在编译阶段分析模板，为运行时的渲染和 Diff 提供优化信息。

静态提升：将模板中永远不会变的节点提升到渲染函数之外，只创建一次。在组件重新渲染时直接复用，而不是每次都重新创建 VNode。

```html
<template>
  <div>
    <h1>静态标题</h1>
    <!-- 纯静态节点 -->
    <p class="desc">描述文字</p>
    <!-- 纯静态节点 -->
    <span>{{ dynamicText }}</span>
    <!-- 动态节点 -->
  </div>
</template>
```

不做静态提升（Vue 2 的方式）：

```js
// 每次渲染都创建所有 VNode
function render() {
  return h('div', null, [
    h('h1', null, '静态标题'), // 每次重新创建
    h('p', { class: 'desc' }, '描述文字'), // 每次重新创建
    h('span', null, ctx.dynamicText), // 动态内容
  ])
}
```

做了静态提升（Vue 3）：

```js
// 静态节点提升到模块作用域，只创建一次
const _hoisted_1 = h('h1', null, '静态标题')
const _hoisted_2 = h('p', { class: 'desc' }, '描述文字')

function render() {
  return h('div', null, [
    _hoisted_1, // 直接复用
    _hoisted_2, // 直接复用
    h('span', null, ctx.dynamicText), // 只有动态节点会重新创建
  ])
}
```

当连续多个静态节点时，Vue 3 还会进行静态节点的字符串化（将多个连续静态节点序列化成一个 HTML 字符串，通过 innerHTML 一次性插入）。

Patch Flags：编译器在动态节点上标记"哪些部分是动态的"，让运行时 Diff 只比较动态的部分，跳过不需要检查的属性。

```html
<template>
  <div :id="dynamicId" class="static-class">{{ msg }}</div>
</template>
```

编译后的渲染函数：

```js
import { PatchFlags } from 'vue'

// PatchFlags 是位运算标记
// TEXT = 1        -> 动态文本
// CLASS = 2       -> 动态 class
// STYLE = 4       -> 动态 style
// PROPS = 8       -> 动态非 class/style 属性
// FULL_PROPS = 16 -> 有动态 key 的属性
// STABLE_FRAGMENT = 64 -> 子节点顺序不变的 Fragment

function render() {
  return h(
    'div',
    {
      id: ctx.dynamicId, // 动态
      class: 'static-class', // 静态
    },
    ctx.msg,
    PatchFlags.TEXT | PatchFlags.PROPS, // 标记为：有动态文本和动态 props
    ['id'], // 动态属性名列表（只有 id 是动态的）
  )
}
```

运行时 Diff 根据 Patch Flags 优化比较过程：

```js
function patchElement(n1, n2) {
  const { patchFlag } = n2

  if (patchFlag > 0) {
    // 有 patchFlag，做靶向更新
    if (patchFlag & PatchFlags.TEXT) {
      // 只更新文本内容
      if (n1.children !== n2.children) {
        el.textContent = n2.children
      }
    }
    if (patchFlag & PatchFlags.PROPS) {
      // 只比较标记的动态属性（如 id）
      // 不需要遍历全部属性
      const dynamicProps = n2.dynamicProps
      for (const key of dynamicProps) {
        if (n1.props[key] !== n2.props[key]) {
          patchProp(el, key, n1.props[key], n2.props[key])
        }
      }
    }
    // class 是静态的，完全跳过
  } else {
    // 没有 patchFlag，全量比较（兜底）
    patchProps(el, n1.props, n2.props)
  }
}
```

Vue 3 还引入了 Block Tree 的概念：将模板按 Block（带有 v-if / v-for 等结构化指令的节点）分割。每个 Block 收集其内部所有动态节点到一个扁平数组（dynamicChildren）中。Diff 时直接遍历这个扁平数组，跳过所有静态节点，性能与动态节点数量成正比而非模板总节点数。
