<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <div class="auth-logo">
          <span class="logo-mark">QW</span>
          <span class="logo-text">Quick-Wheels</span>
        </div>
        <h1>Create Account</h1>
        <p>Join Quick-Wheels today</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form" novalidate>
        <div v-if="error" class="error-msg">
          <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
          {{ error }}
        </div>

        <div class="form-grid">
          <!-- Full Name -->
          <div class="form-group" :class="{ 'has-error': errors.name }">
            <label for="name">Full Name <span class="required">*</span></label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="John Doe"
              required
              class="form-input"
              :class="{ 'input-error': errors.name }"
              @blur="validateField('name')"
              @input="clearError('name')"
            />
            <span v-if="errors.name" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ errors.name }}
            </span>
          </div>

          <!-- Email -->
          <div class="form-group" :class="{ 'has-error': errors.email }">
            <label for="email">Email Address <span class="required">*</span></label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="john@example.com"
              required
              class="form-input"
              :class="{ 'input-error': errors.email }"
              @blur="validateField('email')"
              @input="clearError('email')"
            />
            <span v-if="errors.email" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ errors.email }}
            </span>
          </div>

          <!-- Phone -->
          <div class="form-group" :class="{ 'has-error': errors.phone_number }">
            <label for="phone">Phone Number <span class="required">*</span></label>
            <input
              id="phone"
              v-model="form.phone_number"
              type="tel"
              placeholder="+255 712 345 678"
              required
              class="form-input"
              :class="{ 'input-error': errors.phone_number }"
              @blur="validateField('phone_number')"
              @input="clearError('phone_number')"
            />
            <span v-if="errors.phone_number" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ errors.phone_number }}
            </span>
          </div>

          <!-- NIDA Number -->
          <div class="form-group" :class="{ 'has-error': errors.nida_number }">
            <label for="nida">NIDA Number <span class="required">*</span></label>
            <input
              id="nida"
              v-model="form.nida_number"
              type="text"
              placeholder="Enter your NIDA number"
              required
              class="form-input"
              :class="{ 'input-error': errors.nida_number }"
              @blur="validateField('nida_number')"
              @input="clearError('nida_number')"
            />
            <span v-if="errors.nida_number" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ errors.nida_number }}
            </span>
            <span class="form-hint">e.g., 123456789012345 (15 digits)</span>
          </div>

          <!-- Password -->
          <div class="form-group" :class="{ 'has-error': errors.password }">
            <label for="password">Password <span class="required">*</span></label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Min 8 characters"
              required
              class="form-input"
              :class="{ 'input-error': errors.password }"
              @blur="validateField('password')"
              @input="clearError('password')"
            />
            <span v-if="errors.password" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ errors.password }}
            </span>
            <div class="password-requirements">
              <span :class="{ met: form.password.length >= 8 }">
                <font-awesome-icon :icon="form.password.length >= 8 ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'" size="xs" />
                At least 8 characters
              </span>
              <span :class="{ met: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) }">
                <font-awesome-icon :icon="/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'" size="xs" />
                Uppercase & lowercase
              </span>
              <span :class="{ met: /[0-9]/.test(form.password) }">
                <font-awesome-icon :icon="/[0-9]/.test(form.password) ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'" size="xs" />
                At least 1 number
              </span>
              <span :class="{ met: /[^A-Za-z0-9]/.test(form.password) }">
                <font-awesome-icon :icon="/[^A-Za-z0-9]/.test(form.password) ? 'fa-regular fa-circle-check' : 'fa-regular fa-circle'" size="xs" />
                At least 1 special character
              </span>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="form-group" :class="{ 'has-error': errors.password_confirmation }">
            <label for="password_confirmation">Confirm Password <span class="required">*</span></label>
            <input
              id="password_confirmation"
              v-model="form.password_confirmation"
              type="password"
              placeholder="Confirm your password"
              required
              class="form-input"
              :class="{ 'input-error': errors.password_confirmation }"
              @blur="validateField('password_confirmation')"
              @input="clearError('password_confirmation')"
            />
            <span v-if="errors.password_confirmation" class="field-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" size="xs" />
              {{ errors.password_confirmation }}
            </span>
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading || !isFormValid">
          <span v-if="isLoading"><span class="spinner-sm"></span> Creating account...</span>
          <span v-else>
            <font-awesome-icon icon="fa-solid fa-user-plus" />
            Create Account
          </span>
        </button>

        <p class="auth-switch">
          Already have an account? <RouterLink to="/auth/login">Sign In</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  phone_number: '',
  nida_number: '',
  password: '',
  password_confirmation: ''
})

const errors = ref({})
const isLoading = ref(false)
const error = ref(null)
const touched = ref({})

