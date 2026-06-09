# [0102. 生产部署](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0102.%20%E7%94%9F%E4%BA%A7%E9%83%A8%E7%BD%B2)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 开发环境和生产环境的 Vue 到底差在哪？](#3-开发环境和生产环境的-vue-到底差在哪)
- [4. 不用构建工具时，生产部署最关键的点是什么？](#4-不用构建工具时生产部署最关键的点是什么)
- [5. 使用构建工具时，需要额外关心哪些生产配置？](#5-使用构建工具时需要额外关心哪些生产配置)
- [6. 上线后怎么追踪运行时错误？](#6-上线后怎么追踪运行时错误)
- [7. 引用](#7-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 环境差异
- 生产构建
- CDN 版本
- Bundler 配置
- 编译标记
- 错误追踪
- 上线检查
- 参考资料

## 2. 评价

生产部署这一节不长，但非常实用。它的核心不是“怎么发到服务器”，而是确保你上线的真的是生产版本，同时保留必要的错误追踪能力。很多项目线上性能和包体积异常，问题往往就出在这里。

## 3. 开发环境和生产环境的 Vue 到底差在哪？

Vue 在开发环境里会开启很多只服务于开发体验的能力，比如：

- 常见错误和隐患警告
- Props / Emits 校验
- 响应式调试钩子
- DevTools 集成

这些能力在开发时很有价值，但在生产环境里没有必要继续保留，因为它们会带来额外代码和少量运行时开销。

所以生产部署的基本目标就是两件事：

1. 去掉开发专用代码分支
2. 交付真正面向生产的最小化构建

## 4. 不用构建工具时，生产部署最关键的点是什么？

如果你是从 CDN 或其他静态源直接引入 Vue，而不是通过 Vite / webpack 打包，那么最重要的事就是用对生产构建文件。

官方建议：

- 全局变量版本使用 `vue.global.prod.js`
- 浏览器原生 ESM 版本使用 `vue.esm-browser.prod.js`

也就是说，文件名里带 `.prod.js` 才是面向生产环境的版本。

如果你误用了开发版，线上就会：

- 包更大
- 带着开发期分支逻辑
- 带着本不该出现在生产环境的警告开销

## 5. 使用构建工具时，需要额外关心哪些生产配置？

如果你是用 `create-vue` 创建项目，通常已经预设好了生产构建配置；Vue CLI 项目也类似。

但如果你自己搭建 bundler，官方特别提醒要确认下面几点：

1. `vue` 被正确解析到 `vue.runtime.esm-bundler.js`
2. 编译时功能标记配置正确
3. `process.env.NODE_ENV` 会在构建时替换成 `"production"`

这些设置的目的都很明确：

- 让 Vue 走对 bundler 版本
- 让无用代码可以被消除
- 让最终产物进入生产模式

如果你使用 Vite，实际生产部署通常就是两步：

```sh
pnpm build
pnpm preview
```

第一步产出静态资源，第二步仅用于本地预览生产包效果。

## 6. 上线后怎么追踪运行时错误？

生产环境不会像开发环境那样把问题直接弹到你眼前，所以错误追踪必须提前接好。

Vue 提供了应用级错误处理入口：

```js
import { createApp } from 'vue'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  // 上报到错误监控服务
}
```

官方也直接提到了成熟的集成方案：

- Sentry
- Bugsnag

这类服务适合用来收集：

- 运行时异常
- 组件栈信息
- 用户环境信息
- 发布版本关联

所以生产部署的完整思路应该是：

- 构建正确的生产包
- 部署静态资源或服务端产物
- 补上错误监控与回溯能力

## 7. 引用

- [Vue.js 官方文档 - 生产部署][1]
- [Vite - 构建生产版本][2]
- [Vite - 静态部署指南][3]
- [Vue.js 官方文档 - 编译时功能标记][4]
- [Sentry for Vue][5]

[1]: https://cn.vuejs.org/guide/best-practices/production-deployment.html
[2]: https://cn.vitejs.dev/guide/build.html
[3]: https://cn.vitejs.dev/guide/static-deploy.html
[4]: https://cn.vuejs.org/api/compile-time-flags.html
[5]: https://docs.sentry.io/platforms/javascript/guides/vue/
