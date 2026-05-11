# [0104. 无障碍访问](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0104.%20%E6%97%A0%E9%9A%9C%E7%A2%8D%E8%AE%BF%E9%97%AE)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是无障碍访问，为什么它不是“锦上添花”？](#3--什么是无障碍访问为什么它不是锦上添花)
- [4. 🤔 单页应用里最容易忽略的导航可访问性问题是什么？](#4--单页应用里最容易忽略的导航可访问性问题是什么)
- [5. 🤔 页面结构应该怎样写，辅助技术才更容易理解？](#5--页面结构应该怎样写辅助技术才更容易理解)
  - [5.1. 标题必须按层级组织](#51-标题必须按层级组织)
  - [5.2. 用 Landmark 帮助快速导航](#52-用-landmark-帮助快速导航)
- [6. 🤔 表单可访问性为什么总是最容易出问题？](#6--表单可访问性为什么总是最容易出问题)
  - [6.1. 每个输入项都应该有可访问名称](#61-每个输入项都应该有可访问名称)
  - [6.2. 需要时补充 `aria-label`、`aria-labelledby`、`aria-describedby`](#62-需要时补充-aria-labelaria-labelledbyaria-describedby)
  - [6.3. 不要把 placeholder 当标签用](#63-不要把-placeholder-当标签用)
  - [6.4. 输入说明也要和字段关联](#64-输入说明也要和字段关联)
- [7. 🤔 隐藏内容、按钮和功能图标该怎么处理才安全？](#7--隐藏内容按钮和功能图标该怎么处理才安全)
  - [7.1. 视觉隐藏不等于语义隐藏](#71-视觉隐藏不等于语义隐藏)
  - [7.2. `aria-hidden="true"` 只给装饰性内容](#72-aria-hiddentrue-只给装饰性内容)
  - [7.3. 按钮必须声明类型](#73-按钮必须声明类型)
  - [7.4. 图标按钮要有可访问名称](#74-图标按钮要有可访问名称)
- [8. 🤔 做 Vue 项目时，至少该知道哪些规范和测试工具？](#8--做-vue-项目时至少该知道哪些规范和测试工具)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- a11y 定义
- 跳过链接
- 焦点管理
- 标题结构
- Landmark
- 表单语义
- ARIA 用法
- 规范与测试

## 2. 🫧 评价

无障碍访问这篇官方文档很长，但落地重点其实很集中：路由切换后的焦点管理、语义化结构、表单标签、ARIA 辅助信息，以及不要用视觉习惯代替语义。它不是专门给残障用户看的“额外功能”，而是让更多人能稳定使用你的页面。

## 3. 🤔 什么是无障碍访问，为什么它不是“锦上添花”？

Web 无障碍访问（a11y）指的是让网站能够被更多人正常使用，包括但不限于：

- 视觉障碍用户
- 听觉障碍用户
- 运动能力受限用户
- 认知障碍用户
- 临时处于弱网、强光、噪音等不便环境中的用户

也就是说，无障碍访问不是“只服务一小部分人”，而是让产品在更多真实使用场景里可用。

## 4. 🤔 单页应用里最容易忽略的导航可访问性问题是什么？

最典型的问题是：路由切换后，键盘焦点没有被正确重置。

官方首先建议在页面顶部添加“跳过链接”，让键盘用户可以直接跳到主内容区：

```vue
<span ref="backToTop" tabindex="-1" />
<ul class="skip-links">
  <li>
    <a href="#main" class="skip-link">Skip to main content</a>
  </li>
</ul>
```

在使用 `vue-router` 时，还应在路由变化后把焦点移回页面顶部锚点：

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const backToTop = ref()

watch(
  () => route.path,
  () => {
    backToTop.value.focus()
  },
)
</script>
```

这是单页应用比多页站更容易漏掉的一步。

## 5. 🤔 页面结构应该怎样写，辅助技术才更容易理解？

### 5.1. 标题必须按层级组织

官方建议：

- 用真实的 `<h1>` 到 `<h6>`
- 不要只靠样式把普通文本伪装成标题
- 不要在同一章节里跳级

```vue
<main role="main" aria-labelledby="main-title">
  <h1 id="main-title">Main title</h1>

  <section aria-labelledby="section-title-1">
    <h2 id="section-title-1">Section Title</h2>
    <h3>Section Subtitle</h3>
  </section>
</main>
```

### 5.2. 用 Landmark 帮助快速导航

辅助技术用户常会依靠 landmark 在页面里跳转，所以要理解这些语义区域：

- `header` / `role="banner"`
- `nav` / `role="navigation"`
- `main` / `role="main"`
- `footer` / `role="contentinfo"`
- `aside` / `role="complementary"`
- `search` / `role="search"`
- `form` / `role="form"`
- `section` / `role="region"`，但要提供 label

重点不是“把所有 role 都写满”，而是让页面结构可被辅助技术正确理解。

## 6. 🤔 表单可访问性为什么总是最容易出问题？

因为表单往往既有视觉设计要求，又有语义要求，最容易被为了“好看”而破坏。

### 6.1. 每个输入项都应该有可访问名称

最基础的做法就是显式关联 `label` 和 `id`：

```vue
<label for="name">Name:</label>
<input id="name" name="name" type="text" v-model="name" />
```

### 6.2. 需要时补充 `aria-label`、`aria-labelledby`、`aria-describedby`

- `aria-label`：直接提供名称
- `aria-labelledby`：引用页面上已有可见文本作为名称
- `aria-describedby`：补充说明文字

```vue
<input
  id="name"
  v-model="name"
  aria-labelledby="billing name"
  aria-describedby="nameDescription"
/>
<p id="nameDescription">Please provide first and last name.</p>
```

### 6.3. 不要把 placeholder 当标签用

官方明确提醒：避免用 placeholder 代替标签。它既容易让人困惑，也常常达不到对比度要求。

### 6.4. 输入说明也要和字段关联

说明文字不要只放在旁边让用户“自己看懂”，而应通过 `aria-labelledby` 或 `aria-describedby` 和具体输入项关联起来。

## 7. 🤔 隐藏内容、按钮和功能图标该怎么处理才安全？

### 7.1. 视觉隐藏不等于语义隐藏

如果只是想视觉上隐藏文本，但仍让屏幕阅读器读到，应使用视觉隐藏样式，而不是 `display: none`。

```css
.hidden-visually {
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
  margin: 0;
  padding: 0;
  height: 1px;
  width: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
}
```

### 7.2. `aria-hidden="true"` 只给装饰性内容

官方提醒不要把它用在可聚焦元素上。它更适合：

- 重复内容
- 纯装饰内容
- 屏幕外内容

### 7.3. 按钮必须声明类型

在表单里写按钮时要显式声明 `type`，避免意外触发表单提交：

```vue
<button type="button">Cancel</button>
<button type="submit">Submit</button>
```

### 7.4. 图标按钮要有可访问名称

如果按钮主要靠图标表达意义，图标本身可以 `aria-hidden="true"`，但按钮还要提供可读文本：

```vue
<button type="submit">
  <i class="fas fa-search" aria-hidden="true"></i>
  <span class="hidden-visually">Search</span>
</button>
```

## 8. 🤔 做 Vue 项目时，至少该知道哪些规范和测试工具？

官方把规范重点放在两个方向：

- WCAG
- WAI-ARIA

其中 WCAG 2.1 的四大原则是：

- 可感知
- 可操作
- 可理解
- 健壮

日常检查工具可以先从这些开始：

- Lighthouse
- WAVE
- ARC Toolkit
- WebAIM Color Contrast Checker
- HeadingMap

另外，自动化检查只能发现一部分问题。真正要做得可靠，仍然要结合：

- 键盘操作测试
- 屏幕阅读器测试
- 真实内容和真实流程走查

## 9. 🔗 引用

- [Vue.js 官方文档 - 无障碍访问][1]
- [WCAG 2.1][2]
- [WAI-ARIA 1.2][3]
- [WAI-ARIA Authoring Practices 1.2][4]
- [WebAIM Contrast Checker][5]

[1]: https://cn.vuejs.org/guide/best-practices/accessibility.html
[2]: https://www.w3.org/TR/WCAG21/
[3]: https://www.w3.org/TR/wai-aria-1.2/
[4]: https://www.w3.org/TR/wai-aria-practices-1.2/
[5]: https://webaim.org/resources/contrastchecker/
