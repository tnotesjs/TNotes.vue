# [0035. 动态组件](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0035.%20%E5%8A%A8%E6%80%81%E7%BB%84%E4%BB%B6)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 `<component>` 是什么？有什么用？](#3--component-是什么有什么用)
- [4. 💻 demos.1 - 基本用法：标签页切换](#4--demos1---基本用法标签页切换)
- [5. 💻 demos.2 - 动态 HTML 元素](#5--demos2---动态-html-元素)
- [6. 💻 demos.3 - 传递 props 和监听事件](#6--demos3---传递-props-和监听事件)
- [7. 💻 demos.4 - `<component :is>` 对比 `v-if`](#7--demos4---component-is-对比-v-if)
- [8. 🤔 keep-alive 组件缓存的原理和用法是什么？](#8--keep-alive-组件缓存的原理和用法是什么)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 动态组件 component 标签与 is 属性
- keep-alive 组件缓存

## 2. 🫧 评价

- todo

## 3. 🤔 `<component>` 是什么？有什么用？

::: tip

Vue 官方文档对它的定义：一个用于渲染动态组件或元素的“元组件”。

:::

`<component>` 是 Vue 内置的一个特殊元素（官方文档中归类为"内置特殊元素"），它不是常规组件，而是一个「元组件」 => 用来渲染别的组件的组件。

它的核心能力 => 通过 `is` 属性动态决定渲染什么。

你可以把它理解成一个“占位符”，最终渲染成什么组件，取决于 `is` 属性绑定的值。当 `is` 的值发生变化时，旧组件会被销毁，新组件会被创建 => 这正是「动态组件」这个概念的含义。

`is` 属性可以接收以下类型的值：

```html
<template>
  <!-- 1. 组件对象（最常用） -->
  <component :is="currentComponent" />

  <!-- 2. 被注册的组件名字符串（需要全局注册） -->
  <component :is="'MyComponent'" />

  <!-- 3. HTML 原生元素名字符串 -->
  <component :is="'div'">渲染为 div</component>
  <component :is="tag">动态标签</component>
</template>

<script setup>
  import { ref } from 'vue'
  const tag = ref('h1') // 可以动态改变渲染的 HTML 标签
</script>
```

典型应用场景包括标签页切换、多步骤表单、根据配置动态渲染不同面板等——凡是"同一个位置需要根据条件渲染不同组件"的地方，都可以用它。

## 4. 💻 demos.1 - 基本用法：标签页切换

这是动态组件最典型的场景——根据当前选中的标签，在同一个位置渲染不同的组件：

::: code-group

```html [App.vue]
<script setup>
  import { ref, computed } from 'vue'
  import HomeTab from './HomeTab.vue'
  import ProfileTab from './ProfileTab.vue'
  import SettingsTab from './SettingsTab.vue'

  const currentTab = ref('home')

  const tabs = {
    home: HomeTab,
    profile: ProfileTab,
    settings: SettingsTab,
  }

  const labels = {
    home: '首页',
    profile: '个人主页',
    settings: '设置',
  }

  const currentComponent = computed(() => tabs[currentTab.value])
</script>

<template>
  <div>
    <button
      v-for="(_, name) in tabs"
      :key="name"
      :style="{ fontWeight: currentTab === name ? 'bold' : 'normal' }"
      @click="currentTab = name"
    >
      {{ labels[name] }}
    </button>
  </div>
  <p>当前标签：{{ labels[currentTab] }}</p>
  <component :is="currentComponent" />
</template>
```

```html [HomeTab.vue]
<template>
  <p>这是首页内容</p>
</template>
```

```html [ProfileTab.vue]
<template>
  <p>这是个人主页内容</p>
</template>
```

```html [SettingsTab.vue]
<template>
  <p>这是设置页面内容</p>
</template>
```

:::

切换不同的 tab：

::: swiper

![首页](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-17-29-38.png)

![个人主页](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-17-29-48.png)

![设置](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-17-29-58.png)

:::

核心逻辑只有一步：`const currentComponent = computed(() => tabs[currentTab.value])`，这会把 `tabs` 映射表中对应的组件对象取出来，交给 `<component :is>` 渲染。切换标签就是切换 `currentTab` 的值，Vue 会自动销毁旧组件、创建新组件。

## 5. 💻 demos.2 - 动态 HTML 元素

`is` 属性除了接收组件对象，还可以接收 HTML 元素名字符串。同一个位置可以渲染成不同的原生标签：

::: code-group

```html [App.vue]
<script setup>
  import { ref } from 'vue'

  const tag = ref('p')

  const options = ['p', 'code', 'h3']
</script>

<template>
  <div>
    <label>选择元素：</label>
    <select v-model="tag">
      <option v-for="el in options" :key="el" :value="el">
        {{ '<' + el + '>' }}
      </option>
    </select>
  </div>

  <p>渲染结果：</p>
  <component :is="tag">我是一个 &lt;{{ tag }}&gt; 元素</component>
</template>
```

:::

最终渲染结果：

::: swiper

![p](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-17-32-40.png)

![code](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-17-33-09.png)

![h3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-17-33-18.png)

:::

切换下拉框，同一个 `<component>` 会渲染成不同的 HTML 标签。

- `<component :is="'p'">` 等价于 `<p>`
- `<component :is="'code'">` 等价于 `<code>`
- `<component :is="'h3'">` 等价于 `<h3>`

## 6. 💻 demos.3 - 传递 props 和监听事件

动态组件和普通组件一样，可以传递 props 和监听事件。下面这个示例模拟了一个通知系统，支持多种通知类型：

::: code-group

```html [App.vue]
<script setup>
  import { ref, computed } from 'vue'
  import SuccessNotice from './SuccessNotice.vue'
  import WarningNotice from './WarningNotice.vue'
  import ErrorNotice from './ErrorNotice.vue'

  const typeMap = {
    success: SuccessNotice,
    warning: WarningNotice,
    error: ErrorNotice,
  }

  const noticeType = ref('success')
  const message = ref('操作成功')

  const currentNotice = computed(() => typeMap[noticeType.value])

  function onDismiss() {
    console.log('通知已关闭')
  }
</script>

<template>
  <div>
    <select v-model="noticeType">
      <option value="success">success</option>
      <option value="warning">warning</option>
      <option value="error">error</option>
    </select>
    <input v-model="message" placeholder="输入通知内容" />
  </div>

  <component :is="currentNotice" :message="message" @dismiss="onDismiss" />
</template>
```

```html [SuccessNotice.vue]
<script setup>
  defineProps(['message'])
  const emit = defineEmits(['dismiss'])
</script>

<template>
  <div>
    <span>✅ {{ message }}</span>
    <button @click="emit('dismiss')">关闭</button>
  </div>
</template>
```

```html [WarningNotice.vue]
<script setup>
  defineProps(['message'])
  const emit = defineEmits(['dismiss'])
</script>

<template>
  <div>
    <span>⚠️ {{ message }}</span>
    <button @click="emit('dismiss')">关闭</button>
  </div>
</template>
```

```html [ErrorNotice.vue]
<script setup>
  defineProps(['message'])
  const emit = defineEmits(['dismiss'])
</script>

<template>
  <div>
    <span>❌ {{ message }}</span>
    <button @click="emit('dismiss')">关闭</button>
  </div>
</template>
```

:::

`:message` 和 `@dismiss` 是写在 `<component>` 上的，但 Vue 会自动透传给当前实际渲染的子组件——无论切换到哪个通知类型，props 和事件都会正确传递。

## 7. 💻 demos.4 - `<component :is>` 对比 `v-if`

同为条件渲染，两者的核心区别：

```html
<!-- v-if：所有分支同时写在模板中 -->
<HomeTab v-if="currentTab === 'home'" />
<ProfileTab v-if="currentTab === 'profile'" />
<SettingsTab v-if="currentTab === 'settings'" />

<!-- component：只需一行，组件名由数据驱动 -->
<component :is="currentComponent" />
```

当可选组件数量较多或组件列表是动态的（比如从后端配置获取），`<component :is>` 比一长串 `v-if` / `v-else-if` 更简洁、更易维护。

需要注意：每次切换，旧组件都会被**完全销毁**，新组件会**重新创建**，所有状态（表单输入、滚动位置等）都会丢失。如果需要保持状态，请看下一节的 `<KeepAlive>`。

## 8. 🤔 keep-alive 组件缓存的原理和用法是什么？

keep-alive 是 Vue 的一个内置抽象组件，用于缓存动态组件的实例而不是销毁它们。当组件在 keep-alive 中被切换时，它会被"停用"而非"销毁"，其 DOM 元素和组件状态都会被保留在内存中。当再次激活时，之前的状态会完整恢复。

基本用法：

```html
<template>
  <div>
    <button @click="currentView = 'FormA'">表单 A</button>
    <button @click="currentView = 'FormB'">表单 B</button>

    <!-- 不使用 keep-alive：切换时组件被销毁，输入内容丢失 -->
    <component :is="views[currentView]" />

    <!-- 使用 keep-alive：切换时组件被缓存，输入内容保持 -->
    <KeepAlive>
      <component :is="views[currentView]" />
    </KeepAlive>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import FormA from './FormA.vue'
  import FormB from './FormB.vue'

  const currentView = ref('FormA')
  const views = { FormA, FormB }
</script>
```

keep-alive 提供了三个重要的 props 来控制缓存行为：

```html
<template>
  <!-- include：只缓存名字匹配的组件 -->
  <KeepAlive include="FormA,FormB">
    <component :is="currentComponent" />
  </KeepAlive>

  <!-- exclude：不缓存名字匹配的组件 -->
  <KeepAlive exclude="HeavyComponent">
    <component :is="currentComponent" />
  </KeepAlive>

  <!-- max：限制最大缓存实例数 -->
  <KeepAlive :max="5">
    <component :is="currentComponent" />
  </KeepAlive>

  <!-- include 也支持正则和数组 -->
  <KeepAlive :include="/^(Form|Editor)/">
    <component :is="currentComponent" />
  </KeepAlive>

  <KeepAlive :include="['FormA', 'FormB', 'Dashboard']">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

include 和 exclude 匹配的是组件的 name 选项。在 `<script setup>` 中，组件名默认从文件名推断。如果需要显式指定，可以使用一个额外的 `<script>` 块：

```html
<script>
  export default {
    name: 'FormA',
  }
</script>

<script setup>
  // 组合式 API 逻辑
</script>
```

当 max 被设置时，如果缓存的组件实例数超过限制，最久没有被访问的缓存实例会被销毁，为新实例腾出空间。这类似于 LRU（Least Recently Used）缓存策略。

keep-alive 缓存的组件拥有两个独特的生命周期钩子：onActivated 和 onDeactivated：

```html
<script setup>
  import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'

  // 首次挂载和每次从缓存中被激活时调用
  onActivated(() => {
    console.log('组件被激活')
    // 适合进行数据刷新、恢复计时器等操作
    startPolling()
  })

  // 从 DOM 上移除进入缓存时调用
  onDeactivated(() => {
    console.log('组件被停用')
    // 适合停止计时器、取消请求等清理操作
    stopPolling()
  })

  // onMounted 只在首次插入 DOM 时调用一次
  onMounted(() => {
    console.log('组件首次挂载')
  })

  // 在 keep-alive 中，onUnmounted 只在组件从缓存中被移除时调用
  onUnmounted(() => {
    console.log('组件被真正销毁（从缓存中移除）')
  })
</script>
```

在实际应用中，keep-alive 常用于以下场景：多标签页应用中缓存每个标签页的状态；列表-详情页面之间切换时，保持列表的滚动位置和搜索条件；复杂表单分步填写时，保持每步的输入状态。

在 Vue Router 中配合 keep-alive 使用：

```html
<template>
  <router-view v-slot="{ Component }">
    <KeepAlive :include="cachedViews">
      <component :is="Component" :key="$route.fullPath" />
    </KeepAlive>
  </router-view>
</template>

<script setup>
  import { ref } from 'vue'

  // 动态管理需要缓存的页面
  const cachedViews = ref(['Home', 'UserList'])
</script>
```

## 9. 🔗 引用

- [Vuejs 官方文档 - 内置特殊元素 - component][1]

[1]: https://cn.vuejs.org/api/built-in-special-elements.html#component
