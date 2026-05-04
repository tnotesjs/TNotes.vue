# [0005. 表单输入绑定（v-model）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0005.%20%E8%A1%A8%E5%8D%95%E8%BE%93%E5%85%A5%E7%BB%91%E5%AE%9A%EF%BC%88v-model%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 什么是 `v-model` 指令？](#3--什么是-v-model-指令)
- [4. 🤔 组件上的 `v-model` 是怎么工作的？](#4--组件上的-v-model-是怎么工作的)
- [5. 🤔 `v-model` 在不同表单元素上的用法有什么不同？](#5--v-model-在不同表单元素上的用法有什么不同)
  - [5.1. 文本输入框（input / textarea）](#51-文本输入框input--textarea)
  - [5.2. 复选框（checkbox）](#52-复选框checkbox)
    - [单个复选框](#单个复选框)
    - [多个复选框](#多个复选框)
    - [`true-value` 和 `false-value`](#true-value-和-false-value)
  - [5.3. 单选框（radio）](#53-单选框radio)
  - [5.4. 下拉选择框（select）](#54-下拉选择框select)
- [6. 🤔 `v-model` 有哪些修饰符？](#6--v-model-有哪些修饰符)
  - [6.1. `.lazy` - 在 change 事件后同步](#61-lazy---在-change-事件后同步)
  - [6.2. `.number` - 自动转为数字](#62-number---自动转为数字)
  - [6.3. `.trim` - 自动去除首尾空格](#63-trim---自动去除首尾空格)
- [7. 🤔 `true-value` 和 `false-value` 只能在复选框 + `v-model` 的场景中使用吗？](#7--true-value-和-false-value-只能在复选框--v-model-的场景中使用吗)
- [8. 🤔 为什么官方文档建议给单选 `<select>` 放一个空值的禁用占位项？](#8--为什么官方文档建议给单选-select-放一个空值的禁用占位项)
- [9. 🤔 v-model 的 IME 效果是如何实现的？为何我们手写 `@input` 事件加 `:value` 绑定无法实现类似的 IME 呢？](#9--v-model-的-ime-效果是如何实现的为何我们手写-input-事件加-value-绑定无法实现类似的-ime-呢)
  - [9.1. 核心原理：v-model 是如何实现 IME 的“防干扰”效果的？](#91-核心原理v-model-是如何实现-ime-的防干扰效果的)
    - [监听三个关键事件](#监听三个关键事件)
    - [设置“锁”标记（`composing`）](#设置锁标记composing)
    - [`input` 事件中的守卫](#input-事件中的守卫)
  - [9.2. 为什么我们手写的 `@input` + `:value` 会失效？](#92-为什么我们手写的-input--value-会失效)
    - [缺少“锁”机制](#缺少锁机制)
    - [响应式系统的“回弹”冲突](#响应式系统的回弹冲突)
  - [9.3. 如果非要手写，该如何实现？](#93-如果非要手写该如何实现)
  - [9.4. 总结对比](#94-总结对比)
- [10. 🔗 引用](#10--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- `v-model` 指令本质介绍
- 使用 `v-model` 实现表单输入的双向绑定
- `v-model` 在不同表单元素上的用法（input、textarea、checkbox、radio、select）
- `true-value` 和 `false-value` 的基本用法
- `v-model` 修饰符（`.lazy`、`.number`、`.trim`）

## 2. 🫧 评价

记住一句话：`v-model` 本质就是「语法糖」，它把「值绑定」和「事件监听」合成了一个更简洁的写法。理解了这个本质，你就能更好地理解 `v-model` 的行为和使用场景了。

如果你觉得 `v-model` 的“魔法味儿”太重，直接手写：「值绑定」（比如 `:value`） + 「事件监听」（比如 `@input`）的逻辑也是完全可以的。

## 3. 🤔 什么是 `v-model` 指令？

`v-model` 是 Vue 为表单场景提供的语法糖。它把“值绑定”和“变更监听”合并成了一个统一写法，让你可以直接把表单值同步到响应式状态上。

下面这个示例把“手写双向绑定”和“使用 `v-model`”放在同一个组件里对比，读起来会更直观：

```html
<template>
  <h1>【做法 1】手写双向绑定</h1>
  <input
    type="text"
    :value="textContent1"
    @input="(e) => (textContent1 = e.target.value)"
  />
  <p>你当前输入的内容为：{{ textContent1 }}</p>

  <hr />

  <h1>【做法 2】使用 v-model 实现双向绑定</h1>
  <input type="text" v-model="textContent2" />
  <p>你当前输入的内容为：{{ textContent2 }}</p>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const textContent1 = ref('')
  const textContent2 = ref('')
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-22-47-23.png)

这个示例的前半段是手写 `:value + @input`，后半段是 `v-model`。两者的大方向是一致的，都在做同一件事：把用户输入同步到响应式数据，再让响应式数据驱动页面更新。

你也可以把这个示例当成一个很好的 IME 对比例子来看。使用中文输入法时，手写 `@input` 往往会在输入过程中持续更新，而 `v-model` 默认不会在拼字阶段立即同步，这也是它和“完全手写”之间一个经常被忽略的差异。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-22-54-44.png)

::: tip IME 简介

IME 是 Input Method Editor（输入法编辑器） 的缩写，是一种操作系统组件，用于帮助用户输入键盘上不直接存在的字符，常见于中文、日文、韩文等语言的输入。

在使用拼音、假名等输入时，用户会经历一个“拼字阶段”（composition），此时文字还未最终确定，`v-model` 会忽略这一阶段的输入，直到组合文字确认后才更新数据，从而避免把中间状态的拼音字母同步到状态中。

:::

但要注意，`v-model` 并不是“以 HTML 上已有的 attribute 为准”，而是始终以 JavaScript 里的响应式状态为准。下面这个示例里，输入框最终显示的是 `from-state`，而不是 `value` attribute 里的 `from-attr`：

```html
<template>
  <h2>没有 v-model</h2>
  <input value="from-attr" />
  <h2>有 v-model</h2>
  <input v-model="message" value="from-attr" />
  <p>{{ message }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const message = ref('from-state')
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-03-23-48-02.png)

这个规则同样适用于 `checked` 和 `selected`。因此，学习 `v-model` 时最重要的结论就是：不要把表单初始值交给 HTML attribute，应该交给 Vue 的响应式数据。

不同表单元素使用的底层组合并不相同：

- 文本类 `input` 和 `textarea`：绑定 `value`，监听 `input`
- `checkbox` 和 `radio`：绑定 `checked`，监听 `change`
- `select`：绑定 `value`，监听 `change`

## 4. 🤔 组件上的 `v-model` 是怎么工作的？

`v-model` 不只能用在原生表单元素上，也可以用于自定义组件。你可以把组件理解成“包装过的输入控件”，只要它暴露出统一的双向绑定接口，父组件就可以像操作原生输入框一样去操作它。

在 Vue 3.4+ 中，最简洁的写法是使用 `defineModel()`：

::: code-group

```html [TextInput.vue]
<template>
  <input v-model="model" />
</template>

<script setup>
  const model = defineModel()
</script>
```

```html [App.vue]
<template>
  <TextInput v-model="title" />
  <p>{{ title }}</p>
</template>

<script setup>
  import { ref } from 'vue'
  import TextInput from './TextInput.vue'

  const title = ref('')
</script>
```

:::

父组件并不关心子组件内部是 `<input>`、`<textarea>` 还是更复杂的 UI，它只关心这个组件支持 `v-model`。这也是 Vue 组件封装表单控件的基础能力。

## 5. 🤔 `v-model` 在不同表单元素上的用法有什么不同？

虽然都叫 `v-model`，但不同表单元素绑定出来的值类型、同步时机和注意事项都不一样。理解这些差异，比死记语法更重要。

### 5.1. 文本输入框（input / textarea）

文本输入框和多行文本框是最常见的用法，绑定结果通常是字符串。单行 `input` 的写法在上一个小节已经看过了，这里继续看 `textarea` 的绑定：

```html
<template>
  <textarea cols="30" rows="10" v-model="textContent"></textarea>
  <p>你当前输入的内容如下：</p>
  <pre>{{ textContent }}</pre>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const textContent = ref('')
</script>
```

这里有两个很容易忽略的细节：

第一，`<textarea>` 不支持插值表达式。下面这种写法是错误的：

```html
<!-- ❌ 错误写法： -->
<textarea>{{ text }}</textarea>

<!-- ✅ 正确写法应该是： -->
<textarea v-model="text"></textarea>
```

第二，使用中文、日文、韩文等需要 IME 拼字的输入法时，`v-model` 不会在拼字阶段立即更新，而会等到组合输入结束后再同步。这通常是符合预期的，因为拼字过程中的内容并不稳定。

如果你的业务就是需要在拼字阶段也实时拿到输入值，那么不要用 `v-model`，直接改成显式绑定和监听：

```html
<template>
  <input :value="keyword" @input="keyword = $event.target.value" />
  <p>{{ keyword }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const keyword = ref('')
</script>
```

### 5.2. 复选框（checkbox）

复选框既能表示布尔值，也能表示一组选中的值。

#### 单个复选框

单个复选框最常见的结果是布尔值，下面先看一个最直接的例子：

```html
<template>
  <input type="checkbox" v-model="checked" />
  <button @click="checked = !checked">切换选中</button>
  <p>checked: {{ checked }}</p>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const checked = ref(true)
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-05-43-45.png)

- 用户可以点击复选框来切换 `checked` 的值
- 也可以点击按钮来切换 `checked` 的值

#### 多个复选框

如果多个复选框共用同一个 `v-model`，那么绑定值会变成数组。

```html {4}
<template>
  <div v-for="(item, index) in arr" :key="index">
    <label :for="item.id">{{ item.title }}</label>
    <input type="checkbox" v-model="hobby" :id="item.id" :value="item" />
  </div>

  <p>hobby:</p>
  <pre>{{ hobby }}</pre>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const hobby = ref([])
  const arr = ref([
    { id: 'swim', title: '游泳', more_info: '...' },
    { id: 'run', title: '跑步', more_info: '...' },
    { id: 'game', title: '游戏', more_info: '...' },
    { id: 'music', title: '音乐', more_info: '...' },
    { id: 'movie', title: '电影', more_info: '...' },
  ])
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-05-45-37.png)

这个例子里最值得留意的是 `:value="item"`。它说明复选框绑定到数组时，放进去的不一定非得是字符串，你完全可以把一个对象塞进去。

`:value="xxx"` 其中 xxx 表达的含义是：

- 当这个选项被选中时，xxx 这个值会被添加到绑定的数组里
- 当这个选项被取消选中时，xxx 这个值会从绑定的数组里被移除

如果你把 `:value` 写成普通字符串（比如你只想获取到选中的爱好的 ID 信息可以写 `:value="item.id"`），那么最终拿到的也会是字符串，而不是对象：

```html {4}
<template>
  <div v-for="(item, index) in arr" :key="index">
    <label :for="item.id">{{ item.title }}</label>
    <input type="checkbox" v-model="hobby" :id="item.id" :value="item.id" />
  </div>

  <p>hobby:</p>
  <pre>{{ hobby }}</pre>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const hobby = ref([])
  const arr = ref([
    { id: 'swim', title: '游泳', more_info: '...' },
    { id: 'run', title: '跑步', more_info: '...' },
    { id: 'game', title: '游戏', more_info: '...' },
    { id: 'music', title: '音乐', more_info: '...' },
    { id: 'movie', title: '电影', more_info: '...' },
  ])
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-05-48-08.png)

#### `true-value` 和 `false-value`

如果你不想得到 `true` / `false`，而是希望选中和未选中分别映射成别的值，可以使用 `true-value` 和 `false-value`：

```html
<template>
  <input type="checkbox" v-model="checked1" />
  <button @click="checked1 = !checked1">切换选中</button>
  <p>checked1: {{ checked1 }}</p>

  <input
    type="checkbox"
    v-model="checked2"
    :true-value="customTrue"
    :false-value="customFalse"
  />
  <button @click="toggle">切换选中</button>
  <p>checked2: {{ checked2 }}</p>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const checked1 = ref(true)

  const checked2 = ref('yes')
  const customTrue = ref('yes')
  const customFalse = ref('no')

  function toggle() {
    checked2.value =
      checked2.value === customTrue.value ? customFalse.value : customTrue.value
  }
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-06-50-42.png)

这两个 attribute 是 Vue 专门为 `v-model` 提供的扩展能力，仅支持和 `v-model` 配套使用。它们影响的是 `v-model` 绑定值，不会改变 `input` 本身的 `value` attribute。浏览器以原生方式提交表单时，未选中的 checkbox 仍然不会被提交。如果你希望 `yes` / `no` 这类两个值中的一个一定被提交，更适合使用 radio。

### 5.3. 单选框（radio）

单选框的本质是“从多个候选值中选一个”，下面先看最基础的字符串绑定：

```html
<template>
  <p>
    <label for="male">男</label>
    <input type="radio" id="male" v-model="gender" value="male" />
  </p>

  <p>
    <label for="female">女</label>
    <input type="radio" id="female" v-model="gender" value="female" />
  </p>

  <p>
    <label for="secret">保密</label>
    <input type="radio" id="secret" v-model="gender" value="secret" />
  </p>

  <p>gender: {{ gender }}</p>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  // gender 默认值是 secret，页面上会默认选中“保密”这个选项
  const gender = ref('secret')
  // 间隔 3s 之后，gender 会被修改成 male，页面上会自动切换到“男”这个选项
  setTimeout(() => {
    gender.value = 'male'
  }, 3000)
</script>
```

::: swiper

![初始状态](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-17-30-52.png)

![3s 后状态](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-17-30-59.png)

:::

双向绑定：

- 用户可以点击单选框来切换 `gender` 的值
- 也可以通过代码修改 `gender` 的值来切换选中项

如果你把 `value` 写成普通的字符串，最终拿到的也会是字符串。如果你需要的是一个对象，那么就必须使用 `:value` 来绑定一个 JS 表达式，Vue 才会把真正的 JS 值放进去。比如：

```html
<template>
  <label>
    <input type="radio" v-model="plan" :value="basicPlan" />
    基础版
  </label>
  <label>
    <input type="radio" v-model="plan" :value="proPlan" />
    专业版
  </label>

  <p>选中：{{ plan.name }}</p>

  <pre>plan: {{ plan }}</pre>
</template>

<script setup>
  import { ref } from 'vue'

  const basicPlan = { id: 1, name: '基础版' }
  const proPlan = { id: 2, name: '专业版' }
  const plan = ref(basicPlan)
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-17-30-37.png)

### 5.4. 下拉选择框（select）

`<select>` 的单选模式通常绑定一个值，多选模式通常绑定一个数组。

```html
<template>
  <select v-model="hometown1">
    <option value="" disabled>请选择</option>
    <option v-for="(item, index) in hometownList" :key="index" :value="item">
      {{ item.value }}
    </option>
  </select>

  <p>您选择的家乡为：</p>
  <pre>{{ hometown1 }}</pre>

  <select v-model="hometown2" multiple>
    <option value="" disabled>请选择</option>
    <option v-for="(item, index) in hometownList" :key="index" :value="item">
      {{ item.value }}
    </option>
  </select>

  <p>您选择的家乡为：</p>
  <pre>{{ hometown2 }}</pre>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const hometown1 = ref('')
  const hometown2 = ref([])
  const hometownList = ref([
    { key: '成都', value: '成都' },
    { key: '帝都', value: '北京' },
    { key: '魔都', value: '上海' },
    { key: '妖都', value: '广州' },
    { key: '陪都', value: '重庆' },
  ])
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-17-34-57.png)

## 6. 🤔 `v-model` 有哪些修饰符？

修饰符的作用主要是调整 `v-model` 的同步时机或对输入值做轻量转换处理。

Vue 内置的 v-model 修饰符一共有 3 个：

| 修饰符 | 作用 |
| --- | --- |
| `.lazy` | 将 `input` 事件改为 `change` 事件触发同步（失去焦点/回车时才更新） |
| `.number` | 将输入值自动转为数字类型 |
| `.trim` | 自动去除输入值首尾的空格 |

```html
<input v-model.lazy="msg" />
<input v-model.number="age" />
<input v-model.trim="name" />

<!-- 三者可以组合使用： -->
<input v-model.lazy.trim="msg" />
<!-- 这表示“失焦后再同步，并且同步前先去掉首尾空格”。 -->
```

下面是一个基本示例：

```html
<template>
  <h3>v-model="msg"</h3>
  <input type="text" v-model="msg" />
  <p>你输入的是：{{ msg }}</p>
  <p>类型为：{{ typeof msg }}</p>
  <p>长度为：{{ msg.length }}</p>

  <h3>v-model.lazy="msg1"</h3>
  <input type="text" v-model.lazy="msg1" />
  <p>你输入的是：{{ msg1 }}</p>
  <p>类型为：{{ typeof msg1 }}</p>
  <p>长度为：{{ msg1.length }}</p>

  <h3>v-model.number="msg2"</h3>
  <input type="text" v-model.number="msg2" />
  <p>你输入的是：{{ msg2 }}</p>
  <p>类型为：{{ typeof msg2 }}</p>
  <p>长度为：{{ msg2.length }}</p>

  <h3>v-model.trim="msg3"</h3>
  <input type="text" v-model.trim="msg3" />
  <p>你输入的是：{{ msg3 }}</p>
  <p>类型为：{{ typeof msg3 }}</p>
  <p>长度为：{{ msg3.length }}</p>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  const msg = ref('')
  const msg1 = ref('')
  const msg2 = ref('')
  const msg3 = ref('')
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-18-06-45.png)

实际交互效果可以丢到 [Vue Playground][3] 中在线体验。

### 6.1. `.lazy` - 在 change 事件后同步

默认情况下，文本输入框会在每次 `input` 事件后立刻同步。`.lazy` 会把这个时机改成 `change`，也就是通常要等输入完成、失焦或确认后才更新。上面那个示例里的第二组输入框就是这个效果。

这个修饰符适合“过程中不需要同步，确认后再同步”的场景，比如搜索条件输入、昵称编辑等。

### 6.2. `.number` - 自动转为数字

如果输入框里的内容本来就应该是数字，那么可以加上 `.number`，让 Vue 在同步时尝试帮你做一次数字转换。上面示例里的第三组输入框就是在专门观察这个行为。

这里有两个细节要记住：

- `.number` 内部使用的是 `parseFloat()` 风格的转换逻辑
- 当输入为空，或者当前值没法转成数字时，Vue 会保留原始值，而不是强行给你一个 `NaN`

因此，`.number` 的作用更像是“尽量转成数字”，而不是“绝对保证结果一定是 number”。

### 6.3. `.trim` - 自动去除首尾空格

`.trim` 会在同步前自动去掉用户输入内容两端的空格。上面示例里的第四组输入框就是它，对照着输入前后带空格的内容看，会很容易观察到差异。它很适合用户名、搜索词、标签名这类不希望首尾空白参与业务判断的场景。

## 7. 🤔 `true-value` 和 `false-value` 只能在复选框 + `v-model` 的场景中使用吗？

是的，`true-value` 和 `false-value` 只在 `checkbox` + `v-model` 的组合下才生效。

如果脱离 `v-model`，它们没有作用：

```html
<!-- ❌ 没有 v-model，true-value 无效 -->
<input type="checkbox" true-value="yes" false-value="no" />
```

浏览器不认识这两个属性，会直接忽略。Vue 也不会对它们做任何处理。

它们本质上是 `v-model` 的内部指令，Vue 在编译 `v-model` 时，会检测 `true-value` / `false-value`，然后执行类似下面这样的逻辑：

```js
// Vue 内部大致做的事
if (el.checked) {
  value = el._trueValue // 来自 true-value
} else {
  value = el._falseValue // 来自 false-value
}
```

没有 `v-model`，这段逻辑根本不会触发。

| 组合                                              | 效果                  |
| ------------------------------------------------- | --------------------- |
| checkbox + v-model + `true-value` / `false-value` | 有效                  |
| checkbox + v-model，不加                          | 默认 `true` / `false` |
| checkbox，不加 v-model                            | 无效，被忽略          |
| 非 checkbox 元素                                  | 无效，被忽略          |

## 8. 🤔 为什么官方文档建议给单选 `<select>` 放一个空值的禁用占位项？

先来看看官方文档的原话：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-17-44-31.png)

如果你的需求场景是让单选的 select 在初始状态下不要选中任何一个选项，那么就需要在 `<select>` 里放一个空值的占位项。这个占位项的作用是为了兼容 IOS 上的特殊行为。

如果 `v-model` 的初始值匹配不到任何一个 `<option>`，`<select>` 会进入“未选择”状态。但是在 iOS 上，这会导致用户第一次选择第一项时不触发 `change` 事件，体验效果就是“第一次选择时无法选第一项”。给它加一个空值 `<option disabled value="">Please select one</option>` 占位项，本质上是在显式告诉用户和浏览器：“默认还没选”。

如果你的需求场景是单选的 select 在初始状态下就要选中一个选项，那么就不需要加占位项了，直接把 `v-model` 的初始值设置成某个选项的值即可。

## 9. 🤔 v-model 的 IME 效果是如何实现的？为何我们手写 `@input` 事件加 `:value` 绑定无法实现类似的 IME 呢？

简单来说，`v-model` 之所以能完美处理中文输入法（IME），是因为它在底层不仅绑定了 `input` 事件，还额外监听了「输入法特有的组合事件（Composition Events）」，并利用了一个标记位来过滤掉拼字过程中的中间状态。

如果你只手写 `:value` 和 `@input`，你实际上绕过了 Vue 内置的这套“防干扰机制”，导致数据在拼音未上屏时就被强制更新了。

下面将详细拆解 `v-model` 的 IME 实现原理，以及为什么手写会失效：

### 9.1. 核心原理：v-model 是如何实现 IME 的“防干扰”效果的？

当你在中文输入法下输入“你好”时，过程其实是分两步的：

1. 拼字阶段（Composition）：你输入 `n` `i` `h` `a` `o`，此时屏幕上显示的是拼音，但还没变成汉字。
2. 上屏阶段（Commit）：你按下空格或回车，拼音变成了汉字“你好”。

`v-model` 的底层实现逻辑如下：

#### 监听三个关键事件

除了标准的 `input` 事件，Vue 还会自动监听 `compositionstart`（开始输入拼音）和 `compositionend`（拼音转汉字结束）。

#### 设置“锁”标记（`composing`）

- 当触发 `compositionstart` 时，Vue 会在 DOM 元素上设置一个属性 `e.target.composing = true`。这相当于挂起了一把“锁”，告诉系统：“用户正在拼字，别更新数据”。
- 当触发 `compositionend` 时，Vue 将 `e.target.composing` 设为 `false`，并手动触发一次 `input` 事件。

#### `input` 事件中的守卫

`v-model` 生成的 `input` 事件回调函数中，有一行关键的判断代码：

```js
on: {
  "input": function($event) {
    // 如果正在拼字（composing 为 true），直接返回，不更新数据
    if ($event.target.composing) return;
    // 只有非拼字状态，才更新 Vue 的状态
    message = $event.target.value
  }
}
```

总结：`v-model` 通过“锁”机制，保证了只有当汉字真正“落袋为安”（上屏）后，才会同步数据到 JavaScript 变量中。

### 9.2. 为什么我们手写的 `@input` + `:value` 会失效？

当你尝试用原生方式模拟 `v-model` 时，代码通常是这样的：

```html
<!-- 你的手写代码 -->
<input :value="text" @input="text = $event.target.value" />
```

失效原因分析：

#### 缺少“锁”机制

原生的 `input` 事件非常“勤劳”，只要输入框内容变了（哪怕只是输入了一个拼音字母 `n`），它就会立即触发。你的代码没有判断 `compositionstart`，所以 Vue 的响应式数据会被迫跟随每一个拼音字母变化。

#### 响应式系统的“回弹”冲突

- 你输入 `n` -> 触发 `@input` -> `text` 变为 `n`。
- Vue 数据变了 -> 触发视图更新 -> `:value="text"` 将 `n` 写回 input 的 value 属性。
- 冲突点：此时输入法还在候选词阶段，它期望输入框保持某种内部状态以便你选词。但 Vue 强行把 value 设为 `n`，这往往会打断输入法的选词逻辑，或者导致光标跳动、输入框内容被截断。

### 9.3. 如果非要手写，该如何实现？

如果你需要在某些组件（如 Element UI 的 `el-input` 或自定义组件）中复现 `v-model` 的 IME 效果，你需要手动实现那套“锁”逻辑。

正确的“手写”做法：

```html
<template>
  <input
    :value="text"
    @input="handleInput"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
  />
</template>

<script>
  export default {
    data() {
      return {
        text: '',
        isComposing: false, // 1. 定义一个锁
      }
    },
    methods: {
      handleCompositionStart() {
        this.isComposing = true // 2. 拼字开始，上锁
      },
      handleCompositionEnd(e) {
        this.isComposing = false // 3. 拼字结束，开锁
        // 4. 关键：上屏后手动同步一次数据
        this.text = e.target.value
      },
      handleInput(e) {
        // 5. 如果正在拼字，直接忽略 input 事件
        if (this.isComposing) return
        this.text = e.target.value
      },
    },
  }
</script>
```

::: swiper

![IME 拼字阶段](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-18-29-25.png)

![IME 上屏阶段](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-04-18-29-32.png)

:::

### 9.4. 总结对比

| 特性 | `v-model` (原生元素) | 手写 `:value` + `@input` |
| :-- | :-- | :-- |
| IME 拼字阶段 | 忽略更新 (数据保持原样) | 立即更新 (数据跟随拼音变化) |
| 底层事件 | `input` + `compositionstart` + `compositionend` | 仅 `input` |
| 核心逻辑 | 检查 `event.target.composing` 标记 | 无检查，直接赋值 |
| 用户体验 | 流畅，不打断选词 | 可能导致选词框消失或输入中断 |

所以，除非你要封装复杂的组件，否则在普通表单元素上，坚持使用 `v-model` 是处理多语言输入的最佳实践。

## 10. 🔗 引用

- [Vue.js 官方文档 - 表单输入绑定][1]
- [Vue.js 官方文档 - 组件 v-model][2]
- [Vue Playground][3]

[1]: https://cn.vuejs.org/guide/essentials/forms.html
[2]: https://cn.vuejs.org/guide/components/v-model.html
[3]: https://play.vuejs.org
