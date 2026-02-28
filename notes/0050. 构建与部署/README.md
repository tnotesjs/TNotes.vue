# [0050. 构建与部署](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0050.%20%E6%9E%84%E5%BB%BA%E4%B8%8E%E9%83%A8%E7%BD%B2)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue 项目如何进行生产环境构建与优化？](#3--vue-项目如何进行生产环境构建与优化)
- [4. 🤔 路由模式对部署有什么影响？history 模式如何配置后端？](#4--路由模式对部署有什么影响history-模式如何配置后端)
- [5. 🤔 如何将 Vue 应用部署到 Nginx、Netlify 和 Vercel？](#5--如何将-vue-应用部署到-nginxnetlify-和-vercel)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 生产环境构建与优化
- 路由模式与部署配置（history 模式的后端配置）
- 部署到 Nginx、Netlify、Vercel

## 2. 🫧 评价

- todo

## 3. 🤔 Vue 项目如何进行生产环境构建与优化？

生产环境构建的目标是生成体积小、加载快、性能好的静态文件。Vite 和 Vue CLI 都提供了丰富的构建优化手段。

基本构建命令：

```bash
# Vite
npm run build   # vite build

# Vue CLI
npm run build   # vue-cli-service build
```

Vite 生产构建优化配置：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    // 指定目标浏览器
    target: 'es2015',

    // 压缩方式：'terser' 更小，'esbuild' 更快
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true, // 移除 debugger
      },
    },

    // 代码分割
    rollupOptions: {
      output: {
        // 手动分块：将大的第三方库分到单独的 chunk
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
        },

        // 或者使用函数更灵活
        // manualChunks(id) {
        //   if (id.includes('node_modules')) {
        //     if (id.includes('vue') || id.includes('pinia')) return 'vue-vendor'
        //     return 'vendor'
        //   }
        // },

        // 自定义文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // chunk 大小警告阈值
    chunkSizeWarningLimit: 500,

    // 是否生成 sourcemap
    sourcemap: false,

    // CSS 代码分割
    cssCodeSplit: true,
  },
})
```

常用的构建优化策略：

第一，路由级别的代码分割（懒加载）：

```ts
// router/index.ts
const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue'), // 懒加载
  },
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue'),
  },
  {
    path: '/settings',
    // 使用 webpackChunkName（webpack）或自定义 chunk 名
    component: () => import(/* @vite-ignore */ '../views/Settings.vue'),
  },
]
```

第二，组件级按需导入（特别是 UI 库）：

```ts
// 全量导入（不推荐，包体积大）
import ElementPlus from 'element-plus'

// 按需导入（推荐）
import { ElButton, ElInput, ElTable } from 'element-plus'

// 或者使用 unplugin-vue-components 自动按需导入
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

第三，图片和资源优化：

```ts
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: { plugins: [{ name: 'removeViewBox' }] },
    }),
  ],
  build: {
    // 小于 4KB 的资源内联为 base64
    assetsInlineLimit: 4096,
  },
})
```

第四，使用 rollup-plugin-visualizer 分析包体积：

```bash
npm install -D rollup-plugin-visualizer
```

```ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

构建后使用 `npx vite preview` 可以本地预览生产构建结果。

## 4. 🤔 路由模式对部署有什么影响？history 模式如何配置后端？

Vue Router 提供了两种路由模式：hash 模式和 history 模式。路由模式的选择直接影响部署配置。

```ts
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'

// Hash 模式：URL 中有 #
// http://example.com/#/about
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    /* ... */
  ],
})

