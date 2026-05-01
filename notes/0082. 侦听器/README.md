# [0082. 侦听器](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0082.%20%E4%BE%A6%E5%90%AC%E5%99%A8)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 watch 的基本用法是什么？](#3--watch-的基本用法是什么)
  - [3.1. 侦听数据源类型](#31-侦听数据源类型)
- [4. 🤔 深度监听（deep）和精确监听有什么区别？](#4--深度监听deep和精确监听有什么区别)
- [5. 🤔 即时回调（immediate）和一次性侦听（once）有什么用？](#5--即时回调immediate和一次性侦听once有什么用)
  - [5.1. immediate：创建时立即执行](#51-immediate创建时立即执行)
  - [5.2. once：只触发一次](#52-once只触发一次)
- [6. 🤔 watchEffect 和 watch 有什么区别？](#6--watcheffect-和-watch-有什么区别)
- [7. 🤔 侦听器回调的触发时机有哪些？](#7--侦听器回调的触发时机有哪些)
- [8. 🤔 如何停止侦听器？](#8--如何停止侦听器)
- [9. 🤔 如何清理侦听器的副作用？](#9--如何清理侦听器的副作用)
- [10. 🔗 引用](#10--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- watch 的基本用法与侦听数据源类型
- 深度监听与精确监听
- 即时回调与一次性侦听
- watchEffect 的使用
- 回调的触发时机（flush）
- 停止侦听器
- 副作用清理

## 2. 🫧 评价

- todo

## 3. 🤔 watch 的基本用法是什么？

侦听器（watch）用于在响应式数据变化时执行副作用操作，比如发起 API 请求、操作 DOM、将数据同步到本地存储等。与计算属性不同，watch 不需要返回值，它的作用是"当数据变化时，做某件事"。

watch 的基本用法是监听一个响应式数据源，在数据变化时执行回调：

```html
<script setup>
  import { ref, watch } from 'vue'

  const question = ref('')
  const answer = ref('')

  // 监听单个 ref，数据变化时执行异步操作
  watch(question, async (newQuestion, oldQuestion) => {
    if (newQuestion.includes('？') || newQuestion.includes('?')) {
      const res = await fetch('https://yesno.wtf/api')
      answer.value = (await res.json()).answer
    }
  })
</script>

<template>
  <p>{{ answer }}</p>
  <input v-model="question" placeholder="问一个 yes/no 问题" />
</template>
```

### 3.1. 侦听数据源类型

watch 的第一个参数可以是不同形式的"数据源"：

- 一个 ref（包括计算属性）
- 一个响应式对象
- 一个 getter 函数
- 多个数据源组成的数组

```html
<script setup>
  import { ref, reactive, watch } from 'vue'

  const x = ref(0)
  const y = ref(0)

  // 1. 监听单个 ref
  watch(x, (newX) => {
    console.log(`x 变为 ${newX}`)
  })

  // 2. 监听 getter 函数的返回值
  watch(
    () => x.value + y.value,
    (sum) => {
      console.log(`x + y = ${sum}`)
    },
  )

  // 3. 监听多个来源组成的数组
  watch([x, y], ([newX, newY], [oldX, oldY]) => {
    console.log(`x: ${oldX} -> ${newX}，y: ${oldY} -> ${newY}`)
  })

  // 4. 监听 reactive 对象
  const state = reactive({ count: 0 })
  watch(state, (newState) => {
    console.log('state 变化了')
  })

  // 5. 监听 reactive 对象的某个属性——必须使用 getter 函数
  // 错误：watch(state.count, ...) 因为传入的是 number 而不是响应式数据源
  // 正确写法：
  watch(
    () => state.count,
    (newCount) => {
      console.log('count 变为：', newCount)
    },
  )
</script>
```

::: tip 注意

不能直接侦听响应式对象的属性值，例如 `watch(obj.count, ...)` 是错误的，因为 `obj.count` 是一个普通 number 值。必须使用 getter 函数 `() => obj.count` 来返回该属性。

:::

## 4. 🤔 深度监听（deep）和精确监听有什么区别？

默认情况下，watch 只会在被监听的引用本身发生变化时触发。如果你需要监听对象内部任意层级属性的变化，需要使用深度监听。

直接给 watch 传入一个 reactive 对象，会隐式地创建深层侦听器——该回调在所有嵌套变更时都会被触发：

```js
const obj = reactive({ count: 0 })

watch(obj, (newValue, oldValue) => {
  // 在嵌套的属性变更时触发
  // 注意：newValue 和 oldValue 是同一个对象
})

obj.count++ // 触发回调
```

对于 ref 包装的对象，默认不会深度监听——修改内部属性不会触发回调，只有整体替换 `.value` 才会触发。需要设置 `deep: true` 来强制深度监听：

```html
<script setup>
  import { ref, watch } from 'vue'

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
</script>
```

如果使用 getter 函数返回响应式对象的某个属性，该 getter 返回的是同一个对象引用时，不会触发回调——只有返回不同的对象时才会触发。你也可以显式加上 `deep` 选项来强制深层监听：

```js
watch(
  () => state.someObject,
  (newValue, oldValue) => {
    // 仅当 state.someObject 被替换时触发
    // 加上 { deep: true } 后，内部属性变化也会触发
  },
  { deep: true },
)
```

::: tip 性能提示

深度监听需要遍历被监听对象的所有嵌套属性，对于大型数据结构开销很大。建议只在必要时使用，如果只关心某个具体属性，使用 getter 函数精确监听更高效。

:::

## 5. 🤔 即时回调（immediate）和一次性侦听（once）有什么用？

### 5.1. immediate：创建时立即执行

watch 默认是懒执行的——仅当数据源变化时才会执行回调。在某些场景中，我们希望在创建侦听器时立即执行一遍回调，例如初始化时请求数据，之后在状态变化时重新请求：

```html
<script setup>
  import { ref, watch } from 'vue'

  const userId = ref(1)
  const userData = ref(null)

  // 使用 immediate: true：初始时就获取一次数据
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

### 5.2. once：只触发一次

有时你希望侦听器的回调只在源变化时触发一次。Vue 3.4+ 支持 `once: true` 选项：

```html
<script setup>
  import { ref, watch } from 'vue'

  const data = ref(null)

  // once: true：当 data 变化时仅触发一次
  watch(
    data,
    (newValue) => {
      if (newValue) {
        initializeComponent(newValue)
      }
    },
    { once: true },
  )
</script>
```

## 6. 🤔 watchEffect 和 watch 有什么区别？

watchEffect 是 Vue 3 引入的 API，它的特点是自动追踪回调函数中使用到的所有响应式依赖，不需要显式指定监听的数据源。

```html
<script setup>
  import { ref, watch, watchEffect } from 'vue'

  const todoId = ref(1)
  const data = ref(null)

  // watch 的写法：需要手动指定数据源
  watch(
    todoId,
    async () => {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${todoId.value}`,
      )
      data.value = await response.json()
    },
    { immediate: true },
  )

  // watchEffect 的写法：自动追踪 todoId.value
  // 会立即执行一次，不需要 immediate: true
  watchEffect(async () => {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${todoId.value}`,
    )
    data.value = await response.json()
  })
</script>
```

watch 和 watchEffect 的主要区别：

| 特性     | watch                            | watchEffect                    |
| -------- | -------------------------------- | ------------------------------ |
| 依赖追踪 | 明确指定的数据源                 | 自动追踪回调中访问的响应式数据 |
| 初始执行 | 默认不执行，需 `immediate: true` | 自动立即执行一次               |
| 新/旧值  | 可获取 `newValue` 和 `oldValue`  | 没有新/旧值参数                |
| 适用场景 | 需要旧值、精确控制数据源         | 依赖简单、需要自动追踪         |

watchEffect 的注意事项：它仅会在同步执行期间追踪依赖。在使用异步回调时，只有在第一个 `await` 正常工作前访问到的属性才会被追踪：

```js
watchEffect(async () => {
  // ✅ 同步部分：会被追踪
  const id = todoId.value

  const response = await fetch(`/api/todos/${id}`)

  // ❌ await 之后：不会被追踪
  const result = await response.json()
  data.value = result
})
```

## 7. 🤔 侦听器回调的触发时机有哪些？

当你更改了响应式状态，它可能会同时触发 Vue 组件更新和侦听器回调。侦听器回调也会被批量处理以避免重复调用。

默认情况下，侦听器回调在 DOM 更新之前执行。如果你需要在回调中访问更新后的 DOM，需要使用 `flush: 'post'` 选项：

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

三种触发时机：

| flush 值 | 别名 | 执行时机 | 适用场景 |
| --- | --- | --- | --- |
| `'pre'`（默认） | — | DOM 更新之前 | 大多数场景 |
| `'post'` | `watchPostEffect` | DOM 更新之后 | 需要访问更新后的 DOM |
| `'sync'` | `watchSyncEffect` | 数据变化时同步触发 | 简单布尔值监听，不推荐用于数组 |

同步侦听器（`flush: 'sync'`）不会进行批处理，每当检测到响应式数据发生变化时就会触发。应避免在可能多次同步修改的数据源（如数组）上使用，以防性能问题。

## 8. 🤔 如何停止侦听器？

在 `setup()` 或 `<script setup>` 中用同步语句创建的侦听器，会自动绑定到宿主组件实例上，并在宿主组件卸载时自动停止。因此大多数情况下无需手动停止。

watch 和 watchEffect 都返回一个停止函数，可以手动停止侦听器：

```js
const stopWatch = watch(source, callback)

// 当该侦听器不再需要时
stopWatch()
```

需要手动停止的典型场景是在异步回调中创建侦听器——这种侦听器不会自动绑定到组件实例，如果不手动停止可能导致内存泄漏：

```html
<script setup>
  import { watchEffect } from 'vue'

  // ✅ 同步创建：会自动停止
  watchEffect(() => {})

  // ❌ 异步创建：不会自动绑定到组件，需要手动停止
  setTimeout(() => {
    const stop = watchEffect(() => {})
    // ...
    stop()
  }, 100)
</script>
```

注意，需要异步创建侦听器的情况很少，应尽可能选择同步创建。如果需要等待异步数据，可以在侦听器内部使用条件逻辑：

```js
const data = ref(null)

watchEffect(() => {
  if (data.value) {
    // 数据加载后执行某些操作
  }
})
```

## 9. 🤔 如何清理侦听器的副作用？

在侦听器中执行异步请求时，可能会出现"竞态问题"——当数据源在请求完成前就再次变化，上一个请求的结果会覆盖新请求的结果。此时需要清理过时的副作用。

Vue 3.5+ 提供了 `onWatcherCleanup` API 来注册清理函数，当侦听器失效并准备重新运行时会被调用：

```js
import { watch, onWatcherCleanup } from 'vue'

watch(id, (newId) => {
  const controller = new AbortController()

  fetch(`/api/${newId}`, { signal: controller.signal }).then(() => {
    // 回调逻辑
  })

  onWatcherCleanup(() => {
    // 终止过期请求
    controller.abort()
  })
})
```

::: tip 注意

`onWatcherCleanup` 必须在 `watchEffect` 效果函数或 `watch` 回调函数的**同步执行期间**调用，不能在 `await` 之后调用。

:::

在 Vue 3.5 之前或作为替代方案，`onCleanup` 函数作为第三个参数传递给侦听器回调（或作为 `watchEffect` 作用函数的第一个参数）：

```js
watch(id, (newId, oldId, onCleanup) => {
  const controller = new AbortController()

  fetch(`/api/${newId}`, { signal: controller.signal }).then(() => {
    // 回调逻辑
  })

  onCleanup(() => {
    controller.abort()
  })
})

watchEffect((onCleanup) => {
  // ...
  onCleanup(() => {
    // 清理逻辑
  })
})
```

## 10. 🔗 引用

- [Vue.js 官方文档 - 侦听器][1]

[1]: https://cn.vuejs.org/guide/essentials/watchers.html
