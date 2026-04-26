<template>
  <h1>【做法 1】手写双向绑定</h1>
  <input
    type="text"
    :value="textContent1"
    @input="(e) => (textContent1 = e.target.value)"
  />
  <p>你当前输入的内容为：{{ textContent1 }}</p>
  <!--
  双向绑定实现原理：【用户的输入行为 -> 响应式数据变化 -> 页面视图更新】
  1. @input="(e) => (textContent1 = e.target.value)"
     值发生变化的时候，更新响应式数据 textContent1
     【用户的输入行为 导致 响应式数据变化】
  2. :value="textContent1"
     响应式数据 textContent1 绑定为输入框的 value 属性
     【响应式数据变化 导致 页面视图更新】
  -->

  <hr>

  <h1>【做法 2】使用 v-model 实现双向绑定</h1>
  <input type="text" v-model="textContent2" />
  <p>你当前输入的内容为：{{ textContent2 }}</p>
  <!--
  上述两种做法基本上是等效的，可以认为【做法 2】中使用的 vue 给我们提供的 v-model 就是【做法 1】的语法糖。
  但并不是完全等效的，这里存在一点儿细微的区别：如果打开输入法，比如输入中文
  1. 在【做法 1】中，我们只需要按下键盘输入内容，页面就会更新。
  2. 在【做法 2】中，我们需要输入完内容之后页面才会更新。

  使用 v-model 的好处在于：
  1. 简化了书写
  2. 根据所使用的元素自动的选择对应的属性以及事件组合
     input 或者 textarea，元素会绑定 input 事件，绑定的值是 value
     如果是单选框或者复选框，背后绑定的事件是 change 事件，绑定的值 checked
     select 下拉列表绑定的也是 change 事件，绑定的值是 value
  -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
const textContent1 = ref('')
const textContent2 = ref('')
</script>
