<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <div class="auth-logo">
          <span class="logo-mark">QW</span>
          <span class="logo-text">Quick-Wheels</span>
        </div>
        <h1>{{ $t('auth.welcomeBack') }}</h1>
        <p>{{ $t('auth.signInSub') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div v-if="error" class="error-msg">
          <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
          {{ error }}
        </div>

        <div class="form-group">
          <label for="email">{{ $t('auth.email') }}</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="john@example.com"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">{{ $t('auth.password') }}</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.passwordPlaceholder')"
              required
              class="form-input"
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword" tabindex="-1">
              <font-awesome-icon :icon="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'" />
            </button>
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading"><span class="spinner-sm"></span> {{ $t('auth.signingIn') }}</span>
          <span v-else>
            <font-awesome-icon icon="fa-solid fa-arrow-right-to-bracket" />
            {{ $t('auth.signIn') }}
          </span>
        </button>

        <p class="auth-switch">
          {{ $t('auth.noAccount') }} <RouterLink to="/auth/register">{{ $t('nav.register') }}</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const error = ref(null)
const showPassword = ref(false)

async function handleLogin() {
  isLoading.value = true
  error.value = null

  try {
    const result = await authStore.login(form)
    if (result.success) {
      const role = authStore.userRole
      if (role === 'owner') router.push('/owner')
      else if (role === 'employee') router.push('/employee')
      else if (role === 'customer') router.push('/customer')
      else if (role === 'superadmin') router.push('/superadmin')
      else router.push('/')
    } else {
      error.value = result.message || t('auth.loginFailed')
    }
  } catch (err) {
    error.value = err.response?.data?.message || t('auth.loginFailed')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0818;
  padding: 24px;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}

.logo-mark {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1e1b5e, #00c4d4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Syne", sans-serif;
  font-weight: 800;
  font-size: 0.9rem;
  color: #fff;
}

.logo-text {
  font-family: "Syne", sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  color: #fff;
}

.auth-header h1 {
  font-family: "Syne", sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}

.auth-header p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}

.form-input:focus {
  border-color: rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.06);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.password-wrapper {
  position: relative;
}

.password-wrapper .form-input {
  padding-right: 44px;
}

.password-toggle {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  padding: 8px;
  font-size: 1rem;
  transition: color 0.2s;
  line-height: 1;
}

.password-toggle:hover {
  color: rgba(255, 255, 255, 0.7);
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 0, 0, 0.08);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 0.9rem;
  color: #ff6b6b;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 229, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary svg {
  font-size: 1rem;
}

.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(10, 8, 24, 0.2);
  border-top-color: #0a0818;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-switch {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  margin-top: 8px;
}

.auth-switch a {
  color: #00E5FF;
  text-decoration: none;
  font-weight: 600;
}

.auth-switch a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 24px;
  }

  .btn-primary {
    padding: 12px 20px;
    font-size: 0.9rem;
  }
}
</style>
