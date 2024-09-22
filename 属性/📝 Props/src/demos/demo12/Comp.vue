<!-- src/demos/demo12/Comp.vue -->
<script setup lang="ts">
export interface Props {
  msg?: string
  labels?: string[]
}
// type-based-props-declaration
// defineProps<Props>()
// 当使用基于类型的声明时，我们失去了为 props 声明默认值的能力。
// 这可以通过 withDefaults 编译器宏解决。
const props = withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two']
})
// 这将被编译为等效的运行时 props default 选项。
// 此外，withDefaults 帮助程序为默认值提供类型检查，
// 并确保返回的 props 类型删除了已声明默认值的属性的可选标志。

console.log('[props.msg]', props.msg)
console.log('[props.labels]', props.labels)
console.log('------------------------------')
</script>

<template>
  <p>msg: {{ msg }}</p>
  <pre>{{ labels }}</pre>
  <hr />
</template>