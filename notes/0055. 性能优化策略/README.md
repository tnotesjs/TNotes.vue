# [0055. 性能优化策略](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0055.%20%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%E7%AD%96%E7%95%A5)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何对响应式数据进行精细化控制以提升性能？](#3--如何对响应式数据进行精细化控制以提升性能)
- [4. 🤔 虚拟滚动如何优化大数据列表渲染？](#4--虚拟滚动如何优化大数据列表渲染)
- [5. 🤔 异步组件和代码分割如何提升应用加载性能？](#5--异步组件和代码分割如何提升应用加载性能)
- [6. 🤔 如何避免 Vue 组件不必要的重新渲染？](#6--如何避免-vue-组件不必要的重新渲染)
- [7. 🤔 keep-alive 如何缓存组件？有哪些配置选项？](#7--keep-alive-如何缓存组件有哪些配置选项)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 响应式数据的精细化控制
- 虚拟滚动与大数据列表优化
- 异步组件与代码分割
- 避免不必要的重新渲染
- 使用 keep-alive 缓存组件

## 2. 🫧 评价

- todo

## 3. 🤔 如何对响应式数据进行精细化控制以提升性能？

响应式系统是 Vue 的核心，但不恰当的使用会导致不必要的性能开销。精细化控制响应式数据的关键是：避免过度响应式、减少不必要的依赖追踪和更新触发。

第一，使用 shallowRef 和 shallowReactive 避免深层响应式。当你有一个大型对象，且只需要在整体替换时触发更新时，使用浅层响应式：

```js
import { shallowRef, shallowReactive, triggerRef } from 'vue'

// 大型数据列表：只在整体替换时触发更新
const bigList = shallowRef([])

async function loadData() {
  const data = await fetchLargeDataset()
  bigList.value = data // 触发更新
  // bigList.value[0].name = 'xxx'  // 不会触发更新
}

// 第三方库实例不需要深层响应式
const mapInstance = shallowRef(null)
const chartInstance = shallowRef(null)
```

第二，使用 markRaw 标记不需要响应式的对象。某些对象（如第三方类实例、大型静态数据）不需要被 Vue 追踪：

```js
import { reactive, markRaw } from 'vue'

class HeavyProcessor {
  constructor() {
    /* 复杂初始化 */
  }
  process() {
    /* ... */
  }
}

const state = reactive({
  // markRaw 标记的对象不会被转为响应式代理
  processor: markRaw(new HeavyProcessor()),

  // 大型静态配置
  config: markRaw({
    // 几百个配置项...
  }),

  // 正常的响应式数据
  count: 0,
})
```

第三，合理使用 computed 缓存。computed 只有在依赖变化时才重新计算，而方法每次渲染都会执行：

```html
<script setup>
  import { ref, computed } from 'vue'

  const items = ref([
    /* 大量数据 */
  ])
  const filter = ref('')

  // 使用 computed 缓存过滤结果
  const filteredItems = computed(() => {
    return items.value.filter((item) => item.name.includes(filter.value))
  })

  // 反面示例：在模板中直接调用方法
  // function getFilteredItems() {
  //   return items.value.filter(...)  // 每次渲染都执行
  // }
</script>

<template>
  <!-- 推荐 -->
  <div v-for="item in filteredItems" :key="item.id">{{ item.name }}</div>

  <!-- 不推荐 -->
  <!-- <div v-for="item in getFilteredItems()" :key="item.id">{{ item.name }}</div> -->
</template>
```

第四，避免在模板中进行复杂计算：

```html
<template>
  <!-- 不推荐：每次渲染都会执行 -->
  <p>
    {{ items.filter((i) => i.active).sort((a, b) =>
    a.name.localeCompare(b.name)) .length }}
  </p>

  <!-- 推荐：使用 computed -->
  <p>{{ activeItemCount }}</p>
</template>
```

## 4. 🤔 虚拟滚动如何优化大数据列表渲染？

当需要渲染大量列表数据（数千甚至数万条）时，直接渲染所有 DOM 节点会导致严重的性能问题——内存占用高、初始渲染慢、滚动卡顿。虚拟滚动的核心思想是只渲染可视区域内的 DOM 节点。

虚拟滚动的原理：

```
完整列表（10000 项）：
┌─────────────────┐
│ 不可见（跳过）   │ <- 计算高度占位
├─────────────────┤
│ 可见区域         │ <- 只渲染这些 DOM
│ (约 20-30 项)    │
├─────────────────┤
│ 不可见（跳过）   │ <- 计算高度占位
└─────────────────┘
```

使用 vue-virtual-scroller 库实现：

```bash
npm install vue-virtual-scroller
```

```html
<template>
  <RecycleScroller
    class="scroller"
    :items="items"
    :item-size="50"
    key-field="id"
    v-slot="{ item, index }"
  >
    <div class="item">
      <span>{{ index }}. {{ item.name }}</span>
      <span>{{ item.email }}</span>
    </div>
  </RecycleScroller>
</template>

<script setup>
  import { RecycleScroller } from 'vue-virtual-scroller'
  import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

  // 即使有 10 万条数据也不会卡顿
  const items = ref(generateItems(100000))
</script>

<style>
  .scroller {
    height: 400px;
  }
  .item {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #eee;
  }
</style>
```

简化版虚拟滚动的实现原理：

```html
<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'

  const props = defineProps({
    items: { type: Array, required: true },
    itemHeight: { type: Number, default: 40 },
    containerHeight: { type: Number, default: 400 },
  })

  const scrollTop = ref(0)
  const containerRef = ref(null)

  // 计算可见范围
  const visibleCount = computed(
    () => Math.ceil(props.containerHeight / props.itemHeight) + 2, // buffer
  )

  const startIndex = computed(() =>
    Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - 1),
  )

  const endIndex = computed(() =>
    Math.min(props.items.length, startIndex.value + visibleCount.value),
  )

  const visibleItems = computed(() =>
    props.items.slice(startIndex.value, endIndex.value),
  )

  const totalHeight = computed(() => props.items.length * props.itemHeight)

  const offsetY = computed(() => startIndex.value * props.itemHeight)

  function onScroll(e) {
    scrollTop.value = e.target.scrollTop
  }
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :style="{ height: containerHeight + 'px', overflow: 'auto' }"
    @scroll="onScroll"
  >
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="item in visibleItems"
          :key="item.id"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>
```

其他大数据列表优化方案：分页加载（最简单）、无限滚动（滚动到底部加载更多）、时间分片（使用 requestAnimationFrame 分批渲染）。

## 5. 🤔 异步组件和代码分割如何提升应用加载性能？

异步组件允许你将组件的代码分割为单独的 chunk，只在需要时才加载，从而减小初始包体积、加快首屏加载速度。

使用 defineAsyncComponent 创建异步组件：

```js
import { defineAsyncComponent } from 'vue'

// 基本用法
const AsyncComponent = defineAsyncComponent(
  () => import('./components/HeavyComponent.vue'),
)

// 完整配置
const AsyncComponentWithOptions = defineAsyncComponent({
  loader: () => import('./components/HeavyComponent.vue'),

  // 加载中显示的组件
  loadingComponent: LoadingSpinner,

  // 加载失败显示的组件
  errorComponent: ErrorDisplay,

  // 显示加载组件前的延迟（避免闪烁），默认 200ms
  delay: 200,

  // 超时时间，超时后显示错误组件
  timeout: 10000,

  // 是否可挂起（Suspense 相关）
  suspensible: true,

  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      retry() // 自动重试
    } else {
      fail()
    }
  },
})
```

路由级别的代码分割——最常见和最有效的方式：

```ts
// router/index.ts
const routes = [
  {
    path: '/',
    // 首页可以直接导入（首屏需要）
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue'),
    // Vite 会自动将其分割为独立 chunk
  },
  {
    path: '/admin',
    component: () => import('../views/Admin.vue'),
    children: [
      {
        path: 'users',
        component: () => import('../views/admin/Users.vue'),
      },
      {
        path: 'settings',
        component: () => import('../views/admin/Settings.vue'),
      },
    ],
  },
]
```

条件加载——只在需要时才加载组件：

```html
<script setup>
  import { defineAsyncComponent, ref } from 'vue'

  const showChart = ref(false)

  // 只有当 showChart 为 true 时才会加载 Chart 组件的代码
  const HeavyChart = defineAsyncComponent(
    () => import('./components/HeavyChart.vue'),
  )
</script>

<template>
  <button @click="showChart = true">查看图表</button>
  <HeavyChart v-if="showChart" :data="chartData" />
</template>
```

预加载策略——在用户可能访问前提前加载：

```js
// 鼠标悬停时预加载
const AdminPanel = defineAsyncComponent(() => import('./AdminPanel.vue'))

function preloadAdmin() {
  // 触发加载但不渲染
  import('./AdminPanel.vue')
}
```

```html
<template>
  <router-link to="/admin" @mouseenter="preloadAdmin">管理后台</router-link>
</template>
```

## 6. 🤔 如何避免 Vue 组件不必要的重新渲染？

Vue 的响应式系统会自动追踪依赖并在数据变化时触发组件更新。但如果使用不当，可能会导致不必要的重新渲染，影响性能。

第一，使用 v-once 标记静态内容：

```html
<template>
  <!-- 只渲染一次，后续更新会跳过 -->
  <div v-once>
    <h1>{{ title }}</h1>
    <p>这段内容不会再更新</p>
  </div>
</template>
```

第二，使用 v-memo 缓存条件渲染结果（Vue 3.2+）：

```html
<template>
  <!-- 只有当 item.id 或 selected 变化时才重新渲染 -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id === selected]">
    <p>ID: {{ item.id }} - 选中: {{ item.id === selected }}</p>
    <!-- 复杂的子组件 -->
    <HeavyComponent :data="item" />
  </div>
</template>
```

第三，避免内联对象和函数。每次渲染都会创建新的对象/函数引用，导致子组件误判 props 变化而重新渲染：

```html
<script setup>
  import { computed } from 'vue'

  // 不推荐：每次渲染创建新对象
  // <ChildComponent :style="{ color: 'red' }" />
  // <ChildComponent :handler="() => doSomething()" />

  // 推荐：使用稳定的引用
  const childStyle = computed(() => ({ color: theme.value }))
  function handleClick() {
    /* ... */
  }
</script>

<template>
  <ChildComponent :style="childStyle" :handler="handleClick" />
</template>
```

第四，合理使用 key 强制重新创建组件：

```html
<template>
  <!-- 切换用户时，强制重新创建组件（重置所有内部状态） -->
  <UserProfile :key="userId" :user-id="userId" />

  <!-- v-for 中始终使用唯一的 key -->
  <div v-for="item in items" :key="item.id">{{ item.name }}</div>
</template>
```

第五，使用 defineComponent 的 emits 选项明确声明事件，避免事件被当作原生 DOM 事件和 $attrs fallthrough 处理。

## 7. 🤔 keep-alive 如何缓存组件？有哪些配置选项？

keep-alive 是 Vue 内置组件，用于缓存动态组件的实例，避免重复创建和销毁。缓存后的组件会保留其内部状态（表单数据、滚动位置等）。

```html
<template>
  <!-- 基本使用：缓存动态组件 -->
  <keep-alive>
    <component :is="currentTab" />
  </keep-alive>

  <!-- 配合路由使用 -->
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

keep-alive 的配置选项：

```html
<template>
  <!-- include：只缓存匹配的组件 -->
  <keep-alive include="HomeView,AboutView">
    <component :is="currentView" />
  </keep-alive>

  <!-- 正则匹配 -->
  <keep-alive :include="/^Tab/">
    <component :is="currentTab" />
  </keep-alive>

  <!-- 数组形式 -->
  <keep-alive :include="['HomeView', 'AboutView']">
    <component :is="currentView" />
  </keep-alive>

  <!-- exclude：不缓存匹配的组件 -->
  <keep-alive exclude="SettingsView">
    <component :is="currentView" />
  </keep-alive>

  <!-- max：最大缓存数量（LRU 策略） -->
  <keep-alive :max="10">
    <component :is="currentView" />
  </keep-alive>
</template>
```

缓存组件的生命周期钩子——activated 和 deactivated：

```html
<script setup>
  import { onActivated, onDeactivated, ref } from 'vue'

  const scrollPosition = ref(0)

  // 组件被激活（从缓存中恢复显示）
  onActivated(() => {
    console.log('组件被激活')
    // 恢复滚动位置
    window.scrollTo(0, scrollPosition.value)
    // 可以在这里刷新数据
  })

  // 组件被停用（切换到其他组件，当前组件进入缓存）
  onDeactivated(() => {
    console.log('组件进入缓存')
    // 保存滚动位置
    scrollPosition.value = window.scrollY
  })
</script>
```

配合路由的高级用法——根据路由 meta 决定是否缓存：

```ts
// router/index.ts
const routes = [
  {
    path: '/list',
    component: () => import('../views/ListView.vue'),
    meta: { keepAlive: true }, // 需要缓存
  },
  {
    path: '/detail/:id',
    component: () => import('../views/DetailView.vue'),
    meta: { keepAlive: false }, // 不需要缓存
  },
]
```

```html
<!-- App.vue -->
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive>
      <component
        :is="Component"
        v-if="route.meta.keepAlive"
        :key="route.path"
      />
    </keep-alive>
    <component :is="Component" v-if="!route.meta.keepAlive" :key="route.path" />
  </router-view>
</template>
```

keep-alive 的注意事项：缓存组件会占用内存，使用 max 限制缓存数量。include/exclude 匹配的是组件的 name 选项，确保组件声明了 name（script setup 中使用 defineOptions({ name: 'xxx' })）。缓存数据可能过时，在 onActivated 中根据需要刷新数据。
