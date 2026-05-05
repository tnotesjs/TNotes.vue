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
  - [5.1. 默认行为：只监听引用变化（非深度监听）](#51-默认行为只监听引用变化非深度监听)
  - [5.2. `deep: true`：开启深度监听](#52-deep-true开启深度监听)
  - [5.3. reactive 对象：隐式深度监听](#53-reactive-对象隐式深度监听)
  - [5.4. getter 返回对象引用：默认非深度监听，内部属性变化不触发](#54-getter-返回对象引用默认非深度监听内部属性变化不触发)
- [6. 🤔 即时回调（immediate）和一次性侦听（once）有什么用？](#6--即时回调immediate和一次性侦听once有什么用)
  - [6.1. immediate：创建时立即执行](#61-immediate创建时立即执行)
  - [6.2. once：只触发一次](#62-once只触发一次)
- [7. 🤔 watchEffect 和 watch 有什么区别？](#7--watcheffect-和-watch-有什么区别)
  - [7.1. 基本对比](#71-基本对比)
  - [7.2. 核心区别](#72-核心区别)
  - [7.3. watchEffect 自动追踪多个依赖](#73-watcheffect-自动追踪多个依赖)
  - [7.4. watchEffect 的局限：异步回调中的依赖追踪](#74-watcheffect-的局限异步回调中的依赖追踪)
  - [7.5. 如何选择？](#75-如何选择)
- [8. 🤔 侦听器回调的触发时机有哪些？](#8--侦听器回调的触发时机有哪些)
  - [8.1. `flush: 'pre'`（默认）](#81-flush-pre默认)
  - [8.2. `flush: 'post'`：DOM 更新后执行](#82-flush-postdom-更新后执行)
  - [8.3. `flush: 'sync'`：同步触发](#83-flush-sync同步触发)
- [9. 🤔 如何停止侦听器？](#9--如何停止侦听器)
- [10. 🤔 如何清理侦听器的副作用？](#10--如何清理侦听器的副作用)
  - [10.1. 竞态问题是什么？](#101-竞态问题是什么)
  - [10.2. 使用 `onWatcherCleanup` 清理副作用（Vue 3.5+）](#102-使用-onwatchercleanup-清理副作用vue-35)
  - [10.3. 使用 `onCleanup` 参数（Vue 3.5 之前）](#103-使用-oncleanup-参数vue-35-之前)
- [11. 🤔 watch 和 computed 有什么区别？](#11--watch-和-computed-有什么区别)
- [12. 🤔 选项式 API 中如何使用侦听器？](#12--选项式-api-中如何使用侦听器)
- [13. 🤔 为什么 `watch(state.count, ...)` 写法是错误的，必须包裹为 getter 函数才能正常监听？【深入理解 watch 的工作原理】](#13--为什么-watchstatecount--写法是错误的必须包裹为-getter-函数才能正常监听深入理解-watch-的工作原理)
  - [13.1. 核心原因：JS 先求值，watch 后运行](#131-核心原因js-先求值watch-后运行)
  - [13.2. 对比 getter 函数](#132-对比-getter-函数)
  - [13.3. 形象化的类比](#133-形象化的类比)
  - [13.4. 为什么 ref 不需要 getter？](#134-为什么-ref-不需要-getter)
  - [13.5. 简化版的依赖收集核心源码](#135-简化版的依赖收集核心源码)
- [14. 🤔 watchEffect 是如何自动收集依赖的？【深入理解 watchEffect 的工作原理】](#14--watcheffect-是如何自动收集依赖的深入理解-watcheffect-的工作原理)
  - [14.1. Vue 内部的简化实现逻辑](#141-vue-内部的简化实现逻辑)
  - [14.2. 一个具体例子](#142-一个具体例子)
  - [14.3. 为什么 async 回调中 await 之后的依赖收集不到？](#143-为什么-async-回调中-await-之后的依赖收集不到)
  - [14.4. 为什么 watchEffect 默认就会立刻执行一次呢？](#144-为什么-watcheffect-默认就会立刻执行一次呢)
  - [14.5. 一句话总结](#145-一句话总结)
- [15. 🔗 引用](#15--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `watch` 的基本用法与侦听数据源类型
- `watch` 的默认批处理机制
- 关闭 `watch` 默认的批处理机制 `flush: 'sync'`
- 深度监听与精确监听
- 即时回调 `immediate` 与一次性侦听 `once`
- `watchEffect` 的使用
- `watch` 和 `watchEffect` 的区别
- `watch` 回调的触发时机控制 `flush: 'pre' | 'post' | 'sync'`
- 通过 `watch` 的返回函数停止侦听器
- 副作用清理
- 选项式 API 中的侦听器
- `watch` 和 `computed` 的区别

## 2. 🫧 评价

本节的内容较多，这里对一些相关知识点做一个总体评价：

- `watch` 的基本用法是日常开发必须掌握的，尤其是监听 `ref` 和使用 getter 函数监听对象属性这两种模式最为常见
- `immediate: true` 在需要初始化就加载数据的场景下非常常用，例如根据 ID 请求详情页数据
- `once: true` 在某些特殊场景下（比如只需要第一次变化时触发一次副作用）会非常方便
- `deep: true` 在监听对象时经常用到，但要注意大型对象的性能开销，尽量结合 getter 函数精确监听具体属性
- `watchEffect` 适合依赖简单、自动追踪的场景；但在异步回调中依赖追踪容易出问题，建议优先使用明确指定数据源的 `watch`
- 副作用清理（`onWatcherCleanup` / `onCleanup`）在涉及异步请求竞态的场景中很重要，使用频率不是很高，如果熟悉原生 JS 中的 `AbortController` 等机制，理解起来会更容易，也可以考虑手写 `AbortController` 来清理副作用请求
- `flush: 'post'` 只在需要操作更新后 DOM 的特殊场景才用，日常很少见
- `flush: 'sync'` 几乎没有使用场景，应尽可能避免使用
- 选项式 API 的 watch 在 Vue 3 新项目中基本不再使用，但维护旧代码时会遇到，稍作了解即可

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

  // 注意：监听 reactive 对象的某个属性 => 必须使用 getter 函数
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

这里要注意，当你把输入框内容清空时，`v-model` 会把对应的值更新为空字符串 `''`，所以控制台里会先出现 `firstName: "张" -> ""` 这类日志。这不是多触发了一次，而是「清空输入框」本身就是一次有效的数据变化。

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

默认情况下，watch 只在被监听的引用本身发生变化时触发回调。如果对象内部属性被修改，但引用没有变，watch 感知不到。深度监听（`deep: true`）则会递归遍历对象的所有嵌套属性，任何层级的变化都会触发回调。

### 5.1. 默认行为：只监听引用变化（非深度监听）

用 `ref` 包装一个对象时，对象内部依然会被 Vue 转成响应式对象；但默认的 `watch(user, ...)` 只比较 `user.value` 这个外层引用有没有变化。所以修改内部属性不会触发当前侦听器，只有整体替换 `xxx.value` 才会触发：

```html
<script setup>
  import { ref, watch } from 'vue'

  const user = ref({ name: '张三', age: 25 })

  watch(user, (newVal) => {
    console.log('触发了 watch：', JSON.stringify(newVal))
  })
</script>

<template>
  <p>{{ user.name }} - {{ user.age }}</p>
  <!-- ❌ 修改内部属性：不会触发 watch -->
  <button @click="user.age++">age +1</button>
  <!-- ✅ 整体替换：会触发 watch -->
  <button @click="user = { name: '李四', age: 30 }">整体替换</button>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-10-54-45.png)

点击「age + 1」按钮时，控制台没有任何输出。这里不是因为 `user.value.age` 不是响应式的，而是因为这个 `watch(user, ...)` 默认只关心 `user.value` 这个外层引用有没有变。点击「age + 1」时，变化的是对象内部属性，外层引用没变；只有点击「整体替换」按钮，让 `user.value` 指向一个全新的对象引用时，当前 watch 才会触发，控制台会输出以下内容：

```
触发了 watch： {"name":"李四","age":30}
```

### 5.2. `deep: true`：开启深度监听

加上 `deep: true` 后，对象内部任意属性的变化都会触发回调：

```html
<script setup>
  import { ref, watch } from 'vue'

  const user = ref({ name: '张三', age: 25 })

  watch(
    user,
    (newVal) => {
      console.log('触发了 watch：', JSON.stringify(newVal))
    },
    { deep: true },
  )
</script>

<template>
  <p>{{ user.name }} - {{ user.age }}</p>
  <!-- ✅ 现在修改内部属性也会触发 watch -->
  <button @click="user.age++">age +1</button>
  <button @click="user.name = '李四'">改名</button>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-10-58-22.png)

依次点击「age +1」和「改名」按钮：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-10-57-28.png)

```
触发了 watch： {"name":"张三","age":26}
触发了 watch： {"name":"李四","age":26}
```

::: tip 性能提示

深度监听需要递归遍历对象的所有嵌套属性，对于大型数据结构开销较大。如果只关心某个具体属性，优先使用 getter 函数精确监听，避免不必要的性能消耗：

```js
// ❌ 深度监听整个对象
watch(user, callback, { deep: true })

// ✅ 只监听关心的属性
watch(() => user.value.age, callback)
```

:::

### 5.3. reactive 对象：隐式深度监听

直接传入 reactive 对象时，Vue 会隐式创建深度侦听器，不需要手动加 `deep: true`：

```html
<script setup>
  import { reactive, watch } from 'vue'

  const state = reactive({ count: 0, name: '张三' })

  watch(state, (newVal, oldVal) => {
    // 注意：newVal 和 oldVal 是同一个对象引用
    // Vue 不会为 reactive 对象的深度监听创建旧值副本
    console.log('newVal === oldVal：', newVal === oldVal)
    console.log('state 变化了：', JSON.stringify(newVal))
  })
</script>

<template>
  <p>{{ state.name }} - {{ state.count }}</p>
  <button @click="state.count++">count +1</button>
  <button @click="state.name = state.name === '张三' ? '李四' : '张三'">
    切换名字
  </button>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-11-01-19.png)

依次点击「count +1」和「切换名字」按钮：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-11-01-31.png)

```
newVal === oldVal： true
state 变化了： {"count":1,"name":"张三"}
newVal === oldVal： true
state 变化了： {"count":1,"name":"李四"}
```

两个按钮点击后，每次都会触发回调，且 `newVal === oldVal` 始终为 `true`。这意味着在 reactive 对象的深度监听中，无法通过对比新旧值来判断哪些属性发生了变化。如果需要区分新旧值，应该用 getter 函数精确监听具体属性：

```js
// ✅ 精确监听，可以拿到新旧值
watch(
  () => state.count,
  (newCount, oldCount) => {
    console.log(`count: ${oldCount} -> ${newCount}`)
  },
)
```

### 5.4. getter 返回对象引用：默认非深度监听，内部属性变化不触发

当 getter 函数返回的是同一个对象引用时，即使对象内部属性发生了变化，watch 也不会触发 => 因为 getter 的返回值（引用）没有变：

```html
<script setup>
  import { reactive, watch } from 'vue'

  const state = reactive({
    count: 0,
    info: { city: '北京', district: '海淀区' },
  })

  // getter 返回 state.info 这个对象引用
  // 默认只比较引用是否变化，引用没变就不触发
  watch(
    () => state.info,
    (newVal, oldVal) => {
      console.log('触发了 watch：', JSON.stringify(newVal))
    },
  )

  // 加上 deep: true 后，整体被替换或者内部属性变化都会触发
  watch(
    () => state.info,
    (newVal, oldVal) => {
      console.log('触发了 deep watch：', JSON.stringify(newVal))
    },
    { deep: true },
  )
</script>

<template>
  <p>city: {{ state.info.city }}, district: {{ state.info.district }}</p>
  <!-- ❌ 修改内部属性：不会触发第一个 watch，会触发第二个 -->
  <button @click="state.info.district = '朝阳区'">改区</button>
  <!-- ✅ 整体替换引用：两个 watch 都会触发 -->
  <button @click="state.info = { city: '上海', district: '浦东新区' }">
    整体替换
  </button>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-11-08-17.png)

点击「改区」按钮：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-11-08-32.png)

此时，只有第二个 watch（带 `deep: true`）会触发：

```
触发了 deep watch： {"city":"北京","district":"朝阳区"}
```

点击「整体替换」按钮：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-11-08-53.png)

此时，两个 watch 都会触发，因为 getter 的返回值变成了一个全新的对象引用：

```
触发了 watch： {"city":"上海","district":"浦东新区"}
触发了 deep watch： {"city":"上海","district":"浦东新区"}
```

综上，如果确实需要监听 getter 返回对象的内部变化，显式加上 `deep: true` 即可：

```js
watch(
  () => state.info,
  (newVal, oldVal) => {
    // 内部属性变化也会触发
  },
  { deep: true },
)
```

## 6. 🤔 即时回调（immediate）和一次性侦听（once）有什么用？

### 6.1. immediate：创建时立即执行

watch 默认是「懒执行」的 => 只有当数据源发生变化时才执行回调，创建时不会执行。在某些场景下，我们希望创建侦听器时就立即执行一遍回调，例如组件初始化时就根据当前值请求数据，之后在值变化时重新请求。

不加 `immediate` 时，回调只在数据变化后才触发：

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

组件挂载后控制台没有任何输出，只有点击按钮后才会打印日志：

```
count: 0 -> 1
count: 1 -> 2
...
```

加上 `immediate: true` 后，组件创建时就会立即执行一次回调，此时 `newVal` 是当前值，`oldVal` 是 `undefined`：

```html
<script setup>
  import { ref, watch } from 'vue'

  const count = ref(0)

  watch(
    count,
    (newVal, oldVal) => {
      console.log(`count: ${oldVal} -> ${newVal}`)
    },
    { immediate: true },
  )
</script>

<template>
  <p>count: {{ count }}</p>
  <button @click="count++">+1</button>
</template>
```

组件挂载后控制台立即输出：

```
count: undefined -> 0
```

之后每次点击按钮依旧会正常监听：

```
count: 0 -> 1
count: 1 -> 2
...
```

`immediate: true` 的典型应用场景是页面初始化时就加载数据：

```html
<script setup>
  import { ref, watch } from 'vue'

  const userId = ref(1)
  const userData = ref(null)

  function getUserById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, name: `用户${id}` })
      }, 800)
    })
  }

  // 组件创建时就请求一次，之后 userId 变化时重新请求
  watch(
    userId,
    async (newId) => {
      userData.value = null
      try {
        userData.value = await getUserById(newId)
      } catch (error) {
        console.error('获取用户数据失败：', error)
      }
    },
    { immediate: true },
  )
</script>
```

### 6.2. once：只触发一次

有时你只关心「数据的第一次变化」，之后的变化不再需要处理。Vue 3.4+ 支持 `once: true` 选项，让回调只触发一次：

```html
<script setup>
  import { ref, watch } from 'vue'

  const ready = ref(false)

  watch(
    ready,
    (newVal) => {
      console.log(`ready 变为 ${newVal}`)
    },
    { once: true },
  )
</script>

<template>
  <p>ready: {{ ready }}</p>
  <button @click="ready = !ready">切换</button>
</template>
```

多次点击「切换」按钮，控制台只会打印第一次变化的日志：

```
ready 变为 true
```

在 Vue 3.4+ 支持 `once: true` 选项之前，如果需要实现「只触发一次」的效果，通常需要在回调内部手动调用 `stop()` 来停止侦听器：

```js
const stop = watch(ready, (newVal) => {
  console.log(`ready 变为 ${newVal}`)
  stop() // 触发一次后立即停止侦听器
})
```

`once` 可以和 `immediate` 组合使用，表示「立即执行一次，且只执行这一次」：

```js
watch(
  source,
  (newVal, oldVal) => {
    // 创建时立即执行，之后 source 再变化也不会触发
    console.log(oldVal) // undefined
    initialize(newVal)
  },
  { immediate: true, once: true },
)
```

这里要注意，「立即执行的这一次」里 `oldVal` 会是 `undefined`。并且由于 `once` 会在这次执行后立刻停止侦听，所以后面也不会再有一次带着正常旧值的回调来“修正”它。

## 7. 🤔 watchEffect 和 watch 有什么区别？

watchEffect 是 Vue 3 引入的 API，它的特点是「自动追踪」回调函数中访问到的所有响应式依赖，不需要像 watch 那样显式指定数据源。

### 7.1. 基本对比

下面用一个简单的计数器示例来对比两者的写法：

```html
<script setup>
  import { ref, watch, watchEffect } from 'vue'

  const count = ref(0)

  // watch：需要手动指定数据源 count
  watch(count, (newVal, oldVal) => {
    console.log(`[watch] count: ${oldVal} -> ${newVal}`)
  })

  // watchEffect：自动追踪回调中访问的 count.value，无需指定
  watchEffect(() => {
    console.log(`[watchEffect] count = ${count.value}`)
  })
</script>

<template>
  <p>count: {{ count }}</p>
  <button @click="count++">+1</button>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-11-31-02.png)

组件挂载后，watchEffect 会「立即执行一次」（不需要像 watch 那样显式配置 `immediate: true`），控制台输出：

```
[watchEffect] count = 0
```

点击按钮后，两者都会触发：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-11-30-53.png)

```
[watch] count: 0 -> 1
[watchEffect] count = 1
```

### 7.2. 核心区别

| 特性     | watch                            | watchEffect                    |
| -------- | -------------------------------- | ------------------------------ |
| 依赖追踪 | 明确指定数据源                   | 自动追踪回调中访问的响应式数据 |
| 初始执行 | 默认不执行，需 `immediate: true` | 自动立即执行一次               |
| 新/旧值  | 可获取 `newValue` 和 `oldValue`  | 没有新/旧值参数                |
| 适用场景 | 需要旧值、精确控制数据源         | 依赖简单、需要自动追踪         |

### 7.3. watchEffect 自动追踪多个依赖

当回调中访问了多个响应式数据时，watchEffect 会自动追踪所有依赖，无需像 watch 那样用数组列出：

```html
<script setup>
  import { ref, watchEffect } from 'vue'

  const firstName = ref('张')
  const lastName = ref('三')

  // 自动追踪了 firstName.value 和 lastName.value 两个依赖
  // 任一变化都会重新执行
  watchEffect(() => {
    console.log(`姓名：${firstName.value}${lastName.value}`)
  })
</script>

<template>
  <p>{{ firstName }}{{ lastName }}</p>
  <input v-model="firstName" placeholder="姓" />
  <input v-model="lastName" placeholder="名" />
</template>
```

修改姓或名，都会触发 watchEffect 重新执行。

### 7.4. watchEffect 的局限：异步回调中的依赖追踪

watchEffect 仅在「同步」执行期间追踪依赖。如果使用 async 回调，只有第一个 `await` 之前访问的属性才会被追踪：

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

此外，async 函数返回的是 Promise，而 watchEffect 不会等待这个 Promise 完成。如果 async 回调中抛出异常，不会被 watchEffect 捕获，而是成为未处理的 Promise rejection：

```js
watchEffect(async () => {
  throw new Error('出错了') // ❌ 未处理的 Promise rejection
})
```

因此，当回调中有异步操作时，推荐使用 watch 并明确指定数据源：

```js
// ✅ 推荐：用 watch 处理异步
watch(todoId, async () => {
  const response = await fetch(`/api/todos/${todoId.value}`)
  data.value = await response.json()
})
```

如果确实需要在 watchEffect 中处理异步，建议在同步部分追踪依赖，用 `.then()` 处理异步：

```js
const id = ref(1)
const data = ref(null)

watchEffect(() => {
  const currentId = id.value // ✅ 同步执行，会被追踪
  fetch(`/api/${currentId}`)
    .then((res) => res.json())
    .then((result) => {
      data.value = result
    })
})
```

### 7.5. 如何选择？

- 需要精确控制数据源、需要新旧值对比 -> 用 watch
- 依赖简单、多个响应式数据需要自动追踪 -> 用 watchEffect
- 回调中涉及异步操作 -> 优先用 watch

如果 watch、watchEffect 的选择策略会让你开发时很纠结选哪个，其实不用纠结，记住一句话就够了：默认用 watch，原因很简单：

watch 几乎覆盖所有场景，watchEffect 能做的事 watch 都能做，反过来不行：

| 能力             | watch                | watchEffect |
| ---------------- | -------------------- | ----------- |
| 指定数据源       | ✅                   | ❌          |
| 获取新旧值       | ✅                   | ❌          |
| 精确控制触发条件 | ✅                   | ❌          |
| 自动追踪多个依赖 | 数组写法也能做到     | ✅          |
| 异步回调         | ✅ 更安全            | ⚠️ 有陷阱   |
| 默认立即执行     | 加 `immediate: true` | ✅ 自带     |

watchEffect 的优势不只是少写几行代码。对于依赖较多、并且依赖集合会随着业务逻辑频繁增减的场景，自动追踪可以降低「漏写依赖」的风险，写起来也更顺手。

但它的代价同样明显：你拿不到新旧值，难以精确控制触发条件，异步场景下也更容易踩坑。所以日常开发里仍然可以把 watch 当作默认选择，因为它更明确、更稳定；当你只是想根据当前访问到的多个响应式数据快速执行一个副作用时，再考虑用 watchEffect。

## 8. 🤔 侦听器回调的触发时机有哪些？

当我们修改响应式状态时，Vue 会同时触发两件事：组件更新（重新渲染 DOM）和侦听器回调。默认情况下，侦听器回调在 DOM 更新「之前」执行。如果你需要在回调中访问更新后的 DOM，可以通过 `flush` 选项来控制执行时机。

除此之外，默认的 `watch` 回调还会经过 Vue 的调度队列做「批量处理」。也就是说，在同一轮同步代码里连续多次修改同一个响应式数据时，`flush: 'pre'` 和 `flush: 'post'` 通常不会每改一次就立刻执行一次，而是等这一轮同步修改结束后再统一触发，拿到最终结果。只有 `flush: 'sync'` 会绕过这层批处理，每次变化都立即执行。

三种触发时机：

| flush 值 | 别名 | 执行时机 | 适用场景 |
| --- | --- | --- | --- |
| `'pre'`（默认） | — | DOM 更新之前 | 大多数场景 |
| `'post'` | `watchPostEffect` | DOM 更新之后 | 需要访问更新后的 DOM |
| `'sync'` | `watchSyncEffect` | 数据变化时同步触发 | 简单场景，慎用 |

### 8.1. `flush: 'pre'`（默认）

这是默认行为，侦听器回调在 DOM 更新之前执行。大多数场景下不需要修改这个默认值：

```html
<script setup>
  import { ref, watch, nextTick } from 'vue'

  const count = ref(0)

  watch(count, async (newVal) => {
    // 此时 DOM 还没更新，页面上显示的还是旧值
    console.log(`回调执行，count = ${newVal}`)
    // 真实 DOM 的值：
    console.log(document.querySelector('#count').textContent) // 旧值
    await nextTick() // 等待 DOM 更新完成
    console.log(document.querySelector('#count').textContent) // 新值
  })
</script>

<template>
  <p id="count">count: {{ count }}</p>
  <button @click="count++">+1</button>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-14-28-57.png)

点击按钮后，控制台先打印日志，然后 Vue 才更新 DOM。

点击「+1」按钮之后：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-14-29-10.png)

控制台的输出结果：

```
回调执行，count = 1
count: 0 // DOM 更新前：页面还是旧值
count: 1 // nextTick 后：DOM 已更新
```

### 8.2. `flush: 'post'`：DOM 更新后执行

如果需要在回调中操作更新后的 DOM（比如读取元素尺寸、滚动位置等），需要设置 `flush: 'post'`。

先看一个简单的例子，对比 `flush: 'pre'`（默认）和 `flush: 'post'` 的区别：

```html
<script setup>
  import { ref, watch } from 'vue'

  const count = ref(0)
  const log = ref('')

  // 默认 flush: 'pre'，DOM 更新之前执行
  watch(count, (newVal) => {
    log.value += `[pre] count = ${newVal}\n`
  })

  // flush: 'post'，DOM 更新之后执行
  watch(
    count,
    (newVal) => {
      log.value += `[post] count = ${newVal}\n`
    },
    { flush: 'post' },
  )
</script>

<template>
  <p>count: {{ count }}</p>
  <button @click="count++">+1</button>
  <pre>{{ log }}</pre>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-14-34-12.png)

点击「+1」按钮后，页面上的 `log` 始终会显示，因为两个 watcher 都正确触发了。但它们的执行顺序不同：`[pre]` 先执行，`[post]` 后执行（此时 DOM 已经更新完毕）。

`flush: 'post'` 的典型应用场景是需要在回调中读取更新后的 DOM 元素信息：

```html
<script setup>
  import { ref, watch } from 'vue'

  const count = ref(0)
  const boxRef = ref(null)
  const log = ref('')

  watch(
    count,
    () => {
      // flush: 'post' 保证此时 DOM 已经更新
      // 可以安全读取更新后的 DOM 元素尺寸
      if (boxRef.value) {
        const { width, height } = boxRef.value.getBoundingClientRect()
        log.value += `count = ${count.value}，box 尺寸：${width.toFixed(0)} x ${height.toFixed(0)}\n`
      }
    },
    { flush: 'post' },
  )
</script>

<template>
  <div
    ref="boxRef"
    :style="{ width: 100 + count * 20 + 'px', height: 50 + count * 10 + 'px', background: '#e8c547' }"
  ></div>
  <p>count: {{ count }}</p>
  <button @click="count++">+1</button>
  <pre>{{ log }}</pre>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-14-35-27.png)

每次点击按钮，DOM 更新完成后，回调才执行，读取到的 `getBoundingClientRect()` 是更新后的值。

`watchPostEffect` 是 `flush: 'post'` 的简写形式，效果完全等价：

```js
import { watchPostEffect } from 'vue'

watchPostEffect(() => {
  // DOM 更新后执行
  console.log('DOM 已更新')
})
```

### 8.3. `flush: 'sync'`：同步触发

同步侦听器会在响应式数据变化的同一轮更新中立即触发，不会被 Vue 批量处理。这意味着每次数据变化都会立即执行回调，即使在同一段代码中连续修改多次：

```html
<script setup>
  import { ref, watch } from 'vue'

  const count = ref(0)
  const log = ref('')

  watch(
    count,
    (newVal) => {
      log.value += `sync 回调：count = ${newVal}\n`
    },
    { flush: 'sync' },
  )

  watch(
    count,
    (newVal) => {
      log.value += `pre 回调：count = ${newVal}\n`
    },
    { flush: 'pre' },
  )

  function batchUpdate() {
    count.value++
    count.value++
    count.value++
  }
</script>

<template>
  <p>count: {{ count }}</p>
  <button @click="batchUpdate">+3</button>
  <pre>{{ log }}</pre>
</template>
```

点击「+3」按钮之后：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-14-37-18.png)

`flush: 'sync'` 的回调在每次赋值后立即执行（共 3 次），而 `flush: 'pre'` 的回调被 Vue 批量处理，只在更新前执行一次（取最终值 3）。因为这 3 次 `count.value++` 发生在同一段同步代码里，被同一个调度周期合并成了一次回调。如果你把这几次修改拆到不同的异步任务里，`flush: 'pre'` 仍然会分别触发。

::: tip 注意

同步侦听器不会被批量处理，连续修改数据时会多次触发回调。应避免在可能频繁变化的数据源上使用，以防性能问题。

:::

## 9. 🤔 如何停止侦听器？

在 `setup()` 或 `<script setup>` 中用同步语句创建的侦听器，会自动绑定到宿主组件实例上，并在宿主组件卸载时自动停止。因此大多数情况下无需手动停止。

watch 和 watchEffect 都返回一个停止函数，可以手动停止侦听器：

```js
const stopWatch = watch(source, callback)

// 当该侦听器不再需要时
stopWatch()
```

需要手动停止的典型场景是在异步回调中创建侦听器 => 这种侦听器不会自动绑定到组件实例，如果不手动停止可能导致内存泄漏：

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

在侦听器中执行异步请求时，可能会出现「竞态问题」。当数据源在请求完成前就再次变化，上一个请求的结果会覆盖新请求的结果，导致页面显示的数据和实际选择的数据不一致。

### 10.1. 竞态问题是什么？

```html
<script setup>
  import { ref, watch } from 'vue'

  // 故意让不同用户的请求耗时不同，用来稳定复现竞态问题
  function getData(id) {
    const delayMap = { 1: 1000, 2: 3000, 3: 1000 }
    const delay = delayMap[id] ?? 2000

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, name: `用户${id}`, delay })
      }, delay)
    })
  }

  const userId = ref(1)
  const userData = ref(null)
  const log = ref('')

  watch(userId, async (newId) => {
    log.value += `开始请求 userId=${newId}\n`
    const data = await getData(newId)
    log.value += `请求 userId=${newId} 完成（耗时 ${data.delay}ms），结果：${data.name}\n`
    userData.value = data
  })
</script>

<template>
  <p>当前 userId: {{ userId }}</p>
  <button @click="userId = 1">用户 1</button>
  <button @click="userId = 2">用户 2</button>
  <button @click="userId = 3">用户 3</button>
  <p>用户数据: {{ userData?.name }}</p>
  <pre>{{ log }}</pre>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-16-20-47.png)

这里刻意把用户 2 的请求时间设为 3000ms，把用户 3 的请求时间设为 1000ms。这样当你快速点击「用户 2」→「用户 3」时，请求 userId=3 会先返回，页面会先显示用户 3；但 2 对应的旧请求随后才返回，又会把页面覆盖成用户 2 的旧数据。

这种「后发出的请求先返回，先发出的旧请求后返回并覆盖结果」的情况，就是竞态问题。也就是说，页面最终展示的结果，不一定等于用户最后一次操作对应的结果。

### 10.2. 使用 `onWatcherCleanup` 清理副作用（Vue 3.5+）

Vue 3.5+ 提供了 `onWatcherCleanup` API 来注册清理函数。当侦听器即将重新执行时，会先调用上一次注册的清理函数，用于取消过期的请求等操作：

```html
<script setup>
  import { ref, watch, onWatcherCleanup } from 'vue'

  // 这里沿用上述的不同延迟思路，同时支持通过 AbortSignal 取消
  function getData(id, signal) {
    const delayMap = { 1: 1000, 2: 3000, 3: 1000 }
    const delay = delayMap[id] ?? 2000

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve({ id, name: `用户${id}` })
      }, delay)

      // 监听取消信号
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new DOMException('请求被取消', 'AbortError'))
        })
      }
    })
  }

  const userId = ref(1)
  const userData = ref(null)
  const log = ref('')

  watch(userId, async (newId) => {
    const controller = new AbortController()

    log.value += `开始请求 userId=${newId}\n`
    getData(newId, controller.signal)
      .then((data) => {
        log.value += `请求 userId=${newId} 完成，结果：${data.name}\n`
        userData.value = data
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          log.value += `请求 userId=${newId} 被取消\n`
        }
      })

    // 注册清理函数：下次 userId 变化时，取消本次请求
    onWatcherCleanup(() => {
      controller.abort()
    })
  })
</script>

<template>
  <p>当前 userId: {{ userId }}</p>
  <button @click="userId = 1">用户 1</button>
  <button @click="userId = 2">用户 2</button>
  <button @click="userId = 3">用户 3</button>
  <p>用户数据: {{ userData?.name }}</p>
  <pre>{{ log }}</pre>
</template>
```

快速连续点击「用户 2」→「用户 3」：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-15-28-43.png)

过期的请求被正确取消，最终显示的一定是最新选择的用户数据。

::: tip 注意

`onWatcherCleanup` 必须在 `watchEffect` 效果函数或 `watch` 回调函数的「同步执行期间」调用，不能在 `await` 之后调用。

:::

### 10.3. 使用 `onCleanup` 参数（Vue 3.5 之前）

在 Vue 3.5 之前，`onCleanup` 函数作为第三个参数传递给 `watch` 的回调函数，或作为 `watchEffect` 效果函数的第一个参数。用法和 `onWatcherCleanup` 完全一致，只是注册方式不同：

```js
// watch 的 onCleanup 是第三个参数
watch(userId, (newId, oldId, onCleanup) => {
  const controller = new AbortController()

  getData(newId, controller.signal)
    .then((data) => {
      userData.value = data
    })
    .catch((err) => {
      if (err.name === 'AbortError') {
        console.log(`请求 userId=${newId} 被取消`)
      }
    })

  onCleanup(() => {
    controller.abort()
  })
})

// watchEffect 的 onCleanup 是效果函数的第一个参数
watchEffect((onCleanup) => {
  const controller = new AbortController()

  getData(userId.value, controller.signal)
    .then((data) => {
      userData.value = data
    })
    .catch((err) => {
      if (err.name === 'AbortError') {
        console.log('请求被取消')
      }
    })

  onCleanup(() => {
    controller.abort()
  })
})
```

## 11. 🤔 watch 和 computed 有什么区别？

computed（计算属性）和 watch（侦听器）都能响应响应式数据的变化，但它们的设计目的完全不同：

- computed 用于「派生出一个新值」，它会根据依赖自动缓存结果，只有依赖发生变化时才重新计算。
- watch 用于「在数据变化时执行副作用」，它不需要返回值，更适合执行异步操作、修改 DOM、写入本地存储等有副作用的操作。

选择策略：

- 需要基于现有数据计算出新数据时用 computed，有缓存，性能更好
- 需要在数据变化时「做某件事」时用 watch，更灵活，支持异步和副作用

下面用一个购物车示例来对比两者的使用场景：

```html
<script setup>
  import { ref, computed, watch } from 'vue'

  const price = ref(100)
  const quantity = ref(1)

  // ✅ 用 computed 派生总价 => 纯计算，有缓存
  // price 或 quantity 没变时，多次访问 totalPrice 不会重新计算
  const totalPrice = computed(() => {
    console.log('computed 重新计算了') // 只在依赖变化时才打印
    return price.value * quantity.value
  })

  // ✅ 用 watch 在总价超过 500 时执行副作用 => 记录日志、发请求等
  watch(totalPrice, (newTotal, oldTotal) => {
    if (newTotal > 500) {
      console.log(`总价 ${newTotal} 超过 500，发送通知`)
    }
  })
</script>

<template>
  <p>单价：{{ price }} 元</p>
  <p>数量：{{ quantity }}</p>
  <p>总价：{{ totalPrice }} 元</p>
  <button @click="price += 50">涨价 +50</button>
  <button @click="quantity++">数量 +1</button>
</template>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-05-15-39-32.png)

在这个例子中：

- `totalPrice` 用 computed 实现，因为它是纯粹的「根据 price 和 quantity 计算出一个新值」，依赖不变时不会重复计算，适合频繁读取。
- watch 监听 `totalPrice` 的变化，用于执行「总价超过 500 时发送通知」这种副作用操作，它不需要返回值。

如果反过来，用 watch 计算总价、用 computed 发通知，就会很别扭：watch 不方便返回值，computed 也不适合执行副作用。选择哪个，取决于你想做的事情是「计算一个值」还是「响应变化做某件事」。

## 12. 🤔 选项式 API 中如何使用侦听器？

在选项式 API 中，通过组件的 watch 选项来定义侦听器。每个 key 对应要侦听的属性名，value 可以是一个回调函数，也可以是包含 `handler`、`immediate`、`deep` 等配置项的对象：

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

在 Vue 3 新项目中，推荐使用 `<script setup>` 搭配组合式 API 的 watch 函数，更灵活也更符合现代写法。选项式 API 的 watch 选项主要在维护旧代码时会遇到，稍作了解即可。

:::

## 13. 🤔 为什么 `watch(state.count, ...)` 写法是错误的，必须包裹为 getter 函数才能正常监听？【深入理解 watch 的工作原理】

::: tip 先从宏观层面来思考这个问题？

- 写法 1：`watch(state.count, callback)` 错误，state.count 变化不会触发 callback 执行
- 写法 2：`watch(() => state.count, callback)` 正确，state.count 变化会触发 callback 执行

watch 能够实现对数据变化的监听，本质上需要将「数据源」和「回调函数」建立联系。至于 Vue 内部是如何实现这个联系的，我们需要深入理解 watch 的工作原理才能了解。

1 不行，2 可以从宏观层面来看待这个问题，你会发现本质上就是 1 的写法导致 Vue 无法为写法 1 建立「数据源」和「回调函数」的联系，而 2 可以正常建立联系。

有了这个大方向的引导，下一步就是进一步分析为什么写法 1 无法建立联系，写法 2 可以建立联系了。

:::

这涉及到 watch 的工作原理和 JavaScript 的求值时机。

### 13.1. 核心原因：JS 先求值，watch 后运行

```js
watch(state.count, callback)
```

JavaScript 在调用 watch 之前，会先对参数 `state.count` 求值。此时 `state` 是 reactive 代理，访问 `.count` 触发了代理的 getter，返回的是当前的原始值，比如 `0`。

所以 watch 实际收到的是：

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

### 13.4. 为什么 ref 不需要 getter？

```js
const count = ref(0)
watch(count, callback) // ✅ 直接传 ref 本身，不需要 getter
```

因为这里传入的是 ref 对象本身（不是 `count.value`），Vue 内部识别到它是一个 ref，就知道通过 `.value` 来追踪变化。而 `state.count` 在求值后丢失了「它来自哪里」的信息。

### 13.5. 简化版的依赖收集核心源码

如果写成 `state.count`，会导致 vue 无法记录到 `state.count` 的消费者，因为它拿到的只是一个普通值，无法追踪。虽然在首次访问 `state.count` 时会触发 getter，但 Vue 只能记录到这个访问发生了，而无法知道这个访问是哪个侦听器的依赖。

Vue 内部维护了一个全局变量（比如 activeEffect），记录「当前正在执行的副作用函数是谁」。当 watch 开始执行时，它会先设置 `activeEffect = callback`，然后执行 getter 函数来访问 `state.count`。这个时候，Vue 的 track 逻辑就能正确地将 activeEffect 记录为 `state.count` 的依赖。

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

## 14. 🤔 watchEffect 是如何自动收集依赖的？【深入理解 watchEffect 的工作原理】

watchEffect 自动收集依赖的核心机制和前文讲的 watch 的依赖收集机制几乎完全一样，只是 watch 需要你手动指定数据源，而 watchEffect 把这一步自动化了。

整个过程分三步：

```
1. watchEffect 立即执行回调函数
2. 执行过程中，访问到的响应式属性触发 getter
3. getter 内部把「当前正在执行的函数」记录为该属性的依赖
```

需要注意的是第二步「访问到的响应式属性触发 getter」是「同步」发生的，所以如果回调函数中有 `await`，那么 `await` 之后的代码就不在同一个执行上下文了，依赖收集就会失效。

### 14.1. Vue 内部的简化实现逻辑

我们来看看 Vue 内部的简化实现逻辑：

```js
// 全局变量，记录当前正在执行的副作用
let activeEffect = null

function watchEffect(effectFn) {
  const runner = () => {
    activeEffect = runner // ① 标记自己为当前副作用
    effectFn() // ② 执行回调，触发响应式数据的 getter
    activeEffect = null // ③ 执行完毕，清除标记
  }
  runner() // 立即执行一次（同步）
}

// reactive 的 getter（简化）
function track(target, key) {
  if (!activeEffect) return
  // 记录：activeEffect 这个函数依赖了 target.key
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = new Set()))
  dep.add(activeEffect) // ④ 绑定关系建立
}
```

### 14.2. 一个具体例子

```js
const firstName = ref('张')
const lastName = ref('三')

watchEffect(() => {
  console.log(`${firstName.value} ${lastName.value}`)
})
```

执行过程：

```
1. activeEffect = runner
2. 执行回调
   -> 访问 firstName.value -> 触发 track(firstName, 'value')
   -> track 发现 activeEffect 存在 -> 记录依赖 ✅
   -> 访问 lastName.value -> 触发 track(lastName, 'value')
   -> track 发现 activeEffect 存在 -> 记录依赖 ✅
3. activeEffect = null

依赖收集结果：
  firstName.value -> [runner]
  lastName.value  -> [runner]
依赖关系（响应式数据源和对应的副作用消费函数之间的绑定关系）建立成功 ✅
```

之后 `firstName` 或 `lastName` 任何一个变化，都会触发 runner 重新执行。

### 14.3. 为什么 async 回调中 await 之后的依赖收集不到？

```js
watchEffect(async () => {
  const id = todoId.value // ① 同步执行，activeEffect 存在 → 收集成功

  const response = await fetch(`/api/${id}`) // ② 遇到 await，函数暂停
  //    runner 函数已经 return 了
  //    activeEffect 被设为 null

  const result = await response.json()
  const latestId = todoId.value // ③ 恢复执行时再次读取响应式数据，但 activeEffect 已经是 null
  //    track 跳过 → latestId 这次读取不会被收集 ❌

  data.value = { ...result, latestId } // ④ 这里只是普通副作用赋值
})
```

因为 async 函数遇到 `await` 后会把后续代码放到微任务队列，`runner` 的同步部分已经执行完毕（`activeEffect = null`），等到微任务恢复执行时，没有人在监听了。

对比 watch 的做法：

```js
watch(todoId, async () => {
  const response = await fetch(`/api/${todoId.value}`)
  data.value = await response.json()
})
```

watch 不依赖 `activeEffect` 的执行来收集依赖，它是在创建侦听器时「主动」检查传入的数据源类型（ref / reactive / getter），直接和数据源建立关联。所以 async 回调不影响依赖关系，因为依赖是你手动指定的，不是自动收集的。

进一步思考：watchEffect 的依赖收集机制为什么设计成同步的，而不是异步的？改成异步的话能解决 watchEffect 中无法收集 await 之后的依赖问题吗？

感兴趣的话，你可以思考一下这个问题，或许能加深你对事件循环机制和 Vue 内部实现原理的理解。

::: details 点击展开：为什么 Vue 不把 `watchEffect` 的依赖收集改成异步？

乍一看，把 `runner` 改成 async 好像能解决问题：

```js
// 假设改成这样
async function watchEffect(effectFn) {
  const runner = async () => {
    activeEffect = runner
    await effectFn() // ← 改成 await，等待异步执行完毕
    activeEffect = null
  }
  runner()
}
```

但这里会立刻引出一个更核心的问题：`activeEffect` 作为全局单例，无法在异步暂停期间保持正确归属。

「问题一：过度收集」

`activeEffect` 是一个全局变量。async 函数在 `await` 处暂停后，`activeEffect` 仍然指向当前 `runner`。在这段等待期间，如果有其他代码访问了响应式数据，getter 会误以为这些数据也属于当前 effect，于是把不相关的数据错误收集进来：

```js
watchEffect(async () => {
  const id = todoId.value
  await fetch(`/api/${id}`) // 暂停，activeEffect 仍为 runner

  // 等待期间，用户点击了按钮，触发了某个 handler
  // handler 里访问了 count.value
  // -> getter 发现 activeEffect 存在
  // -> count 被错误地记录为这个 effect 的依赖
  // -> 之后 count 变化，这个 effect 也会重新执行，但其实它跟 count 没关系
})
```

如果这段等待期间又恰好有另一个 `watchEffect` 同步执行，它还会把 `activeEffect` 覆盖掉。也就是说，「问题一：过度收集」和下面的「问题二：全局状态被覆盖」并不是彼此独立的，它们经常会在同一个异步暂停窗口里同时出现。

「问题二：全局状态被覆盖」

`activeEffect` 是整个应用共用的。如果 effect A 在 `await` 处暂停，此时 effect B 同步执行，B 会把 `activeEffect` 覆盖为 `runnerB`。等 A 恢复执行时，`activeEffect` 已经不是 `runnerA` 了，后续依赖会绑定到错误的 effect 上：

```js
// effect A
watchEffect(async () => {
  const x = dataA.value // 绑定到 runnerA ✅
  await fetch('/api/a') // 暂停，activeEffect = runnerA
  // 此时 effect B 开始执行
  // activeEffect 被覆盖为 runnerB
  const y = dataB.value // 恢复执行，但 activeEffect 现在是 runnerB
  // dataB 被错误地绑定到 runnerB ❌
})

// effect B（在 A 暂停期间执行）
watchEffect(() => {
  console.log(someData.value) // someData 绑定到 runnerB ✅
  // 但 dataB 也被错误地绑定到了 runnerB
})
```

「如果整个副作用的执行改为异步的可行吗？」

```js
// 假设改成这样
async function watchAsyncEffect(effectFn) {
  const runner = async () => {
    activeEffect = runner
    await effectFn()
    activeEffect = null
  }
  await runner()
}

// 调用
await watchAsyncEffect(...)
```

理论上好像能自洽，但要付出很大代价：这套逻辑必须前置，并且要阻塞其它潜在副作用，才能勉强保证 `activeEffect` 在异步阶段的归属不乱。

如果真的这么设计，`watchAsyncEffect` 还会阻塞组件渲染。Vue 选择让 `watchEffect` 同步执行，先建立依赖关系、先把界面渲染出来，再让异步副作用在后台进行，数据回来后再更新界面。这才是更合理的执行模型。

:::

### 14.4. 为什么 watchEffect 默认就会立刻执行一次呢？

watchEffect 默认就会立刻执行一次，就好像 watch 显式设置了 `immediate: true`。如果你理解了 watchEffect 的依赖收集机制，这个行为就很好理解了：如果不立刻执行一次，依赖关系就无法建立，后续数据变化了也无法触发回调了。

同步跑一遍回调，就是为了触发响应式数据的 getter，明确这个响应式数据的消费者是谁，从而建立依赖关系。如果不立刻执行一次，响应式数据的 getter 就不会被触发，依赖关系就无法立刻建立了。

### 14.5. 一句话总结

watchEffect 的自动收集就是：执行回调（同步执行） -> 触发 getter（同步代码中的 getter） -> getter 发现 activeEffect 存在 -> 记录依赖。

整个机制和 watch 的依赖收集完全相同，区别只是 watchEffect 把「设置 activeEffect -> 执行回调」这一步自动化了。

## 15. 🔗 引用

- [Vue.js 官方文档 - 侦听器][1]
- [MDN - AbortController][2]
- [MDN - async function][3]

[1]: https://cn.vuejs.org/guide/essentials/watchers.html
[2]: https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController
[3]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function
