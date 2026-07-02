<template>
  <div id="app">
    <NavBar v-if="!$route.meta.hideNavBar" />
    <main>
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="$route.fullPath" />
        </Transition>
      </router-view>
    </main>
    <FooterBar v-if="!$route.meta.hideFooter" />
  </div>
</template>

<script setup>
import NavBar from './components/common/NavBar.vue'
import FooterBar from './components/common/FooterBar.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
authStore.init()
</script>

<style>
/* ── Reset & Base ── */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Space Grotesk', sans-serif;
  background: #0a0818;
  color: #fff;
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  position: relative;
}

/* ── Page Transitions ── */

/* Fade + Slide Up */
.page-enter-active,
.page-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.98);
}

/* ── Alternative: Fade Only (gentler) ── */
/* Uncomment this and comment above for just fade */
/*
.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
*/

/* ── Alternative: Slide Horizontal ── */
/*
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
*/

/* ── Alternative: Zoom Fade ── */
/*
.page-enter-active,
.page-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.page-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
*/

/* ── Scrollbar Styling ── */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00C4D4, #00E5FF);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #00E5FF, #00C4D4);
}

/* ── Selection ── */
::selection {
  background: rgba(0, 196, 212, 0.3);
  color: #fff;
}

::-moz-selection {
  background: rgba(0, 196, 212, 0.3);
  color: #fff;
}
</style>