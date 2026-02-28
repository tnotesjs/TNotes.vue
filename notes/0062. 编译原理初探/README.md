# [0062. 编译原理初探](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0062.%20%E7%BC%96%E8%AF%91%E5%8E%9F%E7%90%86%E5%88%9D%E6%8E%A2)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue 模板编译的完整流程是什么？](#3--vue-模板编译的完整流程是什么)
- [4. 🤔 AST 在 Vue 编译中扮演什么角色？](#4--ast-在-vue-编译中扮演什么角色)
- [5. 🤔 Vue 3 编译时做了哪些优化？](#5--vue-3-编译时做了哪些优化)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 模板编译的流程（parse、transform、generate）
- AST 抽象语法树
- 编译时优化

## 2. 🫧 评价

- todo

## 3. 🤔 Vue 模板编译的完整流程是什么？

Vue 的模板编译分为三个阶段：解析（parse）、转换（transform）、代码生成（generate）。最终将模板字符串编译为渲染函数。

```
模板字符串 --parse--> AST --transform--> 优化后的 AST --generate--> 渲染函数代码
```

以一个具体模板为例：

```html
<div id="app">
  <p>{{ msg }}</p>
  <span :class="cls">静态文本</span>
</div>
```

第一阶段——解析（parse）：将模板字符串逐字符扫描（词法分析），识别出开始标签、结束标签、属性、文本、插值表达式等，构建成 AST（抽象语法树）。

```js
// parse 的核心思路：有限状态机 + 栈
// 伪代码演示
function parse(template) {
  const ast = { type: 'Root', children: [] }
  const stack = [ast] // 节点栈，用于维护父子关系

  let source = template

  while (source.length > 0) {
    if (source.startsWith('</')) {
      // 匹配到结束标签
      const match = source.match(/^<\/([a-z]+)>/i)
      stack.pop() // 弹出栈顶
      source = source.slice(match[0].length)
    } else if (source.startsWith('<')) {
      // 匹配到开始标签
      const match = source.match(/^<([a-z]+)/i)
      const node = {
        type: 'Element',
        tag: match[1],
        props: [], // 解析属性
        children: [],
      }
      // 解析属性 id="app"、:class="cls" 等
      // ...
      stack[stack.length - 1].children.push(node)
      stack.push(node) // 入栈，成为后续子节点的父级
      source = source.slice(/* 跳过开始标签 */)
    } else if (source.startsWith('{{')) {
      // 匹配到插值表达式
      const match = source.match(/^\{\{(.*?)\}\}/)
      const node = {
        type: 'Interpolation',
        content: { type: 'Expression', content: match[1].trim() },
      }
      stack[stack.length - 1].children.push(node)
      source = source.slice(match[0].length)
    } else {
      // 普通文本
      const textEnd = source.indexOf('<')
      const text = source.slice(0, textEnd)
      if (text.trim()) {
        stack[stack.length - 1].children.push({
          type: 'Text',
          content: text,
        })
      }
      source = source.slice(textEnd)
    }
  }

  return ast
}
```

解析后得到的 AST 结构：

```js
{
  type: 'Root',
  children: [{
    type: 'Element',
    tag: 'div',
    props: [{ type: 'Attribute', name: 'id', value: 'app' }],
    children: [
      {
        type: 'Element',
        tag: 'p',
        children: [{
          type: 'Interpolation',
          content: { type: 'Expression', content: 'msg' }
        }]
      },
      {
        type: 'Element',
        tag: 'span',
        props: [{ type: 'Directive', name: 'bind', arg: 'class', exp: 'cls' }],
        children: [{ type: 'Text', content: '静态文本' }]
      }
    ]
  }]
}
```

第二阶段——转换（transform）：遍历 AST，对节点进行语义分析和优化。这个阶段会标记静态节点、添加 Patch Flags、处理指令（v-if、v-for、v-on 等）、进行静态提升分析等：

```js
function transform(ast) {
  const context = {
    nodeTransforms: [
      transformElement, // 处理元素节点
      transformText, // 处理文本节点
      transformExpression, // 处理表达式
    ],
    directiveTransforms: {
      bind: transformBind, // 处理 v-bind
      on: transformOn, // 处理 v-on
      if: transformIf, // 处理 v-if
      for: transformFor, // 处理 v-for
    },
  }

  // 深度优先遍历 AST
  traverseNode(ast, context)

  // 静态提升分析
  hoistStatic(ast)
}
```

第三阶段——代码生成（generate）：将优化后的 AST 转换为渲染函数的 JavaScript 代码字符串：

```js
function generate(ast) {
  const code = []
  code.push('const { h, toDisplayString } = Vue')
  code.push('return function render(_ctx) {')

  // 递归生成子节点代码
  genNode(ast.children[0], code)

  code.push('}')
  return code.join('\n')
}

// 最终生成的渲染函数代码
const { createElementVNode, toDisplayString, openBlock, createElementBlock } =
  Vue

const _hoisted_1 = { id: 'app' }
const _hoisted_2 = /* @__PURE__ */ createElementVNode(
  'span',
  null,
  '静态文本',
  -1,
)

return function render(_ctx) {
  return (
    openBlock(),
    createElementBlock('div', _hoisted_1, [
      createElementVNode('p', null, toDisplayString(_ctx.msg), 1 /* TEXT */),
      createElementVNode(
        'span',
        { class: _ctx.cls },
        '静态文本',
        2 /* CLASS */,
      ),
    ])
  )
}
```

## 4. 🤔 AST 在 Vue 编译中扮演什么角色？

AST（Abstract Syntax Tree，抽象语法树）是模板字符串的结构化表示。它将扁平的字符串转换为树状的数据结构，使得编译器可以方便地分析、遍历和修改模板内容。

在 Vue 中，AST 是 parse 阶段的输出，也是 transform 和 generate 阶段的输入。它是整个编译管线的数据中枢。

Vue 3 的模板 AST 节点类型：

```ts
// Vue 3 内部 AST 节点类型定义（简化版）
const enum NodeTypes {
  ROOT, // 根节点
  ELEMENT, // 元素节点 <div>
  TEXT, // 纯文本节点
  COMMENT, // 注释节点 <!-- -->
  SIMPLE_EXPRESSION, // 简单表达式 msg
  INTERPOLATION, // 插值 {{ msg }}
  ATTRIBUTE, // 静态属性 id="app"
  DIRECTIVE, // 指令属性 v-bind :class @click
  COMPOUND_EXPRESSION, // 复合表达式（文本 + 插值混合）
  IF, // v-if 节点
  IF_BRANCH, // v-if / v-else-if / v-else 分支
  FOR, // v-for 节点
  TEXT_CALL, // createTextVNode 调用
  VNODE_CALL, // createVNode 调用
  JS_CALL_EXPRESSION, // JS 函数调用
  JS_OBJECT_EXPRESSION, // JS 对象表达式
  JS_ARRAY_EXPRESSION, // JS 数组表达式
}
```

一个包含指令的模板解析成 AST 的示例：

```html
<ul>
  <li v-for="item in items" :key="item.id" @click="select(item)">
    {{ item.name }}
  </li>
</ul>
```

```js
// 解析后的 AST（简化）
{
  type: NodeTypes.ROOT,
  children: [{
    type: NodeTypes.ELEMENT,
    tag: 'ul',
    children: [{
      type: NodeTypes.ELEMENT,
      tag: 'li',
      props: [
        {
          type: NodeTypes.DIRECTIVE,
          name: 'for',
          exp: { content: 'item in items' },
          // transform 阶段会将其解析为：
          // forParseResult: { source: 'items', value: 'item' }
        },
        {
          type: NodeTypes.DIRECTIVE,
          name: 'bind',
          arg: { content: 'key' },
          exp: { content: 'item.id' }
        },
        {
          type: NodeTypes.DIRECTIVE,
          name: 'on',
          arg: { content: 'click' },
          exp: { content: 'select(item)' }
        }
      ],
      children: [{
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'item.name'
        }
      }]
    }]
  }]
}
```

AST 使编译器能够实现几个关键能力：

第一，结构分析。编译器可以遍历 AST 判断模板结构是否合法（如 v-else 必须跟在 v-if 之后）、分析嵌套关系、找出作用域（v-for 创建的作用域变量）。

第二，转换优化。编译器遍历 AST 对节点进行变换：将 v-if 分支节点合并为条件表达式、将 v-for 转换为 renderList 调用、标记静态子树等。

第三，代码生成。generate 阶段根据 AST 节点类型生成对应的 JS 代码：元素节点生成 createElementVNode 调用，插值生成 toDisplayString 调用，指令生成对应的运行时辅助函数调用。

## 5. 🤔 Vue 3 编译时做了哪些优化？

Vue 3 的编译器在 transform 阶段引入了大量优化策略，将运行时的工作尽可能转移到编译时完成，这是 Vue 3 性能大幅提升的关键因素。

第一，静态提升（Hoist Static）。编译器分析 AST，将纯静态节点（没有动态绑定的元素及其子树）提升到渲染函数外部，组件重渲染时直接复用，不重新创建 VNode：

```html
<template>
  <div>
    <p>纯静态段落</p>
    <p>另一个静态段落</p>
    <p>{{ dynamic }}</p>
  </div>
</template>
```

```js
// 编译输出（启用静态提升）
const _hoisted_1 = /* @__PURE__ */ createElementVNode(
  'p',
  null,
  '纯静态段落',
  -1 /* HOISTED */,
)
const _hoisted_2 = /* @__PURE__ */ createElementVNode(
  'p',
  null,
  '另一个静态段落',
  -1 /* HOISTED */,
)

function render(_ctx) {
  return (
    openBlock(),
    createElementBlock('div', null, [
      _hoisted_1, // 复用
      _hoisted_2, // 复用
      createElementVNode(
        'p',
        null,
        toDisplayString(_ctx.dynamic),
        1 /* TEXT */,
      ),
    ])
  )
}
```

第二，Patch Flags。编译器在创建动态 VNode 时附加位标记，告诉运行时"这个节点的哪些部分是动态的"。Diff 时只比较动态部分：

```js
// Patch Flags 常量
export const enum PatchFlags {
  TEXT = 1,              // 动态 textContent
  CLASS = 1 << 1,        // 动态 class
  STYLE = 1 << 2,        // 动态 style
  PROPS = 1 << 3,        // 动态的非 class/style 属性
  FULL_PROPS = 1 << 4,   // 有动态 key 的 props
  HYDRATE_EVENTS = 1 << 5,
  STABLE_FRAGMENT = 1 << 6,
  KEYED_FRAGMENT = 1 << 7,
  UNKEYED_FRAGMENT = 1 << 8,
  NEED_PATCH = 1 << 9,   // 非 props 的 patch（ref、指令）
  DYNAMIC_SLOTS = 1 << 10,
  HOISTED = -1,          // 静态提升的节点
  BAIL = -2              // 跳过优化
}
```

第三，Block Tree。编译器将模板中的结构化指令节点（v-if、v-for 等）标记为 Block。每个 Block 会收集其内部所有动态子节点到 dynamicChildren 数组中。Diff 时直接遍历 dynamicChildren 而不是完整的 children 树，将 Diff 复杂度从 O(模板大小) 降低到 O(动态节点数)：

```html
<template>
  <div>
    <!-- Block（根节点） -->
    <p>静态1</p>
    <p>静态2</p>
    <p>...假设有 100 个静态节点...</p>
    <p>{{ dynamic1 }}</p>
    <!-- 动态 -->
    <p :class="cls">text</p>
    <!-- 动态 -->
  </div>
</template>
```

```js
// 编译后，Block 的 dynamicChildren 只包含 2 个动态节点
// Diff 时只需比较这 2 个，跳过 100 个静态节点
function render(_ctx) {
  return (
    openBlock(),
    createElementBlock('div', null, [
      ...hoisted_nodes, // 100 个静态节点（已提升，直接复用）
      createElementVNode(
        'p',
        null,
        toDisplayString(_ctx.dynamic1),
        1 /* TEXT */,
      ),
      createElementVNode('p', { class: _ctx.cls }, 'text', 2 /* CLASS */),
    ])
  )
  // 内部 dynamicChildren = [动态p1, 动态p2]，只 diff 这两个
}
```

第四，缓存事件处理函数。编译器对内联事件处理函数进行缓存，避免每次渲染创建新的函数导致子组件无意义的更新：

```html
<template>
  <button @click="count++">+1</button>
</template>
```

```js
// 未缓存：每次渲染都创建新函数
render() {
  return h('button', { onClick: () => ctx.count++ }, '+1')
  // 新函数 !== 旧函数，可能触发子组件更新
}

// 缓存后（Vue 3 编译器优化）
render(_ctx, _cache) {
  return h('button', {
    onClick: _cache[0] || (_cache[0] = ($event) => (_ctx.count++))
  }, '+1')
  // 复用同一个函数引用
}
```

第五，预字符串化。当模板中有大量连续静态节点（阈值为 20 个）时，编译器将它们序列化为 HTML 字符串，运行时通过 innerHTML 一次性插入，比逐个 createElement 更快。
