import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'

export const useVehicleStore = defineStore('vehicles', () => {
  const { t } = useI18n()
  const vehicles = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const activeCategory = ref('All')

  const categories = ['All', 'Motorcycle', 'Bajaji', 'Car', 'SUV']

  const totalVehicles = computed(() => vehicles.value.length)
  const availableVehicles = computed(() => vehicles.value.filter(v => v.status === 'available'))
  const onContractVehicles = computed(() => vehicles.value.filter(v => v.status === 'on_contract'))
  const maintenanceVehicles = computed(() => vehicles.value.filter(v => v.status === 'maintenance'))

  const vehiclesByType = computed(() => {
    const types = {}
    vehicles.value.forEach(v => {
      const type = v.type || 'Other'
      if (!types[type]) types[type] = []
      types[type].push(v)
    })
    return types
  })

  const filteredVehicles = computed(() => {
    if (activeCategory.value === 'All') {
      return vehicles.value
    }
    return vehicles.value.filter(v => v.type === activeCategory.value)
  })

  const categoryIcons = {
    Motorcycle: 'fa-solid fa-motorcycle',
    Bajaji: 'fa-solid fa-truck-front',
    Car: 'fa-solid fa-car',
    SUV: 'fa-solid fa-truck',
    'All': 'fa-solid fa-th-large'
  }

  function getCategoryIcon(cat) {
    return categoryIcons[cat] || 'fa-solid fa-car'
  }

  function setCategory(category) {
    activeCategory.value = category
  }

  async function fetchVehicles() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get('/vehicles')
      vehicles.value = data.data || []
      return { success: true, data: vehicles.value }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function createVehicle(data) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.post('/owner/vehicles', data)
      const vehicle = res.data.data
      vehicles.value.unshift(vehicle)
      return { success: true, data: vehicle }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updateVehicle(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.put(`/owner/vehicles/${id}`, data)
      const updated = res.data.data
      const index = vehicles.value.findIndex(v => v.id === id)
      if (index !== -1) vehicles.value[index] = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteVehicle(id) {
    isLoading.value = true
    error.value = null
    try {
      await api.delete(`/owner/vehicles/${id}`)
      vehicles.value = vehicles.value.filter(v => v.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updateVehicleStatus(id, status) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.patch(`/owner/vehicles/${id}/status`, { status })
      const updated = res.data.data
      const index = vehicles.value.findIndex(v => v.id === id)
      if (index !== -1) vehicles.value[index] = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function getVehicle(id) {
    return vehicles.value.find(v => v.id === id)
  }

  function getVehiclesByType(type) {
    return vehicles.value.filter(v => v.type === type)
  }

  function getVehiclesByStatus(status) {
    return vehicles.value.filter(v => v.status === status)
  }

  function getStatusColor(status) {
    const colors = {
      available: '#00E5FF',
      on_contract: '#FFD93D',
      maintenance: '#ff6b6b'
    }
    return colors[status] || 'rgba(255,255,255,0.3)'
  }

  function getStatusLabel(status) {
    return t('status.' + status)
  }

  function getTypeIcon(type) {
    const icons = {
      Motorcycle: 'fa-solid fa-motorcycle',
      Bajaji: 'fa-solid fa-truck-front',
      Car: 'fa-solid fa-car',
      SUV: 'fa-solid fa-truck'
    }
    return icons[type] || 'fa-solid fa-car'
  }

  return {
    vehicles,
    isLoading,
    error,
    activeCategory,
    categories,
    totalVehicles,
    availableVehicles,
    onContractVehicles,
    maintenanceVehicles,
    vehiclesByType,
    filteredVehicles,
    getCategoryIcon,
    setCategory,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehicleStatus,
    getVehicle,
    getVehiclesByType,
    getVehiclesByStatus,
    getStatusColor,
    getStatusLabel,
    getTypeIcon
  }
}, {
  persist: {
    key: 'vehicle-store',
    storage: localStorage,
    paths: ['activeCategory']
  }
})
