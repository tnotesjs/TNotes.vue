# [0093. KeepAlive](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0093.%20KeepAlive)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `<KeepAlive>` 到底缓存了什么？](#3--keepalive-到底缓存了什么)
- [4. 🤔 为什么动态组件切回来后状态会丢，怎么用 `<KeepAlive>` 解决？](#4--为什么动态组件切回来后状态会丢怎么用-keepalive-解决)
- [5. 🤔 `include`、`exclude` 和组件 `name` 是怎么配合的？](#5--includeexclude-和组件-name-是怎么配合的)
- [6. 🤔 `max` 为什么说像 LRU 缓存？](#6--max-为什么说像-lru-缓存)
- [7. 🤔 被缓存的组件会经历什么生命周期？](#7--被缓存的组件会经历什么生命周期)
- [8. 🤔 什么场景适合缓存，什么场景不适合？](#8--什么场景适合缓存什么场景不适合)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 缓存实例
- 动态组件
- 状态保留
- include
- exclude
- max 限制
- 激活钩子
- 使用边界

## 2. 🫧 评价

`<KeepAlive>` 很常用，尤其是标签页、动态组件和路由页面缓存。你需要真正搞懂的是「它缓存的是组件实例，不是纯 DOM」「匹配靠组件名」「激活 / 停用不是挂载 / 卸载的简单别名」，这样后面配合路由用才不容易踩坑。

## 3. 🤔 `<KeepAlive>` 到底缓存了什么？

`<KeepAlive>` 缓存的是“被切走的组件实例”，不是简单地把一段 DOM 截图保存下来。

这意味着当组件暂时不显示时：

- 它不会像普通切换那样被直接销毁。
- 它内部的响应式状态可以保留下来。
- 下次再显示时，可以从之前的状态继续，而不是重新创建一份新实例。

所以它最适合解决的场景是：你希望一个组件“暂时离场，但别忘记它之前干了什么”。

## 4. 🤔 为什么动态组件切回来后状态会丢，怎么用 `<KeepAlive>` 解决？

默认情况下，动态组件切换时，旧组件会被卸载，新组件会重新创建。

```vue
<component :is="activeComponent" />
```

这在很多场景里是合理的，但有时你并不想这样。比如：

- A 组件里点了几次计数器
- B 组件里输入了一半表单
- 你在 A 和 B 之间来回切换

如果没有缓存，切回来时这些状态都会重置。

加上 `<KeepAlive>` 之后：

```vue
<KeepAlive>
  <component :is="activeComponent" />
</KeepAlive>
```

非活跃组件会被缓存，而不是销毁。再次切回来时，之前的输入、滚动、局部状态都还在。

这也是它和 `<Transition>`、`<Teleport>` 这些内置组件最大的不同之一：`<KeepAlive>` 影响的是组件实例的生存周期。

## 5. 🤔 `include`、`exclude` 和组件 `name` 是怎么配合的？

默认情况下，`<KeepAlive>` 会缓存内部所有可缓存组件。但你可以通过 `include` 和 `exclude` 精细控制。

```vue
<KeepAlive include="UserPanel,MessagePanel">
  <component :is="activeComponent" />
</KeepAlive>
```

它们都支持三种写法：

- 逗号分隔字符串
- 正则表达式
- 数组

```vue
<KeepAlive :include="['UserPanel', 'MessagePanel']">
  <component :is="activeComponent" />
</KeepAlive>
```

这里最关键的边界是：匹配依据是组件的 `name` 选项，不是文件路径，也不是你在父组件里起的变量名。

也就是说，如果你想让某个组件按名字命中缓存规则，它必须有明确的组件名。

```js
export default {
  name: 'UserPanel',
}
```

官方还补充了一个版本细节：在 Vue 3.2.34+ 中，使用 `<script setup>` 的单文件组件会自动根据文件名推导出组件名，因此很多时候不再需要手动写 `name`。

## 6. 🤔 `max` 为什么说像 LRU 缓存？

`<KeepAlive>` 可以通过 `max` 限制最多缓存多少个组件实例：

```vue
<KeepAlive :max="10">
  <component :is="activeComponent" />
</KeepAlive>
```

一旦缓存数量即将超过上限，Vue 会把“最近最少使用”的那份缓存淘汰掉。

这就是官方说它类似 LRU 缓存的原因。

你可以把它理解成浏览器标签页的记忆上限：

- 最近经常切回来的页面，优先保留。
- 很久没再访问的页面，先丢掉。

这样做能在“状态保留”和“内存占用”之间取得平衡。

## 7. 🤔 被缓存的组件会经历什么生命周期？

被 `<KeepAlive>` 管理的组件，不再只是挂载和卸载两种状态，它还多了“激活”和“停用”。

官方提供了两个专门的生命周期钩子：

- `onActivated()`
- `onDeactivated()`

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  console.log('组件被激活')
})

onDeactivated(() => {
  console.log('组件被停用')
})
</script>
```

注意两个很容易忽略的点：

1. `onActivated()` 在首次挂载时也会触发。
2. `onDeactivated()` 在组件最终卸载时也会触发。

而且这两个钩子不仅作用于被缓存的根组件，也会作用于缓存树中的后代组件。

如果某个页面被缓存后需要在重新显示时刷新局部数据、恢复订阅、重建轮询，通常就放在 `onActivated()` 里处理；如果切走时要暂停轮询、解绑非必要监听，可以放在 `onDeactivated()`。

## 8. 🤔 什么场景适合缓存，什么场景不适合？

适合缓存的典型场景：

- 标签页切换
- 多步表单
- 需要保留输入状态的面板
- 路由页面之间来回切换

不太适合盲目缓存的场景：

- 页面很多，缓存后内存压力明显上涨
- 页面内容依赖实时数据，旧状态保留反而容易误导
- 某些组件切走后本来就应该彻底重置

所以 `KeepAlive` 不是“性能优化万能药”，而是“状态保留工具”。

如果你真正想解决的是渲染性能问题，还得结合组件设计、懒加载、列表优化一起看，而不是见到切换就一股脑缓存。

## 9. 🔗 引用

- [Vue.js 官方文档 - KeepAlive][1]
- [Vue.js 官方文档 - `<KeepAlive>` API][2]
- [Vue.js 官方文档 - 动态组件][3]
- [Vue.js 官方文档 - 生命周期钩子][4]

[1]: https://cn.vuejs.org/guide/built-ins/keep-alive.html
[2]: https://cn.vuejs.org/api/built-in-components.html#keepalive
[3]: https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components
[4]: https://cn.vuejs.org/api/composition-api-lifecycle.html#onactivated
