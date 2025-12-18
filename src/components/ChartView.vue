<template>
  <div class="chart-view">
    <div class="card" v-if="records.length < 2">
      <div class="empty">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="#ddd">
          <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
        </svg>
        <p class="empty-title">数据不足</p>
        <p class="empty-desc">至少需要2条记录才能显示趋势图表</p>
      </div>
    </div>

    <template v-else>
      <div class="filter-bar">
        <div class="filter-left">
          <select v-model="timeRange" class="time-select">
            <option :value="3">近3天</option>
            <option :value="7">近7天</option>
            <option :value="30">近1个月</option>
            <option :value="90">近3个月</option>
            <option :value="0">全部数据</option>
          </select>
          <span class="record-count">{{ filteredRecords.length }}条</span>
        </div>
        <div class="toggle-group">
          <div class="view-toggle">
            <button :class="{ active: viewMode === 'detail' }" @click="viewMode = 'detail'" title="详细视图">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
            </button>
            <button :class="{ active: viewMode === 'daily' }" @click="viewMode = 'daily'" title="每日平均">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
              </svg>
            </button>
          </div>
          <div class="chart-toggle">
            <button :class="{ active: chartType === 'line' }" @click="chartType = 'line'" title="折线图">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
              </svg>
            </button>
            <button :class="{ active: chartType === 'bar' }" @click="chartType = 'bar'" title="柱状图">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 每日统计摘要 -->
      <div class="daily-summary card" v-if="viewMode === 'daily' && dailyStats.length > 0">
        <div class="summary-header">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#1976d2">
            <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
          </svg>
          <span>每日统计 (共{{ dailyStats.length }}天)</span>
        </div>
        <div class="summary-scroll">
          <div class="summary-item" v-for="stat in dailyStats.slice().reverse()" :key="stat.dateKey">
            <div class="summary-date">{{ stat.date.getMonth() + 1 }}/{{ stat.date.getDate() }}</div>
            <div class="summary-values">
              <span class="sys">{{ stat.avgSystolic }}<small>±{{ stat.maxSystolic - stat.minSystolic }}</small></span>
              <span class="dia">{{ stat.avgDiastolic }}<small>±{{ stat.maxDiastolic - stat.minDiastolic }}</small></span>
              <span class="pulse">{{ stat.avgPulse }}</span>
            </div>
            <div class="summary-count">{{ stat.count }}次</div>
          </div>
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <div class="header-icon red">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h3>血压趋势 {{ viewMode === 'daily' ? '(每日平均)' : '' }}</h3>
        </div>
        <div class="chart-container">
          <Line v-if="chartType === 'line'" :data="bpChartData" :options="chartOptions" />
          <Bar v-else :data="bpChartData" :options="barOptions" />
        </div>
        <div class="chart-legend">
          <span class="legend-item"><i class="dot" style="background:#f44336"></i>高压 (收缩压)</span>
          <span class="legend-item"><i class="dot" style="background:#2196f3"></i>低压 (舒张压)</span>
          <template v-if="viewMode === 'detail'">
            <span class="legend-item"><i class="dot max"></i>最高值</span>
            <span class="legend-item"><i class="dot min"></i>最低值</span>
          </template>
        </div>
        <div class="bp-range-info" v-if="viewMode === 'detail' && sortedRecords.length > 1">
          <div class="range-item">
            <span class="range-label">高压波动</span>
            <span class="range-value">{{ bpStats.minSys }} - {{ bpStats.maxSys }} mmHg</span>
          </div>
          <div class="range-item">
            <span class="range-label">低压波动</span>
            <span class="range-value">{{ bpStats.minDia }} - {{ bpStats.maxDia }} mmHg</span>
          </div>
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <div class="header-icon green">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h3>脉搏趋势</h3>
        </div>
        <div class="chart-container">
          <Line v-if="chartType === 'line'" :data="pulseChartData" :options="pulseLineOptions" />
          <Bar v-else :data="pulseChartData" :options="pulseBarOptions" />
        </div>
      </div>

      <div class="stats card">
        <div class="card-header">
          <div class="header-icon blue">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <h3>统计概览</h3>
        </div>
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-icon red">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ avgSystolic }}</span>
              <span class="stat-label">平均高压</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon blue">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ avgDiastolic }}</span>
              <span class="stat-label">平均低压</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon green">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ avgPulse }}</span>
              <span class="stat-label">平均脉搏</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon gray">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ filteredRecords.length }}</span>
              <span class="stat-label">筛选记录</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, annotationPlugin)

