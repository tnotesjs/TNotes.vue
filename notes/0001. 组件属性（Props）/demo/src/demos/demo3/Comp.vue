<!-- src/demos/demo3/Comp.vue -->
<script setup lang="ts">
type Props = {
  msg: string
}
defineProps<Props>()
// 约束
// msg 是 string 类型
// msg 是必填的

// 类型别名提供了一种结构化的方式来定义 props 类型。
// 适合需要复用类型定义的情况，可以定义复杂的类型结构，便于复用。
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>