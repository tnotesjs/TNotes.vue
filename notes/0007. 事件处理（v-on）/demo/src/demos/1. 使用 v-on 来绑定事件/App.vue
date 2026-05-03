<template>
  <div>{{ count }}</div>
  <!-- 在 Vue 中可以使用内置指令 v-on 来给元素绑定事件 -->
  <button v-on:click="add">Increase</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
function add() {
  count.value++
}
</script>