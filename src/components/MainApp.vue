<template>
  <div class="main-app">
    <header class="header">
      <div class="header-left">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <h1>血压记录</h1>
      </div>
      <div class="header-right">
        <button class="header-btn" @click="sendRemind" title="发送微信提醒">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </button>
        <button class="header-btn" @click="$emit('logout')" title="退出登录">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
        </button>
      </div>
    </header>

    <nav class="tabs">
      <button :class="{ active: activeTab === 'record' }" @click="activeTab = 'record'">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
        <span>录入</span>
      </button>
      <button :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
        </svg>
        <span>历史</span>
      </button>
      <button :class="{ active: activeTab === 'chart' }" @click="activeTab = 'chart'">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
        </svg>
        <span>图表</span>
      </button>
      <button :class="{ active: activeTab === 'ai' }" @click="activeTab = 'ai'">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span>AI分析</span>
      </button>
    </nav>

    <main class="content">
      <RecordForm v-if="activeTab === 'record'" @save="saveRecord" />
      <HistoryList v-else-if="activeTab === 'history'" :records="records" @delete="deleteRecord" />
      <ChartView v-else-if="activeTab === 'chart'" :records="records" />
      <AIAnalysis v-else-if="activeTab === 'ai'" :records="records" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RecordForm from './RecordForm.vue'
import HistoryList from './HistoryList.vue'
import ChartView from './ChartView.vue'
import AIAnalysis from './AIAnalysis.vue'
import { recordsApi, pushApi } from '../api.js'

defineEmits(['logout'])

const sendRemind = async () => {
  const result = await pushApi.sendRemind()
  if (result.code === 1000 || result.success) {
    alert('提醒已发送到微信！')
  } else {
    alert('发送失败：' + (result.msg || result.error))
  }
}

const activeTab = ref('record')
const records = ref([])

onMounted(async () => {
  records.value = await recordsApi.getAll()
})

const saveRecord = async (record) => {
  const newRecord = await recordsApi.add(record)
  records.value.unshift(newRecord)
}

const deleteRecord = async (index) => {
  const record = records.value[index]
  await recordsApi.delete(record.id)
  records.value.splice(index, 1)
}
</script>

<style scoped>
.main-app {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f0f4f8;
  display: flex;
  flex-direction: column;
}

.header {
  background: #1976d2;
  color: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header h1 {
  font-size: 17px;
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 8px;
}

.header-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.header-btn:hover {
  background: rgba(255,255,255,0.2);
}

.tabs {
  display: flex;
  background: #fff;
  padding: 6px;
  gap: 4px;
  position: sticky;
  top: 48px;
  z-index: 99;
  border-bottom: 1px solid #e8e8e8;
}

.tabs button {
  flex: 1;
  padding: 10px 6px;
  border: none;
  background: transparent;
  font-size: 12px;
  color: #888;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tabs button svg {
  width: 18px;
  height: 18px;
}

.tabs button:hover {
  background: #f5f5f5;
  color: #666;
}

.tabs button.active {
  color: #fff;
  background: #1976d2;
}

.content {
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
}
</style>
