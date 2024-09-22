import { createApp } from 'vue'

import App from `./demos/0/App.vue`
import router from './demos/0/router'
const app = createApp(App)

app.use(router)

app.mount('#app')
