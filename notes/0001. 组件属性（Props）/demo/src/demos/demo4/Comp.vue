<!-- src/demos/demo4/Comp.vue -->
<script setup lang="ts">
interface Props {
  msg: string
}
defineProps<Props>()
// 约束
// msg 是 string 类型
// msg 是必填的

// 接口声明类似于类型别名，但更适用于面向对象编程风格。
// 适合复杂类型的定义和继承，支持接口继承和扩展，结构更清晰。
// 如果想要使用 TS 中接口的一些特性，比较适合使用这种声明方式。
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>