// ── Validation Rules ────────────────────────────────────────────────────
const validationRules = {
  name: [
    { required: true, message: 'Full name is required' },
    { min: 3, message: 'Name must be at least 3 characters' },
    { max: 100, message: 'Name cannot exceed 100 characters' },
    { pattern: /^[a-zA-Z\s\-.'"]+$/, message: 'Name contains invalid characters' }
  ],
  email: [
    { required: true, message: 'Email is required' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
  ],
  phone_number: [
    { required: true, message: 'Phone number is required' },
    { pattern: /^(\+?255|0)[0-9]{9}$/, message: 'Enter a valid Tanzanian phone number (e.g., +255712345678 or 0712345678)' }
  ],
  nida_number: [
    { required: true, message: 'NIDA number is required' },
    { pattern: /^[0-9]{15}$/, message: 'NIDA number must be exactly 15 digits' },
    { pattern: /^(?!0+$)[0-9]+$/, message: 'NIDA number cannot be all zeros' }
  ],
  password: [
    { required: true, message: 'Password is required' },
    { min: 8, message: 'Password must be at least 8 characters' },
    { pattern: /[A-Z]/, message: 'Password must contain at least one uppercase letter' },
    { pattern: /[a-z]/, message: 'Password must contain at least one lowercase letter' },
    { pattern: /[0-9]/, message: 'Password must contain at least one number' },
    { pattern: /[^A-Za-z0-9]/, message: 'Password must contain at least one special character' }
  ],
  password_confirmation: [
    { required: true, message: 'Please confirm your password' },
    { match: 'password', message: 'Passwords do not match' }
  ]
}

// ── Computed ─────────────────────────────────────────────────────────────
const isFormValid = computed(() => {
  return Object.keys(errors.value).length === 0 && 
    form.name && form.email && form.phone_number && 
    form.nida_number && form.password && form.password_confirmation
})

// ── Validation Functions ────────────────────────────────────────────────
function validateField(field) {
  touched.value[field] = true
  const rules = validationRules[field]
  if (!rules) return

  const value = form[field]
  
  for (const rule of rules) {
    if (rule.required && (!value || value.trim() === '')) {
      errors.value[field] = rule.message
      return
    }
    if (rule.min && value.length < rule.min) {
      errors.value[field] = rule.message
      return
    }
    if (rule.max && value.length > rule.max) {
      errors.value[field] = rule.message
      return
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.value[field] = rule.message
      return
    }
    if (rule.match && form[rule.match] !== value) {
      errors.value[field] = rule.message
      return
    }
  }
  
  delete errors.value[field]
}

function clearError(field) {
  delete errors.value[field]
}

function validateAll() {
  const fields = ['name', 'email', 'phone_number', 'nida_number', 'password', 'password_confirmation']
  fields.forEach(field => validateField(field))
  return Object.keys(errors.value).length === 0
}

// ── Submit Handler ──────────────────────────────────────────────────────
async function handleRegister() {
  // Clear previous errors
  error.value = null
  
  // Validate all fields
  const isValid = validateAll()
  if (!isValid) {
    // Focus first error field
    const firstError = Object.keys(errors.value)[0]
    if (firstError) {
      const el = document.getElementById(firstError)
      if (el) el.focus()
    }
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.register(form)
    if (result.success) {
      const role = authStore.userRole
      if (role === 'owner') router.push('/owner')
      else if (role === 'employee') router.push('/employee')
      else router.push('/')
    } else {
      error.value = result.message || 'Registration failed'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed'
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
  max-width: 600px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
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
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
}

.required {
  color: #ff6b6b;
}

.form-hint {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.25);
  margin-top: 2px;
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

.form-input.input-error {
  border-color: rgba(255, 107, 107, 0.4);
}

.form-input.input-error:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.has-error label {
  color: #ff6b6b;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #ff6b6b;
  margin-top: 2px;
}

.field-error svg {
  flex-shrink: 0;
}

.password-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 4px;
}

.password-requirements span {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.password-requirements span.met {
  color: #00E5FF;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 0, 0, 0.08);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 0.9rem;
  color: #ff6b6b;
  grid-column: 1 / -1;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  margin-top: 4px;
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
  margin-top: 4px;
}

.auth-switch a {
  color: #00E5FF;
  text-decoration: none;
  font-weight: 600;
}

.auth-switch a:hover {
  text-decoration: underline;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .auth-container {
    max-width: 100%;
    padding: 32px 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .error-msg {
    grid-column: 1;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 24px 16px;
  }

  .auth-header h1 {
    font-size: 1.3rem;
  }

  .logo-text {
    font-size: 1rem;
  }

  .logo-mark {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }

  .form-input {
    padding: 10px 14px;
    font-size: 0.9rem;
  }

  .btn-primary {
    padding: 12px 20px;
    font-size: 0.9rem;
  }

  .password-requirements {
    flex-direction: column;
    gap: 2px;
  }
}

@media (min-width: 769px) {
  .auth-container {
    padding: 48px;
  }

  .auth-form {
    gap: 24px;
  }

  .form-grid {
    gap: 20px;
  }
}
</style>