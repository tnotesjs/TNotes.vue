<template>
  <input type="checkbox" v-model="checked1" />
  <button @click="checked1 = !checked1">切换选中</button>
  <p>checked1: {{ checked1 }}</p>
  <!--
  <input type="checkbox" v-model="checked1" />
  通过 v-model 实现 checkbox 的双向绑定

  默认情况下
  checked1 为 true 意味着选中
  checked1 为 false 意味着未选中

  可以通过 true-value 和 false-value 修改默认值
   -->
  <input
    type="checkbox"
    v-model="checked2"
    :true-value="customTrue"
    :false-value="customFalse"
  />
  <button @click="toggle">切换选中</button>
  <p>checked2: {{ checked2 }}</p>
</template>

<script setup lang="ts">
import { ref, unref } from 'vue'
const checked1 = ref(true)

const checked2 = ref('yes')
// 现在相当于是自定义什么值是选中，什么值是未选中
// 之前是默认true是选中，false是未选中
// 现在是yes是选中，no是未选中
const customTrue = ref('yes')
const customFalse = ref('no')
function toggle() {
  checked2.value = checked2.value === unref(customTrue) ? unref(customFalse) : unref(customTrue)
}
</script>
