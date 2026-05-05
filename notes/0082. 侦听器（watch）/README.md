# [0082. 侦听器（watch）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0082.%20%E4%BE%A6%E5%90%AC%E5%99%A8%EF%BC%88watch%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 watch 的基本用法是什么？](#3--watch-的基本用法是什么)
  - [3.1. watch 的基本用法](#31-watch-的基本用法)
  - [3.2. 侦听数据源类型](#32-侦听数据源类型)
- [4. 🤔 如何使用 watch 侦听不同的数据源类型？](#4--如何使用-watch-侦听不同的数据源类型)
  - [4.1. 监听单个 ref](#41-监听单个-ref)
  - [4.2. 监听 getter 函数的返回值](#42-监听-getter-函数的返回值)
  - [4.3. 监听多个来源组成的数组](#43-监听多个来源组成的数组)
  - [4.4. 监听 reactive 对象](#44-监听-reactive-对象)
- [5. 🤔 深度监听（deep）和精确监听有什么区别？](#5--深度监听deep和精确监听有什么区别)
- [6. 🤔 即时回调（immediate）和一次性侦听（once）有什么用？](#6--即时回调immediate和一次性侦听once有什么用)
  - [6.1. immediate：创建时立即执行](#61-immediate创建时立即执行)
  - [6.2. once：只触发一次](#62-once只触发一次)
- [7. 🤔 watchEffect 和 watch 有什么区别？](#7--watcheffect-和-watch-有什么区别)
- [8. 🤔 侦听器回调的触发时机有哪些？](#8--侦听器回调的触发时机有哪些)
- [9. 🤔 如何停止侦听器？](#9--如何停止侦听器)
- [10. 🤔 如何清理侦听器的副作用？](#10--如何清理侦听器的副作用)
- [11. 🤔 watch 和 computed 有什么区别？](#11--watch-和-computed-有什么区别)
- [12. 🤔 选项式 API 中如何使用侦听器？](#12--选项式-api-中如何使用侦听器)
- [13. 🤔 为什么 `watch(state.count, ...)` 写法是错误的，必须包裹为 getter 函数才能正常监听？【深入理解 `watch` 的工作原理】](#13--为什么-watchstatecount--写法是错误的必须包裹为-getter-函数才能正常监听深入理解-watch-的工作原理)
  - [13.1. 核心原因：JS 先求值，watch 后运行](#131-核心原因js-先求值watch-后运行)
  - [13.2. 对比 getter 函数](#132-对比-getter-函数)
  - [13.3. 形象化的类比](#133-形象化的类比)
  - [13.4. 进一步追问：为什么 ref 不需要 getter？](#134-进一步追问为什么-ref-不需要-getter)
  - [13.5. 简化版的依赖收集核心源码](#135-简化版的依赖收集核心源码)
- [14. 🔗 引用](#14--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- watch 的基本用法与侦听数据源类型
- watch 和 computed 的区别
- 深度监听与精确监听
- 即时回调与一次性侦听
- watchEffect 的使用
- 回调的触发时机（flush）
- 停止侦听器
- 副作用清理
- 选项式 API 中的侦听器

## 2. 🫧 评价

侦听器是 Vue 中相当核心且常用的特性，以下是对各知识点的实际使用频率评估：

- `watch` 的基本用法是日常开发必须掌握的，尤其是监听 `ref` 和使用 getter 函数监听对象属性这两种模式最为常见
- `immediate: true` 在需要初始化就加载数据的场景下非常常用，例如根据 ID 请求详情页数据
- `deep: true` 在监听对象时经常用到，但要注意大型对象的性能开销，尽量结合 getter 函数精确监听具体属性
- `watchEffect` 适合依赖简单、自动追踪的场景；但在异步回调中依赖追踪容易出问题，建议优先使用明确指定数据源的 `watch`
- 副作用清理（`onWatcherCleanup` / `onCleanup`）在涉及异步请求竞态的场景中很重要，值得掌握
- `flush: 'post'` 只在需要操作更新后 DOM 的特殊场景才用，日常很少见
- `flush: 'sync'` 几乎没有使用场景，避免使用
- `once: true` 使用场景较少，了解即可
- 选项式 API 的 `watch` 在 Vue 3 新项目中基本不再使用，但维护旧代码时会遇到，稍作了解即可

## 3. 🤔 watch 的基本用法是什么？

侦听器（watch）用于在响应式数据变化时执行副作用操作，比如发起 API 请求、操作 DOM、将数据同步到本地存储等。与计算属性不同，watch 不需要返回值，它的作用是「当数据变化时，做某件事」。

### 3.1. watch 的基本用法

watch 的基本用法是监听一个响应式数据源，在数据变化时执行回调：

```html
<script setup>
  import { ref, watch } from 'vue'

  const question = ref('')
  const answer = ref('')

  // 监听单个 ref -> newQuestion
  // 数据变化时执行异步操作 -> 访问 https://yesno.wtf/api 获取答案
  watch(question, async (newQuestion) => {
    // 当问题内容中出现问号时才触发请求
    if (newQuestion.includes('？') || newQuestion.includes('?')) {
      const res = await fetch('https://yesno.wtf/api')
      answer.value = (await res.json()).answer
    }
  })
  // 提示：
  // https://yesno.wtf/api 是一个简单的 API，每次请求都会随机返回 yes 或 no
  // 它是免费的，无需注册，直接访问即可获取 JSON 格式的响应
  // 这里使用这个免费 API 来做一个简单的问答示例，展示 watch 的基本用法
</script>

<template>
  <p>answer：{{ answer }}</p>
  <input v-model="question" placeholder="问一个 yes/no 问题" />
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-21-31-22.png)

### 3.2. 侦听数据源类型

watch 的第一个参数可以是不同形式的「数据源」：

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

  // 注意：监听 reactive 对象的某个属性——必须使用 getter 函数
  // 不能直接侦听响应式对象的属性值
  // ❌ 错误写法：watch(state.count, ...) 因为 state.count 是一个普通的 number 值而不是响应式数据源
  // 本质原因是 state.count 的求值时机早于 watch 内部注册副作用的时机
  // ✅ 正确写法：必须使用 getter 函数 () => state.count 来返回该属性
  watch(
    () => state.count,
    (newCount) => {
      console.log('count 变为：', newCount)
    },
  )
</script>
```

## 4. 🤔 如何使用 watch 侦听不同的数据源类型？

### 4.1. 监听单个 ref

```html
<script setup>
  import { ref, watch } from 'vue'

  const count = ref(0)

  watch(count, (newVal, oldVal) => {
    console.log(`count: ${oldVal} -> ${newVal}`)
  })
</script>

<template>
  <p>count: {{ count }}</p>
  <button @click="count++">+1</button>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-07-58-10.png)

+1 按钮点击 3 次后，控制台输出如下：

```
count: 0 -> 1
count: 1 -> 2
count: 2 -> 3
```

每次点击 +1 按钮，控制台都会输出变化之前的值和变化之后的值，说明 watch 成功监听到了 count 的变化。

### 4.2. 监听 getter 函数的返回值

getter 函数适合监听 reactive 对象的某个属性，或者对多个 ref 做运算后的结果：

```html
<script setup>
  import { ref, reactive, watch } from 'vue'

  const obj = reactive({ count: 0 })

  // 监听 reactive 对象的某个属性
  watch(
    () => obj.count,
    (newVal, oldVal) => {
      console.log(`obj.count: ${oldVal} -> ${newVal}`)
    },
  )

  const x = ref(1)
  const y = ref(2)

  // 监听对多个 ref 运算后的结果
  watch(
    () => x.value + y.value,
    (newSum, oldSum) => {
      console.log(`x + y: ${oldSum} -> ${newSum}`)
    },
  )
</script>

<template>
  <p>obj.count: {{ obj.count }}</p>
  <button @click="obj.count++">obj.count +1</button>

  <p>x: {{ x }}, y: {{ y }}, x + y: {{ x + y }}</p>
  <button @click="x++">x +1</button>
  <button @click="y++">y +1</button>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-08-00-02.png)

每个按钮点击 3 次，控制台输出结果如下：

```
obj.count: 0 -> 1
obj.count: 1 -> 2
obj.count: 2 -> 3
x + y: 3 -> 4
x + y: 4 -> 5
x + y: 5 -> 6
x + y: 6 -> 7
x + y: 7 -> 8
x + y: 8 -> 9
```

每次点击按钮，控制台都会输出 obj.count 或 x + y 的变化情况，说明 watch 成功监听到了 getter 函数返回值的变化。

::: tip 注意：监听 reactive 对象的特定属性必须使用 getter 函数

不能直接写 `watch(obj.count, ...)`，因为 `obj.count` 是一个普通 number 值，不是响应式数据源。必须用 getter 函数 `() => obj.count` 包裹。

:::

### 4.3. 监听多个来源组成的数组

```html
<script setup>
  import { ref, watch } from 'vue'

  const firstName = ref('张')
  const lastName = ref('三')

  watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
    console.log(
      `firstName: "${oldFirst}" -> "${newFirst}" - lastName: "${oldLast}" -> "${newLast}"`,
    )
  })
</script>

<template>
  <p>姓名: {{ firstName }}{{ lastName }}</p>
  <input v-model="firstName" placeholder="姓" />
  <input v-model="lastName" placeholder="名" />
</template>
```

::: swiper

![1](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-08-06-41.png)

![2](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-08-06-57.png)

:::

测试：

1. 初始状态
2. 将姓改为李，名改为四

控制台输出如下：

```
firstName: "张" -> "" - lastName: "三" -> "三"
firstName: "" -> "李" - lastName: "三" -> "三"
firstName: "李" -> "李" - lastName: "三" -> ""
firstName: "李" -> "李" - lastName: "" -> "四"
```

每次修改输入框内容，控制台都会输出 firstName 和 lastName 的变化情况，说明 watch 成功监听到了多个来源组成的数组的变化。

### 4.4. 监听 reactive 对象

```html
<script setup>
  import { reactive, watch } from 'vue'

  const state = reactive({ count: 0, name: '张三' })

  watch(state, (newState, oldState) => {
    // 注意：直接监听 reactive 对象时，newState 和 oldState 是同一个引用
    // 因为 Vue 不会为 reactive 对象的深度监听创建旧值副本
    console.log('state 变化了：', JSON.stringify(newState))
    console.log('newState == oldState', newState == oldState)
  })
</script>

<template>
  <p>count: {{ state.count }}, name: {{ state.name }}</p>
  <button @click="state.count++">count +1</button>
  <button @click="state.name = state.name === '张三' ? '李四' : '张三'">
    切换名字
  </button>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-08-12-03.png)

测试：

1. 点击一次 count +1 按钮
2. 点击一次切换名字按钮

控制台输出如下：

```
state 变化了： {"count":1,"name":"张三"}
newState == oldState true
state 变化了： {"count":1,"name":"李四"}
newState == oldState true
```

每次点击按钮，控制台都会输出 state 的变化情况，并且 newState 和 oldState 是同一个引用，说明直接监听 reactive 对象时，无法通过对比新旧值来判断哪些属性发生了变化。如果需要区分新旧值，可以使用 getter 函数监听具体属性。

## 5. 🤔 深度监听（deep）和精确监听有什么区别？

默认情况下，watch 只会在被监听的引用本身发生变化时触发。如果你需要监听对象内部任意层级属性的变化，需要使用深度监听。

直接给 watch 传入一个 reactive 对象，会隐式地创建深层侦听器——该回调在所有嵌套变更时都会被触发：

```js
const obj = reactive({ count: 0 })

watch(obj, (newValue, oldValue) => {
  // 在嵌套的属性变更时触发
  // 注意：这里的 newValue 和 oldValue 是同一个对象引用
  // 因为直接传入 reactive 对象时，Vue 不会为深度监听创建旧值副本
})

obj.count++ // 触发回调
```

但需要注意，「直接传入 reactive 对象」时 `newValue` 和 `oldValue` 才是同一个引用。如果使用 `ref` 包装的对象加 `deep: true`，Vue 会创建旧值的浅拷贝，此时 `oldValue` 和 `newValue` 是不同的对象引用：

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

## 6. 🤔 即时回调（immediate）和一次性侦听（once）有什么用？

### 6.1. immediate：创建时立即执行

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

### 6.2. once：只触发一次

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

## 7. 🤔 watchEffect 和 watch 有什么区别？

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

  // watchEffect 的写法：自动追踪 todoId.value，无需手动指定
  // 会立即执行一次，不需要 immediate: true
  watchEffect(() => {
    console.log('当前 todoId：', todoId.value)
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

::: warning watchEffect 与异步回调的注意事项

watchEffect 仅会在「同步执行期间」追踪依赖。如果使用 async 回调，只有在第一个 `await` 之前同步访问到的属性才会被追踪，`await` 之后的代码无法被追踪：

```js
watchEffect(async () => {
  // ✅ 同步部分：会被追踪
  const id = todoId.value

  const response = await fetch(`/api/todos/${id}`)

  // ❌ await 之后：不会再被追踪
  const result = await response.json()
  data.value = result
})
```

因此当回调中有异步操作时，使用 watch 并明确指定数据源是更稳妥的选择。

除此之外，async 函数返回的是一个 Promise 对象，而 watchEffect 期望的是 undefined，它不会等待这个 Promise 完成。如果 async 回调中抛出异常，该异常不会被 watchEffect 捕获，而是成为一个未处理的 Promise rejection：

```js
watchEffect(async () => {
  throw new Error('出错了') // ❌ 不会被 watchEffect 捕获，而是未处理的 Promise rejection
})
```

如果需要在 watchEffect 中处理异步操作，建议在同步部分追踪需要的数据源，然后在异步操作中处理结果：

```js
const id = ref(1)
const data = ref(null)

watchEffect(() => {
  const currentId = id.value // ✅ 同步执行，会被追踪
  // 使用 then 而非 await 来处理异步
  fetch(`/api/${currentId}`)
    .then((res) => res.json())
    .then((result) => {
      data.value = result
    })
})
```

:::

## 8. 🤔 侦听器回调的触发时机有哪些？

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

## 9. 🤔 如何停止侦听器？

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

## 10. 🤔 如何清理侦听器的副作用？

在侦听器中执行异步请求时，可能会出现「竞态问题」——当数据源在请求完成前就再次变化，上一个请求的结果会覆盖新请求的结果。此时需要清理过时的副作用。

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

`onWatcherCleanup` 必须在 `watchEffect` 效果函数或 `watch` 回调函数的「同步执行期间」调用，不能在 `await` 之后调用。

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

## 11. 🤔 watch 和 computed 有什么区别？

`computed`（计算属性）和 `watch`（侦听器）都能响应响应式数据的变化，但它们的设计目的完全不同：

- `computed` 用于「派生出一个新值」，它会根据依赖自动缓存结果，只有依赖发生变化时才重新计算。
- `watch` 用于「在数据变化时执行副作用」，它不需要返回值，更适合执行异步操作、修改 DOM、写入本地存储等有副作用的操作。

简单来说：需要基于现有数据计算出新数据时用 `computed`；需要在数据变化时「做某件事」时用 `watch`。

```html
<script setup>
  import { ref, computed, watch } from 'vue'

  const firstName = ref('张')
  const lastName = ref('三')

  // ✅ 用 computed 派生全名——有缓存，依赖不变就不重新计算
  const fullName = computed(() => `${firstName.value}${lastName.value}`)

  // ✅ 用 watch 在名字变化时记录日志——执行副作用
  watch([firstName, lastName], ([newFirst, newLast]) => {
    console.log(`姓名已更新为：${newFirst}${newLast}`)
  })
</script>
```

::: tip 如何选择？

- 需要「计算一个值」 → 用 `computed`
- 需要「响应变化执行某个操作」 → 用 `watch`
- `computed` 有缓存，性能更好；`watch` 更灵活，支持异步和副作用

:::

## 12. 🤔 选项式 API 中如何使用侦听器？

在选项式 API 中，通过组件的 `watch` 选项来定义侦听器。每个 key 对应要侦听的属性名，value 可以是一个回调函数，也可以是包含 `handler`、`immediate`、`deep` 等配置项的对象：

```js
export default {
  data() {
    return {
      question: '',
      userId: 1,
    }
  },
  watch: {
    // 基本写法：函数接收新值和旧值
    question(newQuestion, oldQuestion) {
      console.log('问题变了：', newQuestion)
    },

    // 完整写法：配置对象，支持 immediate 和 deep
    userId: {
      handler(newId, oldId) {
        console.log('用户 ID 变了：', newId)
      },
      immediate: true,
      deep: false,
    },
  },
}
```

::: tip

在 Vue 3 新项目中，推荐使用 `<script setup>` 搭配组合式 API 的 `watch` 函数，更灵活也更符合现代写法。选项式 API 的 `watch` 选项主要在维护旧代码时会遇到，稍作了解即可。

:::

## 13. 🤔 为什么 `watch(state.count, ...)` 写法是错误的，必须包裹为 getter 函数才能正常监听？【深入理解 `watch` 的工作原理】

::: tip 先从宏观层面来思考这个问题？

- 写法 1：`watch(state.count, callback)` 错误，state.count 变化不会触发 callback 执行
- 写法 2：`watch(() => state.count, callback)` 正确，state.count 变化会触发 callback 执行

watch 能够实现对数据变化的监听，本质上需要将「数据源」和「回调函数」建立联系。至于 Vue 内部是如何实现这个联系的，我们需要深入理解 watch 的工作原理才能了解。

1 不行，2 可以从宏观层面来看待这个问题，你会发现本质上就是 1 的写法导致 Vue 无法为写法 1 建立「数据源」和「回调函数」的联系，而 2 可以正常建立联系。

有个这个大方向的引导，下一步就是进一步分析为什么写法 1 无法建立联系，写法 2 可以建立联系了。

:::

这涉及到 `watch` 的工作原理和 JavaScript 的求值时机。

### 13.1. 核心原因：JS 先求值，watch 后运行

```js
watch(state.count, callback)
```

JavaScript 在调用 `watch` 之前，会先对参数 `state.count` 求值。此时 `state` 是 reactive 代理，访问 `.count` 触发了代理的 getter，返回的是当前的原始值，比如 `0`。

所以 `watch` 实际收到的是：

```js
watch(0, callback) // 传入了一个普通数字
```

一个普通的数字 `0` 没有响应式能力，Vue 无法追踪它的变化。

### 13.2. 对比 getter 函数

```js
watch(() => state.count, callback)
```

这里传入的是一个函数本身，JavaScript 不会提前执行它。Vue 在内部会：

1. 调用这个 getter 函数
2. 函数执行时访问了 `state.count`，触发了 reactive 代理的 getter
3. Vue 的依赖收集系统记录下：「这个侦听器依赖 `state.count`」
4. 之后 `state.count` 变化时，Vue 知道要通知这个侦听器

### 13.3. 形象化的类比

```js
// ❌ 拍了一张照片（快照），递给 Vue
watch(state.count, callback)

// ✅ 递给 Vue 一台监控摄像头（持续观察）
watch(() => state.count, callback)
```

前者给的是一个冻结的值，后者给的是一个可以反复执行的观测过程。

### 13.4. 进一步追问：为什么 ref 不需要 getter？

```js
const count = ref(0)
watch(count, callback) // ✅ 直接传 ref 本身，不需要 getter
```

因为这里传入的是 ref 对象本身（不是 `count.value`），Vue 内部识别到它是一个 ref，就知道通过 `.value` 来追踪变化。而 `state.count` 在求值后丢失了「它来自哪里」的信息。

### 13.5. 简化版的依赖收集核心源码

如果写成 `state.count`，会导致 vue 无法记录到 `state.count` 的消费者，因为它拿到的只是一个普通值，无法追踪。虽然在首次访问 `state.count` 时会触发 getter，但 Vue 只能记录到这个访问发生了，而无法知道这个访问是哪个侦听器的依赖。

Vue 内部维护了一个全局变量（比如 activeEffect），记录「当前正在执行的副作用函数是谁」。当 `watch` 开始执行时，它会先设置 `activeEffect = callback`，然后执行 getter 函数来访问 `state.count`。这个时候，Vue 的 track 逻辑就能正确地将 activeEffect 记录为 `state.count` 的依赖。

用代码还原这个过程：

```js
// Vue 内部的 track 逻辑（简化）
function track(target, key) {
  if (!activeEffect) {
    return // ← 没有正在运行的副作用，直接跳过
  }
  // 将 activeEffect 记录为 target.key 的依赖
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = new Set()))
  dep.add(activeEffect) // ← 记录「谁」依赖了这个属性
}
```

两种写法的时序对比：

::: code-group

```[watch(state.count, callback)]
activeEffect = null          // 当前没有副作用在运行

// JS 引擎执行参数求值
state.count                  // 触发 getter → track() 被调用
                             // track 发现 activeEffect 是 null → 跳过收集
                             // 返回值 0

// watch 开始运行
activeEffect = callback      // 现在有消费者了，但已经晚了

// 结果：state.count 和 callback 之间没有建立任何关联
```

```[watch(() => state.count, callback)]
activeEffect = null          // 当前没有副作用在运行

// JS 引擎执行参数求值
() => state.count            // 只是拿到函数引用，没有执行，没有触发 getter

// watch 开始运行
activeEffect = callback      // 标记当前消费者

// Vue 内部调用 getter 函数
state.count                  // 触发 getter → track() 被调用
                             // track 发现 activeEffect = callback → ✅ 收集成功

// 结果：state.count 的变化会通知 callback
```

:::

## 14. 🔗 引用

- [Vue.js 官方文档 - 侦听器][1]

[1]: https://cn.vuejs.org/guide/essentials/watchers.html
