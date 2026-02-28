# [0028. 计算属性与侦听器](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0028.%20%E8%AE%A1%E7%AE%97%E5%B1%9E%E6%80%A7%E4%B8%8E%E4%BE%A6%E5%90%AC%E5%99%A8)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 计算属性（computed）有哪些使用场景？](#3--计算属性computed有哪些使用场景)
- [4. 🤔 计算属性的缓存和方法调用有什么区别？](#4--计算属性的缓存和方法调用有什么区别)
- [5. 🤔 计算属性的 setter 和 getter 是什么？](#5--计算属性的-setter-和-getter-是什么)
- [6. 🤔 侦听器（watch）的深度监听与立即执行是什么？](#6--侦听器watch的深度监听与立即执行是什么)
- [7. 🤔 computed 和 watch 应该如何选择？](#7--computed-和-watch-应该如何选择)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 计算属性（computed）的使用场景
- 计算属性的缓存 vs 方法调用
- 计算属性的 setter 与 getter
- 侦听器（watch）的深度监听与立即执行
- computed 与 watch 的选择

## 2. 🫧 评价

- todo

## 3. 🤔 计算属性（computed）有哪些使用场景？

计算属性（computed）是 Vue 中用于声明式地派生新数据的核心特性。当你需要基于已有的响应式数据经过一些计算或转换来得到新值时，计算属性就是最佳选择。与直接在模板中编写复杂表达式或使用方法调用相比，计算属性具有自动缓存和声明式依赖追踪的优势。

最常见的使用场景是对数据进行格式化或转换：

```html
<template>
  <p>全名：{{ fullName }}</p>
  <p>格式化价格：{{ formattedPrice }}</p>
  <p>倒序消息：{{ reversedMessage }}</p>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const firstName = ref('三')
  const lastName = ref('张')
  const price = ref(1234.5)
  const message = ref('Hello Vue')

  // 拼接全名
  const fullName = computed(() => lastName.value + firstName.value)

  // 格式化价格
  const formattedPrice = computed(() => {
    return '¥' + price.value.toFixed(2)
  })

  // 字符串反转
  const reversedMessage = computed(() => {
    return message.value.split('').reverse().join('')
  })
</script>
```

列表过滤和排序是计算属性另一个非常重要的使用场景。当你有一个原始数据列表，需要根据搜索条件或排序规则展示一部分数据时，使用计算属性可以保持原始数据不变，同时自动追踪过滤条件的变化：

```html
<template>
  <input v-model="searchQuery" placeholder="搜索..." />
  <select v-model="sortKey">
    <option value="name">按名称</option>
    <option value="price">按价格</option>
  </select>

  <ul>
    <li v-for="item in filteredAndSortedItems" :key="item.id">
      {{ item.name }} - ¥{{ item.price }}
    </li>
  </ul>

  <p>共 {{ filteredCount }} 项</p>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const searchQuery = ref('')
  const sortKey = ref('name')

  const items = ref([
    { id: 1, name: '苹果', price: 5 },
    { id: 2, name: '香蕉', price: 3 },
    { id: 3, name: '橙子', price: 4 },
    { id: 4, name: '葡萄', price: 8 },
  ])

  const filteredAndSortedItems = computed(() => {
    let result = items.value

    // 过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(query))
    }

    // 排序
    return result.slice().sort((a, b) => {
      if (sortKey.value === 'price') {
        return a.price - b.price
      }
      return a.name.localeCompare(b.name)
    })
  })

  const filteredCount = computed(() => filteredAndSortedItems.value.length)
</script>
```

条件判断和状态聚合也是计算属性的典型应用。当你需要根据多个条件组合来决定某个状态时，计算属性可以将复杂的逻辑从模板中提取出来：

```html
<template>
  <form @submit.prevent="submit">
    <input v-model="username" />
    <input v-model="password" type="password" />
    <input v-model="confirmPassword" type="password" />

    <p v-if="passwordMismatch" class="error">两次输入的密码不一致</p>

    <button :disabled="!isFormValid">{{ submitButtonText }}</button>
  </form>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const username = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const isSubmitting = ref(false)

  const passwordMismatch = computed(() => {
    return (
      password.value !== '' &&
      confirmPassword.value !== '' &&
      password.value !== confirmPassword.value
    )
  })

  const isFormValid = computed(() => {
    return (
      username.value.length >= 3 &&
      password.value.length >= 6 &&
      password.value === confirmPassword.value &&
      !isSubmitting.value
    )
  })

  const submitButtonText = computed(() => {
    if (isSubmitting.value) return '提交中...'
    if (!isFormValid.value) return '请填写完整信息'
    return '提交'
  })
</script>
```

## 4. 🤔 计算属性的缓存和方法调用有什么区别？

计算属性和方法都可以用来根据已有数据计算新的值，但它们的工作机制有本质的区别。理解这个区别对于做出正确的选择和编写高性能的 Vue 应用至关重要。

计算属性最显著的特点是缓存。计算属性的值会被缓存起来，只有当它所依赖的响应式数据发生变化时，才会重新计算。如果依赖没有变化，多次访问计算属性会直接返回之前缓存的结果，而不会重复执行计算逻辑：

```html
<template>
  <!-- 即使模板中多次引用，计算属性也只会计算一次 -->
  <p>{{ expensiveResult }}</p>
  <p>{{ expensiveResult }}</p>
  <p>{{ expensiveResult }}</p>

  <!-- 如果是方法，每次引用都会重新执行 -->
  <p>{{ getExpensiveResult() }}</p>
  <p>{{ getExpensiveResult() }}</p>
  <p>{{ getExpensiveResult() }}</p>

  <button @click="unrelatedData++">修改无关数据</button>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const items = ref([1, 2, 3, 4, 5])
  const unrelatedData = ref(0)

  // 计算属性：依赖 items，有缓存
  const expensiveResult = computed(() => {
    console.log('计算属性执行了') // 只在 items 变化时打印
    return items.value.reduce((sum, item) => sum + item, 0)
  })

  // 方法：每次渲染都执行，无缓存
  function getExpensiveResult() {
    console.log('方法执行了') // 每次渲染都会打印 3 次
    return items.value.reduce((sum, item) => sum + item, 0)
  }
</script>
```

在上面的例子中，当你点击按钮修改 unrelatedData 时，组件会重新渲染。此时计算属性 expensiveResult 因为它的依赖 items 没有变化，会直接返回缓存值，不会重新计算。而方法 getExpensiveResult 会被调用 3 次（模板中引用了 3 次），每次都执行一遍 reduce 逻辑。

缓存的优势在处理开销较大的计算时尤为明显：

```html
<script setup>
  import { ref, computed } from 'vue'

  const users = ref([
    { name: '张三', scores: [85, 92, 78] },
    { name: '李四', scores: [90, 88, 95] },
    // 假设有成百上千条数据...
  ])

  // 计算属性：计算所有用户的平均分，结果会被缓存
  const averageScores = computed(() => {
    return users.value.map((user) => {
      const sum = user.scores.reduce((a, b) => a + b, 0)
      return {
        name: user.name,
        average: (sum / user.scores.length).toFixed(1),
      }
    })
  })
</script>
```

那么什么时候应该使用方法而不是计算属性呢？当你需要传递参数时，必须使用方法，因为计算属性不接受参数：

```html
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <!-- 需要传参时，只能使用方法 -->
      {{ formatPrice(item.price, 'CNY') }}
    </li>
  </ul>
</template>

<script setup>
  function formatPrice(price, currency) {
    const symbols = { CNY: '¥', USD: '$', EUR: '€' }
    return `${symbols[currency] || ''}${price.toFixed(2)}`
  }
</script>
```

当你需要执行有副作用的操作（如修改 DOM、发起网络请求等）时，也应该使用方法或侦听器，而不是计算属性。计算属性应该是纯函数——相同的输入总是得到相同的输出，不会产生副作用。

总结来说，选择 computed 还是 method 的原则是：如果一个派生值依赖于响应式数据、不需要参数、没有副作用，并且可能被多次使用，那就使用 computed；如果需要传参、有副作用，或者特意希望每次渲染都重新执行，那就使用 method。

## 5. 🤔 计算属性的 setter 和 getter 是什么？

计算属性默认只有 getter——你只能读取它的值。但在某些场景下，你可能需要"反向设置"计算属性的值，此时就需要为计算属性提供一个 setter。当你对计算属性赋值时，setter 会被调用，通常在 setter 中我们会去修改该计算属性所依赖的底层源数据。

在组合式 API 中，计算属性的 getter 和 setter 通过传入一个包含 get 和 set 函数的对象来定义：

```html
<template>
  <p>全名：{{ fullName }}</p>
  <input v-model="fullName" />
  <p>姓：{{ lastName }}</p>
  <p>名：{{ firstName }}</p>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const firstName = ref('三')
  const lastName = ref('张')

  // 带 getter 和 setter 的计算属性
  const fullName = computed({
    get() {
      return lastName.value + firstName.value
    },
    set(newValue) {
      // 当给 fullName 赋值时，反向更新源数据
      lastName.value = newValue.charAt(0)
      firstName.value = newValue.slice(1)
    },
  })
</script>
```

在上面的例子中，当用户在输入框中修改 fullName 时（因为 v-model 会对 fullName 进行赋值），setter 会被调用并更新 lastName 和 firstName。这两个源数据的变化又会触发 getter 重新计算，形成一个完整的数据流闭环。

在选项式 API 中的写法类似：

```js
export default {
  data() {
    return {
      firstName: '三',
      lastName: '张',
    }
  },
  computed: {
    fullName: {
      get() {
        return this.lastName + this.firstName
      },
      set(newValue) {
        this.lastName = newValue.charAt(0)
        this.firstName = newValue.slice(1)
      },
    },
  },
}
```

另一个常见的使用场景是单位转换。假设你有一个以摄氏度存储的温度值，但需要同时支持华氏度的读取和设置：

```html
<template>
  <div>
    <label>摄氏度：</label>
    <input v-model.number="celsius" type="number" />

    <label>华氏度：</label>
    <input v-model.number="fahrenheit" type="number" />
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const celsius = ref(25)

  const fahrenheit = computed({
    get() {
      return (celsius.value * 9) / 5 + 32
    },
    set(newValue) {
      celsius.value = ((newValue - 32) * 5) / 9
    },
  })
</script>
```

配合 v-model 使用是计算属性 setter 最典型的应用。当你需要对一个 store 中的状态使用 v-model 时，可以通过计算属性的 getter/setter 来桥接：

```html
<template>
  <input v-model="localSearchQuery" />
</template>

<script setup>
  import { computed } from 'vue'
  import { useSearchStore } from './stores/search'

  const searchStore = useSearchStore()

  const localSearchQuery = computed({
    get() {
      return searchStore.query
    },
    set(value) {
      searchStore.updateQuery(value)
    },
  })
</script>
```

需要注意的是，计算属性的 setter 应该只用于更新源数据，不应该包含复杂的副作用逻辑（如网络请求、DOM 操作等）。如果 setter 中的逻辑很复杂，通常意味着应该将其拆分为一个方法调用或使用侦听器来处理。

## 6. 🤔 侦听器（watch）的深度监听与立即执行是什么？

侦听器（watch）用于在响应式数据变化时执行副作用操作，比如发起 API 请求、操作 DOM、将数据同步到本地存储等。与计算属性不同，watch 不需要返回值，它的作用是"当数据变化时，做某件事"。Vue 3 提供了两种侦听 API：watch 和 watchEffect。

watch 的基本用法是监听一个或多个响应式数据源，在数据变化时执行回调：

```html
<script setup>
  import { ref, watch } from 'vue'

  const searchQuery = ref('')
  const page = ref(1)

  // 监听单个 ref
  watch(searchQuery, (newValue, oldValue) => {
    console.log(`搜索词从 "${oldValue}" 变为 "${newValue}"`)
    fetchSearchResults(newValue)
  })

  // 监听多个数据源
  watch([searchQuery, page], ([newQuery, newPage], [oldQuery, oldPage]) => {
    console.log(`搜索词：${newQuery}，页码：${newPage}`)
    fetchSearchResults(newQuery, newPage)
  })

  // 监听 reactive 对象的某个属性（需要使用 getter 函数）
  import { reactive } from 'vue'
  const state = reactive({ count: 0 })

  watch(
    () => state.count,
    (newCount) => {
      console.log('count 变为：', newCount)
    },
  )
</script>
```

深度监听（deep watch）用于监听对象内部属性的变化。默认情况下，watch 只会在被监听的引用本身发生变化时触发。如果你需要监听对象内部任意层级属性的变化，需要设置 deep: true：

```html
<script setup>
  import { ref, watch, reactive } from 'vue'

  const userInfo = ref({
    name: '张三',
    address: {
      city: '北京',
      district: '海淀区',
    },
  })

  // 没有 deep 选项时，修改 userInfo.value.name 不会触发回调
  // 除非整体替换 userInfo.value

  // 深度监听：对象内部任何属性变化都会触发
  watch(
    userInfo,
    (newValue) => {
      console.log('用户信息变化了：', newValue)
      saveToLocalStorage(newValue)
    },
    { deep: true },
  )

  // 注意：reactive 对象默认就是深度监听的
  const state = reactive({
    nested: { count: 0 },
  })

  watch(state, (newState) => {
    // state 内部任何变化都会触发
    console.log('state 变化了')
  })
</script>
```

需要注意的是，深度监听需要遍历被监听对象的所有嵌套属性，对于大型数据结构可能会有性能问题。如果你只关心对象中的某个特定属性，建议使用 getter 函数来精确监听：

```html
<script setup>
  import { reactive, watch } from 'vue'

  const state = reactive({
    user: {
      name: '张三',
      address: {
        city: '北京',
      },
    },
  })

  // 精确监听某个属性，避免不必要的深度监听
  watch(
    () => state.user.address.city,
    (newCity) => {
      console.log('城市变为：', newCity)
      fetchCityData(newCity)
    },
  )
</script>
```

立即执行（immediate）用于在侦听器创建时立即执行一次回调。默认情况下，watch 的回调只在数据变化后才执行，不会在初始化时触发。设置 immediate: true 后，回调会在侦听器创建时立即执行一次：

```html
<script setup>
  import { ref, watch } from 'vue'

  const userId = ref(1)

  // 不使用 immediate：初始时不会获取数据
  watch(userId, (newId) => {
    fetchUserData(newId) // 只在 userId 变化后触发
  })

  // 使用 immediate：初始时就获取数据
  watch(
    userId,
    (newId) => {
      fetchUserData(newId)
    },
    { immediate: true },
  )

  // 使用 watchEffect 可以替代 immediate: true 的场景
  import { watchEffect } from 'vue'

  watchEffect(() => {
    // 会立即执行一次，之后在依赖变化时重新执行
    fetchUserData(userId.value)
  })
</script>
```

watchEffect 是 Vue 3 新引入的 API，它与 watch 的主要区别在于：watchEffect 会自动追踪其回调函数中使用到的所有响应式依赖，不需要显式指定监听的数据源；它会在创建时立即执行一次（相当于自带 `immediate: true`）；它的回调函数不接收新值和旧值参数：

```html
<script setup>
  import { ref, watchEffect } from 'vue'

  const keyword = ref('')
  const category = ref('all')
  const page = ref(1)

  // watchEffect 自动追踪所有使用到的响应式变量
  const stopWatch = watchEffect(async () => {
    const results = await fetch(
      `/api/search?q=${keyword.value}&cat=${category.value}&page=${page.value}`,
    )
    // keyword、category、page 中任何一个变化都会重新执行
  })

  // 停止侦听
  // stopWatch()
</script>
```

watch 还支持 flush 选项来控制回调的执行时机。默认值 'pre' 表示在 DOM 更新之前执行；'post' 表示在 DOM 更新之后执行（适合需要访问更新后的 DOM 的场景）；'sync' 表示同步执行（不推荐，可能导致性能问题）：

```html
<script setup>
  import { ref, watch, watchPostEffect } from 'vue'

  const count = ref(0)

  // flush: 'post' 确保回调中可以访问更新后的 DOM
  watch(
    count,
    () => {
      console.log('DOM 已更新，可以安全访问')
    },
    { flush: 'post' },
  )

  // 等价的简写
  watchPostEffect(() => {
    console.log('DOM 更新后执行')
  })
</script>
```

## 7. 🤔 computed 和 watch 应该如何选择？

computed 和 watch 是 Vue 中处理响应式数据变化的两种主要方式，它们在功能上有一些重叠，但设计目的和适用场景有着明确的区分。选择错误不会导致程序无法运行，但会影响代码的可读性、可维护性和性能。

computed 的核心用途是声明式地派生数据。它是一个纯函数——接收响应式数据作为输入，返回一个新的值。computed 适合用于"A 数据变了，B 数据也应该相应地变"的场景：

```html
<script setup>
  import { ref, computed } from 'vue'

  const price = ref(100)
  const quantity = ref(2)
  const discount = ref(0.8)

  // computed 派生数据：total 由 price、quantity、discount 共同决定
  const total = computed(() => price.value * quantity.value * discount.value)
</script>
```

watch 的核心用途是响应数据变化并执行副作用。它适合用于"A 数据变了，我需要做某件事"的场景——这件事通常是模板渲染以外的操作，比如网络请求、日志记录、存储同步等：

```html
<script setup>
  import { ref, watch } from 'vue'

  const searchQuery = ref('')

  // watch 执行副作用：searchQuery 变了，发起搜索请求
  watch(searchQuery, async (query) => {
    if (query.length < 2) return
    const results = await fetch(`/api/search?q=${query}`)
    // 处理搜索结果
  })
</script>
```

以下是几个常见的选择判断准则：

如果你需要从已有数据计算出一个新值，并在模板中使用这个值，用 computed：

```html
<script setup>
  import { ref, computed } from 'vue'

  const items = ref([
    { name: '苹果', price: 5, inStock: true },
    { name: '香蕉', price: 3, inStock: false },
    { name: '橙子', price: 4, inStock: true },
  ])

  // 用 computed：从 items 派生出有库存的商品列表
  const availableItems = computed(() =>
    items.value.filter((item) => item.inStock),
  )

  // 用 computed：从 items 派生出总价
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price, 0),
  )
</script>
```

如果你需要在数据变化时执行异步操作，用 watch：

```html
<script setup>
  import { ref, watch } from 'vue'

  const userId = ref(1)
  const userData = ref(null)

  // 用 watch：userId 变化时获取用户数据
  watch(
    userId,
    async (newId) => {
      userData.value = null
      try {
        const response = await fetch(`/api/users/${newId}`)
        userData.value = await response.json()
      } catch (error) {
        console.error('获取用户数据失败：', error)
      }
    },
    { immediate: true },
  )
</script>
```

如果你需要在数据变化时执行有限次数的操作（如只执行一次），用 watch 并在回调中停止侦听：

```html
<script setup>
  import { ref, watch } from 'vue'

  const data = ref(null)

  const stopWatch = watch(data, (newValue) => {
    if (newValue) {
      // 数据加载完成后执行某些初始化操作，然后停止监听
      initializeComponent(newValue)
      stopWatch()
    }
  })
</script>
```

一个常见的反模式是用 watch 来做 computed 的工作：

```html
<script setup>
  import { ref, watch, computed } from 'vue'

  const firstName = ref('三')
  const lastName = ref('张')

  // 反模式：使用 watch 来维护一个派生值
  const fullName = ref('')
  watch(
    [firstName, lastName],
    ([first, last]) => {
      fullName.value = last + first
    },
    { immediate: true },
  )

  // 正确做法：使用 computed
  const fullNameCorrect = computed(() => lastName.value + firstName.value)
</script>
```

反模式的问题在于：代码更冗长、需要手动设置 immediate 以获取初始值、fullName 作为一个独立的 ref 可能被意外修改、依赖关系不如 computed 清晰。computed 版本更简洁，依赖关系一目了然，并且有缓存优化。

简单总结：computed 用于数据转换和派生，watch 用于副作用响应。如果你发现自己在 watch 回调中只是在给另一个 ref 赋值、没有做任何异步或副作用操作，那几乎可以肯定应该用 computed 来替代。
