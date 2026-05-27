---
name: 'TNotes.vue 项目维护规则'
description: '在处理 TNotes.vue 知识库文件时使用。覆盖 @tnotesjs/core 项目形态、默认维护范围、脚本边界、notes 目录约定和领域文档读取规则。'
applyTo:
  - 'notes/**'
  - 'todo/**'
  - 'README.md'
  - 'index.md'
  - 'sidebar.json'
  - '.tnotes.json'
  - 'package.json'
---

# TNotes.vue 项目维护规则

TNotes.vue 是基于 `@tnotesjs/core` 维护的 Vue 开源知识库项目，不是传统前端应用或后端服务项目。

## 默认维护范围

- 笔记写作、补全和修订任务默认只维护 `notes/{编号. 标题}/README.md`。
- 除非用户明确要求，不主动修改 demos、根目录索引、侧边栏、配置文件或脚本。
- 如果当前任务来自 `todo/*.md`，先根据 todo 内容定位对应笔记，再更新目标 README。

## 任务入口判断

- 用户要求 `outline`、大纲、规划或梳理知识点时，优先按 `note-outline` skill 处理。
- 用户要求 `write`、`writer`、撰写、补全或完成时，优先按 `note-write` skill 处理。
- 用户要求 `polish`、`polisher`、优化、修订、审查结果或 AI 审查时，优先按 `note-polish` skill 处理。
- 用户要求 `all`、完整流程或从大纲到定稿时，默认按“Outline -> Write -> Polish”顺序推进；除非用户明确要求一口气完成，否则每个阶段完成后先等待确认。
- 如果用户只说“完成”，根据当前活动文件、附件和上下文判断目标：当前文件是 `todo/*.md` 时，通常表示根据 todo 完成对应笔记；当前文件是 `notes/**/README.md` 时，通常表示直接补全或优化当前笔记；附件包含审查意见时，优先按修订任务处理。

## 生成内容边界

- `<!-- region:toc -->` 与 `<!-- endregion:toc -->` 之间的目录由 `@tnotesjs/core` 生成，不手写维护。
- `README.md`、`index.md`、`sidebar.json` 等索引类文件通常由项目脚本同步，除非任务明确要求，不手动调整。
- 不主动运行 `pnpm tn:update`、`pnpm tn:push`、`pnpm tn:pull` 等项目脚本；用户偏好自行执行后续更新和校验。

## 领域文档

- 项目事实、目录约定、维护边界和演进说明记录在 `docs/agents/knowledge-base.md`。
- 面向 Copilot 的领域文档布局说明记录在 `docs/agents/domain.md`。
- 当 Copilot 或 skill 需要项目背景时，读取这些领域文档，不在 skill 内复制项目描述。
