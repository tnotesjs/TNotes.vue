# [0029. Class 与 Style 绑定](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0029.%20Class%20%E4%B8%8E%20Style%20%E7%BB%91%E5%AE%9A)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 如何使用对象语法和数组语法绑定 HTML Class？](#3-如何使用对象语法和数组语法绑定-html-class)
  - [3.1. 对象语法](#31-对象语法)
  - [3.2. 数组语法](#32-数组语法)
  - [3.3. 自定义组件绑定 class](#33-自定义组件绑定-class)
- [4. demos.1 - Class 绑定实战：实现 Tag 组件](#4-demos1---class-绑定实战实现-tag-组件)
- [5. 如何使用对象语法和数组语法绑定内联样式？](#5-如何使用对象语法和数组语法绑定内联样式)
- [6. demos.2 - Style 绑定实战：实现可拖拽的元素](#6-demos2---style-绑定实战实现可拖拽的元素)
- [7. Vue 如何处理样式的多值和自动前缀？](#7-vue-如何处理样式的多值和自动前缀)
  - [7.1. 自动前缀](#71-自动前缀)
  - [7.2. 多值语法](#72-多值语法)
- [8. 如何在 `<style>` 中使用 `v-bind()` 绑定响应式样式？](#8-如何在-style-中使用-v-bind-绑定响应式样式)

<!-- endregion:toc -->

## 1. 本节内容

- 绑定 HTML Class（对象语法、数组语法）
- 自定义组件上的 class 合并规则
- 绑定内联样式（对象语法、数组语法）
- 样式的多值与自动前缀处理
- 在 `<style>` 中使用 `v-bind()` 绑定响应式样式

## 2. 评价

本节介绍的 Class 和 Style 的绑定，主要解决的是在模板中书写样式的问题。Vue 的增强语法让我们可以更灵活地控制元素的样式，尤其是在需要根据状态动态切换样式时非常有用。

对象语法和数组语法的引入，使得动态 class 和 style 的管理变得更加直观和高效。在实际开发中，我们经常需要根据组件的状态来切换不同的样式，这些增强特性极大地简化了我们的代码，让我们可以更专注于业务逻辑，而不需要担心样式的细节处理。

此外，Vue 对样式绑定的多值和自动前缀处理也让我们不需要手动处理浏览器兼容性问题，可以直接使用标准的 CSS 属性名，这在实际开发中是非常方便的。

总的来说，这些增强特性是 Vue 模板语法中非常实用的工具，属于简单且使用频率较高的知识点。

## 3. 如何使用对象语法和数组语法绑定 HTML Class？

Vue 对 class 属性的绑定做了专门的增强，除了支持普通的字符串绑定外，还支持对象语法和数组语法。这两种语法让动态 class 的管理变得更加直观和灵活，是实际 Vue 开发中使用频率极高的特性。

### 3.1. 对象语法

对象语法允许你传入一个对象，对象的键是 class 名称，值是布尔表达式。当值为 true 时，对应的 class 会被添加到元素上；当值为 false 时，class 会被移除：

```html
<template>
  <!-- 基本对象语法 -->
  <div :class="{ active: isActive }">基本绑定</div>
  <!-- 当 isActive 为 true 时渲染为：<div class="active"> -->

  <!-- 多个 class -->
  <div :class="{ active: isActive, 'text-danger': hasError }">多个 class</div>

  <!-- 与静态 class 共存 -->
  <div class="base-class" :class="{ active: isActive }">混合使用</div>
  <!-- 渲染为：<div class="base-class active"> -->

  <!-- 绑定到计算属性 -->
  <div :class="classObject">计算属性对象</div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const isActive = ref(true)
  const hasError = ref(false)
  const isLoading = ref(false)
  const isDisabled = ref(false)

  // 当逻辑复杂时，使用计算属性
  const classObject = computed(() => ({
    active: isActive.value && !hasError.value,
    'text-danger': hasError.value,
    'is-loading': isLoading.value,
    'is-disabled': isDisabled.value,
  }))
</script>
```

需要特别注意的是，当 class 名称包含连字符（如 text-danger、is-loading）时，必须用引号将其包裹，因为 JavaScript 对象的键不能直接包含连字符。

最终元素结构：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-00-03-09.png)

### 3.2. 数组语法

数组语法允许你传入一个数组，数组中的每个元素都会被添加为 class：

```html
<template>
  <!-- 基本数组语法 -->
  <div :class="[activeClass, errorClass]">数组语法</div>
  <!-- 渲染为：<div class="active text-danger"> -->

  <!-- 数组中使用条件表达式 -->
  <div :class="[isActive ? 'active' : '', errorClass]">条件切换</div>

  <!-- 数组中嵌套对象语法 -->
  <div :class="['base', { active: isActive, disabled: isDisabled }]">
    混合语法
  </div>

  <!-- 复杂场景：动态组合多个 class -->
  <button :class="buttonClasses">按钮</button>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const activeClass = ref('active')
  const errorClass = ref('text-danger')
  const isActive = ref(true)
  const isDisabled = ref(false)
  const size = ref('large')
  const variant = ref('primary')
  const isRound = ref(true)

  const buttonClasses = computed(() => [
    'btn',
    `btn-${variant.value}`,
    `btn-${size.value}`,
    {
      'btn-round': isRound.value,
      'btn-disabled': isDisabled.value,
    },
  ])
</script>
```

最终元素结构：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-00-08-36.png)

### 3.3. 自定义组件绑定 class

在自定义组件上使用 class 绑定时，行为取决于组件的根元素数量。如果组件只有一个根元素，class 会被自动合并到根元素上：

```html
<!-- 子组件 MyButton.vue -->
<template>
  <button class="btn">
    <slot />
  </button>
</template>

<!-- 父组件 App.vue -->
<template>
  <MyButton class="large primary" :class="{ active: true }"> 点击我 </MyButton>
</template>

<script setup>
  import MyButton from './MyButton.vue'
</script>
```

最终元素结构：`<button class="btn large primary active">点击我</button>`

如果组件有多个根元素，需要通过 `$attrs.class` 手动指定哪个元素接收外部传入的 class。

```html
<!-- 子组件 MyLayout.vue -->
<template>
  <header>标题</header>
  <main :class="$attrs.class">内容区域</main>
  <footer>底部</footer>
</template>

<script>
  export default {
    inheritAttrs: false, // 阻止默认的属性继承行为
  }
</script>

<!-- 父组件 App.vue -->
<template>
  <MyLayout class="page-shell highlighted" :class="{ active: true }" />
</template>

<script setup>
  import MyLayout from './MyLayout.vue'
</script>
```

最终元素结构：

```html
<header>标题</header>
<main class="page-shell highlighted active">内容区域</main>
<footer>底部</footer>
```

## 4. demos.1 - Class 绑定实战：实现 Tag 组件

该 demos.1 是一个模拟实际的组件库中的 Tag 组件的实现，需要做一个支持多种变体和状态的 Tag 组件。

你可以重点观察两件事：

- `tagClasses` 如何同时组合静态 class、模板字符串 class 和对象语法 class
- 切换不同 props 后，最终渲染到 `<span>` 上的 class 会如何变化

::: code-group

<<< ./demos/1/Tag.vue

<<< ./demos/1/App.vue

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-00-34-01.png)

测试流程说明：在 Vue Playground 中创建 `Tag.vue` 和 `App.vue` 两个文件后，直接把上面的代码分别粘进去即可测试。切换下拉框和复选框时，你会看到 `tag tag-primary tag-medium tag-round` 这类 class 组合不断变化，这正是数组语法和对象语法配合使用的典型场景。

## 5. 如何使用对象语法和数组语法绑定内联样式？

Vue 对 style 属性的绑定也做了增强处理，支持对象语法和数组语法。与原生的内联样式字符串相比，Vue 的增强语法更加灵活，支持使用 JavaScript 变量和表达式来动态控制样式值。

对象语法允许你传入一个 JavaScript 对象来绑定内联样式。CSS 属性名可以使用驼峰命名（camelCase，推荐）或短横线分隔命名（kebab-case，需要引号包裹）：

```html
<template>
  <!-- 驼峰命名 -->
  <div :style="{ color: textColor, fontSize: fontSize + 'px' }">驼峰写法</div>

  <!-- 短横线命名（需要引号） -->
  <div :style="{ 'font-size': fontSize + 'px', 'background-color': bgColor }">
    短横线写法
  </div>

  <!-- 绑定样式对象 -->
  <div :style="styleObject">样式对象</div>

  <!-- 绑定计算属性 -->
  <div :style="dynamicStyles">计算属性样式</div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue'

  const textColor = ref('#333')
  const fontSize = ref(16)
  const bgColor = ref('#f5f5f5')

  const styleObject = reactive({
    color: 'red',
    fontSize: '14px',
    padding: '10px 20px',
    borderRadius: '4px',
  })

  const width = ref(300)
  const height = ref(200)
  const isHighlighted = ref(false)

  const dynamicStyles = computed(() => ({
    width: `${width.value}px`,
    height: `${height.value}px`,
    backgroundColor: isHighlighted.value ? '#ffffcc' : '#ffffff',
    border: '1px solid #ddd',
    transition: 'background-color 0.3s ease',
  }))
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-11-10-18.png)

最终元素结构：

```html
<!-- 驼峰命名 -->
<div style="color: rgb(51, 51, 51); font-size: 16px;">驼峰写法</div>
<!-- 短横线命名（需要引号） -->
<div style="font-size: 16px; background-color: rgb(245, 245, 245);">
  短横线写法
</div>
<!-- 绑定样式对象 -->
<div
  style="color: red; font-size: 14px; padding: 10px 20px; border-radius: 4px;"
>
  样式对象
</div>
<!-- 绑定计算属性 -->
<div
  style="width: 300px; height: 200px; background-color: rgb(255, 255, 255); border: 1px solid rgb(221, 221, 221); transition: background-color 0.3s;"
>
  计算属性样式
</div>
```

::: details 扩展知识：为什么颜色值会被转为 rgb 格式？

你在开发者工具中看到 `#333` 变成了 `rgb(51, 51, 51)`，这不是 Vue 的问题，而是浏览器的 CSSOM（CSS 对象模型）行为。

当你通过 `element.style.color = '#333'` 设置样式时，浏览器内部会把这个值解析为标准的 RGB 表示形式。当你通过开发者工具查看元素时，浏览器会以 `rgb()` 这种标准化格式展示它的内部表示。同样的，`red` 会被标准化为 `rgb(255, 0, 0)`，`#f5f5f5` 会被标准化为 `rgb(245, 245, 245)`。

你可以在浏览器控制台直接验证：

```js
const div = document.createElement('div')
div.style.color = '#333'
console.log(div.style.color) // "rgb(51, 51, 51)"
```

当你写 `div.style.color = '#333'` 和 `div.style.color = 'rgb(51, 51, 51)'` 时，渲染结果是完全一样的，因此无需纠结这个小细节，之所以会转换，只是浏览器展示的格式和你写入的格式不同而已，你还是按照你喜欢的颜色值语法来写就好了，浏览器会帮你处理这些细节。

:::

数组语法允许你将多个样式对象合并应用到同一个元素上。后面的对象中的同名属性会覆盖前面的：

```html
<template>
  <div :style="[baseStyles, overrideStyles, conditionalStyles]">合并样式</div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue'

  const baseStyles = reactive({
    fontSize: '14px',
    color: '#f00',
    backgroundColor: 'gray',
    padding: '10px',
    lineHeight: '1.5',
  })

  const overrideStyles = reactive({
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
  })

  const isError = ref(false)
  const conditionalStyles = computed(() => {
    if (isError.value) {
      return {
        color: 'red',
        borderColor: 'red',
      }
    }
    return {}
  })
</script>
```

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-11-16-12.png)

最终元素结构：

```html
<div
  style="font-size: 14px; color: rgb(255, 255, 255); background-color: gray; padding: 10px; line-height: 1.5; font-family: Arial, sans-serif;"
>
  合并样式
</div>
```

## 6. demos.2 - Style 绑定实战：实现可拖拽的元素

<<< ./demos/2/App.vue

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-11-25-35.png)

页面上的这个元素可以任意拖拽，它的样式完全由 Vue 的 :style 绑定控制。你可以在开发者工具中观察到，当你拖动元素时，Vue 会实时更新元素的 left、top 样式来实现位置的变化。

## 7. Vue 如何处理样式的多值和自动前缀？

Vue 在处理内联样式绑定时，内置了两个非常实用的特性：自动添加浏览器厂商前缀和支持多值语法。这些特性让开发者不需要手动处理浏览器兼容性问题，可以直接使用标准的 CSS 属性名。

### 7.1. 自动前缀

自动前缀是指当你在 :style 中使用需要浏览器前缀的 CSS 属性时，Vue 会在运行时自动检测当前浏览器需要哪种前缀，并自动添加。例如 transform、transition、flexbox 相关属性等在某些旧版浏览器中需要加 `-webkit-`、`-moz-`、`-ms-` 等前缀，Vue 会帮你处理这些细节：

```html
<template>
  <!-- Vue 会自动添加必要的浏览器前缀 -->
  <div
    :style="{
      transform: `rotate(${angle}deg)`,
      transition: 'transform 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      backdropFilter: 'blur(10px)',
    }"
  >
    旋转的盒子
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  const angle = ref(0)
</script>
```

在运行时，Vue 会检测当前浏览器环境。如果浏览器需要 `-webkit-` 前缀来支持 `userSelect`，Vue 会自动生成 `-webkit-user-select`。如果浏览器原生支持标准写法，则直接使用标准写法。这个检测过程只在应用初始化时进行一次，不会影响运行时性能。

测试流程说明：关于上述示例，你可以在 Safari 浏览器中利用 Vue Playground 在线测试，查看最终渲染的元素结构。比如：

::: swiper

![safari](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-11-40-31.png)

![chrome](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-11-42-35.png)

:::

你会发现最终渲染的元素结构中，Vue 自动添加了 `-webkit-user-select` 这个前缀属性，而在 Chrome 中则没有这些前缀，因为 Chrome 已经原生支持了这些属性。至于最终哪些属性会加上特定的前缀，具体得看浏览器的支持情况，这些细节往往是我们无需去刻意关心的，交由 Vue 来处理就好了。

### 7.2. 多值语法

多值语法允许你为一个样式属性提供一个包含多个值的数组。Vue 会按顺序尝试每个值，最终使用浏览器支持的最后一个值。这在处理渐进增强的 CSS 特性时特别有用：

```html
<template>
  <!-- 浏览器会从后往前尝试，使用它支持的最后一个值 -->
  <div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }">
    Flexbox 兼容写法
  </div>

  <div
    :style="{
      background: [
        'linear-gradient(to right, red, blue)',
        '-webkit-linear-gradient(to right, red, blue)',
      ],
    }"
  >
    渐变背景兼容
  </div>

  <!-- 利用多值实现渐进增强 -->
  <div :style="{ color: ['#333', 'oklch(0.5 0.2 240)'] }">
    如果浏览器支持 oklch 就使用它，否则降级到 hex
  </div>
</template>
```

以下是在目前（26.05）最新版 chrome 中的渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-11-49-15.png)

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-11-48-42.png)

::: details 扩展知识：oklch 是什么？

`oklch` 是一种新的 CSS 颜色函数，属于 CSS Color Level 4 规范。它比传统的 `rgb`/`hsl` 更加符合人眼对颜色的感知，解决了旧颜色空间的一些已知问题（比如 hsl 中相同 Lightness 值但不同色相的颜色，肉眼看起来亮度却不一样）。

简单来说，`oklch(0.5 0.2 240)` 表示：

- `0.5` --> 亮度（Lightness），范围约 0~1，越大越亮
- `0.2` --> 色度（Chroma），色彩浓度，越大颜色越鲜艳
- `240` --> 色相（Hue），蓝紫色调

在多值语法的示例中用 `oklch`，是为了演示「渐进增强」：如果浏览器支持 `oklch` 就使用它（颜色更精确），否则回退到 `#333`（hex 兜底）。

如果你的应用需要支持旧版浏览器，目前 `oklch` 的兼容性还不够广泛（2025 年已有超过 90% 浏览器支持，但部分旧设备仍有缺口），所以在使用新颜色函数时建议搭配多值语法来做兼容降级。

一句话总结：`oklch` 是新一代 CSS 颜色函数，视觉更均匀；在多值示例中出现是为了展示渐进增强策略，你现在还不需要专门去学它，知道它是「更好的颜色写法」就行。

:::

## 8. 如何在 `<style>` 中使用 `v-bind()` 绑定响应式样式？

Vue 3 引入了一个更加强大的特性 => 在 `<style>` 标签中使用 v-bind 来绑定组件的响应式状态。这种方式比内联样式更加优雅，因为它将样式定义保留在 CSS 中，同时又可以使用 JavaScript 的动态值：

```html
<template>
  <div class="box">
    <p>动态样式</p>
    <input v-model="color" type="color" />
    <input v-model.number="size" type="range" min="12" max="48" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const color = ref('#42b883')
  const size = ref(16)
  const padding = ref(20)
</script>

<style scoped>
  .box {
    color: v-bind(color);
    font-size: v-bind(size + 'px');
    padding: v-bind(padding + 'px');
    border: 2px solid v-bind(color);
    border-radius: 8px;
    transition: all 0.3s ease;
  }
</style>
```

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-11-58-32.png)

对应的真实元素结构：

```html
<div
  data-v-7ba5bd90=""
  class="box"
  style="--v069c1ad6: #42b883; --v5cf18b1e: 16px; --v1b81c72c: 20px;"
>
  <p data-v-7ba5bd90="">动态样式</p>
  <input data-v-7ba5bd90="" type="color" /><input
    data-v-7ba5bd90=""
    type="range"
    min="12"
    max="48"
  />
</div>
```

对应的 Styles 面板：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-11-58-52.png)

v-bind() 在 CSS 中的实现原理是通过 CSS 自定义属性（CSS Variables）来桥接的。Vue 会在组件的根元素上设置内联的 CSS 自定义属性（如 `--abc123: #42b883`），然后在编译后的 CSS 中使用 `var(--abc123)` 来引用这个值。当响应式数据变化时，Vue 只需要更新自定义属性的值，浏览器会自动应用新的样式，无需重新编译 CSS。

你也可以手动使用 CSS 自定义属性来实现类似的效果，这在需要在子元素中继承动态样式值时特别有用：

```html
<template>
  <div class="theme-provider" :style="themeVars">
    <div class="card">
      <h2 class="card-title">标题</h2>
      <p>内容</p>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const primaryColor = ref('#42b883')
  const secondaryColor = ref('#35495e')
  const borderRadius = ref(8)
  const spacing = ref(16)

  const themeVars = computed(() => ({
    '--primary-color': primaryColor.value,
    '--secondary-color': secondaryColor.value,
    '--border-radius': `${borderRadius.value}px`,
    '--spacing': `${spacing.value}px`,
  }))
</script>

<style scoped>
  .card {
    background-color: var(--primary-color);
    color: var(--secondary-color);
    border-radius: var(--border-radius);
    padding: var(--spacing);
  }

  .card-title {
    margin-bottom: var(--spacing);
  }
</style>
```

最终渲染结果：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-02-12-02-04.png)

对应的真实 DOM 结构：

```html
<div
  data-v-7ba5bd90=""
  class="theme-provider"
  style="--primary-color: #42b883; --secondary-color: #35495e; --border-radius: 8px; --spacing: 16px;"
>
  <div data-v-7ba5bd90="" class="card">
    <h2 data-v-7ba5bd90="" class="card-title">标题</h2>
    <p data-v-7ba5bd90="">内容</p>
  </div>
</div>
```

在实际开发中的最佳实践是：

- 简单的动态样式（如根据状态切换颜色）使用 :class 配合预定义的 CSS 类来处理
- 需要精确的数值控制（如位置、大小、动画）时使用 :style 或 v-bind() in CSS
- 需要主题化或全局样式变量时使用 CSS 自定义属性方案
