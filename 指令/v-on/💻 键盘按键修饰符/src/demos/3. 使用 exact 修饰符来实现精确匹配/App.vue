<template>
  <!--
  【写法 1】
  只要按下回车键，就会调用 submitText 函数
  下面这些情况都会触发
  1. 同时按下 alt + 回车
  2. 同时按下 ctrl + 回车
  3. 同时按下 shift + 回车
  4. ...（只要组合键中有回车键就意味着匹配，就会触发 submitText 函数）
  -->
  <p>
    <input type="text" @keyup.enter="submitText" />
  </p>
  <!--
  【写法 2】
  按键修饰符 .exact 表示的是精确匹配，必须精确按下回车键才会触发。
  下面这些情况都不会触发
  1. 同时按下 alt + 回车
  2. 同时按下 ctrl + 回车
  3. 同时按下 shift + 回车
  -->
  <p>
    <input type="text" @keyup.enter.exact="submitText" />
  </p>
</template>

<script setup lang="ts">
function submitText(e: Event) {
  console.log('call submitText')
  console.log('输入框中的内容：', (e.target as HTMLInputElement).value)
}
</script>
