<template>
  <p>
    <label for="male">男</label>
    <input type="radio" id="male" v-model="gender" value="male" />
  </p>

  <p>
    <label for="female">女</label>
    <input type="radio" id="female" v-model="gender" value="female" />
  </p>

  <p>
    <label for="secret">保密</label>
    <input type="radio" id="secret" v-model="gender" value="secret" />
  </p>

  <p>
    gender: {{ gender }}
  </p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const gender = ref('secret')
setTimeout(() => {
  gender.value = 'male'
}, 3000)
</script>
