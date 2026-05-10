<!-- src/demos/demo7/App.vue -->
<script setup lang="ts">
import Comp from './Comp.vue'
</script>

<template>
  <Comp a="Hello World!" b="123" c="true" />
  <!-- 可以传递任意类型 -->
  <Comp :a="'Hello World!'" :b="123" :c="true" />
  <!-- 可以只传部分值 -->
  <Comp :a="{msg: 'Hello World!'}" :b="['1', 2, 3]" />
  <!-- 可以啥都不传 -->
  <Comp />
  <!-- 可以使用 v-bind 来简化 -->
  <Comp v-bind="{a: {msg: 'Hello World!'}, b: 123, c: false}" />
</template>
