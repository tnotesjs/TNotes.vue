# [0041. Vue 3 新特性概览](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0041.%20Vue%203%20%E6%96%B0%E7%89%B9%E6%80%A7%E6%A6%82%E8%A7%88)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue 3 在性能方面做了哪些提升？](#3--vue-3-在性能方面做了哪些提升)
- [4. 🤔 组合式 API 和选项式 API 有什么区别？如何选择？](#4--组合式-api-和选项式-api-有什么区别如何选择)
- [5. 🤔 Vue 3 的 TypeScript 支持改进了什么？](#5--vue-3-的-typescript-支持改进了什么)
- [6. 🤔 Fragment、Teleport 和 Suspense 分别解决什么问题？](#6--fragmentteleport-和-suspense-分别解决什么问题)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Vue 3 的性能提升（Proxy、重写虚拟 DOM）
- 组合式 API（Composition API）vs 选项式 API（Options API）
- 更好的 TypeScript 支持
- 新组件：Fragment、Teleport、Suspense

## 2. 🫧 评价

- todo

## 3. 🤔 Vue 3 在性能方面做了哪些提升？

Vue 3 相比 Vue 2 在性能方面做了全面的重构和优化，主要体现在响应式系统、虚拟 DOM、编译器优化和 Tree-shaking 四个维度。

第一，响应式系统从 Object.defineProperty 升级为 Proxy。Vue 2 使用 Object.defineProperty 来实现响应式，这有几个固有缺陷：无法检测属性的新增和删除（需要 Vue.set/Vue.delete），无法直接监听数组的索引和长度变化，初始化时需要递归遍历整个对象进行劫持。Vue 3 使用 ES6 Proxy 重写了整个响应式系统，从根本上解决了这些问题：

```js
// Vue 2 响应式的局限
export default {
  data() {
    return { obj: { a: 1 }, arr: [1, 2, 3] }
  },
  methods: {
    update() {
      // 以下操作在 Vue 2 中不会触发更新
      this.obj.newProp = 'hello' // 新增属性，需用 Vue.set
      this.arr[0] = 100 // 直接修改索引，需用 Vue.set
      this.arr.length = 1 // 修改长度，无法检测
    },
  },
}

// Vue 3 响应式，全部自动追踪
const state = reactive({ obj: { a: 1 }, arr: [1, 2, 3] })
state.obj.newProp = 'hello' // 自动响应
state.arr[0] = 100 // 自动响应
state.arr.length = 1 // 自动响应
```

Proxy 的另一个优势是惰性响应式：只有在真正访问到嵌套对象时才会对其进行代理，避免了初始化时的递归开销。

第二，虚拟 DOM 重写。Vue 3 的虚拟 DOM 实现经过完全重写，主要优化包括：

- 静态提升（Static Hoisting）：将不会变化的静态节点提升到渲染函数外部，只创建一次，后续渲染直接复用。
- Patch Flags：编译时为动态节点打上标记（如 TEXT = 1 表示只有文本是动态的），diff 时只检查标记对应的部分，跳过静态对比。
- Block Tree：将模板按照动态节点的分布划分为 Block，收集所有动态后代节点，diff 时直接遍历动态节点数组，跳过静态子树。

```html
<!-- 假设模板如下 -->
<div>
  <h1>静态标题</h1>
  <p>{{ message }}</p>
  <span :class="cls">{{ text }}</span>
</div>
```

编译后，h1 会被静态提升，p 只标记 TEXT flag，span 标记 TEXT | CLASS flag。Diff 时只需处理 p 和 span 两个动态节点。

第三，编译器优化。Vue 3 的编译器会分析模板，生成更高效的渲染代码：

- 事件处理函数缓存（Cache Handlers）：内联事件处理函数会被缓存，避免每次渲染时创建新的函数实例，从而避免子组件的不必要更新。
- SSR 优化：SSR 模式下，静态内容会被编译为字符串拼接，跳过虚拟 DOM 层。

第四，Tree-shaking 支持。Vue 3 将全局 API 改为按需导入的方式，未使用的功能不会被打包进最终产物：

```js
// Vue 2 —— 所有功能都在 Vue 对象上
import Vue from 'vue'
Vue.nextTick(() => {})

// Vue 3 —— 按需导入
import { nextTick, reactive, computed } from 'vue'
nextTick(() => {})
```

这意味着如果你没用到 Transition、KeepAlive 等内置组件，它们的代码不会出现在最终的打包产物中。Vue 3 的最小包体积约 10KB（gzip），而 Vue 2 约 23KB。

## 4. 🤔 组合式 API 和选项式 API 有什么区别？如何选择？

选项式 API（Options API）是 Vue 2 以来的经典写法，通过 data、methods、computed、watch 等选项来组织代码。组合式 API（Composition API）是 Vue 3 引入的新范式，通过 setup 函数和响应式 API 来组织代码。

选项式 API 的写法：

```js
export default {
  data() {
    return {
      count: 0,
      user: null,
      isLoading: false,
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    },
  },
  watch: {
    count(newVal) {
      console.log('count 变化：', newVal)
    },
  },
  methods: {
    increment() {
      this.count++
    },
    async fetchUser(id) {
      this.isLoading = true
      this.user = await fetch(`/api/users/${id}`).then((r) => r.json())
      this.isLoading = false
    },
  },
  mounted() {
    this.fetchUser(1)
  },
}
```

组合式 API 的写法：

```html
<script setup>
  import { ref, computed, watch, onMounted } from 'vue'

  const count = ref(0)
  const user = ref(null)
  const isLoading = ref(false)

  const doubleCount = computed(() => count.value * 2)

  watch(count, (newVal) => {
    console.log('count 变化：', newVal)
  })

  function increment() {
    count.value++
  }

  async function fetchUser(id) {
    isLoading.value = true
    user.value = await fetch(`/api/users/${id}`).then((r) => r.json())
    isLoading.value = false
  }

  onMounted(() => {
    fetchUser(1)
  })
</script>
```

两种 API 的核心区别：

第一，代码组织方式不同。选项式 API 按照选项类型（data / methods / computed）来组织代码，当组件逻辑复杂时，同一个功能的代码会被分散到不同的选项中，需要上下跳转阅读。组合式 API 允许按照逻辑关注点来组织代码，相关的状态、计算属性、方法、监听器可以放在一起。

第二，逻辑复用方式不同。选项式 API 主要通过 Mixins 来复用逻辑，但 Mixins 存在命名冲突、数据来源不清晰等问题。组合式 API 通过 Composables（组合式函数）来复用逻辑，返回值明确，不会产生命名冲突：

```js
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}

// 在组件中使用
const { x, y } = useMouse()
```

第三，TypeScript 支持。组合式 API 天然对 TypeScript 友好，类型推导更准确，不需要额外的类型声明。选项式 API 中 this 的类型推导比较复杂。

如何选择：如果项目简单、团队中有 Vue 2 经验丰富的成员，选项式 API 依然可以使用。如果项目复杂、需要逻辑复用、使用 TypeScript，推荐使用组合式 API。Vue 3 官方的态度是两者并存，但更推荐组合式 API。

## 5. 🤔 Vue 3 的 TypeScript 支持改进了什么？

Vue 3 从源码层面使用 TypeScript 重写，为开发者提供了更好的类型支持体验。

Vue 2 中使用 TypeScript 的痛点：需要额外安装 vue-class-component 和 vue-property-decorator 等库，使用装饰器语法来获得类型支持，this 上下文的类型推导不完善，模板中的类型检查几乎为零。

Vue 3 的 TypeScript 支持改进：

第一，defineComponent 提供了类型上下文：

```ts
import { defineComponent, PropType } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User>,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  // this 的类型自动推导
  computed: {
    userName(): string {
      return this.user.name // 推导出 User 类型
    },
  },
})
```

第二，script setup 中的类型标注更直观：

```html
<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface Todo {
    id: number
    text: string
    done: boolean
  }

  // ref 自动推导类型
  const count = ref(0) // Ref<number>
  const message = ref('hello') // Ref<string>

  // 显式指定类型
  const todos = ref<Todo[]>([]) // Ref<Todo[]>
  const selected = ref<Todo | null>(null) // Ref<Todo | null>

  // computed 自动推导返回类型
  const activeTodos = computed(() => {
    return todos.value.filter((t) => !t.done) // ComputedRef<Todo[]>
  })

  // Props 类型定义
  const props = defineProps<{
    title: string
    count?: number
    items: Todo[]
  }>()

  // 带默认值的 Props 类型定义
  const propsWithDefaults = withDefaults(
    defineProps<{
      title: string
      count?: number
    }>(),
    {
      count: 0,
    },
  )

  // Emits 类型定义
  const emit = defineEmits<{
    (e: 'update', value: string): void
    (e: 'delete', id: number): void
  }>()

  // 或者使用 3.3+ 更简洁的语法
  const emit2 = defineEmits<{
    update: [value: string]
    delete: [id: number]
  }>()
</script>
```

第三，模板中的类型检查。配合 Volar（现在是 Vue - Official 扩展），模板中的表达式也可以获得完整的类型检查：

```html
<template>
  <!-- Volar 会检查 user.name 是否存在 -->
  <p>{{ user.name }}</p>

  <!-- 事件参数类型推导 -->
  <input @input="handleInput" />

  <!-- v-for 中的类型推导 -->
  <div v-for="item in items" :key="item.id">{{ item.text }}</div>
</template>
```

第四，泛型组件（Vue 3.3+）：

```html
<script setup lang="ts" generic="T extends { id: number }">
  defineProps<{
    items: T[]
    selected: T
  }>()

  defineEmits<{
    select: [item: T]
  }>()
</script>
```

## 6. 🤔 Fragment、Teleport 和 Suspense 分别解决什么问题？

这三个是 Vue 3 新增的内置功能，分别解决模板结构限制、DOM 渲染位置和异步组件加载的问题。

Fragment 解决了 Vue 2 中模板必须有且只有一个根元素的限制。在 Vue 2 中，以下代码会报错：

```html
<!-- Vue 2 —— 必须有单一根元素，以下会报错 -->
<template>
  <h1>标题</h1>
  <p>内容</p>
</template>

<!-- Vue 2 必须包一层 -->
<template>
  <div>
    <h1>标题</h1>
    <p>内容</p>
  </div>
</template>
```

Vue 3 支持多根节点，编译器会自动创建一个 Fragment（虚拟的包裹节点，不会渲染为实际 DOM）：

```html
<!-- Vue 3 —— 多根节点，无需额外包裹 -->
<template>
  <h1>标题</h1>
  <p>内容</p>
  <footer>页脚</footer>
</template>
```

这在编写表格行组件、列表项组件等场景中特别有用，避免了多余的 DOM 嵌套。

Teleport 允许将组件的 DOM 渲染到指定的目标元素中，而不是组件的父级 DOM 结构中。这对于模态框、通知、工具提示等需要脱离正常文档流的 UI 组件非常有用。

没有 Teleport 时，模态框等组件的 DOM 嵌套在父组件内部，可能会受到父组件的 CSS（overflow: hidden、z-index 层叠上下文）影响，出现样式问题。

```html
<template>
  <div class="component">
    <button @click="showModal = true">打开模态框</button>

    <!-- 将模态框渲染到 body 末尾 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <h2>模态框标题</h2>
          <p>模态框内容</p>
          <button @click="showModal = false">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const showModal = ref(false)
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
</style>
```

Teleport 的 to 属性接受 CSS 选择器或 DOM 元素作为目标。虽然 DOM 被移动了，但组件的逻辑关系不变，事件、props、状态管理等都正常工作。

Suspense 是一个内置组件，用于协调异步组件的加载状态。它可以在异步组件加载完成前显示后备内容（如 loading 状态）：

```html
<template>
  <Suspense>
    <!-- 主要内容：异步组件 -->
    <template #default>
      <AsyncDashboard />
    </template>

    <!-- 加载中显示的后备内容 -->
    <template #fallback>
      <div class="loading">
        <p>加载中……</p>
      </div>
    </template>
  </Suspense>
</template>

<script setup>
  import { defineAsyncComponent } from 'vue'

  const AsyncDashboard = defineAsyncComponent(
    () => import('./components/Dashboard.vue'),
  )
</script>
```

Suspense 与 async setup 配合使用特别强大。当组件的 setup 函数是异步的，Suspense 会等待其完成后再渲染：

```html
<!-- Dashboard.vue -->
<script setup>
  // 使用顶层 await（需要配合 Suspense）
  const userData = await fetch('/api/user').then((r) => r.json())
  const stats = await fetch('/api/stats').then((r) => r.json())
</script>

<template>
  <div>
    <h1>欢迎, {{ userData.name }}</h1>
    <StatsPanel :data="stats" />
  </div>
</template>
```

```html
<!-- 父组件 -->
<template>
  <Suspense @pending="onPending" @resolve="onResolve" @fallback="onFallback">
    <template #default>
      <Dashboard />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

需要注意的是，Suspense 在 Vue 3.x 中仍然是实验性功能，API 可能会有变化。
