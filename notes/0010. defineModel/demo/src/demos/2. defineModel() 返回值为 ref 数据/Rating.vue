<template>
  <div class="rating-container">
    <span v-for="star in 5" :key="star" class="star" @click="setStar(star)">
      {{ rating >= star ? '★' : '☆' }}
    </span>
    <input type="number" v-model="rating" />
    <!--
      defineModel 返回的是一个 ref 值
      这个值可以再次和子组件的表单元素进行双向绑定
    -->
  </div>
</template>

<script setup>
import { isRef } from 'vue';
const rating = defineModel()

console.log('isRef(rating) =>', isRef(rating))
// isRef(rating) => true

function setStar(newStar) {
  rating.value = newStar
}
</script>

<style scoped>
.rating-container {
  display: flex;
  font-size: 24px;
  cursor: pointer;
}

.star {
  margin-right: 5px;
  color: gold;
}

.star:hover {
  color: orange;
}
</style>