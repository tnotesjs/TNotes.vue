<template>
  <!--
  @keyup.ctrl.alt="submitText"
  当按下 alt + ctrl + 回车键时，将会调用 submitText 函数

  提示：
  1. 在测试该 demo 时发现，回车键都是必须要按的，无论你是否写了 .enter 按键修饰符
  2. 在 macos 上，alt 指的是 opt 键
  3. ctrl、alt 等按键修饰符的顺序对最终的行为没有影响
     无论是先按下 ctrl 再按下 alt、回车
     还是先按下 alt 再按下 ctrl、回车
     都可以正常触发 sumbitText 函数
  -->
  <input type="text" @keyup.ctrl.alt="submitText" />
</template>

<script setup lang="ts">
function submitText(e: Event) {
  console.log('call submitText')
  console.log('输入框中的内容：', (e.target as HTMLInputElement).value)
}
</script>