const props = defineProps({
  records: { type: Array, required: true }
})

const chartType = ref('line')
const timeRange = ref(7)
const viewMode = ref('detail')

const timeRangeText = computed(() => {
  if (timeRange.value === 3) return '近3天'
  if (timeRange.value === 7) return '近7天'
  if (timeRange.value === 30) return '近1个月'
  return '全部数据'
})

const filteredRecords = computed(() => {
  if (timeRange.value === 0) {
    return [...props.records].sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
  }
  
  const now = new Date()
  const cutoff = new Date(now.getTime() - timeRange.value * 24 * 60 * 60 * 1000)
  
  return [...props.records]
    .filter(r => new Date(r.datetime) >= cutoff)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
})

const dailyStats = computed(() => {
  const groups = {}
  filteredRecords.value.forEach(r => {
    const d = new Date(r.datetime)
    const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    if (!groups[dateKey]) {
      groups[dateKey] = { records: [], date: d }
    }
    groups[dateKey].records.push(r)
  })
  
  return Object.entries(groups).map(([key, data]) => {
    const records = data.records
    return {
      dateKey: key,
      date: data.date,
      count: records.length,
      avgSystolic: Math.round(records.reduce((s, r) => s + r.systolic, 0) / records.length),
      avgDiastolic: Math.round(records.reduce((s, r) => s + r.diastolic, 0) / records.length),
      avgPulse: Math.round(records.reduce((s, r) => s + r.pulse, 0) / records.length),
      maxSystolic: Math.max(...records.map(r => r.systolic)),
      minSystolic: Math.min(...records.map(r => r.systolic)),
      maxDiastolic: Math.max(...records.map(r => r.diastolic)),
      minDiastolic: Math.min(...records.map(r => r.diastolic))
    }
  }).sort((a, b) => a.date - b.date)
})

const sortedRecords = computed(() => {
  return filteredRecords.value.slice(-30)
})

const detailLabels = computed(() => {
  return sortedRecords.value.map(r => {
    const d = new Date(r.datetime)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  })
})

const dailyLabels = computed(() => {
  return dailyStats.value.map(d => `${d.date.getMonth() + 1}/${d.date.getDate()}`)
})

const labels = computed(() => {
  return viewMode.value === 'daily' ? dailyLabels.value : detailLabels.value
})

const bpStats = computed(() => {
  const data = viewMode.value === 'daily' ? dailyStats.value : sortedRecords.value
  if (data.length === 0) return { maxSys: 0, minSys: 0, maxDia: 0, minDia: 0 }
  
  const sysValues = viewMode.value === 'daily' 
    ? data.map(d => d.avgSystolic) 
    : data.map(r => r.systolic)
  const diaValues = viewMode.value === 'daily'
    ? data.map(d => d.avgDiastolic)
    : data.map(r => r.diastolic)
  
  return {
    maxSys: Math.max(...sysValues),
    minSys: Math.min(...sysValues),
    maxDia: Math.max(...diaValues),
    minDia: Math.min(...diaValues),
    maxSysIdx: sysValues.indexOf(Math.max(...sysValues)),
    minSysIdx: sysValues.indexOf(Math.min(...sysValues))
  }
})

