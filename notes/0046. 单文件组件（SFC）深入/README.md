# [0046. 单文件组件（SFC）深入](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0046.%20%E5%8D%95%E6%96%87%E4%BB%B6%E7%BB%84%E4%BB%B6%EF%BC%88SFC%EF%BC%89%E6%B7%B1%E5%85%A5)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 template、script、style 标签有哪些高级用法？](#3--templatescriptstyle-标签有哪些高级用法)
- [4. 🤔 Scoped CSS 和 CSS Modules 有什么区别？如何选择？](#4--scoped-css-和-css-modules-有什么区别如何选择)
- [5. 🤔 深度作用选择器 :deep() 在什么场景使用？](#5--深度作用选择器-deep-在什么场景使用)
- [6. 🤔 v-bind() 在 CSS 中如何实现状态驱动的动态样式？](#6--v-bind-在-css-中如何实现状态驱动的动态样式)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- template、script、style 标签的高级用法
- Scoped CSS 与 CSS Modules
- 深度作用选择器（:deep）
- 状态驱动的动态 CSS（v-bind in CSS）

## 2. 🫧 评价

- todo

## 3. 🤔 template、script、style 标签有哪些高级用法？

Vue 单文件组件（SFC）的三个核心标签都支持一些高级特性，充分利用它们可以提升开发效率和代码组织。

template 标签的高级用法：

```html
<!-- 可以指定模板语言（需要对应的编译器支持） -->
<template lang="pug">
  div.container h1 {{ title }} p.content {{ message }}
  button(@click="handleClick") 点击
</template>

<!-- 使用 src 引入外部模板文件 -->
<template src="./MyComponent.html"></template>
```

script 标签的高级用法：

```html
<!-- TypeScript 支持 -->
<script setup lang="ts">
  import { ref } from 'vue'

  const count = ref<number>(0)
</script>

<!-- JSX/TSX 支持 -->
<script lang="tsx">
  import { defineComponent, ref } from 'vue'

  export default defineComponent({
    setup() {
      const count = ref(0)
      return () => <div>{count.value}</div>
    },
  })
</script>

<!-- 使用 src 引入外部脚本 -->
<script src="./MyComponent.ts" lang="ts"></script>

<!-- 同时使用普通 script 和 script setup -->
<script lang="ts">
  export default {
    name: 'MyComponent',
    inheritAttrs: false,
  }
</script>

<script setup lang="ts">
  // defineOptions 是更简洁的替代方式（Vue 3.3+）
  defineOptions({
    name: 'MyComponent',
    inheritAttrs: false,
  })
</script>
```

style 标签的高级用法：

```html
<!-- 支持多种预处理器 -->
<style lang="scss">
  $primary: #42b883;
  .container {
    color: $primary;
  }
</style>

<style lang="less">
  @primary: #42b883;
  .container {
    color: @primary;
  }
</style>

<!-- 可以有多个 style 标签 -->
<style>
  /* 全局样式 */
  body {
    margin: 0;
  }
</style>

<style scoped>
  /* 组件作用域样式 */
  .container {
    padding: 20px;
  }
</style>

<!-- 使用 src 引入外部样式 -->
<style src="./MyComponent.scss" lang="scss" scoped></style>
```

一个 SFC 中可以包含自定义块（Custom Blocks），配合对应的 Vite 插件来处理：

```html
<!-- 自定义块：国际化 -->
<i18n lang="json">
  { "zh-CN": { "hello": "你好" }, "en": { "hello": "Hello" } }
</i18n>

<!-- 自定义块：文档 -->
<docs> # MyComponent 这个组件用于展示... </docs>
```

## 4. 🤔 Scoped CSS 和 CSS Modules 有什么区别？如何选择？

Scoped CSS 和 CSS Modules 都是 Vue SFC 中实现样式隔离的方案，但实现原理和使用方式不同。

Scoped CSS 通过给组件的 DOM 元素和对应的 CSS 选择器添加唯一的 data 属性来实现样式隔离：

```html
<template>
  <div class="container">
    <p class="text">Hello</p>
  </div>
</template>

<style scoped>
  .container {
    padding: 20px;
  }
  .text {
    color: red;
  }
</style>

<!-- 编译后的 DOM -->
<!-- <div class="container" data-v-7ba5bd90>
       <p class="text" data-v-7ba5bd90>Hello</p>
     </div> -->

<!-- 编译后的 CSS -->
<!-- .container[data-v-7ba5bd90] { padding: 20px; }
     .text[data-v-7ba5bd90] { color: red; } -->
```

Scoped CSS 的注意事项：

```html
<style scoped>
  /* 子组件的根元素会同时拥有父组件和子组件的 data 属性 */
  /* 所以父组件的 scoped 样式可以影响子组件的根元素 */

  /* 如果需要影响子组件内部的元素，使用 :deep() */
  .parent :deep(.child-class) {
    color: blue;
  }

  /* 如果需要影响插槽内容，使用 :slotted() */
  :slotted(.slot-content) {
    font-size: 14px;
  }

  /* 如果需要创建全局样式（在 scoped 中），使用 :global() */
  :global(.global-class) {
    margin: 0;
  }
</style>
```

CSS Modules 是通过将 CSS 类名映射为唯一的哈希名来实现隔离的。在 Vue SFC 中使用 module 属性来启用：

```html
<template>
  <!-- 通过 $style 对象访问类名 -->
  <div :class="$style.container">
    <p :class="$style.text">Hello</p>

    <!-- 多个类名 -->
    <p :class="[$style.text, $style.bold]">World</p>

    <!-- 条件类名 -->
    <p :class="{ [$style.active]: isActive }">Active</p>
  </div>
</template>

<style module>
  .container {
    padding: 20px;
  }
  .text {
    color: red;
  }
  .bold {
    font-weight: bold;
  }
  .active {
    background: yellow;
  }
</style>

<!-- 编译后的类名变为哈希：container_abc123、text_def456 等 -->
```

CSS Modules 也支持命名模块：

```html
<template>
  <p :class="classes.red">Red</p>
</template>

<!-- 命名为 classes 而不是默认的 $style -->
<style module="classes">
  .red {
    color: red;
  }
</style>
```

在 script setup 中可以通过 useCssModule 访问：

```html
<script setup>
  import { useCssModule } from 'vue'

  const $style = useCssModule()
  // 命名模块：useCssModule('classes')
</script>
```

两者的区别：

| 特性     | Scoped CSS               | CSS Modules          |
| -------- | ------------------------ | -------------------- |
| 实现原理 | 属性选择器 [data-v-xxx]  | 类名哈希化           |
| 使用方式 | 直接写类名               | 通过 $style 对象绑定 |
| 隔离程度 | 中（标签选择器仍可泄漏） | 高（完全隔离）       |
| 学习成本 | 低                       | 中                   |
| 动态类名 | 简单                     | 稍复杂               |

选择建议：大多数 Vue 项目使用 Scoped CSS 即可，它简单直观。如果你需要更严格的样式隔离、或在 JS 中动态操作样式，CSS Modules 更合适。

## 5. 🤔 深度作用选择器 :deep() 在什么场景使用？

当使用 Scoped CSS 时，样式只作用于当前组件的元素。但有时你需要从父组件修改子组件内部的样式（比如覆盖第三方组件库的样式），这时就需要深度作用选择器 :deep()。

在 Vue 3 中，标准写法是 :deep()：

```html
<template>
  <div class="parent">
    <ChildComponent />
    <el-input v-model="value" />
  </div>
</template>

<style scoped>
  /* 不使用 :deep()：只能影响子组件的根元素 */
  .parent .child-inner {
    /* 不生效，因为 .child-inner 没有当前组件的 data 属性 */
    color: red;
  }

  /* 使用 :deep()：可以影响子组件内部的元素 */
  .parent :deep(.child-inner) {
    color: red; /* 生效 */
  }

  /* 覆盖 Element Plus 组件的样式 */
  .parent :deep(.el-input__inner) {
    border-color: #42b883;
    font-size: 16px;
  }

  /* 覆盖整个子组件树 */
  :deep(.el-table) {
    .el-table__header {
      background: #f5f5f5;
    }
    .el-table__row {
      &:hover {
        background: #e8f5e9;
      }
    }
  }
</style>
```

:deep() 的编译原理：

```css
/* 源码 */
.parent :deep(.child-class) {
  color: red;
}

/* 编译后 */
.parent[data-v-xxx] .child-class {
  color: red;
}
/* data 属性被放在了 .parent 上，而不是 .child-class 上 */
/* 所以可以匹配到子组件内部的 .child-class */
```

Vue 2 中使用 >>> 或 /deep/ 或 ::v-deep，Vue 3 中统一使用 :deep()。

常见使用场景：

```html
<style scoped>
  /* 场景一：覆盖 UI 库的弹窗样式 */
  :deep(.el-dialog) {
    border-radius: 12px;
  }
  :deep(.el-dialog__header) {
    background: #42b883;
    color: white;
  }

  /* 场景二：修改 Markdown 渲染后的样式 */
  .markdown-content :deep(h1) {
    font-size: 24px;
    border-bottom: 1px solid #eee;
  }
  .markdown-content :deep(code) {
    background: #f5f5f5;
    padding: 2px 4px;
  }

  /* 场景三：覆盖子组件的过渡动画 */
  :deep(.fade-enter-active),
  :deep(.fade-leave-active) {
    transition: opacity 0.3s;
  }
</style>
```

使用 :deep() 时要注意：过度使用深度选择器会破坏组件的样式封装性，增加组件间的耦合。如果你发现自己频繁使用 :deep()，可能需要考虑：子组件是否应该通过 props 或 CSS 变量来支持样式定制。

## 6. 🤔 v-bind() 在 CSS 中如何实现状态驱动的动态样式？

Vue 3.2 引入了在 style 标签中使用 v-bind() 的能力，可以直接将组件的响应式状态绑定到 CSS 属性上，实现真正的状态驱动样式。

```html
<script setup>
  import { ref } from 'vue'

  const color = ref('#42b883')
  const fontSize = ref(16)
  const theme = ref({
    bg: '#ffffff',
    text: '#333333',
    border: '#e0e0e0',
  })
</script>

<template>
  <div class="card">
    <h2>动态样式示例</h2>
    <p>这段文字的颜色和大小是动态的</p>

    <input type="color" v-model="color" />
    <input type="range" v-model="fontSize" min="12" max="32" />
  </div>
</template>

<style scoped>
  .card {
    /* 直接绑定 ref 的值 */
    color: v-bind(color);
    font-size: v-bind(fontSize + 'px');

    /* 绑定对象属性（需要引号） */
    background: v-bind('theme.bg');
    border: 1px solid v-bind('theme.border');

    padding: 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
  }
</style>
```

v-bind() in CSS 的实现原理：编译时会将 v-bind() 表达式提取出来，在运行时通过 CSS 自定义属性（CSS Variables）来实现动态更新。编译后的 CSS 大致如下：

```css
/* 编译后 */
.card[data-v-xxx] {
  color: var(--xxx-color);
  font-size: var(--xxx-fontSize);
}
```

Vue 会在组件挂载和数据更新时，动态设置这些 CSS 变量的值。

实际应用场景：

```html
<!-- 场景一：主题切换 -->
<script setup>
  import { reactive } from 'vue'

  const themes = {
    light: { bg: '#fff', text: '#333', primary: '#42b883' },
    dark: { bg: '#1a1a1a', text: '#eee', primary: '#5bd99a' },
  }

  const currentTheme = reactive({ ...themes.light })

  function toggleTheme(name) {
    Object.assign(currentTheme, themes[name])
  }
</script>

<style scoped>
  .app {
    background: v-bind('currentTheme.bg');
    color: v-bind('currentTheme.text');
  }
  .btn-primary {
    background: v-bind('currentTheme.primary');
  }
</style>
```

```html
<!-- 场景二：可拖拽调整大小的面板 -->
<script setup>
  import { ref } from 'vue'

  const panelWidth = ref(300)
  const panelHeight = ref(200)

  function onDrag(e) {
    panelWidth.value = e.clientX
    panelHeight.value = e.clientY
  }
</script>

<style scoped>
  .panel {
    width: v-bind(panelWidth + 'px');
    height: v-bind(panelHeight + 'px');
    overflow: auto;
    resize: both;
  }
</style>
```

```html
<!-- 场景三：进度条动画 -->
<script setup>
  import { ref } from 'vue'

  const progress = ref(0)

  function start() {
    const timer = setInterval(() => {
      progress.value += 1
      if (progress.value >= 100) clearInterval(timer)
    }, 50)
  }
</script>

<style scoped>
  .progress-bar {
    width: v-bind(progress + '%');
    height: 8px;
    background: linear-gradient(90deg, #42b883, #35495e);
    border-radius: 4px;
    transition: width 0.1s linear;
  }
</style>
```

v-bind() in CSS 的优势在于：将样式逻辑保留在 style 标签中（而不是用行内 style 绑定），保持了模板的整洁，同时支持所有 CSS 特性（如媒体查询、伪元素等）。需要注意的是，每次响应式数据变化时都会更新 CSS 变量，所以频繁变化的场景（如动画）要考虑性能影响。
