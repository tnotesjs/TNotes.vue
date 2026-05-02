<template>
  元素坐标：{{ x }}, {{ y }}
  <div :style="boxStyles" @mousedown="startDrag">拖拽我</div>
</template>

<script setup>
import { ref, computed } from 'vue'

const x = ref(100)
const y = ref(100)
const isDragging = ref(false)

const boxStyles = computed(() => ({
  position: 'absolute',
  left: `${x.value}px`,
  top: `${y.value}px`,
  width: '150px',
  height: '100px',
  backgroundColor: isDragging.value ? '#e0f0ff' : '#f0f0f0',
  border: '2px solid #999',
  cursor: isDragging.value ? 'grabbing' : 'grab',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  transition: isDragging.value ? 'none' : 'background-color 0.2s',
}))

function startDrag(e) {
  isDragging.value = true
  const startX = e.clientX - x.value
  const startY = e.clientY - y.value

  function onMouseMove(e) {
    x.value = e.clientX - startX
    y.value = e.clientY - startY
  }

  function onMouseUp() {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>
