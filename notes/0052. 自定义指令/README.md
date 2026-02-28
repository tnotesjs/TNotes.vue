# [0052. 自定义指令](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0052.%20%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8C%87%E4%BB%A4)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 全局指令和局部指令如何注册和使用？](#3--全局指令和局部指令如何注册和使用)
- [4. 🤔 自定义指令的钩子函数有哪些？各在什么时机触发？](#4--自定义指令的钩子函数有哪些各在什么时机触发)
- [5. 🤔 有哪些常用的自定义指令实战案例？](#5--有哪些常用的自定义指令实战案例)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 全局指令与局部指令
- 指令的钩子函数
- 实际案例：权限控制、防抖、懒加载

## 2. 🫧 评价

- todo

## 3. 🤔 全局指令和局部指令如何注册和使用？

Vue 的自定义指令允许你在普通 DOM 元素上复用底层 DOM 操作的逻辑。指令以 v- 前缀使用（如 v-focus、v-permission），可以在全局或组件级别注册。

全局指令注册——在整个应用的任何组件中都可以使用：

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 注册全局指令 v-focus
app.directive('focus', {
  mounted(el) {
    el.focus()
  },
})

// 简写形式：只需要 mounted 和 updated 行为相同时
app.directive('color', (el, binding) => {
  el.style.color = binding.value
})

app.mount('#app')
```

```html
<!-- 在任何组件中使用 -->
<template>
  <input v-focus />
  <p v-color="'red'">红色文字</p>
</template>
```

局部指令——只在当前组件中可用：

```html
<!-- 选项式 API -->
<script>
  export default {
    directives: {
      focus: {
        mounted(el) {
          el.focus()
        },
      },
    },
  }
</script>

<!-- script setup（Vue 3.2+） -->
<script setup>
  // 以 v 开头的驼峰命名变量会自动识别为指令
  const vFocus = {
    mounted: (el) => el.focus(),
  }

  const vHighlight = {
    mounted(el, binding) {
      el.style.backgroundColor = binding.value || 'yellow'
    },
    updated(el, binding) {
      el.style.backgroundColor = binding.value || 'yellow'
    },
  }
</script>

<template>
  <input v-focus />
  <p v-highlight="'#e8f5e9'">高亮文字</p>
</template>
```

指令的值和参数：

```html
<template>
  <!-- binding.value = '红色' -->
  <p v-color="'red'">文字</p>

  <!-- binding.arg = 'top'，binding.value = 10 -->
  <div v-pin:top="10">固定在顶部</div>

  <!-- 动态参数 -->
  <div v-pin:[direction]="200">固定</div>

  <!-- 修饰符 binding.modifiers = { round: true, animate: true } -->
  <div v-tooltip.round.animate="'提示信息'">悬停查看</div>
</template>
```

组织大量指令的推荐方式：

```js
// directives/index.js
import focus from './focus'
import permission from './permission'
import debounce from './debounce'
import lazyLoad from './lazyLoad'

export default {
  install(app) {
    app.directive('focus', focus)
    app.directive('permission', permission)
    app.directive('debounce', debounce)
    app.directive('lazy-load', lazyLoad)
  },
}

// main.js
import directives from './directives'
app.use(directives)
```

## 4. 🤔 自定义指令的钩子函数有哪些？各在什么时机触发？

Vue 3 的自定义指令提供了一组与组件生命周期类似的钩子函数：

```js
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode) {
    // el：指令绑定的 DOM 元素
    // binding：包含指令信息的对象
    // vnode：底层的 VNode
  },

  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode) {},

  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode) {
    // 最常用的钩子——此时 DOM 已可用
  },

  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},

  // 在绑定元素的父组件
  // 及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},

  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode) {},

  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode) {
    // 清理工作（移除事件监听、定时器等）
  },
}
```

binding 对象的属性：

```js
{
  value: any,          // 指令的值，如 v-demo="1+1" 中的 2
  oldValue: any,       // 之前的值（仅在 beforeUpdate 和 updated 中可用）
  arg: string,         // 指令的参数，如 v-demo:foo 中的 "foo"
  modifiers: object,   // 修饰符对象，如 v-demo.a.b 中的 { a: true, b: true }
  instance: object,    // 使用该指令的组件实例
  dir: object          // 指令的定义对象
}
```

一个完整的示例——可配置的工具提示指令：

```js
// directives/tooltip.js
export default {
  mounted(el, binding) {
    const tooltip = document.createElement('div')
    tooltip.className = 'v-tooltip'
    tooltip.textContent = binding.value
    tooltip.style.cssText = `
      position: absolute;
      background: #333;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      display: none;
      z-index: 9999;
      pointer-events: none;
    `

    // 根据参数确定位置
    const position = binding.arg || 'top'

    document.body.appendChild(tooltip)

    el._tooltip = tooltip
    el._tooltipPosition = position

    el._showTooltip = () => {
      const rect = el.getBoundingClientRect()
      tooltip.style.display = 'block'

      if (position === 'top') {
        tooltip.style.left =
          rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px'
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px'
      } else if (position === 'bottom') {
        tooltip.style.left =
          rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px'
        tooltip.style.top = rect.bottom + 8 + 'px'
      }
    }

    el._hideTooltip = () => {
      tooltip.style.display = 'none'
    }

    el.addEventListener('mouseenter', el._showTooltip)
    el.addEventListener('mouseleave', el._hideTooltip)
  },

  updated(el, binding) {
    // 更新提示文本
    if (el._tooltip) {
      el._tooltip.textContent = binding.value
    }
  },

  unmounted(el) {
    // 清理
    el.removeEventListener('mouseenter', el._showTooltip)
    el.removeEventListener('mouseleave', el._hideTooltip)
    if (el._tooltip) {
      document.body.removeChild(el._tooltip)
    }
  },
}
```

```html
<template>
  <button v-tooltip:top="'点击保存'">保存</button>
  <button v-tooltip:bottom="'删除此项'">删除</button>
