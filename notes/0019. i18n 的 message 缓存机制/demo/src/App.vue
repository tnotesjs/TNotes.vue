<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale, messages, setLocaleMessage } = useI18n()
console.log('init', messages.value) // 只有 zn-CN

const switchToZh = () => (locale.value = 'zh-CN')
const switchToEn = () => {
  setLocaleMessage('en', { // 动态地插入 en
    message: {
      greeting: 'Hello world!',
    },
  })

  console.log('switchToEn', messages.value) // 含有 zh-CN 和 en
  locale.value = 'en'
}
</script>

<template>
  <div>
    <p>{{ $t('message.greeting') }}</p>
    <button @click="switchToEn">Switch to English</button>
    <button @click="switchToZh">切换到中文</button>
  </div>
</template>
