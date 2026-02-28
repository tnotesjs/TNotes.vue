# [0033. 组件通信](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0033.%20%E7%BB%84%E4%BB%B6%E9%80%9A%E4%BF%A1)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Props 如何定义与验证？父组件如何向子组件传递数据？](#3--props-如何定义与验证父组件如何向子组件传递数据)
- [4. 🤔 子组件如何通过自定义事件向父组件传递数据？](#4--子组件如何通过自定义事件向父组件传递数据)
- [5. 🤔 兄弟组件之间如何通信？什么是事件总线？](#5--兄弟组件之间如何通信什么是事件总线)
- [6. 🤔 provide 和 inject 如何实现跨级组件通信？](#6--provide-和-inject-如何实现跨级组件通信)
- [7. 🤔 $refs 的作用是什么？如何通过 $refs 访问子组件实例？](#7--refs-的作用是什么如何通过-refs-访问子组件实例)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 父传子：Props 定义与验证
- 子传父：自定义事件（$emit）
- 兄弟组件通信：事件总线（Event Bus）
- 跨级组件通信：provide / inject
- 访问组件实例：$refs、$parent、$children

## 2. 🫧 评价

- todo

## 3. 🤔 Props 如何定义与验证？父组件如何向子组件传递数据？

Props（属性）是 Vue 中父组件向子组件传递数据最基本也最常用的方式。它实现了单向数据流——数据从父组件流向子组件，子组件不应该直接修改接收到的 props。

在 Vue 3 的 `<script setup>` 中，使用 defineProps 宏来声明 props。最简单的方式是传入一个字符串数组：

```html
<script setup>
  const props = defineProps(['title', 'content', 'author'])
</script>

<template>
  <article>
    <h2>{{ title }}</h2>
    <p>{{ content }}</p>
    <span>作者：{{ author }}</span>
  </article>
</template>
```

但在实际项目中，推荐使用对象形式来声明 props，这样可以指定每个 prop 的类型、默认值和验证规则：

```html
<script setup>
  const props = defineProps({
    // 基本类型检查
    title: String,

    // 多个可能的类型
    id: [String, Number],

    // 必填项
    content: {
      type: String,
      required: true,
    },

    // 带默认值
    author: {
      type: String,
      default: '匿名',
    },

    // 对象/数组的默认值必须通过工厂函数返回
    tags: {
      type: Array,
      default: () => [],
    },

    config: {
      type: Object,
      default: () => ({
        theme: 'light',
        fontSize: 14,
      }),
    },

    // 自定义验证函数
    status: {
      type: String,
      validator(value) {
        return ['draft', 'published', 'archived'].includes(value)
      },
    },

    // Boolean 类型有特殊的类型转换行为
    isVisible: {
      type: Boolean,
      default: true,
    },
  })
</script>
```

如果使用 TypeScript，可以通过泛型的方式获得类型推导，这是更推荐的做法：

```html
<script setup lang="ts">
  interface Article {
    title: string
    content: string
    author?: string
    tags?: string[]
    publishedAt?: Date
    status: 'draft' | 'published' | 'archived'
  }

  const props = withDefaults(defineProps<Article>(), {
    author: '匿名',
    tags: () => [],
    status: 'draft',
  })
</script>
```

父组件向子组件传递 props 时，对于静态值可以直接写字符串，对于动态值需要使用 v-bind（缩写为 :）：

```html
<!-- 父组件 -->
<template>
  <ArticleCard
    title="静态标题"
    :content="articleContent"
    :author="currentUser.name"
    :tags="['Vue', 'JavaScript']"
    :is-visible="true"
    :publish-date="new Date()"
  />

  <!-- 使用 v-bind 传递整个对象的所有属性 -->
  <ArticleCard v-bind="articleData" />
</template>

<script setup>
  import { ref, reactive } from 'vue'
  import ArticleCard from './ArticleCard.vue'

  const articleContent = ref('这是文章内容')
  const currentUser = reactive({ name: '张三' })
  const articleData = reactive({
    title: '对象展开传递',
    content: '可以用 v-bind 传递整个对象',
    author: '李四',
  })
</script>
```

Prop 的单向数据流非常重要。子组件不应该直接修改 props 的值。如果需要基于 prop 的值进行转换或计算，应该使用局部变量或计算属性：

```html
<script setup>
  const props = defineProps({
    initialCount: {
      type: Number,
      default: 0,
    },
    rawText: {
      type: String,
      required: true,
    },
  })

  // 用于初始化本地状态
  const localCount = ref(props.initialCount)

  // 基于 prop 的计算属性
  const formattedText = computed(() => {
    return props.rawText.trim().toLowerCase()
  })
</script>
```

## 4. 🤔 子组件如何通过自定义事件向父组件传递数据？

子组件向父组件传递数据的标准方式是通过自定义事件（$emit）。子组件触发一个事件，父组件监听这个事件并处理。这种模式保持了 Vue 单向数据流的设计原则：props 向下，事件向上。

在 Vue 3 的 `<script setup>` 中，使用 defineEmits 宏来声明组件可以触发的事件：

```html
<!-- 子组件 SearchInput.vue -->
<template>
  <div class="search-input">
    <input
      :value="modelValue"
      @input="handleInput"
      @keyup.enter="handleSearch"
      placeholder="请输入搜索关键词"
    />
    <button @click="handleSearch">搜索</button>
    <button @click="handleClear">清空</button>
  </div>
</template>

<script setup>
  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
  })

  // 声明事件
  const emit = defineEmits(['update:modelValue', 'search', 'clear'])

  function handleInput(e) {
    // 触发事件，将输入值传给父组件
    emit('update:modelValue', e.target.value)
  }

  function handleSearch() {
    emit('search', props.modelValue)
  }

  function handleClear() {
    emit('update:modelValue', '')
    emit('clear')
  }
</script>
```

```html
<!-- 父组件 -->
<template>
  <SearchInput
    v-model="searchQuery"
    @search="performSearch"
    @clear="handleClear"
  />
  <p>当前搜索词：{{ searchQuery }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import SearchInput from './SearchInput.vue'

  const searchQuery = ref('')

  function performSearch(query) {
    console.log('搜索：', query)
  }

  function handleClear() {
    console.log('搜索已清空')
  }
</script>
```

使用 TypeScript 时，可以为事件参数提供类型定义：

```html
<script setup lang="ts">
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'search', query: string): void
    (e: 'select', item: { id: number; name: string }): void
    (e: 'delete', id: number): void
  }>()

  // Vue 3.3+ 的简写语法
  const emit = defineEmits<{
    'update:modelValue': [value: string]
    search: [query: string]
    select: [item: { id: number; name: string }]
    delete: [id: number]
  }>()
</script>
```

还可以添加事件验证，类似于 props 的 validator：

```html
<script setup>
  const emit = defineEmits({
    // 无验证
    click: null,

    // 带验证
    submit: (payload) => {
      if (payload.email && payload.password) {
        return true
      }
      console.warn('submit 事件缺少必要参数')
      return false
    },
  })
</script>
```

一个完整的表单组件示例，展示子传父通信的典型场景：

```html
<!-- 子组件 ContactForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>姓名</label>
      <input v-model="form.name" />
    </div>
    <div>
      <label>邮箱</label>
      <input v-model="form.email" type="email" />
    </div>
    <div>
      <label>消息</label>
      <textarea v-model="form.message"></textarea>
    </div>
    <button type="submit" :disabled="isSubmitting">提交</button>
    <button type="button" @click="handleCancel">取消</button>
  </form>
</template>

<script setup>
  import { reactive, ref } from 'vue'

  const emit = defineEmits(['submit', 'cancel'])

  const isSubmitting = ref(false)
  const form = reactive({
    name: '',
    email: '',
    message: '',
  })

  async function handleSubmit() {
    isSubmitting.value = true
    // 将表单数据通过事件传给父组件
    emit('submit', { ...form })
    isSubmitting.value = false
  }

  function handleCancel() {
    emit('cancel')
  }
</script>
```

## 5. 🤔 兄弟组件之间如何通信？什么是事件总线？

当两个没有父子关系的同级组件需要通信时，不能直接使用 props 和 emit。常见的解决方案有：通过共同的父组件中转、事件总线、以及使用状态管理库（如 Pinia）。

最直接的方式是通过共同的父组件来中转数据。子组件 A 通过 emit 将数据传给父组件，父组件再通过 props 传递给子组件 B：

```html
<!-- 父组件 -->
<template>
  <div>
    <ComponentA @select-item="selectedItem = $event" />
    <ComponentB :selected="selectedItem" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import ComponentA from './ComponentA.vue'
  import ComponentB from './ComponentB.vue'

  const selectedItem = ref(null)
</script>
```

事件总线（Event Bus）是 Vue 2 时代常用的方案。它创建一个空的 Vue 实例作为事件中心，任何组件都可以通过它来发送和监听事件。在 Vue 3 中，官方移除了 $on、$off、$once 方法，推荐使用第三方库 mitt 来实现类似功能：

```js
// eventBus.js
import mitt from 'mitt'

const emitter = mitt()
export default emitter
```

```html
<!-- 组件 A：发送事件 -->
<template>
  <div>
    <h3>商品列表</h3>
    <ul>
      <li
        v-for="product in products"
        :key="product.id"
        @click="selectProduct(product)"
      >
        {{ product.name }} - ¥{{ product.price }}
      </li>
    </ul>
  </div>
</template>

<script setup>
  import emitter from './eventBus'

  const products = [
    { id: 1, name: '苹果', price: 5 },
    { id: 2, name: '香蕉', price: 3 },
    { id: 3, name: '橙子', price: 8 },
  ]

  function selectProduct(product) {
    emitter.emit('product-selected', product)
  }
</script>
```

```html
<!-- 组件 B：监听事件 -->
<template>
  <div>
    <h3>购物车</h3>
    <ul>
      <li v-for="item in cart" :key="item.id">
        {{ item.name }} - ¥{{ item.price }}
      </li>
    </ul>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import emitter from './eventBus'

  const cart = ref([])

  function onProductSelected(product) {
    cart.value.push(product)
  }

  onMounted(() => {
    emitter.on('product-selected', onProductSelected)
  })

  // 组件卸载时务必移除监听，防止内存泄漏
  onUnmounted(() => {
    emitter.off('product-selected', onProductSelected)
  })
</script>
```

事件总线的最大问题是：随着应用规模增大，事件的发布方和订阅方越来越多，事件流变得难以追踪和调试。当多个组件监听同一个事件，或者事件名发生冲突时，排查问题极为困难。同时，如果忘记在组件卸载时移除事件监听，会导致内存泄漏和意外行为。

对于中大型应用，更推荐使用 Pinia 这样的状态管理库来实现兄弟组件之间的通信。Pinia 提供了一个共享的响应式状态容器，任何组件都可以读取和修改其中的状态：

```js
// stores/cart.js
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  actions: {
    addItem(product) {
      this.items.push(product)
    },
    removeItem(id) {
      this.items = this.items.filter((item) => item.id !== id)
    },
  },
})
```

```html
<!-- 任何组件都可以直接使用 -->
<script setup>
  import { useCartStore } from '../stores/cart'
  const cartStore = useCartStore()

  function addToCart(product) {
    cartStore.addItem(product)
  }
</script>
```

## 6. 🤔 provide 和 inject 如何实现跨级组件通信？

provide/inject 是 Vue 中用于跨级组件通信的内置机制。它允许祖先组件向其所有后代组件提供数据，无论组件层级有多深。这解决了当数据需要从顶层组件传递到深层嵌套子组件时，中间层组件需要逐层传递 props（即"prop 逐级透传"）的问题。

基本用法：

```html
<!-- 祖先组件 App.vue -->
<template>
  <div>
    <h1>{{ appName }}</h1>
    <ParentComponent />
  </div>
</template>

<script setup>
  import { provide, ref, readonly } from 'vue'
  import ParentComponent from './ParentComponent.vue'

  const appName = ref('我的应用')
  const theme = ref('dark')
  const user = ref({ name: '张三', role: 'admin' })

  // provide 接收两个参数：注入名（key）和提供的值
  provide('appName', appName)
  provide('theme', theme)

  // 推荐：使用 readonly 包裹，防止子孙组件直接修改
  provide('user', readonly(user))

  // 提供修改方法，让子孙组件通过函数来修改状态
  provide('updateTheme', (newTheme) => {
    theme.value = newTheme
  })
</script>
```

```html
<!-- 中间组件 ParentComponent.vue —— 不需要传递任何数据 -->
<template>
  <div>
    <p>这里是中间层组件</p>
    <DeepChild />
  </div>
</template>

<script setup>
  import DeepChild from './DeepChild.vue'
</script>
```

```html
<!-- 深层子组件 DeepChild.vue -->
<template>
  <div :class="theme">
    <p>应用名称：{{ appName }}</p>
    <p>当前用户：{{ user.name }}</p>
    <p>当前主题：{{ theme }}</p>
    <button @click="toggleTheme">切换主题</button>
  </div>
</template>

<script setup>
  import { inject } from 'vue'

  // inject 接收注入名和可选的默认值
  const appName = inject('appName')
  const theme = inject('theme', 'light') // 提供默认值
  const user = inject('user')
  const updateTheme = inject('updateTheme')

  function toggleTheme() {
    updateTheme(theme.value === 'dark' ? 'light' : 'dark')
  }
</script>
```

使用 Symbol 作为注入名可以避免命名冲突，这在大型应用或开发插件时特别有用：

```js
// keys.js
export const ThemeKey = Symbol('theme')
export const UserKey = Symbol('user')
export const I18nKey = Symbol('i18n')
```

```html
<!-- 提供方 -->
<script setup>
  import { provide } from 'vue'
  import { ThemeKey, UserKey } from './keys'

  provide(ThemeKey, theme)
  provide(UserKey, user)
</script>

<!-- 注入方 -->
<script setup>
  import { inject } from 'vue'
  import { ThemeKey, UserKey } from './keys'

  const theme = inject(ThemeKey)
  const user = inject(UserKey)
</script>
```

provide/inject 的一个典型应用场景是实现组件库的主题系统或表单组件的联动：

```html
<!-- Form.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <slot></slot>
  </form>
</template>

<script setup>
  import { provide, reactive } from 'vue'

  const formState = reactive({
    values: {},
    errors: {},
    disabled: false,
  })

  provide('formState', formState)
  provide('setFieldValue', (name, value) => {
    formState.values[name] = value
  })
  provide('setFieldError', (name, error) => {
    formState.errors[name] = error
  })

  function handleSubmit() {
    console.log('表单数据：', formState.values)
  }
</script>
```

```html
<!-- FormField.vue（可以嵌套在任意层级） -->
<template>
  <div class="field">
    <label>{{ label }}</label>
    <input
      :value="formState.values[name]"
      :disabled="formState.disabled"
      @input="setFieldValue(name, $event.target.value)"
    />
    <span class="error" v-if="formState.errors[name]">
      {{ formState.errors[name] }}
    </span>
  </div>
</template>

<script setup>
  import { inject } from 'vue'

  defineProps({
    name: { type: String, required: true },
    label: { type: String, required: true },
  })

  const formState = inject('formState')
  const setFieldValue = inject('setFieldValue')
</script>
```

需要注意的是，provide/inject 不是响应式的"银弹"。如果提供的是一个普通值（非 ref 或 reactive），后代组件不会响应它的变化。始终确保提供响应式数据：

```html
<script setup>
  import { provide, ref } from 'vue'

  // 错误：提供一个普通值，后续修改不会更新
  let count = 0
  provide('count', count)
  count = 1 // 后代组件拿到的仍然是 0

  // 正确：提供一个 ref
  const reactiveCount = ref(0)
  provide('count', reactiveCount)
  reactiveCount.value = 1 // 后代组件会响应更新
</script>
```

## 7. 🤔 $refs 的作用是什么？如何通过 $refs 访问子组件实例？

$refs 提供了一种直接访问 DOM 元素或子组件实例的方式。通过在模板中给元素或组件添加 ref 属性，就可以在 JavaScript 中通过对应的引用来访问它们。不过这是一种"逃生舱口"机制，应该谨慎使用，优先考虑 props、emit 和 provide/inject 等规范的通信方式。

在 Vue 3 `<script setup>` 中，通过 ref 来创建模板引用：

```html
<template>
  <div>
    <!-- 引用 DOM 元素 -->
    <input ref="inputRef" type="text" />
    <button @click="focusInput">聚焦输入框</button>

    <!-- 引用子组件实例 -->
    <ChildComponent ref="childRef" />
    <button @click="callChildMethod">调用子组件方法</button>

    <!-- 引用 canvas 元素 -->
    <canvas ref="canvasRef" width="400" height="300"></canvas>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import ChildComponent from './ChildComponent.vue'

  // 变量名必须与模板中的 ref 值一致
  const inputRef = ref(null)
  const childRef = ref(null)
  const canvasRef = ref(null)

  onMounted(() => {
    // 在 onMounted 之后才能访问到元素
    console.log(inputRef.value) // <input> DOM 元素
    console.log(childRef.value) // 子组件实例（或 expose 暴露的内容）

    // 操作 canvas
    const ctx = canvasRef.value.getContext('2d')
    ctx.fillStyle = '#42b883'
    ctx.fillRect(50, 50, 100, 100)
  })

  function focusInput() {
    inputRef.value.focus()
  }

  function callChildMethod() {
    childRef.value.someMethod()
  }
</script>
```

在 `<script setup>` 中，组件默认是封闭的——父组件无法通过 ref 访问子组件的任何内容。需要使用 defineExpose 来显式暴露想让父组件访问的属性和方法：

```html
<!-- ChildComponent.vue -->
<template>
  <div>
    <p>计数：{{ count }}</p>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)
  const internalData = ref('不想暴露的数据')

  function increment() {
    count.value++
  }

  function reset() {
    count.value = 0
  }

  // 只有通过 defineExpose 暴露的才能被父组件访问
  defineExpose({
    count,
    increment,
    reset,
    // internalData 没有暴露，父组件无法访问
  })
</script>
```

在 v-for 循环中使用 ref 时，ref 会收集一个数组：

```html
<template>
  <ul>
    <li v-for="item in list" :key="item.id" ref="itemRefs">{{ item.text }}</li>
  </ul>
  <button @click="scrollToLast">滚动到最后一项</button>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const list = ref([
    { id: 1, text: '第一项' },
    { id: 2, text: '第二项' },
    { id: 3, text: '第三项' },
  ])

  // 在 v-for 中使用时，ref 会是一个数组
  const itemRefs = ref([])

  onMounted(() => {
    console.log(itemRefs.value) // [li, li, li] DOM 元素数组
  })

  function scrollToLast() {
    const lastItem = itemRefs.value[itemRefs.value.length - 1]
    lastItem.scrollIntoView({ behavior: 'smooth' })
  }
</script>
```

函数形式的 ref 提供了更灵活的控制方式：

```html
<template>
  <input
    :ref="
      (el) => {
        if (el) dynamicRefs['username'] = el
      }
    "
  />
  <input
    :ref="
      (el) => {
        if (el) dynamicRefs['email'] = el
      }
    "
  />
  <button @click="focusField('username')">聚焦用户名</button>
  <button @click="focusField('email')">聚焦邮箱</button>
</template>

<script setup>
  import { reactive } from 'vue'

  const dynamicRefs = reactive({})

  function focusField(name) {
    dynamicRefs[name]?.focus()
  }
</script>
```

使用 $refs 时需要注意以下几点：ref 只在组件挂载后才会填充，因此不能在 setup 的同步代码或模板中的计算属性里依赖它们。组件未挂载前，ref 的值是 null。另外，$refs 不是响应式的——不要在模板或 watch 中依赖 ref 的变化。$refs 主要适用于需要直接操作 DOM 的场景（如管理焦点、集成第三方 DOM 库、获取元素尺寸等），在组件通信中应该尽量避免使用。
