<!-- 父组件 App.vue -->
<template>
  <div class="demo">
    <Tag
      v-if="visible"
      :type="type"
      :size="size"
      :round="round"
      :plain="plain"
      :closable="closable"
      @close="visible = false"
    >
      Vue Tag
    </Tag>

    <div class="controls">
      <label>
        类型：
        <select v-model="type">
          <option value="default">default</option>
          <option value="primary">primary</option>
          <option value="success">success</option>
        </select>
      </label>

      <label>
        尺寸：
        <select v-model="size">
          <option value="medium">medium</option>
          <option value="large">large</option>
        </select>
      </label>

      <label><input v-model="round" type="checkbox" /> round</label>
      <label><input v-model="plain" type="checkbox" /> plain</label>
      <label><input v-model="closable" type="checkbox" /> closable</label>

      <button @click="visible = true">重置标签</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Tag from './Tag.vue'

const type = ref('primary')
const size = ref('medium')
const round = ref(true)
const plain = ref(false)
const closable = ref(true)
const visible = ref(true)
</script>

<style scoped>
.demo {
  display: grid;
  gap: 16px;
  padding: 24px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

label {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

button {
  cursor: pointer;
}
</style>
