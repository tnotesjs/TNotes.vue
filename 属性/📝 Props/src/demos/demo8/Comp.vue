<!-- src/demos/demo8/Comp.vue -->
<script setup lang="ts">
const props = defineProps<{ msg: string }>()
console.log('props.msg:', props.msg)
// debugger
// 定义一个变量 props 接收 defineProps 的返回值
// props 变量中存放的就是父组件使用时传入的 msg
// props 是一个 Proxy 类型
// 访问这个 Proxy 的 msg 字段，可以获取到父组件传递过来的属性值
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>