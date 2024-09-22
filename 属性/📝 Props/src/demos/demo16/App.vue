<!-- src/demos/demo16/App.vue -->
<script setup lang="ts">
import Comp from './Comp.vue'
</script>

<template>
  <Comp a="1" :b="true" />
  <Comp :a="1" :b="2" />
</template>
