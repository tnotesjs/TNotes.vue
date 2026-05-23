---
name: 'Copilot 定制文件治理规则'
description: '在创建、重命名或重组 .github 下的 Copilot 定制文件时使用。覆盖入口导航、instructions、skills、agents 与项目知识库文档之间的分层边界。'
applyTo:
  - '.github/copilot-instructions.md'
  - '.github/instructions/**'
  - '.github/skills/**'
  - '.github/agents/**'
  - 'docs/agents/**'
---

# Copilot 定制文件治理规则

Copilot 定制文件指 `.github/` 目录下用于定义 Agent 行为、工作流和规则的文件，包括 `copilot-instructions.md`、`*.instructions.md`、`SKILL.md` 和 `*.agent.md`。

## 总入口

- `.github/copilot-instructions.md` 只作为导航入口和少量全局协议，不堆叠长篇规则。
- 入口文件负责索引通用指令、私有指令、技能、Agent 和项目知识库文档。
- 仓库特有事实、目录约定、领域词汇和长期背景写入项目知识库文档，不要写进入口文件。

## Instructions

- `.github/instructions/common/` 放可跨项目复用的规则，不写死当前仓库名称、业务目录或领域事实。
- `.github/instructions/private/` 放当前仓库专属规则，可通过 `applyTo` 精准限制到相关文件。
- 一份 instruction 只承担一个关注点；如果规则只对部分文件生效，应使用精确的 `applyTo` glob 限定适用范围。
- 长期约束、行文风格、格式规范、编辑边界优先写成 instruction，而不是 skill。

## Skills

- 每个 skill 独立目录，入口文件固定为 `SKILL.md`。
- Skill 是按需加载的能力或流程，不承担长期行为约束。
- Skill 应尽量可复用，不写入当前仓库的具体领域事实。
- 如果某段内容描述的是当前仓库的领域事实、目录结构或脚本边界，应迁移到项目知识库文档或 private instruction。

## Agents

- Agent 可以是项目专属的工作流编排入口。
- Agent 负责识别模式、组织阶段、说明使用哪些 instructions、skills 和领域文档。
- Agent 不重复大段规则正文，只引用对应文件并补充编排逻辑。

## 项目知识库文档

- 项目知识库文档用于记录当前仓库的领域事实、目录约定和长期背景。
- 具体文档路径由入口导航或 private instruction 定义，common 规则不绑定某个仓库的文件名。
- 当 skill 或 agent 需要理解项目事实时，读取项目知识库文档，而不是在自身文件中复制领域描述。
