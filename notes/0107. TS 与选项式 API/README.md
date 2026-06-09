# [0107. TS 与选项式 API](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0107.%20TS%20%E4%B8%8E%E9%80%89%E9%A1%B9%E5%BC%8F%20API)

<!-- region:toc -->

- [1. 本节内容](#1-本节内容)
- [2. 评价](#2-评价)
- [3. 选项式 API 能否和 TypeScript 一起稳定工作？](#3-选项式-api-能否和-typescript-一起稳定工作)
- [4. Props、Emits、计算属性在 Options API 里怎么拿到类型？](#4-propsemits计算属性在-options-api-里怎么拿到类型)
  - [4.1. Props](#41-props)
  - [4.2. Emits](#42-emits)
  - [4.3. 计算属性](#43-计算属性)
- [5. 复杂 Props、DOM 事件和低版本 TS 有哪些坑？](#5-复杂-propsdom-事件和低版本-ts-有哪些坑)
  - [5.1. 复杂 Props 用 `PropType`](#51-复杂-props-用-proptype)
  - [5.2. DOM 事件不要让参数掉成 `any`](#52-dom-事件不要让参数掉成-any)
  - [5.3. TypeScript 4.7 之前的注意点](#53-typescript-47-之前的注意点)
- [6. 全局属性和自定义选项为什么要做模块扩展？](#6-全局属性和自定义选项为什么要做模块扩展)
  - [6.1. 扩展全局属性](#61-扩展全局属性)
  - [6.2. 扩展自定义选项](#62-扩展自定义选项)
  - [6.3. 全局自定义指令](#63-全局自定义指令)
- [7. 引用](#7-引用)

<!-- endregion:toc -->

## 1. 本节内容

- defineComponent
- Props 推导
- PropType
- Emits 类型
- 计算属性
- 事件处理
- 模块扩展
- 自定义选项

## 2. 评价

官方明确说过：如果用了 TypeScript，更推荐组合式 API，因为它的推导更简单、高效、可靠。但这不代表选项式 API 不能用。只要你掌握 `defineComponent()`、`PropType` 和模块扩展，TypeScript 在选项式 API 下仍然可以工作得很稳。

## 3. 选项式 API 能否和 TypeScript 一起稳定工作？

可以，但前提是要用 `defineComponent()` 包装组件。

```ts
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    name: String,
    msg: { type: String, required: true },
  },
  mounted() {
    this.name
    this.msg
  },
})
```

`defineComponent()` 的作用是把 `props`、`data`、`computed`、`methods` 等选项串成一套可推导的类型信息。没有它，TypeScript 很难在 Options API 下给出可靠推断。

## 4. Props、Emits、计算属性在 Options API 里怎么拿到类型？

### 4.1. Props

对简单 prop，直接靠构造函数声明就能推导：

```ts
export default defineComponent({
  props: {
    name: String,
    id: [Number, String],
    msg: { type: String, required: true },
  },
  mounted() {
    this.name
    this.id
    this.msg
  },
})
```

其中：

- `required: true` 会影响可选性推导
- `default` 也会参与类型推导

### 4.2. Emits

官方建议用对象形式声明 `emits`，既能做运行时校验，也能得到参数类型：

```ts
export default defineComponent({
  emits: {
    addBook(payload: { bookName: string }) {
      return payload.bookName.length > 0
    },
  },
  methods: {
    onSubmit() {
      this.$emit('addBook', { bookName: 'Vue' })
    },
  },
})
```

如果事件未声明，或 payload 类型不对，TypeScript 会报错。

### 4.3. 计算属性

计算属性通常会根据返回值自动推导：

```ts
computed: {
  greeting() {
    return this.message + '!'
  }
}
```

如果你想显式限制返回类型，也可以直接写出来：

```ts
computed: {
  greeting(): string {
    return this.message + '!'
  },
  greetingUppercased: {
    get(): string {
      return this.greeting.toUpperCase()
    },
    set(newValue: string) {
      this.message = newValue.toUpperCase()
    },
  },
}
```

## 5. 复杂 Props、DOM 事件和低版本 TS 有哪些坑？

### 5.1. 复杂 Props 用 `PropType`

运行时的 `props` 选项本身只擅长表示构造函数类型。遇到对象结构、函数签名等复杂类型时，要用 `PropType`：

```ts
import type { PropType } from 'vue'

interface Book {
  title: string
  author: string
  year: number
}

export default defineComponent({
  props: {
    book: {
      type: Object as PropType<Book>,
      required: true,
    },
    callback: Function as PropType<(id: number) => void>,
  },
})
```

### 5.2. DOM 事件不要让参数掉成 `any`

```ts
methods: {
  handleChange(event: Event) {
    console.log((event.target as HTMLInputElement).value)
  }
}
```

尤其在 `strict` 或 `noImplicitAny` 开启时，显式写事件类型几乎是必需的。

### 5.3. TypeScript 4.7 之前的注意点

官方专门提醒：如果 TypeScript 版本低于 4.7，`validator` 和 `default` 里最好使用箭头函数，避免 `this` 被错误推导。

```ts
bookA: {
  type: Object as PropType<Book>,
  default: () => ({
    title: 'Arrow Function Expression',
  }),
  validator: (book: Book) => !!book.title,
}
```

## 6. 全局属性和自定义选项为什么要做模块扩展？

因为插件往往会往组件实例上挂新东西，TypeScript 默认并不知道这些属性存在。

### 6.1. 扩展全局属性

比如插件通过 `app.config.globalProperties` 注入：

- `this.$http`
- `this.$translate`

就需要扩展 `ComponentCustomProperties`：

```ts
import axios from 'axios'

export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $http: typeof axios
    $translate: (key: string) => string
  }
}
```

这里最关键的坑是：这个文件必须是一个 TypeScript 模块，所以要有顶级 `import` 或 `export {}`。否则你不是在“扩展”，而是在“覆盖”原始类型。

这个声明文件还要确保被 `tsconfig.json` 包含；如果你在写库，还要通过 `package.json` 的 `types` 字段暴露出去。

### 6.2. 扩展自定义选项

如果某个插件引入新的组件选项，比如路由守卫一类能力，也可以通过 `ComponentCustomOptions` 做模块扩展。

```ts
declare module 'vue' {
  interface ComponentCustomOptions {
    beforeRouteEnter?(to: Route, from: Route, next: () => void): void
  }
}
```

原理和扩展全局属性完全一致。

### 6.3. 全局自定义指令

这部分在官方文档里直接指向“TS 与组合式 API”里的全局指令类型写法，因为底层思路相同，本质上也是在扩展 Vue 暴露出来的类型入口。

## 7. 引用

- [Vue.js 官方文档 - TS 与选项式 API][1]
- [Vue.js 官方文档 - TS 总览][2]
- [TypeScript - Declaration Merging][3]
- [Vue.js 官方文档 - TS 与组合式 API][4]

[1]: https://cn.vuejs.org/guide/typescript/options-api.html
[2]: https://cn.vuejs.org/guide/typescript/overview.html
[3]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
[4]: https://cn.vuejs.org/guide/typescript/composition-api.html
