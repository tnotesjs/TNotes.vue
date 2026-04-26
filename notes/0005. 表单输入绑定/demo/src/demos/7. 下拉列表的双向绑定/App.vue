<template>
  <!--
   单选
   选中的 option 值会被赋值给 hometown1 变量中
  -->
  <select v-model="hometown1">
    <option value="" disabled>请选择</option>
    <option v-for="(item, index) in hometownList" :key="index" :value="item">
      {{ item.value }}
    </option>
  </select>

  <p>您选择的家乡为：{{ hometown1 }}</p>

  <!--
   多选
   选中的 option 值会被加入到 hometown2 数组中
  -->
  <select v-model="hometown2" multiple>
    <option value="" disabled>请选择</option>
    <option v-for="(item, index) in hometownList" :key="index" :value="item">
      {{ item.value }}
    </option>
  </select>

  <p>您选择的家乡为：<pre>{{ hometown2 }}</pre></p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const hometown1 = ref('')
const hometown2 = ref<string | any[]>('')
const hometownList = ref([
  { key: '成都', value: '成都' },
  { key: '帝都', value: '北京' },
  { key: '魔都', value: '上海' },
  { key: '妖都', value: '广州' },
  { key: '陪都', value: '重庆' }
])
</script>
