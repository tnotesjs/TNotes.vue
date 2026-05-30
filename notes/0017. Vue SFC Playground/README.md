# [0017. Vue SFC Playground](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0017.%20Vue%20SFC%20Playground)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue SFC Playground 是什么？](#3--vue-sfc-playground-是什么)
- [4. 🤔 Vue SFC Playground 适用于哪些场景？它的使用边界是？](#4--vue-sfc-playground-适用于哪些场景它的使用边界是)
  - [4.1. Playground 实际支持的文件类型](#41-playground-实际支持的文件类型)
  - [4.2. 开发者可以通过 `main.js/main.ts` 这样的入口来接管 Vue 实例 app 对象的初始化吗？](#42-开发者可以通过-mainjsmaints-这样的入口来接管-vue-实例-app-对象的初始化吗)
- [5. 🔗 引用](#5--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Vue SFC Playground
- 适用场景及使用边界

## 2. 🫧 评价

该知识库中的大量示例都可以直接丢到 Vue SFC Playground 中在线测试，查看效果。

对于一些特殊示例，比如需要依赖外部第三方库或者需要访问 Vue 实例 `app` 的示例，不太推荐通过 Vue SFC Playground 来测试，因为它的环境比较受限，可能无法满足这些示例的需求。对于这类示例，更推荐在本地搭建一个 Vue 项目来测试，这样可以更灵活地配置环境和依赖。

## 3. 🤔 Vue SFC Playground 是什么？

Vue SFC Playground 是一个 Vue 官方提供的工具，用于在线快速上手测试一些简单的 Vue 单文件组件。读者可以在文档页面中直接编辑和运行 Vue 单文件组件代码，无需本地搭建开发环境。这对于快速验证想法、理解某个 API 的行为非常方便。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-25-22-02-46.png)

## 4. 🤔 Vue SFC Playground 适用于哪些场景？它的使用边界是？

先给结论：

- 如果你要测试的知识点仅设计到 `*.vue`，那基本都可以直接用它来快速测试。
- 如果你要测试的知识点还设计到其他文件（比如 `main.js`、`main.ts`）或者需要依赖一些第三方库，或者需要访问 Vue 实例 `app`，那就不太推荐了，因为它的环境比较受限，可能无法满足这些示例的需求。虽然也有解决方案，但是写起来很别扭，更推荐的做法是在本地搭建一个 Vue 项目来测试，这样可以更灵活地配置环境和依赖。

### 4.1. Playground 实际支持的文件类型

| 文件类型       | 说明                         |
| -------------- | ---------------------------- |
| `.vue`         | SFC 组件                     |
| `.js` / `.jsx` | JavaScript / JSX             |
| `.ts` / `.tsx` | TypeScript / TSX             |
| `.css`         | 样式                         |
| `.json`        | JSON（如 `import-map.json`） |

源码：`vuejs/repl` 中的 `src/editor/FileSelector.vue` 文件：

```ts
if (!/\.(vue|jsx?|tsx?|css|json)$/.test(filename)) {
  store.value.errors = [
    `Playground only supports *.vue, *.jsx?, *.tsx?, *.css, *.json files.`,
  ]
  return
}
```

### 4.2. 开发者可以通过 `main.js/main.ts` 这样的入口来接管 Vue 实例 app 对象的初始化吗？

在 play.vuejs.org 中，无法创建 `main.js/main.ts` 作为入口文件来管理 app 对象。原因如下：

play.vuejs.org 的宿主配置是固定的，`mainFile` 始终是 `src/App.vue`（默认值），用户无法修改。`Sandbox.vue` 的逻辑是：只有当 `mainFile` 以 `.vue` 结尾时，才自动注入 `createApp` + `mount` 代码。

```ts
// src/store.ts
export function useStore({
  files = ref(Object.create(null)),
  activeFilename = undefined!, // set later
  mainFile = ref('src/App.vue'),
  // ...
}) {
  // ...
}

// src/output/Sandbox.vue
// if main file is a vue file, mount it.
if (mainFile.endsWith('.vue')) {
  codeToEval.push(
    `import { ${isSSR ? `createSSRApp` : `createApp`} as _createApp } from "vue"
    ${previewOptions.value?.customCode?.importCode || ''}
    const _mount = () => {
      const AppComponent = __modules__["${mainFile}"].default
      AppComponent.name = 'Repl'
      const app = window.__app__ = _createApp(AppComponent)
      if (!app.config.hasOwnProperty('unwrapInjectedRef')) {
        app.config.unwrapInjectedRef = true
      }
      app.config.errorHandler = e => console.error(e)
      ${previewOptions.value?.customCode?.useCode || ''}
      app.mount('#app')
    }
    if (window.__ssr_promise__) {
      window.__ssr_promise__.then(_mount)
    } else {
      _mount()
    }`,
  )
}
// 简单来说，createApp API 的调用是项目内部自行维护的逻辑。
// createApp 的调用完全由 Sandbox.vue 内部生成和注入，不是用户在编辑器里写的代码。
// Sandbox.vue 在运行时动态拼接了这段代码并 eval 执行：
// 这段代码是 Sandbox.vue 自动生成的，不是用户写的
import { createApp as _createApp } from 'vue'
const _mount = () => {
  const AppComponent = __modules__['src/App.vue'].default
  const app = (window.__app__ = _createApp(AppComponent)) // __app__ 是 Sandbox.vue 注入的全局变量，指向当前的 Vue 应用实例
  app.mount('#app')
}
_mount()
```

如果要在 play.vuejs.org 中测试插件 demo（假设你测试的插件示例需要往 Vue 实例 app 中注入一些数据），可行的替代方案是：在 `App.vue` 里通过 `getCurrentInstance` 拿到 app 实例：

```html
<script setup>
  import { getCurrentInstance } from 'vue'
  import { MyPlugin } from './plugin.ts'

  const app = getCurrentInstance()?.appContext.app
  // __app__ == getCurrentInstance()?.appContext.app
  // __app__ 是 Sandbox.vue 注入的全局变量，指向当前的 Vue 应用实例，它跟 getCurrentInstance()?.appContext.app 是等价的
  app?.use(MyPlugin)
</script>
```

## 5. 🔗 引用

- [vuejs/repl][2]
- [Vue SFC Playground][1]

[1]: https://play.vuejs.org/
[2]: https://github.com/vuejs/repl
