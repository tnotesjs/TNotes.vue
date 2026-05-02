# [0074. 列表渲染](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0074.%20%E5%88%97%E8%A1%A8%E6%B8%B2%E6%9F%93)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 v-for 如何遍历数组与对象？](#3--v-for-如何遍历数组与对象)
- [4. 🤔 v-for 中的 key 属性和虚拟 DOM 的 diff 算法是什么关系？](#4--v-for-中的-key-属性和虚拟-dom-的-diff-算法是什么关系)
- [5. 🤔 数组更新检测有哪些注意事项？](#5--数组更新检测有哪些注意事项)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- v-for 遍历数组与对象
- v-for 中的 key 属性与虚拟 DOM 的 diff 算法
- 数组更新检测与注意事项

## 2. 🫧 评价

- todo

## 3. 🤔 v-for 如何遍历数组与对象？

v-for 是 Vue 中用于列表渲染的指令，它可以基于数组、对象、数字范围甚至字符串来渲染一组元素。v-for 使用 `item in items` 的语法形式，其中 items 是源数据，item 是迭代的别名。

遍历数组是 v-for 最常见的用法：

```html
<template>
  <!-- 基本数组遍历 -->
  <ul>
    <li v-for="fruit in fruits" :key="fruit">{{ fruit }}</li>
  </ul>

  <!-- 带索引的数组遍历 -->
  <ul>
    <li v-for="(fruit, index) in fruits" :key="index">
      {{ index + 1 }}. {{ fruit }}
    </li>
  </ul>

  <!-- 遍历对象数组 -->
  <div v-for="user in users" :key="user.id" class="user-card">
    <h3>{{ user.name }}</h3>
    <p>年龄：{{ user.age }}</p>
    <p>城市：{{ user.city }}</p>
  </div>

  <!-- 解构用法 -->
  <ul>
    <li v-for="{ id, name, price } in products" :key="id">
      {{ name }} - ¥{{ price }}
    </li>
  </ul>

  <!-- 带索引的解构 -->
  <ul>
    <li v-for="({ name, price }, index) in products" :key="index">
      {{ index + 1 }}. {{ name }}（¥{{ price }}）
    </li>
  </ul>
</template>

<script setup>
  import { ref } from 'vue'

  const fruits = ref(['苹果', '香蕉', '橙子', '葡萄'])

  const users = ref([
    { id: 1, name: '张三', age: 25, city: '北京' },
    { id: 2, name: '李四', age: 30, city: '上海' },
    { id: 3, name: '王五', age: 28, city: '广州' },
  ])

  const products = ref([
    { id: 1, name: '笔记本电脑', price: 6999 },
    { id: 2, name: '无线鼠标', price: 129 },
    { id: 3, name: '机械键盘', price: 599 },
  ])
</script>
```

遍历对象时，v-for 可以接收三个参数：值、键名和索引：

```html
<template>
  <!-- 只获取值 -->
  <div v-for="value in userInfo" :key="value">{{ value }}</div>

  <!-- 获取值和键名 -->
  <div v-for="(value, key) in userInfo" :key="key">{{ key }}: {{ value }}</div>

  <!-- 获取值、键名和索引 -->
  <div v-for="(value, key, index) in userInfo" :key="key">
    {{ index }}. {{ key }}: {{ value }}
  </div>

  <!-- 实际应用：渲染表单字段 -->
  <form>
    <div v-for="(value, key) in formData" :key="key" class="form-field">
      <label>{{ fieldLabels[key] || key }}</label>
      <input :value="value" @input="formData[key] = $event.target.value" />
    </div>
  </form>
</template>

<script setup>
  import { reactive } from 'vue'

  const userInfo = reactive({
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com',
    city: '北京',
  })

  const formData = reactive({
    username: '',
    email: '',
    phone: '',
  })

  const fieldLabels = {
    username: '用户名',
    email: '邮箱',
    phone: '手机号',
  }
</script>
```

v-for 也可以遍历整数范围和字符串：

```html
<template>
  <!-- 遍历整数范围（从 1 开始） -->
  <span v-for="n in 5" :key="n">{{ n }} </span>
  <!-- 输出：1 2 3 4 5 -->

  <!-- 分页组件示例 -->
  <div class="pagination">
    <button
      v-for="page in totalPages"
      :key="page"
      :class="{ active: page === currentPage }"
      @click="currentPage = page"
    >
      {{ page }}
    </button>
  </div>

  <!-- 遍历字符串 -->
  <span v-for="char in 'Hello'" :key="char">{{ char }}-</span>
  <!-- 输出：H-e-l-l-o- -->
</template>
```

v-for 也可以在 template 标签上使用，用于渲染多个元素而不引入额外的包裹节点：

```html
<template>
  <table>
    <tbody>
      <template v-for="user in users" :key="user.id">
        <tr>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
        </tr>
        <tr v-if="user.showDetails">
          <td colspan="2">{{ user.details }}</td>
        </tr>
      </template>
    </tbody>
  </table>
</template>
```

v-for 和 v-if 同时使用在同一个元素上时需要特别注意。在 Vue 3 中，当 v-if 和 v-for 同时存在于一个元素上时，v-if 的优先级更高。这意味着 v-if 中无法访问 v-for 的变量：

```html
<template>
  <!-- Vue 3 中这样写会报错：item 在 v-if 中不可用 -->
  <li v-for="item in items" v-if="item.isActive" :key="item.id">
    {{ item.name }}
  </li>

  <!-- 正确方式 1：在外层 template 上使用 v-for -->
  <template v-for="item in items" :key="item.id">
    <li v-if="item.isActive">{{ item.name }}</li>
  </template>

  <!-- 正确方式 2：使用计算属性预过滤 -->
  <li v-for="item in activeItems" :key="item.id">{{ item.name }}</li>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const items = ref([
    { id: 1, name: '苹果', isActive: true },
    { id: 2, name: '香蕉', isActive: false },
    { id: 3, name: '橙子', isActive: true },
  ])

  // 推荐方式：使用计算属性过滤
  const activeItems = computed(() =>
    items.value.filter((item) => item.isActive),
  )
</script>
```

## 4. 🤔 v-for 中的 key 属性和虚拟 DOM 的 diff 算法是什么关系？

key 是 v-for 中一个看似简单但极其重要的属性。它是 Vue 虚拟 DOM diff 算法能够正确高效工作的关键。理解 key 的作用原理，需要先了解 Vue 的虚拟 DOM 更新机制。

当 Vue 需要更新一个通过 v-for 渲染的列表时，默认会采用「就地更新」策略（in-place patch）。也就是说，如果列表数据的顺序发生了变化，Vue 不会移动已有的 DOM 元素，而是就地更新每个元素的内容，使之与新的数据顺序匹配。

这种默认策略在某些场景下会导致问题。考虑以下例子：

```html
<template>
  <div>
    <div v-for="item in items">
      <span>{{ item.name }}</span>
      <input />
    </div>
    <button @click="shuffle">打乱顺序</button>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const items = ref([
    { id: 1, name: '张三' },
    { id: 2, name: '李四' },
    { id: 3, name: '王五' },
  ])

  function shuffle() {
    items.value = items.value.sort(() => Math.random() - 0.5)
  }
</script>
```

在没有 key 的情况下，当你在输入框中输入了一些内容然后点击「打乱顺序」，你会发现名字的顺序变了，但输入框中的内容没有跟着变——输入框仍然保留在原来的位置。这是因为 Vue 复用了已有的 DOM 元素，只是更新了 span 中的文本内容。

添加 key 之后，Vue 可以根据 key 来识别每个节点的身份，正确地移动、添加或删除节点：

```html
<template>
  <div>
    <!-- 添加 key 后，每个节点有了唯一标识 -->
    <div v-for="item in items" :key="item.id">
      <span>{{ item.name }}</span>
      <input />
    </div>
    <button @click="shuffle">打乱顺序</button>
  </div>
</template>
```

现在当你打乱顺序时，输入框会跟着对应的名字一起移动，因为 Vue 知道每个 div 的身份（通过 key），会使用 DOM 的 insertBefore 等操作来移动节点，而不是就地更新内容。

Vue 的 diff 算法在比较新旧两组子节点时，会按以下策略工作：

当没有 key 时，Vue 使用简单的遍历比较——按照位置逐个比较新旧节点。如果位置相同的节点类型相同，就复用该 DOM 节点并更新其属性和内容。这种方式在列表顺序不变的情况下非常高效，但在列表重新排序时会做很多不必要的更新。

当有 key 时，Vue 使用一种更智能的算法来最小化 DOM 操作。简化流程如下：

```
旧列表：[A, B, C, D, E]
新列表：[A, C, E, B, D]

1. 双端比较：
   - 头头比较：A === A，匹配，跳过
   - 尾尾比较：E !== D，不匹配
   - 头尾比较：B !== D，不匹配
   - 尾头比较：E !== B，不匹配

2. 对无法匹配的部分，建立旧节点的 key -> index 映射表

3. 遍历新列表中的未处理节点，通过 key 在映射表中查找对应的旧节点

4. 移动复用的节点，删除不再需要的节点，创建新增的节点
```

选择合适的 key 值至关重要。key 应该满足以下条件：

唯一性——同一层级的兄弟节点之间，key 值不能重复。稳定性——同一数据项在不同渲染周期中应该始终拥有相同的 key。最佳选择是数据本身的唯一标识符，如数据库 ID：

```html
<template>
  <!-- 推荐：使用唯一 ID -->
  <li v-for="user in users" :key="user.id">{{ user.name }}</li>

  <!-- 不推荐：使用索引（在排序、过滤、删除等操作时可能出错） -->
  <li v-for="(user, index) in users" :key="index">{{ user.name }}</li>
</template>
```

使用数组索引作为 key 的问题在于，当列表发生插入、删除或重排操作时，索引与数据项的对应关系会发生变化，导致 Vue 错误地复用节点。

## 5. 🤔 数组更新检测有哪些注意事项？

在 Vue 中使用数组作为响应式数据时，需要了解 Vue 能够检测哪些数组操作并触发视图更新，以及在不同的 Vue 版本中存在哪些差异。

Vue 3 使用 Proxy 来实现响应式，可以检测到几乎所有类型的数组操作，包括：

```html
<script setup>
  import { ref } from 'vue'

  const items = ref(['苹果', '香蕉', '橙子'])

  // 以下操作在 Vue 3 中都能触发更新

  // 变异方法（直接修改原数组）
  items.value.push('葡萄') // 添加到末尾
  items.value.pop() // 移除末尾元素
  items.value.shift() // 移除第一个元素
  items.value.unshift('芒果') // 添加到开头
  items.value.splice(1, 1, '西瓜') // 替换元素
  items.value.sort() // 排序
  items.value.reverse() // 反转

  // 通过索引直接修改（Vue 2 中不可行，Vue 3 可以）
  items.value[0] = '新水果'

  // 直接修改 length（Vue 2 中不可行，Vue 3 可以）
  items.value.length = 2
</script>
```

Vue 2 中，由于 Object.defineProperty 的限制，以下操作无法被自动检测到：

```js
// Vue 2 的限制（Vue 3 已不存在这些问题）

// 无法检测：通过索引直接设置
this.items[0] = '新值' // 不会触发更新
// 解决方案
this.$set(this.items, 0, '新值')
// 或
this.items.splice(0, 1, '新值')

// 无法检测：修改数组长度
this.items.length = 0 // 不会触发更新
// 解决方案
this.items.splice(0)
```

在实际开发中，处理数组数据最常见的模式是使用非变异方法（返回新数组的方法）配合直接替换。filter、map、concat、slice 等方法不会修改原数组，而是返回一个新数组。在 Vue 中使用这些方法时，直接将返回的新数组赋值给响应式变量即可：

```html
<template>
  <div>
    <input v-model="filterText" placeholder="搜索..." />
    <ul>
      <li v-for="item in filteredItems" :key="item.id">
        {{ item.name }} - ¥{{ item.price }}
      </li>
    </ul>
    <button @click="sortByPrice">按价格排序</button>
    <button @click="removeExpensive">移除高价商品</button>
    <button @click="addItem">添加商品</button>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const filterText = ref('')
  let nextId = 4

  const items = ref([
    { id: 1, name: '苹果', price: 5 },
    { id: 2, name: '香蕉', price: 3 },
    { id: 3, name: '葡萄', price: 12 },
  ])

  const filteredItems = computed(() => {
    if (!filterText.value) return items.value
    return items.value.filter((item) => item.name.includes(filterText.value))
  })

  function sortByPrice() {
    // slice 创建副本后排序，避免直接修改原数组
    items.value = items.value.slice().sort((a, b) => a.price - b.price)
  }

  function removeExpensive() {
    items.value = items.value.filter((item) => item.price < 10)
  }

  function addItem() {
    items.value.push({
      id: nextId++,
      name: '新水果',
      price: Math.floor(Math.random() * 20),
    })
  }
</script>
```

使用非变异方法替换数组时，你可能会担心性能问题——整个列表不是都要重新渲染吗？实际上并非如此。Vue 的虚拟 DOM diff 算法非常智能，即使你替换了整个数组引用，Vue 也会通过比较新旧虚拟 DOM 树来找出最小的 DOM 变更集，尽可能地复用已有的 DOM 节点。

嵌套数组和对象数组的更新也需要注意。在 Vue 3 中，reactive 和 ref 都会对嵌套的对象进行深度响应式处理，因此修改数组中对象的属性是可以被检测到的：

```html
<script setup>
  import { ref } from 'vue'

  const users = ref([
    { id: 1, name: '张三', scores: [85, 92, 78] },
    { id: 2, name: '李四', scores: [90, 88, 95] },
  ])

  // 修改对象属性——可以触发更新
  users.value[0].name = '张三丰'

  // 修改嵌套数组——可以触发更新
  users.value[0].scores.push(100)

  // 添加新属性——在 Vue 3 中可以触发更新
  users.value[0].email = 'zhangsan@example.com'
</script>
```

对于大型列表的性能优化建议：避免在计算属性或模板中对大数组执行开销大的操作（如多次 sort、filter 链式调用）；使用 Object.freeze 冻结不需要响应式的大型静态数据；对于渲染超过数百项的列表，考虑使用虚拟滚动（Virtual Scrolling）技术来优化性能，只渲染可视区域内的元素。
