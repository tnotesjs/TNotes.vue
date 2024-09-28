<template>
  <input type="text" v-model="str" />
</template>

<script setup>
// 子组件需要实现相关修饰符的逻辑，可以在子组件修改父组件数据时做一些额外处理。
const [str, modifiers] = defineModel('str', {
  required: true,
  type: String,
  default: 0,
  set(value) {
    // 如果父组件书写了 capitalize 修饰符
    // 那么子组件在修改状态的时候，会走 setter
    // 在 setter 中就可以对子组件所设置的值进行一个限制
    if (modifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return value
  },
})

console.log('modifiers:', modifiers)
// modifiers: {a: true, b: true, c: true, capitalize: true}
// modifiers: {}
</script>