const bpChartData = computed(() => {
  if (viewMode.value === 'daily') {
    return {
      labels: labels.value,
      datasets: [
        {
          label: '高压最高',
          data: dailyStats.value.map(d => d.maxSystolic),
          borderColor: 'rgba(244, 67, 54, 0.3)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(244, 67, 54, 0.5)',
          fill: false
        },
        {
          label: '高压平均',
          data: dailyStats.value.map(d => d.avgSystolic),
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.15)',
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#f44336',
          pointBorderWidth: 3,
          fill: true
        },
        {
          label: '高压最低',
          data: dailyStats.value.map(d => d.minSystolic),
          borderColor: 'rgba(244, 67, 54, 0.3)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(244, 67, 54, 0.5)',
          fill: false
        },
        {
          label: '低压最高',
          data: dailyStats.value.map(d => d.maxDiastolic),
          borderColor: 'rgba(33, 150, 243, 0.3)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(33, 150, 243, 0.5)',
          fill: false
        },
        {
          label: '低压平均',
          data: dailyStats.value.map(d => d.avgDiastolic),
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.15)',
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#2196f3',
          pointBorderWidth: 3,
          fill: true
        },
        {
          label: '低压最低',
          data: dailyStats.value.map(d => d.minDiastolic),
          borderColor: 'rgba(33, 150, 243, 0.3)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(33, 150, 243, 0.5)',
          fill: false
        }
      ]
    }
  }
  
  const sysData = sortedRecords.value.map(r => r.systolic)
  const diaData = sortedRecords.value.map(r => r.diastolic)
  const dataLen = sysData.length
  const baseRadius = dataLen > 20 ? 2 : dataLen > 10 ? 3 : 4
  const highlightRadius = dataLen > 20 ? 4 : dataLen > 10 ? 5 : 6
  const borderWidth = dataLen > 20 ? 1 : 2
  
  return {
    labels: labels.value,
    datasets: [
      {
        label: '高压',
        data: sysData,
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.3,
        pointRadius: sysData.map((v) => 
          v === bpStats.value.maxSys || v === bpStats.value.minSys ? highlightRadius : baseRadius
        ),
        pointHoverRadius: highlightRadius + 2,
        pointBackgroundColor: sysData.map((v) => 
          v === bpStats.value.maxSys ? '#ff1744' : 
          v === bpStats.value.minSys ? '#69f0ae' : '#fff'
        ),
        pointBorderColor: '#f44336',
        pointBorderWidth: borderWidth,
        fill: true
      },
      {
        label: '低压',
        data: diaData,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.3,
        pointRadius: diaData.map((v) => 
          v === bpStats.value.maxDia || v === bpStats.value.minDia ? highlightRadius : baseRadius
        ),
        pointHoverRadius: highlightRadius + 2,
        pointBackgroundColor: diaData.map((v) => 
          v === bpStats.value.maxDia ? '#ff1744' : 
          v === bpStats.value.minDia ? '#69f0ae' : '#fff'
        ),
        pointBorderColor: '#2196f3',
        pointBorderWidth: borderWidth,
        fill: true
      }
    ]
  }
})

