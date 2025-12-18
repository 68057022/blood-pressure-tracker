<template>
  <div class="app">
    <LoginPage v-if="!isAuthenticated" @login="handleLogin" />
    <MainApp v-else @logout="handleLogout" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginPage from './components/LoginPage.vue'
import MainApp from './components/MainApp.vue'

const isAuthenticated = ref(false)

onMounted(() => {
  const remembered = localStorage.getItem('bp_authenticated')
  if (remembered === 'true') {
    isAuthenticated.value = true
  }
})

const handleLogin = () => {
  isAuthenticated.value = true
  localStorage.setItem('bp_authenticated', 'true')
}

const handleLogout = () => {
  isAuthenticated.value = false
  localStorage.removeItem('bp_authenticated')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f0f4f8;
}

#app, .app {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
