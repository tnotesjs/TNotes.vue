# [0042. 组合式 API 详解](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0042.%20%E7%BB%84%E5%90%88%E5%BC%8F%20API%20%E8%AF%A6%E8%A7%A3)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 setup 函数和 script setup 语法糖有什么区别？](#3--setup-函数和-script-setup-语法糖有什么区别)
- [4. 🤔 ref 和 reactive 有什么区别？什么场景用哪个？](#4--ref-和-reactive-有什么区别什么场景用哪个)
- [5. 🤔 watch 和 watchEffect 有什么区别？](#5--watch-和-watcheffect-有什么区别)
- [6. 🤔 组合式 API 中的生命周期钩子如何使用？](#6--组合式-api-中的生命周期钩子如何使用)
- [7. 🤔 如何封装和复用自定义组合式函数（Composables）？](#7--如何封装和复用自定义组合式函数composables)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- setup 函数与 setup 语法糖（script setup）
- 响应式数据：ref 与 reactive
- 计算属性 computed
- 侦听器 watch 与 watchEffect
- 生命周期钩子在组合式 API 中的使用
- 自定义组合式函数（Composables）的封装与复用

## 2. 🫧 评价

- todo

## 3. 🤔 setup 函数和 script setup 语法糖有什么区别？

setup 函数是组合式 API 的入口点，它在组件实例创建之后、beforeCreate 之前执行。setup 函数接收两个参数：props 和 context（包含 attrs、slots、emit、expose）。setup 函数需要返回一个对象，对象中的属性和方法会暴露给模板使用。

```js
import { ref, computed } from 'vue'

export default {
  props: {
    title: String,
  },
  setup(props, { emit, attrs, slots, expose }) {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)

    function increment() {
      count.value++
      emit('update', count.value)
    }

    // expose 限制通过 ref 访问时暴露的属性
    expose({ count, increment })

    // 返回值暴露给模板
    return { count, doubleCount, increment }
  },
}
```

script setup 是 setup 函数的编译时语法糖，在 Vue 3.2 中正式发布。它消除了大量样板代码：

```html
<script setup>
  import { ref, computed } from 'vue'

  // props 通过 defineProps 宏来声明
  const props = defineProps({
    title: String,
  })

  // emits 通过 defineEmits 宏来声明
  const emit = defineEmits(['update'])

  // 顶层绑定自动暴露给模板，无需 return
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
    emit('update', count.value)
  }

  // 限制暴露（可选）
  defineExpose({ count, increment })
</script>

<template>
  <h1>{{ title }}</h1>
  <p>{{ count }} x 2 = {{ doubleCount }}</p>
  <button @click="increment">+1</button>
</template>
```

两者的主要区别：

第一，script setup 更简洁——不需要 return 对象、不需要 export default、不需要单独声明 components（导入的组件自动注册）。

第二，script setup 中的 import 的组件可以直接在模板中使用：

```html
<script setup>
  import MyComponent from './MyComponent.vue'
  import { ref } from 'vue'

  // MyComponent 自动注册，无需 components 选项
  const show = ref(true)
</script>

<template>
  <MyComponent v-if="show" />
</template>
```

第三，script setup 中使用辅助宏来声明 props、emits 等（defineProps、defineEmits、defineExpose、defineOptions、defineSlots 都是编译器宏，不需要导入）。

第四，性能更好。script setup 编译后的代码生成效率更高，因为编译器可以在编译阶段做更多优化（如避免了运行时解析 return 对象的开销）。

如果需要在同一个 SFC 中同时使用普通 script 和 script setup，可以这样做：

```html
<script>
  // 普通 script，用于声明一些不属于 setup 的选项
  export default {
    inheritAttrs: false,
  }
</script>

<script setup>
  // setup 逻辑
  import { ref } from 'vue'
  const count = ref(0)
</script>
```

## 4. 🤔 ref 和 reactive 有什么区别？什么场景用哪个？

ref 和 reactive 是 Vue 3 组合式 API 中创建响应式数据的两种方式，各有适用场景。

ref 用于创建一个响应式引用，可以包装任意类型的值（基本类型和对象类型）。在 JavaScript 中需要通过 .value 来访问和修改值，在模板中会自动解包：

```html
<script setup>
  import { ref } from 'vue'

  // 基本类型
  const count = ref(0)
  const message = ref('hello')
  const isVisible = ref(true)

  // 对象类型（内部自动用 reactive 包装）
  const user = ref({ name: '张三', age: 25 })

  // JavaScript 中需要 .value
  count.value++
  message.value = 'world'
  user.value.name = '李四'
  user.value = { name: '王五', age: 30 } // 可以整体替换
</script>

<template>
  <!-- 模板中自动解包，不需要 .value -->
  <p>{{ count }}</p>
  <p>{{ message }}</p>
  <p>{{ user.name }}</p>
</template>
```

reactive 用于创建一个响应式对象，只能包装对象类型（Object、Array、Map、Set 等），不能包装基本类型。直接访问属性，无需 .value：

```html
<script setup>
  import { reactive } from 'vue'

  const state = reactive({
    count: 0,
    user: { name: '张三', age: 25 },
    items: [1, 2, 3],
  })

  // 直接访问和修改
  state.count++
  state.user.name = '李四'
  state.items.push(4)

  // 注意：不能整体替换 reactive 对象
  // state = reactive({ count: 1 })  // 这样会丢失响应式引用
</script>
```

ref 和 reactive 的核心区别：

第一，值类型支持不同。ref 可以包装所有类型（string、number、boolean、object、array），reactive 只能包装对象类型。

第二，访问方式不同。ref 在 JS 中需要 .value，reactive 直接访问属性。

第三，重新赋值行为不同。ref 可以通过 .value 整体替换（因为变的是 .value 指向的值，ref 本身的引用不变）。reactive 不能整体替换，否则原来的响应式引用就断了：

```js
// ref 可以安全替换
const user = ref({ name: '张三' })
user.value = { name: '李四' } // 响应式保持

// reactive 不能替换
let state = reactive({ name: '张三' })
state = reactive({ name: '李四' }) // 丢失响应式
// 应该这样修改
Object.assign(state, { name: '李四' })
```

第四，解构行为不同。reactive 对象直接解构会丢失响应式，需要配合 toRefs：

```js
const state = reactive({ count: 0, name: 'hello' })

// 直接解构失去响应式
const { count, name } = state // count 和 name 只是普通值

// 使用 toRefs 保持响应式
const { count, name } = toRefs(state) // count 和 name 是 Ref
```

使用建议：Vue 官方推荐优先使用 ref，因为它更加灵活和统一。ref 可以处理任何类型的数据，可以自由替换值，在函数之间传递时不会丢失响应式。reactive 在管理一组相关的状态时更直观（避免大量 .value），但要注意不能整体替换和解构的问题。

```js
// 推荐：使用 ref
const count = ref(0)
const user = ref(null)
const items = ref([])

// 也可以：对于一组相关状态使用 reactive
const form = reactive({
  username: '',
  password: '',
  remember: false,
})
```

## 5. 🤔 watch 和 watchEffect 有什么区别？

watch 和 watchEffect 都是用来监听响应式数据变化的，但它们在使用方式和行为上有明显的区别。

watch 需要明确指定要监听的数据源，它只在数据源变化时才执行回调，并且可以获取到新值和旧值：

```js
import { ref, reactive, watch } from 'vue'

const count = ref(0)
const user = reactive({ name: '张三', age: 25 })

// 监听 ref
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})

// 监听 reactive 的某个属性（需要使用 getter 函数）
watch(
  () => user.name,
  (newName, oldName) => {
    console.log(`name: ${oldName} -> ${newName}`)
  },
)

// 监听整个 reactive 对象（自动开启 deep）
watch(user, (newUser) => {
  console.log('user 变化了', newUser)
})

// 监听多个数据源
watch([count, () => user.name], ([newCount, newName], [oldCount, oldName]) => {
  console.log(`count: ${oldCount} -> ${newCount}`)
  console.log(`name: ${oldName} -> ${newName}`)
})

// 配置选项
watch(
  count,
  (newVal) => {
    console.log(newVal)
  },
  {
    immediate: true, // 立即执行一次回调
    deep: true, // 深度监听
    flush: 'post', // DOM 更新后执行
  },
)
```

watchEffect 自动追踪回调函数中使用的所有响应式依赖，无需手动指定监听目标。它会在创建时立即执行一次，之后在依赖变化时重新执行：

```js
import { ref, watchEffect } from 'vue'

const count = ref(0)
const message = ref('hello')

// 自动追踪依赖
watchEffect(() => {
  // 访问了 count.value，所以自动依赖于 count
  console.log(`count 的值是：${count.value}`)
  // 如果这里没有访问 message.value，则不会追踪 message
})

// 清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log(count.value)
  }, 1000)

  // 在下次执行前或组件卸载时清理
  onCleanup(() => {
    clearInterval(timer)
  })
})

// 可以在异步函数中使用
watchEffect(async (onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())

  const response = await fetch(`/api/data?id=${count.value}`, {
    signal: controller.signal,
  })
  // 处理响应...
})
```

两者的核心区别：

| 特性     | watch                            | watchEffect          |
| -------- | -------------------------------- | -------------------- |
| 数据源   | 需要明确指定                     | 自动追踪             |
| 首次执行 | 默认不执行（需 immediate: true） | 立即执行             |
| 新旧值   | 可以获取                         | 无法获取             |
| 惰性     | 是（默认只在变化时执行）         | 否（创建时立即执行） |

使用建议：如果你需要知道新旧值，或者需要控制监听哪些数据，使用 watch。如果你只关心某些数据变化后执行操作，且不需要旧值，watchEffect 更简洁。

停止监听：watch 和 watchEffect 都返回一个停止函数：

```js
const stop = watchEffect(() => {
  /* ... */
})

// 手动停止监听
stop()
```

在 setup 或 script setup 中创建的 watcher 会在组件卸载时自动停止，无需手动调用。

## 6. 🤔 组合式 API 中的生命周期钩子如何使用？

在组合式 API 中，生命周期钩子通过从 vue 中导入对应的函数来注册。大部分生命周期钩子都有对应的组合式 API 版本，名称前加 on 前缀。

```html
<script setup>
  import {
    onBeforeMount,
    onMounted,
    onBeforeUpdate,
    onUpdated,
    onBeforeUnmount,
    onUnmounted,
    onActivated,
    onDeactivated,
    onErrorCaptured,
  } from 'vue'

  // beforeCreate 和 created 不需要——setup 本身就等同于这两个钩子的执行时机
  // 在 setup 中直接写的代码就相当于 beforeCreate/created

  console.log('相当于 created 阶段')

  onBeforeMount(() => {
    console.log('组件即将挂载')
  })

  onMounted(() => {
    console.log('组件已挂载，可以访问 DOM')
    // 这里可以进行 DOM 操作、启动定时器、请求数据等
  })

  onBeforeUpdate(() => {
    console.log('组件即将更新')
  })

  onUpdated(() => {
    console.log('组件已更新')
  })

  onBeforeUnmount(() => {
    console.log('组件即将卸载')
  })

  onUnmounted(() => {
    console.log('组件已卸载，清理资源')
  })

  // keep-alive 缓存的组件
  onActivated(() => {
    console.log('缓存组件被激活')
  })

  onDeactivated(() => {
    console.log('缓存组件被停用')
  })

  // 捕获后代组件的错误
  onErrorCaptured((err, instance, info) => {
    console.error('捕获到错误：', err)
    return false // 阻止错误继续向上传播
  })
</script>
```

选项式 API 与组合式 API 生命周期的对应关系：

| 选项式 API    | 组合式 API           |
| ------------- | -------------------- |
| beforeCreate  | 不需要（setup 本身） |
| created       | 不需要（setup 本身） |
| beforeMount   | onBeforeMount        |
| mounted       | onMounted            |
| beforeUpdate  | onBeforeUpdate       |
| updated       | onUpdated            |
| beforeUnmount | onBeforeUnmount      |
| unmounted     | onUnmounted          |
| activated     | onActivated          |
| deactivated   | onDeactivated        |
| errorCaptured | onErrorCaptured      |

组合式 API 中生命周期钩子的几个特点：

第一，同一个钩子可以注册多次，它们会按注册顺序执行：

```js
onMounted(() => {
  console.log('第一个 onMounted')
})

onMounted(() => {
  console.log('第二个 onMounted')
})
// 两个都会执行，按顺序
```

第二，生命周期钩子可以在 Composable 中使用，使得副作用管理可以封装到可复用的函数中：

```js
// composables/useEventListener.js
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target, event, callback) {
  onMounted(() => target.addEventListener(event, callback))
  onUnmounted(() => target.removeEventListener(event, callback))
}

// 在组件中使用
import { useEventListener } from './composables/useEventListener'

useEventListener(window, 'resize', () => {
  console.log('窗口大小变化')
})
```

第三，与 nextTick 配合使用：

```js
import { ref, onMounted, nextTick } from 'vue'

const listRef = ref(null)

onMounted(async () => {
  // mounted 后 DOM 已经存在
  console.log(listRef.value)

  // 如果需要等待数据更新后的 DOM
  await nextTick()
  // 此时 DOM 已经根据最新数据更新
})
```

## 7. 🤔 如何封装和复用自定义组合式函数（Composables）？

Composables（组合式函数）是 Vue 3 中封装和复用有状态逻辑的核心模式。一个 Composable 是一个利用 Vue 组合式 API 来封装和复用有状态逻辑的函数，按照约定以 use 开头命名。

基本封装模式：

```js
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0, step = 1) {
  const count = ref(initialValue)
  const isZero = computed(() => count.value === 0)

  function increment() {
    count.value += step
  }

  function decrement() {
    count.value -= step
  }

  function reset() {
    count.value = initialValue
  }

  return { count, isZero, increment, decrement, reset }
}
```

封装异步数据请求：

```js
// composables/useFetch.js
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(false)

  async function fetchData() {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(toValue(url))
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }
      data.value = await response.json()
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  // 如果 url 是响应式的，自动重新请求
  watchEffect(() => {
    fetchData()
  })

  return { data, error, isLoading, refetch: fetchData }
}
```

```html
<!-- 使用 useFetch -->
<script setup>
  import { ref, computed } from 'vue'
  import { useFetch } from './composables/useFetch'

  const userId = ref(1)
  const url = computed(() => `/api/users/${userId.value}`)

  const { data: user, error, isLoading } = useFetch(url)
</script>

<template>
  <div v-if="isLoading">加载中……</div>
  <div v-else-if="error">错误：{{ error }}</div>
  <div v-else>{{ user?.name }}</div>
  <button @click="userId++">下一个用户</button>
</template>
```

封装 DOM 相关的逻辑：

```js
// composables/useIntersectionObserver.js
import { ref, onMounted, onUnmounted, watch } from 'vue'

export function useIntersectionObserver(targetRef, options = {}) {
  const isIntersecting = ref(false)
  let observer = null

  function cleanup() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => {
    watch(
      () => targetRef.value,
      (el) => {
        cleanup()
        if (!el) return

        observer = new IntersectionObserver(([entry]) => {
          isIntersecting.value = entry.isIntersecting
        }, options)

        observer.observe(el)
      },
      { immediate: true },
    )
  })

  onUnmounted(cleanup)

  return { isIntersecting }
}
```

组合式函数之间的嵌套调用：

```js
// composables/useUserProfile.js
import { computed } from 'vue'
import { useFetch } from './useFetch'
import { useLocalStorage } from './useLocalStorage'

export function useUserProfile(userId) {
  const url = computed(() => `/api/users/${userId.value}`)

  // 嵌套使用其他 Composable
  const { data: user, isLoading, error } = useFetch(url)
  const { value: cachedPrefs, setValue: setCachedPrefs } = useLocalStorage(
    'userPrefs',
    {},
  )

  const displayName = computed(() => {
    return user.value?.nickname || user.value?.name || '未知用户'
  })

  async function updatePreferences(prefs) {
    setCachedPrefs(prefs)
  }

  return { user, isLoading, error, displayName, updatePreferences }
}
```

Composables 的最佳实践：

- 命名约定：以 use 开头，如 useMouse、useFetch、useCounter。
- 返回 ref 而不是 reactive：这样调用方可以解构而不丢失响应式。
- 接受 ref 或 getter 作为参数：使用 toValue() 来处理（Vue 3.3+），这样可以同时支持原始值和响应式值。
- 管理副作用：在 Composable 内部使用 onUnmounted 或 watchEffect 的清理函数来处理资源释放。
- 保持单一职责：每个 Composable 只关注一个功能，通过组合多个 Composable 来实现复杂逻辑。
