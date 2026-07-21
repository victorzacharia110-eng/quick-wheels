import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userId = computed(() => user.value?.id || null)
  const userRole = computed(() => user.value?.role || 'client')
  const userNida = computed(() => user.value?.nida_number || '')
  const isOwner = computed(() => user.value?.role === 'owner')
  const isEmployee = computed(() => user.value?.role === 'employee')

  function setUser(userData) {
    user.value = userData
    try { localStorage.setItem('user', JSON.stringify(userData)) } catch (e) {}
  }

  function clearUser() {
    user.value = null
    isInitialized.value = false
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('auth_token')
    } catch (e) {}
  }

  function setToken(token) {
    if (token) { localStorage.setItem('auth_token', token) }
  }

  function rehydrate() {
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('auth_token')
      if (storedUser && storedToken) {
        user.value = JSON.parse(storedUser)
        return true
      }
    } catch (e) {
      localStorage.removeItem('user')
      localStorage.removeItem('auth_token')
    }
    return false
  }

  async function register(userData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data.success) {
        setUser(response.data.data.user)
        setToken(response.data.data.token)
        return { success: true, user: response.data.data.user }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      return { success: false, message: error.value }
    } finally { isLoading.value = false }
  }

  async function login(credentials) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      if (response.data.success) {
        setUser(response.data.data.user)
        setToken(response.data.data.token)
        return { success: true, user: response.data.data.user }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      return { success: false, message: error.value }
    } finally { isLoading.value = false }
  }

  async function logout() {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) { await api.post('/auth/logout') }
      clearUser()
      return { success: true }
    } catch (err) {
      clearUser()
      return { success: false, message: err.response?.data?.message }
    }
  }

  async function fetchUser() {
    isLoading.value = true
    try {
      const response = await api.get('/auth/user')
      if (response.data.success) {
        setUser(response.data.data.user)
        return { success: true }
      }
    } catch (err) {
      if (err.response?.status === 401) clearUser()
      return { success: false }
    } finally { isLoading.value = false }
  }

  async function updateNidaNumber(nidaNumber) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.patch('/auth/update-nida', { nida_number: nidaNumber })
      if (response.data.success) {
        setUser(response.data.data.user)
        return { success: true, user: response.data.data.user }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update NIDA'
      return { success: false, message: error.value }
    } finally { isLoading.value = false }
  }

  async function init() {
    if (isInitialized.value) return
    rehydrate()
    await fetchUser()
    isInitialized.value = true
  }

  return {
    user,
    isLoading,
    error,
    isInitialized,
    isAuthenticated,
    userName,
    userEmail,
    userId,
    userRole,
    userNida,
    isOwner,
    isEmployee,
    setUser,
    clearUser,
    setToken,
    register,
    login,
    logout,
    fetchUser,
    updateNidaNumber,
    init,
    rehydrate
  }
}, {
  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['user']
  }
})