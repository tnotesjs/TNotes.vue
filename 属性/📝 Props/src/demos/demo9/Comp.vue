<!-- src/demos/demo9/Comp.vue -->
<script setup lang="ts">
import type { PropType } from 'vue'
// Used to annotate a prop with more advanced types
// when using runtime props declarations.
// 当使用运行时属性声明的时候
// 用来标注一个更加复杂的属性类型
// 通常用来精细化一个约束比较宽泛的类型

export interface Book {
  title: string
  author: string
  year: number
}

defineProps({
  book: {
    // type: Book,
    // 不能直接这么写，会报错
    // 因为 Book 是一个接口，而不是一个 JS 的构造函数

    // type: {
    //   title: String,
    //   author: String,
    //   year: Number
    // },
    // 这么写也是不允许的，会报错
    // 不满足 defineProps 的语法规则

    // type: Object,
    // 虽然可以写 Object，并且不会报错
    // 但是 Object 约束不明确
    // 只要是一个对象类型就可以传

    type: Object as PropType<Book>,
    // 使用类型工具 PropType<Book>
    // 可以进一步约束属性 book 的类型为 Book

    required: true
  }
})
</script>

<template>
  <pre>{{ book }}</pre>
</template>
