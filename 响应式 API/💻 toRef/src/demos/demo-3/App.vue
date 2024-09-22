<script setup lang="ts">
import { reactive, toRef, isRef } from 'vue'
const state = reactive({
  count: 0,
  otherProperty: 'some value'
})

const countRef = toRef(() => state.count)
// 如果这么写，那么创建的 countRef 是只读的。

console.log(typeof countRef) // object
console.log(isRef(countRef)) // true
console.log(countRef.value) // 0
</script>

<template>
  <h1>toRef(() => state.count) - 返回结果是只读的</h1>

  <!-- countRef 和 state.count 是保持同步的 -->
  <h2>countRef: {{ countRef }}</h2>
  <h2>state.count: {{ state.count }}</h2>
  <p>
    <button @click="countRef++">countRef + 1</button>
    <!-- 如果修改 countRef 的值，会导致报错。 -->
  </p>
  <p>
    <button @click="state.count++">state.count + 1</button>
    <!-- 更新 state.count 的值，countRef 也会更新。 -->
  </p>
</template>