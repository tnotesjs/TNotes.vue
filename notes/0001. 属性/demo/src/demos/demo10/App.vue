<!-- src/demos/demo10/App.vue -->
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
</template>