</template>
```

## 5. 🤔 有哪些常用的自定义指令实战案例？

以下是几个实际项目中常用的自定义指令实现。

权限控制指令（v-permission）——根据用户权限控制元素的显示：

```js
// directives/permission.js
import { useUserStore } from '@/stores/user'

export default {
  mounted(el, binding) {
    const userStore = useUserStore()
    const requiredPermission = binding.value

    // 支持数组（满足其一即可）或字符串
    const permissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission]

    const hasPermission = permissions.some((p) =>
      userStore.permissions.includes(p),
    )

    if (!hasPermission) {
      // 根据修饰符决定行为
      if (binding.modifiers.disable) {
        el.disabled = true
        el.style.opacity = '0.5'
        el.style.cursor = 'not-allowed'
      } else {
        el.parentNode?.removeChild(el)
      }
    }
  },
}
```

```html
<template>
  <!-- 没权限则移除元素 -->
  <button v-permission="'admin:delete'">删除</button>

  <!-- 没权限则禁用 -->
  <button v-permission.disable="'editor:publish'">发布</button>

  <!-- 多个权限满足其一即可 -->
  <div v-permission="['admin', 'editor']">管理面板</div>
</template>
```

防抖指令（v-debounce）——限制事件触发频率：

```js
// directives/debounce.js
export default {
  mounted(el, binding) {
    const { value, arg } = binding
    const delay = parseInt(arg) || 300
    let timer = null

    const handler = typeof value === 'function' ? value : () => {}

    el._debounceHandler = (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        handler(...args)
      }, delay)
    }

    // 替换 click 事件（默认）或指定事件
    const event = binding.modifiers.input ? 'input' : 'click'
    el.addEventListener(event, el._debounceHandler)
    el._debounceEvent = event
  },

  unmounted(el) {
    el.removeEventListener(el._debounceEvent, el._debounceHandler)
  },
}
```

```html
<template>
  <!-- 防抖点击，500ms -->
  <button v-debounce:500="handleSubmit">提交</button>

  <!-- 防抖输入 -->
  <input v-debounce:300.input="handleSearch" />
</template>
```

图片懒加载指令（v-lazy-load）：

```js
// directives/lazyLoad.js
export default {
  mounted(el, binding) {
    // 设置占位图
    const placeholder = binding.modifiers.blur
      ? 'data:image/svg+xml,...' // 模糊占位图
      : ''

    if (placeholder) {
      el.src = placeholder
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 进入视口时加载真实图片
          const img = new Image()
          img.src = binding.value

          img.onload = () => {
            el.src = binding.value
            el.classList.add('loaded')
          }

          img.onerror = () => {
            el.src = '/images/fallback.png'
            el.classList.add('error')
          }

          observer.unobserve(el)
        }
      },
      { rootMargin: '100px' }, // 提前 100px 开始加载
    )

    observer.observe(el)
    el._lazyObserver = observer
  },

  unmounted(el) {
    el._lazyObserver?.disconnect()
  },
}
```

```html
<template>
  <img v-lazy-load="'/images/photo.jpg'" alt="照片" />
  <img v-lazy-load.blur="item.imageUrl" v-for="item in list" :key="item.id" />
</template>

<style>
  img {
    transition: opacity 0.3s;
    opacity: 0;
  }
  img.loaded {
    opacity: 1;
  }
</style>
```

点击外部关闭指令（v-click-outside）：

```js
// directives/clickOutside.js
export default {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target) && el !== event.target) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  },
}
```

```html
<template>
  <div v-click-outside="closeDropdown" class="dropdown">
    <button @click="isOpen = !isOpen">菜单</button>
    <ul v-if="isOpen">
      <li>选项 1</li>
      <li>选项 2</li>
    </ul>
  </div>
</template>
```
