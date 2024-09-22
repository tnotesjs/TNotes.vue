import { createRouter, createWebHistory } from 'vue-router'
import Counter from './Counter.vue'
import TextInput from './TextInput.vue'
import CheckboxList from './CheckboxList.vue'
import Timer from './Timer.vue'

const routes = [
  { path: '/', component: Counter },
  { path: '/input', component: TextInput },
  { path: '/checkboxlist', component: CheckboxList },
  { path: '/timer', component: Timer }
]

export default createRouter({
  history: createWebHistory(),
  routes
})