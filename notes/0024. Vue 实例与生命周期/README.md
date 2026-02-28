# [0024. Vue 实例与生命周期](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0024.%20Vue%20%E5%AE%9E%E4%BE%8B%E4%B8%8E%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何创建第一个 Vue 应用？](#3--如何创建第一个-vue-应用)
- [4. 🤔 Vue 的模板语法与数据绑定是如何工作的？](#4--vue-的模板语法与数据绑定是如何工作的)
- [5. 🤔 Vue 实例的选项对象有哪些？](#5--vue-实例的选项对象有哪些)
- [6. 🤔 Vue 的生命周期钩子函数是什么？](#6--vue-的生命周期钩子函数是什么)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 创建第一个 Vue 应用
- 模板语法与数据绑定
- Vue 实例的选项对象（data、methods、computed、watch）
- 生命周期图示与钩子函数详解（beforeCreate 到 destroyed）

## 2. 🫧 评价

- todo

## 3. 🤔 如何创建第一个 Vue 应用？

创建一个 Vue 应用是学习 Vue.js 的第一步。在 Vue 3 中，应用的创建方式与 Vue 2 有所不同，Vue 3 使用 createApp 函数来创建应用实例，取代了 Vue 2 中直接 new Vue() 的方式。这种变化不仅让 API 更加清晰，也为同一页面中运行多个 Vue 应用提供了更好的支持。

一个 Vue 应用从创建应用实例开始。createApp 函数接收一个根组件作为参数，这个根组件是整个组件树的起点。随后调用 mount 方法将应用挂载到一个 DOM 元素上：

```js
import { createApp } from 'vue'

// 最简单的根组件
const app = createApp({
  data() {
    return {
      message: '你好，Vue 3！',
    }
  },
})

// 将应用挂载到 id 为 app 的 DOM 元素上
app.mount('#app')
```

在实际项目中，根组件通常是一个单文件组件（.vue 文件）。完整的应用创建流程如下：

```js
// main.js —— 应用入口文件
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 可以在挂载之前进行全局配置
app.config.errorHandler = (err) => {
  console.error('全局错误：', err)
}

// 挂载应用
app.mount('#app')
```

```html
<!-- App.vue —— 根组件 -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>欢迎来到我的第一个 Vue 3 应用</p>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const title = ref('Hello Vue 3')
</script>
```

对应的 HTML 文件中需要提供一个挂载点：

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>我的 Vue 应用</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

createApp 返回的应用实例对象提供了一系列方法，用于在挂载之前对应用进行全局配置。这些配置操作必须在调用 mount 之前完成，因为 mount 方法会触发应用的渲染流程：

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import MyComponent from './components/MyComponent.vue'

const app = createApp(App)

// 注册全局组件
app.component('MyComponent', MyComponent)

// 注册全局指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  },
})

// 使用插件
app.use(router)
app.use(pinia)

// 提供全局数据
app.provide('appName', '我的应用')

// 最后挂载
app.mount('#app')
```

Vue 3 与 Vue 2 在创建应用时有几个重要区别。首先，Vue 2 使用 `new Vue()` 构造函数，而 Vue 3 使用 `createApp()` 工厂函数。其次，Vue 2 的全局 API（如 `Vue.component()`、`Vue.directive()`）是挂载在 Vue 构造函数上的，这意味着所有通过 `new Vue()` 创建的实例都会共享这些全局配置，在测试或微前端场景中容易产生污染。Vue 3 的全局 API 都挂载在应用实例上，不同应用之间完全隔离：

```js
// Vue 3 支持同一页面运行多个独立的应用
const app1 = createApp(App1)
app1.component('SharedComponent', Component1)
app1.mount('#app1')

const app2 = createApp(App2)
app2.component('SharedComponent', Component2) // 不会影响 app1
app2.mount('#app2')
```

mount 方法的参数可以是一个 CSS 选择器字符串，也可以是一个实际的 DOM 元素对象。挂载时，Vue 会将根组件的模板渲染结果替换掉挂载点元素的 innerHTML。需要注意的是，一个应用实例只能调用一次 mount，重复调用会被忽略。

如果你想卸载一个已挂载的应用，可以调用 unmount 方法。这在单页面应用的路由切换或动态加载场景中可能会用到：

```js
const app = createApp(App)
app.mount('#app')

// 稍后卸载应用
app.unmount()
```

## 4. 🤔 Vue 的模板语法与数据绑定是如何工作的？

Vue 的模板语法是一套声明式的 HTML 扩展语法，它允许开发者以直观的方式将组件的数据绑定到 DOM 结构上。Vue 的模板在底层会被编译为高度优化的 JavaScript 渲染函数，但开发者通常不需要关心编译细节，只需要使用简洁的模板语法来描述 UI 的结构和行为。

最基本的数据绑定方式是文本插值，使用双大括号（Mustache）语法：

```html
<template>
  <div>
    <p>{{ message }}</p>
    <p>{{ count + 1 }}</p>
    <p>{{ ok ? '是' : '否' }}</p>
    <p>{{ message.split('').reverse().join('') }}</p>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const message = ref('Hello Vue')
  const count = ref(10)
  const ok = ref(true)
</script>
```

双大括号中的内容会被替换为对应数据的值，并且当数据发生变化时，页面上的内容也会自动更新。你可以在双大括号中使用任意的 JavaScript 表达式，包括算术运算、三元运算、方法调用等。但需要注意的是，这里只能使用单个表达式，不能使用语句（如 if、for）或变量声明。

属性绑定使用 v-bind 指令（或简写为 `:`），用于将数据动态绑定到 HTML 元素的属性上：

```html
<template>
  <div>
    <!-- 动态绑定 id -->
    <div :id="dynamicId"></div>

    <!-- 动态绑定 class -->
    <div :class="{ active: isActive, 'text-danger': hasError }"></div>

    <!-- 动态绑定 style -->
    <div :style="{ color: textColor, fontSize: fontSize + 'px' }"></div>

    <!-- 动态绑定 href -->
    <a :href="url">链接</a>

    <!-- 动态绑定 disabled -->
    <button :disabled="isLoading">提交</button>

    <!-- 绑定多个属性 -->
    <div v-bind="objectOfAttrs"></div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue'

  const dynamicId = ref('container')
  const isActive = ref(true)
  const hasError = ref(false)
  const textColor = ref('#333')
  const fontSize = ref(16)
  const url = ref('https://vuejs.org')
  const isLoading = ref(false)
  const objectOfAttrs = reactive({
    id: 'wrapper',
    class: 'container',
  })
</script>
```

事件绑定使用 v-on 指令（或简写为 `@`），用于监听 DOM 事件：

```html
<template>
  <div>
    <!-- 基本事件绑定 -->
    <button @click="handleClick">点击我</button>

    <!-- 内联事件处理 -->
    <button @click="count++">计数：{{ count }}</button>

    <!-- 传递参数 -->
    <button @click="greet('Vue')">打招呼</button>

    <!-- 访问原生事件对象 -->
    <button @click="handleEvent($event)">事件对象</button>

    <!-- 事件修饰符 -->
    <form @submit.prevent="onSubmit">
      <button type="submit">提交</button>
    </form>

    <!-- 按键修饰符 -->
    <input @keyup.enter="onEnter" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)

  function handleClick() {
    console.log('按钮被点击了')
  }

  function greet(name) {
    console.log(`你好，${name}！`)
  }

  function handleEvent(event) {
    console.log('事件类型：', event.type)
    console.log('目标元素：', event.target)
  }

  function onSubmit() {
    console.log('表单提交')
  }

  function onEnter() {
    console.log('按下了回车键')
  }
