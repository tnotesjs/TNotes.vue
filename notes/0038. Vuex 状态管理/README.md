# [0038. Vuex 状态管理](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0038.%20Vuex%20%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vuex 的核心概念是什么？什么场景需要使用状态管理？](#3--vuex-的核心概念是什么什么场景需要使用状态管理)
- [4. 🤔 State 和 Getters 如何管理和派发状态？](#4--state-和-getters-如何管理和派发状态)
- [5. 🤔 Mutations 和 Actions 有什么区别？](#5--mutations-和-actions-有什么区别)
- [6. 🤔 Vuex 的模块化和命名空间如何使用？](#6--vuex-的模块化和命名空间如何使用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Vuex 的核心概念与使用场景
- State（单一状态树）与 mapState
- Getters（派发状态）与 mapGetters
- Mutations（更改状态）与 mapMutations
- Actions（异步操作）与 mapActions
- Modules（模块化）与命名空间

## 2. 🫧 评价

- todo

## 3. 🤔 Vuex 的核心概念是什么？什么场景需要使用状态管理？

Vuex 是 Vue.js 的官方状态管理库，它采用集中式存储来管理应用中所有组件的共享状态，并以规则确保状态只能以可预测的方式发生变化。Vuex 借鉴了 Flux 和 Redux 的设计思想，但针对 Vue 的响应式系统做了适配。

Vuex 的核心概念围绕一个单向数据流模型：

```
Actions → Mutations → State → Vue Components → (dispatch) Actions
```

- State：存储应用的共享数据（单一状态树）
- Getters：从 State 中派生出计算值（类似计算属性）
- Mutations：同步地修改 State 的唯一方式
- Actions：处理异步操作，然后提交 Mutations
- Modules：将 Store 分割成模块

安装和基本配置：

```bash
npm install vuex@4
```

```js
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 0,
      user: null,
      todos: [],
    }
  },
  getters: {
    doneTodos(state) {
      return state.todos.filter((todo) => todo.done)
    },
    doneTodoCount(state, getters) {
      return getters.doneTodos.length
    },
  },
  mutations: {
    INCREMENT(state) {
      state.count++
    },
    SET_USER(state, user) {
      state.user = user
    },
    ADD_TODO(state, todo) {
      state.todos.push(todo)
    },
  },
  actions: {
    async fetchUser({ commit }, userId) {
      const user = await fetch(`/api/users/${userId}`).then((r) => r.json())
      commit('SET_USER', user)
    },
    async addTodo({ commit }, text) {
      const todo = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text, done: false }),
      }).then((r) => r.json())
      commit('ADD_TODO', todo)
    },
  },
})

export default store
```

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

createApp(App).use(store).mount('#app')
```

什么场景需要使用状态管理？当你的应用满足以下条件时：多个组件依赖同一份数据；来自不同组件的行为需要修改同一份数据；数据需要在组件树中跨层级传递。典型的例子包括用户登录信息、购物车数据、应用主题设置、权限信息等。

但并非所有应用都需要 Vuex。如果应用足够简单，使用 props/emit 和 provide/inject 就能解决问题，引入 Vuex 反而会增加不必要的复杂度。

## 4. 🤔 State 和 Getters 如何管理和派发状态？

State 是 Vuex 中存储数据的核心。Vuex 使用单一状态树——一个对象就包含了应用的全部状态。这使得我们能够直接定位任何一个特定的状态片段，在调试时也能轻松获取当前应用的状态快照。

在组件中访问 State：

```html
<template>
  <div>
    <p>计数：{{ count }}</p>
    <p>用户名：{{ user?.name }}</p>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useStore } from 'vuex'

  const store = useStore()

  // 方式 1：通过 computed 包裹（推荐）
  const count = computed(() => store.state.count)
  const user = computed(() => store.state.user)
</script>
```

在选项式 API 中，可以使用 mapState 辅助函数来简化代码：

```html
<script>
  import { mapState } from 'vuex'

  export default {
    computed: {
      // 数组写法
      ...mapState(['count', 'user', 'todos']),

      // 对象写法（可以重命名）
      ...mapState({
        currentCount: 'count',
        currentUser: 'user',
        // 函数写法：可以进行计算
        todoCount: (state) => state.todos.length,
      }),

      // 和本地计算属性混用
      localComputed() {
        return this.count * 2
      },
    },
  }
</script>
```

Getters 是从 State 中派生出的计算状态，类似于组件的 computed 属性。当多个组件需要基于同一份数据做相同的计算时，Getters 可以避免重复逻辑：

```js
const store = createStore({
  state() {
    return {
      products: [
        { id: 1, name: '笔记本', price: 6999, inStock: true },
        { id: 2, name: '手机', price: 4999, inStock: false },
        { id: 3, name: '平板', price: 3999, inStock: true },
      ],
      cart: [
        { productId: 1, quantity: 2 },
        { productId: 3, quantity: 1 },
      ],
    }
  },
  getters: {
    // 获取所有在售商品
    availableProducts(state) {
      return state.products.filter((p) => p.inStock)
    },

    // Getter 可以访问其他 Getter
    availableProductCount(state, getters) {
      return getters.availableProducts.length
    },

    // 返回函数形式的 Getter（支持传参）
    getProductById: (state) => (id) => {
      return state.products.find((p) => p.id === id)
    },

    // 购物车总价
    cartTotal(state) {
      return state.cart.reduce((total, item) => {
        const product = state.products.find((p) => p.id === item.productId)
        return total + (product?.price || 0) * item.quantity
      }, 0)
    },
  },
})
```

在组件中使用 Getters：

```html
<script setup>
  import { computed } from 'vue'
  import { useStore } from 'vuex'

  const store = useStore()

  const availableProducts = computed(() => store.getters.availableProducts)
  const cartTotal = computed(() => store.getters.cartTotal)

  // 带参数的 Getter
  const getProduct = (id) => store.getters.getProductById(id)
</script>
```

## 5. 🤔 Mutations 和 Actions 有什么区别？

Mutations 是更改 Vuex Store 中状态的唯一合法方式。每个 Mutation 都有一个字符串类型的事件名（type）和一个处理函数（handler）。处理函数接收 state 作为第一个参数，第二个参数是可选的载荷（payload）。

Mutations 必须是同步函数。这是因为 Vuex 的 devtools 需要捕获每次 Mutation 前后的状态快照。如果 Mutation 中包含异步操作，devtools 就无法追踪状态的变化。

```js
const store = createStore({
  state() {
    return {
      count: 0,
      user: null,
      items: [],
    }
  },
  mutations: {
    // 无载荷
    INCREMENT(state) {
      state.count++
    },

    // 带载荷
    INCREMENT_BY(state, amount) {
      state.count += amount
    },

    // 载荷通常是一个对象
    SET_USER(state, { name, email, role }) {
      state.user = { name, email, role }
    },

    // 修改数组
    ADD_ITEM(state, item) {
      state.items.push(item)
    },

    REMOVE_ITEM(state, id) {
      state.items = state.items.filter((item) => item.id !== id)
    },

    UPDATE_ITEM(state, { id, updates }) {
      const item = state.items.find((item) => item.id === id)
      if (item) {
        Object.assign(item, updates)
      }
    },
  },
})
```

在组件中提交 Mutation：

```html
<script setup>
  import { useStore } from 'vuex'

  const store = useStore()

  // 直接提交
  store.commit('INCREMENT')
  store.commit('INCREMENT_BY', 10)
  store.commit('SET_USER', {
    name: '张三',
    email: 'zs@mail.com',
    role: 'admin',
  })

  // 对象风格的提交
  store.commit({
    type: 'SET_USER',
    name: '张三',
    email: 'zs@mail.com',
    role: 'admin',
  })
</script>
```

Actions 和 Mutations 类似，但有两个关键区别：Actions 可以包含异步操作；Actions 不直接修改 State，而是通过提交 Mutations 来修改。

```js
const store = createStore({
  // ...
  actions: {
    // context 对象包含 commit, state, getters, dispatch 等
    async login({ commit, dispatch }, credentials) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        })
        const user = await response.json()

        // 通过 commit 提交 Mutation 来修改状态
        commit('SET_USER', user)

        // Action 可以 dispatch 其他 Action
        await dispatch('fetchUserPermissions', user.id)

        return user
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async fetchUserPermissions({ commit }, userId) {
      const permissions = await fetch(`/api/users/${userId}/permissions`).then(
        (r) => r.json(),
      )
      commit('SET_PERMISSIONS', permissions)
    },

    // 组合多个异步操作
    async initializeApp({ dispatch }) {
      await Promise.all([
        dispatch('fetchUser'),
        dispatch('fetchSettings'),
        dispatch('fetchNotifications'),
      ])
    },
  },
})
```

在组件中分发 Action：

```html
<script setup>
  import { useStore } from 'vuex'

  const store = useStore()

  async function handleLogin() {
    try {
      const user = await store.dispatch('login', {
        email: 'user@example.com',
        password: '123456',
      })
      console.log('登录成功：', user.name)
    } catch (error) {
      console.error('登录失败：', error)
    }
  }
