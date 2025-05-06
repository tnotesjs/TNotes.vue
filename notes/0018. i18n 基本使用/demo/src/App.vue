<script setup lang="ts"></script>

<template>
  <h1>i18n demo</h1>
  <h1>{{ $t('message.hello') }}</h1>
  <h1>{{ $t('message.abc') }}</h1>
  <h1>{{ $t('message["hello-world"]') }}</h1>
  <h1>{{ $t('message.tdahuyou') }}</h1>
</template>