</script>
```

双向数据绑定使用 v-model 指令，它是 v-bind 和 v-on 的语法糖，专用于表单元素：

```html
<template>
  <div>
    <!-- 文本输入框 -->
    <input v-model="text" placeholder="输入文字" />
    <p>你输入了：{{ text }}</p>

    <!-- 复选框 -->
    <input type="checkbox" v-model="checked" />
    <p>选中状态：{{ checked }}</p>

    <!-- 单选按钮 -->
    <input type="radio" v-model="picked" value="a" /> A
    <input type="radio" v-model="picked" value="b" /> B
    <p>选择了：{{ picked }}</p>

    <!-- 下拉选择 -->
    <select v-model="selected">
      <option value="">请选择</option>
      <option value="vue">Vue</option>
      <option value="react">React</option>
    </select>
    <p>选择了：{{ selected }}</p>

    <!-- 多行文本 -->
    <textarea v-model="content"></textarea>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const text = ref('')
  const checked = ref(false)
  const picked = ref('a')
  const selected = ref('')
  const content = ref('')
</script>
```

v-model 的工作原理实际上是对不同表单元素使用了不同的属性和事件组合。对于文本类型的 input 和 textarea，v-model 绑定的是 value 属性和 input 事件；对于 checkbox 和 radio，绑定的是 checked 属性和 change 事件；对于 select，绑定的是 value 属性和 change 事件。

v-model 还支持一些修饰符来调整其行为：

```html
<template>
  <!-- .lazy 修饰符：从 input 事件改为 change 事件触发更新 -->
  <input v-model.lazy="msg" />

  <!-- .number 修饰符：自动将输入值转为数字 -->
  <input v-model.number="age" type="number" />

  <!-- .trim 修饰符：自动去除输入值首尾空格 -->
  <input v-model.trim="name" />
