# [0039. Pinia 状态管理（Vue 3 推荐）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0039.%20Pinia%20%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%EF%BC%88Vue%203%20%E6%8E%A8%E8%8D%90%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Pinia 的设计哲学是什么？相比 Vuex 有哪些优势？](#3--pinia-的设计哲学是什么相比-vuex-有哪些优势)
- [4. 🤔 如何使用 defineStore 创建 Store？](#4--如何使用-definestore-创建-store)
- [5. 🤔 Pinia 中的 State、Getters 和 Actions 如何使用？](#5--pinia-中的-stategetters-和-actions-如何使用)
- [6. 🤔 Pinia 的模块化和插件系统如何工作？](#6--pinia-的模块化和插件系统如何工作)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Pinia 的设计哲学与优势
- 创建 Store（defineStore）
- State、Getters、Actions 的使用
- Pinia 的模块化与组合式风格
- Pinia 插件与持久化

## 2. 🫧 评价

- todo

## 3. 🤔 Pinia 的设计哲学是什么？相比 Vuex 有哪些优势？

Pinia 是 Vue 3 官方推荐的状态管理库，它的设计目标是提供一个更简单、更直观、更符合组合式 API 风格的状态管理方案。Pinia 最初是作为 Vuex 5 的提案开始设计的，后来演变成了一个独立的库，并最终成为 Vue 官方推荐的状态管理方案。

Pinia 相比 Vuex 的核心优势：

第一，去掉了 Mutations。在 Vuex 中，修改状态必须通过 Mutations（同步）或 Actions（异步 -> commit Mutation）。Pinia 移除了 Mutations 这个概念，Actions 可以直接修改 State，也可以是同步或异步的。这大幅减少了样板代码：

```js
// Vuex：需要 Mutation + Action
const store = createStore({
  state: () => ({ count: 0 }),
  mutations: {
    INCREMENT(state) {
      state.count++
    },
  },
  actions: {
    increment({ commit }) {
      commit('INCREMENT')
    },
  },
})

// Pinia：直接在 Action 中修改
const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    },
  },
})
```

第二，完整的 TypeScript 支持。Pinia 从设计之初就考虑了 TypeScript，提供了完善的类型推导。不再需要像 Vuex 那样创建大量的类型声明和辅助函数：

```ts
// Pinia 中自动推导类型
const store = useCounterStore()
store.count // number，自动推导
store.increment() // 自动获得方法签名
```

第三，没有嵌套模块和命名空间。每个 Store 都是独立的、扁平的。不需要用 `'module/mutation'` 这样的字符串路径来访问模块，而是直接导入和使用对应的 Store：

```js
// 使用 Pinia，每个 Store 都是独立的
import { useUserStore } from './stores/user'
import { useCartStore } from './stores/cart'

const userStore = useUserStore()
const cartStore = useCartStore()
```

第四，支持组合式 API 风格（Setup Store）。你可以像写 setup 函数一样来定义 Store，使用 ref 作为 state、computed 作为 getters、function 作为 actions：

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // ref() 就是 state
  const count = ref(0)

  // computed() 就是 getters
  const doubleCount = computed(() => count.value * 2)

  // function 就是 actions
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
```

第五，更好的代码分割和懒加载。由于每个 Store 都是独立的模块，打包工具可以自动进行代码分割。而 Vuex 的单一 Store 结构在这方面表现较差。

第六，Devtools 支持更好。Pinia 提供了完整的 Vue Devtools 集成。你可以在 Devtools 中查看每个 Store 的状态、追踪 Action 调用和状态变更的时间线。

## 4. 🤔 如何使用 defineStore 创建 Store？

Pinia 使用 defineStore 函数来创建 Store。defineStore 接收两个主要参数：Store 的唯一 ID 和 Store 的定义。Store 的定义有两种风格：Options Store（选项式）和 Setup Store（组合式）。

Options Store 风格更接近 Vuex 的写法：

```js
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // state 必须是一个函数，返回初始状态
  state: () => ({
    currentUser: null,
    token: localStorage.getItem('token') || null,
    preferences: {
      theme: 'light',
      language: 'zh-CN',
    },
  }),

  // getters 类似 computed
  getters: {
    isLoggedIn: (state) => !!state.token,

    userName: (state) => state.currentUser?.name || '游客',

    // 访问其他 getter
    greeting() {
      return `你好，${this.userName}！`
    },

    // 返回函数（接受参数的 getter）
    hasRole: (state) => (role) => {
      return state.currentUser?.roles?.includes(role) || false
    },
  },

  // actions 可以是同步或异步
  actions: {
    async login(email, password) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        const data = await response.json()

        // 在 action 中通过 this 访问和修改 state
        this.currentUser = data.user
        this.token = data.token
        localStorage.setItem('token', data.token)
      } catch (error) {
        this.currentUser = null
        this.token = null
        throw error
      }
    },

    logout() {
      this.currentUser = null
      this.token = null
      localStorage.removeItem('token')
    },

    updatePreferences(newPrefs) {
      this.preferences = { ...this.preferences, ...newPrefs }
    },
  },
})
```

Setup Store 风格使用组合式 API，更灵活、更利于代码组织和逻辑复用：

```js
// stores/cart.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  // 可以直接使用其他 Store
  const userStore = useUserStore()

  // State
  const items = ref([])
  const couponCode = ref('')

  // Getters
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
  })

  const discount = computed(() => {
    if (couponCode.value === 'VIP20') return subtotal.value * 0.2
    if (couponCode.value === 'SAVE10') return 10
    return 0
  })

  const total = computed(() => {
    return Math.max(0, subtotal.value - discount.value)
  })

  // Actions
  function addItem(product, quantity = 1) {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ ...product, quantity })
    }
  }

  function removeItem(productId) {
    items.value = items.value.filter((i) => i.id !== productId)
  }

  function clearCart() {
    items.value = []
    couponCode.value = ''
  }

  async function checkout() {
    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }

    const response = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ items: items.value, coupon: couponCode.value }),
    })

    if (response.ok) {
      clearCart()
    }
  }

  // 可以使用 watch
  watch(
    items,
    (newItems) => {
      localStorage.setItem('cart', JSON.stringify(newItems))
    },
    { deep: true },
  )

  return {
    items,
    couponCode,
    itemCount,
    subtotal,
    discount,
    total,
    addItem,
    removeItem,
    clearCart,
    checkout,
  }
})
```

安装和使用 Pinia：

```js
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

