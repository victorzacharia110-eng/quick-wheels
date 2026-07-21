<template>
  <div class="tech-root" :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileOpen }">
    <aside class="sidebar" :class="{ 'mobile-open': mobileOpen }">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="logo-mark"><span>QW</span></div>
          <span class="logo-wordmark">Quick-Wheels</span>
        </div>
        <button class="collapse-btn" @click="toggleSidebar">
          <font-awesome-icon :icon="sidebarCollapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'" size="xs" />
        </button>
        <button class="mobile-close-btn" @click="closeMobile">
          <font-awesome-icon icon="fa-solid fa-times" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">{{ $t('nav.main') }}</div>
        <RouterLink v-for="item in mainNav" :key="item.to" :to="item.to" class="nav-item" active-class="active" @click="closeMobile">
          <span class="nav-icon"><font-awesome-icon :icon="item.icon" /></span>
          <span class="nav-label">{{ $t(item.label) }}</span>
        </RouterLink>

        <div class="nav-section-label">{{ $t('maintenance.workshop') }}</div>
        <RouterLink v-for="item in workshopNav" :key="item.to" :to="item.to" class="nav-item" active-class="active" @click="closeMobile">
          <span class="nav-icon"><font-awesome-icon :icon="item.icon" /></span>
          <span class="nav-label">{{ $t(item.label) }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-user">
          <div class="admin-avatar">T</div>
          <div class="admin-user-info">
            <div class="admin-name">{{ authStore.userName || 'Technician' }}</div>
            <div class="admin-role">{{ $t('nav.technician') }}</div>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn-sidebar">
          <font-awesome-icon icon="fa-solid fa-sign-out-alt" /><span>{{ $t('nav.logout') }}</span>
        </button>
        <a href="/" target="_blank" class="view-site-btn">
          <font-awesome-icon icon="fa-solid fa-external-link-alt" size="xs" /><span>{{ $t('nav.viewSite') }}</span>
        </a>
      </div>
    </aside>

    <div v-if="mobileOpen" class="mobile-overlay" @click="closeMobile"></div>

    <div class="tech-main">
      <header class="tech-topbar">
        <div class="topbar-left">
          <button class="hamburger-btn" @click="toggleMobile"><font-awesome-icon icon="fa-solid fa-bars" /></button>
          <div class="breadcrumb">
            <span class="breadcrumb-root">{{ $t('nav.technician') }}</span>
            <font-awesome-icon icon="fa-solid fa-chevron-right" size="xs" />
            <span class="breadcrumb-current">{{ $t(pageTitleKey) }}</span>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-time">{{ currentTime }}</div>
          <div class="lang-switcher">
            <select v-model="currentLocale" @change="switchLang" class="lang-select">
              <option v-for="loc in locales" :key="loc.value" :value="loc.value">{{ $t('locale.' + loc.value) }}</option>
            </select>
          </div>
          <button class="topbar-icon-btn" :title="$t('nav.notifications')">
            <font-awesome-icon icon="fa-regular fa-bell" />
            <span class="notif-dot"></span>
          </button>
          <button @click="handleLogout" class="topbar-logout-btn" :title="$t('nav.logout')">
            <font-awesome-icon icon="fa-solid fa-sign-out-alt" />
          </button>
        </div>
      </header>

      <main class="tech-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { locale } = useI18n();
const currentLocale = ref(locale.value);
const locales = [
  { value: 'en' }, { value: 'sw' }, { value: 'fr' }, { value: 'es' },
  { value: 'pt' }, { value: 'ar' }, { value: 'zh' }, { value: 'hi' },
  { value: 'ru' }, { value: 'ja' }, { value: 'de' }, { value: 'it' },
  { value: 'ko' }, { value: 'tr' }, { value: 'vi' },
];

function switchLang() {
  locale.value = currentLocale.value;
  localStorage.setItem('locale', currentLocale.value);
}

const sidebarCollapsed = ref(false);
const mobileOpen = ref(false);
const currentTime = ref("");
const isMobile = ref(window.innerWidth < 768);

const pageTitleKey = computed(() => {
  const map = {
    "/technician": "maintenance.dashboard",
    "/technician/reports": "maintenance.reports",
    "/technician/create-report": "maintenance.createReport",
  };
  return map[route.path] || "maintenance.dashboard";
});

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

function toggleSidebar() {
  if (isMobile.value) { toggleMobile(); } else { sidebarCollapsed.value = !sidebarCollapsed.value; }
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value;
  document.body.style.overflow = mobileOpen.value ? "hidden" : "";
}

function closeMobile() {
  mobileOpen.value = false;
  document.body.style.overflow = "";
}

function handleResize() {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) { closeMobile(); }
}

async function handleLogout() {
  const result = await authStore.logout();
  if (result.success) { router.push('/'); }
}

let timer;
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener("resize", handleResize);
  document.body.style.overflow = "";
});

watch(mobileOpen, (newVal) => {
  document.body.style.overflow = newVal ? "hidden" : "";
});

const mainNav = [
  { to: "/technician", label: "maintenance.dashboard", icon: "fa-solid fa-th-large" },
];
const workshopNav = [
  { to: "/technician/reports", label: "maintenance.reports", icon: "fa-solid fa-clipboard-list" },
  { to: "/technician/create-report", label: "maintenance.createReport", icon: "fa-solid fa-plus-circle" },
];
</script>