</template>
```

Vue 的模板语法在底层会被 Vue 的模板编译器编译为渲染函数。编译器会对模板进行静态分析，识别出哪些部分是动态的、哪些部分是静态的，然后生成优化后的渲染代码。静态的部分会被提升到渲染函数外部，避免在每次重新渲染时重复创建。动态的部分会带上 Patch Flags 标记，告诉运行时的 diff 算法只需要比较这些标记过的节点，从而大幅提升渲染性能。

## 5. 🤔 Vue 实例的选项对象有哪些？

在 Vue 中创建组件时，需要通过选项对象来定义组件的各种行为。在 Vue 2 和 Vue 3 的选项式 API 中，选项对象是组件定义的核心。Vue 3 同时引入了组合式 API，提供了一种新的组织方式，但选项式 API 仍然被完全支持。了解各个选项的用途和用法，是掌握 Vue 组件开发的基础。

data 选项用于声明组件的响应式状态数据。在组件中，data 必须是一个函数，返回一个对象。这样设计是为了确保每个组件实例都有自己独立的数据副本，避免多个实例之间共享数据导致的相互干扰：

```js
export default {
  data() {
    return {
      message: '你好',
      count: 0,
      user: {
        name: '张三',
        age: 25,
      },
      items: ['苹果', '香蕉', '橙子'],
    }
  },
}
```

data 返回的对象中的属性会被 Vue 的响应式系统处理，当这些属性的值发生变化时，依赖它们的模板或计算属性会自动重新求值和渲染。

methods 选项用于定义组件中的方法。这些方法可以在模板中通过事件绑定调用，也可以在其他方法或生命周期钩子中使用。methods 中的方法会自动绑定 this 到当前组件实例，因此你可以直接通过 this 访问 data 中的数据：

```js
export default {
  data() {
    return {
      count: 0,
    }
  },
  methods: {
    increment() {
      this.count++
    },
    decrement() {
      if (this.count > 0) {
        this.count--
      }
    },
    reset() {
      this.count = 0
    },
    async fetchData() {
      try {
        const response = await fetch('/api/data')
        const data = await response.json()
        this.items = data
      } catch (error) {
        console.error('获取数据失败：', error)
      }
    },
  },
}
```

需要注意的是，不要使用箭头函数来定义 methods 中的方法，因为箭头函数不会绑定自己的 this，会导致无法正确访问组件实例。

computed 选项用于定义计算属性。计算属性是基于已有的响应式数据派生出新的值，它会自动缓存计算结果——只有当依赖的数据发生变化时才会重新计算，否则直接返回缓存的值：

```js
export default {
  data() {
    return {
      firstName: '三',
      lastName: '张',
      items: [
        { name: '苹果', price: 5, quantity: 3 },
        { name: '香蕉', price: 3, quantity: 5 },
      ],
    }
  },
  computed: {
    // 只读计算属性
    fullName() {
      return this.lastName + this.firstName
    },
    // 带 getter 和 setter 的计算属性
    fullNameWithSetter: {
      get() {
        return this.lastName + this.firstName
      },
      set(newValue) {
        const names = newValue.split('')
        this.lastName = names[0]
        this.firstName = names.slice(1).join('')
      },
    },
    // 计算总价
    totalPrice() {
      return this.items.reduce((sum, item) => {
        return sum + item.price * item.quantity
      }, 0)
    },
  },
}
```

watch 选项用于侦听响应式数据的变化并执行副作用操作。watch 适合处理数据变化时需要执行异步操作或开销较大的逻辑：

```js
export default {
  data() {
    return {
      searchQuery: '',
      user: {
        name: '张三',
        address: {
          city: '北京',
        },
      },
    }
  },
  watch: {
    // 基本用法
    searchQuery(newVal, oldVal) {
      console.log(`搜索词从 "${oldVal}" 变为 "${newVal}"`)
      this.debouncedSearch(newVal)
    },
    // 深度侦听
    user: {
      handler(newVal) {
        console.log('用户信息变化了：', newVal)
      },
      deep: true,
    },
    // 立即执行
    'user.address.city': {
      handler(newVal) {
        console.log('城市变为：', newVal)
        this.fetchCityData(newVal)
      },
      immediate: true,
    },
  },
}
```

除了上述四个核心选项外，还有其他重要的选项，包括 props（接收父组件传递的数据）、emits（声明组件触发的事件）、components（注册局部组件）、directives（注册局部指令）、provide/inject（跨层级数据传递）、mixins（混入复用逻辑）等。在 Vue 3 的组合式 API 中，这些选项可以通过 setup 函数或 `<script setup>` 语法糖以函数的形式来表达，但底层实现原理是一致的。

## 6. 🤔 Vue 的生命周期钩子函数是什么？

Vue 组件的生命周期是指一个组件从创建到销毁的完整过程。在这个过程中，Vue 会在特定的时间点调用一系列预定义的函数，这些函数就被称为生命周期钩子（Lifecycle Hooks）。理解生命周期钩子的触发时机和使用场景，对于正确管理组件的状态、执行副作用操作以及优化性能至关重要。

Vue 组件的生命周期可以分为四个主要阶段：创建阶段、挂载阶段、更新阶段和卸载阶段。

创建阶段包含 beforeCreate 和 created 两个钩子。beforeCreate 在组件实例初始化之后、数据观测和事件配置之前被调用，此时 data、computed、methods 等选项还没有被处理，无法访问。created 在组件实例创建完成后被调用，此时数据观测、计算属性、方法、侦听器等都已经设置好，可以访问和操作响应式数据，但组件尚未挂载到 DOM 上，无法访问 $el：

```js
export default {
  data() {
    return {
      message: 'Hello',
    }
  },
  beforeCreate() {
    // 此时 this.message 为 undefined
    console.log('beforeCreate：组件实例刚被创建')
  },
  created() {
    // 此时可以访问 this.message
    console.log('created：', this.message)
    // 适合在此处进行数据初始化、API 请求等
    this.fetchInitialData()
  },
}
```

挂载阶段包含 beforeMount 和 mounted 两个钩子。beforeMount 在组件被挂载到 DOM 之前调用，模板已经编译完成但还没有渲染到页面上。mounted 在组件被挂载到 DOM 之后调用，此时可以访问到真实的 DOM 元素：

```js
export default {
  mounted() {
    // 此时可以访问 DOM
    console.log('mounted：组件已挂载到 DOM')

    // 适合进行 DOM 操作
    this.$refs.input.focus()

    // 适合初始化第三方库
    this.chart = new Chart(this.$refs.canvas, {
      type: 'bar',
      data: this.chartData,
    })

    // 适合添加事件监听
    window.addEventListener('resize', this.handleResize)
  },
}
```

更新阶段包含 beforeUpdate 和 updated 两个钩子。当组件的响应式数据发生变化并导致重新渲染时，这两个钩子会被触发。beforeUpdate 在 DOM 更新之前调用，此时数据已经是最新的，但 DOM 还是旧的。updated 在 DOM 更新之后调用：

```js
export default {
  data() {
    return {
      count: 0,
    }
  },
  beforeUpdate() {
    console.log('beforeUpdate：DOM 即将更新')
    // 可以在此处获取更新前的 DOM 状态
  },
  updated() {
    console.log('updated：DOM 已更新')
    // 注意：避免在此处修改数据，否则可能导致无限循环
  },
}
```

卸载阶段包含 beforeUnmount（Vue 2 中为 beforeDestroy）和 unmounted（Vue 2 中为 destroyed）两个钩子。beforeUnmount 在组件卸载之前调用，此时组件实例仍然完全可用。unmounted 在组件卸载之后调用：

```js
export default {
  beforeUnmount() {
    console.log('beforeUnmount：组件即将卸载')
    // 清理工作：移除事件监听、取消定时器、销毁第三方库实例等
    window.removeEventListener('resize', this.handleResize)
    clearInterval(this.timer)

    if (this.chart) {
      this.chart.destroy()
    }
  },
  unmounted() {
    console.log('unmounted：组件已卸载')
  },
}
```

在 Vue 3 的组合式 API 中，生命周期钩子以函数的形式使用，需要从 vue 中导入。注意组合式 API 中没有对应 beforeCreate 和 created 的钩子，因为 setup 函数本身就运行在这两个钩子之间：

```html
<script setup>
  import {
    ref,
    onBeforeMount,
    onMounted,
    onBeforeUpdate,
    onUpdated,
    onBeforeUnmount,
    onUnmounted,
  } from 'vue'

  const count = ref(0)

  // setup 本身相当于 beforeCreate + created
  console.log('setup：组件实例正在创建')

  onBeforeMount(() => {
    console.log('onBeforeMount：即将挂载')
  })

  onMounted(() => {
    console.log('onMounted：已挂载')
    // 初始化操作
  })

  onBeforeUpdate(() => {
    console.log('onBeforeUpdate：即将更新')
  })

  onUpdated(() => {
    console.log('onUpdated：已更新')
  })

  onBeforeUnmount(() => {
    console.log('onBeforeUnmount：即将卸载')
    // 清理操作
  })

  onUnmounted(() => {
    console.log('onUnmounted：已卸载')
  })
