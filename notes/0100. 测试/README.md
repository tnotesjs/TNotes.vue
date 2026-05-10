# [0100. 测试](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0100.%20%E6%B5%8B%E8%AF%95)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 为什么 Vue 项目需要尽早开始测试？](#3--为什么-vue-项目需要尽早开始测试)
- [4. 🤔 Vue 应用里常见的测试类型有哪些？](#4--vue-应用里常见的测试类型有哪些)
- [5. 🤔 官方推荐的测试工具应该怎么选？](#5--官方推荐的测试工具应该怎么选)
- [6. 🤔 组件测试应该测什么，不该测什么？](#6--组件测试应该测什么不该测什么)
- [7. 🤔 组合式函数怎么测，为什么有时要包一个宿主组件？](#7--组合式函数怎么测为什么有时要包一个宿主组件)
- [8. 🤔 什么时候该上 E2E，选 Playwright 还是 Cypress？](#8--什么时候该上-e2e选-playwright-还是-cypress)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 测试动机
- 三类测试
- Vitest
- 组件测试
- 组合式函数
- E2E 方案
- 工具取舍
- 测试边界

## 2. 🫧 评价

测试这一节的难点不在 API，而在“测试策略”。你最该掌握的是：单元测试、组件测试、E2E 各自兜什么风险，Vue 官方更推荐哪套工具，以及为什么测试应围绕公开行为而不是实现细节展开。

## 3. 🤔 为什么 Vue 项目需要尽早开始测试？

因为测试越晚补，成本越高。

官方建议也很直接：越早越好。原因主要有两个：

- 越早写测试，代码结构越容易朝“可测试、可维护”方向演化
- 越晚补测试，依赖越多、耦合越深，补起来越痛苦

测试不是为了“仪式感”，而是为了在重构、加功能、升级依赖时更有把握地回答一个问题：我有没有把旧功能改坏？

## 4. 🤔 Vue 应用里常见的测试类型有哪些？

官方把 Vue 应用里的测试大致分成 3 类：

1. 单元测试
2. 组件测试
3. 端到端测试（E2E）

### 4.1. 单元测试

关注函数、类、模块、组合式函数等小而独立的逻辑单元。

比如：

```js
export function increment(current, max = 10) {
  if (current < max) {
    return current + 1
  }

  return current
}
```

这种逻辑非常适合单元测试，因为它几乎不依赖 UI 和运行环境。

### 4.2. 组件测试

关注组件作为一个 UI 单元时的渲染、交互和公开接口。

它通常比单元测试更接近真实使用方式，也更适合验证：

- Props
- 事件
- 插槽
- DOM 输出
- 用户交互

### 4.3. E2E 测试

关注用户在真实浏览器里跨页面使用应用时会发生什么。

它最适合发现：

- 路由问题
- 请求链路问题
- 顶层组件集成问题
- 部署环境相关问题

## 5. 🤔 官方推荐的测试工具应该怎么选？

### 5.1. 单元测试

官方优先推荐 `Vitest`。

原因很简单：Vue 官方脚手架本来就基于 Vite，而 Vitest 可以复用同一套 Vite 配置和转换管线，集成更顺，速度也更好。

`Jest` 不是不能用，但官方态度是：如果你已经有成熟 Jest 资产，再考虑继续用；新项目一般没必要再从 Jest 起步。

### 5.2. 组件测试

官方推荐的基础库是 `@vue/test-utils`。

`@testing-library/vue` 也能用，但文档明确提醒：它在测试带 `Suspense` 的异步组件时存在问题，用时要谨慎。

### 5.3. Vite 项目里的常见组合

```sh
npm install -D vitest happy-dom @testing-library/vue
```

然后在 Vite 配置里加测试环境即可。

## 6. 🤔 组件测试应该测什么，不该测什么？

这是 Vue 文档里最值得反复看的部分。

官方建议组件测试聚焦在组件的“公开接口”和“用户可观察行为”上，比如：

- 给定 Props 后渲染是否正确
- 用户点击后 DOM 是否更新
- 组件是否按预期触发事件
- 插槽和 class 是否生效

例如：

```js
const valueSelector = '[data-testid=stepper-value]'
const buttonSelector = '[data-testid=increment]'

const wrapper = mount(Stepper, {
  props: {
    max: 1,
  },
})

expect(wrapper.find(valueSelector).text()).toContain('0')

await wrapper.find(buttonSelector).trigger('click')

expect(wrapper.find(valueSelector).text()).toContain('1')
```

不推荐的做法主要有这些：

- 断言组件私有状态
- 测试私有方法
- 过度依赖快照测试
- 围着实现细节写测试

一句话概括就是：测试组件“做了什么”，不要执着于它“内部怎么做”。

## 7. 🤔 组合式函数怎么测，为什么有时要包一个宿主组件？

组合式函数要分两类看。

### 7.1. 不依赖组件实例的组合式函数

如果它只用了响应式 API，比如 `ref`、`computed`，那可以直接调用并断言：

```js
import { ref } from 'vue'

export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++

  return { count, increment }
}
```

```js
const { count, increment } = useCounter()
expect(count.value).toBe(0)
increment()
expect(count.value).toBe(1)
```

### 7.2. 依赖生命周期或注入的组合式函数

如果它用了这些能力：

- 生命周期钩子
- `provide / inject`

那它就依赖一个宿主组件实例，不能裸测。官方建议包一个简单宿主组件来挂载它。

```js
import { createApp } from 'vue'

export function withSetup(composable) {
  let result

  const app = createApp({
    setup() {
      result = composable()
      return () => {}
    },
  })

  app.mount(document.createElement('div'))

  return [result, app]
}
```

这样你就能既拿到返回值，也拿到应用实例，方便测注入、卸载和生命周期效果。

## 8. 🤔 什么时候该上 E2E，选 Playwright 还是 Cypress？

如果你要验证的已经不是“单个组件是否渲染对”，而是“真实用户在真实浏览器里跨页面操作是否正常”，那就该上 E2E 了。

官方推荐里，`Playwright` 和 `Cypress` 都属于第一梯队。

### 8.1. Playwright

官方给了很高评价，优势包括：

- Chromium、Firefox、WebKit 支持齐全
- 调试和追踪能力强
- 并行执行体验好
- 适合跨浏览器与 CI 场景

### 8.2. Cypress

优势在于：

- 图形化体验好
- 调试很直观
- 断言和快照体验成熟
- 同时也支持组件测试

更实际的选择方式通常是：

- 更看重跨浏览器覆盖与自动化能力，优先 Playwright
- 更看重可视化调试体验，Cypress 也很稳

## 9. 🔗 引用

- [Vue.js 官方文档 - 测试][1]
- [Vitest][2]
- [Vue Test Utils][3]
- [Playwright][4]
- [Cypress][5]

[1]: https://cn.vuejs.org/guide/scaling-up/testing.html
[2]: https://vitest.dev/
[3]: https://github.com/vuejs/test-utils
[4]: https://playwright.dev/
[5]: https://www.cypress.io/
