# [0097. 工具链](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0097.%20%E5%B7%A5%E5%85%B7%E9%93%BE)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. Vue 项目的工具链到底包含哪些东西？](#3-vue-项目的工具链到底包含哪些东西)
- [4. 官方为什么优先推荐 Vite 和 create-vue？](#4-官方为什么优先推荐-vite-和-create-vue)
- [5. Vue CLI 现在是什么定位？](#5-vue-cli-现在是什么定位)
- [6. 为什么有“运行时版”和“完整版”之分？](#6-为什么有运行时版和完整版之分)
- [7. 日常开发最值得装的 IDE、调试和类型工具有哪些？](#7-日常开发最值得装的-ide调试和类型工具有哪些)
  - [7.1. IDE](#71-ide)
  - [7.2. 浏览器调试](#72-浏览器调试)
  - [7.3. TypeScript 工具](#73-typescript-工具)
- [8. 测试、Lint、格式化和自定义块集成该怎么理解？](#8-测试lint格式化和自定义块集成该怎么理解)
  - [8.1. 测试](#81-测试)
  - [8.2. 代码规范](#82-代码规范)
  - [8.3. 格式化](#83-格式化)
  - [8.4. 自定义块集成](#84-自定义块集成)
- [9. 哪些底层包是普通业务开发常见不到，但值得知道的？](#9-哪些底层包是普通业务开发常见不到但值得知道的)
  - [9.1. `vue/compiler-sfc`](#91-vuecompiler-sfc)
  - [9.2. `@vitejs/plugin-vue`](#92-vitejsplugin-vue)
  - [9.3. `vue-loader`](#93-vue-loader)
- [10. 引用](#10-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 在线演练
- 项目脚手架
- Vite 推荐
- CLI 定位
- IDE 支持
- DevTools
- 规范工具
- 底层包

## 2. 评价

工具链这一节很务实，几乎没有花哨概念，核心就是“怎么把 Vue 项目跑顺”。你最该掌握的是官方推荐路线：Vite + Vue - Official + DevTools + Vitest / ESLint / Prettier；像底层编译包、自定义块处理这类内容，先知道它们存在即可。

## 3. Vue 项目的工具链到底包含哪些东西？

在 Vue 语境里，工具链不只是“打包工具”。它通常是一整套开发支撑能力，包括：

- 在线演练环境
- 项目脚手架
- 构建与热更新
- IDE 智能提示与类型检查
- 浏览器调试插件
- 测试工具
- 代码规范与格式化
- 单文件组件编译支持

换句话说，工具链的目标不是只把项目 build 出来，而是让你从创建项目到调试、测试、提交代码这一整套流程都更顺。

## 4. 官方为什么优先推荐 Vite 和 create-vue？

官方对新项目的推荐路线很明确：优先用 Vite，通常从 `create-vue` 开始。

```sh
npm create vue@latest
```

这个命令背后会调用 `create-vue`，它是 Vue 官方提供的脚手架工具。

Vite 被推荐的原因主要有这些：

- 对 Vue 单文件组件有一等支持
- 启动和热更新速度很快
- 与现代 ES 模块开发方式贴合
- 和后续测试、类型检查、插件生态集成顺畅

如果你只是想快速试一段代码，官方还推荐先用在线环境：

- Vue SFC Playground
- StackBlitz 里的 Vue + Vite

这两个场景也很适合复现 bug 或分享最小 demo。

## 5. Vue CLI 现在是什么定位？

Vue CLI 不是不能用，而是已经进入维护模式。

官方态度也很清楚：

- 新项目优先用 Vite。
- 只有在你仍依赖某些特定 Webpack 能力时，才继续考虑 Vue CLI。

也就是说，Vue CLI 更像历史兼容方案，而不是新一代 Vue 项目的默认起点。

## 6. 为什么有“运行时版”和“完整版”之分？

这是很多人第一次碰构建工具时会忽略的问题。

如果你使用构建步骤，模板会在构建期被预编译，这时客户端只需要运行时能力，不需要把模板编译器一起带到浏览器里。

所以 Vue 会提供两类构建产物：

- 运行时版：只包含运行时，不包含模板编译器
- 完整版：包含运行时和模板编译器

官方默认工具链通常都会使用运行时版，因为体积更小。

如果你在浏览器里直接写模板字符串、DOM 内模板，才需要完整版本。否则，SFC 场景下几乎总是走预编译路线。

## 7. 日常开发最值得装的 IDE、调试和类型工具有哪些？

### 7.1. IDE

官方最推荐的是 VS Code + Vue - Official 扩展。

它提供：

- 模板表达式智能提示
- Props 类型提示
- TypeScript 支持
- SFC 语法服务

如果你以前装过 Vetur，做 Vue 3 项目时要记得禁用它，避免和 Vue - Official 冲突。

### 7.2. 浏览器调试

Vue DevTools 可以查看：

- 组件树
- 组件状态
- 状态管理事件
- 性能分析

这基本是排查 Vue 运行时问题的必备工具。

### 7.3. TypeScript 工具

即便你不重度使用 TS，也至少该知道两个关键工具：

- Vue - Official 扩展：编辑器内类型感知
- `vue-tsc`：命令行类型检查

后者很常用于 CI 或生产构建前的类型校验。

## 8. 测试、Lint、格式化和自定义块集成该怎么理解？

### 8.1. 测试

官方推荐路线基本是：

- `Vitest`：单元测试 / 组件测试
- `Cypress`：E2E 或组件测试
- `Jest`：仅在已有 Jest 资产时再考虑

### 8.2. 代码规范

Vue 团队维护了 `eslint-plugin-vue`，用于提供 SFC 相关的 ESLint 规则。

官方更推荐把 ESLint 当成独立工具链的一部分：

- IDE 内即时提示
- 提交前校验
- 构建前校验

而不是每次开 dev server 时顺手混进去。

### 8.3. 格式化

格式化层面最常见的是：

- Vue - Official 扩展自带格式化支持
- Prettier 统一全项目风格

### 8.4. 自定义块集成

SFC 不只有 `<template>`、`<script>`、`<style>`，还可以有自定义块。

如果你用 Vite，需要额外通过自定义 Vite 插件处理这些块；如果你走 webpack / Vue CLI 路线，就要配 loader。

这类能力更偏向工具开发或框架扩展，不是普通业务最常碰的内容，但值得知道它不是“Vue 自动全包”。

## 9. 哪些底层包是普通业务开发常见不到，但值得知道的？

官方在工具链页里特别提到了几个底层包：

### 9.1. `vue/compiler-sfc`

这是单文件组件编译能力的核心入口。普通业务开发一般不用手写调用它，但所有 SFC 工具链基本都依赖它。

### 9.2. `@vitejs/plugin-vue`

给 Vite 提供 Vue SFC 支持的官方插件。

### 9.3. `vue-loader`

给 webpack 提供 Vue SFC 支持的官方 loader。Vue CLI 背后常见的就是这一套。

知道这些包的意义在于：当你将来碰到构建问题、写插件、接自定义块能力时，你会知道问题大概落在哪一层。

## 10. 引用

- [Vue.js 官方文档 - 工具链][1]
- [Vite 官方文档][2]
- [Vue.js 官方文档 - TypeScript 总览][3]
- [Vue DevTools 文档][4]
- [eslint-plugin-vue][5]

[1]: https://cn.vuejs.org/guide/scaling-up/tooling.html
[2]: https://cn.vitejs.dev/
[3]: https://cn.vuejs.org/guide/typescript/overview.html
[4]: https://devtools.vuejs.org/
[5]: https://eslint.vuejs.org/
