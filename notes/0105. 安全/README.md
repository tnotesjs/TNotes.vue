# [0105. 安全](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0105.%20%E5%AE%89%E5%85%A8)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue 安全文档最重要的一条规则是什么？](#3--vue-安全文档最重要的一条规则是什么)
- [4. 🤔 Vue 默认帮我们挡住了哪些常见注入风险？](#4--vue-默认帮我们挡住了哪些常见注入风险)
  - [4.1. HTML 内容转义](#41-html-内容转义)
  - [4.2. Attribute 绑定转义](#42-attribute-绑定转义)
- [5. 🤔 哪些场景会把你重新带回危险区？](#5--哪些场景会把你重新带回危险区)
  - [5.1. `v-html`](#51-v-html)
  - [5.2. 挂载到不可信 DOM](#52-挂载到不可信-dom)
- [6. 🤔 为什么 URL、样式和事件属性也会成为安全问题？](#6--为什么-url样式和事件属性也会成为安全问题)
  - [6.1. URL 注入](#61-url-注入)
  - [6.2. 样式注入](#62-样式注入)
  - [6.3. JavaScript 注入](#63-javascript-注入)
- [7. 🤔 除了前端代码本身，还要和后端、SSR 一起考虑什么？](#7--除了前端代码本身还要和后端ssr-一起考虑什么)
  - [7.1. 及时升级和漏洞上报](#71-及时升级和漏洞上报)
  - [7.2. 和后端协同处理 HTTP 层安全](#72-和后端协同处理-http-层安全)
  - [7.3. SSR 额外风险](#73-ssr-额外风险)
- [8. 🔗 引用](#8--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 首要规则
- 自动转义
- HTML 注入
- URL 注入
- 样式注入
- JS 注入
- 后端协同
- SSR 注意

## 2. 🫧 评价

Vue 安全文档的价值在于把边界讲得很清楚：Vue 会自动帮你处理一部分安全问题，但前提是你别主动绕开这些保护。最值得记住的不是某个 API，而是“不要把不可信内容当模板、HTML、脚本或可执行 URL 来渲染”。

## 3. 🤔 Vue 安全文档最重要的一条规则是什么？

最重要的规则只有一句话：不要使用无法信赖的模板。

官方给出的原因很直接：Vue 模板会被编译成 JavaScript，模板里的表达式会在渲染过程中执行。也就是说，如果你把用户提供的字符串直接当模板拼进去，本质上就是把执行权交给了对方。

```js
Vue.createApp({
  template: `<div>` + userProvidedString + `</div>`,
}).mount('#app')
```

上面这种做法官方明确说“永远不要这样做”。

如果还叠加 SSR，风险会更高，因为不可信模板甚至可能在服务端执行。

## 4. 🤔 Vue 默认帮我们挡住了哪些常见注入风险？

Vue 默认会做两类非常重要的自动转义。

### 4.1. HTML 内容转义

```vue
<h1>{{ userProvidedString }}</h1>
```

如果字符串里包含 `<script>`，Vue 不会把它当成脚本执行，而是把它作为普通文本输出。

### 4.2. Attribute 绑定转义

```vue
<h1 :title="userProvidedString">hello</h1>
```

如果字符串里试图注入 `onclick` 一类内容，也会在 attribute 层面被安全转义。

这一层保护的意义在于：

- 你用普通插值表达式渲染文本，一般是安全的
- 你用常规动态属性绑定字符串，一般也是安全的

但这不代表“什么都能绑定”。

## 5. 🤔 哪些场景会把你重新带回危险区？

最典型的就是你主动要求 Vue 渲染不可信 HTML。

### 5.1. `v-html`

```vue
<div v-html="userProvidedHtml"></div>
```

一旦这样做，Vue 的默认 HTML 转义就被绕开了。官方态度非常明确：用户提供的 HTML 永远不能被视为 100% 安全，除非它被限制在 iframe 这类沙盒环境里，或者它只会回显给同一个用户自己看。

### 5.2. 挂载到不可信 DOM

官方还特别提醒：不要把 Vue 挂载到可能已经包含用户内容或服务端渲染 HTML 的 DOM 节点上。因为原本在普通 HTML 里看起来无害的内容，进入 Vue 模板解析环境后可能就不再安全。

## 6. 🤔 为什么 URL、样式和事件属性也会成为安全问题？

因为安全问题从来不只有 `script` 标签。

### 6.1. URL 注入

```vue
<a :href="userProvidedUrl">click me</a>
```

如果用户传入的是 `javascript:` URL，就可能把点击操作变成脚本执行。

官方提到可以用类似 `sanitize-url` 这类库做处理，但也强调：如果你需要在前端兜底 URL 无害化，通常说明更前面的数据入口已经存在风险。

### 6.2. 样式注入

```vue
<a :href="sanitizedUrl" :style="userProvidedStyles">click me</a>
```

即便 URL 已经是安全的，恶意样式仍可能通过覆盖、定位等方式制造点击劫持。

所以官方建议：

- 尽量不要允许用户自由控制整段 CSS
- 真要开放样式能力，优先使用对象语法，只暴露可控字段

```vue
<a
  :href="sanitizedUrl"
  :style="{
    color: userProvidedColor,
    background: userProvidedBackground,
  }"
>
  click me
</a>
```

### 6.3. JavaScript 注入

Vue 不建议渲染 `<script>`，但风险还不止这一种。像 `onclick`、`onfocus` 这类能接收字符串形式 JavaScript 的 attribute，同样不应该绑定用户提供的内容。

本质上只要某段用户内容会被当成“可执行逻辑”，就已经越线了。

## 7. 🤔 除了前端代码本身，还要和后端、SSR 一起考虑什么？

### 7.1. 及时升级和漏洞上报

官方建议始终使用最新版本的 Vue 及其官方配套库。如果发现安全问题，应该通过 `security@vuejs.org` 进行私下上报。

### 7.2. 和后端协同处理 HTTP 层安全

像这些问题并不是 Vue 自己能解决的：

- CSRF / XSRF
- XSSI
- 服务端输入校验
- 权限控制

前端需要做的是和后端约定好：

- token 如何传递
- 哪些字段可被信任
- 哪些输出必须先做无害化处理

### 7.3. SSR 额外风险

官方也专门提醒：SSR 有自己的安全注意事项。因为此时模板执行和 HTML 输出发生在服务端，错误的信任边界会让后果更严重。

所以如果项目用了 SSR，就要把 [SSR 文档](https://cn.vuejs.org/guide/scaling-up/ssr.html) 中的实践一起纳入安全审查。

## 8. 🔗 引用

- [Vue.js 官方文档 - 安全][1]
- [OWASP XSS Prevention Cheat Sheet][2]
- [HTML5 Security Cheat Sheet][3]
- [Vue.js 官方文档 - 服务端渲染（SSR）][4]

[1]: https://cn.vuejs.org/guide/best-practices/security.html
[2]: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
[3]: https://html5sec.org/
[4]: https://cn.vuejs.org/guide/scaling-up/ssr.html
