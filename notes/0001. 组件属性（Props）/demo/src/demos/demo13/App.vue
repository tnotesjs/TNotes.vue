<!-- src/demos/demo13/App.vue -->
<script setup lang="ts">
import Comp from './Comp.vue'
import { Props } from './Comp.vue'
import { ref, isRef } from 'vue'
const p1 = ref<Props>({
  firstName: 'a',
  lastName: '1',
})
const p2: Props = {
  firstName: 'b',
  lastName: '2',
}
// @ts-ignore
window.p2 = p2

const isP1Ref = isRef(p1)
const isP2Ref = isRef(p2)
</script>

<template>
  <p>isRef(p1) -> {{ isP1Ref }}，p1 是响应式数据</p>
  <p>p1.firstName:{{ p1.firstName }}</p>
  <p><button @click="p1.firstName = p1.firstName === 'A' ? 'a' : 'A'">切换 p1.firstName 大小写</button></p>
  <Comp v-bind="p1" />

  <p>isRef(p2) -> {{ isP2Ref }}，p2 不是响应式数据</p>
  <p>p2.firstName:{{ p2.firstName }}</p>
  <p><button @click="p2.firstName = p2.firstName === 'B' ? 'b' : 'B'">切换大小写 p2.firstName</button></p>
  <Comp v-bind="p2" />
</template>