</script>
```

除了上述核心生命周期钩子外，Vue 还提供了一些特殊场景的钩子：

activated 和 deactivated 钩子与 keep-alive 组件配合使用。当一个被 keep-alive 缓存的组件被激活时触发 activated，被停用时触发 deactivated：

```html
<script setup>
  import { onActivated, onDeactivated } from 'vue'

  onActivated(() => {
    console.log('组件被激活，刷新数据')
    fetchLatestData()
  })

  onDeactivated(() => {
    console.log('组件被停用')
  })
</script>
```

errorCaptured 钩子用于捕获来自后代组件的错误：

```html
<script setup>
  import { onErrorCaptured } from 'vue'

  onErrorCaptured((err, instance, info) => {
    console.error('捕获到子组件错误：', err)
    console.log('错误信息：', info)
    // 返回 false 可以阻止错误继续向上传播
    return false
  })
</script>
```

在实际开发中，各生命周期钩子的典型使用场景如下：created/setup 中适合进行 API 数据请求、初始化数据；mounted/onMounted 中适合进行 DOM 操作、初始化第三方库、添加事件监听；beforeUnmount/onBeforeUnmount 中适合进行清理工作——移除事件监听、取消定时器、断开 WebSocket 连接等。updated/onUpdated 在实际开发中使用较少，通常可以用 watch 或 watchEffect 来代替。
