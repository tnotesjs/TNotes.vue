<template>
  <p>打开控制台查看打印结果</p>
  <p ref="countDOM">count: {{ count }}</p>
  <button @click="count++">+ 1</button>
</template>

<script setup>
import {
  ref,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
} from 'vue'

const count = ref(0)
const countDOM = ref(null)

const getCountDOMText = () => countDOM.value?.textContent?.trim() ?? 'null'

const logHook = (hookName, description) => {
  console.log(
    `[${hookName.padEnd(15, ' ')}] | countDOMText: ${getCountDOMText().padEnd(10, ' ')} | count: ${String(count.value).padStart(2, ' ')} | ${description}`,
  )
}

// setup 会早于 beforeCreate 执行
logHook('setup', '组件实例正在创建')

onBeforeMount(() => {
  logHook('onBeforeMount', '即将挂载')
})

onMounted(() => {
  logHook('onMounted', '已挂载')
  // 初始化操作
})

onBeforeUpdate(() => {
  logHook('onBeforeUpdate', '即将更新')
})

onUpdated(() => {
  logHook('onUpdated', '已更新')
})

onBeforeUnmount(() => {
  logHook('onBeforeUnmount', '即将卸载')
  // 清理操作
})

onUnmounted(() => {
  logHook('onUnmounted', '已卸载')
})
</script>
