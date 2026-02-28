# [0034. 插槽（Slots）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0034.%20%E6%8F%92%E6%A7%BD%EF%BC%88Slots%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 插槽的基本用法是什么？](#3--插槽的基本用法是什么)
- [4. 🤔 什么是具名插槽？v-slot 指令如何使用？](#4--什么是具名插槽v-slot-指令如何使用)
- [5. 🤔 什么是作用域插槽？如何在父组件中获取子组件的数据？](#5--什么是作用域插槽如何在父组件中获取子组件的数据)
- [6. 🤔 什么是动态插槽名？](#6--什么是动态插槽名)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 插槽的基本使用
- 具名插槽（v-slot 指令）
- 作用域插槽（传递数据给父组件）
- 动态插槽名

## 2. 🫧 评价

- todo

## 3. 🤔 插槽的基本用法是什么？

插槽（Slot）是 Vue 中实现内容分发的机制。它允许父组件向子组件的模板中插入自定义的 HTML 内容，使子组件变得更加灵活和可复用。如果说 props 让父组件向子组件传递数据，那么插槽就是让父组件向子组件传递模板片段。

最基本的使用方式是在子组件模板中放置一个 `<slot>` 元素作为内容的占位符：

```html
<!-- BaseButton.vue -->
<template>
  <button class="base-button">
    <slot></slot>
  </button>
</template>

<style scoped>
  .base-button {
    padding: 8px 16px;
    border-radius: 4px;
    border: 1px solid #ddd;
    cursor: pointer;
  }
</style>
```

```html
<!-- 父组件使用 -->
<template>
  <BaseButton>提交表单</BaseButton>
  <BaseButton>
    <span style="color: red;">删除</span>
  </BaseButton>
  <BaseButton>
    <img src="/icon-save.svg" alt="保存" />
    保存文件
  </BaseButton>
</template>
```

父组件在子组件标签之间写的内容，会替换子组件模板中 `<slot>` 的位置。插槽内容不仅可以是文本，也可以是任意合法的模板内容——包括 HTML 元素、其他组件等。

当父组件没有提供任何插槽内容时，`<slot>` 标签内的默认内容会被渲染。这被称为后备内容（fallback content）：

```html
<!-- SubmitButton.vue -->
<template>
  <button class="submit-btn">
    <slot>提交</slot>
    <!-- "提交" 是后备内容 -->
  </button>
</template>
```

```html
<!-- 父组件 -->
<template>
  <!-- 没有提供内容，显示后备内容 "提交" -->
  <SubmitButton />

  <!-- 提供了内容，显示 "确认并提交" -->
  <SubmitButton>确认并提交</SubmitButton>
</template>
```

插槽内容在父组件的作用域中编译。这意味着插槽内容可以访问父组件的数据，但不能访问子组件的数据：

```html
<!-- 父组件 -->
<template>
  <ChildComponent>
    <!-- 可以访问父组件的 message -->
    <p>{{ message }}</p>

    <!-- 不能访问子组件的 childData -->
    <!-- <p>{{ childData }}</p>  这会报错 -->
  </ChildComponent>
</template>

<script setup>
  import { ref } from 'vue'
  const message = ref('来自父组件的数据')
</script>
```

一个实用的卡片组件示例：

```html
<!-- Card.vue -->
<template>
  <div class="card">
    <div class="card-header" v-if="title">
      <h3>{{ title }}</h3>
    </div>
    <div class="card-body">
      <slot>暂无内容</slot>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    title: String,
  })
</script>
```

```html
<!-- 使用卡片组件 -->
<template>
  <Card title="用户信息">
    <p>姓名：{{ user.name }}</p>
    <p>邮箱：{{ user.email }}</p>
    <img :src="user.avatar" />
  </Card>

  <Card title="操作面板">
    <button @click="save">保存</button>
    <button @click="cancel">取消</button>
  </Card>

  <!-- 使用后备内容 -->
  <Card title="待办事项" />
</template>
```

## 4. 🤔 什么是具名插槽？v-slot 指令如何使用？

当一个组件需要在多个不同位置接收不同的内容时，仅靠一个默认插槽是不够的。具名插槽（Named Slots）允许在一个组件中定义多个插槽出口，每个出口有自己的名字，父组件可以将不同的内容分发到不同的插槽位置。

在子组件中使用 name 属性为 `<slot>` 命名。没有 name 的 `<slot>` 隐含地有一个名字 "default"：

```html
<!-- PageLayout.vue -->
<template>
  <div class="page-layout">
    <header>
      <slot name="header"></slot>
    </header>

    <main>
      <slot></slot>
      <!-- 默认插槽，等同于 <slot name="default"> -->
    </main>

    <aside>
      <slot name="sidebar">默认侧边栏内容</slot>
    </aside>

    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

在父组件中，使用 `<template v-slot:name>` 来向对应的具名插槽提供内容。v-slot 有一个缩写语法 `#name`：

```html
<template>
  <PageLayout>
    <!-- 完整语法 -->
    <template v-slot:header>
      <nav>
        <a href="/">首页</a>
        <a href="/about">关于</a>
        <a href="/contact">联系我们</a>
      </nav>
    </template>

    <!-- 缩写语法 -->
    <template #sidebar>
      <ul>
        <li>分类 1</li>
        <li>分类 2</li>
        <li>分类 3</li>
      </ul>
    </template>

    <template #footer>
      <p>© 2024 我的网站</p>
    </template>

    <!-- 默认插槽内容：不需要 template 包裹 -->
    <article>
      <h1>文章标题</h1>
      <p>文章正文内容...</p>
    </article>
  </PageLayout>
</template>
```

默认插槽的内容可以不用 template 标签包裹——所有没有被 `<template v-slot:xxx>` 包裹的内容都会被视为默认插槽的内容。但如果你想显式地将内容放在默认插槽中，也可以使用 `<template #default>`：

```html
<template>
  <PageLayout>
    <template #header>头部</template>

    <template #default>
      <p>这是显式的默认插槽内容</p>
    </template>

    <template #footer>底部</template>
  </PageLayout>
</template>
```

具名插槽在组件库开发中非常常见。以一个对话框组件为例：

```html
<!-- Dialog.vue -->
<template>
  <Teleport to="body">
    <div class="dialog-overlay" v-if="visible" @click.self="close">
      <div class="dialog">
        <div class="dialog-header">
          <slot name="header">
            <h3>{{ title }}</h3>
          </slot>
          <button class="close-btn" @click="close">×</button>
        </div>

        <div class="dialog-body">
          <slot></slot>
        </div>

        <div class="dialog-footer">
          <slot name="footer">
            <button @click="close">关闭</button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  defineProps({
    title: { type: String, default: '提示' },
    visible: { type: Boolean, required: true },
  })

  const emit = defineEmits(['close'])

  function close() {
    emit('close')
  }
</script>
```

```html
<!-- 使用对话框 -->
<template>
  <dialog :visible="showDialog" @close="showDialog = false">
    <template #header>
      <div style="display: flex; align-items: center;">
        <img src="/warning.svg" />
        <h3>确认删除</h3>
      </div>
    </template>

    <p>你确定要删除这条记录吗？此操作不可恢复。</p>

    <template #footer>
      <button @click="showDialog = false">取消</button>
      <button @click="confirmDelete" class="danger">确认删除</button>
    </template>
  </dialog>
</template>
```

## 5. 🤔 什么是作用域插槽？如何在父组件中获取子组件的数据？

作用域插槽（Scoped Slots）是 Vue 插槽中最强大的特性。普通插槽的内容只能访问父组件的数据，无法访问子组件的状态。而作用域插槽允许子组件在渲染插槽时向父组件传递数据，使父组件能够根据子组件的数据来定制渲染内容。

子组件通过在 `<slot>` 元素上绑定属性（slot props）来向插槽内容传递数据：

```html
<!-- ItemList.vue -->
<template>
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      <!-- 将 item 和 index 作为 slot props 传递 -->
      <slot :item="item" :index="index">
        <!-- 后备内容 -->
        {{ item.name }}
      </slot>
    </li>
  </ul>
</template>

<script setup>
  defineProps({
    items: {
      type: Array,
      required: true,
    },
  })
</script>
```

父组件在 `<template v-slot>` 上接收这些数据：

```html
<template>
  <!-- 使用默认渲染 -->
  <ItemList :items="products" />

  <!-- 自定义渲染方式 -->
  <ItemList :items="products">
    <template #default="{ item, index }">
      <div class="product-item">
        <span class="index">{{ index + 1 }}.</span>
        <strong>{{ item.name }}</strong>
        <span class="price">¥{{ item.price }}</span>
        <button @click="addToCart(item)">加入购物车</button>
      </div>
    </template>
  </ItemList>

  <!-- 另一种渲染方式 -->
  <ItemList :items="products">
    <template #default="slotProps">
      <img :src="slotProps.item.image" />
      <p>{{ slotProps.item.description }}</p>
    </template>
  </ItemList>
</template>
```

作用域插槽最经典的应用场景是实现一个通用的数据表格组件，让使用者能自定义每列的渲染方式：

```html
<!-- DataTable.vue -->
<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">{{ col.title }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in data" :key="row.id">
        <td v-for="col in columns" :key="col.key">
          <!-- 为每列提供具名的作用域插槽 -->
          <slot :name="col.key" :row="row" :value="row[col.key]">
            {{ row[col.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
  defineProps({
    columns: { type: Array, required: true },
    data: { type: Array, required: true },
  })
</script>
```

```html
<!-- 使用 DataTable -->
<template>
  <DataTable :columns="columns" :data="users">
    <!-- 自定义 name 列的渲染 -->
    <template #name="{ row }">
      <div class="user-name">
        <img :src="row.avatar" class="avatar" />
        <span>{{ row.name }}</span>
      </div>
    </template>

    <!-- 自定义 status 列的渲染 -->
    <template #status="{ value }">
      <span :class="['badge', `badge-${value}`]">
        {{ value === 'active' ? '活跃' : '禁用' }}
      </span>
    </template>

    <!-- 添加操作列 -->
    <template #actions="{ row }">
      <button @click="editUser(row)">编辑</button>
      <button @click="deleteUser(row.id)">删除</button>
    </template>
  </DataTable>
</template>

<script setup>
  const columns = [
    { key: 'name', title: '姓名' },
    { key: 'email', title: '邮箱' },
    { key: 'status', title: '状态' },
    { key: 'actions', title: '操作' },
  ]

  const users = [
    {
      id: 1,
      name: '张三',
      email: 'zhangsan@mail.com',
      status: 'active',
      avatar: '/a1.jpg',
    },
    {
      id: 2,
      name: '李四',
      email: 'lisi@mail.com',
      status: 'inactive',
      avatar: '/a2.jpg',
    },
  ]
</script>
```

另一个常见模式是"无渲染组件"（Renderless Component）。这种组件只提供逻辑和状态，完全不管渲染——所有的渲染都交给父组件通过作用域插槽来决定：

```html
<!-- MouseTracker.vue：无渲染组件 -->
<template>
  <slot :x="x" :y="y" :isInside="isInside"></slot>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'

  const x = ref(0)
  const y = ref(0)
  const isInside = ref(false)

  function handleMouseMove(e) {
    x.value = e.clientX
    y.value = e.clientY
  }

  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
  })
</script>
```

```html
<!-- 使用方：完全自定义渲染 -->
<template>
  <MouseTracker v-slot="{ x, y }">
    <div class="cursor-display">鼠标位置：({{ x }}, {{ y }})</div>
  </MouseTracker>
</template>
```

在 Vue 3 中，这种模式已经可以被组合式函数（Composables）替代，但在某些需要控制渲染结构的场景中，作用域插槽仍然不可替代。

## 6. 🤔 什么是动态插槽名？

动态插槽名允许在运行时动态地决定内容要插入哪个插槽。它使用 v-slot 指令的动态参数语法 `v-slot:[dynamicName]`，其中 dynamicName 是一个变量或表达式。

```html
<!-- TabPanel.vue -->
<template>
  <div class="tab-panel">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="panel-content">
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    tabs: {
      type: Array,
      required: true,
    },
  })

  const activeTab = ref(props.tabs[0]?.id)
</script>
```

```html
<!-- 使用 -->
<template>
  <TabPanel :tabs="tabs">
    <template #home>
      <h2>首页</h2>
      <p>欢迎来到首页</p>
    </template>

    <template #profile>
      <h2>个人信息</h2>
      <p>用户名：张三</p>
    </template>

    <template #settings>
      <h2>设置</h2>
      <p>系统设置页面</p>
    </template>
  </TabPanel>
</template>

<script setup>
  const tabs = [
    { id: 'home', label: '首页' },
    { id: 'profile', label: '个人信息' },
    { id: 'settings', label: '设置' },
  ]
</script>
```

动态插槽名的另一个典型场景是表单布局组件。当需要根据配置动态渲染不同的表单字段时：

```html
<!-- DynamicForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div v-for="field in fields" :key="field.name" class="form-row">
      <label>{{ field.label }}</label>
      <slot :name="field.name" :field="field" :model="model">
        <input
          v-model="model[field.name]"
          :type="field.type || 'text'"
          :placeholder="field.placeholder"
        />
      </slot>
    </div>
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
  import { reactive } from 'vue'

  const props = defineProps({
    fields: { type: Array, required: true },
  })

  const model = reactive({})
  props.fields.forEach((f) => {
    model[f.name] = f.default || ''
  })

  function handleSubmit() {
    console.log('表单数据：', { ...model })
  }
</script>
```

```html
<!-- 使用动态插槽名来自定义特定字段的渲染 -->
<template>
  <DynamicForm :fields="formFields">
    <!-- 动态插槽名：只自定义 role 字段的渲染 -->
    <template #[customField]="{ model }">
      <select v-model="model.role">
        <option value="admin">管理员</option>
        <option value="editor">编辑</option>
        <option value="viewer">查看者</option>
      </select>
    </template>
  </DynamicForm>
</template>

<script setup>
  import { ref } from 'vue'

  const customField = ref('role')

  const formFields = [
    { name: 'username', label: '用户名', placeholder: '请输入用户名' },
    { name: 'email', label: '邮箱', type: 'email' },
    { name: 'role', label: '角色' },
  ]
</script>
```

动态插槽名在使用时有几个注意事项：动态插槽名的值应该是字符串类型。如果值为 null 或 undefined，插槽将不会被渲染。动态插槽名不能包含空格或特殊字符，因为它们需要作为有效的属性名使用。在实际开发中，动态插槽名多见于需要根据数据配置动态渲染 UI 的通用组件中，比如表格的列自定义、表单的字段自定义、布局系统的区域自定义等。
