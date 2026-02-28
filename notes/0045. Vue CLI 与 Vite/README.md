# [0045. Vue CLI 与 Vite](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0045.%20Vue%20CLI%20%E4%B8%8E%20Vite)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue CLI 如何安装和创建项目？其目录结构是怎样的？](#3--vue-cli-如何安装和创建项目其目录结构是怎样的)
- [4. 🤔 Vite 相比 Vue CLI 有什么优势？](#4--vite-相比-vue-cli-有什么优势)
- [5. 🤔 如何通过 Vite 创建和配置 Vue 3 项目？](#5--如何通过-vite-创建和配置-vue-3-项目)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Vue CLI 的安装与项目创建
- Vue CLI 的目录结构与配置
- Vite 的优势与使用
- 通过 Vite 创建 Vue 3 项目

## 2. 🫧 评价

- todo

## 3. 🤔 Vue CLI 如何安装和创建项目？其目录结构是怎样的？

Vue CLI 是 Vue 官方提供的标准化项目脚手架工具，基于 webpack 构建，提供了一套完整的项目创建、开发、构建、测试的工具链。

安装和创建项目：

```bash
# 全局安装 Vue CLI
npm install -g @vue/cli

# 查看版本
vue --version

# 创建项目（交互式）
vue create my-project

# 创建过程中可以选择：
# - Vue 版本（2 或 3）
# - 是否使用 TypeScript
# - 路由（Vue Router）
# - 状态管理（Vuex / Pinia）
# - CSS 预处理器（Sass / Less / Stylus）
# - 代码规范（ESLint + Prettier）
# - 单元测试框架（Jest / Mocha）
# - E2E 测试框架（Cypress）

# 也可以使用图形化界面
vue ui
```

Vue CLI 创建的项目目录结构：

```
my-project/
  node_modules/       # 依赖包
  public/
    index.html        # HTML 模板
    favicon.ico
  src/
    assets/           # 静态资源（会被 webpack 处理）
    components/       # 组件
    router/           # 路由配置（选装）
      index.js
    store/            # 状态管理（选装）
      index.js
    views/            # 页面级组件
    App.vue           # 根组件
    main.js           # 入口文件
  .eslintrc.js        # ESLint 配置
  babel.config.js     # Babel 配置
  vue.config.js       # Vue CLI 配置文件
  package.json
```

vue.config.js 是 Vue CLI 的核心配置文件：

```js
// vue.config.js
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  // 部署应用包时的基本 URL
  publicPath: process.env.NODE_ENV === 'production' ? '/my-app/' : '/',

  // 构建输出目录
  outputDir: 'dist',

  // 静态资源目录
  assetsDir: 'static',

  // 开发服务器配置
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },

  // webpack 配置
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src'),
      },
    },
  },

  // CSS 相关配置
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
})
```

需要注意的是，Vue CLI 目前已进入维护模式，Vue 官方推荐新项目使用 Vite。

## 4. 🤔 Vite 相比 Vue CLI 有什么优势？

Vite 是尤雨溪创建的新一代前端构建工具，与 Vue CLI（基于 webpack）相比，有以下核心优势：

第一，极快的冷启动速度。webpack 在启动开发服务器时需要先打包整个应用，项目越大启动越慢（大型项目可能需要几十秒甚至几分钟）。Vite 利用浏览器原生的 ES Module 支持，开发服务器启动时不需要打包，而是按需编译——浏览器请求哪个模块，Vite 才去编译它：

```
webpack 启动流程：
入口 -> 解析所有依赖 -> 打包所有模块 -> 启动开发服务器 -> 浏览器访问

Vite 启动流程：
启动开发服务器 -> 浏览器访问 -> 按需编译请求的模块
```

Vite 会将依赖（node_modules 中不常变的库）使用 esbuild 预构建并缓存（esbuild 用 Go 编写，比 JavaScript 编写的打包器快 10-100 倍），源代码（经常变化的业务代码）则利用原生 ESM 按需提供。

第二，极快的热更新（HMR）。在 webpack 中，文件修改后需要重新构建受影响的模块链，项目越大越慢。Vite 的 HMR 是基于原生 ESM 的，只需要精确地让已修改的模块失效重新请求，速度与项目规模无关：

```
比如修改了一个组件：

webpack HMR：
找到修改的模块 -> 重新构建受影响的 chunk -> 推送更新

Vite HMR：
检测到文件变化 -> 让浏览器重新请求该模块 -> 完成更新
```

第三，开箱即用的现代功能支持。Vite 内置了对 TypeScript、JSX、CSS 预处理器、PostCSS、CSS Modules 等的支持，无需安装额外的 loader 或 plugin：

```bash
# Vite 项目中使用 TypeScript：直接写 .ts 文件即可
# 使用 Sass：只需装 sass，无需配置 loader
npm install -D sass

# CSS Modules：文件名用 .module.css 即可
# JSX：直接写即可（Vue 插件已内置支持）
```

第四，更好的构建优化。Vite 生产构建使用 Rollup，天然支持 Tree-shaking、代码分割、动态导入等优化。相比 webpack，Rollup 生成的代码更干净、体积更小。

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  build: {
    // 构建选项
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
})
```

## 5. 🤔 如何通过 Vite 创建和配置 Vue 3 项目？

使用 Vite 创建 Vue 3 项目非常简单：

```bash
# 使用 create-vue（Vue 官方脚手架，基于 Vite）
npm create vue@latest

# 或使用 Vite 直接创建
npm create vite@latest my-project -- --template vue
# TypeScript 模板
npm create vite@latest my-project -- --template vue-ts

# 进入项目并安装依赖
cd my-project
npm install
npm run dev
```

create-vue 的交互式创建过程会让你选择项目特性：

```
✔ 项目名称 … my-vue-app
✔ 是否使用 TypeScript？ … 是
✔ 是否使用 JSX？ … 否
✔ 是否使用 Vue Router？ … 是
✔ 是否使用 Pinia？ … 是
✔ 是否使用 Vitest 进行单元测试？ … 是
✔ 是否使用 ESLint？ … 是
✔ 是否使用 Prettier？ … 是
```

生成的项目目录结构：

```
my-vue-app/
  public/
    favicon.ico
  src/
    assets/
    components/
    router/
      index.ts
    stores/
      counter.ts
    views/
      HomeView.vue
      AboutView.vue
    App.vue
    main.ts
  index.html            # 入口 HTML（在根目录，非 public）
  vite.config.ts        # Vite 配置
  tsconfig.json
  package.json
```

Vite 配置文件的详细说明：

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],

    // 路径别名
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    // 开发服务器
    server: {
      port: 5173,
      open: true, // 自动打开浏览器
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    // CSS 配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables" as *;`,
        },
      },
    },

    // 构建配置
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
```

环境变量文件：

```bash
# .env
VITE_APP_TITLE=My App

# .env.development
VITE_API_BASE_URL=http://localhost:3000

# .env.production
VITE_API_BASE_URL=https://api.example.com
```

```ts
// 在代码中使用（必须以 VITE_ 开头）
console.log(import.meta.env.VITE_APP_TITLE)
console.log(import.meta.env.VITE_API_BASE_URL)
console.log(import.meta.env.MODE) // 'development' 或 'production'
console.log(import.meta.env.DEV) // true / false
console.log(import.meta.env.PROD) // true / false
```

常用命令：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --build --force",
    "lint": "eslint . --fix"
  }
}
```
