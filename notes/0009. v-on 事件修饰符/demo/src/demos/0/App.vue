<template>
  <p>
    <!--
    事件修饰符是可以连用的
    比如这里的 @click.prevent.once="clickHandle1"
    意味着 clickHandle1 只会触发一次
    并且会阻止了默认行为（跳转）

    注意：
    1. 如果再次点击超链接，将会正常跳转
    2. 事件修饰符的先后次序对最终的行为没有影响，哪个写在前面哪个写在后面都是一样的
    -->
    <a @click.prevent.once="clickHandle1" :href="URL">yuque</a>
  </p>
  <p>
    <!--
    无论点击多少次这个超链接，都不会跳转
    -->
    <a @click.prevent="clickHandle2" :href="URL">yuque</a>
  </p>
</template>

<script setup lang="ts">
const URL = 'https://www.yuque.com/huyouda'
function clickHandle1() {
  console.count('call clickHandle1')
}
function clickHandle2() {
  console.count('call clickHandle2')
}
</script>
