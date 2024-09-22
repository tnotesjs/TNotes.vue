<!-- src/demos/demo13/Comp.vue -->
<script setup lang="ts">
import { toRefs, computed } from 'vue'

export interface Props {
  firstName: string
  lastName: string
}
const props = defineProps<Props>()

// 如果 props 是响应式数据，那么使用 toRefs 解构可以保持响应式
// 如果 props 本身就不是一个响应式数据，那么跟直接解构无异
const { firstName: f1, lastName: l1 } = toRefs(props)
const full1 = computed(() => `${f1.value}${l1.value}`)

// 直接解构，会失去响应式
const { firstName: f2, lastName: l2 } = props
const full2 = computed(() => `${f2}${l2}`)
</script>

<template>
  <h3>保持响应式</h3>
  <p>firstName: {{ f1 }}, lastName: {{ l1 }}, fullName: {{ full1 }}</p>
  <h3>保持响应式</h3>
  <p>firstName: {{ props.firstName }}, lastName: {{ props.lastName }}, fullName: {{ props.firstName + props.lastName }}</p>
  <h3>不保持响应式</h3>
  <p>firstName: {{ f2 }}, lastName: {{ l2 }}, fullName: {{ full2 }}</p>
  <hr />
</template>
