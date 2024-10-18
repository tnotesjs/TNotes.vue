# 0001. 属性

## 📝 summary

- 运行时声明（runtime declarations）
- 基于类型的声明（type-based declarations）
- Prop 命名规范
- v-bind 传递整个对象
- 单向数据流

在本节的示例中，都有对应的视频讲解，通过多个 demo 来了解有关 props 的相关内容。

## ⏰ todos

- [ ] 内容细分，粒度：一条视频对应一篇文档。

## 🔗 links

- https://cn.vuejs.org/guide/typescript/composition-api.html
  - Vue，TypeScript，TS 与组合式 API。
- https://cn.vuejs.org/guide/components/props.html
  - Vue，深入组件，Props。
- https://cn.vuejs.org/api/utility-types.html#proptype-t
  - Vue，进阶 API，TypeScript 工具类型。

## 📺 video - 视频概述

| 标题     | 简述                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 属性声明 | 在 `<script lang='ts' setup>` 中，如何声明 props。                                     |
| 属性访问 | 如何在 `<script>` 和 `<template>` 中访问 props。                                       |
| 属性校验 | 介绍 validator 字段；介绍如何不用 validator，使用 watch 来监听 props，自定义校验规则。 |
| PropType | 介绍 PropType 的应用场景 - 细化类型                                                    |
| toRefs   | 介绍 toRefs 的应用场景 - 解构 props 时保持响应式                                       |

> 视频录制的时候正好刚跑完步，喝着雪碧，所以会时不时有点儿打嗝的声音。

## ❌ error - 错误说明

- 在 Props 系列的视频中 `declarations`（声明 `/ ˌdekləˈreɪʃnz /`） 这个单词的发音错误，读成了 `direction`（方向 `/ daɪˈrekʃn /`）。

## 📒 notes - 属性 - 运行时声明 vs. 基于类型的声明

- Q：**什么是“运行时声明”（runtime props declarations）、“基于类型的声明”（type-based props declarations）？**

