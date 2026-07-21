import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/api'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const reports = ref([])
  const currentReport = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const pagination = ref({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const dashboardStats = ref(null)

  const totalReports = computed(() => dashboardStats.value?.stats?.total ?? reports.value.length)
  const pendingReports = computed(() => dashboardStats.value?.stats?.pending ?? reports.value.filter(r => r.status === 'pending').length)
  const inProgressReports = computed(() => dashboardStats.value?.stats?.in_progress ?? reports.value.filter(r => r.status === 'in_progress').length)
  const completedReports = computed(() => dashboardStats.value?.stats?.completed ?? reports.value.filter(r => r.status === 'completed').length)
  const criticalReports = computed(() => dashboardStats.value?.stats?.critical ?? 0)

  async function fetchReports(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get('/technician/maintenance', { params })
      reports.value = data.data?.data || data.data || []
      pagination.value = data.data?.pagination || pagination.value
      return { success: true, data: reports.value }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReport(id) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get(`/technician/maintenance/${id}`)
      currentReport.value = data.data
      return { success: true, data: currentReport.value }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function createReport(reportData) {
    error.value = null
    try {
      const { data } = await api.post('/technician/maintenance', reportData)
      reports.value.unshift(data.data)
      return { success: true, data: data.data }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  async function updateReport(id, reportData) {
    error.value = null
    try {
      const { data } = await api.put(`/technician/maintenance/${id}`, reportData)
      const updated = data.data
      const index = reports.value.findIndex(r => r.id === id)
      if (index !== -1) reports.value[index] = updated
      if (currentReport.value?.id === id) currentReport.value = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  async function completeReport(id, payload = {}) {
    error.value = null
    try {
      const { data } = await api.post(`/technician/maintenance/${id}/complete`, payload)
      const updated = data.data
      const index = reports.value.findIndex(r => r.id === id)
      if (index !== -1) reports.value[index] = updated
      if (currentReport.value?.id === id) currentReport.value = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  async function addItem(maintenanceId, itemData) {
    error.value = null
    try {
      const { data } = await api.post(`/technician/maintenance/${maintenanceId}/items`, itemData)
      if (currentReport.value?.id === maintenanceId) {
        currentReport.value.items.push(data.data)
      }
      return { success: true, data: data.data }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  async function updateItem(maintenanceId, itemId, itemData) {
    error.value = null
    try {
      const { data } = await api.put(`/technician/maintenance/${maintenanceId}/items/${itemId}`, itemData)
      if (currentReport.value?.id === maintenanceId) {
        const idx = currentReport.value.items.findIndex(i => i.id === itemId)
        if (idx !== -1) currentReport.value.items[idx] = data.data
      }
      return { success: true, data: data.data }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  async function deleteItem(maintenanceId, itemId) {
    error.value = null
    try {
      await api.delete(`/technician/maintenance/${maintenanceId}/items/${itemId}`)
      if (currentReport.value?.id === maintenanceId) {
        currentReport.value.items = currentReport.value.items.filter(i => i.id !== itemId)
      }
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  async function fetchDashboard() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get('/technician/dashboard')
      dashboardStats.value = data.data
      return { success: true, data: data.data }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function getStatusColor(status) {
    const colors = {
      pending: '#FFD93D',
      in_progress: '#00E5FF',
      completed: '#4ADE80',
      cancelled: '#ff6b6b',
    }
    return colors[status] || 'rgba(255,255,255,0.3)'
  }

  function getPriorityColor(priority) {
    const colors = {
      low: '#4ADE80',
      medium: '#FFD93D',
      high: '#fb923c',
      critical: '#ff6b6b',
    }
    return colors[priority] || 'rgba(255,255,255,0.3)'
  }

  function formatDate(date) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  function formatCurrency(amount) {
    return 'TZS ' + Number(amount || 0).toLocaleString()
  }

  return {
    reports,
    currentReport,
    isLoading,
    error,
    pagination,
    dashboardStats,
    totalReports,
    pendingReports,
    inProgressReports,
    completedReports,
    criticalReports,
    fetchReports,
    fetchReport,
    createReport,
    updateReport,
    completeReport,
    addItem,
    updateItem,
    deleteItem,
    fetchDashboard,
    getStatusColor,
    getPriorityColor,
    formatDate,
    formatCurrency,
  }
})
