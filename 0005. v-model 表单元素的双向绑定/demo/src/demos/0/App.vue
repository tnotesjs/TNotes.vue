<template>
  <h1>v-model="msg"</h1>
  <input type="text" v-model="msg" />
  <p>你输入的是：{{ msg }}</p>
  <p>类型为：{{ typeof msg }}</p>
  <p>长度为：{{ msg.length }}</p>

  <!--
  lazy 修饰符
  默认情况下，v-model 会在每次 input 事件触发时就更新数据。
  lazy 修饰符可以改为 change 事件触发后才更新数据。（比如输入框失去焦点或者按下回车）
  -->
  <h1>v-model.lazy="msg1"</h1>
  <input type="text" v-model.lazy="msg1" />
  <p>你输入的是：{{ msg1 }}</p>
  <p>类型为：{{ typeof msg1 }}</p>
  <p>长度为：{{ msg1.length }}</p>

  <!--
  number 修饰符：将用户输入的内容从字符串转为 number 类型
  示例：
  1. 输入 abc 得到的类型将会是字符串
  2. 输入 123 得到的类型将会是 number
  3. 输入 123abc 得到的类型将会是 number 最终显示为 123
  4. 输入 123.12a3bc 得到的类型将会是 number 最终显示为 123.12
  从最终表现的效果来看，类似于将传入的值交给 parseInt()、parseFloat() 处理
  vue 会尽可能去帮我们将输入的值转换为 number 类型
   -->
  <h1>v-model.number="msg2"</h1>
  <input type="text" v-model.number="msg2" />
  <p>你输入的是：{{ msg2 }}</p>
  <p>类型为：{{ typeof msg2 }}</p>
  <p>长度为：{{ msg2.length }}</p>

  <!--
  trim 修饰符：去除输入的内容的首尾空格

  注意：
  1. 中间的空格不会被去除
  -->
  <h1>v-model.trim="msg3"</h1>
  <input type="text" v-model.trim="msg3" />
  <p>你输入的是：{{ msg3 }}</p>
  <p>类型为：{{ typeof msg3 }}</p>
  <p>长度为：{{ msg3.length }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const msg = ref('')
const msg1 = ref('')
const msg2 = ref('')
const msg3 = ref('')
</script>
