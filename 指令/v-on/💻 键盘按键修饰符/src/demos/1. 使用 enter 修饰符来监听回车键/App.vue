<template>
  <!-- 当按下回车键时，将会调用 submitText 函数 -->
  <input type="text" @keyup.enter="submitText" />
</template>

<script setup lang="ts">
function submitText(e: Event) {
  console.log('call submitText')
  console.log('输入框中的内容：', (e.target as HTMLInputElement).value)
}
</script>
