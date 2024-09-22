<template>
  <div class="rating-container">
    <span v-for="star in 5" :key="star" class="star" @click="setStar(star)">
      {{ rating >= star ? '★' : '☆' }}
    </span>
  </div>
</template>

<script setup>
// defineModel 的一些配置
// 1. 使 v-model 必填
//    const model = defineModel({ required: true })
// 2. 提供一个默认值
//    defineModel({ default: 0 })
// 3. 指定类型
//    defineModel({ type: Number })

const rating = defineModel({
  required: true,
  type: Number,
  default: 0
})

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