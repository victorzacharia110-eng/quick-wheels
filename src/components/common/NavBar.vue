<template>
  <nav class="navbar" :class="{ 'scrolled': isScrolled }">
    <div class="nav-container">
      <RouterLink to="/" class="nav-logo" @click="closeMenu">
        <span class="logo-mark">QW</span>
        <span class="logo-text">Quick-Wheels</span>
      </RouterLink>
      
      <!-- Hamburger Button -->
      <button class="hamburger-btn" @click="toggleMenu" aria-label="Toggle menu">
        <font-awesome-icon :icon="isMenuOpen ? 'fa-solid fa-times' : 'fa-solid fa-bars'" />
      </button>
      
      <div class="nav-links" :class="{ 'mobile-open': isMenuOpen }">
        <RouterLink 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path" 
          class="nav-link" 
          :class="{ 'active': $route.path === link.path }"
          @click="closeMenu"
        >
          <font-awesome-icon :icon="link.icon" class="link-icon" />
          {{ link.name }}
        </RouterLink>
        
        <div v-if="!authStore.isAuthenticated" class="nav-auth">
          <RouterLink to="/auth/login" class="btn-outline-sm" @click="closeMenu">
            <font-awesome-icon icon="fa-solid fa-arrow-right-to-bracket" />
            Login
          </RouterLink>
          <RouterLink to="/auth/register" class="btn-primary-sm" @click="closeMenu">
            <font-awesome-icon icon="fa-solid fa-user-plus" />
            Register
          </RouterLink>
        </div>
        
        <div v-else class="nav-user">
          <span class="user-name">{{ authStore.userName }}</span>
          <span v-if="authStore.isOwner" class="user-role">(Owner)</span>
          <span v-else-if="authStore.isEmployee" class="user-role">(Driver)</span>
          <button @click="handleLogout" class="btn-outline-sm logout-btn">
            <font-awesome-icon icon="fa-solid fa-sign-out-alt" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isMenuOpen = ref(false)
const isScrolled = ref(false)

const navLinks = [
  { name: 'Home', path: '/', icon: 'fa-solid fa-house' },
  { name: 'Vehicles', path: '/vehicles', icon: 'fa-solid fa-car' },
  { name: 'About', path: '/about', icon: 'fa-solid fa-info-circle' },
  { name: 'Contact', path: '/contact', icon: 'fa-solid fa-envelope' }
]

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

function closeMenu() {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
  closeMenu()
}

// Handle scroll effect
function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.navbar {
  background: rgba(10, 8, 24, 0.85);
  border-bottom: 1px solid rgba(0, 229, 255, 0.05);
  padding: 14px 24px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar.scrolled {
  background: rgba(10, 8, 24, 0.95);
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  padding: 10px 24px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ── Logo ── */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-logo:hover {
  transform: scale(1.02);
}

.logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1e1b5e, #00c4d4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Syne", sans-serif;
  font-weight: 800;
  font-size: 0.8rem;
  color: #fff;
  transition: all 0.3s ease;
}

.nav-logo:hover .logo-mark {
  transform: rotate(-10deg) scale(1.05);
  box-shadow: 0 0 30px rgba(0, 196, 212, 0.2);
}

.logo-text {
  font-family: "Syne", sans-serif;
  font-weight: 700;
  color: #fff;
  font-size: 1rem;
  transition: color 0.3s ease;
}

/* ── Hamburger Button ── */
.hamburger-btn {
  display: none;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 8px;
  font-size: 1.4rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
}

.hamburger-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.hamburger-btn svg {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hamburger-btn .fa-times {
  transform: rotate(90deg);
}

/* ── Nav Links ── */
.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.nav-link {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  position: relative;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.link-icon {
  font-size: 0.85rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
  border-radius: 2px;
}

.nav-link:hover {
  color: #fff;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link:hover .link-icon {
  opacity: 1;
}

.nav-link.active {
  color: #fff;
}

.nav-link.active::after {
  width: 100%;
}

.nav-link.active .link-icon {
  opacity: 1;
  color: #00C4D4;
}

/* ── Auth Buttons ── */
.nav-auth {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-outline-sm {
  padding: 8px 18px;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
}

.btn-outline-sm:hover {
  border-color: #00E5FF;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 229, 255, 0.1);
}

.btn-primary-sm {
  padding: 8px 18px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}

.btn-primary-sm:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 25px rgba(0, 229, 255, 0.3);
}

/* ── Nav User ── */
.nav-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  color: #fff;
  font-weight: 500;
  transition: color 0.3s ease;
}

.user-role {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
}

.logout-btn {
  padding: 8px 18px !important;
}

.logout-btn:hover {
  border-color: #ff6b6b !important;
  color: #ff6b6b !important;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.15) !important;
}

/* ── Mobile Responsive ── */
@media (max-width: 768px) {
  .navbar {
    padding: 12px 16px;
  }

  .navbar.scrolled {
    padding: 10px 16px;
  }

  .hamburger-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 101;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(10, 8, 24, 0.98);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    flex-direction: column;
    padding: 24px 24px 30px;
    gap: 16px;
    border-bottom: 1px solid rgba(0, 229, 255, 0.08);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  }

  .nav-links.mobile-open {
    display: flex;
    animation: slideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .nav-link {
    font-size: 1rem;
    padding: 10px 0;
    width: 100%;
    text-align: left;
    gap: 10px;
  }

  .nav-link::after {
    bottom: 0;
  }

  .link-icon {
    font-size: 1rem;
  }

  .nav-auth {
    flex-direction: column;
    width: 100%;
    gap: 10px;
    margin-top: 8px;
  }

  .nav-auth .btn-outline-sm,
  .nav-auth .btn-primary-sm {
    width: 100%;
    text-align: center;
    justify-content: center;
    padding: 12px 18px;
  }

  .nav-user {
    flex-direction: column;
    width: 100%;
    align-items: flex-start;
    gap: 10px;
    margin-top: 8px;
  }

  .nav-user .btn-outline-sm {
    width: 100%;
    text-align: center;
    justify-content: center;
    padding: 12px 18px;
  }

  .user-name {
    font-size: 1rem;
  }

  .user-role {
    display: none;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 10px 12px;
  }

  .logo-text {
    font-size: 0.9rem;
  }

  .logo-mark {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }

  .hamburger-btn {
    font-size: 1.2rem;
    padding: 6px;
  }

  .nav-links {
    padding: 20px 20px 26px;
  }

  .btn-outline-sm,
  .btn-primary-sm {
    font-size: 0.8rem;
    padding: 10px 14px;
  }
}
</style>