<!-- src/demos/demo5/Comp.vue -->
<script setup lang="ts">
defineProps({
  msg: {
    type: String,
    required: true,
  },
})
// 约束
// msg 是 string 类型
// msg 是必填的

// 对象式声明提供了更详细的配置选项，如类型、默认值和验证规则等配置项。
// 在需要详细配置 props 的场景下，这种写法是特别常见的。
// 相对于其它写法，对象式声明 props 支持更多选项，灵活性高。
// 对象声明也有简化版，只需要写明一个类型信息即可，详情见 demo6。
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>