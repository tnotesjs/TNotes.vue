<template>
  <button @click="isVisible = !isVisible">
    切换组件显示/隐藏，测试 unmounted
  </button>
  <TestLifeCycle v-if="isVisible" />
</template>

<script setup>
import { ref } from 'vue'
import TestLifeCycle from './TestLifeCycle.vue'

const isVisible = ref(true)
</script>