```html
<!-- 在组件中使用 -->
<template>
  <div>
    <p>{{ userStore.greeting }}</p>
    <p>购物车：{{ cartStore.itemCount }} 件商品</p>
    <p>总价：¥{{ cartStore.total }}</p>
    <button @click="cartStore.addItem(product)">加入购物车</button>
  </div>
</template>

<script setup>
  import { useUserStore } from '../stores/user'
  import { useCartStore } from '../stores/cart'

  const userStore = useUserStore()
  const cartStore = useCartStore()
</script>
```

## 5. 🤔 Pinia 中的 State、Getters 和 Actions 如何使用？

在 Pinia 中，State、Getters 和 Actions 的使用比 Vuex 更加简洁和直观。

State 的访问和修改：

```html
<script setup>
  import { useCounterStore } from '../stores/counter'
  import { storeToRefs } from 'pinia'

  const counterStore = useCounterStore()

  // 直接访问（响应式）
  console.log(counterStore.count)

  // 直接修改
  counterStore.count++

  // 使用 $patch 批量修改
  counterStore.$patch({
    count: counterStore.count + 1,
    name: '新名字',
  })

  // $patch 函数式写法（适合复杂修改，如操作数组）
  counterStore.$patch((state) => {
    state.items.push({ id: 1, name: '新商品' })
    state.count++
    state.hasChanged = true
  })

  // 重置为初始值
  counterStore.$reset()

  // 替换整个 state
  counterStore.$state = { count: 0, name: '重置' }

  // 使用 storeToRefs 来解构（保持响应式）
  // 注意：直接解构会丢失响应式
  const { count, name } = storeToRefs(counterStore)
  // count 和 name 现在是 ref，可以直接在模板中使用
  // 方法不需要 storeToRefs，直接解构即可
  const { increment } = counterStore
</script>
```

监听 State 变化：

```html
<script setup>
  import { useUserStore } from '../stores/user'

  const userStore = useUserStore()

  // 订阅 state 变化
  userStore.$subscribe((mutation, state) => {
    // mutation.type: 'direct' | 'patch object' | 'patch function'
    // mutation.storeId: 'user'
    console.log('状态变化：', mutation.type)

    // 持久化到 localStorage
    localStorage.setItem('userState', JSON.stringify(state))
  })
</script>
```

Getters 的使用：

```js
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    selectedCategory: 'all',
  }),
  getters: {
    // 基础 getter
    productCount: (state) => state.products.length,

    // 使用其他 getter（通过 this）
    filteredProducts() {
      if (this.selectedCategory === 'all') {
        return this.products
      }
      return this.products.filter((p) => p.category === this.selectedCategory)
    },

    // 带参数的 getter（返回函数）
    getProductById: (state) => {
      return (id) => state.products.find((p) => p.id === id)
    },

    // 访问其他 Store 的 getter
    discountedProducts() {
      const settingsStore = useSettingsStore()
      return this.products.map((p) => ({
        ...p,
        discountedPrice: p.price * (1 - settingsStore.globalDiscount),
      }))
    },
  },
})
```

