---
name: note-standards
description: 'TNotes.vue Vue 学习笔记共享写作规范。Use when: 撰写、补全、优化、审查 README.md，需要统一结构、语气、中文标点、代码示例、VitePress Markdown、引用格式。'
argument-hint: 'TNotes.vue 笔记共享规范'
---

# Note Standards

这是 TNotes.vue 所有 Vue 学习笔记共用的写作规范。无论处于 outline、write 还是 polish 阶段，都必须遵循这些规则。

## 笔记结构

每篇笔记严格使用以下结构：

```markdown
# [编号. 标题](GitHub 链接)

<!-- region:toc -->

（自动生成，不要手写）

<!-- endregion:toc -->

## 1. 🎯 本节内容

## 2. 🫧 评价

## 3. 🤔 正文（问答形式，多个小节）

...

## N. 🔗 引用
```

- 标题格式为 `# [编号. 主题名称](GitHub 仓库对应目录链接)`。
- 「本节内容」用简洁列表列出本节知识点，不超过 10 条。
- 「评价」说明哪些高频、哪些了解即可，以及必要的个人实践建议。
- 正文以 `## N. 🤔 问题` 组织，一个小节解决一个核心问题。
- 「引用」列出 Vue 官方文档、MDN 等核心参考资料。
- 不要手写 TOC，目录由 `@tnotesjs/core` 自动生成。

## 写作风格

- 用「你」称呼读者，口语化但保持专业。
- 可以使用「简单来说」「换句话说」「也就是说」等自然过渡。
- 可以用 `=>` 或 `==>` 补充说明前文。
- 不过度吹捧，也不贬低知识点，语气务实。

## 标点与排版

- 中文正文中使用中文标点。
- 中文正文禁止使用英文引号，强调内容用 `「」`。
- 禁止使用加粗样式，避免 `**xxx**`。
- 技术术语保留英文原文，如 `ref`、`reactive`、`computed`、`v-if`。
- 行内代码使用反引号。
- 代码块中的 HTML 属性引号、JS 字符串、JSON 键值等遵循语言自身语法，不要强行替换成中文标点。

## 示例代码

- 优先使用 `<script setup>` 组合式 API。
- 示例代码尽可能简单，只展示当前知识点。
- Vue 示例默认写成完整 SFC，包含 `<template>` 和 `<script setup>`。
- 需要样式时加 `<style scoped>`。
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
- 引用格式：

```markdown
- [Vue.js 官方文档 - 侦听器][1]
- [MDN - AbortController][2]

[1]: https://cn.vuejs.org/guide/essentials/watchers.html
[2]: https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController
```

## 工作流反馈

- 如果执行笔记任务时发现用户最新要求、仓库实际写法、官方文档结论与当前 Agent 或 Skill 规则存在明显冲突，不要默默忽略。
- 当前任务优先按用户最新明确要求完成；如果冲突会影响结果，需要在回复中说明采用了哪条规则。
- 如果冲突具有复用价值，应提醒用户是否需要优化 `.github/agents/**` 或 `.github/skills/**` 中的工作流规则。
- 未经用户明确要求，不要主动修改 `.github/**` 工作流文件。
