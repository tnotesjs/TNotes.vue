<!-- src/demos/demo11/Comp.vue -->
<script setup lang="ts">
defineProps({
  msg: {
    type: String,
    default: 'hello',
    // 一旦设置了 default 值
    // 就意味着 msg 是可选的
    // 如果 msg 没有被传递
    // 那么 msg 将为 default 设置的值

    required: true,
    // 即便再去设置 required 为 true 也是无效的
    // 可以认为一个属性如果有默认值，那么它一定是可选的
  },
})
</script>

<template>
  <p>msg: {{ msg }}</p>
</template>