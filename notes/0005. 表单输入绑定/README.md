# [0005. 表单输入绑定](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0005.%20%E8%A1%A8%E5%8D%95%E8%BE%93%E5%85%A5%E7%BB%91%E5%AE%9A)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是 `v-model` 指令？](#3--什么是-v-model-指令)
- [4. 🤔 `v-model` 在不同表单元素上的用法有什么不同？](#4--v-model-在不同表单元素上的用法有什么不同)
  - [4.1. 文本输入框（input / textarea）](#41-文本输入框input--textarea)
  - [4.2. 复选框（checkbox）](#42-复选框checkbox)
  - [4.3. 单选框（radio）](#43-单选框radio)
  - [4.4. 下拉选择框（select）](#44-下拉选择框select)
- [5. 🤔 `v-model` 有哪些修饰符？](#5--v-model-有哪些修饰符)
  - [5.1. `.lazy` - 在 change 事件后同步](#51-lazy---在-change-事件后同步)
  - [5.2. `.number` - 自动转为数字](#52-number---自动转为数字)
  - [5.3. `.trim` - 自动去除首尾空格](#53-trim---自动去除首尾空格)
- [6. 🔗 引用](#6--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 使用 `v-model` 实现表单输入的双向绑定
- `v-model` 在不同表单元素上的用法（input、textarea、checkbox、radio、select）
- 表单修饰符（`.lazy`、`.number`、`.trim`）

## 2. 🫧 评价

这篇笔记主要是参考 [Vue.js 官方文档 - 表单输入绑定][1] 来写的，可以结合着一起看。

## 3. 🤔 什么是 `v-model` 指令？

`v-model` 是 Vue 提供的一个指令，用于在表单元素上实现数据的双向绑定。它将数据绑定和事件监听合二为一，让表单输入的处理变得非常简单。

```html
<template>
  <input v-model="message" placeholder="输入内容" />
  <p>你输入的内容是：{{ message }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const message = ref('')
</script>
```

当用户在输入框中输入内容时，`message` 的值会自动更新；同时，如果 `message` 的值通过代码发生了变化，输入框中显示的内容也会自动更新。

本质上，`v-model` 是以下写法的语法糖：

```html
<input :value="message" @input="message = $event.target.value" />
```

## 4. 🤔 `v-model` 在不同表单元素上的用法有什么不同？

### 4.1. 文本输入框（input / textarea）

对于单行文本输入框和多行文本框，`v-model` 绑定的是 `value` 属性，监听 `input` 事件：

```html
<template>
  <!-- 单行文本 -->
  <input v-model="username" placeholder="请输入用户名" />

  <!-- 多行文本 -->
  <textarea v-model="bio" placeholder="请输入个人简介"></textarea>
</template>

<script setup>
  import { ref } from 'vue'

  const username = ref('')
  const bio = ref('')
</script>
```

### 4.2. 复选框（checkbox）

`v-model` 绑定复选框时，如果是单个复选框，绑定的是布尔值（选中/未选中）；如果是多个复选框，绑定的是数组，数组中包含所有选中的复选框的 `value`。

```html
<template>
  <!-- 单个复选框 -->
  <input type="checkbox" id="agree" v-model="agree" />
  <label for="agree">同意用户协议</label>

  <!-- 多个复选框 -->
  <input type="checkbox" value="html" v-model="skills" />
  <label>HTML</label>
  <input type="checkbox" value="css" v-model="skills" />
  <label>CSS</label>
  <input type="checkbox" value="js" v-model="skills" />
  <label>JavaScript</label>

  <p>选中的技能：{{ skills }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const agree = ref(false)
  const skills = ref([])
</script>
```

### 4.3. 单选框（radio）

`v-model` 绑定单选框时，所有具有相同 `v-model` 的单选框为一组，选中项的值会同步到绑定的数据中：

```html
<template>
  <input type="radio" value="male" v-model="gender" />
  <label>男</label>
  <input type="radio" value="female" v-model="gender" />
  <label>女</label>

  <p>选择的性别：{{ gender }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const gender = ref('')
</script>
```

### 4.4. 下拉选择框（select）

`v-model` 绑定下拉选择框时，绑定的是当前选中项的 `value`。支持单选和多选（添加 `multiple` 属性）：

```html
<template>
  <!-- 单选 -->
  <select v-model="selectedCity">
    <option disabled value="">请选择城市</option>
    <option value="beijing">北京</option>
    <option value="shanghai">上海</option>
    <option value="shenzhen">深圳</option>
  </select>

  <!-- 多选（绑定数组） -->
  <select v-model="selectedCities" multiple>
    <option value="beijing">北京</option>
    <option value="shanghai">上海</option>
    <option value="shenzhen">深圳</option>
  </select>

  <p>选中的城市：{{ selectedCity }}</p>
  <p>选中的城市（多选）：{{ selectedCities }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const selectedCity = ref('')
  const selectedCities = ref([])
</script>
```

## 5. 🤔 `v-model` 有哪些修饰符？

### 5.1. `.lazy` - 在 change 事件后同步

默认情况下，`v-model` 会在 `input` 事件触发时同步数据（即每次按键都更新）。添加 `.lazy` 修饰符后，改为在 `change` 事件触发时同步（即失焦或回车后更新）：

```html
<!-- 输入框失去焦点后才会更新 message -->
<input v-model.lazy="message" />
```

### 5.2. `.number` - 自动转为数字

默认情况下，`v-model` 绑定的输入值始终是字符串类型。添加 `.number` 修饰符后，输入值会自动转为数字类型：

```html
<!-- age 的值会被自动转为数字，而非字符串 -->
<input v-model.number="age" type="number" />
```

### 5.3. `.trim` - 自动去除首尾空格

```html
<!-- 用户输入的内容会自动去除首尾空格 -->
<input v-model.trim="username" />
```

修饰符可以组合使用：

```html
<!-- 失去焦点后同步，且自动转为数字 -->
<input v-model.lazy.number="age" />
```

## 6. 🔗 引用

- [Vue.js 官方文档 - 表单输入绑定][1]

[1]: https://cn.vuejs.org/guide/essentials/forms
