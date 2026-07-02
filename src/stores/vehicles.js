import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/api'

export const useVehicleStore = defineStore('vehicles', () => {
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

  const sampleVehicles = [
    {
      id: 1,
      name: 'Honda CBR 500R',
      type: 'Motorcycle',
      registration: 'T 123 ABC',
      year: 2024,
      price: 45000,
      status: 'on_contract',
      description: 'Sporty motorcycle perfect for city commuting and weekend adventures.',
      image: null,
      tags: ['Sport', '500cc', 'Fuel Efficient'],
      created_at: '2024-01-01'
    },
    {
      id: 2,
      name: 'Bajaji RE 3-Wheeler',
      type: 'Bajaji',
      registration: 'T 456 DEF',
      year: 2023,
      price: 35000,
      status: 'on_contract',
      description: 'Versatile tri-wheel vehicle ideal for urban transport and deliveries.',
      image: null,
      tags: ['Cargo', 'City Transport', 'Economical'],
      created_at: '2024-01-15'
    },
    {
      id: 3,
      name: 'Toyota Rav4',
      type: 'Car',
      registration: 'T 789 GHI',
      year: 2023,
      price: 120000,
      status: 'available',
      description: 'Spacious SUV perfect for family trips and business travel.',
      image: null,
      tags: ['SUV', 'Family', 'AC'],
      created_at: '2024-02-01'
    },
    {
      id: 4,
      name: 'Bajaj Qute',
      type: 'Bajaji',
      registration: 'T 321 JKL',
      year: 2024,
      price: 50000,
      status: 'available',
      description: 'Compact four-wheeler perfect for city driving.',
      image: null,
      tags: ['Compact', 'City', 'Economical'],
      created_at: '2024-03-01'
    },
    {
      id: 5,
      name: 'Mercedes E-Class',
      type: 'Car',
      registration: 'T 654 MNO',
      year: 2023,
      price: 250000,
      status: 'available',
      description: 'Luxury sedan for executive travel and special occasions.',
      image: null,
      tags: ['Luxury', 'Executive', 'Comfort'],
      created_at: '2024-04-01'
    },
    {
      id: 6,
      name: 'Honda Activa',
      type: 'Motorcycle',
      registration: 'T 987 PQR',
      year: 2024,
      price: 25000,
      status: 'available',
      description: 'Scooter perfect for daily commuting and quick errands.',
      image: null,
      tags: ['Scooter', 'City', 'Easy Ride'],
      created_at: '2024-05-01'
    }
  ]

  async function fetchVehicles() {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      vehicles.value = sampleVehicles
      return { success: true, data: vehicles.value }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function createVehicle(data) {
    isLoading.value = true
    error.value = null
    try {
      const newVehicle = {
        id: Date.now(),
        ...data,
        status: 'available',
        created_at: new Date().toISOString().split('T')[0]
      }
      vehicles.value.unshift(newVehicle)
      return { success: true, data: newVehicle }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateVehicle(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const index = vehicles.value.findIndex(v => v.id === id)
      if (index === -1) return { success: false, message: 'Vehicle not found' }
      vehicles.value[index] = { ...vehicles.value[index], ...data }
      return { success: true, data: vehicles.value[index] }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteVehicle(id) {
    isLoading.value = true
    error.value = null
    try {
      vehicles.value = vehicles.value.filter(v => v.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateVehicleStatus(id, status) {
    isLoading.value = true
    error.value = null
    try {
      const index = vehicles.value.findIndex(v => v.id === id)
      if (index === -1) return { success: false, message: 'Vehicle not found' }
      vehicles.value[index].status = status
      return { success: true, data: vehicles.value[index] }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
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
    const labels = {
      available: 'Available',
      on_contract: 'On Contract',
      maintenance: 'Maintenance'
    }
    return labels[status] || status
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
    paths: ['vehicles', 'activeCategory']
  }
})