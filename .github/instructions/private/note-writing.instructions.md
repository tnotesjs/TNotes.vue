---
name: 'TNotes 笔记写作规范'
description: '在编辑 notes/{笔记目录}/README.md 时使用。覆盖笔记结构、行文风格、中文标点、代码示例、VitePress Markdown、引用格式和 TOC 维护边界。'
applyTo:
  - 'notes/**/README.md'
---

# TNotes 笔记写作规范

本规则只适用于 `notes/{编号. 标题}/README.md`。其它文件不默认套用这些写作规则。

## 第一优先级：正确性

笔记内容的正确性是第一优先级，务必确保记录的信息是正确的且可被证实的。

## 笔记结构

每篇笔记遵循以下结构：

```markdown
# [编号. 标题](GitHub 链接)

<!-- region:toc -->

（自动生成，不要手写）

<!-- endregion:toc -->

## 1. 本节内容

## 2. 评价

## 3. 正文问题

...

## N. 🔗 引用
```

- 标题格式为 `# [编号. 主题名称](GitHub 仓库对应目录链接)`。
- “本节内容”用简洁列表列出本节知识点，原则上不超过 10 条，每条尽量短。
- “评价”以资深开发的角度，用简短的 1 到 2 句话点评全篇笔记内容。
- 正文以问答形式组织，一个 `## N. 问题` 以一个核心知识点或一个核心问题展开。
- “引用”列出 Vue 官方文档、MDN 或其它核心参考资料。
- 不要手写 `<!-- region:toc -->` 与 `<!-- endregion:toc -->` 之间的目录内容。

## 写作风格

- 用“你”称呼读者，表达口语化但保持专业。
- 可以使用“简单来说”、“换句话说”、“也就是说”等自然过渡。
- 可以用 `=>` 或 `==>` 补充说明前文。
- 不过度吹捧，也不贬低知识点，语气务实。
- 避免把源码或原理内容写得过长；基础用法和常见场景优先。

## 标点与排版

- 中文正文使用中文标点。
- 中文正文中不要使用英文引号，应该使用 `“”`。
- 不使用加粗样式，避免 `**xxx**`。
- 技术术语保留英文原文，如 `ref`、`reactive`、`computed`、`v-if`。
- 行内代码使用反引号。
- 代码块中的 HTML 属性引号、JS 字符串、JSON 键值遵循语言自身语法，不强行替换成中文标点。

## 示例代码

- Vue 示例优先使用 `<script setup>` 组合式 API。
- 示例代码尽可能简单，只展示当前知识点。
- Vue 示例默认写成完整 SFC，包含 `<template>` 和 `<script setup>`。
- 需要样式时添加 `<style scoped>`。
- 变量命名要语义化。
- 如果修改代码示例，必须同步检查解释文字、输出结果、截图描述是否一致。

## VitePress 扩展语法

可使用提示框：

```markdown
::: tip 标题

提示内容

:::
```

可使用折叠块：

```markdown
::: details 点击展开标题

折叠内容

:::
```

可使用代码分组：

````markdown
::: code-group

```html [ComponentA.vue]
<!-- 代码内容 -->
```

```html [App.vue]
<!-- 代码内容 -->
```

:::
````

## 引用

- Vue API、指令、响应式、组件行为等优先引用 Vue 官方文档。
- 原生 JavaScript、浏览器 API、事件循环、`AbortController` 等可补充 MDN。
- 引用格式使用引用式链接：

```markdown
- [Vue.js 官方文档 - 侦听器][1]
- [MDN - AbortController][2]

[1]: https://cn.vuejs.org/guide/essentials/watchers.html
[2]: https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController
```
