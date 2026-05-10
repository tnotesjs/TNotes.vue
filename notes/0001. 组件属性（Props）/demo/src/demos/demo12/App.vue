<!-- src/demos/demo12/App.vue -->
<script setup lang="ts">
import Comp from './Comp.vue'
import { Props } from './Comp.vue'
const p1: Props = {
  msg: 'Hello Vue 3.0!'
}
const p2: Props = {
  msg: 'Hello Vue 3.0!',
  labels: ['1', '2']
}
</script>

<template>
  <Comp />
  <Comp msg="Hello World!" />
  <Comp msg="123" :labels="['one']" />
  <Comp v-bind="p1" />
  <Comp v-bind="p2" />
</template>
