# [0034. 插槽（Slots）](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0034.%20%E6%8F%92%E6%A7%BD%EF%BC%88Slots%EF%BC%89)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 插槽到底是什么？它解决了什么问题？](#3--插槽到底是什么它解决了什么问题)
- [4. 🤔 插槽内容属于谁的作用域？没有传内容时怎么办？](#4--插槽内容属于谁的作用域没有传内容时怎么办)
  - [4.1. 插槽内容作用域](#41-插槽内容作用域)
  - [4.2. 默认内容](#42-默认内容)
- [5. 🤔 什么是具名插槽？](#5--什么是具名插槽)
- [6. 🤔 条件插槽和动态插槽名是什么？](#6--条件插槽和动态插槽名是什么)
- [7. 🤔 什么是作用域插槽？](#7--什么是作用域插槽)
- [8. 🤔 具名作用域插槽常见在什么场景下使用？](#8--具名作用域插槽常见在什么场景下使用)
- [9. 🔗 引用](#9--引用)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 插槽内容 slot content
- 插槽出口 slot outlet
- 默认插槽 fallback slot
- 默认内容 fallback content
- 具名插槽 named slot
- 条件插槽 conditional slot
- 动态插槽 dynamic slot
- 作用域插槽 scoped slot

## 2. 🫧 评价

插槽是组件封装里非常关键的一层能力，它决定了「子组件控制外壳，父组件控制内部内容」这件事怎么成立。默认插槽和具名插槽属于高频基础，作用域插槽虽然使用频率没前两者高，但一旦要做高级列表、表格、无渲染组件，就很难绕开它。

## 3. 🤔 插槽到底是什么？它解决了什么问题？

Props 适合传数据，但不适合直接传一段模板结构。插槽就是为了解决「父组件想把一段模板内容交给子组件去渲染」这个问题。

最简单的例子就是一个按钮外壳组件：

::: code-group

```html [App.vue]
<template>
  <FancyButton>
    <!-- 插槽内容 slot content -->
    Click me!
  </FancyButton>
</template>

<script setup>
  import FancyButton from './FancyButton.vue'
</script>
```

```html [FancyButton.vue]
<template>
  <button class="fancy-btn">
    <!-- 插槽出口 slot outlet -->
    <slot></slot>
  </button>
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-08-04-44.png)

- `<FancyButton> ... </FancyButton>` 之间的内容叫插槽内容
- 子组件里的 `<slot></slot>` 叫插槽出口

最终渲染得到的真实 DOM：

```html
<button class="fancy-btn">Click me!</button>
```

你可以把它理解成：子组件负责提供外壳和布局，父组件负责提供要塞进去的内容。

插槽内容不只是文本，也可以是任意合法模板，比如元素、组件、指令组合等。

## 4. 🤔 插槽内容属于谁的作用域？没有传内容时怎么办？

### 4.1. 插槽内容作用域

插槽内容虽然最终是在子组件内部渲染，但它的定义位置仍然在父组件模板里，所以它访问的是父组件作用域，而不是子组件作用域。

```html
<!-- App.vue -->
<template>
  <FancyButton>{{ message }}</FancyButton>
</template>
```

这里的 `message` 来自父组件 App.vue，而不是 `FancyButton` 自己的数据。

这条规则很重要，因为它解释了为什么插槽不是「子组件把变量暴露给父组件」，而是「父组件把模板交给子组件来摆放」。

### 4.2. 默认内容

另外，插槽还可以有默认内容，也就是当父组件没有传任何内容时，子组件自己提供一个兜底显示：

```html
<template>
  <button type="submit">
    <slot>Submit</slot>
  </button>
</template>
```

`<slot>Submit</slot>` 中的 `Submit` 就是默认内容。

当父组件没有传入任何内容时（比如 `<SubmitButton />` 这么调用），最终渲染的 DOM 就是：

```html
<button type="submit">Submit</button>
```

如果父组件传入了内容（比如 `<SubmitButton>保存</SubmitButton>`），那么默认内容就会被覆盖掉，最终渲染的 DOM 是：

```html
<button type="submit">保存</button>
```

## 5. 🤔 什么是具名插槽？

如果一个组件里只有一个内容区域，默认插槽就够用了，但如果一个组件有多个区域，比如头部、主体、底部，那你就需要给这些插槽出口命名。

父组件使用时，通过 `v-slot`，或者它的缩写 `#`，把不同内容送到不同位置：

::: code-group

```html [App.vue]
<template>
  <BaseLayout>
    <!-- 会替换具名插槽 header -->
    <template #header>
      <h1>页面标题</h1>
    </template>

    <!-- 会替换默认插槽 -->
    <p>正文内容</p>

    <!-- 会替换具名插槽 footer -->
    <template #footer>
      <p>底部说明</p>
    </template>
  </BaseLayout>
</template>

<script setup>
  import BaseLayout from './BaseLayout.vue'
</script>
```

```html [BaseLayout.vue]
<template>
  <div class="container">
    <header>
      <!-- 具名插槽 header 的出口 -->
      <slot name="header"></slot>
    </header>

    <main>
      <!-- 默认插槽内容的出口 -->
      <slot></slot>
    </main>

    <footer>
      <!-- 具名插槽 footer 的出口 -->
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-08-21-48.png)

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-08-15-19.png)

这里有两个默认规则：

- 没有 `name` 的 `<slot>` 默认叫 `default`。
- 顶层那些没有包在 `<template #xxx>` 里的节点，会被视为默认插槽内容。

所以具名插槽的本质就是：让父组件把多段模板内容，按名字分配到子组件不同的渲染位置。

## 6. 🤔 条件插槽和动态插槽名是什么？

有时你只想在某个插槽真的被传入内容时，才渲染外层包装结构。这时可以利用 `$slots` 做条件判断：

```html
<template>
  <div class="card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>

    <div v-if="$slots.default" class="card-content">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

这就叫条件插槽。它特别适合卡片、弹窗、面板这类可选区域很多的组件。

如果插槽名不是固定死的，也可以使用动态插槽名：

```html
<BaseLayout>
  <template #[currentSlotName]> 动态内容 </template>
</BaseLayout>
```

## 7. 🤔 什么是作用域插槽？

前面说过，普通插槽内容默认只能访问父组件作用域。但有些场景下，父组件既想控制模板结构，又想拿到子组件内部准备好的数据，这时就轮到作用域插槽出场了。

子组件可以在 `<slot>` 出口上主动传值：

```html
<template>
  <slot :text="greetingMessage" :count="1"></slot>
</template>

<script setup>
  const greetingMessage = 'hello'
</script>
```

父组件接收时，可以通过 `v-slot` 拿到这些插槽 props：

```html
<MyComponent v-slot="slotProps">
  {{ slotProps.text }} {{ slotProps.count }}
</MyComponent>
```

也可以直接解构：

```html
<MyComponent v-slot="{ text, count }"> {{ text }} {{ count }} </MyComponent>
```

如果一个组件同时还用了具名插槽，那么默认插槽最好也写成显式的 `<template #default="...">`。这样作用域边界最清楚，也能避免默认插槽 props 和其他具名插槽混在一起产生歧义。

```html
<MyComponent>
  <template #default="{ message }">
    <p>{{ message }}</p>
  </template>

  <template #footer>
    <p>footer</p>
  </template>
</MyComponent>
```

它之所以叫「作用域插槽」，是因为父组件提供的这段模板在渲染时，额外获得了来自子组件的一组局部变量。

你可以把它类比成：父组件把一段函数传给子组件，子组件执行这段函数时，再把自己的数据作为参数传进去。

## 8. 🤔 具名作用域插槽常见在什么场景下使用？

具名插槽和作用域插槽可以组合使用。也就是说，不同插槽不但有不同名字，还能各自向父组件暴露一组数据。

```html
<MyPanel>
  <template #header="{ title }">
    <h2>{{ title }}</h2>
  </template>

  <template #default="{ items }">
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </template>
</MyPanel>
```

这种模式特别适合：

1. 表格列渲染
2. 列表项自定义渲染
3. 分页组件的页码区域
4. 无渲染组件

所谓无渲染组件，就是组件自己几乎不负责界面输出，只封装逻辑，再通过作用域插槽把结果交给父组件决定怎么渲染。

不过在现代 Vue 3 项目里，很多「纯逻辑复用」的场景也可以直接用组合式函数来做，所以作用域插槽更适合那种「逻辑和部分结构都要一起封装，但最终展示方式仍想交给使用者」的场景。

## 9. 🔗 引用

- [Vue.js 官方文档 - 插槽][1]

[1]: https://cn.vuejs.org/guide/components/slots.html
