<!-- src/demos/demo10/Comp.vue -->
<script setup lang="ts">
export interface Book {
  title: string
  author: string
  year: number
}

defineProps<{ book: Book }>()
// type-based props declarations
// 通过基于类型的声明，一个 prop 可以像使用其他任何类型一样使用一个复杂类型。

// 对比 runtime props declarations
// type-based props declarations 的语法更简洁
</script>

<template>
  <pre>{{ book }}</pre>
</template>