Actions 的使用：

```js
export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    // 同步 action
    addTodo(text) {
      this.todos.push({
        id: Date.now(),
        text,
        done: false,
        createdAt: new Date(),
      })
    },

    toggleTodo(id) {
      const todo = this.todos.find((t) => t.id === id)
      if (todo) todo.done = !todo.done
    },

    // 异步 action
    async fetchTodos() {
      this.isLoading = true
      this.error = null
      try {
        const response = await fetch('/api/todos')
        this.todos = await response.json()
      } catch (e) {
        this.error = e.message
      } finally {
        this.isLoading = false
      }
    },

    // 调用其他 action
    async removeTodo(id) {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      this.todos = this.todos.filter((t) => t.id !== id)
      // 调用其他 Store 的 action
      const notifyStore = useNotifyStore()
      notifyStore.showMessage('任务已删除')
    },
  },
})
```

监听 Action 的调用：

```html
<script setup>
  const todoStore = useTodoStore()

  // 订阅 action
  todoStore.$onAction(({ name, args, after, onError }) => {
    const startTime = Date.now()
    console.log(`Action "${name}" 被调用，参数：`, args)

    after((result) => {
      console.log(`Action "${name}" 完成，耗时 ${Date.now() - startTime}ms`)
    })

    onError((error) => {
      console.error(`Action "${name}" 失败：`, error)
    })
  })
</script>
```

## 6. 🤔 Pinia 的模块化和插件系统如何工作？

Pinia 的模块化是天然的——每个 Store 本身就是一个独立的模块，不需要像 Vuex 那样配置 modules 和 namespace。Store 之间可以直接导入和互相调用。

组织 Store 的推荐目录结构：

```
stores/
  index.js        # 创建 Pinia 实例
  user.js         # 用户相关 Store
  cart.js         # 购物车 Store
  products.js     # 商品 Store
  settings.js     # 设置 Store
  notifications.js # 通知 Store
```

Store 之间互相引用：

```js
// stores/cart.js
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useProductStore } from './products'

export const useCartStore = defineStore('cart', {
  // ...
  actions: {
    async addToCart(productId, quantity) {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        throw new Error('请先登录')
      }

      const productStore = useProductStore()
      const product = productStore.getProductById(productId)
      if (!product) {
        throw new Error('商品不存在')
      }

      this.items.push({
        productId,
        quantity,
        price: product.price,
      })
    },
  },
})
```

Pinia 的插件系统允许你扩展 Store 的功能，为所有 Store 添加全局属性、方法或修改行为。每个插件是一个接收 context 对象的函数：

```js
// plugins/persistPlugin.js
export function piniaPersistedState({ store }) {
  // 从 localStorage 恢复状态
  const savedState = localStorage.getItem(`pinia-${store.$id}`)
  if (savedState) {
    store.$patch(JSON.parse(savedState))
  }

  // 监听状态变化，自动持久化
  store.$subscribe((mutation, state) => {
    localStorage.setItem(`pinia-${store.$id}`, JSON.stringify(state))
  })
}

// plugins/loggerPlugin.js
export function piniaLogger({ store }) {
  store.$onAction(({ name, args, after, onError }) => {
    console.log(`[${store.$id}] Action: ${name}`, args)

    after((result) => {
      console.log(`[${store.$id}] Action ${name} 完成`)
    })

    onError((error) => {
      console.error(`[${store.$id}] Action ${name} 失败：`, error)
    })
  })
}
```

注册插件：

```js
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { piniaPersistedState } from './plugins/persistPlugin'
import { piniaLogger } from './plugins/loggerPlugin'

const pinia = createPinia()

// 注册插件
pinia.use(piniaPersistedState)
pinia.use(piniaLogger)

// 插件也可以为所有 Store 添加属性
pinia.use(({ store }) => {
  // 添加一个全局的 $api 属性
  store.$api = {
    get: (url) => fetch(url).then((r) => r.json()),
    post: (url, data) =>
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  }
})

const app = createApp(App)
app.use(pinia)
app.mount('#app')
```

也可以使用社区提供的持久化插件 pinia-plugin-persistedstate，它提供了更丰富的配置选项：

```bash
npm install pinia-plugin-persistedstate
```

```js
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPersistedstate)
```

```js
export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    preferences: { theme: 'light' },
  }),
  persist: {
    // 只持久化指定字段
    pick: ['token'],
    // 自定义存储方式
    storage: sessionStorage,
  },
})
```
