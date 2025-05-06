<template>
  <p>
    带有 .a.b.c.capitalize 修饰符
    <CompA v-model:str.a.b.c.capitalize="str1" />
  </p>

  <p>
    不带任何修饰符
    <CompA v-model:str="str2" />
  </p>
</template>

<script setup>
import { ref } from 'vue'
import CompA from './CompA.vue'
const str1 = ref('')
const str2 = ref('')
</script>