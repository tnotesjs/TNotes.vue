<!-- src/demos/demo17/Comp.vue -->
<script lang="ts">
// 如果不使用 script setup 的方式来声明 props
export default {
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    console.log(props.msg)
  }
}
</script>

<template>
  <h1>msg: {{ msg }}</h1>
</template>