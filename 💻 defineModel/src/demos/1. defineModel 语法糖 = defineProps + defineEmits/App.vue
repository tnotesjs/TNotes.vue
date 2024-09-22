<template>
  <div class="app-container">
    <h1>请对本次服务评分：</h1>
    <!-- <Rating @update:rating="(newVal) => rating = newVal" :rating /> -->
    <Rating v-model="rating" />
    <!--
    在自定义组件上使用 v-model 相当于是一个语法糖

    1. <Rating @update:rating="(newVal) => rating = newVal" :rating />
    2. <Rating v-model="rating" />

    在木板中，上述 1、2 是等效的

    子组件中要获取 rating 可以通过 defineModel() 的返回值来获取
    const rating = defineModel()

    rating.value = ...
    当给 rating.value 重新赋值时，就相当于触发了 rating.value 的 setter
    setter 会触发 @update:rating 事件，在触发 @update:rating 事件时，会把赋的新值作为参数传入。
    -->
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