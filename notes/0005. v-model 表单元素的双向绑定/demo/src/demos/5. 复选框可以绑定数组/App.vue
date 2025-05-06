<template>
  <div v-for="(item, index) in arr" :key="index">
    <label for="item.id">{{ item.title }}</label>
    <input type="checkbox" v-model="hobby" :id="item.id" :value="item" />
  </div>

  <!--
  复选框 checkbox 不仅仅可以用于绑定一个布尔值，还可以用来绑定一个数组
  v-model="hobby" 表示将选中的复选框的值绑定到 hobby 数组中
  其中 :value="item" 表示加入数组中的值是 item
  -->

  <p>hobby: <pre>{{ hobby }}</pre></p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const hobby = ref([])
const arr = ref([
  { id: 'swim', title: '游泳', more_info: '...' },
  { id: 'run', title: '跑步', more_info: '...' },
  { id: 'game', title: '游戏', more_info: '...' },
  { id: 'music', title: '音乐', more_info: '...' },
  { id: 'movie', title: '电影', more_info: '...' }
])
</script>
