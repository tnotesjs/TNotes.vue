# TNotes.vue 项目知识库

## 项目定位

TNotes.vue 是基于 `@tnotesjs/core` 维护的 Vue 开源知识库。仓库主体不是业务应用代码，而是一组围绕 Vue 生态整理的学习笔记。

## 内容主体

- 笔记文件位于 `notes/{编号. 标题}/README.md`。
- 每篇笔记通常围绕一个 Vue 主题展开，例如响应式、组件、指令、路由、状态管理、SSR、性能优化等。
- 笔记目录下可能包含 `demos/`，用于承载与正文对应的示例代码。
- `todo/` 用于记录待完成笔记、审查意见或后续修订线索。

## 笔记维护事实

- 默认写作目标通常是单篇 `notes/**/README.md`。
- 单篇笔记的结构性区块包括“本节内容”、“评价”、“正文小节”和“引用”。
- demo、现有正文、todo 和官方文档通常是笔记写作时的辅助资料。
- 示例代码、输出结果、截图描述和正文解释需要保持一致。

## 自动生成区域

- 笔记中的 TOC 区域由 `@tnotesjs/core` 生成。
- 根目录 `README.md`、`index.md`、`sidebar.json` 与笔记完成状态可能需要通过 `tnotes` 脚本同步。

## 常用脚本

项目脚本位于 `package.json`，核心命令包括：

- `pnpm tn:dev`：启动本地预览。
- `pnpm tn:update`：同步目录、索引或元信息。
- `pnpm tn:push`：执行项目封装的推送流程。
- `pnpm tn:pull`：执行项目封装的拉取流程。

脚本的执行边界由 `.github/instructions/private/tnotes-project.instructions.md` 约束。
