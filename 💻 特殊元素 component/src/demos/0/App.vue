<template>
  <div id="app">
    <p>
      currentLabel: {{ currentLabel }}
    </p>
    <nav>
      <button @click="toggleComponent">切换组件</button>
    </nav>
    <component :is="currentComponent"/>
  </div>
</template>

<script setup>
import { shallowRef } from 'vue'
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

// 该状态主要用于记录当前渲染的组件
const currentComponent = shallowRef(ComponentA)
// 该状态主要用于记录当前渲染的组件的一个标识
const currentLabel = shallowRef('A')

const toggleComponent = () => {
  if (currentLabel.value === 'A') {
    currentComponent.value = ComponentB
    currentLabel.value = 'B'
  } else {
    currentComponent.value = ComponentA
    currentLabel.value = 'A'
  }
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}
nav {
  margin-bottom: 20px;
}
button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 10px;
}
button:hover {
  background-color: #36a373;
}
</style>
