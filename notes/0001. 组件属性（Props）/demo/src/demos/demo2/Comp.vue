<!-- src/demos/demo2/Comp.vue -->
<script setup lang="ts">
defineProps<{ msg?: string }>()
// 约束
// msg 是 string 类型

// demo1 中的写法，相当于定义了一个必填的 msg 属性，并且要求类型为 string。
// 如果想要表达这是一个可选属性，和 TS 中的做法是一样的，只需要加一个问号即可。
</script>

<template>
  <h1>值：{{ msg }}</h1>
  <h1>类型：{{ typeof msg }}</h1>
</template>