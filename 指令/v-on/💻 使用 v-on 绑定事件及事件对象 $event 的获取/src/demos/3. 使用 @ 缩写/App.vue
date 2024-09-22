<template>
  <div>{{ count }}</div>
  <!--
  可以直接使用符号 @ 来绑定事件
    绑定事件是一个很常见的需求，因此 Vue 也提供了 v-on 的简写形式，通过 @ 符号就可以绑定事件。
    在开发项目时 @ 的使用更为常见，v-on 的使用相对较少。
  -->
  <button @click="count++">Increase</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>
