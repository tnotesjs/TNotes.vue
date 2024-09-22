<script setup lang="ts">
import { reactive, ref, isRef } from 'vue'
const state = reactive({
  count: 0,
  otherProperty: 'some value'
})

const countRef = ref(state.count)

console.log(typeof countRef) // object
console.log(isRef(countRef)) // true
</script>

<template>
  <h1>ref(state.count) - countRef 和 state.count 不会保持同步</h1>
  <h2>countRef: {{ countRef }}</h2>
  <h2>state.count: {{ state.count }}</h2>
  <p>
    <button @click="countRef++">countRef + 1</button>
  </p>
  <p>
    <button @click="state.count++">state.count + 1</button>
  </p>
</template>