<template>
  <div class="ai-analysis">
    <div class="card">
      <div class="ai-header">
        <div class="ai-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#1976d2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <div class="ai-title">
          <h2>DeepSeek AI 健康分析</h2>
          <p class="ai-model">深度思考模式 · deepseek-reasoner</p>
        </div>
      </div>
      <p class="ai-desc">基于您的血压数据，AI将为您提供专业的健康分析和个性化建议</p>
      
      <div class="data-summary" v-if="records.length > 0">
        <div class="summary-item">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#1976d2">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <div class="summary-content">
            <span class="label">记录数</span>
            <span class="value">{{ records.length }}</span>
          </div>
        </div>
        <div class="summary-item">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#f44336">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <div class="summary-content">
            <span class="label">最近血压</span>
            <span class="value">{{ records[0]?.systolic || '-' }}/{{ records[0]?.diastolic || '-' }}</span>
          </div>
        </div>
        <div class="summary-item">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#4caf50">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <div class="summary-content">
            <span class="label">最近脉搏</span>
            <span class="value">{{ records[0]?.pulse || '-' }}</span>
          </div>
        </div>
      </div>

      <button class="analyze-btn" @click="analyze" :disabled="loading || records.length === 0">
        <span v-if="loading" class="loading-spinner"></span>
        <template v-else>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>
          <span>{{ records.length === 0 ? '暂无数据可分析' : '开始AI智能分析' }}</span>
        </template>
      </button>
    </div>

    <div class="result-card" v-if="parsedResult">
      <div class="result-summary card">
        <div class="summary-header">
          <div class="summary-icon" :class="parsedResult.level">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div class="summary-text">
            <h3>{{ parsedResult.title }}</h3>
            <p class="level-tag" :class="parsedResult.level">{{ parsedResult.levelText }}</p>
          </div>
          <span class="saved-tag">已保存</span>
        </div>
      </div>

      <div class="result-sections">
        <div class="section card" v-for="(section, idx) in parsedResult.sections" :key="idx">
          <div class="section-header">
            <span class="section-icon" :class="section.type">{{ section.icon }}</span>
            <h4>{{ section.title }}</h4>
          </div>
          <div class="section-content" v-html="section.content"></div>
        </div>
      </div>
    </div>

    <div class="card error-card" v-if="error">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="#f44336">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p>{{ error }}</p>
    </div>

    <div class="card history-card" v-if="historyReports.length > 0">
      <div class="history-header" @click="showHistory = !showHistory">
        <div class="history-title">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#1976d2">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
          <h3>历史报告 ({{ historyReports.length }})</h3>
        </div>
        <svg :class="{ rotated: showHistory }" viewBox="0 0 24 24" width="20" height="20" fill="#999">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </div>
      <div class="history-list" v-if="showHistory">
        <div class="history-item" v-for="(report, index) in historyReports" :key="report.id">
          <div class="history-item-header">
            <span class="history-date">{{ formatDate(report.created_at) }}</span>
            <button class="delete-btn" @click="deleteReport(report.id, index)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
          <div class="history-content" v-html="formatResult(report.content)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reportsApi } from '../api.js'

const props = defineProps({
  records: { type: Array, required: true }
})

const loading = ref(false)
const result = ref('')
const parsedResult = ref(null)
const error = ref('')
const historyReports = ref([])
const showHistory = ref(false)

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const API_URL = 'https://api.deepseek.com/chat/completions'

onMounted(async () => {
  historyReports.value = await reportsApi.getAll()
})

const analyze = async () => {
  if (props.records.length === 0) return
  
  loading.value = true
  result.value = ''
  parsedResult.value = null
  error.value = ''

  const recentRecords = props.records.slice(0, 10)
  const dataStr = recentRecords.map(r => 
    `${r.datetime}: 高压${r.systolic}, 低压${r.diastolic}, 脉搏${r.pulse}${r.note ? ', 备注:' + r.note : ''}`
  ).join('\n')

  const avgSystolic = Math.round(recentRecords.reduce((s, r) => s + r.systolic, 0) / recentRecords.length)
  const avgDiastolic = Math.round(recentRecords.reduce((s, r) => s + r.diastolic, 0) / recentRecords.length)
  const avgPulse = Math.round(recentRecords.reduce((s, r) => s + r.pulse, 0) / recentRecords.length)

  const prompt = `作为一名专业的心血管健康顾问，请分析以下血压数据并给出建议：

最近${recentRecords.length}次血压记录：
${dataStr}

统计数据：
- 平均高压：${avgSystolic} mmHg
- 平均低压：${avgDiastolic} mmHg  
- 平均脉搏：${avgPulse} 次/分

请按以下格式输出分析结果（使用markdown格式）：

## 总体评估
（一句话总结血压状况，如：血压偏高需要关注）

## 血压分析
（分析高压低压的具体情况）

## 脉搏评估
（分析心率情况）

## 风险提示
（列出需要注意的健康风险）

## 生活建议
（给出具体可行的建议）

请用简洁专业的语言，重点内容用**加粗**标记。`

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          { role: 'system', content: '你是一位专业的心血管健康顾问，擅长分析血压数据并给出健康建议。请用中文回答，按要求的格式输出。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data = await response.json()
    result.value = data.choices[0].message.content
    parsedResult.value = parseAIResult(result.value, avgSystolic, avgDiastolic)
    
    // 保存报告到数据库
    const recordIds = recentRecords.map(r => r.id)
    const savedReport = await reportsApi.add(result.value, recordIds)
    historyReports.value.unshift(savedReport)
  } catch (e) {
    error.value = '分析失败: ' + e.message
  } finally {
    loading.value = false
  }
}

