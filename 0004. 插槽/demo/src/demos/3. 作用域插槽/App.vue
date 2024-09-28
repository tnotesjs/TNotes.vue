<template>
  <div class="app-container">
    <List>
      <template #item="{ item }">
        <!-- 在父组件中来决定子组件的插槽内容 -->
        <h3>{{ item.name }}</h3>
        <p>{{ item.defaultText }}</p>
      </template>
    </List>
    <List>
      <template #item></template>
    </List>
  </div>
</template>

<script setup>
import List from './List.vue'
</script>

<style>
.app-container {
  padding: 20px;
}
</style>