# [0040. 为自定义全局指令标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0040.%20%E4%B8%BA%E8%87%AA%E5%AE%9A%E4%B9%89%E5%85%A8%E5%B1%80%E6%8C%87%E4%BB%A4%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 如何为自定义全局指令添加类型？](#3-如何为自定义全局指令添加类型)
  - [3.1. 给指令实现标注类型](#31-给指令实现标注类型)
  - [3.2. 注册全局指令](#32-注册全局指令)
  - [3.3. 为模板类型系统声明全局指令](#33-为模板类型系统声明全局指令)
  - [3.4. 带绑定值的指令类型](#34-带绑定值的指令类型)
  - [3.5. 使用 `DirectiveBinding` 单独标注 binding](#35-使用-directivebinding-单独标注-binding)
  - [3.6. 指令参数和修饰符的类型](#36-指令参数和修饰符的类型)
  - [3.7. 实战例子：`v-click-outside`](#37-实战例子v-click-outside)
  - [3.8. 常见错误](#38-常见错误)
    - [错误 1：只注册，不声明全局类型](#错误-1只注册不声明全局类型)
    - [错误 2：`GlobalDirectives` 里写错名字](#错误-2globaldirectives-里写错名字)
    - [错误 3：`.d.ts` 文件没有被 TS 收录](#错误-3dts-文件没有被-ts-收录)
  - [3.9. 推荐项目结构](#39-推荐项目结构)

<!-- endregion:toc -->

## 1. 本节内容

- todo

## 2. 评价

在 Vue 3 + TypeScript 中，为自定义全局指令添加类型，通常分两步：

1. 给指令实现本身标注类型
2. 通过模块扩展告诉 Vue 模板类型系统这个全局指令存在

最推荐使用：

```ts
import type { Directive } from 'vue'
```

## 3. 如何为自定义全局指令添加类型？

### 3.1. 给指令实现标注类型

例如一个全局 `v-focus` 指令：

```ts
// src/directives/focus.ts
import type { Directive } from 'vue'

export const vFocus: Directive<HTMLInputElement, void> = {
  mounted(el) {
    el.focus()
  },
}
```

这里：

```ts
Directive<HTMLInputElement, void>
```

含义是：

```ts
Directive<元素类型, 指令绑定值类型>
```

也就是：

- `el` 是 `HTMLInputElement`
- `binding.value` 不需要使用，所以写 `void`

### 3.2. 注册全局指令

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { vFocus } from './directives/focus'

const app = createApp(App)

app.directive('focus', vFocus)

app.mount('#app')
```

模板中使用：

```html
<input v-focus />
```

注意注册时写：

```ts
app.directive('focus', vFocus)
```

不是：

```ts
app.directive('v-focus', vFocus)
```

### 3.3. 为模板类型系统声明全局指令

创建一个声明文件，例如：

```ts
// src/types/global-directives.d.ts
import type { vFocus } from '@/directives/focus'

declare module 'vue' {
  export interface GlobalDirectives {
    vFocus: typeof vFocus
  }
}

export {}
```

重点是这里的名字：

```ts
vFocus
```

对应模板里的：

```html
v-focus
```

也就是说：

| 注册名          | 模板写法          | 类型声明名      |
| --------------- | ----------------- | --------------- |
| `focus`         | `v-focus`         | `vFocus`        |
| `permission`    | `v-permission`    | `vPermission`   |
| `click-outside` | `v-click-outside` | `vClickOutside` |

### 3.4. 带绑定值的指令类型

比如一个权限指令：

```ts
// src/directives/permission.ts
import type { Directive } from 'vue'

export type Permission = 'user:create' | 'user:delete' | 'role:update'

export const vPermission: Directive<HTMLElement, Permission | Permission[]> = {
  mounted(el, binding) {
    const value = binding.value

    const permissions = Array.isArray(value) ? value : [value]

    console.log(permissions)
  },
}
```

这里：

```ts
binding.value
```

的类型就是：

```ts
Permission | Permission[]
```

注册：

```ts
app.directive('permission', vPermission)
```

声明全局类型：

```ts
// src/types/global-directives.d.ts
import type { vPermission } from '@/directives/permission'

declare module 'vue' {
  export interface GlobalDirectives {
    vPermission: typeof vPermission
  }
}

export {}
```

模板中：

```html
<button v-permission="'user:create'">新建用户</button>

<button v-permission="['user:create', 'user:delete']">操作用户</button>
```

如果传错类型，新版 `vue-tsc` / Vue Language Tools 可以给出类型提示：

```html
<button v-permission="123">错误</button>
```

### 3.5. 使用 `DirectiveBinding` 单独标注 binding

有时候你想单独标注 `binding`，可以使用：

```ts
import type { DirectiveBinding } from 'vue'
```

例如：

```ts
import type { Directive, DirectiveBinding } from 'vue'

interface TooltipValue {
  text: string
  color?: string
}

function applyTooltip(
  el: HTMLElement,
  binding: DirectiveBinding<TooltipValue>,
) {
  el.setAttribute('title', binding.value.text)
}

export const vTooltip: Directive<HTMLElement, TooltipValue> = {
  mounted(el, binding) {
    applyTooltip(el, binding)
  },
  updated(el, binding) {
    applyTooltip(el, binding)
  },
}
```

不过一般情况下，只要给整个指令写：

```ts
Directive<HTMLElement, TooltipValue>
```

`binding.value` 就可以自动推导出来。

### 3.6. 指令参数和修饰符的类型

如果你的 Vue 类型版本支持更多泛型，也可以标注参数和修饰符。

例如：

```html
<div v-tooltip:top.delay="'hello'" />
```

可以写：

```ts
import type { Directive } from 'vue'

type TooltipValue = string

type TooltipModifier = 'delay' | 'html'

type TooltipArg = 'top' | 'bottom' | 'left' | 'right'

export const vTooltip: Directive<
  HTMLElement,
  TooltipValue,
  TooltipModifier,
  TooltipArg
> = {
  mounted(el, binding) {
    binding.value
    // string

    binding.arg
    // 'top' | 'bottom' | 'left' | 'right' | undefined

    binding.modifiers.delay
    // boolean | undefined

    binding.modifiers.html
    // boolean | undefined
  },
}
```

如果你的 Vue 版本中 `Directive` 只有两个泛型，就使用：

```ts
Directive<HTMLElement, TooltipValue>
```

即可。

### 3.7. 实战例子：`v-click-outside`

```ts
// src/directives/clickOutside.ts
import type { Directive } from 'vue'

type ClickOutsideHandler = (event: MouseEvent) => void

interface ClickOutsideElement extends HTMLElement {
  __clickOutsideHandler__?: EventListener
}

export const vClickOutside: Directive<
  ClickOutsideElement,
  ClickOutsideHandler
> = {
  mounted(el, binding) {
    const handler = (event: Event) => {
      const target = event.target as Node | null

      if (target && !el.contains(target)) {
        binding.value(event as MouseEvent)
      }
    }

    el.__clickOutsideHandler__ = handler
    document.addEventListener('click', handler)
  },

  unmounted(el) {
    if (el.__clickOutsideHandler__) {
      document.removeEventListener('click', el.__clickOutsideHandler__)
      delete el.__clickOutsideHandler__
    }
  },
}
```

注册：

```ts
app.directive('click-outside', vClickOutside)
```

声明类型：

```ts
// src/types/global-directives.d.ts
import type { vClickOutside } from '@/directives/clickOutside'

declare module 'vue' {
  export interface GlobalDirectives {
    vClickOutside: typeof vClickOutside
  }
}

export {}
```

模板使用：

```html
<script setup lang="ts">
  function handleClickOutside(event: MouseEvent) {
    console.log('outside', event)
  }
</script>

<template>
  <div v-click-outside="handleClickOutside">内容</div>
</template>
```

### 3.8. 常见错误

#### 错误 1：只注册，不声明全局类型

```ts
app.directive('focus', vFocus)
```

这样运行时可以用，但模板类型系统可能不知道 `v-focus` 的类型。

推荐额外写：

```ts
declare module 'vue' {
  export interface GlobalDirectives {
    vFocus: typeof vFocus
  }
}
```

#### 错误 2：`GlobalDirectives` 里写错名字

错误：

```ts
declare module 'vue' {
  export interface GlobalDirectives {
    focus: typeof vFocus
  }
}
```

正确：

```ts
declare module 'vue' {
  export interface GlobalDirectives {
    vFocus: typeof vFocus
  }
}
```

因为模板中用的是：

```html
v-focus
```

对应类型名是：

```ts
vFocus
```

#### 错误 3：`.d.ts` 文件没有被 TS 收录

确保你的 `tsconfig.json` 包含了声明文件，例如：

```json
{
  "include": ["src//*.ts", "src//*.tsx", "src//*.vue", "src//*.d.ts"]
}
```

### 3.9. 推荐项目结构

```txt
src/
  directives/
    focus.ts
    permission.ts
    clickOutside.ts
    index.ts
  types/
    global-directives.d.ts
  main.ts
```

例如：

```ts
// src/directives/index.ts
import type { App } from 'vue'

import { vFocus } from './focus'
import { vPermission } from './permission'
import { vClickOutside } from './clickOutside'

export function setupDirectives(app: App) {
  app.directive('focus', vFocus)
  app.directive('permission', vPermission)
  app.directive('click-outside', vClickOutside)
}
```

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { setupDirectives } from './directives'

const app = createApp(App)

setupDirectives(app)

app.mount('#app')
```

# 总结

自定义全局指令推荐这样加类型：

```ts
import type { Directive } from 'vue'

export const vFocus: Directive<HTMLInputElement, void> = {
  mounted(el) {
    el.focus()
  },
}
```

注册：

```ts
app.directive('focus', vFocus)
```

声明模板全局类型：

```ts
import type { vFocus } from '@/directives/focus'

declare module 'vue' {
  export interface GlobalDirectives {
    vFocus: typeof vFocus
  }
}

export {}
```

核心记住：

1. 指令实现用 `Directive<元素类型, 绑定值类型>`。
2. 全局注册用 `app.directive('name', directive)`。
3. 模板类型声明用 `GlobalDirectives`。
4. `v-focus` 对应类型声明名是 `vFocus`。
5. `.d.ts` 文件必须被 `tsconfig.json` 收录。
