# [0092. Teleport](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0092.%20Teleport)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. `<Teleport>` 是什么？](#3-teleport-是什么)
  - [3.1. `<Teleport>` 的作用](#31-teleport-的作用)
  - [3.2. “模态框”示例](#32-模态框示例)
  - [3.3. 一些使用建议和注意事项](#33-一些使用建议和注意事项)
- [4. 被传送的内容换了位置后，组件关系会不会变？](#4-被传送的内容换了位置后组件关系会不会变)
- [5. `<Teleport>` 核心属性：`to`、`disabled` 如何使用？](#5-teleport-核心属性todisabled-如何使用)
  - [5.1. `to`](#51-to)
    - [`to` 的搜索逻辑](#to-的搜索逻辑)
    - [目标后来才出现怎么办？](#目标后来才出现怎么办)
    - [to 可以直接传 DOM 元素](#to-可以直接传-dom-元素)
    - [多个 Teleport 共享同一目标会如何处理](#多个-teleport-共享同一目标会如何处理)
  - [5.2. `disabled`](#52-disabled)
- [6. `defer` 是干什么的，什么时候需要它？（Vue 3.5+）](#6-defer-是干什么的什么时候需要它vue-35)
  - [6.1. `defer` 的作用](#61-defer-的作用)
  - [6.2. 实现原理](#62-实现原理)
- [7. 引用](#7-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 使用动机
- to 目标
- disabled
- 逻辑关系
- 共享目标
- defer
- 使用边界

## 2. 评价

`<Teleport>` 很实用，尤其是模态框、抽屉、全局浮层这类 UI。

## 3. `<Teleport>` 是什么？

::: tip 先说名字

`teleport` 是一个英文单词，由 tele-（远距离，如 telephone）和 -port（搬运，如 transport）组成，合在一起就是“远距传送”。Vue 用这个名字非常贴切，组件的一段 DOM 在逻辑上属于当前位置，但物理上被“传送”到了目标容器里。

:::

### 3.1. `<Teleport>` 的作用

`<Teleport>` 解决的是这样一种矛盾：

- 某段模板在逻辑上属于当前组件
- 但它在 DOM 结构上又应该渲染到更外层的位置

最典型的例子就是模态框。

从逻辑上讲，打开按钮、关闭状态、弹层内容都属于同一个组件，写在一个单文件组件里最自然。但从页面布局上讲，模态框通常应该直接挂到 `body` 或者应用根层的浮层容器下，否则容易被祖先元素的 `transform`、`filter`、`z-index`、`overflow` 之类样式影响。

所以你可以把 `<Teleport>` 理解成一句话：“模板归我管，但 DOM 别放我这儿。”

### 3.2. “模态框”示例

官方用模态框示例说明得非常典型。

```html
<template>
  <button @click="open = true">打开弹层</button>

  <Teleport to="body">
    <div v-if="open" class="modal">
      <p>Hello from the modal!</p>
      <button @click="open = false">关闭</button>
    </div>
  </Teleport>
</template>

<script setup>
  import { ref } from 'vue'

  const open = ref(false)
</script>

<style scoped>
  .modal {
    position: fixed;
    top: 20%;
    left: 50%;
    z-index: 999;
    width: 320px;
    margin-left: -160px;
  }
</style>
```

1. 最终渲染结果
2. 对应的真实 DOM 结构

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-13-45-29.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-13-45-56.png)

:::

这里的关键点在于：`<div class="modal">` 依然写在当前组件模板里，但实际渲染时会被移动到 `body` 下面。

`to` 属性既可以是 CSS 选择器字符串，也可以直接传一个 DOM 元素对象。最常见的写法还是：

- `to="body"`
- `to="#modals"`

### 3.3. 一些使用建议和注意事项

- 目标节点必须存在，除非你明确使用 `defer` 处理同周期延迟解析。
- `<Teleport>` 只改变 DOM 位置，不改变组件逻辑层级。
- 它非常适合和 `<Transition>` 组合，用来做带动画的模态框。
- 如果只是普通布局重排，而不是浮层脱离文档流，未必需要 `<Teleport>`。
- SSR 场景下 `<Teleport>` 也有专门处理规则，不能完全按纯客户端思路想当然。

另外还有一个很务实的判断：

- 遇到 `z-index` 被祖先压住、`position: fixed` 失效、弹层被裁切，优先想到 `<Teleport>`。
- 遇到只是样式没写好，不要把 `<Teleport>` 当成万能修复器。

## 4. 被传送的内容换了位置后，组件关系会不会变？

不会。

这是 Teleport 最容易误解的地方。它改变的是最终 DOM 挂载位置，不是 Vue 内部的组件树关系。

这意味着：

- Props 传递不受影响
- 组件事件照常触发
- `provide / inject` 照常工作
- Vue Devtools 里它仍然挂在逻辑上的父组件下面

也就是说，Teleport 只是把“渲染结果”搬家了，没把“组件归属关系”改掉。

所以如果你在 Teleport 里放一个子组件，它依然是当前组件的孩子，而不是目标 DOM 节点的某个“新父组件的孩子”。

## 5. `<Teleport>` 核心属性：`to`、`disabled` 如何使用？

### 5.1. `to`

`to` 用来指定目标容器。

```html
<Teleport to="#modals">
  <div>Modal A</div>
</Teleport>
```

目标节点在 Teleport 挂载时必须已经存在。理想情况下，这个目标容器是应用外层的静态 DOM，比如 HTML 里预留的：

```html
<!-- 用于挂载 vue app 实例 -->
<div id="app"></div>

<!-- 专门预留给模态框使用 -->
<div id="modals"></div>
```

#### `to` 的搜索逻辑

`to` 的底层等价于 `document.querySelector(to)`，这意味着：

- 只匹配第一个命中的元素，后续匹配项被忽略
- 搜索遵循文档顺序（从上往下，深度优先）
- 如果没有任何元素匹配，内容不渲染：
  - 开发环境下，会输出 warn 警告信息
  - 生产环境下，静默失败

```html
<!-- 两个同 id 元素（虽然 HTML 规范不允许，但这么写页面还是可以正常渲染两个 #modals） -->
<div id="modals">第一个</div>
<div id="modals">第二个</div>

<Teleport to="#modals">
  <div>只会出现在第一个 #modals 里</div>
</Teleport>

<Teleport to="#modal">
  <div>不会渲染，因为不存在 #modal</div>
</Teleport>
```

::: tip 补充：`to` 的实现细节

在 Vue 源码中，`to` 不是直接调用 `document.querySelector`，而是通过 `resolveTarget` 函数从 `RendererInternals` 注入 `querySelector`。

- 在 `runtime-dom` 下，这个注入的实现才是 `doc.querySelector(selector)`
- 当 `to` 是 DOM 元素引用时则直接使用，不走 `querySelector`

这样的设计让 `Teleport` 的核心逻辑（比如这里搜索目标元素的逻辑）与平台无关，自定义 renderer（如测试环境、SSR）可以提供自己的实现。

```ts
// 相关源码：vuejs/core => packages/runtime-core/src/components/Teleport.ts

// 目标元素的解析逻辑实现：
const resolveTarget = <T = RendererElement>(
  props: TeleportProps | null,
  select: RendererOptions['querySelector'],
): T | null => {
  const targetSelector = props && props.to
  // 如果传入的是字符串，走搜索逻辑
  if (isString(targetSelector)) {
    if (!select) {
      __DEV__ &&
        warn(
          `Current renderer does not support string target for Teleports. ` +
            `(missing querySelector renderer option)`,
        )
      return null
    } else {
      const target = select(targetSelector)
      if (__DEV__ && !target && !isTeleportDisabled(props)) {
        warn(
          `Failed to locate Teleport target with selector "${targetSelector}". ` +
            `Note the target element must exist before the component is mounted - ` +
            `i.e. the target cannot be rendered by the component itself, and ` +
            `ideally should be outside of the entire Vue component tree.`,
        )
      }
      return target as T
    }
  } else {
    // 如果传入的是 DOM 元素，直接返回目标
    if (__DEV__ && !targetSelector && !isTeleportDisabled(props)) {
      warn(`Invalid Teleport target: ${targetSelector}`)
    }
    return targetSelector as T
  }
}

// 相关源码：vuejs/core => packages/runtime-dom/src/nodeOps.ts
const doc = (typeof document !== 'undefined' ? document : null) as Document

export const nodeOps: Omit<RendererOptions<Node, Element>, 'patchProp'> = {
  querySelector: (selector) => doc.querySelector(selector),
}
```

:::

#### 目标后来才出现怎么办？

如果目标元素在同一个渲染周期内、排在 Teleport 之后才渲染出来，普通写法会失败。Teleport 挂载时 `querySelector` 找不到目标，内容不会渲染。

Vue 3.5+ 提供了 `defer` prop 来解决这个问题，它会把 Teleport 的挂载推迟到当前更新周期结束后，从而让目标元素有机会先被渲染出来：

::: code-group

```html [1]
<template>
  <!-- Teleport 先被解析
   此时目标元素还不存在，加上 defer 等渲染周期结束后再查找目标
   如果不加 defer，那么 Teleport 将无法正常工作
   控制台会输出警告信息：
   [Vue warn]: Invalid Teleport target on mount: null (object) -->
  <Teleport defer to="#late-target">
    <p>我会在目标出现后才渲染</p>
  </Teleport>

  <!-- 目标元素后解析 -->
  <div id="late-target"></div>
</template>
```

```html [2]
<template>
  <!-- 目标元素先解析 -->
  <div id="late-target"></div>

  <!-- Teleport 后解析
   这种情况下不需要加 defer -->
  <Teleport to="#late-target">
    <p>我会在目标出现后才渲染</p>
  </Teleport>
</template>
```

:::

#### to 可以直接传 DOM 元素

`to` 还可以直接传一个 DOM 元素引用，绕过选择器匹配：

```html
<template>
  <div ref="targetEl"></div>

  <!-- 注意这里要加 v-if="targetEl"
  否则会报错：TypeError: Failed to execute 'insertBefore' on 'Node': parameter 1 is not of type 'Node'.
  因为首次渲染时 targetEl 为 null，Teleport 不渲染。
  渲染完成后 ref 赋值，触发重新渲染，此时 targetEl 已是有效的 DOM 元素，Teleport 正常挂载。 -->
  <Teleport v-if="targetEl" :to="targetEl">
    <div>精确传送到指定元素</div>
  </Teleport>
</template>

<script setup>
  import { ref } from 'vue'
  const targetEl = ref(null)
</script>
```

#### 多个 Teleport 共享同一目标会如何处理

多个 Teleport 可以把内容传到同一个容器里，后挂载的内容会按顺序追加进去：

```html
<Teleport to="#modals">
  <div>A</div>
</Teleport>

<Teleport to="#modals">
  <div>B</div>
</Teleport>
```

最终结果类似：

```html
<div id="modals">
  <div>A</div>
  <div>B</div>
</div>
```

这对可复用 Modal 组件、Toast 组件特别有用。

下面来看一个具体示例：

```html
<script setup>
  import { ref } from 'vue'

  // 两个完全独立的通知状态（模拟来自不同业务模块）
  const saveMsg = ref('')
  const downloadMsg = ref('')

  function triggerSave() {
    saveMsg.value = '文档已保存'
    setTimeout(() => {
      saveMsg.value = ''
    }, 3000)
  }

  function triggerDownload() {
    downloadMsg.value = '下载完成'
    setTimeout(() => {
      downloadMsg.value = ''
    }, 3500)
  }
</script>

<template>
  <!-- 固定定位的全局通知容器（共享目标） -->
  <div id="toast-container" class="toast-container" />

  <div class="main-area">
    <!-- 不同逻辑的独立模块 -->
    <!-- 模块 1：保存操作 -->
    <div class="module-card">
      <h3>📄 文档编辑区</h3>
      <button @click="triggerSave">保存文档</button>
    </div>

    <!-- 模块 2：下载操作 -->
    <div class="module-card">
      <h3>📦 资源下载区</h3>
      <button @click="triggerDownload">下载资源</button>
    </div>
  </div>

  <!--
    保存通知（来自模块 1）
    ✅ 传送到共享目标，避开各自模块的布局限制
    ✅ 与下载通知完全独立，挂载/卸载互不干扰
  -->
  <Teleport v-if="saveMsg" to="#toast-container">
    <div class="toast toast--success">{{ saveMsg }}</div>
  </Teleport>

  <!--
    下载通知（来自模块 2）
    ✅ 同样传送到 #toast-container，追加在上一条通知下方
    ✅ 即便保存通知还在，下载通知也不会覆盖它，而是自动向下堆叠
  -->
  <Teleport v-if="downloadMsg" to="#toast-container">
    <div class="toast toast--info">{{ downloadMsg }}</div>
  </Teleport>
</template>

<style scoped>
  /* 通知容器：固定在视口右上角 */
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
  }

  /* 主布局：模块横向排列 */
  .main-area {
    display: flex;
    gap: 40px;
  }

  /* 单个模块卡片 */
  .module-card {
    border: 1px solid #ccc;
    padding: 20px;
  }

  /* 通知条目通用样式 */
  .toast {
    color: white;
    padding: 10px 16px;
    border-radius: 4px;
    margin-bottom: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* 成功通知变体 */
  .toast--success {
    background: #4caf50;
  }

  /* 信息通知变体 */
  .toast--info {
    background: #2196f3;
  }
</style>
```

1. 默认初始状态
2. 触发了文档保存通知
3. 触发了资源下载通知
4. 先触发了文档保存通知，随后立刻触发了资源下载通知，两个通知正确堆叠显示

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-19-38-52.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-19-39-11.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-19-39-36.png)

![4](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-19-39-56.png)

:::

### 5.2. `disabled`

有时你想在桌面端把内容做成浮层，但在移动端又希望它保持原位渲染，这时可以动态禁用 Teleport：

```html
<Teleport to="body" :disabled="isMobile">
  <div class="panel">内容</div>
</Teleport>
```

`disabled` 为 `true` 时，内容会留在组件原本的位置，不再被传送。

示例：

```html
<template>
  <p>innerWidth: {{ innerWidth }}</p>
  <p>isMobile: {{ isMobile }}</p>
  <Teleport to="body" :disabled="isMobile">
    <div class="panel">
      内容 {{ isMobile ? "【留在了原本位置，没有被传送】" : "【被传送到了 body
      标签下】" }}
    </div>
  </Teleport>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'

  const innerWidth = ref(window.innerWidth)
  const isMobile = ref(window.innerWidth < 768)

  function onResize() {
    innerWidth.value = window.innerWidth
    isMobile.value = window.innerWidth < 768
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))
</script>
```

1. 小于 768px 时，渲染效果
2. 小于 768px 时，DOM 结构
3. 大于等于 768px 时，渲染效果
4. 大于等于 768px 时，DOM 结构

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-19-07-34.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-19-07-41.png)

![3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-19-07-50.png)

![4](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-19-07-59.png)

:::

一个容易忽略的事实是：Teleport 是一个无渲染组件，无论 `disabled` 是 `true` 还是 `false`，它自身都不产生任何 DOM 元素，只有内部的内容会渲染。可以类比 `<template>` 标签，渲染后在 DOM 中不存在任何痕迹。

| 场景               | DOM 输出         | 包裹元素 |
| ------------------ | ---------------- | -------- |
| `disabled="true"`  | 内容原地渲染     | 无       |
| 目标存在，正常传送 | 内容出现在目标处 | 无       |
| 目标不存在         | 内容不渲染       | 无       |

三种情况，Teleport 自身都不会在 DOM 中留下任何包裹元素。

- 开发模式：`<!--teleport start-->` 和 `<!--teleport end-->` 两个注释节点
- 生产模式：两个空文本节点

```ts
// 相关源码：
// vuejs/core => packages/runtime-core/src/components/Teleport.ts
const placeholder = (n2.el = __DEV__
  ? createComment('teleport start')
  : createText(''))
const mainAnchor = (n2.anchor = __DEV__
  ? createComment('teleport end')
  : createText(''))
insert(placeholder, container, anchor)
insert(mainAnchor, container, anchor)
```

这意味着你可以在开发模式下直接在开发者工具的元素模板中搜索 `teleport start` 关键字来找到 Teleport 的插入位置，对调试或许有点儿帮助。

以下面这个示例为例：

```html
<template>
  <div id="late-target"></div>

  <Teleport to="#late-target">
    <p>我会在目标出现后才渲染</p>
  </Teleport>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-01-18-56-34.png)

## 6. `defer` 是干什么的，什么时候需要它？（Vue 3.5+）

### 6.1. `defer` 的作用

`defer` 是 Vue 3.5+ 提供的能力，用来“延迟解析 Teleport 目标”。

它解决的不是“目标晚很多秒才出现”，而是“目标在同一次挂载 / 更新周期里稍后才渲染出来”。

```html
<template>
  <Teleport defer to="#late-div">
    <div>hello</div>
  </Teleport>

  <div id="late-div"></div>
</template>
```

这个场景通常出现在：目标节点也是 Vue 渲染出来的，而且它在模板里排在更后面。

但要注意一个边界：即使用了 `defer`，目标也必须在同一个挂载或更新周期内出现。如果你打算一秒后再异步创建目标节点，Teleport 仍然会报错。

### 6.2. 实现原理

- `defer` 的实现是把挂载任务通过 `queuePostRenderEffect` 推入后置副作用队列，在当前渲染周期的 DOM 更新完成后才执行。
- `queuePendingMount` 执行后会立即从 `pendingMounts` 中删除自身，没有任何重试机制。
- 如果后置副作用运行时目标仍不存在，`mountToTarget` 会输出警告，内容不渲染，之后也不会再尝试。

```ts
// 相关源码：vuejs/core => packages/runtime-core/src/components/Teleport.ts
const mountToTarget = (vnode: TeleportVNode = n2) => {
  const disabled = isTeleportDisabled(vnode.props)
  const target = (vnode.target = resolveTarget(vnode.props, querySelector))
  const targetAnchor = prepareAnchor(target, vnode, createText, insert)
  if (target) {
    // #2652 we could be teleporting from a non-SVG tree into an SVG tree
    if (namespace !== 'svg' && isTargetSVG(target)) {
      namespace = 'svg'
    } else if (namespace !== 'mathml' && isTargetMathML(target)) {
      namespace = 'mathml'
    }

    // track CE teleport targets
    if (parentComponent && parentComponent.isCE) {
      ;(
        parentComponent.ce!._teleportTargets ||
        (parentComponent.ce!._teleportTargets = new Set())
      ).add(target)
    }

    if (!disabled) {
      mount(vnode, target, targetAnchor)
      updateCssVars(vnode, false)
    }
  } else if (__DEV__ && !disabled) {
    warn('Invalid Teleport target on mount:', target, `(${typeof target})`)
  }
}

// 如果传递了 defer 会跑这个函数，挂载任务被推入后置副作用队列
const queuePendingMount = (vnode: TeleportVNode) => {
  const mountJob: SchedulerJob = () => {
    if (pendingMounts.get(vnode) !== mountJob) return
    pendingMounts.delete(vnode)
    if (isTeleportDisabled(vnode.props)) {
      mount(vnode, container, vnode.anchor!)
      updateCssVars(vnode, true)
    }
    mountToTarget(vnode)
  }
  pendingMounts.set(vnode, mountJob)
  queuePostRenderEffect(mountJob, parentSuspense)
}
```

## 7. 引用

- [Vue.js 官方文档 - Teleport][1]
- [Vue.js 官方文档 - `<Teleport>` API][2]
- [Vue.js 官方文档 - SSR 中处理 Teleports][3]

[1]: https://cn.vuejs.org/guide/built-ins/teleport.html
[2]: https://cn.vuejs.org/api/built-in-components.html#teleport
[3]: https://cn.vuejs.org/guide/scaling-up/ssr.html#teleports