const pulseChartData = computed(() => {
  const data = viewMode.value === 'daily' 
    ? dailyStats.value.map(d => d.avgPulse)
    : sortedRecords.value.map(r => r.pulse)
  
  const maxPulse = Math.max(...data)
  const minPulse = Math.min(...data)
  const dataLen = data.length
  const baseRadius = dataLen > 20 ? 2 : dataLen > 10 ? 3 : 4
  const highlightRadius = dataLen > 20 ? 4 : dataLen > 10 ? 5 : 6
  const borderWidth = dataLen > 20 ? 1 : 2
  
  return {
    labels: labels.value,
    datasets: [
      {
        label: viewMode.value === 'daily' ? '平均脉搏' : '脉搏',
        data: data,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        tension: 0.3,
        pointRadius: data.map(v => v === maxPulse || v === minPulse ? highlightRadius : baseRadius),
        pointHoverRadius: highlightRadius + 2,
        pointBackgroundColor: data.map(v => 
          v === maxPulse ? '#ff1744' : v === minPulse ? '#69f0ae' : '#fff'
        ),
        pointBorderColor: '#4caf50',
        pointBorderWidth: borderWidth,
        fill: true
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: { 
    legend: { display: viewMode.value === 'daily' },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.85)',
      padding: 14,
      cornerRadius: 10,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
      callbacks: {
        title: (items) => {
          if (viewMode.value === 'daily') {
            const idx = items[0].dataIndex
            const stat = dailyStats.value[idx]
            return `${stat.date.getMonth() + 1}月${stat.date.getDate()}日 (${stat.count}次测量)`
          }
          return items[0].label
        },
        afterBody: (items) => {
          if (viewMode.value === 'detail') {
            const idx = items[0].dataIndex
            const record = sortedRecords.value[idx]
            if (record.notes) return [`备注: ${record.notes}`]
          }
          return []
        }
      }
    },
    annotation: {
      annotations: {
        normalHigh: {
          type: 'line',
          yMin: 140,
          yMax: 140,
          borderColor: 'rgba(255, 152, 0, 0.6)',
          borderWidth: 2,
          borderDash: [6, 6],
          label: {
            display: true,
            content: '140',
            position: 'end',
            backgroundColor: 'rgba(255, 152, 0, 0.9)',
            color: '#fff',
            font: { size: 9, weight: 'bold' },
            padding: 3
          }
        },
        normalLow: {
          type: 'line',
          yMin: 90,
          yMax: 90,
          borderColor: 'rgba(255, 152, 0, 0.6)',
          borderWidth: 2,
          borderDash: [6, 6],
          label: {
            display: true,
            content: '90',
            position: 'end',
            backgroundColor: 'rgba(255, 152, 0, 0.9)',
            color: '#fff',
            font: { size: 9, weight: 'bold' },
            padding: 3
          }
        }
      }
    }
  },
  scales: { 
    y: { 
      min: 50, 
      max: 190,
      ticks: {
        stepSize: 10,
        font: { size: 10 }
      },
      grid: { color: 'rgba(0,0,0,0.06)' }
    },
    x: {
      grid: { display: false },
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        font: { size: 9 }
      }
    }
  }
}))

const barOptions = computed(() => ({
  ...chartOptions.value,
  plugins: { 
    ...chartOptions.value.plugins,
    legend: { display: viewMode.value === 'daily' }
  }
}))

const pulseLineOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: { 
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.85)',
      padding: 14,
      cornerRadius: 10,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 }
    },
    annotation: {
      annotations: {
        normalHigh: {
          type: 'line',
          yMin: 100,
          yMax: 100,
          borderColor: 'rgba(255, 152, 0, 0.6)',
          borderWidth: 2,
          borderDash: [6, 6],
          label: {
            display: true,
            content: '100',
            position: 'end',
            backgroundColor: 'rgba(255, 152, 0, 0.9)',
            color: '#fff',
            font: { size: 9, weight: 'bold' },
            padding: 3
          }
        },
        normalLow: {
          type: 'line',
          yMin: 60,
          yMax: 60,
          borderColor: 'rgba(255, 152, 0, 0.6)',
          borderWidth: 2,
          borderDash: [6, 6],
          label: {
            display: true,
            content: '60',
            position: 'end',
            backgroundColor: 'rgba(255, 152, 0, 0.9)',
            color: '#fff',
            font: { size: 9, weight: 'bold' },
            padding: 3
          }
        }
      }
    }
  },
  scales: { 
    y: { 
      min: 50, 
      max: 130,
      ticks: {
        stepSize: 10,
        font: { size: 10 }
      },
      grid: { color: 'rgba(0,0,0,0.06)' }
    },
    x: {
      grid: { display: false },
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        font: { size: 9 }
      }
    }
  }
}))

