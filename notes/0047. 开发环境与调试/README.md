# [0047. 开发环境与调试](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0047.%20%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83%E4%B8%8E%E8%B0%83%E8%AF%95)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue Devtools 有哪些核心功能？如何高效使用？](#3--vue-devtools-有哪些核心功能如何高效使用)
- [4. 🤔 如何在 Vue 项目中配置 ESLint 和 Prettier？](#4--如何在-vue-项目中配置-eslint-和-prettier)
- [5. 🤔 Vue 项目中的环境变量和模式是如何工作的？](#5--vue-项目中的环境变量和模式是如何工作的)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Vue Devtools 的使用
- 配置 ESLint 与 Prettier
- 环境变量与模式（development、production）

## 2. 🫧 评价

- todo

## 3. 🤔 Vue Devtools 有哪些核心功能？如何高效使用？

Vue Devtools 是 Vue 官方提供的浏览器开发者工具扩展，支持 Chrome、Firefox 和 Edge。它是 Vue 开发中最重要的调试工具，提供了深入观察 Vue 应用运行时状态的能力。

安装方式：

```bash
# 方式一：浏览器扩展商店搜索 "Vue.js devtools" 安装
# Chrome Web Store / Firefox Add-ons

# 方式二：独立应用（支持任何浏览器）
npm install -g @vue/devtools
vue-devtools  # 启动独立窗口
```

```html
<!-- 独立应用需要在 HTML 中添加 -->
<script src="http://localhost:8098"></script>
```

Vue Devtools 的核心功能面板：

第一，Components（组件树）。这是最常用的面板，展示了当前页面的组件层级结构。你可以：

- 浏览整个组件树，点击组件查看其 props、data（state）、computed、provide/inject 等。
- 直接在面板中编辑响应式数据，实时看到页面更新（非常适合调试样式和状态）。
- 搜索和过滤组件。
- 点击"眼睛"图标在页面上高亮对应的 DOM 元素。
- 右键选择"Inspect DOM"跳转到 Elements 面板。
- 在控制台中通过 $vm 访问选中的组件实例。

第二，Pinia / Vuex 面板。展示状态管理库的全部状态：

- 查看所有 Store 的当前状态。
- 追踪 mutations（Vuex）或 actions（Pinia）的调用历史。
- 时间旅行调试（Time Travel）：可以回退到之前的状态快照，查看不同时间点的应用状态。
- 导入/导出状态：方便复现和调试特定场景。

第三，Router 面板。展示路由相关信息：

- 当前路由的完整信息（path、params、query、meta 等）。
- 路由历史记录。
- 所有路由的列表和参数。

第四，Timeline（时间线）。记录应用运行过程中的各种事件：

- 组件事件（mounted、updated 等生命周期）。
- 自定义事件的触发。
- 路由导航事件。
- 状态变更事件。
- 性能指标。

第五，性能分析。可以录制一段操作过程，分析组件的渲染耗时、更新频率等，找出性能瓶颈。

调试技巧：

```js
// 在代码中使用 console 辅助调试
import { getCurrentInstance } from 'vue'

// 在 setup 中获取当前组件实例（仅开发环境使用）
const instance = getCurrentInstance()
console.log(instance?.proxy)

// 使用 debugger 断点
function handleClick() {
  debugger // 浏览器会在这里暂停
  // ...
}
```

## 4. 🤔 如何在 Vue 项目中配置 ESLint 和 Prettier？

ESLint 负责检查代码质量和潜在错误，Prettier 负责格式化代码风格。两者配合使用可以保证团队代码的一致性。

在 Vue 项目中安装和配置：

```bash
# 安装 ESLint 和 Vue 相关插件
npm install -D eslint eslint-plugin-vue @vue/eslint-config-typescript

# 安装 Prettier 和 ESLint 集成
npm install -D prettier @vue/eslint-config-prettier
```

ESLint 配置文件（eslint.config.js，ESLint 9+ 扁平化配置）：

```js
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  { name: 'app/files-to-lint', files: ['**/*.{ts,mts,tsx,vue}'] },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/node_modules/**'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  skipFormatting,

  // 自定义规则
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'warn',
      'vue/require-default-prop': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
```

Prettier 配置文件：

```json
// .prettierrc.json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": true,
  "htmlWhitespaceSensitivity": "ignore"
}
```

在 package.json 中添加脚本：

```json
{
  "scripts": {
    "lint": "eslint . --fix",
    "format": "prettier --write src/"
  }
}
```

VS Code 集成配置（.vscode/settings.json）：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

推荐的 .vscode/extensions.json：

```json
{
  "recommendations": [
    "Vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

ESLint 和 Prettier 冲突的解决方案：使用 @vue/eslint-config-prettier 的 skip-formatting 配置，让 ESLint 不处理格式化相关的规则，格式化完全交给 Prettier 处理。这样两者各司其职，不会产生冲突。

## 5. 🤔 Vue 项目中的环境变量和模式是如何工作的？

Vue 项目（无论是 Vite 还是 Vue CLI）都支持通过 .env 文件来管理环境变量，不同的模式（mode）会加载不同的环境变量文件。

Vite 项目的环境变量：

```bash
# .env —— 所有模式都会加载
VITE_APP_TITLE=My Vue App
VITE_APP_VERSION=1.0.0

# .env.local —— 所有模式，但被 git 忽略（放敏感信息）
VITE_SECRET_KEY=abc123

# .env.development —— 仅 development 模式
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true

# .env.production —— 仅 production 模式
VITE_API_URL=https://api.example.com
VITE_DEBUG=false

# .env.staging —— 自定义模式
VITE_API_URL=https://staging-api.example.com
```

环境变量加载优先级（后面的覆盖前面的）：

```
.env < .env.local < .env.[mode] < .env.[mode].local
```

在 Vite 项目中使用环境变量：

```ts
// 在代码中访问（必须以 VITE_ 开头）
const apiUrl = import.meta.env.VITE_API_URL
const appTitle = import.meta.env.VITE_APP_TITLE

// 内置变量
import.meta.env.MODE // 当前模式：'development' | 'production' | 自定义
import.meta.env.BASE_URL // 应用的基础路径
import.meta.env.PROD // boolean，是否为生产模式
import.meta.env.DEV // boolean，是否为开发模式
import.meta.env.SSR // boolean，是否在服务端运行

// TypeScript 类型声明
// env.d.ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_DEBUG: string // 环境变量总是字符串
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

使用自定义模式：

```bash
# 使用 staging 模式启动
vite --mode staging

# 在 package.json 中配置
{
  "scripts": {
    "dev": "vite",
    "dev:staging": "vite --mode staging",
    "build": "vite build",
    "build:staging": "vite build --mode staging"
  }
}
```

在 vite.config.ts 中根据模式进行不同配置：

```ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // 加载对应模式的环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      // 可以自定义全局常量
      __APP_VERSION__: JSON.stringify(env.npm_package_version),
    },

    server: {
      proxy:
        mode === 'development'
          ? {
              '/api': { target: env.VITE_API_URL, changeOrigin: true },
            }
          : undefined,
    },

    build: {
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'terser' : false,
    },
  }
})
```

Vue CLI 项目的环境变量（区别）：

```bash
# Vue CLI 使用 VUE_APP_ 前缀（而不是 VITE_）
VUE_APP_API_URL=http://localhost:3000
VUE_APP_TITLE=My App

# 在代码中通过 process.env 访问
process.env.VUE_APP_API_URL
process.env.NODE_ENV  // 'development' 或 'production'
```

实际使用建议：将环境相关的配置（API 地址、第三方服务 Key 等）放在 .env 文件中管理，敏感信息放在 .env.local（已被 .gitignore 忽略）。不要在前端代码中放置真正的密钥，因为环境变量会被打包进客户端代码。
