# [0064. TNotes.vue](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0064.%20TNotes.vue)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 TNotes.vue 知识库中都会记录哪些内容？](#3--tnotesvue-知识库中都会记录哪些内容)
- [4. 🤖 Prompt - 参考官方文档完成笔记编写](#4--prompt---参考官方文档完成笔记编写)
- [5. 🤖 Prompt - 精读笔记生成 DEMO](#5--prompt---精读笔记生成-demo)
- [6. 🤖 Prompt - 分析对话记录优化笔记内容](#6--prompt---分析对话记录优化笔记内容)
- [7. 🔗 引用](#7--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- [TNotes.vue][1] 知识库简介
- 可复用的一些 Prompt 模板

## 2. 🫧 评价

这篇笔记主要是对 TNotes.vue 知识库的简要介绍，以及一些全局性的内容。

## 3. 🤔 TNotes.vue 知识库中都会记录哪些内容？

- vue 的相关学习资料
- vue 的核心知识点
  - 属性
  - 事件
  - 模板语法
  - 指令
  - 组件
  - 生命周期
  - 响应式系统
  - 组合式 API
  - …… 其他核心概念
- vue 的生态
  - vue-router
  - pinia
  - vue-i18n
  - …… 其他生态库
- vue 的一些周边工具
  - vue-devtools
  - vue playground
  - …… 其他工具
- vue 的一些最佳实践
  - 组件设计
  - 状态管理
  - 性能优化
  - …… 其他最佳实践
- vue 的一些常见问题
  - 常见错误
  - 调试技巧
  - …… 其他常见问题
- vue 的一些面试题
- …… 其他与 vue 相关的内容

## 4. 🤖 Prompt - 参考官方文档完成笔记编写

::: tip 使用场景

创建好笔记的框架结构之后，提供对应的参考资料让 AI 学习，让 AI 来填充每一篇笔记的具体内容。

AI 填充完毕之后，再仔细阅读一篇，做一遍人工审查。

:::

```md
# 参考官方文档完成笔记编写

## References

<!-- 这一部分放参考资料供 AI 学习 -->

### 每篇笔记参考的官方文档

<!-- 这里列出每一篇需要完成的笔记对应的参考资料，如果笔记数量多过，可以将笔记内容分不同的批次，让 AI 分批次完成 -->

- 第一批：逻辑复用
  - `notes/0088. 组合式函数/README.md` - https://cn.vuejs.org/guide/reusability/composables.html
  - `notes/0090. 自定义指令/README.md` - https://cn.vuejs.org/guide/reusability/custom-directives.html
  - `notes/0089. 插件/README.md` - https://cn.vuejs.org/guide/reusability/plugins.html
- 第二批：内置组件
  - `notes/0095. Transition/README.md` - https://cn.vuejs.org/guide/built-ins/transition.html
  - `notes/0094. TransitionGroup/README.md` - https://cn.vuejs.org/guide/built-ins/transition-group.html
  - `notes/0093. KeepAlive/README.md` - https://cn.vuejs.org/guide/built-ins/keep-alive.html
  - `notes/0092. Teleport/README.md` - https://cn.vuejs.org/guide/built-ins/teleport.html
  - `notes/0091. Suspense/README.md` - https://cn.vuejs.org/guide/built-ins/suspense.html
- 第三批：应用规模化
  - `notes/0096. 单文件组件/README.md` - https://cn.vuejs.org/guide/scaling-up/sfc.html
  - `notes/0097. 工具链/README.md` - https://cn.vuejs.org/guide/scaling-up/tooling.html
  - `notes/0098. 路由/README.md` - https://cn.vuejs.org/guide/scaling-up/routing.html
  - `notes/0099. 状态管理/README.md` - https://cn.vuejs.org/guide/scaling-up/state-management.html
  - `notes/0100. 测试/README.md` - https://cn.vuejs.org/guide/scaling-up/testing.html
  - `notes/0101. 服务端渲染（SSR）/README.md` - https://cn.vuejs.org/guide/scaling-up/ssr.html

### 学习已完成的笔记风格

<!-- 这里列出一些已完成的笔记，让 AI 学习具体的笔记风格 -->

- `notes/0070. 创建一个应用/README.md`
- `notes/0025. 模板语法与指令/README.md`
- `notes/0027. 响应式基础/README.md`
- `notes/0028. 计算属性（computed）/README.md`
- `notes/0029. Class 与 Style 绑定/README.md`

注意：不需要管已完成笔记中的 demos.xxx 这些内容是笔者在自行审查笔记内容时手动创建的一些示例。

## TODO

### 需要编写的笔记

<!-- 这里具体列出具体需要完成的笔记，结构和上述「每篇笔记参考的官方文档」一致 -->

- 第一批：逻辑复用
  - `notes/0088. 组合式函数/README.md`
  - `notes/0090. 自定义指令/README.md`
  - `notes/0089. 插件/README.md`
- 第二批：内置组件
  - `notes/0095. Transition/README.md`
  - `notes/0094. TransitionGroup/README.md`
  - `notes/0093. KeepAlive/README.md`
  - `notes/0092. Teleport/README.md`
  - `notes/0091. Suspense/README.md`
- 第三批：应用规模化
  - `notes/0066. 应用规模化/README.md`
  - `notes/0096. 单文件组件/README.md`
  - `notes/0097. 工具链/README.md`
  - `notes/0098. 路由/README.md`
  - `notes/0099. 状态管理/README.md`
  - `notes/0100. 测试/README.md`
  - `notes/0101. 服务端渲染（SSR）/README.md`

笔记内容的具体要求：

- 先阅读官方文档，提炼出每篇文档的核心知识点，在完成的笔记中必需涵盖这些核心知识点。
- 可以在文档核心知识点的基础上适当补充一些高度相关的问题，但不要过度扩展。

### 最终审查阶段

- 正确性检查：审查每一篇完成的笔记，禁止出现事实错误，一旦发现错误的描述必需修改正确。
- 风格对齐：根据 `note-standards` 的规范编写每篇笔记的 README.md，内容要准确、清晰、有条理，示例要简洁、完整。你可以自行按需查阅已完成的笔记的风格，对需要审查的笔记的内容进行审查，完成笔记的风格对齐。
```

## 5. 🤖 Prompt - 精读笔记生成 DEMO

::: tip 使用场景

在笔记完成之后让 AI 来根据笔记的核心知识点快速生成一些 DEMO 示例。

:::

````md
# 精读笔记生成 DEMO

笔记内容：

<!-- 在此复制笔记内容 -->

---

要求：

- 精读这篇笔记，提炼出笔记中的核心知识点
- 一个核心知识点生成一个 DEMO
- 高频核心知识点排在前面，低频核心知识点排在后面
- 每个 DEMO 由若干个 SFC 文件组成，App.vue 和 {compName}.vue，其中 compName 你可以自定义
- 每个 DEMO 的 SFC 数量要求尽量少，能用一个介绍清楚知识点就用一个，如果涉及到组件通信，需要多个组件才能介绍清楚，也不要超过三个
- 每个 DEMO 要求可以在 Vue Playground 中在线测试
- DEMO 的样式不要太重，能不需要样式就不要使用样式，除非样式是知识点的一部分
- DEMO 中不允许出现对外部 API 的依赖，如果需要模拟一些数据，可以直接在组件中写死一些 mock 数据，利用 setTimeout 模拟异步请求的时机
- 知识点的解释说明直接通过注释的形式写入到示例中，不要啰嗦，精简明了地解释每个知识点的核心概念和关键细节
- 具体格式要求：

## 💻 demos.1 - 知识点 1 的名称

::: code-group

```html [App.vue]
<!-- App.vue 的内容 -->
```

```html [OtherComp.vue]
<!-- OtherComp.vue 的内容 -->
```

:::

## 💻 demos.2 - 知识点 2 的名称

::: code-group

```html [App.vue]
<!-- App.vue 的内容 -->
```

```html [OtherComp.vue]
<!-- OtherComp.vue 的内容 -->
```

:::

## 💻 ...

## 💻 demos.n - 知识点 n 的名称

::: code-group

```html [App.vue]
<!-- App.vue 的内容 -->
```

```html [OtherComp.vue]
<!-- OtherComp.vue 的内容 -->
```

:::
````

## 6. 🤖 Prompt - 分析对话记录优化笔记内容

::: tip 使用场景

在阅读具体的笔记时，向 AI 提出一些关于笔记内容的问题，并将这些内容记录到文档中，让 AI 来分析对话的内容完成对笔记的优化工作。

:::

````md
# 分析对话记录优化笔记内容

## 需要优化的笔记

- `notes/0083. 组件注册/README.md`

## 需求

- 这一部分存放着我在阅读这篇笔记时遇到的一些问题，下面「问题列表」中记录了我和 AI 的一些对话内容
- 你的工作是分析对话内容，提取出合理的点，完成笔记的优化工作

## 问题列表

<!-- 如果你用的对话工具支持将聊天内容导出，直接将导出的内容丢到这里即可。如果你想要 pick 特定的对话记录，也可以将聊天内容手动记录到这里。 -->

### Q - 1

<!-- 你发送的内容 -->

```md
<!-- AI 的回复 -->
```

### Q - 2

<!-- 你发送的内容 -->

```md
<!-- AI 的回复 -->
```

### Q - {n}

<!-- 你发送的内容 -->

```md
<!-- AI 的回复 -->
```
````

## 7. 🔗 引用

- [TNotes.vue 知识库对应的 github 仓库][1]

[1]: https://github.com/tnotesjs/TNotes.vue
