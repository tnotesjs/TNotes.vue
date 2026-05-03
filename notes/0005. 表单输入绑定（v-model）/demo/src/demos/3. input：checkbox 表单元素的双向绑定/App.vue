<template>
  <input type="checkbox" v-model="checked" />
  <button @click="checked = !checked">切换选中</button>
  <p>checked: {{ checked }}</p>
  <!--
  <input type="checkbox" v-model="checked" />
  通过 v-model 实现 checkbox 的双向绑定
  checked 为 true 意味着选中
  checked 为 false 意味着未选中
   -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
const checked = ref(true)
</script>
