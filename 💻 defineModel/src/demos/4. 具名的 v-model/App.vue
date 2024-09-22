<template>
  <div class="app-container">
    <h1>请对本次服务评分：</h1>
    <!--
      匿名的 v-model
      在子组件 Rating 中，通过 defineModel() 来获取这个值

      匿名的 model 配置语法
      defineModel({ require: true, default: ... })
    -->
    <!-- <Rating v-model="rating" /> -->

    <!--
      具名的 v-model
      在子组件 Rating 中，通过 defineModel('rating') 来获取这个值
      通过这种写法，可以绑定多个 model

      具名的 model 配置语法
      defineModel('rating', { require: true, default: ... })
    -->
    <Rating v-model:rating="rating" />
    <p v-if="rating > 0">你当前的评价为 {{ rating }} 颗星</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Rating from './Rating.vue'
const rating = ref(0)
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