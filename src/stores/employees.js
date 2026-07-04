import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'

export const useEmployeeStore = defineStore('employees', () => {
  const { t } = useI18n()
  const employees = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const totalEmployees = computed(() => employees.value.length)
  const activeEmployees = computed(() => employees.value.filter(e => e.status === 'active'))
  const inactiveEmployees = computed(() => employees.value.filter(e => e.status === 'inactive'))
  const employeesWithContracts = computed(() => {
    return employees.value.filter(e => e.vehicle_id)
  })
  const employeesWithoutContracts = computed(() => {
    return employees.value.filter(e => !e.vehicle_id)
  })

  async function fetchEmployees() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get('/owner/employees')
      employees.value = data.data || []
      console.log("Employees data : ",employees.value);
      
      return { success: true, data: employees.value }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function extractError(err) {
    const resp = err.response?.data
    if (!resp) return err.message || 'An error occurred'
    if (resp.errors) {
      const messages = Object.values(resp.errors).flat()
      return messages.join(', ')
    }
    return resp.message || 'An error occurred'
  }

  async function createEmployee(data) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.post('/owner/employees', data)
      const employee = res.data.data
      employees.value.unshift(employee)
      return { success: true, data: employee }
    } catch (err) {
      error.value = extractError(err)
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updateEmployee(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.put(`/owner/employees/${id}`, data)
      const updated = res.data.data
      const index = employees.value.findIndex(e => e.id === id)
      if (index !== -1) employees.value[index] = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = extractError(err)
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteEmployee(id) {
    isLoading.value = true
    error.value = null
    try {
      await api.delete(`/owner/employees/${id}`)
      employees.value = employees.value.filter(e => e.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function toggleEmployeeStatus(id) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/owner/employees/${id}/toggle-status`)
      const updated = res.data.data
      const index = employees.value.findIndex(e => e.id === id)
      if (index !== -1) employees.value[index] = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function assignVehicle(employeeId, vehicleId) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.post(`/owner/employees/${employeeId}/assign-vehicle`, { vehicle_id: vehicleId })
      const updated = res.data.data
      const index = employees.value.findIndex(e => e.id === employeeId)
      if (index !== -1) employees.value[index] = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function getEmployee(id) {
    return employees.value.find(e => e.id === id)
  }

  function getEmployeeByEmail(email) {
    return employees.value.find(e => e.email === email)
  }

  function getEmployeeByName(name) {
    return employees.value.find(e => e.name === name)
  }

  function getStatusColor(status) {
    const colors = {
      active: '#00E5FF',
      inactive: '#ff6b6b'
    }
    return colors[status] || 'rgba(255,255,255,0.3)'
  }

  function getStatusLabel(status) {
    return t('status.' + status)
  }

  return {
    employees,
    isLoading,
    error,
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    employeesWithContracts,
    employeesWithoutContracts,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    assignVehicle,
    getEmployee,
    getEmployeeByEmail,
    getEmployeeByName,
    getStatusColor,
    getStatusLabel
  }
}, {
  persist: {
    key: 'employee-store',
    storage: localStorage,
    paths: ['employees']
  }
})
