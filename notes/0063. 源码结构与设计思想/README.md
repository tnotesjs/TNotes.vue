# [0063. 源码结构与设计思想](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0063.%20%E6%BA%90%E7%A0%81%E7%BB%93%E6%9E%84%E4%B8%8E%E8%AE%BE%E8%AE%A1%E6%80%9D%E6%83%B3)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue 3 为什么使用 monorepo 管理？各个包的职责是什么？](#3--vue-3-为什么使用-monorepo-管理各个包的职责是什么)
- [4. 🤔 Vue 3 响应式系统的源码实现原理是什么？](#4--vue-3-响应式系统的源码实现原理是什么)
- [5. 🤔 渲染器的设计思路是什么？runtime-core 和 runtime-dom 如何分工？](#5--渲染器的设计思路是什么runtime-core-和-runtime-dom-如何分工)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Vue 3 的 monorepo 管理
- 响应式系统的源码实现
- 渲染器的设计（runtime-core vs runtime-dom）

## 2. 🫧 评价

- todo

## 3. 🤔 Vue 3 为什么使用 monorepo 管理？各个包的职责是什么？

Vue 3 源码采用 monorepo 架构，使用 pnpm workspace 管理多个包，所有包都在 packages/ 目录下。这种架构使得各模块职责清晰、可独立使用、便于维护和测试。

```
vue-next/  (Vue 3 源码仓库)
├── packages/
│   ├── reactivity/         # 响应式系统（独立使用，不依赖 Vue）
│   ├── runtime-core/       # 运行时核心（平台无关的渲染逻辑）
│   ├── runtime-dom/        # 浏览器 DOM 运行时
│   ├── compiler-core/      # 编译器核心（平台无关的编译逻辑）
│   ├── compiler-dom/       # 浏览器 DOM 编译器
│   ├── compiler-sfc/       # 单文件组件（SFC）编译器
│   ├── compiler-ssr/       # SSR 编译器
│   ├── server-renderer/    # 服务端渲染器
│   ├── shared/             # 共享工具函数
│   ├── vue/                # 完整版入口（打包完整的 Vue）
│   └── vue-compat/         # Vue 2 兼容版本
├── scripts/
├── test-dts/               # 类型测试
├── pnpm-workspace.yaml
└── package.json
```

各个核心包的职责和依赖关系：

```
vue（完整构建）
├── compiler-dom   -> compiler-core   -> shared
├── runtime-dom    -> runtime-core    -> reactivity -> shared
└── compiler-sfc   -> compiler-core + compiler-dom + compiler-ssr
```

```ts
// packages/reactivity —— 响应式系统
// 完全独立，可以脱离 Vue 单独使用
import { reactive, ref, computed, effect } from '@vue/reactivity'

const state = reactive({ count: 0 })

// 即使不使用 Vue，也能使用响应式能力
effect(() => {
  console.log('count:', state.count)
})

state.count++ // 触发 effect 回调
```

```ts
// packages/runtime-core —— 运行时核心
// 平台无关，定义了组件、VNode、渲染器的核心逻辑
// 提供 createRenderer 工厂函数，接收平台特定的节点操作

import { createRenderer } from '@vue/runtime-core'

// 实现自定义渲染器（如 Canvas、终端）
const { render } = createRenderer({
  createElement(type) {
    /* 平台特定实现 */
  },
  insert(child, parent) {
    /* 平台特定实现 */
  },
  patchProp(el, key, prev, next) {
    /* 平台特定实现 */
  },
  // ...
})
```

```ts
// packages/runtime-dom —— 浏览器运行时
// 基于 runtime-core，提供 DOM 平台的具体操作实现
// 导出 createApp、h、render 等面向用户的 API

// 内部实现
const nodeOps = {
  createElement(type) {
    return document.createElement(type)
  },
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null)
  },
  remove(child) {
    child.parentNode?.removeChild(child)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  // ...
}

const patchProp = (el, key, prevValue, nextValue) => {
  if (key === 'class') {
    el.className = nextValue || ''
  } else if (key === 'style') {
    // 处理 style
  } else if (key.startsWith('on')) {
    // 处理事件
  } else {
    el.setAttribute(key, nextValue)
  }
}

const renderer = createRenderer({ ...nodeOps, patchProp })
export const createApp = renderer.createApp
```

monorepo 的优势：reactivity 包可以被 React、Svelte 等其他框架使用；runtime-core 可以被自定义渲染器复用；编译器和运行时分离后，生产环境可以预编译模板，打包时不包含编译器代码（减小约 30% 体积）。

## 4. 🤔 Vue 3 响应式系统的源码实现原理是什么？

Vue 3 的响应式系统基于 ES6 的 Proxy 实现（Vue 2 用的是 Object.defineProperty）。核心包含三个概念：effect（副作用函数）、track（依赖收集）、trigger（触发更新）。

```
reactive(obj) -> 返回 Proxy 代理对象
  ├── get 拦截 -> track() 收集当前正在执行的 effect
  └── set 拦截 -> trigger() 触发所有收集到的 effect 重新执行
```

依赖收集的数据结构：

```
targetMap: WeakMap<target, Map<key, Set<effect>>>

示例：
targetMap = {
  { name: 'Vue', version: 3 } => {      // target 对象
    'name' => Set[ effect1, effect2 ],   // name 属性的依赖集合
    'version' => Set[ effect3 ]          // version 属性的依赖集合
  }
}
```

核心源码实现（简化版）：

```ts
// 当前正在执行的 effect
let activeEffect: ReactiveEffect | undefined

// 依赖关系存储
const targetMap = new WeakMap<
  object,
  Map<string | symbol, Set<ReactiveEffect>>
>()

// effect 函数——注册副作用
class ReactiveEffect {
  private _fn: () => any
  deps: Set<ReactiveEffect>[] = [] // 记录自己被哪些依赖集合收集了

  constructor(fn: () => any) {
    this._fn = fn
  }

  run() {
    activeEffect = this
    const result = this._fn() // 执行函数，触发 get 拦截 -> track
    activeEffect = undefined
    return result
  }
}

export function effect(fn: () => any) {
  const _effect = new ReactiveEffect(fn)
  _effect.run() // 立即执行一次，收集依赖
  return _effect
}

// track——依赖收集（在 Proxy 的 get 拦截中调用）
export function track(target: object, key: string | symbol) {
  if (!activeEffect) return // 没有正在执行的 effect，不需要收集

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(activeEffect)
  activeEffect.deps.push(dep) // 反向记录，用于清理
}

// trigger——触发更新（在 Proxy 的 set 拦截中调用）
export function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  if (!dep) return

  // 执行所有收集到的 effect
  const effectsToRun = new Set(dep) // 避免无限循环
  effectsToRun.forEach((effect) => {
    // 如果 effect 有调度器，使用调度器执行（如 computed、watch）
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  })
}
```

reactive 的实现：

```ts
export function reactive<T extends object>(target: T): T {
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)

      track(target, key) // 收集依赖

      // 深层响应式：如果值是对象，递归包装（惰性，访问时才包装）
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }

      return result
    },

    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)

      if (oldValue !== value) {
        trigger(target, key) // 值变化时触发更新
      }

      return result
    },

    deleteProperty(target, key) {
      const hadKey = key in target
      const result = Reflect.deleteProperty(target, key)
      if (hadKey && result) {
        trigger(target, key)
      }
      return result
    },
  })

  return proxy
}
```

ref 的实现：

```ts
export function ref(value: any) {
  return new RefImpl(value)
}

class RefImpl {
  private _value: any
  private _rawValue: any
  public dep: Set<ReactiveEffect> = new Set()
  public readonly __v_isRef = true

  constructor(value: any) {
    this._rawValue = value
    // 如果是对象，用 reactive 包装
    this._value = typeof value === 'object' ? reactive(value) : value
  }

  get value() {
    // 收集依赖
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    if (newVal !== this._rawValue) {
      this._rawValue = newVal
      this._value = typeof newVal === 'object' ? reactive(newVal) : newVal
      // 触发更新
      triggerRefValue(this)
    }
  }
}
```

Vue 3 使用 Proxy 相比 Vue 2 的 Object.defineProperty 的优势：能够拦截属性的添加和删除（不再需要 Vue.set）、能够拦截数组的索引赋值和 length 修改、性能更好（不需要递归遍历所有属性做劫持，而是惰性代理）。

## 5. 🤔 渲染器的设计思路是什么？runtime-core 和 runtime-dom 如何分工？

Vue 3 的渲染器采用了"核心逻辑与平台操作分离"的设计思想。runtime-core 定义了平台无关的渲染管线（VNode 创建、Diff、组件管理），runtime-dom 提供了浏览器 DOM 平台的具体操作实现。

核心设计模式——工厂函数 createRenderer：

```ts
// packages/runtime-core/src/renderer.ts（简化）
export function createRenderer(options: RendererOptions) {
  // 从 options 中解构出平台特定的操作
  const {
    createElement,
    insert,
    remove,
    setElementText,
    patchProp,
    createText,
    setText,
    parentNode,
    nextSibling,
  } = options

  // 以下所有函数使用上面的平台操作，但逻辑本身是通用的

  function patch(n1, n2, container, anchor) {
    const { type, shapeFlag } = n2

    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      case Fragment:
        processFragment(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container, anchor)
        }
    }
  }

  function processElement(n1, n2, container, anchor) {
    if (n1 == null) {
      // 挂载：使用平台操作创建元素
      const el = (n2.el = createElement(n2.type))

      // 设置属性
      if (n2.props) {
        for (const key in n2.props) {
          patchProp(el, key, null, n2.props[key])
        }
      }

      // 处理子节点
      if (typeof n2.children === 'string') {
        setElementText(el, n2.children)
      } else if (Array.isArray(n2.children)) {
        n2.children.forEach((child) => patch(null, child, el, null))
      }

      // 插入到容器
      insert(el, container, anchor)
    } else {
      // 更新：Diff 旧节点和新节点
      patchElement(n1, n2)
    }
  }

  function processComponent(n1, n2, container, anchor) {
    if (n1 == null) {
      mountComponent(n2, container, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }

  function mountComponent(vnode, container, anchor) {
    // 创建组件实例
    const instance = createComponentInstance(vnode)

    // 设置组件（解析 props、slots、执行 setup）
    setupComponent(instance)

    // 设置渲染 effect
    setupRenderEffect(instance, vnode, container, anchor)
  }

  function setupRenderEffect(instance, vnode, container, anchor) {
    // 使用响应式的 effect 包裹渲染逻辑
    const componentEffect = new ReactiveEffect(
      () => {
        if (!instance.isMounted) {
          // 首次挂载
          const subTree = (instance.subTree = instance.render.call(
            instance.proxy,
          ))
          patch(null, subTree, container, anchor)
          vnode.el = subTree.el
          instance.isMounted = true
        } else {
          // 更新
          const prevTree = instance.subTree
          const nextTree = (instance.subTree = instance.render.call(
            instance.proxy,
          ))
          patch(prevTree, nextTree, container, anchor)
        }
      },
      () => {
        // 调度器：将更新放入微任务队列，批量执行
        queueJob(instance.update)
      },
    )

    instance.update = componentEffect.run.bind(componentEffect)
    instance.update()
  }

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode || null, vnode, container, null)
    } else if (container._vnode) {
      unmount(container._vnode)
    }
    container._vnode = vnode
  }

  return { render, createApp: createAppAPI(render) }
}
```

runtime-dom 负责提供浏览器平台的操作实现：

```ts
// packages/runtime-dom/src/index.ts
import { createRenderer } from '@vue/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

// 浏览器 DOM 操作
const nodeOps = {
  createElement(type: string) {
    return document.createElement(type)
  },
  createText(text: string) {
    return document.createTextNode(text)
  },
  insert(child: Node, parent: Node, anchor: Node | null) {
    parent.insertBefore(child, anchor)
  },
  remove(child: Node) {
    const parent = child.parentNode
    if (parent) parent.removeChild(child)
  },
  setElementText(el: HTMLElement, text: string) {
    el.textContent = text
  },
  parentNode(node: Node) {
    return node.parentNode
  },
  nextSibling(node: Node) {
    return node.nextSibling
  },
}

// 浏览器属性设置
function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    // 使用 className 而不是 setAttribute，性能更好
    el.className = nextValue || ''
  } else if (key === 'style') {
    // 处理 style 对象
    const style = el.style
    if (nextValue) {
      for (const key in nextValue) {
        style[key] = nextValue[key]
      }
    }
    if (prevValue) {
      for (const key in prevValue) {
        if (!(key in (nextValue || {}))) {
          style[key] = ''
        }
      }
    }
  } else if (/^on[A-Z]/.test(key)) {
    // 事件处理
    const eventName = key.slice(2).toLowerCase()
    if (prevValue) el.removeEventListener(eventName, prevValue)
    if (nextValue) el.addEventListener(eventName, nextValue)
  } else {
    // 其他属性
    if (nextValue == null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextValue)
    }
  }
}

// 创建浏览器环境的渲染器
const renderer = createRenderer({ ...nodeOps, patchProp })

// 导出 createApp（面向用户的 API）
export const createApp = (...args) => {
  const app = renderer.createApp(...args)

  // 增强 mount 方法，处理 DOM 容器选择
  const { mount } = app
  app.mount = (containerOrSelector) => {
    const container =
      typeof containerOrSelector === 'string'
        ? document.querySelector(containerOrSelector)
        : containerOrSelector
    container.innerHTML = ''
    mount(container)
  }

  return app
}
```

这种分层设计的价值在于：如果要为 Canvas、WebGL、终端等平台开发渲染器，只需要实现一套平台操作函数传给 createRenderer，渲染管线的核心逻辑（Diff 算法、组件实例管理、生命周期调度）全部复用。这是 Vue 3 架构设计中最优雅的部分之一。
