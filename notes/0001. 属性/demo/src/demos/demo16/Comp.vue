<!-- src/demos/demo16/Comp.vue -->
<script setup lang="ts">
// type-based declaration
// interface Props {
//   a: number | string, // a 可以是 number 或者 string
//   b: boolean | number // b 可以是 boolean 或者 number
// }
// defineProps<Props>()

// runtime declaration
defineProps({
  a: {
    type: [Number, String],
    required: true
  },
  b: {
    type: [Boolean, Number],
    required: true
  }
})

// 上述两种写法是等效的。
</script>

<template>
  <div>a 值：{{ a }}，类型：{{ typeof a }}</div>
  <div>b 值：{{ b }}，类型：{{ typeof b }}</div>
</template>