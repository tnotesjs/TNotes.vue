<template>
  <button @click.once="clickHandle">click</button>
  <!--
  学会查看事件状态
   1. 在 chrome devtools 中找到 Elements/Event Listeners。
   2. 查看 click 事件状态，会发现 once 字段值为 true。
   3. 如果将 .once 修饰符给去掉，则会变成 false。
   -->
</template>

<script setup lang="ts">
function clickHandle() {
  console.log('你触发了事件')
}
</script>
