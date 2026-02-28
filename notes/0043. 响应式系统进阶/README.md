# [0043. 响应式系统进阶](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0043.%20%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F%E8%BF%9B%E9%98%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 shallowRef 和 triggerRef 的作用和使用场景是什么？](#3--shallowref-和-triggerref-的作用和使用场景是什么)
- [4. 🤔 如何使用 customRef 创建自定义 ref？](#4--如何使用-customref-创建自定义-ref)
- [5. 🤔 readonly 的作用是什么？如何用来保护数据？](#5--readonly-的作用是什么如何用来保护数据)
- [6. 🤔 toRefs 和 toRef 如何解决响应式解构的问题？](#6--torefs-和-toref-如何解决响应式解构的问题)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- shallowRef 与 triggerRef
- customRef 创建自定义 ref
- readonly 与 isReadonly
- toRefs 与 toRef 的解构响应式

## 2. 🫧 评价

- todo

## 3. 🤔 shallowRef 和 triggerRef 的作用和使用场景是什么？

shallowRef 是 ref 的浅层版本。普通的 ref 如果包装的是对象，会通过 reactive 对其进行深层响应式转换；而 shallowRef 只有 .value 本身的赋值操作是响应式的，内部属性的修改不会触发更新。

```js
import { ref, shallowRef, watchEffect } from 'vue'

// 普通 ref：深层响应式
const deepState = ref({ nested: { count: 0 } })
deepState.value.nested.count++ // 触发更新

// shallowRef：浅层响应式
const shallowState = shallowRef({ nested: { count: 0 } })
shallowState.value.nested.count++ // 不会触发更新
shallowState.value = { nested: { count: 1 } } // 触发更新（.value 整体替换）
```

shallowRef 的核心使用场景是性能优化。当你持有一个大型对象或数组，而你只需要在整体替换时触发更新（而不是每个内部属性变化都触发），shallowRef 可以避免深层响应式转换的开销：

```js
// 场景一：大型列表数据
const bigList = shallowRef([])

async function fetchData() {
  const data = await fetch('/api/items').then((r) => r.json())
  // 整体替换，触发更新
  bigList.value = data
}

// 场景二：第三方库的实例（不需要深层响应式）
const chartInstance = shallowRef(null)

onMounted(() => {
  chartInstance.value = new ECharts(containerRef.value)
})

// 场景三：大型不可变数据结构
const immutableTree = shallowRef(buildTree(rawData))

function updateNode(id, newData) {
  // 使用不可变更新，返回新对象
  immutableTree.value = updateTreeImmutably(immutableTree.value, id, newData)
}
```

triggerRef 用于强制触发 shallowRef 的更新。当你修改了 shallowRef 内部的属性，但又想手动触发视图更新时，可以使用 triggerRef：

```js
import { shallowRef, triggerRef, watchEffect } from 'vue'

const state = shallowRef({ count: 0, items: [] })

watchEffect(() => {
  console.log('state 变化了：', state.value.count)
})

// 修改内部属性（默认不会触发更新）
state.value.count++

// 手动触发更新
triggerRef(state)
// 此时 watchEffect 会重新执行

// 实际场景：批量修改后一次性触发
state.value.count = 10
state.value.items.push({ id: 1 })
state.value.items.push({ id: 2 })
triggerRef(state) // 只触发一次更新，而不是三次
```

triggerRef 的典型使用模式是"批量修改 + 一次性触发"，可以避免中间状态的渲染开销。但要注意，如果过度使用 triggerRef，代码会变得难以维护，因为响应式的追踪变得不透明。大多数情况下，优先考虑整体替换 .value 而不是手动触发。

## 4. 🤔 如何使用 customRef 创建自定义 ref？

customRef 允许你创建一个自定义的 ref，可以精确控制依赖追踪和更新触发的时机。它接收一个工厂函数，该函数接收 track 和 trigger 两个参数，返回一个包含 get 和 set 的对象。

```js
import { customRef } from 'vue'

function myCustomRef(value) {
  return customRef((track, trigger) => {
    return {
      get() {
        track() // 告诉 Vue 追踪这个依赖
        return value
      },
      set(newValue) {
        value = newValue
        trigger() // 告诉 Vue 触发依赖更新
      },
    }
  })
}
```

最经典的使用场景是防抖 ref（debounced ref）：

```js
import { customRef } from 'vue'

export function useDebouncedRef(value, delay = 300) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      },
    }
  })
}
```

```html
<script setup>
  import { useDebouncedRef } from './composables/useDebouncedRef'

  // 搜索输入框：用户停止输入 500ms 后才触发更新
  const searchQuery = useDebouncedRef('', 500)
</script>

<template>
  <input v-model="searchQuery" placeholder="搜索..." />
  <p>搜索关键字：{{ searchQuery }}</p>
</template>
```

节流 ref（throttled ref）：

```js
export function useThrottledRef(value, interval = 200) {
  let lastTrigger = 0
  let pending = false

  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        value = newValue
        const now = Date.now()
        if (now - lastTrigger >= interval) {
          lastTrigger = now
          trigger()
        } else if (!pending) {
          pending = true
          setTimeout(
            () => {
              pending = false
              lastTrigger = Date.now()
              trigger()
            },
            interval - (now - lastTrigger),
          )
        }
      },
    }
  })
}
```

带验证的 ref：

```js
export function useValidatedRef(
  initialValue,
  validator,
  errorMessage = '验证失败',
) {
  let value = initialValue
  let error = null

  return {
    value: customRef((track, trigger) => ({
      get() {
        track()
        return value
      },
      set(newValue) {
        if (validator(newValue)) {
          value = newValue
          error = null
        } else {
          error = errorMessage
        }
        trigger()
      },
    })),
    getError: () => error,
  }
}

// 使用
const { value: age, getError } = useValidatedRef(
  18,
  (v) => v >= 0 && v <= 150,
  '年龄必须在 0-150 之间',
)
```

带 localStorage 持久化的 ref：

```js
export function useLocalStorageRef(key, defaultValue) {
  const storedValue = localStorage.getItem(key)
  let value = storedValue !== null ? JSON.parse(storedValue) : defaultValue

  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      value = newValue
      localStorage.setItem(key, JSON.stringify(newValue))
      trigger()
    },
  }))
}

// 使用
const theme = useLocalStorageRef('theme', 'light')
theme.value = 'dark' // 自动同步到 localStorage
```

customRef 的关键点在于：track() 必须在 get 中调用来建立依赖追踪，trigger() 在你想让依赖方重新执行时调用。你可以完全控制在 set 中何时调用 trigger()，甚至可以选择不调用（忽略某些更新）。

## 5. 🤔 readonly 的作用是什么？如何用来保护数据？

readonly 接收一个响应式对象（reactive 或 ref）或普通对象，返回一个只读的代理。尝试修改只读代理的属性会在开发环境得到警告，在生产环境中静默失败。

```js
import { reactive, readonly, ref } from 'vue'

const original = reactive({ count: 0, nested: { value: 'hello' } })
const readonlyState = readonly(original)

// 尝试修改只读代理
readonlyState.count++ // 警告：Set operation on key "count" failed: target is readonly.
readonlyState.nested.value = 'hi' // 警告：深层也是只读的

// 但原始对象仍然可以修改
original.count++ // 正常工作
// readonlyState 会同步更新（因为它是原始对象的代理）
```

readonly 的主要使用场景：

第一，在 Composable 中保护内部状态。你可以在 Composable 内部管理状态，但暴露给外部的是只读版本，防止外部直接修改：

```js
import { ref, readonly } from 'vue'

export function useCounter() {
  const count = ref(0)

  function increment() {
    count.value++
  }
  function decrement() {
    count.value--
  }

  // 暴露只读的 count，外部不能直接修改
  return {
    count: readonly(count),
    increment,
    decrement,
  }
}

// 使用
const { count, increment } = useCounter()
count.value++ // 警告：不能修改
increment() // 正确方式：通过暴露的方法修改
```

第二，父组件向子组件传递只读数据：

```js
import { provide, reactive, readonly } from 'vue'

// 父组件
const appState = reactive({
  user: { name: '张三', role: 'admin' },
  config: { theme: 'dark' },
})

// 提供只读版本，防止子组件直接修改
provide('appState', readonly(appState))

// 提供修改方法
provide('updateTheme', (newTheme) => {
  appState.config.theme = newTheme
})
```

```js
// 子组件
const appState = inject('appState')
const updateTheme = inject('updateTheme')

appState.config.theme = 'light' // 警告：只读
updateTheme('light') // 正确方式
```

相关的工具函数：

```js
import { isReadonly, isProxy, isReactive, shallowReadonly } from 'vue'

const state = reactive({ count: 0 })
const ro = readonly(state)

isReadonly(ro) // true
isReactive(ro) // false（readonly 代理不是 reactive）
isProxy(ro) // true（readonly 也是代理）

// shallowReadonly：只限制第一层为只读
const shallowRo = shallowReadonly({ nested: { count: 0 } })
shallowRo.nested = {} // 警告：第一层只读
shallowRo.nested.count = 1 // 正常工作：嵌套对象不受限
```

## 6. 🤔 toRefs 和 toRef 如何解决响应式解构的问题？

当你从 reactive 对象中解构属性时，解构出来的变量会失去响应式链接。这是因为解构操作本质上是值的拷贝，基本类型的值被拷贝后就与原始对象断开了连接。toRefs 和 toRef 就是为了解决这个问题。

```js
import { reactive } from 'vue'

const state = reactive({ count: 0, name: 'hello' })

// 直接解构：失去响应式
let { count, name } = state
count++ // 只修改了局部变量，state.count 不变
// 模板中使用 count 也不会更新
```

toRef 将 reactive 对象的某个属性转换为一个 ref，这个 ref 与原始属性保持同步：

```js
import { reactive, toRef, watch } from 'vue'

const state = reactive({ count: 0, name: 'hello' })

// toRef 创建一个与原始属性同步的 ref
const countRef = toRef(state, 'count')

// 修改 ref 会同步到原始对象
countRef.value++
console.log(state.count) // 1

// 修改原始对象也会同步到 ref
state.count = 10
console.log(countRef.value) // 10

// 在 watch 中使用
watch(countRef, (newVal) => {
  console.log('count 变化：', newVal)
})
```

toRef 的另一个重要特性是：即使目标属性在源对象上不存在，toRef 也会返回一个可用的 ref。这在处理可选 props 时很有用：

```js
// props.count 可能不存在
const countRef = toRef(props, 'count')
// countRef.value 为 undefined，但仍然是响应式的
```

Vue 3.3+ 的 toRef 还支持将普通值包装为 ref（类似于 ref()），并且支持传入 getter 函数：

```js
// Vue 3.3+
const countRef = toRef(() => props.count) // getter 形式
```

toRefs 将整个 reactive 对象的所有属性转换为 ref 的对象，每个属性都与原始对象保持同步：

```js
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  name: 'hello',
  isActive: true,
})

// toRefs 将所有属性转为 ref
const refs = toRefs(state)
// refs.count -> Ref<number>
// refs.name -> Ref<string>
// refs.isActive -> Ref<boolean>

// 现在可以安全解构
const { count, name, isActive } = toRefs(state)

// 修改 ref 会同步到原始对象
count.value++
console.log(state.count) // 1

// 修改原始对象也会同步到 ref
state.name = 'world'
console.log(name.value) // 'world'
```

在 Composable 中使用 toRefs 的典型模式：

```js
// composables/useUserSettings.js
import { reactive, toRefs } from 'vue'

export function useUserSettings() {
  const settings = reactive({
    theme: 'light',
    fontSize: 14,
    language: 'zh-CN',
    notifications: true,
  })

  function updateSetting(key, value) {
    settings[key] = value
  }

  function resetSettings() {
    Object.assign(settings, {
      theme: 'light',
      fontSize: 14,
      language: 'zh-CN',
      notifications: true,
    })
  }

  // 使用 toRefs 返回，这样调用方可以解构
  return {
    ...toRefs(settings),
    updateSetting,
    resetSettings,
  }
}
```

```html
<script setup>
  import { useUserSettings } from './composables/useUserSettings'

  // 解构后依然保持响应式
  const { theme, fontSize, language, notifications, updateSetting } =
    useUserSettings()
</script>

<template>
  <p>当前主题：{{ theme }}</p>
  <button @click="updateSetting('theme', 'dark')">切换暗色</button>
  <p>字号：{{ fontSize }}</p>
</template>
```

Pinia 的 storeToRefs 也是基于类似原理实现的：

```js
import { storeToRefs } from 'pinia'
import { useCounterStore } from './stores/counter'

const store = useCounterStore()

// storeToRefs 只提取 state 和 getters 为 ref
// 方法不会被包含
const { count, doubleCount } = storeToRefs(store)

// 方法直接从 store 解构
const { increment } = store
```

总结：toRef 处理单个属性，toRefs 处理整个对象。它们都保持与源对象的双向同步。在封装 Composable 时，返回 toRefs 或使用展开语法 ...toRefs(state) 是最佳实践，这样调用方可以自由解构而不丢失响应式。
