<!-- 子组件 Tag.vue -->
<template>
  <span :class="tagClasses">
    <slot />
    <button v-if="closable" class="tag-close" @click="$emit('close')">×</button>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'default' },
  size: { type: String, default: 'medium' },
  closable: { type: Boolean, default: false },
  round: { type: Boolean, default: false },
  plain: { type: Boolean, default: false },
})

defineEmits(['close'])

const tagClasses = computed(() => [
  'tag',
  `tag-${props.type}`,
  `tag-${props.size}`,
  {
    'tag-round': props.round,
    'tag-plain': props.plain,
    'tag-closable': props.closable,
  },
])
</script>

<style scoped>
.tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid transparent;
  font-size: 14px;
  line-height: 1;
}

.tag-default {
  color: #333;
  background: #f3f4f6;
}

.tag-primary {
  color: #fff;
  background: #3b82f6;
}

.tag-success {
  color: #fff;
  background: #10b981;
}

.tag-medium {
  font-size: 14px;
}

.tag-large {
  padding: 10px 16px;
  font-size: 16px;
}

.tag-round {
  border-radius: 999px;
}

.tag-plain {
  background: #fff;
  border-color: currentColor;
}

.tag-close {
  position: absolute;
  right: 0.5rem;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: inherit;
}
</style>
