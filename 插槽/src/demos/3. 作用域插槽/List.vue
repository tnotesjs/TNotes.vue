<template>
  <div class="list-container">
    <ul>
      <li v-for="item in items" :key="item.id">
        <!-- li 里面渲染什么内容我不知道，通过父组件在使用的时候来指定 -->
        <!-- 下面的插槽中，:item=item 就是将子组件的数据传递给父组件的插槽内容 -->
        <slot name="item" :item="item">{{ item.defaultText }}</slot>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 子组件的数据，这个数据可能是通过请求得到的
const items = ref([
  { id: 1, name: 'Vue.js', defaultText: 'Vue.js 是一个渐进式 JavaScript 框架。' },
  { id: 2, name: 'React', defaultText: 'React 是一个用于构建用户界面的 JavaScript 库。' },
  { id: 3, name: 'Angular', defaultText: 'Angular 是一个开源的 Web 应用框架。' }
])
</script>

<style>
.list-container {
  max-width: 300px;
  background: #f9f9f9;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
  background: #fff;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>