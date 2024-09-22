<template>
  <div class="rating-container">
    <!-- <span v-for="star in 5" :key="star" class="star" @click="$emit('update-rating', star)"> -->
    <span v-for="star in 5" :key="star" class="star" @click="setStar(star)">
      {{ rating >= star ? '★' : '☆' }}
    </span>
  </div>
</template>

<script setup>
defineProps(['rating'])
const emits = defineEmits({
  'update-rating': (value) => {
    if (value < 1 || value > 5) {
      console.warn('传递的值有问题！！！')
      return false
    }
    return true
  }
})

function setStar(newStar) {
  // 我们需要将最新的星星状态的值传递给父组件
  // 触发父组件的 update-rating 事件
  emits('update-rating', 100)
  // emits('update-rating', newStar)
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