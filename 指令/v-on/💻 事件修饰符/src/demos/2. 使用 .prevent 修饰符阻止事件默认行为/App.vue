<template>
  <p>
    <!-- 做法 1：通过 .prevent 修饰符来阻止默认行为 -->
    <a @click.prevent="clickHandle1" :href="URL">yuque</a>
  </p>
  <p>
    <a @click="clickHandle2" :href="URL">yuque</a>
  </p>
</template>

<script setup lang="ts">
const URL = 'https://www.yuque.com/huyouda'
function clickHandle1(e: Event) {
  console.log('你触发了事件')
}
function clickHandle2(e: Event) {
  // 做法 2：通过 e.preventDefault() 来阻止默认行为
  e.preventDefault()
  console.log('你触发了事件')
}

// 上述两种写法都可以达到阻止超链接跳转的效果
</script>
