<template>
  <div class="rating-container">
    <span v-for="star in 5" :key="star" class="star" @click="setStar(star)">
      {{ rating >= star ? '★' : '☆' }}
    </span>
  </div>
</template>

<script setup>
const rating = defineModel()

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