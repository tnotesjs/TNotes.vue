<!-- src/demos/demo1/Comp.vue -->
<script setup lang="ts">
defineProps<{ msg: string }>()
// 约束
// msg 是 string 类型
// msg 是必填的

// 这种方式利用 TypeScript 的泛型来定义 props 的类型，简单直观。
// 适合简单类型的 props 定义，写起来比较简洁，且属性类型清晰。
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>