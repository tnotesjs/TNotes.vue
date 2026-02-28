# [0054. 渲染函数与 JSX](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0054.%20%E6%B8%B2%E6%9F%93%E5%87%BD%E6%95%B0%E4%B8%8E%20JSX)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 渲染函数 h() 的作用是什么？如何使用？](#3--渲染函数-h-的作用是什么如何使用)
- [4. 🤔 什么是函数式组件？如何创建和使用？](#4--什么是函数式组件如何创建和使用)
- [5. 🤔 如何在 Vue 中使用 JSX？](#5--如何在-vue-中使用-jsx)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 渲染函数 h() 的使用
- 函数式组件
- 在 Vue 中使用 JSX

## 2. 🫧 评价

- todo

## 3. 🤔 渲染函数 h() 的作用是什么？如何使用？

Vue 组件通常使用模板（template）来描述 UI 结构，但模板在底层会被编译为渲染函数。h() 函数允许你直接创建虚拟 DOM 节点（VNode），跳过模板编译步骤，在需要完全的 JavaScript 编程能力时提供更大的灵活性。

h() 是 hyperscript 的缩写，意思是"生成 HTML 的 JavaScript"。它接收三个参数：类型、属性、子节点。

```js
import { h } from 'vue'

// h(type, props?, children?)

// 创建原生 DOM 元素
h('div', { class: 'container' }, 'Hello World')

// 创建带属性的元素
h(
  'a',
  {
    href: 'https://vuejs.org',
    target: '_blank',
    onClick: () => console.log('clicked'),
  },
  '访问 Vue 官网',
)

// 嵌套子节点
h('div', { class: 'card' }, [
  h('h2', null, '标题'),
  h('p', null, '正文内容'),
  h('button', { onClick: handleClick }, '点击'),
])
```

在组件中使用渲染函数替代 template：

```js
import { h, ref, defineComponent } from 'vue'

// 选项式 API
export default defineComponent({
  props: {
    level: {
      type: Number,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () => {
      // 动态标题组件：根据 level 渲染 h1-h6
      const tag = `h${props.level}`
      return h(tag, {}, slots.default?.())
    }
  },
})
```

```html
<!-- 使用 -->
<DynamicHeading :level="2">这是 h2 标题</DynamicHeading>
```

使用渲染函数对比模板——当模板难以表达的场景：

```js
// 场景：根据数据动态生成不确定层级的菜单树
// 用模板需要递归组件，用渲染函数更直接
export const TreeMenu = defineComponent({
  props: {
    items: Array,
  },
  setup(props) {
    function renderItem(item) {
      if (item.children?.length) {
        return h('li', { key: item.id }, [
          h('span', { class: 'menu-label' }, item.label),
          h('ul', {}, item.children.map(renderItem)),
        ])
      }
      return h('li', { key: item.id }, [
        h('a', { href: item.link }, item.label),
      ])
    }

    return () => h('ul', { class: 'tree-menu' }, props.items.map(renderItem))
  },
})
```

渲染函数中使用 Vue 特性：

```js
import { h, resolveComponent, withDirectives, vShow } from 'vue'

export default defineComponent({
  setup(props, { slots, emit }) {
    const count = ref(0)
    const show = ref(true)

    return () => {
      // 使用组件
      const MyButton = resolveComponent('MyButton')

      // 使用 v-model
      const input = h('input', {
        value: count.value,
        onInput: (e) => {
          count.value = e.target.value
        },
      })

      // 使用指令
      const conditionalDiv = withDirectives(h('div', {}, '可以显示/隐藏'), [
        [vShow, show.value],
      ])

      // 渲染插槽
      const defaultSlot = slots.default?.({ count: count.value })

      // 触发事件
      const button = h(
        MyButton,
        {
          onClick: () => emit('update', count.value),
        },
        { default: () => '点击' },
      )

      return h('div', [input, conditionalDiv, defaultSlot, button])
    }
  },
})
```

渲染函数适用的场景：需要高度动态的组件结构（如根据数据生成的表单、动态标签）、封装高阶组件、编写底层组件库。大多数业务场景中，模板更直观和高效。

## 4. 🤔 什么是函数式组件？如何创建和使用？

函数式组件是一种没有自身状态（data/state）、没有实例（this）、没有生命周期的轻量级组件。在 Vue 3 中，函数式组件就是一个普通函数，接收 props 和 context，返回 VNode。

```js
import { h } from 'vue'

// 函数式组件就是一个函数
function FunctionalButton(props, { slots, emit, attrs }) {
  return h(
    'button',
    {
      class: ['btn', `btn-${props.type || 'default'}`],
      disabled: props.disabled,
      onClick: () => emit('click'),
      ...attrs,
    },
    slots.default?.(),
  )
}

// 声明 props（可选但推荐）
FunctionalButton.props = {
  type: {
    type: String,
    default: 'default',
  },
  disabled: Boolean,
}

// 声明 emits（可选）
FunctionalButton.emits = ['click']

export default FunctionalButton
```

在 script setup 中定义函数式组件：

```html
<script setup>
  import { h } from 'vue'

  // 在父组件中定义函数式组件
  function StatusBadge(props) {
    const colorMap = {
      active: '#4caf50',
      inactive: '#9e9e9e',
      error: '#f44336',
    }

    return h(
      'span',
      {
        style: {
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          color: 'white',
          backgroundColor: colorMap[props.status] || '#9e9e9e',
        },
      },
      props.label || props.status,
    )
  }
</script>

<template>
  <StatusBadge status="active" label="在线" />
  <StatusBadge status="error" label="异常" />
</template>
```

函数式组件的典型应用场景——高阶渲染组件：

```js
// 条件渲染包装器
function Show(props, { slots }) {
  return props.when ? slots.default?.() : null
}
Show.props = { when: Boolean }

// 列表渲染包装器
function Each(props, { slots }) {
  return props.items.map((item, index) => slots.default?.({ item, index }))
}
Each.props = { items: Array }
```

```html
<template>
  <Show :when="isLoggedIn">
    <p>欢迎回来</p>
  </Show>

  <Each :items="users" v-slot="{ item }">
    <UserCard :user="item" />
  </Each>
</template>
```

Vue 3 vs Vue 2 的函数式组件区别：在 Vue 2 中，函数式组件需要使用 functional: true 选项，且有显著的性能优势（因为没有实例创建开销）。在 Vue 3 中，由于有状态组件的性能已经大幅提升，函数式组件的性能优势并不明显。Vue 3 中使用函数式组件主要是为了代码简洁性，而不是性能考量。大多数情况下，直接使用 script setup 的普通组件即可。

## 5. 🤔 如何在 Vue 中使用 JSX？

JSX（JavaScript XML）是一种 JavaScript 语法扩展，允许你在 JavaScript 中直接编写类似 HTML 的标记。在 Vue 中使用 JSX 是模板和 h() 函数之间的折中方案——比 h() 更直观，比模板更灵活。

配置 JSX 支持：

```bash
# Vite 项目默认已支持（通过 @vitejs/plugin-vue-jsx）
npm install -D @vitejs/plugin-vue-jsx
```

```ts
// vite.config.ts
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
})
```

基本使用——在 .jsx 或 .tsx 文件中编写组件：

```tsx
// components/HelloWorld.tsx
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    name: {
      type: String,
      default: 'World',
    },
  },
  setup(props) {
    const count = ref(0)

    return () => (
      <div class="hello">
        <h1>Hello, {props.name}!</h1>
        <p>计数：{count.value}</p>
        <button onClick={() => count.value++}>+1</button>
      </div>
    )
  },
})
```

Vue JSX 与 React JSX 的区别：

```tsx
// Vue JSX 使用 class 而不是 className
<div class="container">

// Vue JSX 事件使用 onXxx 而不是 onXxx（与 React 相同）
<button onClick={handleClick}>
<input onInput={handleInput} />

// v-model 支持
<input v-model={searchText} />
<MyComponent v-model={[value, 'modelValue', ['trim']]} />

// v-show 支持
<div v-show={isVisible}>内容</div>

// 插槽传递
<MyComponent>
  {{
    default: () => <p>默认插槽</p>,
    header: () => <h1>标题插槽</h1>,
    footer: (props) => <p>页脚 {props.year}</p>
  }}
</MyComponent>

// 或使用 v-slots
<MyComponent v-slots={{
  default: () => <p>内容</p>,
  header: () => <h1>标题</h1>
}} />
```

复杂的 JSX 组件示例：

```tsx
import { defineComponent, ref, computed, PropType } from 'vue'

interface Column {
  key: string
  title: string
  render?: (row: any) => JSX.Element
}

export default defineComponent({
  name: 'DataTable',
  props: {
    columns: {
      type: Array as PropType<Column[]>,
      required: true,
    },
    data: {
      type: Array as PropType<Record<string, any>[]>,
      required: true,
    },
  },
  emits: ['row-click'],
  setup(props, { emit }) {
    const sortKey = ref('')
    const sortOrder = ref<'asc' | 'desc'>('asc')

    const sortedData = computed(() => {
      if (!sortKey.value) return props.data
      return [...props.data].sort((a, b) => {
        const modifier = sortOrder.value === 'asc' ? 1 : -1
        return a[sortKey.value] > b[sortKey.value] ? modifier : -modifier
      })
    })

    function handleSort(key: string) {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }
    }

    return () => (
      <table class="data-table">
        <thead>
          <tr>
            {props.columns.map((col) => (
              <th key={col.key} onClick={() => handleSort(col.key)}>
                {col.title}
                {sortKey.value === col.key && (
                  <span>{sortOrder.value === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.value.map((row, index) => (
            <tr key={index} onClick={() => emit('row-click', row)}>
              {props.columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  },
})
```

JSX 适用于：组件逻辑复杂且模板表达力不够的场景、需要大量条件渲染或动态生成 DOM 结构的场景、从 React 生态迁移的开发者。大多数 Vue 项目中，template 仍然是首选——因为 Vue 编译器可以对模板进行更多的编译时优化（如静态提升、Patch Flags），而 JSX 只能在运行时处理。
