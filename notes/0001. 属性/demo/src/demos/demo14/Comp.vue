<!-- src/demos/demo14/Comp.vue -->
<script setup lang="ts">
import { computed, defineProps, toRefs, watch } from 'vue'

// 定义 Props 类型
export interface Props {
  firstName: string
  lastName: string
  age?: number
}

// 定义 Props
const props = defineProps<Props>()

// 使用 toRefs 保持响应性
const { firstName, lastName, age } = toRefs(props)

// @ts-ignore
window.firstName = firstName
// @ts-ignore
window.lastName = lastName
// @ts-ignore
window.age = age

// 自定义验证函数
function validateProps() {
  if (!firstName.value || firstName.value.length === 0) {
    throw new Error('First name is required and should not be empty')
    // setTimeout(() => {
    //   throw new Error('First name is required and should not be empty')
    // }, 1000);
  }
  if (!lastName.value || lastName.value.length === 0) {
    throw new Error('Last name is required and should not be empty')
    // setTimeout(() => {
    //   throw new Error('Last name is required and should not be empty')
    // }, 1000);
  }
  if (
    age.value !== undefined &&
    (!Number.isInteger(age.value) || age.value <= 0)
  ) {
    throw new Error('Age should be a positive integer if provided')
    // setTimeout(() => {
    //   throw new Error('Age should be a positive integer if provided')
    // }, 1000)
  }
}

// 调用验证函数
validateProps()

watch(
  () => [props.firstName, props.lastName, props.age],
  () => {
    // 当 Props 更新时重新验证
    validateProps()
  },
  { immediate: true }
)

// 计算 fullName
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
</script>

<template>
  <p>First Name: {{ firstName }}</p>
  <p>Last Name: {{ lastName }}</p>
  <p>Age: {{ age }}</p>
  <p>Full Name: {{ fullName }}</p>
</template>
