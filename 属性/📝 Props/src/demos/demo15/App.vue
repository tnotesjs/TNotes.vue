<!-- src/demos/demo15/App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Comp from './Comp.vue'
const prop = ref({
  firstName: '1',
  lastName: 'a',
  age: 18,
})
// @ts-ignore
window.prop = prop

// 传入无法通过校验的字段
function updatePropsError() {
  prop.value.firstName = ''
  prop.value.lastName = ''
  prop.value.age = 1.1
}
// 传入可以通过校验的字段
function updatePropsCorrect() {
  prop.value.firstName = '2'
  prop.value.lastName = 'b'
  prop.value.age = 28
}
function resetProp() {
  prop.value.firstName = '1'
  prop.value.lastName = 'a'
  prop.value.age = 18
}
</script>

<template>
  <p><button @click="resetProp">resetProp</button></p>
  <p><button @click="updatePropsError">Error Update</button></p>
  <p><button @click="updatePropsCorrect">Correct Update</button></p>
  <Comp v-bind="prop" />
</template>
