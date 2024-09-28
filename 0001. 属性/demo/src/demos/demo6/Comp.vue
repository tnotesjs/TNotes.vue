<!-- src/demos/demo6/Comp.vue -->
<script setup lang="ts">
defineProps({
  msg: String,
})
// 等效
// defineProps({
//   msg: {
//     type: String
//   },
// })

// 约束
// msg 是 string 类型

// 这是对象简写形式是对象式声明的简化版。
// 适用于简单类型的快速声明。
// 相较于 demo5，这种写法更加简洁明了，代码量更少。

// 注意
// key 键是 prop 的名称；
// val 值是该 prop 预期类型的构造函数，不要误将 String 写为 string。
</script>

<template>
  <h1>值：{{ msg }}</h1>
  <h1>类型：{{ typeof msg }}</h1>
</template>
