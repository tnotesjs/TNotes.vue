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
- [8. 🔗 引用](#8--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 使用 `v-model` 实现表单输入的双向绑定
- `v-model` 在不同表单元素上的用法（input、textarea、checkbox、radio、select）
- 表单修饰符（`.lazy`、`.number`、`.trim`）

## 2. 🫧 评价

这一节看起来是在学“表单写法”，本质上是在学“谁才是数据源”。只要抓住这一点，`v-model` 的大多数行为都能解释通：页面只是状态的映射，真正的初始值、当前值、最终值都应该放在 JS 的响应式数据里，而不是写死在 HTML attribute 上。

这一节建议按“文本 -> 复选框 -> 单选框 -> 选择器 -> 修饰符 -> 组件”这个顺序理解。前半部分先掌握不同表单元素各自绑定的 property / event，后半部分再理解值绑定、平台差异和组件封装，这样不容易把细节混在一起。

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
  const gender = ref('secret')
  setTimeout(() => {
    gender.value = 'male'
  }, 3000)
</script>
```

这个示例里的 `setTimeout()` 也很值得看。它不是必须的业务逻辑，但它能帮你看到另一半事实：不只是“点击单选框会改数据”，数据被代码修改后，单选框的选中状态也会同步变化。

如果你把 `value` 写成普通的字符串，最终拿到的也会是字符串。只有使用 `:value`，Vue 才会把真正的 JS 值放进去。比如：

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

  <p>{{ plan.name }}</p>
</template>

<script setup>
  import { ref } from 'vue'

  const basicPlan = { id: 1, name: '基础版' }
  const proPlan = { id: 2, name: '专业版' }
  const plan = ref(basicPlan)
</script>
```

### 5.4. 下拉选择框（select）

`<select>` 的单选模式通常绑定一个值，多选模式通常绑定一个数组。下面这个示例把这两种情况放在同一个组件里，也顺手演示了 `:value` 绑定对象的写法：

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

这里有两个点值得顺手记住：

- 单选时，`hometown1` 拿到的是当前选中的那一项
- 多选时，`hometown2` 必须从数组开始，最终拿到的也会是数组

另外，因为这里使用的是 `:value="item"`，所以选中的其实不是普通字符串，而是整个对象。这也就解释了为什么 `v-model` 可以绑定非字符串值，官方文档里写成对象字面量也同样成立。

为什么官方文档一直建议给单选 `<select>` 放一个空值的禁用占位项？因为如果 `v-model` 的初始值匹配不到任何一个 `<option>`，`<select>` 会进入“未选择”状态。在 iOS 上，这会导致用户第一次选择第一项时不触发 `change`，看起来就像“第一项选不上”。给它加一个空值占位项，本质上是在显式告诉用户和浏览器：“默认还没选”。

## 6. 🤔 `v-model` 有哪些修饰符？

修饰符的作用不是“增加新能力”，而是在保留 `v-model` 使用方式的前提下，调整同步时机或对输入值做轻量处理。

把默认行为、`.lazy`、`.number`、`.trim` 放在同一个页面里对比，会比拆开看更直观：

```html
<template>
  <h1>v-model="msg"</h1>
  <input type="text" v-model="msg" />
  <p>你输入的是：{{ msg }}</p>
  <p>类型为：{{ typeof msg }}</p>
  <p>长度为：{{ msg.length }}</p>

  <h1>v-model.lazy="msg1"</h1>
  <input type="text" v-model.lazy="msg1" />
  <p>你输入的是：{{ msg1 }}</p>
  <p>类型为：{{ typeof msg1 }}</p>
  <p>长度为：{{ msg1.length }}</p>

  <h1>v-model.number="msg2"</h1>
  <input type="text" v-model.number="msg2" />
  <p>你输入的是：{{ msg2 }}</p>
  <p>类型为：{{ typeof msg2 }}</p>
  <p>长度为：{{ msg2.length }}</p>

  <h1>v-model.trim="msg3"</h1>
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

修饰符还可以组合使用，例如：

```html
<input v-model.lazy.trim="keyword" />
```

这表示“失焦后再同步，并且同步前先去掉首尾空格”。

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

## 8. 🔗 引用

- [Vue.js 官方文档 - 表单输入绑定][1]
- [Vue.js 官方文档 - 组件 v-model][2]

[1]: https://cn.vuejs.org/guide/essentials/forms.html
[2]: https://cn.vuejs.org/guide/components/v-model.html