</script>
```

总结：Mutations 负责同步地修改状态，是唯一能直接更改 State 的途径。Actions 负责处理业务逻辑和异步操作，通过提交 Mutations 来间接修改状态。在实际开发中，组件 dispatch Action，Action 内部做异步处理后 commit Mutation，Mutation 直接修改 State。

## 6. 🤔 Vuex 的模块化和命名空间如何使用？

当应用变得复杂时，将所有状态集中在一个 Store 中会使代码变得臃肿且难以维护。Vuex 的模块化（Modules）允许将 Store 分割成独立的模块，每个模块拥有自己的 state、getters、mutations 和 actions。

```js
// store/modules/user.js
export default {
  namespaced: true,
  state() {
    return {
      currentUser: null,
      token: null,
      permissions: []
    }
  },
  getters: {
    isLoggedIn(state) {
      return !!state.token
    },
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    }
  },
  mutations: {
    SET_USER(state, user) {
      state.currentUser = user
    },
    SET_TOKEN(state, token) {
      state.token = token
    },
    CLEAR_AUTH(state) {
      state.currentUser = null
      state.token = null
      state.permissions = []
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const { user, token } = await api.login(credentials)
      commit('SET_USER', user)
      commit('SET_TOKEN', token)
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
    }
  }
}

// store/modules/cart.js
export default {
  namespaced: true,
  state() {
    return {
      items: [],
      checkoutStatus: null
    }
  },
  getters: {
    cartItems(state, getters, rootState) {
      // 可以访问 rootState 获取其他模块的状态
      return state.items.map(item => ({
        ...item,
        product: rootState.products.all.find(p => p.id === item.productId)
      }))
    },
    totalPrice(state, getters) {
      return getters.cartItems.reduce((total, item) => {
        return total + item.product.price * item.quantity
      }, 0)
    }
  },
  mutations: {
    ADD_ITEM(state, { productId, quantity }) {
      const existing = state.items.find(i => i.productId === productId)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({ productId, quantity })
      }
    },
    CLEAR_CART(state) {
      state.items = []
    }
  },
  actions: {
    async checkout({ commit, state, rootGetters }) {
      try {
        await api.checkout(state.items)
        commit('CLEAR_CART')
        commit('SET_CHECKOUT_STATUS', 'success')
      } catch (error) {
        commit('SET_CHECKOUT_STATUS', 'failed')
      }
    }
  }
}
```

```js
// store/index.js
import { createStore } from 'vuex'
import user from './modules/user'
import cart from './modules/cart'

