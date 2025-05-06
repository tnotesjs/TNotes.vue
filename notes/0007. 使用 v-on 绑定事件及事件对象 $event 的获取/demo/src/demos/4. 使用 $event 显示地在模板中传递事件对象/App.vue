<template>
  <div>{{ count }}</div>
  <!--
    如果要在绑定事件的时候传递参数
    只需要在调用函数的时候直接将参数传入即可
    跟函数的调用一样
    想要传什么就写什么

    如果在自定义的参数列表中想要传入事件对象
    只需要传入 $event 即可

    这里的 $event 是一个事件对象，包含了事件相关的信息，如：
      target：事件目标元素
      type：事件类型
      ...
      ...
  -->
  <button @click="add('Hello World', 1, 2, $event, { a: 1, b: 2 })">Increase</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
function add(...args: any[]) {
  count.value++
  console.log(args)

  // 获取事件对象
  const e = args[3]
  console.log('【事件目标元素】', e.target)
  console.log('【事件类型】', e.type)
}
</script>