# Copilot 领域文档布局

本仓库采用面向知识库项目的单上下文布局：

```text
.
├── docs/
│   └── agents/
│       ├── domain.md            # 领域文档布局说明
│       └── knowledge-base.md    # TNotes.vue 项目知识库事实
├── notes/                       # 笔记主体
├── todo/                        # 待处理任务或审查意见
└── .github/                     # Copilot instructions、skills
```

## 文档分工

- `domain.md` 说明 Copilot 应如何查找和使用项目知识库文档。
- `knowledge-base.md` 记录当前仓库的项目形态、笔记目录约定、脚本边界和内容维护规则。
- `.github/instructions/private/*.instructions.md` 记录可通过 `applyTo` 自动应用的项目规则。
- `.github/skills/**/SKILL.md` 只记录可复用工作流，不记录项目事实。

## 使用方式

当任务涉及笔记写作、内容修订、todo 处理或 Copilot 工作流改造时，优先读取：

1. 适用的 `.github/instructions/**` 文件。
2. `docs/agents/knowledge-base.md` 中的项目事实。
3. 与当前任务相关的目标笔记或 todo 文件。

如果发现项目实际结构与领域文档冲突，应先按用户最新要求完成当前任务，再提醒用户是否同步更新领域文档。
