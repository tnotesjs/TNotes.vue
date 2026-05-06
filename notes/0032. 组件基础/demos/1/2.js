// demos/1/1.js
const { createApp, ref } = Vue

// ---- 用 JS 对象定义组件 ----
const CounterButton = {
  setup() {
    const count = ref(0)
    return { count }
  },
  // 2. 不写字符串，而是写一个 CSS 选择器
  // 指向第 1 步在 HTML 里用原生 <template> 元素写的模板：
  // <template id="counter-tpl">
  //   <button @click="count++" style="margin: 8px; padding: 8px 16px">
  //     点击了 {{ count }} 次
  //   </button>
  // </template>
  template: '#counter-tpl',
}

// ---- 创建应用并注册组件 ----
const app = createApp({})
app.component('CounterButton', CounterButton)
app.mount('#app')
