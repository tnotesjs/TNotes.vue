<template>
  <textarea cols="30" rows="10" v-model="textContent"></textarea>
  <p>你当前输入的内容如下：</p>
  <pre>{{ textContent }}</pre>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const textContent = ref('')
</script>
