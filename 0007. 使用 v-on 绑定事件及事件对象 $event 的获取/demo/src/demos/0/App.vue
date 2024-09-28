<template>
  <div>{{ count }}</div>
  <!--
  【写法 1】
    通过这种写法绑定的 add 事件
    vue 会自动将事件对象作为 add 的第一个参数传入
  -->
  <p>
    <button @click="add">Increase</button>
  </p>

  <!--
  【写法 2】
    下面这种写法跟上述写法是等价的

  【注意】
    这里的 $event 必须显示地写出来
    如果简写为 e 或者其它值将会报错
    因为这种写法是我们显示地传值
    并非让 vue 来自动注入事件对象
    使用显示地传值的优式在于可以更灵活地传入其它更多的参数
    并且传入的参数的位置也可以随意调整
    事件对象可以不用是第一个参数
    比如 add('Hello World', 1, 2, $event, { a: 1, b: 2 })
  -->
  <p>
    <button @click="add($event)">Increase</button>
  </p>

  <!--
  【写法 3】
    下面是使用箭头函数的写法
    最终效果跟上述写法也都是等效的
    这里的做法其实跟 【写法 1】 是一样的
    都是让 vue 来自动将事件对象作为函数的第一个参数传入
    所以我们只需要定义一个形参来接收它即可
    因此我们的形参名是可以自定义的
    比如这里直接使用 e 是 ok 的
    并不会报错
    采用这种写法也可以非常灵活地去传入其它参数
  -->
  <p>
    <button @click="(e: Event) => add(e)">Increase</button>
  </p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
function add(e: Event) {
  count.value++
  console.log('【事件目标元素】', e.target)
  console.log('【事件类型】', e.type)
}
</script>
