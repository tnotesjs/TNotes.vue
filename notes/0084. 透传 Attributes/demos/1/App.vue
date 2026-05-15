<template>
  <h3>透传 Attributes 演示1：基本透传</h3>
  <section>
    <p>
      label 是 prop → 被消费，不出现在 $attrs 中。<br />
      placeholder、maxlength、data-id 未声明 → 透传到内部 input。
    </p>
    <FormField
      label="用户名"
      placeholder="请输入用户名"
      maxlength="10"
      data-id="username-input"
    />
  </section>

  <h3>透传 Attributes 演示2：class / style 合并</h3>
  <section>
    <p>
      父组件传 style="color: blue"，组件自身 style="padding:8px; border:1px
      solid #ccc"。<br />
      两者合并，而非覆盖。
    </p>
    <FormField label="邮箱" style="color: blue" placeholder="请输入邮箱" />
  </section>
</template>

<script setup>
import FormField from './FormField.vue'
</script>
