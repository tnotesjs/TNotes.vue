<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue!')
const count = ref(0)
</script>

<template>
  <h1>{{ message }}</h1>
  <button @click="count++">点击次数：{{ count }}</button>
</template>
