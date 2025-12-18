<template>
  <div class="record-form">
    <div class="card main-card">
      <div class="card-header">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#1976d2">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
        <h2>录入血压数据</h2>
      </div>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#666">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
            </svg>
            日期时间
          </label>
          <input type="datetime-local" v-model="form.datetime" required />
        </div>
        <div class="form-row">
          <div class="form-group highlight-red">
            <label>高压 (收缩压)</label>
            <div class="value-input">
              <input type="number" v-model.number="form.systolic" placeholder="120" required min="60" max="250" />
              <span class="unit">mmHg</span>
            </div>
          </div>
          <div class="form-group highlight-blue">
            <label>低压 (舒张压)</label>
            <div class="value-input">
              <input type="number" v-model.number="form.diastolic" placeholder="80" required min="40" max="150" />
              <span class="unit">mmHg</span>
            </div>
          </div>
        </div>
        <div class="form-group highlight-green">
          <label>脉搏 (心率)</label>
          <div class="value-input">
            <input type="number" v-model.number="form.pulse" placeholder="72" required min="40" max="200" />
            <span class="unit">次/分</span>
          </div>
        </div>
        <div class="form-group">
          <label>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#666">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            备注 (可选)
          </label>
          <textarea v-model="form.note" placeholder="如：饭后测量、运动后、服药后等"></textarea>
        </div>
        <button type="submit" class="submit-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          保存记录
        </button>
      </form>
    </div>

    <div class="card tips-card">
      <div class="card-header">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="#ff9800">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <h3>血压参考标准</h3>
      </div>
      <div class="tips-list">
        <div class="tip-item normal">
          <div class="tip-dot"></div>
          <div class="tip-content">
            <span class="tip-label">正常血压</span>
            <span class="tip-value">高压 &lt; 120 且 低压 &lt; 80</span>
          </div>
        </div>
        <div class="tip-item elevated">
          <div class="tip-dot"></div>
          <div class="tip-content">
            <span class="tip-label">血压偏高</span>
            <span class="tip-value">高压 120-129 且 低压 &lt; 80</span>
          </div>
        </div>
        <div class="tip-item high">
          <div class="tip-dot"></div>
          <div class="tip-content">
            <span class="tip-label">高血压</span>
            <span class="tip-value">高压 ≥ 130 或 低压 ≥ 80</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['save'])

const getDefaultDatetime = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

const form = reactive({
  datetime: getDefaultDatetime(),
  systolic: null,
  diastolic: null,
  pulse: null,
  note: ''
})

const submit = () => {
  emit('save', {
    id: Date.now(),
    datetime: form.datetime,
    systolic: form.systolic,
    diastolic: form.diastolic,
    pulse: form.pulse,
    note: form.note
  })
  form.systolic = null
  form.diastolic = null
  form.pulse = null
  form.note = ''
  form.datetime = getDefaultDatetime()
  alert('保存成功！')
}
</script>

<style scoped>
.record-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
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
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h2, .card-header h3 {
  font-size: 16px;
  color: #1a1a2e;
  font-weight: 600;
}

.form-group {
  margin-bottom: 18px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  background: #fafafa;
  box-sizing: border-box;
}

input[type="datetime-local"] {
  -webkit-appearance: none;
  appearance: none;
  min-height: 50px;
}

input:focus, textarea:focus {
  border-color: #1976d2;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1);
}

.value-input {
  position: relative;
}

.value-input input {
  padding-right: 60px;
}

.value-input .unit {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 13px;
}

.highlight-red input:focus {
  border-color: #f44336;
  box-shadow: 0 0 0 4px rgba(244, 67, 54, 0.1);
}

.highlight-blue input:focus {
  border-color: #2196f3;
  box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.1);
}

.highlight-green input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
}

textarea {
  resize: none;
  height: 70px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.submit-btn:hover {
  background: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.tips-card .card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #f8f9fa;
}

.tip-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tip-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tip-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.tip-value {
  font-size: 12px;
  color: #666;
}

.normal { background: #e8f5e9; }
.normal .tip-dot { background: #4caf50; }
.elevated { background: #fff3e0; }
.elevated .tip-dot { background: #ff9800; }
.high { background: #ffebee; }
.high .tip-dot { background: #f44336; }
</style>
