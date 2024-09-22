<!-- src/demos/demo7/Comp.vue -->
<script setup lang="ts">
defineProps(['a', 'b', 'c'])
// 无约束
// 这些属性可有可无，可以是任意类型。

// 上述写法相当于：
// 声明了 3 个属性分别是 a、b、c
// 它们都是 any 类型
// 如果没有传递值的话，那么它们将是 undefined

// 数组简写形式是最简单的 props 声明方式。
// 适用于不需要类型检查的小型项目或快速开发。
// 这种声明方式缺乏类型信息。
// a、b、c 可以是任意类型
// 传啥类型都 ok
// a、b、c 是可选的属性
// 若在使用该组件时没有传递 msg 属性，是不会报错的。
</script>

<template>
  <p>a - 值：{{ a }}，类型：{{ typeof a }}</p>
  <p>b - 值：{{ b }}，类型：{{ typeof b }}</p>
  <p>c - 值：{{ c }}，类型：{{ typeof c }}</p>
  <hr>
</template>
