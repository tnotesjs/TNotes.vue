<!-- src/demos/demo15/Comp.vue -->
<script setup lang="ts">
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  firstName: {
    type: String,
    required: true,
    validator: (value: string) => value.length > 0,
    // 使用 validator 字段可以帮助你在【开发阶段】捕获潜在的问题，
    // 确保组件接收到的 props 数据是符合预期的。
  },
  lastName: {
    type: String,
    required: true,
    validator: (value: string) => value.length > 0,
  },
  age: {
    type: Number,
    required: false,
    validator: (value: number) => Number.isInteger(value) && value > 0,
  },
})

// 将 props 拷贝一份出来，以防破坏单向数据流。
// 将 props 转为响应式数据
const state = reactive({
  firstName: props.firstName,
  lastName: props.lastName,
  age: props.age,
})

// @ts-ignore
window.state = state

watch(
  () => props,
  (newProps) => {
    console.log(newProps)
    state.firstName = newProps.firstName
    state.lastName = newProps.lastName
    state.age = newProps.age
  },
  { immediate: true, deep: true }
)

const fullName = computed(() => `${state.firstName}${state.lastName}`)
</script>

<template>
  <p>First Name: {{ state.firstName }}</p>
  <p>Last Name: {{ state.lastName }}</p>
  <p>Age: {{ state.age }}</p>
  <p>Full Name: {{ fullName }}</p>
</template>