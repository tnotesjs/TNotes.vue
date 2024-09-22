<script setup lang="ts">
import { reactive, toRef, isRef } from 'vue'
const state = reactive({
  count: 0,
  otherProperty: 'some value'
})

const countRef = toRef(() => {
  console.count('访问了 countRef.value')
  return state.count
})
// 如果这么写，那么创建的 countRef 是只读的。
// 当访问 countRef.value 时，会触发我们传入的回调。

// countRef.value
// countRef.value
// countRef.value
// countRef.value
// countRef.value

// @ts-ignore
window.countRef = countRef
</script>

<template>
  <pre style="font-size: 2rem;">// 创建一个只读的 ref，当访问 .value 时会调用此 getter 函数
const countRef = toRef(() => state.count)</pre>
</template>