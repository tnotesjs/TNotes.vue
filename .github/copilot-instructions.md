# GitHub Copilot

## 通用指令清单

| 通用指令 | 描述 |
| --- | --- |
| [governance](./instructions/common/governance.instructions.md) | Copilot 定制文件治理规则 |
| [workflow](./instructions/common/workflow.instructions.md) | 通用工作流规则 |

## 私有指令清单

| 私有指令 | 描述 |
| --- | --- |
| [note-writing](./instructions/private/note-writing.instructions.md) | `notes/**/README.md` 笔记写作规范 |
| [tnotes-project](./instructions/private/tnotes-project.instructions.md) | TNotes.vue 项目维护规则 |

## 技能清单

| 技能                                           | 描述               |
| ---------------------------------------------- | ------------------ |
| [note-outline](./skills/note-outline/SKILL.md) | 知识库笔记大纲技能 |
| [note-write](./skills/note-write/SKILL.md)     | 知识库笔记写作技能 |
| [note-polish](./skills/note-polish/SKILL.md)   | 知识库笔记修订技能 |

## 项目知识库

| domain 文档 | 描述 |
| --- | --- |
| [docs/agents/domain.md](../docs/agents/domain.md) | Copilot 领域文档布局 |
| [docs/agents/knowledge-base.md](../docs/agents/knowledge-base.md) | TNotes.vue 项目知识库事实 |

## 演进协议

当出现以下信号时，提醒用户可能需要更新相关信息：

1. 项目实际结构、脚本行为或笔记约定与 `docs/agents/**` 描述冲突。
2. 用户最新要求与 `.github/instructions/**` 中的长期规则冲突。
3. 某个 skill 中出现了项目领域事实、目录约定或写作规范，说明它应该迁移到领域文档或 instruction。

响应方式：指出冲突或覆盖缺口，给出建议修改位置，并询问是否需要同步更新对应文件。