<style scoped>
.tech-root {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: #0d0b1e;
  transition: grid-template-columns 0.3s ease;
  font-family: "Space Grotesk", sans-serif;
  color: #fff;
}
.tech-root.collapsed { grid-template-columns: 64px 1fr; }

.sidebar {
  background: #0a0818;
  border-right: 1px solid rgba(0, 229, 255, 0.08);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  z-index: 100;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}
.logo-mark {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1e1b5e, #00c4d4);
  display: flex; align-items: center; justify-content: center;
  font-family: "Syne", sans-serif;
  font-weight: 800; font-size: 0.8rem;
  color: #fff;
}
.logo-wordmark {
  font-family: "Syne", sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
  color: #fff;
  opacity: 0.9;
  transition: opacity 0.2s;
}
.collapsed .logo-wordmark { opacity: 0; width: 0; }
.collapse-btn {
  background: none; border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer; padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.collapse-btn:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.mobile-close-btn {
  display: none;
  background: none; border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer; padding: 4px;
  font-size: 1.2rem;
}
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 99;
}
.hamburger-btn {
  display: none;
  background: none; border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer; padding: 8px 10px;
  font-size: 1.2rem;
  transition: all 0.2s;
  border-radius: 8px;
  margin: -4px 0;
}
.hamburger-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-section-label {
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
  padding: 12px 10px 6px;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.2s;
}
.collapsed .nav-section-label { opacity: 0; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}
.nav-item:hover { background: rgba(255, 255, 255, 0.06); color: rgba(255, 255, 255, 0.85); }
.nav-item.active {
  background: rgba(0, 196, 212, 0.12);
  color: #00e5ff;
  border: 1px solid rgba(0, 229, 255, 0.15);
}
.nav-item.active .nav-icon { color: #00e5ff; }
.nav-icon {
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.4);
}
.nav-item:hover .nav-icon { color: rgba(255, 255, 255, 0.7); }
.nav-item.active .nav-icon { color: #00e5ff; }
.nav-label { transition: opacity 0.2s, width 0.3s; }
.collapsed .nav-label { opacity: 0; width: 0; overflow: hidden; }

.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}
.admin-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  overflow: hidden;
}
.admin-avatar {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2d2b7f, #00c4d4);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
}
.admin-user-info { overflow: hidden; }
.admin-name {
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.85);
}
.admin-role {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
}
.collapsed .admin-user-info { display: none; }

.logout-btn-sidebar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 8px;
  background: rgba(255, 107, 107, 0.08);
  border: 1px solid rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  width: 100%;
}
.logout-btn-sidebar:hover {
  background: rgba(255, 107, 107, 0.15);
  border-color: rgba(255, 107, 107, 0.3);
}
.collapsed .logout-btn-sidebar span { display: none; }

.topbar-logout-btn {
  background: none; border: none;
  color: rgba(255, 107, 107, 0.5);
  cursor: pointer; padding: 4px;
  transition: color 0.2s;
  font-size: 1.1rem;
}
.topbar-logout-btn:hover { color: #ff6b6b; }

.view-site-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 8px;
  background: rgba(0, 196, 212, 0.08);
  border: 1px solid rgba(0, 196, 212, 0.2);
  color: #00c4d4;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
}
.view-site-btn:hover { background: rgba(0, 196, 212, 0.15); }
.collapsed .view-site-btn span { display: none; }

.tech-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
}
.tech-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 56px;
  flex-shrink: 0;
  background: rgba(10, 8, 24, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
}
.breadcrumb-root {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.35);
}
.breadcrumb svg { color: rgba(255, 255, 255, 0.2); }
.breadcrumb-current {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.topbar-time {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.35);
  font-variant-numeric: tabular-nums;
}
.topbar-icon-btn {
  position: relative;
  background: none; border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer; padding: 4px;
  transition: color 0.2s;
}
.topbar-icon-btn:hover { color: #fff; }
.notif-dot {
  position: absolute;
  top: 3px; right: 3px;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow: 0 0 6px rgba(0, 229, 255, 0.6);
}
.tech-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

@media (max-width: 768px) {
  .tech-root { grid-template-columns: 1fr; }
  .hamburger-btn { display: flex !important; }
  .sidebar {
    position: fixed;
    left: 0; top: 0;
    width: 280px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 100;
    height: 100vh;
    box-shadow: 4px 0 40px rgba(0,0,0,0.5);
  }
  .sidebar.mobile-open { transform: translateX(0); }
  .mobile-overlay { display: block; }
  .mobile-close-btn { display: block; }
  .collapse-btn { display: none; }
  .tech-topbar { padding: 0 16px; }
  .tech-content { padding: 16px; }
  .breadcrumb-root { display: none; }
  .topbar-time { display: none; }
  .sidebar .nav-label { opacity: 1 !important; width: auto !important; }
  .sidebar .nav-section-label { opacity: 1 !important; }
  .sidebar .admin-user-info { display: block !important; }
  .sidebar .view-site-btn span { display: inline !important; }
  .sidebar .logout-btn-sidebar span { display: inline !important; }
}
@media (max-width: 480px) {
  .sidebar { width: 100%; max-width: 320px; }
  .tech-topbar { padding: 0 12px; height: 48px; }
  .tech-content { padding: 12px; }
  .hamburger-btn { padding: 10px 12px; font-size: 1.4rem; }
}
@media (min-width: 769px) {
  .hamburger-btn { display: none !important; }
  .mobile-close-btn { display: none !important; }
  .mobile-overlay { display: none !important; }
}
</style>
