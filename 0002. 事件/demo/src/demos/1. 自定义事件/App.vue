<template>
  <div class="app-container">
    <h1>请对本次服务评分：</h1>
    <Rating @update-rating="handleRating" :rating />
    <p v-if="rating > 0">你当前的评价为 {{ rating }} 颗星</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Rating from './Rating.vue'
const rating = ref(0)

function handleRating(newRating) {
  // 更新父组件的数据就可以了
  rating.value = newRating
}
</script>

<style scoped>
.app-container {
  max-width: 600px;
  margin: auto;
  text-align: center;
  font-family: Arial, sans-serif;
}

p {
  font-size: 18px;
  color: #333;
}
</style>