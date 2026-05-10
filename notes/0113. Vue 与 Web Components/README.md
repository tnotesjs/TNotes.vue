# [0113. Vue 与 Web Components](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0113.%20Vue%20%E4%B8%8E%20Web%20Components)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 在 Vue 应用里使用自定义元素时，最容易踩哪些坑？](#3--在-vue-应用里使用自定义元素时最容易踩哪些坑)
- [4. 🤔 怎样用 Vue 自己来构建 Web Components？](#4--怎样用-vue-自己来构建-web-components)
- [5. 🤔 TypeScript、组件库发布和跨框架复用要注意什么？](#5--typescript组件库发布和跨框架复用要注意什么)
- [6. 🤔 Web Components 能不能直接替代 Vue 组件模型？](#6--web-components-能不能直接替代-vue-组件模型)
- [7. 🔗 引用](#7--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- isCustomElement
- DOM property
- defineCustomElement
- shadow DOM
- `.ce.vue`
- 类型支持
- 组件库分发
- 边界与限制

## 2. 🫧 评价

这一节最有价值的地方，在于把“Vue 支持 Web Components”和“Vue 应该全面退回原生组件模型”这两件事分开。官方立场很明确：两者是互补关系。Vue 非常适合消费和生产自定义元素，但这不代表 Web Components 足以替代 Vue 自身更高层的组件系统。

## 3. 🤔 在 Vue 应用里使用自定义元素时，最容易踩哪些坑？

官方首先强调，Vue 在 Custom Elements Everywhere 测试中拿到了 100% 分，说明它对自定义元素支持很好。但有几个关键点必须明确。

### 3.1. 要显式跳过组件解析

默认情况下，Vue 会优先把未知标签当成 Vue 组件，而不是原生自定义元素。因此你要通过 `compilerOptions.isCustomElement` 告诉编译器哪些标签应该跳过组件解析。

例如在 Vite 中：

```js
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-'),
        },
      },
    }),
  ],
}
```

这是编译时选项，所以使用构建工具时必须配在构建配置里。

### 3.2. 复杂数据通常应该走 DOM property

自定义元素的 attribute 本质上只能是字符串，因此传对象或数组时，通常更应该走 DOM property。

Vue 3 会先通过 `in` 检查元素实例上是否存在对应属性，如果存在，就优先按 DOM property 设置。个别场景下如果检查失败，可以强制使用 `.prop`：

```vue
<my-element :user.prop="{ name: 'jack' }"></my-element>
```

## 4. 🤔 怎样用 Vue 自己来构建 Web Components？

### 4.1. `defineCustomElement`

Vue 提供了 `defineCustomElement()`，它和 `defineComponent()` 很像，但返回的是继承自 `HTMLElement` 的构造器。

```js
import { defineCustomElement } from 'vue'

const MyElement = defineCustomElement({
  props: {
    selected: Boolean,
    index: Number,
  },
  emits: ['change'],
  template: `<button @click="$emit('change', index)">click</button>`,
  styles: [`button { color: tomato; }`],
})

customElements.define('my-element', MyElement)
```

### 4.2. 生命周期、props、事件和插槽

它的行为有几条重要规则：

- `connectedCallback` 首次调用时，内部会挂载 Vue 组件实例到 shadow root
- `disconnectedCallback` 之后，Vue 会在一个微任务后判断这是“移动”还是“移除”
- 基础类型 props 会在 attribute 和 property 之间自动反射与转换
- 组件里用 `emit` 触发的事件，会以 `CustomEvent` 形式从自定义元素上派发

插槽方面也要注意：

- 使用时要遵循原生 slot 语法
- 具名插槽使用 `slot` attribute，而不是 `v-slot`
- 不支持作用域插槽

`provide` / `inject` 也能工作，但只在 Vue 定义的自定义元素之间生效，不能指望它跨普通 Vue 组件树和自定义元素树随意穿透。

### 4.3. `.ce.vue` 和样式注入

如果用单文件组件来写自定义元素，官方工具链支持把 `.ce.vue` 视为“自定义元素模式”导入。

这样 SFC 里的样式会以内联 CSS 字符串形式暴露到 `styles` 选项，再由 `defineCustomElement()` 注入到 shadow root：

```js
import { defineCustomElement } from 'vue'
import Example from './Example.ce.vue'

const ExampleElement = defineCustomElement(Example)
customElements.define('my-example', ExampleElement)
```

从 Vue 3.5 开始，还可以通过 `configureApp` 给自定义元素内部应用实例做应用级配置。

## 5. 🤔 TypeScript、组件库发布和跨框架复用要注意什么？

### 5.1. TypeScript 类型支持

自定义元素是通过浏览器原生 API 全局注册的，所以 Vue 模板默认并不知道它们的类型。官方推荐通过扩充 `GlobalComponents` 来给 Vue SFC 模板补上类型信息。

如果这个元素本来就是由 Vue 组件转来的，那么要把“原始 Vue 组件类型”注册进去，而不是自定义元素构造器类型。

### 5.2. 组件库发布

如果你要基于 Vue 发布一组自定义元素，官方建议：

- 按元素分别导出构造器
- 再额外提供一个批量注册函数
- 如果宿主本身也用 Vue，可以考虑把 Vue 设为 external，复用宿主的那一份运行时

同时也要认识到，Vue 运行时本身会带来基础体积成本。如果你只想发一个非常小的自定义元素，这未必是最划算的方案；但如果是一组逻辑复杂的元素，Vue 的开发效率和复用能力就会开始体现优势。

## 6. 🤔 Web Components 能不能直接替代 Vue 组件模型？

官方明确不认同“全部改成自定义元素就能永不过时”这种说法。

原因是 Web Components 提供的是更底层的标准能力，而不是完整应用框架。要真正支撑复杂应用，你仍然需要：

- 高效的声明式模板系统
- 成熟的响应式状态模型
- 组件组合机制
- 高性能 SSR 与 hydration 方案

此外，官方还特别点出几类现实限制：

- 原生插槽是贪婪求值的，不支持 Vue 这种强大的作用域插槽机制
- shadow DOM 样式注入在 SSR 和性能上仍有现实成本
- 如果团队自己在 Web Components 上补齐这些能力，本质上就是在维护一套内部框架

所以更合理的理解是：

- 当你需要跨框架分发组件时，Web Components 很有价值
- 当你在构建完整 Vue 应用时，Vue 自身的组件模型通常仍然更合适

## 7. 🔗 引用

- [Vue.js 官方文档 - Vue 与 Web Components][1]
- [Vue.js API - Custom Elements][2]
- [Custom Elements Everywhere - Vue][3]
- [MDN - Web Components][4]

[1]: https://cn.vuejs.org/guide/extras/web-components.html
[2]: https://cn.vuejs.org/api/custom-elements.html
[3]: https://custom-elements-everywhere.com/libraries/vue/results/results.html
[4]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
