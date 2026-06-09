# [0002. 组件事件（Emits）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0002.%20%E7%BB%84%E4%BB%B6%E4%BA%8B%E4%BB%B6%EF%BC%88Emits%EF%BC%89)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 组件事件是什么？父组件如何监听子组件事件？](#3-组件事件是什么父组件如何监听子组件事件)
- [4. 事件参数是如何传递的？](#4-事件参数是如何传递的)
- [5. 子组件的事件必须显式声明吗？](#5-子组件的事件必须显式声明吗)
- [6. 为什么推荐显式声明 `emits`？](#6-为什么推荐显式声明-emits)
  - [6.1. 显式声明的写法](#61-显式声明的写法)
  - [6.2. 显式声明的事件优先级高于原生事件](#62-显式声明的事件优先级高于原生事件)
- [7. 组件事件如何做校验和类型标注？](#7-组件事件如何做校验和类型标注)
- [8. 事件名的命名建议是？](#8-事件名的命名建议是)
- [9. 子组件自定义事件的传播机制是？](#9-子组件自定义事件的传播机制是)
- [10. demos.1 - 自定义事件基础示例 - 评分小组件](#10-demos1---自定义事件基础示例---评分小组件)
  - [10.1. defineProps + defineEmits 版本](#101-defineprops--defineemits-版本)
  - [10.2. defineModel 版本](#102-definemodel-版本)
- [11. 引用](#11-引用)

<!-- endregion:toc -->

## 1. 本节内容

- 事件触发
- 参数传递
- Emits 声明
- 事件校验
- 命名建议
- 传播机制

## 2. 评价

组件事件的本质就是：子组件通过 emit 向父组件“发出通知”，父组件负责决定是否监听来自子组件的通知。

子组件在触发事件的时候可以携带一些必要的事件参数，父组件可以在监听器里拿到这些参数来做进一步的处理。

## 3. 组件事件是什么？父组件如何监听子组件事件？

如果说 props 是「父传子」，那组件事件 emits 就是「子通知父」。

![svg](./assets/1.svg)

子组件不会直接修改父组件的数据，而是通过触发一个自定义事件，把变化意图或结果告诉父组件，再由父组件决定如何处理。

::: code-group

```html [App.vue]
<template>
  <p>count: {{ count }}</p>
  <!-- 父组件通过 v-on，也就是 @事件名 的方式来监听事件 -->
  <CounterButton @increase="count++" />
</template>

<script setup>
  import { ref } from 'vue'
  import CounterButton from './CounterButton.vue'

  const count = ref(0)
</script>
```

```html [CounterButton.vue]
<template>
  <button @click="emit('increase')">+1</button>
</template>

<script setup>
  // 先通过 defineEmits() 拿到 emit 函数
  // 子组件可以通过 emit('事件名') 触发事件
  const emit = defineEmits(['increase'])
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-14-01-58.png)

点击 +1 按钮之后，子组件 `CounterButton.vue` 会触发一个名为 `increase` 的事件，父组件 `App.vue` 监听到这个事件后就执行 `count++`，从而更新了父组件的数据。

组件事件监听器同样支持 `.once` 这类修饰符：

```html
<MyDialog @confirm.once="handleConfirm" />
```

## 4. 事件参数是如何传递的？

触发事件时，你可以在事件名后面继续传递任意数量的参数，它们会原样进入父组件监听器。

::: code-group

```html [App.vue]
<template>
  <p>count: {{ count }}</p>
  <ChildButton @increase-by="increaseCount" />
</template>

<script setup>
  import { ref } from 'vue'
  import ChildButton from './ChildButton.vue'

  const count = ref(0)

  function increaseCount(step) {
    count.value += step
  }
</script>
```

```html [ChildButton.vue]
<template>
  <button @click="emit('increaseBy', 2)">+2</button>
</template>

<script setup>
  const emit = defineEmits(['increaseBy'])
</script>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-14-11-56.png)

```js
// 如果子组件这样写：
emit('submit', formData, isDraft, source)
// 那么父组件的监听器就会依次收到这三个参数。
```

## 5. 子组件的事件必须显式声明吗？

子组件可以不显式声明事件，可以直接在模板中通过 `$emits` 触发事件。

::: code-group

```html [App.vue]
<template>
  <p>count: {{ count }}</p>
  <ChildButton @increase-by="increaseCount" />
</template>

<script setup>
  import { ref } from 'vue'
  import ChildButton from './ChildButton.vue'

  const count = ref(0)

  function increaseCount(step) {
    count.value += step
  }
</script>
```

```html [ChildButton.vue（显式声明）]
<template>
  <button @click="emit('increaseBy', 2)">+2</button>
</template>

<script setup>
  const emit = defineEmits(['increaseBy'])
</script>
```

```html [ChildButton.vue（非显式声明）]
<template>
  <button @click="$emit('increaseBy', 2)">+2</button>
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-14-11-56.png)

上述两种写法：显式声明 emits 和非显式声明 emits 的做法都是允许的，最终交互效果也是一样的。

但是，官方更推荐的写法是：显式声明 emits。

## 6. 为什么推荐显式声明 `emits`？

Vue 并不强制你一定声明所有组件事件，但官方明确推荐你这么做。

::: tip 官方原话

尽管事件声明是可选的，我们还是推荐你完整地声明所有要触发的事件，以此在代码中作为文档记录组件的用法。同时，事件声明能让 Vue 更好地将事件和透传 attribute 作出区分，从而避免一些由第三方代码触发的自定义 DOM 事件所导致的边界情况。

:::

### 6.1. 显式声明的写法

在 `<script setup>` 中，最常见的写法是：

```html
<script setup>
  const emit = defineEmits(['focus', 'blur', 'submit'])
</script>
```

和 `defineProps()` 一样，`defineEmits()` 也是 `<script setup>` 专用的编译宏，应该直接写在顶层作用域里，不要放进条件分支或普通函数内部。

如果不是 `<script setup>` 这种 Composition API 的写法来实现，也可以写成 Options API 的风格 => 使用 `emits` 选项：

```js
<script>
export default {
  emits: ['focus', 'blur', 'submit'],
  setup(props, { emit }) {
    emit('submit')
  },
}
</script>
```

### 6.2. 显式声明的事件优先级高于原生事件

如果你把 `click` 这种原生事件名声明进了 `emits`，那么父组件上的 `@click` 将只监听组件自己触发的 `click` 事件，而不会再自动响应根元素上的原生点击事件。

显式声明 `emits` 能够让你更直观地识别出哪些事件是组件自己触发的，哪些是外部 DOM 事件，从而避免一些不必要的坑。

## 7. 组件事件如何做校验和类型标注？

和 props 一样，事件也可以做校验。

```html
<script setup>
  const emit = defineEmits({
    // 声明 change 事件，不附加任何参数校验
    change: null,
    // 声明 submit 事件，用函数校验触发时传入的参数
    submit(payload) {
      if (payload.email && payload.password) {
        return true // 校验通过
      }

      console.warn('submit 事件参数不合法')
      return false // 校验失败
    },
  })

  function handleSubmit() {
    emit('submit', {
      email: 'ada@example.com',
      password: '123456',
    })
  }
</script>
```

这里的规则很简单：

- 对象的 key 是事件名，value 是一个验证函数
- key 对应的 value 是 `null`，表示不校验
- key 对应的 value 是函数，表示用这个函数校验参数
  - 返回 `true` 表示校验通过
  - 返回 `false` 表示校验失败

注意：验证失败不会阻止事件触发，它只会在开发阶段给你一个提示，帮助你尽早发现问题。

- `return true` -> 校验通过，事件正常触发
- `return false` -> 校验失败，开发环境下，Vue 会在控制台抛出警告，但事件仍会被触发

如果你在用 TypeScript，还可以直接给事件签名加类型：

```html
<script setup lang="ts">
  const emit = defineEmits<{
    (e: 'change', id: number): void
    // 表示定义了一个名为 change 的事件
    // 触发时需要传入一个 number 类型的 id 参数
    // 返回值类型是 void，表示这个事件没有返回值

    (e: 'submit', payload: { email: string; password: string }): void
    // 表示定义了一个名为 submit 的事件
    // 触发时需要传入一个对象参数，这个对象必须包含 email 和 password 两个字符串属性
    // 返回值类型是 void，表示这个事件没有返回值
  }>()
</script>
```

这种写法在编辑器里体验很好，事件名和参数形状都会有明确提示。

## 8. 事件名的命名建议是？

组件事件的命名建议和 props 很像。

你在子组件里触发事件时可以使用 camelCase：

```js
emit('updateCount')
```

父组件在模板中监听时更推荐使用 kebab-case：

```html
<MyCounter @update-count="handleUpdate" />
```

Vue 会帮你做这层格式转换。

## 9. 子组件自定义事件的传播机制是？

组件事件不会像原生 DOM 事件那样冒泡。也就是说：

- 父组件只能监听直接子组件抛出的事件
- 平级组件不能靠组件事件直接通信
- 跨多层通信也不适合靠一层层转抛事件来硬接

如果通信跨层级、跨区域、跨页面，通常要考虑：

- props + emits 逐层传递
- provide / inject
- 状态管理方案

所以你可以把 emits 理解成一种「局部、直接、短链路」的通信方式，它非常适合父子组件，但不适合当全局消息系统来用。

## 10. demos.1 - 自定义事件基础示例 - 评分小组件

### 10.1. defineProps + defineEmits 版本

::: code-group

```html [App.vue]
<template>
  <div class="app-container">
    <h1>请对本次服务评分：</h1>
    <Rating @update-rating="handleRating" :rating />
    <p v-if="rating > 0">你当前的评价为 {{ rating }} 颗星</p>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import Rating from './Rating.vue'
  const rating = ref(0)

  function handleRating(newRating) {
    // 更新父组件的数据就可以了
    rating.value = newRating
  }
</script>
```

```html [Rating.vue]
<template>
  <div class="rating-container">
    <!-- <span v-for="star in 5" :key="star" class="star" @click="$emit('update-rating', star)"> -->
    <span v-for="star in 5" :key="star" class="star" @click="setStar(star)">
      {{ rating >= star ? '★' : '☆' }}
    </span>
  </div>
</template>

<script setup>
  defineProps(['rating'])
  const emits = defineEmits({
    'update-rating': (value) => {
      if (value < 1 || value > 5) {
        console.warn('传递的值有问题！！！')
        return false
      }
      return true
    },
  })

  function setStar(newStar) {
    // 我们需要将最新的星星状态的值传递给父组件
    // 触发父组件的 update-rating 事件
    // emits('update-rating', 100) // 模拟一个非法值
    emits('update-rating', newStar)
  }
</script>

<style scoped>
  .rating-container {
    display: flex;
    font-size: 24px;
    cursor: pointer;
  }

  .star {
    margin-right: 5px;
    color: gold;
  }

  .star:hover {
    color: orange;
  }
</style>
```

:::

默认状态：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-15-36-33.png)

修改评分：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-19-15-36-50.png)

### 10.2. defineModel 版本

需要同时使用 `defineProps + defineEmits` 的子组件实现，很多时候都可以利用 defineModel 语法糖来实现简写。`defineModel = defineProps + defineEmits + computed`，以下是使用 defineModel 语法糖实现的版本。

::: code-group

```html [App.vue]
<template>
  <div class="app-container">
    <h1>请对本次服务评分：</h1>
    <Rating v-model:rating="rating" />
    <p v-if="rating > 0">你当前的评价为 {{ rating }} 颗星</p>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import Rating from './Rating.vue'
  const rating = ref(0)
</script>
```

```html [Rating.vue]
<template>
  <div class="rating-container">
    <span v-for="star in 5" :key="star" class="star" @click="setStar(star)">
      {{ rating >= star ? '★' : '☆' }}
    </span>
  </div>
</template>

<script setup>
  const rating = defineModel('rating')

  function setStar(newStar) {
    rating.value = newStar
  }
</script>

<style scoped>
  .rating-container {
    display: flex;
    font-size: 24px;
    cursor: pointer;
  }

  .star {
    margin-right: 5px;
    color: gold;
  }

  .star:hover {
    color: orange;
  }
</style>
```

:::

在自定义组件上使用 `v-model` 相当于是一个语法糖

1. `<Rating v-model:rating="rating" />`
2. `<Rating @update:rating="(newVal) => rating = newVal" :rating />`

在模板中，上述 1、2 是等效的。

子组件中要获取 rating 可以通过 `defineModel('rating')` 的返回值来获取：

```js
const rating = defineModel('rating')
// 写法展开：
rating.value // 读 -> 相当于访问 props.rating
rating.value = 5 // 写 -> 相当于执行 emit('update:rating', 5)
// 当给 rating.value 重新赋值时，就相当于触发了 rating.value 的 setter
// setter 会触发 @update:rating 事件，并把赋的新值作为参数传入
```

`const rating = defineModel('rating')` 等价于以下手动实现：

```js
import { computed } from 'vue'

// 1. 声明 prop（默认参数名是 modelValue）
const props = defineProps({
  rating: { type: Number, default: 0 },
})

// 2. 声明事件（默认事件名是 update:modelValue）
const emit = defineEmits(['update:rating'])

// 3. 用 computed 包装成一个“可读可写”的 ref
const rating = computed({
  get() {
    return props.rating // 读 -> 从 prop 取值
  },
  set(value) {
    emit('update:rating', value) // 写 -> 触发事件通知父组件
  },
})
```

## 11. 引用

- [Vue.js 官方文档 - 组件事件][1]

[1]: https://cn.vuejs.org/guide/components/events.html
