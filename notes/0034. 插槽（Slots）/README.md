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
- [9. 💻 demos.1 - 默认插槽](#9--demos1---默认插槽)
- [10. 💻 demos.2 - 默认内容（后备内容）](#10--demos2---默认内容后备内容)
- [11. 💻 demos.3 - 具名插槽](#11--demos3---具名插槽)
  - [11.1. 适当深入编译原理](#111-适当深入编译原理)
- [12. 💻 demos.4 - 条件插槽](#12--demos4---条件插槽)
- [13. 💻 demos.5 - 动态插槽名](#13--demos5---动态插槽名)
- [14. 💻 demos.6 - 作用域插槽](#14--demos6---作用域插槽)
- [15. 💻 demos.7 - 具名作用域插槽 + 显式默认插槽](#15--demos7---具名作用域插槽--显式默认插槽)
- [16. 💻 demos.8 - 无渲染组件](#16--demos8---无渲染组件)
- [17. 🔗 引用](#17--引用)

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

插槽就是子组件留了个坑，让父组件把内容塞进去。这些坑可以有自己的名称，以便父组件分门别类地塞内容。子组件也可以往坑中传一些数据，这样父组件在塞内容的时候就可以在填充内容的时候使用这些来自子组件的数据了。

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

具名插槽的本质就是：让父组件把多段模板内容，按名字分配到子组件不同的渲染位置。

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
      <slot name="footer">xxx</slot>
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

具名插槽同样支持默认内容。比如上面的 `footer` 插槽，如果父组件没有提供 `#footer` 的内容，就会显示 `xxx`。这在导航栏、侧边栏、页脚等可选区域的组件中非常实用——使用者不传内容时，组件自己兜底显示合理的内容。

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

动态插槽名在使用时有几个注意事项：

- 动态插槽名的值应该是字符串类型。如果值为 `null` 或 `undefined`，插槽将不会被渲染。
- 动态插槽名不能包含空格或特殊字符，因为它们需要作为有效的属性名使用。
- 在实际开发中，动态插槽名多见于需要根据数据配置动态渲染 UI 的通用组件中，比如表格的列自定义、表单的字段自定义、布局系统的区域自定义等。

## 7. 🤔 什么是作用域插槽？

普通插槽内容默认只能访问父组件作用域，但有些场景下，父组件既想控制模板结构，又想拿到子组件内部准备好的数据，这时就轮到作用域插槽出场了。

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

你可以把它类比成：父组件把一段函数传给子组件，子组件执行这段函数时把自己的数据作为参数传进去。

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

这种模式特别适合「无渲染组件」，就是组件自己几乎不负责某块区域的 UI 渲染，只封装逻辑，再通过作用域插槽把数据交给父组件，让父组件自行决定怎么渲染 UI。

不过在现代 Vue 3 项目里，很多「纯逻辑复用」的场景也可以直接用组合式函数 composable 来做，所以作用域插槽更适合那种「逻辑和部分结构都要一起封装，但最终展示方式仍想交给使用者」的场景。

## 9. 💻 demos.1 - 默认插槽

::: code-group

```html [App.vue]
<script setup>
  import FancyButton from './FancyButton.vue'
</script>

<template>
  <!-- 插槽内容：父组件定义，最终渲染到子组件的 <slot> 出口位置 -->
  <FancyButton>Click me!</FancyButton>

  <!-- 插槽内容不限于文本，也可以是任意模板 -->
  <FancyButton> <strong>加粗</strong> + <em>斜体</em> </FancyButton>
</template>
```

```html [FancyButton.vue]
<template>
  <button class="fancy-btn">
    <!-- 插槽出口：父组件的内容会渲染到这里 -->
    <slot></slot>
  </button>
</template>

<style scoped>
  .fancy-btn {
    padding: 8px 16px;
    margin: 4px;
  }
</style>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-16-44-08.png)

## 10. 💻 demos.2 - 默认内容（后备内容）

::: code-group

```html [App.vue]
<script setup>
  import SubmitButton from './SubmitButton.vue'
</script>

<template>
  <!-- 没传内容，显示子组件的默认内容 "Submit" -->
  <SubmitButton />

  <!-- 传了内容，默认内容被覆盖 -->
  <SubmitButton>保存</SubmitButton>
</template>
```

```html [SubmitButton.vue]
<template>
  <button type="submit">
    <!-- "Submit" 是后备内容，父组件没传内容时才显示 -->
    <slot>Submit</slot>
  </button>
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-16-54-03.png)

## 11. 💻 demos.3 - 具名插槽

::: code-group

```html [App.vue]
<script setup>
  import BaseLayout from './BaseLayout.vue'
</script>

<template>
  <BaseLayout>
    <!-- 通过 #name 将内容分发到对应名称的插槽出口 -->
    <template #header>
      <h1>页面标题</h1>
    </template>

    <!-- 没有被 <template #xxx> 包裹的节点 → 隐式默认插槽 -->
    <p>正文段落一</p>
    <p>正文段落二</p>

    <template #footer>
      <p>© 2026 我的网站</p>
    </template>
  </BaseLayout>
</template>
```

```html [BaseLayout.vue]
<template>
  <div class="container">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <!-- 没有 name 的 slot 隐含名称为 "default" -->
      <slot></slot>
    </main>
    <footer>
      <!-- 具名插槽同样可以有默认内容 -->
      <slot name="footer">默认页脚</slot>
    </footer>
  </div>
</template>

<style scoped>
  .container {
    border: 1px solid #ccc;
    padding: 12px;
  }
  header {
    border-bottom: 1px solid #eee;
    margin-bottom: 8px;
    padding-bottom: 8px;
  }
  footer {
    border-top: 1px solid #eee;
    margin-top: 8px;
    padding-top: 8px;
  }
</style>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-16-55-28.png)

### 11.1. 适当深入编译原理

如果将上述的 App.vue 改为下面这种写法：

```html {11,17}
<script setup>
  import BaseLayout from './BaseLayout.vue'
</script>

<template>
  <BaseLayout>
    <template #header>
      <h1>页面标题</h1>
    </template>

    <p>正文段落一</p>

    <template #footer>
      <p>© 2026 我的网站</p>
    </template>

    <p>正文段落二</p>
  </BaseLayout>
</template>
```

你会发现最终渲染得到的内容是一样的：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-16-55-28.png)

背后的原因涉及到 Vue 编译器的处理逻辑。Vue 编译器在处理插槽时的设计行为，根源在 `packages/compiler-core/src/transforms/vSlot.ts` 的 `buildSlots` 函数中。

下面是简化版的编译器的处理逻辑伪代码：

```js
for (let i = 0; i < children.length; i++) {
    if (不是 <template v-slot:xxx>) {
        implicitDefaultChildren.push(该节点)   // <- 收集到暂存数组
        continue
    }
    // 否则按具名插槽处理
}
```

`buildSlots` 对组件的所有子节点做「一次线性遍历」，并维护一个 `implicitDefaultChildren` 数组，遍历结束后，再把 `implicitDefaultChildren` 里收集到的「所有节点」一次性打包成 `default` 插槽函数。

编译产物（伪代码）始终是：

```js
{
  header: _withCtx(() => [<h1>页面标题</h1>]),
  footer: _withCtx(() => [<p>© 2026 我的网站</p>]),
  default: _withCtx(() => [<p>正文段落一</p>, <p>正文段落二</p>]),
  _: 1 /* STABLE */
}
```

🤔 为什么两种写法结果相同？

对于第二种写法，编译器遍历子节点时的行为如下：

| 遇到的节点              | 处理方式                          |
| ----------------------- | --------------------------------- |
| 1. `<template #header>` | -> `header` 具名插槽              |
| 2. `<p>正文段落一</p>`  | -> 推入 `implicitDefaultChildren` |
| 3. `<template #footer>` | -> `footer` 具名插槽              |
| 4. `<p>正文段落二</p>`  | -> 推入 `implicitDefaultChildren` |

根据上述提供的伪代码不难发现，对于上述的提到的两种写法，主要差异体现在 3、4 的被遍历到的顺序上，但是无论是先 3 还是先 4，`implicitDefaultChildren` 记录的最终结果都是一样的。无论 `<p>正文段落二</p>` 写在 `<template #footer>` 之前还是之后，它都会被推入同一个 `implicitDefaultChildren` 数组，最终两个 `<p>` 按「文档顺序」合并成同一个 `default` 插槽函数。

`<p>正文段落二</p>` 的位置只影响它在 `implicitDefaultChildren` 数组中的收集顺序（即在 `default` 插槽内部的渲染顺序），而不影响它「属于哪个插槽」这件事，它永远都会落入 `default`。

## 12. 💻 demos.4 - 条件插槽

::: code-group

```html [App.vue]
<script setup>
  import Card from './Card.vue'
</script>

<template>
  <!-- 传了 header 和 default，没传 footer -->
  <Card>
    <template #header>卡片标题</template>
    <p>卡片正文内容</p>
  </Card>

  <!-- 什么都不传，外层包装也不会渲染 -->
  <Card />
</template>
```

```html [Card.vue]
<template>
  <div class="card">
    <!-- 条件插槽：通过 $slots 判断某个插槽是否被传入了内容 -->
    <!-- 只有真的传了内容，才渲染外层包装 div -->
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

<style scoped>
  .card {
    border: 1px solid #ccc;
    padding: 12px;
    margin: 8px 0;
  }
  .card-header {
    font-weight: bold;
    border-bottom: 1px solid #eee;
    padding-bottom: 4px;
    margin-bottom: 8px;
  }
  .card-footer {
    border-top: 1px solid #eee;
    padding-top: 4px;
    margin-top: 8px;
  }
</style>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-19-40-02.png)

## 13. 💻 demos.5 - 动态插槽名

::: code-group

```html [App.vue]
<script setup>
  import { ref } from 'vue'
  import BaseLayout from './BaseLayout.vue'

  const slotName = ref('header')
</script>

<template>
  <!-- 动态插槽名：运行时根据变量决定内容插到哪个插槽 -->
  <p>
    当前选择的插槽:
    <select v-model="slotName">
      <option value="header">header</option>
      <option value="footer">footer</option>
    </select>
  </p>

  <BaseLayout>
    <template #[slotName]>
      <p>这段内容会根据选择动态放入 {{ slotName }} 插槽</p>
    </template>
  </BaseLayout>
</template>
```

```html [BaseLayout.vue]
<template>
  <div style="border: 1px solid #ccc; padding: 12px;">
    <header style="border-bottom: 1px solid #eee; padding-bottom: 8px;">
      <slot name="header">默认头部</slot>
    </header>
    <main style="padding: 8px 0;">
      <slot>默认主体</slot>
    </main>
    <footer style="border-top: 1px solid #eee; padding-top: 8px;">
      <slot name="footer">默认底部</slot>
    </footer>
  </div>
</template>
```

:::

选择 header：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-19-41-06.png)

选择 footer：

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-19-41-24.png)

## 14. 💻 demos.6 - 作用域插槽

::: code-group

```html [App.vue]
<script setup>
  import ItemList from './ItemList.vue'

  const products = [
    { id: 1, name: '手机', price: 2999 },
    { id: 2, name: '耳机', price: 199 },
    { id: 3, name: '平板', price: 3999 },
  ]
</script>

<template>
  <!-- 默认渲染：使用子组件的后备内容 -->
  <h3>默认渲染</h3>
  <ItemList :items="products" />

  <!-- 作用域插槽：父组件拿到子组件通过 slot props 传来的数据，自定义渲染 -->
  <h3>自定义渲染</h3>
  <ItemList :items="products">
    <template #default="{ item, index }">
      <span
        >{{ index + 1 }}. {{ item.name }} -
        <strong>¥{{ item.price }}</strong></span
      >
    </template>
  </ItemList>
</template>
```

```html [ItemList.vue]
<script setup>
  defineProps({
    items: { type: Array, required: true },
  })
</script>

<template>
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      <!-- 通过属性将子组件内部数据"传"给插槽内容 -->
      <slot :item="item" :index="index">
        <!-- 后备内容 -->
        {{ item.name }}
      </slot>
    </li>
  </ul>
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-20-12-21.png)

## 15. 💻 demos.7 - 具名作用域插槽 + 显式默认插槽

::: code-group

```html [App.vue]
<script setup>
  import MyPanel from './MyPanel.vue'
</script>

<template>
  <MyPanel title="用户列表">
    <!-- 具名作用域插槽：header 暴露 title -->
    <template #header="{ title }">
      <h3>📋 {{ title }}</h3>
    </template>

    <!-- 默认插槽显式写法：同时使用具名+作用域时，避免歧义 -->
    <template #default="{ items }">
      <ul>
        <li v-for="item in items" :key="item.id">{{ item.name }}</li>
      </ul>
    </template>

    <template #footer="{ count }">
      <small>共 {{ count }} 条记录</small>
    </template>
  </MyPanel>
</template>
```

```html [MyPanel.vue]
<script setup>
  const props = defineProps({ title: String })
  const items = [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' },
    { id: 3, name: '王五' },
  ]
</script>

<template>
  <div style="border: 1px solid #ccc; padding: 12px;">
    <!-- 每个具名插槽都可以向父组件暴露自己的数据 -->
    <header>
      <slot name="header" :title="title"></slot>
    </header>
    <main>
      <slot :items="items"></slot>
    </main>
    <footer>
      <slot name="footer" :count="items.length"></slot>
    </footer>
  </div>
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-20-14-56.png)

## 16. 💻 demos.8 - 无渲染组件

::: code-group

```html [App.vue]
<script setup>
  import MouseTracker from './MouseTracker.vue'
</script>

<template>
  <!-- 无渲染组件：只封装逻辑，不负责 UI，渲染完全交给父组件 -->
  <MouseTracker v-slot="{ x, y }">
    <p>鼠标位置：({{ x }}, {{ y }})</p>
  </MouseTracker>
  <!-- 等效写法： -->
  <MouseTracker>
    <template #default="{x, y}">
      <p>鼠标位置：({{ x }}, {{ y }})</p>
    </template>
  </MouseTracker>
</template>
```

```html [MouseTracker.vue]
<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'

  const x = ref(0)
  const y = ref(0)

  function onMove(e) {
    x.value = e.clientX
    y.value = e.clientY
  }

  onMounted(() => window.addEventListener('mousemove', onMove))
  onUnmounted(() => window.removeEventListener('mousemove', onMove))
</script>

<template>
  <!-- 自身不渲染任何 UI，只通过作用域插槽把数据交给父组件 -->
  <slot :x="x" :y="y" />
</template>
```

:::

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-05-16-20-20-31.png)

## 17. 🔗 引用

- [Vue.js 官方文档 - 插槽][1]

[1]: https://cn.vuejs.org/guide/components/slots.html