export default createStore({
  modules: {
    user,
    cart,
  },
})
```

当使用 namespaced: true 后，模块的 getters、mutations 和 actions 都会自动带上模块路径作为前缀：

```html
<script setup>
  import { computed } from 'vue'
  import { useStore } from 'vuex'

  const store = useStore()

  // 访问命名空间模块的 state
  const currentUser = computed(() => store.state.user.currentUser)
  const cartItems = computed(() => store.state.cart.items)

  // 访问命名空间模块的 getters
  const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])
  const totalPrice = computed(() => store.getters['cart/totalPrice'])

  // 提交命名空间模块的 mutation
  store.commit('cart/ADD_ITEM', { productId: 1, quantity: 1 })

  // 分发命名空间模块的 action
  store.dispatch('user/login', { email: 'test@mail.com', password: '123' })
</script>
```

在命名空间模块内，如果需要访问全局的 state 和 getters，或者提交/分发根级别的 mutation/action，可以通过 rootState、rootGetters 和 { root: true } 选项：

```js
actions: {
  // rootState 和 rootGetters 作为第三和第四个参数传入 getter
  someAction({ dispatch, commit, rootState, rootGetters }) {
    // 访问根级别的 state
    const globalSetting = rootState.settings

    // 分发根级别或其他模块的 action
    dispatch('otherModule/someAction', payload, { root: true })

    // 提交根级别的 mutation
    commit('GLOBAL_MUTATION', payload, { root: true })
  }
}
```

需要注意，Vuex 目前已进入维护模式，Vue 3 官方推荐使用 Pinia 作为状态管理方案。Pinia 在设计上更加简洁，去掉了 Mutations 的概念，对 TypeScript 支持更好，且完全兼容组合式 API。
