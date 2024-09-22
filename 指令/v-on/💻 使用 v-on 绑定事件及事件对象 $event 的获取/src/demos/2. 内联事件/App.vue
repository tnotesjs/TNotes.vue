<template>
  <div>{{ count }}</div>
  <!--
    如果事件处理逻辑特别简单
    可以直接使用内联事件的写法来绑定事件
  -->
  <button v-on:click="count++">Increase</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>