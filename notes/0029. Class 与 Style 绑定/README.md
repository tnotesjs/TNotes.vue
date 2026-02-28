# [0029. Class 与 Style 绑定](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0029.%20Class%20%E4%B8%8E%20Style%20%E7%BB%91%E5%AE%9A)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何使用对象语法和数组语法绑定 HTML Class？](#3--如何使用对象语法和数组语法绑定-html-class)
- [4. 🤔 如何使用对象语法和数组语法绑定内联样式？](#4--如何使用对象语法和数组语法绑定内联样式)
- [5. 🤔 Vue 如何处理样式的多值和自动前缀？](#5--vue-如何处理样式的多值和自动前缀)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 绑定 HTML Class（对象语法、数组语法）
- 绑定内联样式（对象语法、数组语法）
- 多值与自动前缀处理

## 2. 🫧 评价

- todo

## 3. 🤔 如何使用对象语法和数组语法绑定 HTML Class？

Vue 对 class 属性的绑定做了专门的增强，除了支持普通的字符串绑定外，还支持对象语法和数组语法。这两种语法让动态 class 的管理变得更加直观和灵活，是实际 Vue 开发中使用频率极高的特性。

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
  // 可能渲染为：<button class="btn btn-primary btn-large btn-round">
</script>
```

在组件上使用 class 绑定时，行为取决于组件的根元素数量。如果组件只有一个根元素，class 会被自动合并到根元素上：

```html
<!-- 子组件 MyButton.vue -->
<template>
  <button class="btn">
    <slot />
  </button>
</template>

<!-- 父组件 -->
<template>
  <MyButton class="large primary" :class="{ active: isActive }">
    点击我
  </MyButton>
  <!-- 渲染为：<button class="btn large primary active"> -->
</template>
```

如果组件有多个根元素，需要通过 $attrs.class 手动指定哪个元素接收外部传入的 class：

```html
<!-- 多根元素组件 -->
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
```

一个实际的组件库场景——实现一个支持多种变体和状态的 Tag 组件：

```html
<template>
  <span :class="tagClasses">
    <slot />
    <button v-if="closable" @click="$emit('close')" class="tag-close">x</button>
  </span>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    type: { type: String, default: 'default' },
    size: { type: String, default: 'medium' },
    closable: { type: Boolean, default: false },
    round: { type: Boolean, default: false },
    plain: { type: Boolean, default: false },
  })

  const tagClasses = computed(() => [
    'tag',
    `tag-${props.type}`,
    `tag-${props.size}`,
    {
      'tag-round': props.round,
      'tag-plain': props.plain,
      'tag-closable': props.closable,
    },
  ])
</script>
```

## 4. 🤔 如何使用对象语法和数组语法绑定内联样式？

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

数组语法允许你将多个样式对象合并应用到同一个元素上。后面的对象中的同名属性会覆盖前面的：

```html
<template>
  <div :style="[baseStyles, overrideStyles, conditionalStyles]">合并样式</div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue'

  const baseStyles = reactive({
    fontSize: '14px',
    color: '#333',
    padding: '10px',
    lineHeight: '1.5',
  })

  const overrideStyles = reactive({
    color: '#666',
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

一个常见的实际应用是实现可拖拽或可调整大小的元素：

```html
<template>
  <div :style="boxStyles" @mousedown="startDrag">拖拽我</div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const x = ref(100)
  const y = ref(100)
  const isDragging = ref(false)

  const boxStyles = computed(() => ({
    position: 'absolute',
    left: `${x.value}px`,
    top: `${y.value}px`,
    width: '150px',
    height: '100px',
    backgroundColor: isDragging.value ? '#e0f0ff' : '#f0f0f0',
    border: '2px solid #999',
    cursor: isDragging.value ? 'grabbing' : 'grab',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: isDragging.value ? 'none' : 'background-color 0.2s',
  }))

  function startDrag(e) {
    isDragging.value = true
    const startX = e.clientX - x.value
    const startY = e.clientY - y.value

    function onMouseMove(e) {
      x.value = e.clientX - startX
      y.value = e.clientY - startY
    }

    function onMouseUp() {
      isDragging.value = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
</script>
```

## 5. 🤔 Vue 如何处理样式的多值和自动前缀？

Vue 在处理内联样式绑定时，内置了两个非常实用的特性：自动添加浏览器厂商前缀和支持多值语法。这些特性让开发者不需要手动处理浏览器兼容性问题，可以直接使用标准的 CSS 属性名。

自动前缀是指当你在 :style 中使用需要浏览器前缀的 CSS 属性时，Vue 会在运行时自动检测当前浏览器需要哪种前缀，并自动添加。例如 transform、transition、flexbox 相关属性等在某些旧版浏览器中需要加 -webkit-、-moz-、-ms- 等前缀，Vue 会帮你处理这些细节：

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

在运行时，Vue 会检测当前浏览器环境。如果浏览器需要 webkit 前缀来支持 transform，Vue 会自动生成 -webkit-transform。如果浏览器原生支持标准写法，则直接使用标准写法。这个检测过程只在应用初始化时进行一次，不会影响运行时性能。

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

除了 :style 绑定的这些增强特性外，Vue 3 还引入了一个更加强大的特性——在 `<style>` 标签中使用 v-bind 来绑定组件的响应式状态。这种方式比内联样式更加优雅，因为它将样式定义保留在 CSS 中，同时又可以使用 JavaScript 的动态值：

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

v-bind() 在 CSS 中的实现原理是通过 CSS 自定义属性（CSS Variables）来桥接的。Vue 会在组件的根元素上设置内联的 CSS 自定义属性（如 --abc123: #42b883），然后在编译后的 CSS 中使用 var(--abc123) 来引用这个值。当响应式数据变化时，Vue 只需要更新自定义属性的值，浏览器会自动应用新的样式，无需重新编译 CSS。

你也可以手动使用 CSS 自定义属性来实现类似的效果，这在需要在子元素中继承动态样式值时特别有用：

```html
<template>
  <div class="theme-provider" :style="themeVars">
    <div class="card">
      <h2 class="card-title">标题</h2>
      <p class="card-content">内容</p>
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

在实际开发中的最佳实践是：简单的动态样式（如根据状态切换颜色）使用 :class 配合预定义的 CSS 类来处理；需要精确的数值控制（如位置、大小、动画）时使用 :style 或 v-bind() in CSS；需要主题化或全局样式变量时使用 CSS 自定义属性方案。
