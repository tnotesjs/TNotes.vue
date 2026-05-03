# [0028. 计算属性（computed）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0028.%20%E8%AE%A1%E7%AE%97%E5%B1%9E%E6%80%A7%EF%BC%88computed%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 计算属性（computed）有哪些使用场景？](#3--计算属性computed有哪些使用场景)
  - [3.1. 对数据进行格式化或转换](#31-对数据进行格式化或转换)
  - [3.2. 列表过滤和排序](#32-列表过滤和排序)
  - [3.3. 条件判断和状态聚合](#33-条件判断和状态聚合)
  - [3.4. 小结](#34-小结)
- [4. 🤔 计算属性的缓存和方法调用有什么区别？](#4--计算属性的缓存和方法调用有什么区别)
  - [4.1. 缓存差异](#41-缓存差异)
  - [4.2. 使用方法的场景](#42-使用方法的场景)
  - [4.3. computed 和 method 的选择策略](#43-computed-和-method-的选择策略)
- [5. 🤔 计算属性的 setter 和 getter 是什么？](#5--计算属性的-setter-和-getter-是什么)
  - [5.1. 给计算属性添加 setter](#51-给计算属性添加-setter)
  - [5.2. 应用场景：华氏度、摄氏度的单位转换（双向绑定）](#52-应用场景华氏度摄氏度的单位转换双向绑定)
  - [5.3. 应用场景：配合 v-model 使用（双向绑定）](#53-应用场景配合-v-model-使用双向绑定)
  - [5.4. 获取计算属性上一次的值（Vue 3.4+）](#54-获取计算属性上一次的值vue-34)
    - [如何评价这一特性？](#如何评价这一特性)
- [6. 🤔 计算属性的最佳实践是？](#6--计算属性的最佳实践是)
  - [6.1. Getter 不应有副作用](#61-getter-不应有副作用)
  - [6.2. 只读原则](#62-只读原则)
  - [6.3. 不要依赖计算属性对依赖变更的监听特性来触发副作用操作](#63-不要依赖计算属性对依赖变更的监听特性来触发副作用操作)
- [7. 🔗 引用](#7--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 计算属性（computed）的使用场景
- 计算属性 vs 方法
- 计算属性的 setter 与 getter
- 计算属性的最佳实践

## 2. 🫧 评价

计算属性在开发中是非常常用的特性，理解它的使用场景和工作机制还是很重要的。它本身的使用并不难，难在判断什么时候应该使用计算属性（比如权衡使用 computed 还是 method 还是 watch），以及计算属性中为什么不应该出现副作用操作（比如网络请求、DOM 操作等）。

关于笔记中提到的计算属性的 setter，在实际开发中使用频率较低，更多时候都是只有一个默认的 getter，和 setter 相关的内容可以先作简单了解即可。

## 3. 🤔 计算属性（computed）有哪些使用场景？

计算属性（computed）是 Vue 中用于声明式地派生新数据的核心特性。当你需要基于已有的响应式数据经过一些计算或转换来得到新值时，计算属性就是最佳选择。与直接在模板中编写复杂表达式或使用方法调用相比，计算属性具有自动缓存和声明式依赖追踪的优势。

### 3.1. 对数据进行格式化或转换

最常见的使用场景是对数据进行格式化或转换：

```html
<template>
  <p>全名：{{ fullName }}</p>
  <!--
    当然，你完全可以不使用计算属性
    比如 fullName 你可以直接在模板中书写表达式：
    <p>全名：{{ lastName + firstName }}</p> 
    
    使用计算属性的优势在于：
    - 让模板更简洁
    - 更好的语义
    - 缓存功能
  -->
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
  const formattedPrice = computed(() => '¥' + price.value.toFixed(2))

  // 字符串反转
  const reversedMessage = computed(() =>
    message.value.split('').reverse().join(''),
  )
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-01-13-11-09.png)

### 3.2. 列表过滤和排序

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
    return result
      .slice()
      .sort((a, b) =>
        sortKey.value === 'price'
          ? a.price - b.price
          : a.name.localeCompare(b.name),
      )
  })

  const filteredCount = computed(() => filteredAndSortedItems.value.length)
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-01-13-16-25.png)

### 3.3. 条件判断和状态聚合

条件判断和状态聚合也是计算属性的典型应用。当你需要根据多个条件组合来决定某个状态时，计算属性可以将复杂的逻辑从模板中提取出来：

```html
<template>
  <form @submit.prevent="handleSubmit">
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

  function handleSubmit() {
    // 处理表单提交逻辑
  }
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-01-13-21-14.png)

如果提交的信息不满足规范，那么提交按钮不可用。

### 3.4. 小结

计算属性的使用场景几乎无处不在，上述举的几个场景示例是我们在开发中经常会遇到的用法，只要你需要根据响应式数据派生出新的值，并且希望这个值能够在响应式数据变化时自动更新，那么计算属性就是你的首选工具。它让你的模板保持简洁，同时提供了强大的声明式数据处理能力。

## 4. 🤔 计算属性的缓存和方法调用有什么区别？

计算属性和方法都可以用来根据已有数据计算新的值，但它们的工作机制有本质的区别。理解这个区别对于做出正确的选择和编写高性能的 Vue 应用至关重要。

### 4.1. 缓存差异

计算属性最显著的特点是缓存。计算属性的值会被缓存起来，只有当它所依赖的响应式数据发生变化时，才会重新计算。如果依赖没有变化，多次访问计算属性会直接返回之前缓存的结果，而不会重复执行计算逻辑：

```html
<template>
  <h3>即使模板中多次引用，计算属性也只会计算一次</h3>
  <p>{{ expensiveResult }}</p>
  <p>{{ expensiveResult }}</p>
  <p>{{ expensiveResult }}</p>

  <h3>如果是方法，每次引用都会重新执行</h3>
  <p>{{ getExpensiveResult() }}</p>
  <p>{{ getExpensiveResult() }}</p>
  <p>{{ getExpensiveResult() }}</p>

  <p>无关数据：{{ unrelatedData }}</p>
  <button @click="unrelatedData++">修改无关数据</button>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const items = ref([1, 2, 3, 4, 5])
  const unrelatedData = ref(0)

  let computedCallCount = 0
  let methodCallCount = 0

  // 计算属性：依赖 items，有缓存
  const expensiveResult = computed(() => {
    console.log(`计算属性执行了（第 ${++computedCallCount} 次）`)
    return items.value.reduce((sum, item) => sum + item, 0)
  })

  // 方法：每次渲染都执行，无缓存
  function getExpensiveResult() {
    console.log(`方法执行了（第 ${++methodCallCount} 次）`)
    return items.value.reduce((sum, item) => sum + item, 0)
  }
</script>
```

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-01-17-28-10.png)

在这个例子中，模板中引入了 `unrelatedData`，因此点击按钮修改它时会触发组件重新渲染。此时计算属性 `expensiveResult` 因为它的依赖 `items` 没有变化，会直接返回缓存值，getter 不会重新执行，控制台不会新增日志。而方法 `getExpensiveResult` 会被调用 3 次（模板中引用了 3 次），即使 reduce 的计算结果和上次一样，方法体依然会被完整执行，控制台会新增 3 条“方法执行了”的日志。

测试流程：页面首次渲染会打印 3 次“方法执行了”，随后点击两次“修改无关数据”按钮，会再次打印 `3 * 2` 次“方法执行了”，因此一共会在控制台输出 9 条“方法执行了”的日志。而计算属性“计算属性执行了”的日志只会输出 1 条，因为它的依赖 `items` 没有发生变化，计算属性的值被缓存了。

控制台输出结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-01-17-28-19.png)

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

### 4.2. 使用方法的场景

那么什么时候应该使用方法而不是计算属性呢？是不是因为 computed 有缓存，我们就应该用 computed 而放弃 method 呢？答案当然是否定的！方法有它的特定使用场景：

当你需要传递参数时，必须使用方法，因为计算属性不接受参数：

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

当你需要执行有副作用的操作（如修改 DOM、发起网络请求等）时，也应该使用方法或侦听器，而不是计算属性。计算属性应该是纯函数（相同的输入总是得到相同的输出，不会产生副作用）。

```html
<template>
  <p>{{ message }}</p>
  <button @click="fetchData">获取数据</button>
  <p v-if="loading">加载中...</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="item in data" :key="item.id">{{ item.name }}</li>
  </ul>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'

  const message = ref('Hello Vue')

  // ✅ 正确：计算属性是纯函数，只是派生数据
  const reversedMessage = computed(() =>
    message.value.split('').reverse().join(''),
  )

  // ❌ 错误示范：计算属性中不应有副作用
  // const badExample = computed(() => {
  //   fetch('/api/data') // 副作用！不应该在计算属性中做
  //   return message.value
  // })

  // ✅ 正确：有副作用的操作应该放在方法中
  const data = ref([])
  const loading = ref(false)
  const error = ref('')

  async function fetchData() {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch('/api/data')
      data.value = await res.json()
    } catch (e) {
      error.value = '数据获取失败'
    } finally {
      loading.value = false
    }
  }

  // ✅ 正确：使用侦听器处理副作用
  watch(message, (newVal) => {
    // 当 message 变化时，执行副作用操作
    console.log('message 发生了变化：', newVal)
    document.title = newVal // 修改 DOM
  })
</script>
```

> 这里对 `watch` 的使用只是一个简单的演示，关于 `watch` 的详细说明会在对应的侦听器相关笔记中详细讲解。

### 4.3. computed 和 method 的选择策略

- 选择 computed 还是 method 的原则是：如果一个派生值依赖于响应式数据、不需要参数、没有副作用，并且可能被多次使用，那就使用 computed
- 如果需要传参、有副作用，或者特意希望每次渲染都重新执行，那就使用 method

## 5. 🤔 计算属性的 setter 和 getter 是什么？

计算属性默认只有 getter，表示你只能读取它的值。但在某些场景下，你可能需要“反向设置”计算属性的值，此时就需要为计算属性提供一个 setter。当你对计算属性赋值时，setter 会被调用，通常在 setter 中我们会去修改该计算属性所依赖的底层源数据。

### 5.1. 给计算属性添加 setter

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
      console.count('getter')
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

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-01-19-36-46.png)

在上面的例子中，当用户在输入框中修改 fullName 时（因为 v-model 会对 fullName 进行赋值），setter 会被调用并更新 lastName 和 firstName。这两个源数据的变化又会触发 getter 重新计算，形成一个完整的数据流闭环。

控制台输出：

```
getter: 1
getter: 2
getter: 3
getter: 4
```

解释：

- `getter: 1` 组件首次挂载时输出
- `getter: 2`、`getter: 3`、`getter: 4` 是在输入数字 1、2、3 时分别打印的，每次输入框的内容发生变化时，都会导致 fullName 的 setter 被调用，setter 中修改了 lastName 和 firstName，触发 fullName 的 getter 重新计算，因此每次输入都会打印一次 getter 的日志

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

### 5.2. 应用场景：华氏度、摄氏度的单位转换（双向绑定）

关于 setter 的另一个常见的使用场景是单位转换。假设你有一个以摄氏度存储的温度值，但需要同时支持华氏度的读取和设置：

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

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-01-19-41-35.png)

两个温度输入框通过计算属性的 getter 和 setter 实现了双向绑定，用户修改任意一个输入框都会自动更新另一个输入框的值。

- 如果改动摄氏度 celsius，由于华氏度 fahrenheit 依赖于 celsius 的值，fahrenheit 的 getter 会被触发，计算出新的华氏度值并更新输入框
- 如果改动华氏度 fahrenheit，由于它有 setter，setter 会被调用，setter 中会更新摄氏度 celsius 的值，进而触发 fahrenheit 的 getter 重新计算，更新华氏度输入框的值

### 5.3. 应用场景：配合 v-model 使用（双向绑定）

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

### 5.4. 获取计算属性上一次的值（Vue 3.4+）

从 Vue 3.4 开始，计算属性的 getter 可以接收一个 `previous` 参数 => 它就是上一次 getter 返回的值。这个特性在需要“保留上一次有效值”的场景下非常有用。

典型场景：你有一个输入框，希望用户输入的值必须在合理范围内，如果超出范围就保留上一次的有效值，而不是清空或显示非法值。

在只读计算属性中使用：

```html
<template>
  <p>当前值：{{ count }}</p>
  <p>安全值：{{ safeCount }}</p>
  <button @click="count++">+1</button>
  <button @click="count--">-1</button>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const count = ref(5)

  // safeCount 只允许 1~10 之间的值
  // 如果 count 超出范围，safeCount 会保留上一次的有效值（即 previous）
  const safeCount = computed((previous) => {
    if (count.value >= 1 && count.value <= 10) {
      return count.value // ✅ 合法：直接返回 count
    }
    return previous // ❌ 非法：回退到上一次的有效值
  })
</script>
```

在这个例子中：

- 当 `count` 从 5 变到 6 --> `safeCount` 返回 6（合法，更新）
- 当 `count` 从 10 变到 11 --> `safeCount` 返回 10（非法，保留上次的 10）
- 当 `count` 从 1 变到 0 --> `safeCount` 返回 1（非法，保留上次的 1）

在可写计算属性中同样支持 `previous` 参数：

```html
<template>
  <p>源数据：{{ count }}</p>
  <label>输入一个 1~10 的数字：</label>
  <input v-model="safeCount" type="number" />
</template>

<script setup>
  import { ref, computed } from 'vue'

  const count = ref(5)

  const safeCount = computed({
    get(previous) {
      if (count.value >= 1 && count.value <= 10) {
        return count.value
      }
      return previous // 超出范围时保留上一次的有效显示值
    },
    set(newValue) {
      // 无论用户输入什么，都先写入源数据
      // getter 会自动判断合法性并决定是否真的更新
      count.value = Number(newValue)
    },
  })
</script>
```

#### 如何评价这一特性？

`previous` 参数是 Vue 3.4 新增的一个「巧妙但非必备」的特性。从 Vue 官方提供的示例来看，它的价值在于：当你需要严格保持上一次有效值（比如配合 `v-model` 做输入校验）时，可以少写一些样板代码。

但它的局限性同样明显：

1. 模糊了 computed 的职责边界。计算属性的 getter 本应是纯函数——拿数据、算结果、返回。引入 `previous` 后，getter 内部还需要判断新值合法性并决定用新还是用旧，这让 getter 不再「纯粹」。
2. 理解成本偏高。相比直接用方法处理，`previous` 的流转机制需要多绕一个弯。同样是做范围校验，下面这种写法的意图更加一目了然：

```js
function setSafeCount(newValue) {
  if (newValue >= 1 && newValue <= 10) {
    count.value = newValue
  }
  // 不合法就什么都不做，保留原值
}
```

总之，这是一个「知道就好，不一定要用」的特性，对大多数场景而言，用方法或侦听器来做范围校验，是更具普适性、更容易维护的实践。

## 6. 🤔 计算属性的最佳实践是？

### 6.1. Getter 不应有副作用

Getter 不应有副作用。计算属性的 getter 应该只做计算，不要在里面修改其他状态、发起异步请求或操作 DOM。计算属性的职责是根据已有数据派生新值，而不是触发其他行为。如果需要在数据变化时执行副作用操作（如网络请求、日志记录等），应该使用侦听器（watch）来处理。

### 6.2. 只读原则

- 若计算属性没有 setter 那么该计算属性就是只读的，不能被直接修改
- 若存在 setter，则 setter 应该只用于更新源数据（计算属性依赖的数据），并且不应该包含复杂的副作用逻辑

避免直接修改计算属性的值。从计算属性返回的值可以看作是一个“临时快照”，每当源状态发生变化时，就会创建一个新的快照。更改快照是没有意义的，因此计算属性的返回值应该被视为只读的，永远不应该被直接修改。如果需要“反向修改”，应该使用带有 setter 的计算属性，或者直接更新它所依赖的源数据。

### 6.3. 不要依赖计算属性对依赖变更的监听特性来触发副作用操作

计算属性虽然会监听依赖数据的变更，并在依赖数据变更之后重新计算，但是不应该依赖它的这种行为来触发副作用操作（如网络请求、日志记录等），正确的做法应该是使用侦听器（watch）来处理。

computed 和 watch 各有分工：

- computed 用于声明式地派生数据
- watch 用于响应数据变化并执行副作用

一个简单的判断方法：如果你在 watch 回调中只是在给另一个 ref 赋值，而没有做任何异步或副作用操作，那几乎可以肯定应该用 computed 来替代。

不过最核心的区分方式还是从语义层面触发来区分：

- 用 computed 来表达“这个值是由其他数据计算得来的”，强调的是数据之间的关系和依赖，适合“数据变了，需要产生新数据”的场景
- 用 watch 来表达“当这个数据发生变化时，我需要做一些事情”，强调的是事件和行为，适合“数据变了，需要做某件事（可以是副作用操作）”的场景

## 7. 🔗 引用

- [Vue.js 官方文档 - 计算属性][1]

[1]: https://cn.vuejs.org/guide/essentials/computed.html
