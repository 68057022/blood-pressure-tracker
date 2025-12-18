<template>
  <div class="history-list">
    <!-- 视图切换 -->
    <div class="view-switch" v-if="records.length > 0">
      <button :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'" title="卡片视图">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/>
        </svg>
      </button>
      <button :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'" title="表格视图">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z"/>
        </svg>
      </button>
      <span class="record-total">共 {{ records.length }} 条</span>
    </div>

    <div class="card" v-if="records.length === 0">
      <div class="empty">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="#ddd">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <p class="empty-title">暂无记录</p>
        <p class="empty-desc">点击"录入"开始记录您的血压数据</p>
      </div>
    </div>

    <!-- 表格视图 -->
    <div class="table-wrapper card" v-if="viewMode === 'table' && records.length > 0">
      <table class="data-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>高压</th>
            <th>低压</th>
            <th>脉搏</th>
            <th>备注</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in records" :key="record.id" :class="getStatus(record.systolic, record.diastolic)">
            <td class="time-cell">{{ formatShortDate(record.datetime) }}</td>
            <td class="sys-cell">{{ record.systolic }}</td>
            <td class="dia-cell">{{ record.diastolic }}</td>
            <td class="pulse-cell">{{ record.pulse }}</td>
            <td class="note-cell">{{ record.note || '-' }}</td>
            <td class="action-cell">
              <button class="del-btn" @click="$emit('delete', index)" title="删除">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 卡片视图 -->
    <template v-if="viewMode === 'card'">
    <div class="record-item card" v-for="(record, index) in records" :key="record.id">
      <div class="record-header">
        <div class="date-info">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#999">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
          <span>{{ formatDate(record.datetime) }}</span>
        </div>
        <button class="delete-btn" @click="$emit('delete', index)" title="删除记录">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
      <div class="record-values">
        <div class="value-item" :class="getStatus(record.systolic, record.diastolic)">
          <span class="label">高压</span>
          <span class="value">{{ record.systolic }}</span>
          <span class="unit">mmHg</span>
        </div>
        <div class="value-item" :class="getStatus(record.systolic, record.diastolic)">
          <span class="label">低压</span>
          <span class="value">{{ record.diastolic }}</span>
          <span class="unit">mmHg</span>
        </div>
        <div class="value-item pulse">
          <span class="label">脉搏</span>
          <span class="value">{{ record.pulse }}</span>
          <span class="unit">次/分</span>
        </div>
      </div>
      <div class="record-note" v-if="record.note">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="#999">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
        {{ record.note }}
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  records: { type: Array, required: true }
})
defineEmits(['delete'])

const viewMode = ref('card')

const formatDate = (datetime) => {
  const d = new Date(datetime)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  return `${year}年${month}月${day}日 ${hour}:${minute}`
}

const formatShortDate = (datetime) => {
  const d = new Date(datetime)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hour}:${minute}`
}

const getStatus = (systolic, diastolic) => {
  if (systolic >= 140 || diastolic >= 90) return 'danger'
  if (systolic >= 130 || diastolic >= 80) return 'warning'
  if (systolic < 120 && diastolic < 80) return 'normal'
  return 'elevated'
}
</script>

<style scoped>
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  width: 100%;
  box-sizing: border-box;
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

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.delete-btn {
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 6px;
  color: #bbb;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #ffebee;
  color: #f44336;
}

.record-values {
  display: flex;
  gap: 10px;
}

.value-item {
  flex: 1;
  text-align: center;
  padding: 14px 8px;
  background: #f5f7fa;
  border-radius: 12px;
  transition: transform 0.2s;
}

.value-item:hover {
  transform: translateY(-2px);
}

.value-item.normal { background: #e8f5e9; }
.value-item.elevated { background: #fff8e1; }
.value-item.warning { background: #fff3e0; }
.value-item.danger { background: #ffebee; }
.value-item.pulse { background: #e3f2fd; }

.label {
  display: block;
  font-size: 11px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.value {
  display: block;
  font-size: 26px;
  font-weight: 700;
  color: #1a1a2e;
}

.unit {
  display: block;
  font-size: 10px;
  color: #999;
  margin-top: 4px;
}

.record-note {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 视图切换 */
.view-switch {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 10px;
}

.view-switch button {
  padding: 6px 10px;
  border: none;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.view-switch button.active {
  background: #1976d2;
  color: #fff;
}

.view-switch button:not(.active):hover {
  color: #1976d2;
}

.record-total {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}

/* 表格样式 */
.table-wrapper {
  overflow-x: auto;
  padding: 0 !important;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid #e0e0e0;
  white-space: nowrap;
}

.data-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
}

.data-table tbody tr.danger td {
  background: rgba(244, 67, 54, 0.05);
}

.data-table tbody tr.warning td {
  background: rgba(255, 152, 0, 0.05);
}

.time-cell {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.sys-cell {
  font-weight: 700;
  color: #f44336;
}

.dia-cell {
  font-weight: 700;
  color: #2196f3;
}

.pulse-cell {
  font-weight: 600;
  color: #4caf50;
}

.note-cell {
  font-size: 12px;
  color: #999;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-cell {
  width: 40px;
}

.del-btn {
  padding: 4px 6px;
  border: none;
  background: transparent;
  color: #ccc;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.del-btn:hover {
  background: #ffebee;
  color: #f44336;
}
</style>
