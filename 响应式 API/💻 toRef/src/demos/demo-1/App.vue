<script setup lang="ts">
import { reactive, toRef, isRef } from 'vue'
const state = reactive({
  count: 0,
  otherProperty: 'some value'
})
// 在某些情况下，我们可能需要单独引用对象的某个属性，而不需要整个对象。
// 例如，我们有一个大型的状态对象，但我们只关心其中的一个属性 count。

const countRef = toRef(state, 'count')
// toRef API 用于将对象的某个属性转换为一个响应式的引用（ref）。
// toRef(state, 'count')
// 在这条语句中，state 是一个响应式对象。
// 这种写法是基于响应式对象 state 上的 count 属性创建一个对应的 ref 对象。
// 对比下面的写法：
// const countRef = ref(state.count)
// 如果这么写，那么 state.count 和 countRef 将不会保持同步，因为这个 ref() 接收到的是一个纯数值。

console.log(typeof countRef) // object
console.log(isRef(countRef)) // true
console.log(countRef.value) // 0
</script>

<template>
  <h1>toRef - 从某个大型对象身上提取指定的属性，将其转为 ref 响应式对象。</h1>

  <!-- countRef 和 state.count 是保持同步的 -->
  <h2>countRef: {{ countRef }}</h2>
  <h2>state.count: {{ state.count }}</h2>
  <p>
    <button @click="countRef++">countRef + 1</button>
  </p>
  <p>
    <button @click="state.count++">state.count + 1</button>
  </p>
</template>