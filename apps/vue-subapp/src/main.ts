import { createApp } from 'vue'
import App from './App.vue'

let instance: ReturnType<typeof createApp> | null = null

function mount() {
  const el = document.getElementById('app')
  if (!el) return
  instance = createApp(App)
  instance.mount(el)
}
function unmount() {
  instance?.unmount?.()
  instance = null
}

if (!(window as any).__POWERED_BY_WUJIE__) {
  mount()
} else {
  ;(window as any).__WUJIE_MOUNT = mount
  ;(window as any).__WUJIE_UNMOUNT = unmount
  ;(window as any).__WUJIE_MOUNT?.()
}
