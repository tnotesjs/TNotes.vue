# [0068. 搭配 TypeScript](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0068.%20%E6%90%AD%E9%85%8D%20TypeScript)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 这一章的一些代码片段可以丢到 Vue SFC Playground 中在线测试吗？](#3--这一章的一些代码片段可以丢到-vue-sfc-playground-中在线测试吗)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- Vue + TS

## 2. 🫧 评价

重点看“TypeScript 与组合式 API”的配合使用，选项式 API 简单了解即可。

::: tip 官方原话

虽然 Vue 的确支持在选项式 API 中使用 TypeScript，但在使用 TypeScript 的前提下更推荐使用组合式 API，因为它提供了更简单、高效和可靠的类型推导。

:::

很多细节其实是 Vue 中的知识点，和 TS 相关的，随便挑一篇看看差不多就够了，其它的也都是照葫芦画瓢。

<N :ids="[
'0106',
'0011',
'0012',
'0016',
'0021',
'0022',
'0026',
'0031',
'0035',
'0036',
'0040',
'0107',
]"/>

## 3. 🤔 这一章的一些代码片段可以丢到 Vue SFC Playground 中在线测试吗？

在 Vue SFC Playground 环境中不便于测试和 TS 相关的报错。

以下面这个示例为例：

```html
<script setup lang="ts">
  import { ref } from 'vue'

  const count = ref(1)
  count.value = 123 // ok
  count.value = '123' // error
</script>
```

其中 `count.value = '123'` 显然是错误的，但是在 Vue SFC Playground 中不会报错。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-05-19-22-11.png)

推荐的实验方式：利用 vite 快速在本地起一个 DEMO 测试环境来实验。

做法非常简单，直接跑 `pnpm create vite` 按照引导，初始化一个 Vue + TS + Vite 的环境即可。

![img](https://cdn.jsdelivr.net/gh/tnotesjs/imgs-2026@main/2026-06-05-19-20-17.png)
