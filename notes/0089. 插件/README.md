# [0089. 插件](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0089.%20%E6%8F%92%E4%BB%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是 Vue 插件？](#3--什么是-vue-插件)
- [4. 🤔 插件通常用来做什么？](#4--插件通常用来做什么)
- [5. 🤔 插件的基本结构是？](#5--插件的基本结构是)
  - [5.1. 对象式写法](#51-对象式写法)
  - [5.2. 函数式写法](#52-函数式写法)
  - [5.3. 简化版 `i18n` 插件示例](#53-简化版-i18n-插件示例)
- [6. 🤔 插件里的 Provide / Inject 应该怎么配合？](#6--插件里的-provide--inject-应该怎么配合)
- [7. 🤔 为什么要谨慎往 globalProperties 上挂东西？](#7--为什么要谨慎往-globalproperties-上挂东西)
- [8. 🤔 什么场景适合写成插件，什么场景不适合？](#8--什么场景适合写成插件什么场景不适合)
- [9. 🤔 如果要发布给别人用，还要注意什么？](#9--如果要发布给别人用还要注意什么)
- [10. 🤔 Vue 有插件市场吗？](#10--vue-有插件市场吗)
- [11. 🔗 引用](#11--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 插件定义
- app.use
- 全局能力
- install
- provide
- 注入属性
- 使用边界
- 打包发布
- 插件市场

## 2. 🫧 评价

插件本身不是高频业务知识点，但你一旦接触路由、状态管理、国际化，就一定会碰到它。你需要重点理解的是“插件是应用级扩展”，别把只在单个页面里使用的小能力也硬做成插件。

## 3. 🤔 什么是 Vue 插件？

插件（Plugin）可以理解成“给整个 Vue 应用安装一组全局能力的代码”，是 Vue 提供的一种应用级功能扩展机制。当某些功能需要作用于整个应用（而不是单个组件）时，就适合封装成插件。它允许你以模块化的方式为 Vue 应用添加全局方法、组件、指令、依赖注入等功能。

它的典型使用方式是：

```js
import { createApp } from 'vue'
import App from './App.vue'
import myPlugin from './plugins/myPlugin'

const app = createApp(App)

app.use(myPlugin, {
  featureName: 'demo',
})

app.mount('#app')
```

`app.use()` 会调用插件的安装逻辑，并把当前应用实例 `app` 传给插件。后面的第二个参数开始，会作为额外选项传入插件。

插件有两种形式：对象、函数

- 对象：插件可以是一个带有 `install()` 方法的对象
- 函数：插件可以是一个直接作为安装函数的函数

所以本质上，插件不是某种神秘特殊语法，它只是遵守了 Vue 约定的“安装接口”。

## 4. 🤔 插件通常用来做什么？

官方总结了几个最常见的用途：

- 注册全局组件或全局自定义指令
- 通过 `app.provide()` 向整个应用提供可注入资源
- 向 `app.config.globalProperties` 挂载全局属性或方法
- 封装以上能力的组合功能库

像 `vue-router`、国际化插件、埋点插件、权限插件，本质上都属于这一类。

你可以把插件理解成“应用启动时安装的能力包”。它更适合处理跨页面、跨组件、全项目都要统一接入的能力。

## 5. 🤔 插件的基本结构是？

一个标准的 Vue 3 插件必须是一个包含 install 方法的对象，或者直接是一个函数。

### 5.1. 对象式写法

最常见的写法是导出一个带 `install()` 的对象：

```js
const myPlugin = {
  install(app, options) {
    /* 
    app
    app 是 createApp() 创建的应用实例
    app 是整个 Vue 应用实例对象
    通过 app 对象，我们可以注册全局组件、指令，或者挂载全局属性等
    我们可以很轻易地扩展 Vue 应用的全局能力

    options
    options 是调用时通过 app.use() 传入的配置参数
    options 是用户在使用这个插件的时候喂进来的一些数据
    这些数据是这个插件工作的配置数据，以翻译插件 i18n 为例，这个 options 就是翻译字典
    */
  },
}

export default myPlugin
```

### 5.2. 函数式写法

也可以直接导出函数：

```js
export default function myPlugin(app, options) {
  console.log('plugin installed', options)
}
```

### 5.3. 简化版 `i18n` 插件示例

下面是一个来自 Vue 官方文档提供的“简化版 `i18n` 插件示例”，演示了 Vue 插件典型实现逻辑：通过 `globalProperties` 挂一个全局可访问的 `$translate()` 方法。

```js
export default {
  install(app, options) {
    // 注入一个全局可用的 $translate() 方法
    app.config.globalProperties.$translate = (key) => {
      // 获取 `options` 对象的深层属性
      // 使用 `key` 作为索引
      return key.split('.').reduce((o, i) => {
        if (o) return o[i]
      }, options)
    }
  },
}
```

安装时把翻译字典传进去：

```js
import i18nPlugin from './plugins/i18n'

app.use(i18nPlugin, {
  greetings: {
    hello: 'Bonjour!',
  },
})
```

之后你就可以在模板里这样调用：

```html
<h1>{{ $translate('greetings.hello') }}</h1>
```

这个例子很好地说明了插件的特点：它不是给某个组件单独服务，而是给整个应用提供统一入口。

## 6. 🤔 插件里的 Provide / Inject 应该怎么配合？

除了挂全局属性，插件还可以通过 `provide / inject` 把资源注入到整个应用。

```js
export default {
  install(app, options) {
    app.provide('i18n', options)
  },
}
```

在任意后代组件中就可以取出来：

```html
<script setup>
  import { inject } from 'vue'

  const i18n = inject('i18n')
</script>

<template>
  <p>{{ i18n.greetings.hello }}</p>
</template>
```

这种方式和 `globalProperties` 有几个关键区别：

| 维度 | `provide / inject` | `globalProperties` |
| --- | --- | --- |
| 依赖感知 | 显式，组件通过 `inject()` 明确声明自己依赖了什么 | 隐式，模板里的 `$xxx` 来源不直观 |
| 响应性 | 支持。注入 `ref` 或 `reactive` 后，值变化会自动触发视图更新 | 不支持。挂到 `globalProperties` 上的值发生变化时，已渲染的组件不会自动更新 |
| TypeScript 类型 | 可以用泛型标注返回类型，如 `inject<MyType>('key')` | 需要额外的 `ComponentCustomProperties` 类型声明才能获得类型推断 |
| 模板便捷性 | 需要先 `import { inject }` 再调用，多一步 | 模板中直接用 `$xxx`，零导入 |

如果插件提供的是配置对象、服务实例、客户端 SDK，这类场景通常更适合 `provide / inject`。

## 7. 🤔 为什么要谨慎往 globalProperties 上挂东西？

因为它虽然方便，但很容易把项目变成“全局魔法现场”。

```js
app.config.globalProperties.$translate = translate
app.config.globalProperties.$request = request
app.config.globalProperties.$track = track
```

一旦这种全局入口越来越多，读代码的人就会碰到两个问题：

- 这个 `$xxx` 到底从哪儿来的？
- 它在所有应用实例里都存在吗？

官方文档也明确提醒了这件事：全局属性应该谨慎使用，过多会让应用难以理解和维护。

所以更务实的建议是：

- 面向全局模板方法时，再考虑 `globalProperties`
- 面向依赖注入的服务或配置时，优先 `provide / inject`
- 只在局部使用的逻辑，不要做成全局属性

## 8. 🤔 什么场景适合写成插件，什么场景不适合？

核心结论：如果一个能力离开“应用实例”仍然可以单独工作，那它未必需要插件化。

适合写成插件的场景一般有几个共性：

- 需要在应用启动时安装
- 需要多个页面或大量组件共享
- 需要访问应用实例 `app`
- 需要统一注册组件、指令、依赖注入或全局方法

比如：

- 路由系统 `Vue Router`
- 全局状态管理 `Vuex`、`Pinia`
- 国际化系统 `Vue I18n`
- 全局消息通知 `Vue Toastification`
- ……

不适合做成插件的，通常是这些：

- 只在单个模块里使用的小逻辑
- 单组件内部能力
- 只是一个普通工具函数
- 只是一个组合式函数就能解决的事情

## 9. 🤔 如果要发布给别人用，还要注意什么？

如果插件只在你自己的项目里使用，写到这里通常就够了。

但如果你想把它打包成 npm 包给别人复用，还要额外关注：

- 入口设计是否清晰
- 选项是否稳定
- 默认行为是否可预测
- TypeScript 类型是否完整
- 构建产物是否适合库发布

官方文档在这部分给出的建议很克制：如果要打包发布，可以参考 [Vite 的库模式][4]。

也就是说，Vue 插件的核心不是“怎么发包”，而是先把安装接口、全局能力和使用边界设计清楚，再谈发布。

## 10. 🤔 Vue 有插件市场吗？

你可以在 [Vue.js 官方提供的插件社区][5] 中查找 Vue 的相关插件。

这里面的插件由社区精选和维护，包含了一些常用的 Vue 插件。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-29-22-32-51.png)

## 11. 🔗 引用

- [Vue.js 官方文档 - 插件][1]
- [Vue.js 官方文档 - 依赖注入][2]
- [Vue.js 官方文档 - Application API][3]
- [Vite 官方文档 - Library Mode][4]
- [Vue.js 官方提供的插件社区][5]

[1]: https://cn.vuejs.org/guide/reusability/plugins.html
[2]: https://cn.vuejs.org/guide/components/provide-inject.html
[3]: https://cn.vuejs.org/api/application.html
[4]: https://vite.dev/guide/build.html#library-mode
[5]: https://www.vue-plugins.org/
