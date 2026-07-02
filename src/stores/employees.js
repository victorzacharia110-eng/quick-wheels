import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/api'

export const useEmployeeStore = defineStore('employees', () => {
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

  const sampleEmployees = [
    {
      id: 1,
      name: 'John Mwangi',
      phone: '+255 712 345 678',
      email: 'john@example.com',
      address: 'Dar es Salaam',
      nida_number: '123456789012345',
      license_number: 'DL123456',
      status: 'active',
      joined_date: '2024-01-15',
      vehicle_id: 1,
      vehicle_name: 'Honda CBR 500R'
    },
    {
      id: 2,
      name: 'Sarah Hassan',
      phone: '+255 765 432 123',
      email: 'sarah@example.com',
      address: 'Dar es Salaam',
      nida_number: '234567890123456',
      license_number: 'DL789012',
      status: 'active',
      joined_date: '2024-02-01',
      vehicle_id: 2,
      vehicle_name: 'Bajaji RE 3-Wheeler'
    },
    {
      id: 3,
      name: 'Michael Peter',
      phone: '+255 698 765 432',
      email: 'michael@example.com',
      address: 'Dar es Salaam',
      nida_number: '345678901234567',
      license_number: 'DL345678',
      status: 'active',
      joined_date: '2024-03-01',
      vehicle_id: 3,
      vehicle_name: 'Toyota Rav4'
    },
    {
      id: 4,
      name: 'Grace Kimani',
      phone: '+255 756 789 012',
      email: 'grace@example.com',
      address: 'Dar es Salaam',
      nida_number: '456789012345678',
      license_number: 'DL901234',
      status: 'inactive',
      joined_date: '2023-05-01',
      vehicle_id: null,
      vehicle_name: null
    }
  ]

  async function fetchEmployees() {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      employees.value = sampleEmployees
      return { success: true, data: employees.value }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function createEmployee(data) {
    isLoading.value = true
    error.value = null
    try {
      const newEmployee = {
        id: Date.now(),
        ...data,
        status: 'active',
        joined_date: new Date().toISOString().split('T')[0]
      }
      employees.value.unshift(newEmployee)
      return { success: true, data: newEmployee }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateEmployee(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const index = employees.value.findIndex(e => e.id === id)
      if (index === -1) return { success: false, message: 'Employee not found' }
      employees.value[index] = { ...employees.value[index], ...data }
      return { success: true, data: employees.value[index] }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteEmployee(id) {
    isLoading.value = true
    error.value = null
    try {
      employees.value = employees.value.filter(e => e.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function toggleEmployeeStatus(id) {
    isLoading.value = true
    error.value = null
    try {
      const index = employees.value.findIndex(e => e.id === id)
      if (index === -1) return { success: false, message: 'Employee not found' }
      employees.value[index].status = employees.value[index].status === 'active' ? 'inactive' : 'active'
      return { success: true, data: employees.value[index] }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function assignVehicle(employeeId, vehicleId) {
    isLoading.value = true
    error.value = null
    try {
      const employee = employees.value.find(e => e.id === employeeId)
      if (!employee) return { success: false, message: 'Employee not found' }
      
      employee.vehicle_id = vehicleId
      // Vehicle name would be fetched from vehicle store
      return { success: true, data: employee }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
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
    const labels = {
      active: 'Active',
      inactive: 'Inactive'
    }
    return labels[status] || status
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