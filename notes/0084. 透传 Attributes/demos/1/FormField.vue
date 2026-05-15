<template>
  <div style="padding: 8px; border: 1px solid #ccc">
    <label
      ><strong>{{ label }}：</strong></label
    >
    <!-- v-bind="$attrs" 手动把透传属性绑定到真正需要的元素上 -->
    <input v-bind="$attrs" />
    <details style="margin-top: 4px">
      <summary>$attrs 内容（展开查看）</summary>
      <pre style="font-size: 12px; color: #888">{{ formattedAttrs }}</pre>
    </details>
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

// 1. 声明为 prop → 被消费，不会出现在 $attrs 中
defineProps({
  label: String,
})

// 2. 关闭自动继承，由我们手动决定 $attrs 绑到哪里
defineOptions({
  inheritAttrs: false,
})

// 3. 在脚本中访问透传属性
const attrs = useAttrs()

const formattedAttrs = computed(() => {
  return Object.entries(attrs)
    .map(([key, value]) => {
      if (typeof value === 'function') return `${key}: [Function]`
      return `${key}: ${JSON.stringify(value)}`
    })
    .join('\n')
})
</script>
