<template>
  <div class="vue-sub-root">
    <div class="vue-sub-title">数据汇聚平台 · Vue3 子应用示例</div>
    <p class="vue-sub-desc">
      本页面由 Vue 3 + Vite 构建，同样运行在 Wujie 沙箱中；与 React 子应用技术栈完全独立、互不干扰。
    </p>

    <div class="vue-card">
      <h3>基座下发的 props</h3>
      <pre>{{ JSON.stringify(props, null, 2) }}</pre>
    </div>

    <div class="vue-card">
      <h3>事件通信</h3>
      <p style="margin-bottom:8px;">来自基座的消息：{{ baseMsg }}</p>
      <button class="vue-btn" @click="sendToBase">向基座发消息</button>
      <button class="vue-btn" @click="backHome">调用基座跳转</button>
    </div>

    <div class="vue-card">
      <h3>计数器（验证保活）</h3>
      <p>点击后切去别的 tab 再回来，数字保留——说明子应用实例未销毁。</p>
      <button class="vue-btn" @click="count++">count = {{ count }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const wujie = (window as any).$wujie || {}
const props = wujie.props || {}

const baseMsg = ref('（暂无消息）')
const count = ref(0)

function onBaseHello(msg: string) {
  baseMsg.value = String(msg)
}
function sendToBase() {
  wujie.bus?.$emit?.('subapp:msg', { from: 'vue-subapp', time: Date.now() })
}
function backHome() {
  props.navigate?.('/')
}

onMounted(() => {
  wujie.bus?.$on?.('base:hello', onBaseHello)
  console.log('[vue-subapp] mounted')
})
onUnmounted(() => {
  wujie.bus?.$off?.('base:hello', onBaseHello)
  console.log('[vue-subapp] unmounted')
})
</script>

<style scoped>
.vue-sub-root {
  width: 100%;
  padding: 24px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}
.vue-sub-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #1f2937; }
.vue-sub-desc  { color: #6b7280; font-size: 13px; margin-bottom: 16px; }
.vue-card {
  padding: 16px;
  border-radius: 6px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  margin-bottom: 16px;
}
.vue-card h3 { font-size: 14px; margin-bottom: 8px; color: #c2410c; }
.vue-card pre {
  background: #0f172a; color: #fde68a; padding: 10px;
  border-radius: 4px; font-size: 12px; overflow-x: auto;
}
.vue-btn {
  padding: 6px 14px;
  background: #f97316;
  color: #fff;
  border-radius: 4px;
  font-size: 13px;
  margin-right: 8px;
  cursor: pointer;
  border: none;
}
.vue-btn:hover { background: #ea580c; }
</style>