// 解析AI返回结果
const parseAIResult = (text, avgSystolic, avgDiastolic) => {
  // 判断血压等级
  let level = 'normal'
  let levelText = '血压正常'
  if (avgSystolic >= 140 || avgDiastolic >= 90) {
    level = 'danger'
    levelText = '血压偏高'
  } else if (avgSystolic >= 130 || avgDiastolic >= 80) {
    level = 'warning'
    levelText = '血压临界'
  } else if (avgSystolic >= 120) {
    level = 'elevated'
    levelText = '血压正常偏高'
  }

  // 解析各个部分
  const sections = []
  const sectionConfig = [
    { key: '总体评估', icon: '📊', type: 'overview' },
    { key: '血压分析', icon: '❤️', type: 'bp' },
    { key: '脉搏评估', icon: '💓', type: 'pulse' },
    { key: '风险提示', icon: '⚠️', type: 'risk' },
    { key: '生活建议', icon: '💡', type: 'advice' }
  ]

  for (const config of sectionConfig) {
    const regex = new RegExp(`##\\s*${config.key}[\\s\\S]*?(?=##|$)`, 'i')
    const match = text.match(regex)
    if (match) {
      let content = match[0].replace(/##\s*\S+\s*\n?/, '').trim()
      content = formatContent(content)
      sections.push({
        title: config.key,
        icon: config.icon,
        type: config.type,
        content
      })
    }
  }

  // 如果没有解析到分段，就整体显示
  if (sections.length === 0) {
    sections.push({
      title: '分析结果',
      icon: '📋',
      type: 'overview',
      content: formatContent(text)
    })
  }

  return {
    title: `平均血压 ${avgSystolic}/${avgDiastolic} mmHg`,
    level,
    levelText,
    sections
  }
}

// 格式化内容
const formatContent = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/- /g, '• ')
}

const deleteReport = async (id, index) => {
  await reportsApi.delete(id)
  historyReports.value.splice(index, 1)
}

const formatResult = (text) => {
  return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}
</script>

<style scoped>
.ai-analysis {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  width: 100%;
  box-sizing: border-box;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.ai-icon {
  width: 52px;
  height: 52px;
  background: #e3f2fd;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-title h2 {
  font-size: 17px;
  color: #1a1a2e;
  font-weight: 600;
  margin-bottom: 4px;
}

.ai-model {
  font-size: 12px;
  color: #999;
}

.ai-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.data-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-content {
  display: flex;
  justify-content: space-between;
  flex: 1;
}

.summary-item .label {
  font-size: 13px;
  color: #666;
}

.summary-item .value {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.analyze-btn {
  width: 100%;
  padding: 16px 24px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
}

.analyze-btn:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
}

.analyze-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-summary {
  border-left: 4px solid #4caf50;
}

.result-summary.card {
  padding: 16px;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-icon.normal { background: #e8f5e9; color: #4caf50; }
.summary-icon.elevated { background: #fff8e1; color: #ffc107; }
.summary-icon.warning { background: #fff3e0; color: #ff9800; }
.summary-icon.danger { background: #ffebee; color: #f44336; }

.summary-text h3 {
  font-size: 16px;
  color: #1a1a2e;
  font-weight: 600;
  margin-bottom: 4px;
}

.level-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.level-tag.normal { background: #e8f5e9; color: #4caf50; }
.level-tag.elevated { background: #fff8e1; color: #f59e0b; }
.level-tag.warning { background: #fff3e0; color: #ff9800; }
.level-tag.danger { background: #ffebee; color: #f44336; }

.result-sections {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section.card {
  padding: 14px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.section-icon {
  font-size: 16px;
}

.section-header h4 {
  font-size: 14px;
  color: #1a1a2e;
  font-weight: 600;
}

.section-content {
  font-size: 13px;
  line-height: 1.8;
  color: #555;
}

.section-content :deep(.highlight) {
  color: #1976d2;
  font-weight: 600;
  background: #e3f2fd;
  padding: 1px 4px;
  border-radius: 3px;
}

.error-card {
  background: #ffebee;
  border-left: 4px solid #f44336;
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-card p {
  color: #c62828;
  font-size: 14px;
}

.saved-tag {
  margin-left: auto;
  background: #e8f5e9;
  color: #4caf50;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
}

.history-card {
  border-left: 4px solid #1976d2;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 4px 0;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.history-title h3 {
  font-size: 15px;
  color: #1a1a2e;
  font-weight: 600;
}

.history-header svg.rotated {
  transform: rotate(180deg);
}

.history-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.history-date {
  font-size: 12px;
  color: #666;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #bbb;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.delete-btn:hover {
  background: #ffebee;
  color: #f44336;
}

.history-content {
  font-size: 13px;
  line-height: 1.7;
  color: #555;
  max-height: 150px;
  overflow-y: auto;
}
</style>
