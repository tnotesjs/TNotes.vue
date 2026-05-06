// demos/1/1.js
const { createApp, ref } = Vue

// ---- 用 JS 对象定义组件 ----
const CounterButton = {
  setup() {
    const count = ref(0)
    return { count }
  },
  template: `
        <button @click="count++" style="margin: 8px; padding: 8px 16px;">
          点击了 {{ count }} 次
        </button>
      `,
}

// ---- 创建应用并注册组件 ----
const app = createApp({})
app.component('CounterButton', CounterButton)
app.mount('#app')
