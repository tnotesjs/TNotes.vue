# [0025. 模板语法与指令](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0025.%20%E6%A8%A1%E6%9D%BF%E8%AF%AD%E6%B3%95%E4%B8%8E%E6%8C%87%E4%BB%A4)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是插值语法（Mustache）？](#3--什么是插值语法mustache)
  - [3.1. 基本用法](#31-基本用法)
  - [3.2. HTML 转义处理问题 `v-html`](#32-html-转义处理问题-v-html)
  - [3.3. 插值语法无法用于 HTML 属性 `v-bind`](#33-插值语法无法用于-html-属性-v-bind)
- [4. 🤔 Vue 有哪些常用的内置指令？](#4--vue-有哪些常用的内置指令)
  - [4.1. `v-bind`](#41-v-bind)
  - [4.2. `v-on`](#42-v-on)
  - [4.3. `v-model`](#43-v-model)
  - [4.4. `v-if`、`v-else-if`、`v-else`](#44-v-ifv-else-ifv-else)
  - [4.5. `v-show`](#45-v-show)
  - [4.6. `v-for`](#46-v-for)
  - [4.7. 小结](#47-小结)
- [5. 🤔 指令的动态参数与修饰符是什么？](#5--指令的动态参数与修饰符是什么)
  - [5.1. 指令的基本结构](#51-指令的基本结构)
  - [5.2. 动态参数](#52-动态参数)
  - [5.3. 修饰符（Modifiers）](#53-修饰符modifiers)
- [6. 🤔 Class 与 Style 绑定的高级用法有哪些？](#6--class-与-style-绑定的高级用法有哪些)
  - [6.1. class 绑定](#61-class-绑定)
  - [6.2. style 绑定](#62-style-绑定)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 插值语法（Mustache）
- 内置指令 `v-html`、`v-bind`、`v-model`、`v-on`、`v-if`、`v-show`、`v-for`
- `v-bind` 的简写语法 `:`
- `v-bind` 的对象语法 `v-bind="object"`（一次绑定多个属性）
- `<style>` 中的 `v-bind` 语法（Vue 3.2 引入）
- `v-on` 的简写语法 `@`
- 属性名同名简写语法（Vue 3.4 引入）
- 指令的动态参数与修饰符
- Class 与 Style 绑定高级用法

## 2. 🫧 评价

在本节介绍的知识点中，「<span v-pre>`{{ }}`</span> 语法」、「常用内置指令」、「Class 与 Style 绑定」是 Vue 模板中最基础也是最常用的特性，可以说是开发 Vue 组件必备的知识点，也是使用频率极高的知识点。

关于指令的动态参数和修饰符，这些是一些比较高级的用法，在实际开发中使用频率相对较低，但了解它们可以帮助我们更好地理解 Vue 模板的灵活性和表达能力。就个人而言，实际开发中经常会忘记这些用法，以一些修饰符为例，更多情况下会直接手写原生 JS 来实现一些修饰符的功能逻辑，而不是直接使用修饰符来处理。如果你对原生 JS 比较熟悉，那么直接通过原生的 JS 来实现指令修饰符的逻辑也是完全可行的，并且会更加的灵活。

## 3. 🤔 什么是插值语法（Mustache）？

插值语法（Mustache Syntax）是 Vue 模板中最基本的数据绑定方式，使用双大括号 <span v-pre>`{{ }}`</span> 将表达式包裹起来，Vue 会将其替换为对应数据的值。之所以被称为“Mustache”（胡子），是因为双大括号的形状像两撇胡子。这种语法在许多模板引擎中都有使用，Vue 沿用了这一直观的设计。

### 3.1. 基本用法

最基本的用法是将一个响应式变量的值渲染到页面上：

```html
<template>
  <div>
    <p>{{ message }}</p>
    <p>{{ user.name }}</p>
    <p>{{ items[0] }}</p>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue'

  const message = ref('Hello Vue')
  const user = reactive({ name: '张三', age: 25 })
  const items = ref(['苹果', '香蕉', '橙子'])
</script>
```

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-27-21-08-02.png)

双大括号中不仅可以是简单的变量引用，还可以使用任意合法的 JavaScript 表达式。Vue 会在当前组件实例的作用域内对表达式进行求值：

```html
<template>
  <div>
    <!-- 算术运算 -->
    <p>{{ count + 1 }}</p>
    <p>{{ price * quantity }}</p>

    <!-- 三元运算符 -->
    <p>{{ isActive ? '激活' : '未激活' }}</p>

    <!-- 方法调用 -->
    <p>{{ message.toUpperCase() }}</p>
    <p>{{ items.join('、') }}</p>

    <!-- 模板字符串 -->
    <p>{{ `欢迎你，${user.name}` }}</p>

    <!-- 数学函数 -->
    <p>{{ Math.max(a, b) }}</p>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue'

  const count = ref(10)
  const price = ref(9.9)
  const quantity = ref(3)
  const isActive = ref(true)
  const message = ref('hello vue')
  const items = ref(['Vue', 'React', 'Angular'])
  const user = reactive({ name: '张三' })
  const a = ref(5)
  const b = ref(8)
</script>
```

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-27-21-09-15.png)

::: tip 扩展知识点：JS 浮点数计算问题

由于 JavaScript 采用 IEEE 754 双精度浮点数运算，9.9 无法精确表示为二进制小数，乘以 3 后产生舍入误差，因此得到 29.700000000000003 而非预期的 29.7。这是 JavaScript 中常见的浮点数计算问题，与 Vue 无关。

:::

但是表达式有一些限制。首先，每个绑定位置只能包含单个表达式，不能包含语句（如 if 条件语句、for 循环、变量声明等）：

```html
<template>
  <!-- 下面这些都不会生效（并且会抛出语法错误） -->
  <!-- <p>{{ var x = 1 }}</p>
  <p>{{ if (ok) { return message } }}</p>
  <p>{{ for (let i = 0; i < 10; i++) {} }}</p> -->

  <!-- 应该使用表达式来代替 -->
  <p>{{ ok ? message : '默认值' }}</p>
</template>
```

其次，模板中的表达式只能访问一个受限的全局对象列表，包括 Math、Date、parseInt、parseFloat 等常用的全局工具。你不能在模板表达式中访问用户自定义的全局变量，除非通过 `app.config.globalProperties` 显式地将其添加到全局属性中。

### 3.2. HTML 转义处理问题 `v-html`

插值语法默认会对内容进行 HTML 转义处理，即把 HTML 标签当作纯文本来显示，这是出于安全考虑，可以防止 XSS 攻击。如果你确实需要渲染原始 HTML 内容，应该使用 `v-html` 指令：

```html
<template>
  <div>
    <!-- 会被转义为纯文本 -->
    <p>{{ rawHtml }}</p>
    <!-- 输出：<span style="color: red">红色文字</span> -->

    <!-- 渲染为真实 HTML -->
    <p v-html="rawHtml"></p>
    <!-- 输出：红色文字（红色显示） -->
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const rawHtml = ref('<span style="color: red">红色文字</span>')
</script>
```

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-28-06-57-04.png)

但使用 `v-html` 时需要格外注意安全问题。永远不要将用户输入的内容直接作为 `v-html` 的值渲染，因为这可能导致 XSS（跨站脚本攻击）漏洞。只有确认内容是可信的（如来自你自己的服务端）时，才可以使用 `v-html`。

### 3.3. 插值语法无法用于 HTML 属性 `v-bind`

插值语法只能用于 HTML 元素的文本内容中，不能用于 HTML 属性中。如果要将数据动态绑定到元素属性上，需要使用 `v-bind` 指令：

```html
<template>
  <!-- 错误：不能在属性中使用插值 -->
  <div id="{{ dynamicId }}"></div>

  <!-- 正确：使用 v-bind 绑定属性 -->
  <div :id="dynamicId"></div>
</template>
```

Vue 3.4 引入了一个便捷的同名简写语法。当属性名和绑定的变量名相同时，可以省略属性值：

```html
<template>
  <!-- 完整写法 -->
  <div :id="id"></div>

  <!-- Vue 3.4+ 同名简写 -->
  <div :id></div>
</template>

<script setup>
  import { ref } from 'vue'
  const id = ref('my-element')
</script>
```

## 4. 🤔 Vue 有哪些常用的内置指令？

Vue 的指令（Directives）是带有 `v-` 前缀的特殊属性，用于在模板中对 DOM 元素施加特殊的响应式行为。Vue 内置了多个常用指令，覆盖了数据绑定、条件渲染、列表渲染、事件处理等核心场景。

### 4.1. `v-bind`

`v-bind` 是最常用的指令之一，用于将表达式的值动态绑定到 HTML 元素的属性上。它的简写形式是 `:`：

```html
<template>
  <!-- 完整语法 -->
  <img v-bind:src="imageSrc" width="188" />

  <!-- 简写语法 -->
  <img :src="imageSrc" width="188" />

  <p>
    <a :href="url" :title="linkTitle">{{ linkText }}</a>
  </p>

  <!-- 动态绑定 class -->
  <div :class="{ active: isActive }">对象语法</div>
  <div :class="[baseClass, errorClass]">数组语法</div>

  <!-- 动态绑定 style -->
  <div :style="{ color: textColor, fontSize: size + 'px' }">样式绑定</div>

  <!-- 绑定多个属性 -->
  <div v-bind="attrs">一次绑定多个属性</div>
</template>

<script setup>
  import { ref, reactive } from 'vue'

  const imageSrc = ref(
    'https://cdn.jsdelivr.net/gh/Tdahuyou/imgs@main/assets/footprints.png',
  )
  const url = ref('https://vuejs.org')
  const linkTitle = ref('Vue.js 官网')
  const linkText = ref('访问 Vue.js')
  const isActive = ref(true)
  const baseClass = ref('container')
  const errorClass = ref('text-danger')
  const textColor = ref('#f00')
  const size = ref(32)
  const attrs = reactive({
    id: 'wrapper',
    class: 'box',
    'data-type': 'container',
  })
</script>

<style scoped>
  .active,
  .container,
  .box {
    padding: 0.5rem;
    margin: 0.5rem;
    border-radius: 0.3rem;
    color: white;
  }

  .active {
    background-color: red;
  }

  .container {
    background-color: green;
  }

  .box {
    background-color: blue;
  }

  .text-danger {
    font-weight: 700;
  }
</style>
```

![图 3](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-28-08-11-07.png)

### 4.2. `v-on`

`v-on` 用于监听 DOM 事件，简写形式是 `@`：

```html
<template>
  <!-- 完整语法 -->
  <button v-on:click="handleClick">点击</button>

  <!-- 简写语法 -->
  <button @click="handleClick">点击</button>

  <!-- 内联语句 -->
  <button @click="count++">+1</button>

  <!-- 传参 -->
  <button @click="say('hello')">说你好</button>

  <!-- 同时传参和事件对象 -->
  <button @click="warn('提示', $event)">警告</button>

  <!-- 多事件处理 -->
  <button @click="(one($event), two($event))">多个处理器</button>
</template>

<script setup>
  import { ref } from 'vue'

  const count = ref(0)

  function handleClick() {
    console.log('按钮被点击了')
  }

  function say(msg) {
    console.log(msg)
  }

  function warn(msg, event) {
    console.log(msg, event.target)
  }

  function one(e) {
    console.log('处理器一', e)
  }
  function two(e) {
    console.log('处理器二', e)
  }
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-28-08-13-45.png)

### 4.3. `v-model`

`v-model` 用于在表单元素上创建双向数据绑定。它会根据不同的表单元素类型自动选择正确的属性和事件来更新数据：

```html
<template>
  <!-- 1. 文本输入框 -->
  <div>
    <p>
      <input v-model="text" placeholder="输入文本" />
    </p>
    <p>双向绑定：{{ text }}</p>
  </div>

  <!-- 2. 文本域 -->
  <div>
    <p>
      <textarea v-model="content" placeholder="输入多行文本"></textarea>
    </p>
    <p>双向绑定：{{ content }}</p>
  </div>

  <!-- 3. 复选框 -->
  <div>
    <p>
      <input type="checkbox" v-model="isChecked" />
    </p>
    <p>双向绑定：{{ isChecked ? '已选中' : '未选中' }}</p>
  </div>

  <!-- 4. 下拉选择框 -->
  <div>
    <p>
      <select v-model="selected">
        <option value="a">选项 A</option>
        <option value="b">选项 B</option>
      </select>
    </p>
    <p>双向绑定：{{ selected }}</p>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const text = ref('')
  const content = ref('')
  const isChecked = ref(false)
  const selected = ref('a')
</script>
```

双向绑定：表单数据变化，Vue 会自动更新绑定的数据变量，反之亦然。

测试：修改表单数据，观察页面的变化

- 当用户在输入框中输入文本时，`text` 变量会自动更新
- 当用户在文本域中输入内容时，`content` 变量会自动更新
- 当用户勾选复选框时，`isChecked` 变量会自动更新
- 当用户选择下拉选项时，`selected` 变量会自动更新

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-28-08-18-23.png)

### 4.4. `v-if`、`v-else-if`、`v-else`

`v-if`、`v-else-if`、`v-else` 用于条件渲染。`v-if` 会根据表达式的真假值来决定是否渲染元素。当条件为 false 时，元素会被完全移除，不会出现在 DOM 中：

```html
<template>
  <!-- 控制 type 的下拉选择 -->
  <div>
    <p>
      <select v-model="type">
        <option value="A">类型 A</option>
        <option value="B">类型 B</option>
        <option value="C">类型 C</option>
        <option value="D">其他类型</option>
      </select>
    </p>
    <p>当前选择：{{ type }}</p>
  </div>

  <div v-if="type === 'A'">类型 A ...</div>
  <div v-else-if="type === 'B'">类型 B ...</div>
  <div v-else-if="type === 'C'">类型 C ...</div>
  <div v-else>其他类型</div>

  <!-- 控制 showDetails 的复选框 -->
  <div>
    <p><input type="checkbox" v-model="showDetails" /> 显示详情</p>
  </div>

  <!-- 在 template 上使用不会渲染额外元素 -->
  <template v-if="showDetails">
    <h2>详情标题</h2>
    <p>详情内容</p>
  </template>
</template>

<script setup>
  import { ref } from 'vue'

  const type = ref('A')
  const showDetails = ref(false)
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-28-08-32-13.png)

### 4.5. `v-show`

`v-show` 也用于控制元素的显示和隐藏，但它通过 CSS 的 display 属性来切换，元素始终存在于 DOM 中：

```html
<template>
  <!-- 控制 v-show 的开关 -->
  <div>
    <p>
      <button @click="isVisible = !isVisible">
        {{ isVisible ? '隐藏' : '显示' }}内容
      </button>
    </p>
    <p>当前状态：{{ isVisible ? '可见' : '隐藏' }}</p>
  </div>

  <!-- v-show 通过 display: none 来隐藏 -->
  <p v-show="isVisible">可见内容</p>
</template>

<script setup>
  import { ref } from 'vue'

  const isVisible = ref(true)
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-28-08-37-29.png)

::: tip 面试常考题：`v-if` 和 `v-show` 的区别

- `v-if` 是“真正的”条件渲染，当条件为 false 时元素不会被创建
- `v-show` 始终创建元素，只是切换 CSS

因此，`v-if` 有更高的切换开销（需要销毁和重建），`v-show` 有更高的初始渲染开销（不管条件如何都会渲染）。

- 如果需要频繁切换，使用 `v-show` 更好
- 如果条件在运行时很少改变，使用 `v-if` 更好

:::

### 4.6. `v-for`

`v-for` 用于基于数组或对象来渲染一个列表：

```html
<template>
  <h2>遍历数组</h2>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }} - {{ item.price }}
    </li>
  </ul>

  <h2>带索引</h2>
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      {{ index + 1 }}. {{ item.name }}
    </li>
  </ul>

  <h2>遍历对象</h2>
  <div v-for="(value, key, index) in userInfo" :key="key">
    {{ index }}. {{ key }}: {{ value }}
  </div>

  <h2>遍历数字范围</h2>
  <span v-for="n in 10" :key="n">{{ n }}、</span>
</template>

<script setup>
  import { ref, reactive } from 'vue'

  const items = ref([
    { id: 1, name: '苹果', price: 5 },
    { id: 2, name: '香蕉', price: 3 },
    { id: 3, name: '橙子', price: 4 },
  ])

  const userInfo = reactive({
    name: '张三',
    age: 25,
    city: '北京',
  })
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-04-28-08-41-25.png)

::: tip 关于 key 的一些注意事项

`v-for` 中的 key 属性非常重要，它帮助 Vue 识别每个节点的身份，从而在数据变化时高效地复用和重新排列现有元素。

key 应该使用唯一且稳定的标识符，通常是数据项的 id。避免使用数组索引作为 key，因为当列表顺序变化时，可能导致渲染错误或性能问题。

:::

### 4.7. 小结

在我们日常项目开发中，上述指令几乎涵盖了 80% 的使用场景。通过合理使用这些指令，我们可以轻松实现数据绑定、事件处理、条件渲染和列表渲染等核心功能，从而构建出功能丰富、交互性强的 Vue 应用。

除了上述提到的这些相对比较常用的内置指令之外，其他常用指令还包括 `v-text`（更新元素的文本内容，类似于 <span v-pre>`{{ }}`</span>）、`v-html`（更新元素的 innerHTML）、`v-once`（只渲染一次，后续数据变化不再更新）、`v-pre`（跳过该元素及其子元素的编译过程）、`v-cloak`（在编译完成前隐藏未渲染的模板）和 `v-memo`（Vue 3.2 引入，用于缓存模板子树以优化性能）。

## 5. 🤔 指令的动态参数与修饰符是什么？

Vue 指令不仅支持静态的参数和值，还支持动态参数和修饰符，这些特性让指令系统更加灵活和强大。掌握动态参数和修饰符的用法，可以编写出更简洁、更富有表现力的模板代码。

### 5.1. 指令的基本结构

指令的基本结构可以表示为 `v-name:argument.modifier="value"`，其中：

- `v-name` 是指令的名称
- `argument` 是指令的参数
- `modifier` 是指令的修饰符
- `value` 是指令的值

以 `v-on:click.prevent="handleSubmit"` 为例，其中：

- `v-on` 是指令名
- `click` 是参数（表示事件类型）
- `prevent` 是修饰符（调用 `event.preventDefault()`）
- `handleSubmit` 是值（事件处理函数）

### 5.2. 动态参数

动态参数允许你使用 JavaScript 表达式来动态指定指令的参数，使用方括号 `[]` 包裹表达式：

```html
<template>
  <!-- 动态属性名 -->
  <!-- 相当于 :href="url" -->
  <a :[attributeName]="url">链接</a>

  <!-- 动态事件名 -->
  <!-- 相当于 @click="handleEvent" -->
  <button @[eventName]="handleEvent">动态事件</button>

  <!-- 实际应用：根据条件决定绑定的属性 -->
  <div :[attrOrProp]="value">动态绑定</div>
</template>

<script setup>
  import { ref } from 'vue'

  const attributeName = ref('href')
  const url = ref('https://vuejs.org')

  const eventName = ref('click')

  const attrOrProp = ref('title')
  const value = ref('一段描述文字')

  function handleEvent() {
    console.log('事件触发了')
  }
</script>
```

- 动态参数的值应该是一个字符串，或者 `null`
- 当值为 `null` 时，该绑定会被移除
- 动态参数也有一些语法限制 => 不能包含空格和引号，因为 HTML 属性名中不允许出现这些字符

对于复杂的动态参数名，建议使用计算属性来代替：

```html
<template>
  <!-- 使用计算属性作为动态参数 -->
  <!-- 相当于 :data-info="message" -->
  <div :[dynamicAttr]="message">动态属性绑定</div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const attrPrefix = ref('data')
  const attrName = ref('info')
  const message = ref('这是一条信息')

  // 将复杂的参数名拼接逻辑放在计算属性中
  // 避免了在模板内直接使用字符串拼接，解决了空格、引号等限制
  const dynamicAttr = computed(() => `${attrPrefix.value}-${attrName.value}`)
  // 结果相当于 :data-info="message"
</script>
```

### 5.3. 修饰符（Modifiers）

修饰符（Modifiers）是以 `.` 开头的特殊后缀，用于指示指令以某种特定方式绑定或处理。Vue 为不同的指令提供了不同的修饰符。

事件修饰符用于 `v-on` 指令，简化了事件处理中的常见操作：

```html
<template>
  <!-- .prevent 阻止默认行为 -->
  <form @submit.prevent="onSubmit">
    <button type="submit">提交</button>
  </form>

  <!-- .stop 阻止事件冒泡 -->
  <div @click="outerClick">
    <button @click.stop="innerClick">不会冒泡</button>
  </div>

  <!-- .once 事件只触发一次 -->
  <button @click.once="doOnce">只触发一次</button>

  <!-- .capture 使用捕获模式 -->
  <div @click.capture="onCapture">捕获阶段处理</div>

  <!-- .self 只在事件来源是元素本身时触发 -->
  <div @click.self="onSelfClick">
    <span>点击 span 不会触发</span>
  </div>

  <!-- .passive 提升滚动性能 -->
  <div @scroll.passive="onScroll">滚动内容</div>

  <!-- 修饰符可以链式使用 -->
  <a @click.stop.prevent="handler">阻止冒泡和默认行为</a>
</template>
```

::: tip 注意修饰符的书写顺序问题

修饰符的执行是有顺序的，链式书写时，前面的修饰符会先执行。例如：

- `@click.prevent.self` 会先阻止默认行为再判断 self
- `@click.self.prevent` 会先判断 self 再阻止默认行为

在使用修饰符时需要注意这一点，以确保达到预期的效果。

:::

按键修饰符用于键盘事件，允许你监听特定的按键：

```html
<template>
  <!-- 常用按键别名 -->
  <input @keyup.enter="onEnter" />
  <input @keyup.tab="onTab" />
  <input @keyup.delete="onDelete" />
  <input @keyup.esc="onEsc" />
  <input @keyup.space="onSpace" />
  <input @keyup.up="onUp" />
  <input @keyup.down="onDown" />
  <input @keyup.left="onLeft" />
  <input @keyup.right="onRight" />

  <!-- 系统修饰键 -->
  <input @keyup.ctrl.enter="onCtrlEnter" />
  <div @click.ctrl="onCtrlClick">Ctrl + 点击</div>
  <div @click.alt="onAltClick">Alt + 点击</div>
  <div @click.shift="onShiftClick">Shift + 点击</div>
  <div @click.meta="onMetaClick">Meta + 点击</div>

  <!-- .exact 修饰符：精确匹配 -->
  <button @click.ctrl.exact="onCtrlOnly">仅 Ctrl + 点击</button>
  <button @click.exact="onClickOnly">没有任何修饰键的点击</button>
</template>
```

鼠标按键修饰符用于限制鼠标事件的触发按键：

```html
<template>
  <div @click.left="onLeftClick">左键点击</div>
  <div @click.right="onRightClick">右键点击</div>
  <div @click.middle="onMiddleClick">中键点击</div>
</template>
```

`v-model` 修饰符用于调整双向绑定的行为：

```html
<template>
  <!-- .lazy 将 input 事件改为 change 事件 -->
  <input v-model.lazy="msg" />

  <!-- .number 自动转为数字类型 -->
  <input v-model.number="age" type="number" />

  <!-- .trim 自动去除首尾空格 -->
  <input v-model.trim="name" />

  <!-- 多个修饰符组合 -->
  <input v-model.lazy.trim="search" />
</template>
```

## 6. 🤔 Class 与 Style 绑定的高级用法有哪些？

Vue 对 class 和 style 的绑定做了专门的增强处理，除了支持字符串之外，还支持对象语法和数组语法。这些增强让动态 class 和样式的管理变得更加直观和高效，是实际开发中使用频率非常高的特性。

### 6.1. class 绑定

Class 的对象语法允许你传入一个对象，以动态地切换 class。对象的键是 class 名称，值是一个布尔表达式，为 true 时该 class 会被添加，为 false 时会被移除：

```html
<template>
  <!-- 基本对象语法 -->
  <div :class="{ active: isActive, 'text-danger': hasError }"></div>

  <!-- 与普通 class 共存 -->
  <div class="static-class" :class="{ active: isActive }"></div>
  <!-- 渲染结果：<div class="static-class active"></div> -->

  <!-- 绑定一个计算属性对象 -->
  <div :class="classObject"></div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const isActive = ref(true)
  const hasError = ref(false)

  const classObject = computed(() => ({
    active: isActive.value && !hasError.value,
    'text-danger': hasError.value,
    'font-bold': isActive.value,
  }))
</script>
```

Class 的数组语法允许你传入一个数组，将多个 class 名称组合在一起：

```html
<template>
  <!-- 基本数组语法 -->
  <div :class="[activeClass, errorClass]"></div>

  <!-- 在数组中使用三元表达式 -->
  <div :class="[isActive ? 'active' : '', errorClass]"></div>

  <!-- 数组语法中嵌套对象语法 -->
  <div :class="[{ active: isActive }, errorClass]"></div>

  <!-- 复杂场景：根据多种条件动态组合 class -->
  <button :class="buttonClasses">按钮</button>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const activeClass = ref('active')
  const errorClass = ref('text-danger')
  const isActive = ref(true)

  const size = ref('large')
  const type = ref('primary')
  const isDisabled = ref(false)

  const buttonClasses = computed(() => [
    'btn',
    `btn-${type.value}`,
    `btn-${size.value}`,
    {
      'btn-disabled': isDisabled.value,
      'btn-active': isActive.value,
    },
  ])
</script>
```

在子组件上使用 class 绑定时，class 会被添加到子组件的根元素上。

```html
<!-- 子组件 MyButton.vue -->
<template>
  <!-- 单根元素：class 自动应用到根元素 -->
  <button class="btn">
    <slot />
  </button>
</template>

<!-- 父组件中使用 -->
<template>
  <!-- 结果：<button class="btn active large"> -->
  <MyButton class="active large">点击我</MyButton>
</template>
```

如果子组件有多个根元素，可以通过 `$attrs.class` 来指定哪个元素接收 class：

```html
<!-- 多根元素组件 -->
<template>
  <header>标题</header>
  <main :class="$attrs.class">内容</main>
  <footer>底部</footer>
</template>
```

### 6.2. style 绑定

Style 的对象语法允许你传入一个 JavaScript 对象来绑定内联样式。CSS 属性名可以使用驼峰命名（camelCase）或短横线分隔命名（kebab-case，需要用引号包裹）：

```html
<template>
  <!-- 对象语法 -->
  <div :style="{ color: textColor, fontSize: fontSize + 'px' }"></div>

  <!-- kebab-case 写法 -->
  <div
    :style="{ 'font-size': fontSize + 'px', 'background-color': bgColor }"
  ></div>

  <!-- 绑定样式对象 -->
  <div :style="styleObject"></div>

  <!-- 复杂样式计算 -->
  <div :style="cardStyles"></div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const textColor = ref('#333')
  const fontSize = ref(16)
  const bgColor = ref('#f5f5f5')

  const styleObject = ref({
    color: 'red',
    fontSize: '14px',
    padding: '10px',
  })

  const width = ref(300)
  const isElevated = ref(true)

  const cardStyles = computed(() => ({
    width: width.value + 'px',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: isElevated.value ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
    transition: 'box-shadow 0.3s ease',
  }))
</script>
```

Style 的数组语法允许你将多个样式对象合并应用到同一个元素上：

```html
<template>
  <div :style="[baseStyles, overrideStyles]"></div>
</template>

<script setup>
  import { reactive } from 'vue'

  const baseStyles = reactive({
    fontSize: '14px',
    color: '#333',
    padding: '10px',
  })

  const overrideStyles = reactive({
    color: 'red',
    fontWeight: 'normal',
  })
  // 最终效果：fontSize: 14px, color: red, padding: 10px, fontWeight: normal
</script>
```

Vue 会自动为需要添加浏览器前缀的 CSS 属性添加前缀。例如，当你使用 transform 属性时，Vue 会在运行时检测当前浏览器支持哪种前缀形式，自动添加 -webkit-transform、-ms-transform 等。

Vue 还支持为样式属性提供多个值，浏览器会使用最后一个它所支持的值：

```html
<template>
  <!-- 浏览器会使用它支持的最后一个值 -->
  <div :style="{ display: ['-webkit-flex', '-ms-flexbox', 'flex'] }"></div>
</template>
```

在实际开发中，一些实用的 class 和 style 绑定模式值得关注。BEM 命名规范与动态 class 结合的模式特别常见：

```html
<template>
  <div
    :class="[
      'card',
      `card--${theme}`,
      {
        'card--bordered': bordered,
        'card--hoverable': hoverable,
        'card--loading': loading,
      },
    ]"
    :style="{
      '--card-padding': padding + 'px',
      '--card-radius': radius + 'px',
    }"
  >
    <div class="card__header">
      <slot name="header" />
    </div>
    <div class="card__body">
      <slot />
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    theme: { type: String, default: 'light' },
    bordered: { type: Boolean, default: true },
    hoverable: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    padding: { type: Number, default: 16 },
    radius: { type: Number, default: 8 },
  })
</script>

<style scoped>
  .card {
    padding: var(--card-padding);
    border-radius: var(--card-radius);
  }
</style>
```

通过 `:style` 绑定 CSS 自定义属性（CSS Variables）是一种很好的实践方式，它可以让组件样式的动态化更加灵活和高性能。

Vue 3 还提供了专门的 CSS `v-bind` 语法，可以直接在 style 标签中使用组件响应式数据：

```html
<template>
  <div class="box">动态样式的盒子</div>
</template>

<script setup>
  import { ref } from 'vue'

  const color = ref('#42b883')
  const fontSize = ref(16)
</script>

<style scoped>
  .box {
    color: v-bind(color);
    font-size: v-bind(fontSize + 'px');
  }
</style>
```
