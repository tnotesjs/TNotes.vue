<!-- src/demos/demo9/App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import type { Book } from './Comp.vue'
import Comp from './Comp.vue'
const book = ref<Book>({
    title: "123",
    author: "abc",
    year: 2024
  })
</script>

<template>
  <Comp :book='book' />
  <Comp :book='{ title: "456", author: "ABC", year: 2025 }' />

  <!--
    如果将 book 的类型约束设置为 Object
    那么下面这种也是 ok 的
    如果 book 的类型约束设置为 Object as PropType<Book>
    那么下面这种就会报错
  -->
  <!-- <Comp :book='{a: 1, b: 2}' /> -->
</template>
