<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-icon">
        <svg viewBox="0 0 24 24" width="56" height="56" fill="#1976d2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <h1>血压健康管理</h1>
      <p class="subtitle">记录每一天，守护您的健康</p>
      <form @submit.prevent="login">
        <div class="input-group">
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" width="20" height="20" fill="#999">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input 
              type="password" 
              v-model="password" 
              placeholder="请输入访问密码"
              :class="{ error: showError }"
            />
          </div>
          <span v-if="showError" class="error-msg">密码错误，请重试</span>
        </div>
        <button type="submit" class="login-btn">
          <span>进入系统</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
          </svg>
        </button>
      </form>
      <div class="footer-info">
        <p class="copyright">© 2025 血压健康管理系统</p>
        <p class="version">v1.0.0</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])
const password = ref('')
const showError = ref(false)
const CORRECT_PASSWORD = 'wssf'

const login = () => {
  if (password.value === CORRECT_PASSWORD) {
    emit('login')
  } else {
    showError.value = true
    setTimeout(() => showError.value = false, 2000)
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f8;
  padding: 20px;
}

.login-card {
  background: #fff;
  border-radius: 20px;
  padding: 48px 36px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  text-align: center;
}

.login-icon {
  width: 80px;
  height: 80px;
  background: #e3f2fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

h1 {
  font-size: 24px;
  color: #1a1a2e;
  margin-bottom: 8px;
  font-weight: 600;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin-bottom: 36px;
}

.input-group {
  margin-bottom: 24px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
}

input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
  background: #fafafa;
}

input:focus {
  border-color: #1976d2;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1);
}

input.error {
  border-color: #f44336;
  background: #fff5f5;
}

.error-msg {
  display: block;
  color: #f44336;
  font-size: 13px;
  margin-top: 10px;
  text-align: left;
  padding-left: 4px;
}

.login-btn {
  width: 100%;
  padding: 16px 24px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover {
  background: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.footer-info {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.copyright {
  color: #999;
  font-size: 12px;
  margin-bottom: 4px;
}

.version {
  color: #bbb;
  font-size: 11px;
}
</style>
