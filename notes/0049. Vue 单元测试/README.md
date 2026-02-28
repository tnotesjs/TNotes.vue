# [0049. Vue 单元测试](https://github.com/tnotesjs/TNotes.vue/tree/main/notes/0049.%20Vue%20%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95)

<!-- region:toc -->

- [1. 🎯 本节内容](#1--本节内容)
- [2. 🫧 评价](#2--评价)
- [3. 🤔 Vue 项目的测试工具如何选型？Vitest 和 Jest 有什么区别？](#3--vue-项目的测试工具如何选型vitest-和-jest-有什么区别)
- [4. 🤔 如何测试 Vue 组件的渲染和交互？](#4--如何测试-vue-组件的渲染和交互)
- [5. 🤔 如何测试 Vue 的组合式函数（Composables）？](#5--如何测试-vue-的组合式函数composables)

<!-- endregion:toc -->

## 1. 🎯 本节内容

- 测试工具选型（Vitest、Jest）
- 测试组件的渲染与交互
- 测试组合式函数

## 2. 🫧 评价

- todo

## 3. 🤔 Vue 项目的测试工具如何选型？Vitest 和 Jest 有什么区别？

Vue 项目的单元测试工具主要有 Vitest 和 Jest 两种选择，两者都需要配合 @vue/test-utils（Vue 官方测试工具库）来测试 Vue 组件。

Vitest 是 Vite 生态的原生测试框架，由 Vite 团队维护。Jest 是 Facebook 开发的通用 JavaScript 测试框架，生态成熟。

```bash
# Vitest 安装
npm install -D vitest @vue/test-utils happy-dom

# Jest 安装
npm install -D jest @vue/test-utils @vue/vue3-jest ts-jest babel-jest
```

Vitest 的核心优势：

- 直接复用 Vite 的配置和插件，无需额外配置转译（TypeScript、JSX、CSS Modules 等开箱即用）。
- 基于 ESM 原生实现，启动速度极快。
- API 与 Jest 基本兼容（describe、it、expect 等），迁移成本低。
- 支持多线程并行执行测试。
- 内置代码覆盖率支持。

Vitest 配置（在 vite.config.ts 中）：

```ts
// vite.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom', // 或 'jsdom'
    globals: true, // 全局注入 describe、it、expect
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
```

```ts
// tests/setup.ts
import { config } from '@vue/test-utils'

// 全局配置，如注册常用插件
config.global.plugins = []
config.global.stubs = {
  // 全局 stub 第三方组件
  RouterLink: true,
}
```

一个基本的测试示例：

```ts
// src/components/__tests__/Counter.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Counter from '../Counter.vue'

describe('Counter', () => {
  it('渲染初始计数', () => {
    const wrapper = mount(Counter)
    expect(wrapper.text()).toContain('0')
  })

  it('点击按钮后计数增加', async () => {
    const wrapper = mount(Counter)
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('1')
  })

  it('接收初始值 prop', () => {
    const wrapper = mount(Counter, {
      props: { initialCount: 10 },
    })
    expect(wrapper.text()).toContain('10')
  })
})
```

选择建议：如果项目使用 Vite 构建，强烈推荐 Vitest——零配置、速度快、生态一致。如果项目使用 webpack（Vue CLI），Jest 是更稳妥的选择。两者的测试 API 几乎一致，核心差异在于底层运行环境和配置复杂度。

## 4. 🤔 如何测试 Vue 组件的渲染和交互？

@vue/test-utils 提供了 mount 和 shallowMount 两个函数来挂载组件进行测试。mount 会完整渲染子组件，shallowMount 会将子组件替换为存根（stub），只渲染当前组件。

测试组件渲染：

```ts
import { mount } from '@vue/test-utils'
import UserProfile from '../UserProfile.vue'

describe('UserProfile', () => {
  // 测试 props 渲染
  it('显示用户名和邮箱', () => {
    const wrapper = mount(UserProfile, {
      props: {
        user: { name: '张三', email: 'zhangsan@example.com' },
      },
    })

    expect(wrapper.find('.name').text()).toBe('张三')
    expect(wrapper.find('.email').text()).toBe('zhangsan@example.com')
  })

  // 测试条件渲染
  it('未登录时显示登录按钮', () => {
    const wrapper = mount(UserProfile, {
      props: { user: null },
    })

    expect(wrapper.find('.login-btn').exists()).toBe(true)
    expect(wrapper.find('.name').exists()).toBe(false)
  })

  // 测试列表渲染
  it('渲染技能列表', () => {
    const wrapper = mount(UserProfile, {
      props: {
        user: { name: '张三', skills: ['Vue', 'React', 'TypeScript'] },
      },
    })

    const items = wrapper.findAll('.skill-item')
    expect(items).toHaveLength(3)
    expect(items[0].text()).toBe('Vue')
  })

  // 测试插槽
  it('渲染默认插槽内容', () => {
    const wrapper = mount(UserProfile, {
      props: { user: { name: '张三' } },
      slots: {
        default: '<p>自定义内容</p>',
        header: '<h1>自定义标题</h1>',
      },
    })

    expect(wrapper.html()).toContain('自定义内容')
    expect(wrapper.find('h1').text()).toBe('自定义标题')
  })
})
```

测试用户交互：

```ts
import { mount } from '@vue/test-utils'
import TodoApp from '../TodoApp.vue'

describe('TodoApp', () => {
  // 测试表单输入
  it('输入框绑定值正确', async () => {
    const wrapper = mount(TodoApp)
    const input = wrapper.find('input[type="text"]')

    await input.setValue('新任务')
    expect(wrapper.vm.newTodo).toBe('新任务')
  })

  // 测试事件触发
  it('提交表单后添加任务', async () => {
    const wrapper = mount(TodoApp)

    await wrapper.find('input').setValue('新任务')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.findAll('.todo-item')).toHaveLength(1)
    expect(wrapper.find('.todo-item').text()).toContain('新任务')
  })

  // 测试自定义事件 emit
  it('删除按钮触发 delete 事件', async () => {
    const wrapper = mount(TodoApp, {
      props: { todos: [{ id: 1, text: '任务1' }] },
    })

    await wrapper.find('.delete-btn').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('delete')
    expect(wrapper.emitted('delete')[0]).toEqual([1])
  })

  // 测试异步操作
  it('加载数据后显示列表', async () => {
    const wrapper = mount(TodoApp)

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    // 或使用 flushPromises
    // await flushPromises()

    expect(wrapper.findAll('.todo-item').length).toBeGreaterThan(0)
  })
})
```

测试依赖注入和路由：

```ts
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NavBar from '../NavBar.vue'

describe('NavBar', () => {
  it('当前路由高亮', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } },
      ],
    })

    router.push('/about')
    await router.isReady()

    const wrapper = mount(NavBar, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.find('.nav-link.active').text()).toBe('About')
  })

  it('使用 provide/inject', () => {
    const wrapper = mount(ChildComponent, {
      global: {
        provide: {
          theme: 'dark',
          locale: 'zh-CN',
        },
      },
    })

    expect(wrapper.text()).toContain('dark')
  })
})
```

## 5. 🤔 如何测试 Vue 的组合式函数（Composables）？

组合式函数是纯 JavaScript/TypeScript 函数，测试它们比测试组件更简单。但由于 Composables 通常使用 Vue 的响应式 API 和生命周期钩子，测试时需要提供 Vue 的上下文环境。

测试不依赖组件上下文的 Composable：

```ts
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  const doubled = computed(() => count.value * 2)

  function increment() {
    count.value++
  }
  function decrement() {
    count.value--
  }
  function reset() {
    count.value = initial
  }

  return { count, doubled, increment, decrement, reset }
}
```

```ts
// composables/__tests__/useCounter.spec.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from '../useCounter'

describe('useCounter', () => {
  it('初始化默认值为 0', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('接受自定义初始值', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })

  it('increment 增加计数', () => {
    const { count, increment } = useCounter()
    increment()
    increment()
    expect(count.value).toBe(2)
  })

  it('doubled 返回双倍值', () => {
    const { count, doubled, increment } = useCounter(5)
    expect(doubled.value).toBe(10)
    increment()
    expect(doubled.value).toBe(12)
  })

  it('reset 重置为初始值', () => {
    const { count, increment, reset } = useCounter(5)
    increment()
    increment()
    expect(count.value).toBe(7)
    reset()
    expect(count.value).toBe(5)
  })
})
```

测试依赖生命周期钩子的 Composable（需要在组件上下文中运行）：

```ts
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function handler(e: MouseEvent) {
    x.value = e.clientX
    y.value = e.clientY
  }

  onMounted(() => window.addEventListener('mousemove', handler))
  onUnmounted(() => window.removeEventListener('mousemove', handler))

  return { x, y }
}
```

```ts
// composables/__tests__/useMouse.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useMouse } from '../useMouse'

// 创建一个测试包装组件
function withSetup<T>(composable: () => T) {
  let result: T
  const TestComponent = defineComponent({
    setup() {
      result = composable()
      return () => null // 渲染为空
    },
  })
  const wrapper = mount(TestComponent)
  return { result: result!, wrapper }
}

describe('useMouse', () => {
  it('初始位置为 (0, 0)', () => {
    const { result } = withSetup(() => useMouse())
    expect(result.x.value).toBe(0)
    expect(result.y.value).toBe(0)
  })

  it('响应鼠标移动事件', async () => {
    const { result } = withSetup(() => useMouse())

    // 模拟鼠标移动事件
    window.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 200,
      }),
    )

    expect(result.x.value).toBe(100)
    expect(result.y.value).toBe(200)
  })

  it('组件卸载后移除事件监听', () => {
    const { wrapper } = withSetup(() => useMouse())

    wrapper.unmount()

    // 卸载后事件不应该再更新
    window.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 999,
        clientY: 999,
      }),
    )
    // 可以通过 spy 验证 removeEventListener 被调用
  })
})
```

测试异步 Composable：

```ts
// composables/useFetch.ts
import { ref } from 'vue'

export function useFetch(url: string) {
  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(true)

  fetch(url)
    .then((r) => r.json())
    .then((d) => {
      data.value = d
    })
    .catch((e) => {
      error.value = e.message
    })
    .finally(() => {
      isLoading.value = false
    })

  return { data, error, isLoading }
}
```

```ts
// composables/__tests__/useFetch.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFetch } from '../useFetch'
import { flushPromises } from '@vue/test-utils'

describe('useFetch', () => {
  beforeEach(() => {
    // Mock fetch
    vi.stubGlobal('fetch', vi.fn())
  })

  it('成功获取数据', async () => {
    const mockData = { id: 1, name: '张三' }
    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve(mockData),
    } as Response)

    const { data, error, isLoading } = useFetch('/api/user')

    expect(isLoading.value).toBe(true)

    await flushPromises()

    expect(data.value).toEqual(mockData)
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('处理请求错误', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('网络错误'))

    const { data, error, isLoading } = useFetch('/api/user')

    await flushPromises()

    expect(data.value).toBeNull()
    expect(error.value).toBe('网络错误')
    expect(isLoading.value).toBe(false)
  })
})
```