// History 模式：URL 更美观
// http://example.com/about
const router = createRouter({
  history: createWebHistory(),
  routes: [
    /* ... */
  ],
})
```

Hash 模式的 URL 包含 # 号，# 后面的部分不会发送到服务器，浏览器仅在客户端处理路由变化。这意味着不需要任何服务器配置就能正常工作，因为服务器始终返回 index.html。

History 模式使用 HTML5 History API（pushState / replaceState），URL 更加美观，没有 # 号。但这带来了一个问题：当用户直接访问 /about 或刷新页面时，浏览器会向服务器请求 /about 路径。如果服务器没有配置对应的路由，就会返回 404。

解决方案是配置服务器：对于所有找不到的路径，都返回 index.html，让前端路由接管。

Nginx 配置：

```nginx
server {
    listen 80;
    server_name example.com;
    root /usr/share/nginx/html;

    # 关键配置：对所有路径尝试查找文件，找不到就返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 如果应用部署在子路径下
    # location /my-app/ {
    #     try_files $uri $uri/ /my-app/index.html;
    # }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
}
```

Apache 配置（.htaccess）：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Node.js (Express) 配置：

```js
const express = require('express')
const history = require('connect-history-api-fallback')
const path = require('path')

const app = express()

// 必须在 express.static 之前
app.use(history())
app.use(express.static(path.join(__dirname, 'dist')))

app.listen(3000)
```

需要注意的是，这种配置下服务器不再返回 404 页面（因为所有路径都返回 index.html）。你需要在 Vue Router 中配置一个兜底路由来处理 404：

```ts
const routes = [
  // ...其他路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
]
```

## 5. 🤔 如何将 Vue 应用部署到 Nginx、Netlify 和 Vercel？

三种部署方式从传统服务器到现代云平台各有特点。

Nginx 部署（传统服务器）：

```bash
# 1. 构建项目
npm run build

# 2. 将 dist 目录上传到服务器
scp -r dist/* user@server:/usr/share/nginx/html/

# 3. 配置 Nginx
sudo vim /etc/nginx/sites-available/my-vue-app
```

```nginx
server {
    listen 80;
    server_name myapp.example.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTTPS 配置（使用 Let's Encrypt）
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/myapp.example.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/myapp.example.com/privkey.pem;
}
```

```bash
# 4. 启用站点并重启 Nginx
sudo ln -s /etc/nginx/sites-available/my-vue-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Netlify 部署（推荐方式——Git 集成自动部署）：

```bash
# 方式一：通过 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化并关联 Git 仓库
netlify init

# 手动部署
netlify deploy --prod --dir=dist
```

Netlify 配置文件（netlify.toml）：

```toml
[build]
  command = "npm run build"
  publish = "dist"

# SPA 路由重定向（等同于 history 模式配置）
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# 自定义 headers
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# 环境变量
[build.environment]
  VITE_API_URL = "https://api.example.com"
```

也可以直接在 Netlify 控制台关联 GitHub 仓库，每次 push 自动触发构建和部署。

Vercel 部署（与 Netlify 类似的自动化平台）：

```bash
# 方式一：通过 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署（首次会引导配置）
vercel

# 部署到生产环境
vercel --prod
```

Vercel 配置文件（vercel.json）：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

也可以直接在 Vercel 控制台导入 GitHub 仓库，自动检测 Vue/Vite 项目并配置。

三种方案的对比：

| 特性       | Nginx              | Netlify       | Vercel        |
| ---------- | ------------------ | ------------- | ------------- |
| 配置复杂度 | 高                 | 低            | 低            |
| 自动部署   | 需要自行配置 CI/CD | 内置          | 内置          |
| HTTPS      | 需手动配置         | 自动          | 自动          |
| CDN        | 需手动配置         | 内置          | 内置          |
| 自定义域名 | 完全控制           | 支持          | 支持          |
| 成本       | 服务器费用         | 免费额度充足  | 免费额度充足  |
| 适用场景   | 企业内部/完全控制  | 个人/开源项目 | 个人/开源项目 |

部署前的检查清单：

```bash
# 1. 确认 base 配置（如果部署到子路径）
# vite.config.ts: base: '/my-app/'
# 2. 确认环境变量已正确配置
# 3. 本地预览构建结果
npm run build && npm run preview
# 4. 检查构建产物大小
ls -la dist/assets/
```
