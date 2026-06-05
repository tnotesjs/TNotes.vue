# [0026. 为事件处理函数标注类型](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0026.%20%E4%B8%BA%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86%E5%87%BD%E6%95%B0%E6%A0%87%E6%B3%A8%E7%B1%BB%E5%9E%8B)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 如何为事件处理函数标注类型？](#3--如何为事件处理函数标注类型)
  - [3.1. 基本写法](#31-基本写法)
  - [3.2. 常见 DOM 事件类型](#32-常见-dom-事件类型)
  - [3.3. 点击事件](#33-点击事件)
  - [3.4. 输入框事件](#34-输入框事件)
  - [3.5. 更安全的写法：使用类型守卫](#35-更安全的写法使用类型守卫)
  - [3.6. checkbox 事件](#36-checkbox-事件)
  - [3.7. select 事件](#37-select-事件)
  - [3.8. textarea 事件](#38-textarea-事件)
  - [3.9. 键盘事件](#39-键盘事件)
  - [3.10. 表单提交事件](#310-表单提交事件)
  - [3.11. `target` 和 `currentTarget` 的区别](#311-target-和-currenttarget-的区别)
  - [3.12. 如果不用事件对象，就不需要参数](#312-如果不用事件对象就不需要参数)
  - [3.13. 自定义组件事件的处理函数类型](#313-自定义组件事件的处理函数类型)
  - [3.14. 推荐写法总结](#314-推荐写法总结)
    - [点击事件](#点击事件)
    - [输入事件](#输入事件)
    - [键盘事件](#键盘事件)
    - [表单提交](#表单提交)
    - [自定义组件事件](#自定义组件事件)
  - [3.15. 核心记住](#315-核心记住)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- todo

## 2. 🫧 评价

在 Vue 3 + TypeScript 中，为事件处理函数标注类型，核心就是：给事件参数标注对应的 DOM Event 类型。

最常见写法：

```html
<script setup lang="ts">
  function handleClick(event: PointerEvent): void {
    console.log(event.clientX, event.clientY)
  }
</script>

<template>
  <button @click="handleClick">点击</button>
</template>
```

## 3. 🤔 如何为事件处理函数标注类型？

### 3.1. 基本写法

```ts
function handleClick(event: PointerEvent) {
  console.log(event.clientX)
}
```

或者箭头函数：

```ts
const handleClick = (event: PointerEvent): void => {
  console.log(event.clientY)
}
```

模板中使用：

```html
<button @click="handleClick">点击</button>

<!-- 如果你写成： -->
<button @click="handleClick()">点击</button>
<!-- 这种写法会报错
因为上述定义的 handleClick 的 event 参数是必填的
如果不传递参数，就会抛出错误 -->

<!-- 如果想要显式传入事件参数，可以这么写： -->
<button @click="handleClick($event)">点击</button>
```

### 3.2. 常见 DOM 事件类型

| 事件                                     | 推荐类型         |
| ---------------------------------------- | ---------------- |
| `@click`                                 | `PointerEvent`   |
| `@dblclick`                              | `MouseEvent`     |
| `@mousedown` / `@mouseup` / `@mousemove` | `MouseEvent`     |
| `@keydown` / `@keyup`                    | `KeyboardEvent`  |
| `@input`                                 | `InputEvent`     |
| `@change`                                | `Event`          |
| `@submit`                                | `SubmitEvent`    |
| `@focus` / `@blur`                       | `FocusEvent`     |
| `@scroll`                                | `Event`          |
| `@wheel`                                 | `WheelEvent`     |
| `@pointerdown` / `@pointermove`          | `PointerEvent`   |
| `@dragstart` / `@drop`                   | `DragEvent`      |
| `@copy` / `@paste` / `@cut`              | `ClipboardEvent` |
| `@touchstart` / `@touchmove`             | `TouchEvent`     |

::: tip

具体的类型参数，可以点进对应事件的类型声明文件查看。

这里是从 `node_modules\.pnpm\@vue+runtime-dom@3.5.35\node_modules\@vue\runtime-dom\dist\runtime-dom.d.ts` 中 copy 的内容：

```ts
export interface Events {
  onCopy: ClipboardEvent
  onCut: ClipboardEvent
  onPaste: ClipboardEvent
  onCompositionend: CompositionEvent
  onCompositionstart: CompositionEvent
  onCompositionupdate: CompositionEvent
  onDrag: DragEvent
  onDragend: DragEvent
  onDragenter: DragEvent
  onDragexit: DragEvent
  onDragleave: DragEvent
  onDragover: DragEvent
  onDragstart: DragEvent
  onDrop: DragEvent
  onFocus: FocusEvent
  onFocusin: FocusEvent
  onFocusout: FocusEvent
  onBlur: FocusEvent
  onChange: Event
  onBeforeinput: InputEvent
  onFormdata: FormDataEvent
  onInput: InputEvent
  onReset: Event
  onSubmit: SubmitEvent
  onInvalid: Event
  onFullscreenchange: Event
  onFullscreenerror: Event
  onLoad: Event
  onError: Event
  onKeydown: KeyboardEvent
  onKeypress: KeyboardEvent
  onKeyup: KeyboardEvent
  onDblclick: MouseEvent
  onMousedown: MouseEvent
  onMouseenter: MouseEvent
  onMouseleave: MouseEvent
  onMousemove: MouseEvent
  onMouseout: MouseEvent
  onMouseover: MouseEvent
  onMouseup: MouseEvent
  onAbort: UIEvent
  onCanplay: Event
  onCanplaythrough: Event
  onDurationchange: Event
  onEmptied: Event
  onEncrypted: MediaEncryptedEvent
  onEnded: Event
  onLoadeddata: Event
  onLoadedmetadata: Event
  onLoadstart: Event
  onPause: Event
  onPlay: Event
  onPlaying: Event
  onProgress: ProgressEvent
  onRatechange: Event
  onSeeked: Event
  onSeeking: Event
  onStalled: Event
  onSuspend: Event
  onTimeupdate: Event
  onVolumechange: Event
  onWaiting: Event
  onSelect: Event
  onScroll: Event
  onScrollend: Event
  onTouchcancel: TouchEvent
  onTouchend: TouchEvent
  onTouchmove: TouchEvent
  onTouchstart: TouchEvent
  onAuxclick: PointerEvent
  onClick: PointerEvent
  onContextmenu: PointerEvent
  onGotpointercapture: PointerEvent
  onLostpointercapture: PointerEvent
  onPointerdown: PointerEvent
  onPointermove: PointerEvent
  onPointerup: PointerEvent
  onPointercancel: PointerEvent
  onPointerenter: PointerEvent
  onPointerleave: PointerEvent
  onPointerover: PointerEvent
  onPointerout: PointerEvent
  onBeforetoggle: ToggleEvent
  onToggle: ToggleEvent
  onWheel: WheelEvent
  onAnimationcancel: AnimationEvent
  onAnimationstart: AnimationEvent
  onAnimationend: AnimationEvent
  onAnimationiteration: AnimationEvent
  onSecuritypolicyviolation: SecurityPolicyViolationEvent
  onTransitioncancel: TransitionEvent
  onTransitionend: TransitionEvent
  onTransitionrun: TransitionEvent
  onTransitionstart: TransitionEvent
}
```

:::

### 3.3. 点击事件

```html
<script setup lang="ts">
  function handleClick(event: PointerEvent): void {
    console.log(event.clientX)
    console.log(event.clientY)
  }
</script>

<template>
  <button @click="handleClick">点击</button>
</template>
```

如果还要传额外参数：

```html
<script setup lang="ts">
  function handleDelete(id: number, event: PointerEvent): void {
    console.log(id)
    console.log(event.clientX)
  }
</script>

<template>
  <button @click="handleDelete(1, $event)">删除</button>
</template>
```

### 3.4. 输入框事件

`@input` 通常标注为 `InputEvent`，`@change` 通常标注为 `Event`。

```html
<script setup lang="ts">
  import { ref } from 'vue'

  const keyword = ref('')

  function handleInput(event: InputEvent): void {
    const input = event.target as HTMLInputElement
    keyword.value = input.value
  }
</script>

<template>
  <input @input="handleInput" />
</template>
```

这里为什么要写：

```ts
event.target as HTMLInputElement
```

因为 TypeScript 只知道：

```ts
event.target // EventTarget | null
```

它不知道这个事件一定来自 `<input>`，所以不能直接访问：

```ts
event.target.value
```

下面这样会报错：

```ts
function handleInput(event: Event) {
  console.log(event.target.value)
  // 报错：Property 'value' does not exist on type 'EventTarget'
}
```

正确写法：

```ts
function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  console.log(target.value)
}
```

### 3.5. 更安全的写法：使用类型守卫

如果不想直接断言，可以这样写：

```ts
function handleInput(event: Event): void {
  const target = event.target

  if (!(target instanceof HTMLInputElement)) return

  keyword.value = target.value
}
```

这样 TypeScript 会在 `if` 之后知道：

```ts
target // HTMLInputElement
```

### 3.6. checkbox 事件

```html
<script setup lang="ts">
  import { ref } from 'vue'

  const checked = ref(false)

  function handleChange(event: Event): void {
    const input = event.target as HTMLInputElement
    checked.value = input.checked
  }
</script>

<template>
  <input type="checkbox" @change="handleChange" />
</template>
```

注意：

```ts
input.value
```

是字符串值。

而 checkbox 是否选中应该用：

```ts
input.checked
```

### 3.7. select 事件

```html
<script setup lang="ts">
  import { ref } from 'vue'

  const selected = ref('')

  function handleSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement
    selected.value = select.value
  }
</script>

<template>
  <select @change="handleSelectChange">
    <option value="vue">Vue</option>
    <option value="react">React</option>
  </select>
</template>
```

### 3.8. textarea 事件

```ts
function handleTextareaInput(event: Event): void {
  const textarea = event.target as HTMLTextAreaElement
  console.log(textarea.value)
}
```

### 3.9. 键盘事件

```html
<script setup lang="ts">
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      console.log('按下 Enter')
    }

    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      console.log('Ctrl + S')
    }
  }
</script>

<template>
  <input @keydown="handleKeydown" />
</template>
```

常用属性：

```ts
event.key
event.code
event.ctrlKey
event.shiftKey
event.altKey
event.metaKey
```

### 3.10. 表单提交事件

```html
<script setup lang="ts">
  function handleSubmit(event: SubmitEvent): void {
    console.log('submit', event)
  }
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <button type="submit">提交</button>
  </form>
</template>
```

用了：

```html
@submit.prevent
```

Vue 会自动执行：

```ts
event.preventDefault()
```

但事件对象仍然会传给 `handleSubmit`。

如果你的项目环境里 `SubmitEvent` 类型不可用，可以用更通用的：

```ts
function handleSubmit(event: Event): void {
  console.log(event)
}
```

### 3.11. `target` 和 `currentTarget` 的区别

```ts
event.target
```

表示真正触发事件的元素。

```ts
event.currentTarget
```

表示绑定事件监听器的元素。

例如：

```html
<button @click="handleClick">
  <span>点击文字</span>
</button>
```

如果点击的是 `span`，那么：

```ts
event.target // 可能是 span
event.currentTarget // button
```

所以如果你想拿绑定事件的那个元素，可以用：

```ts
function handleClick(event: PointerEvent): void {
  const button = event.currentTarget as HTMLButtonElement
  console.log(button.disabled)
}
```

### 3.12. 如果不用事件对象，就不需要参数

```ts
function handleClick(): void {
  console.log('clicked')
}
```

模板：

```html
<button @click="handleClick">点击</button>
```

虽然浏览器会传事件对象，但你的函数不接收它也没问题。

### 3.13. 自定义组件事件的处理函数类型

如果是组件自定义事件，处理函数参数不是 DOM Event，而是子组件 `emit` 出来的数据。

子组件：

```html
<script setup lang="ts">
  interface User {
    id: number
    name: string
  }

  const emit = defineEmits<{
    select: [user: User]
    close: []
  }>()

  function handleClick() {
    emit('select', {
      id: 1,
      name: 'Tom',
    })
  }
</script>
```

父组件：

```html
<script setup lang="ts">
  interface User {
    id: number
    name: string
  }

  function handleSelect(user: User): void {
    console.log(user.id, user.name)
  }

  function handleClose(): void {
    console.log('close')
  }
</script>

<template>
  <UserCard @select="handleSelect" @close="handleClose" />
</template>
```

这里的 `handleSelect` 参数是：

```ts
user: User
```

而不是：

```ts
event: Event
```

因为它接收的是子组件传出来的 payload。

### 3.14. 推荐写法总结

#### 点击事件

```ts
function handleClick(event: PointerEvent): void {}
```

#### 输入事件

```ts
function handleInput(event: InputEvent): void {
  const input = event.target as HTMLInputElement
  console.log(input.value)
}
```

#### 键盘事件

```ts
function handleKeydown(event: KeyboardEvent): void {}
```

#### 表单提交

```ts
function handleSubmit(event: SubmitEvent): void {}
```

#### 自定义组件事件

```ts
function handleSelect(user: User): void {}
```

### 3.15. 核心记住

1. 原生 DOM 事件参数标注为对应的 DOM Event 类型。
2. `@click` 通常是 `PointerEvent`。
3. `@input` 通常是 `InputEvent`，`@change` 通常是 `Event`。
4. 访问 `event.target.value` 时，需要断言具体元素类型。
5. 自定义组件事件的参数类型取决于子组件 `emit` 出来的 payload。
6. 不用事件对象时，函数可以不写参数。
7. `@click="handler"` 会自动传事件，`@click="handler()"` 不会自动传事件。