const pulseBarOptions = computed(() => ({ ...pulseLineOptions.value }))

const avgSystolic = computed(() => {
  if (filteredRecords.value.length === 0) return 0
  return Math.round(filteredRecords.value.reduce((sum, r) => sum + r.systolic, 0) / filteredRecords.value.length)
})

const avgDiastolic = computed(() => {
  if (filteredRecords.value.length === 0) return 0
  return Math.round(filteredRecords.value.reduce((sum, r) => sum + r.diastolic, 0) / filteredRecords.value.length)
})

const avgPulse = computed(() => {
  if (filteredRecords.value.length === 0) return 0
  return Math.round(filteredRecords.value.reduce((sum, r) => sum + r.pulse, 0) / filteredRecords.value.length)
})
</script>

<style scoped>
.chart-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  color: #333;
  background: #fff;
  cursor: pointer;
  outline: none;
}

.time-select:focus {
  border-color: #1976d2;
}

.record-count {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.chart-toggle {
  display: flex;
  gap: 4px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
}

.chart-toggle button {
  padding: 6px 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.chart-toggle button.active {
  background: #1976d2;
  color: #fff;
}

.chart-toggle button:not(.active):hover {
  color: #1976d2;
}

.toggle-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.view-toggle {
  display: flex;
  gap: 2px;
  background: #f5f5f5;
  padding: 3px;
  border-radius: 8px;
}

.view-toggle button {
  padding: 5px 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.view-toggle button.active {
  background: #1976d2;
  color: #fff;
}

.view-toggle button:not(.active):hover {
  color: #1976d2;
}

/* 每日统计摘要 */
.daily-summary {
  padding: 12px !important;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #1976d2;
  margin-bottom: 10px;
  font-weight: 500;
}

.summary-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.summary-scroll::-webkit-scrollbar {
  height: 4px;
}

.summary-scroll::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.summary-item {
  flex-shrink: 0;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 10px 12px;
  min-width: 90px;
  text-align: center;
}

.summary-date {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  margin-bottom: 6px;
}

.summary-values {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-values span {
  font-size: 13px;
  font-weight: 600;
}

.summary-values span small {
  font-size: 10px;
  color: #999;
  font-weight: normal;
  margin-left: 2px;
}

.summary-values .sys { color: #f44336; }
.summary-values .dia { color: #2196f3; }
.summary-values .pulse { color: #4caf50; }

.summary-count {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  width: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.header-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon.red { background: #f44336; }
.header-icon.blue { background: #2196f3; }
.header-icon.green { background: #4caf50; }

.card-header h3 {
  font-size: 15px;
  color: #1a1a2e;
  font-weight: 600;
}

.empty {
  text-align: center;
  padding: 48px 20px;
}

.empty-title {
  font-size: 16px;
  color: #666;
  margin-top: 16px;
  font-weight: 500;
}

.empty-desc {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

.chart-card {
  padding: 16px;
}

.chart-container {
  height: 280px;
  margin: 0 -8px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
  white-space: nowrap;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot.max {
  background: #ff1744;
  box-shadow: 0 0 0 2px #fff, 0 0 0 3px #ff1744;
}

.dot.min {
  background: #69f0ae;
  box-shadow: 0 0 0 2px #fff, 0 0 0 3px #69f0ae;
}

.bp-range-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e0e0e0;
}

.range-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.range-label {
  font-size: 11px;
  color: #999;
}

.range-value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  border-radius: 12px;
  background: #f8f9fa;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.red { background: #ffebee; color: #f44336; }
.stat-icon.blue { background: #e3f2fd; color: #2196f3; }
.stat-icon.green { background: #e8f5e9; color: #4caf50; }
.stat-icon.gray { background: #f5f5f5; color: #757575; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}
</style>
