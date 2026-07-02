import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/api'

export const useContractStore = defineStore('contracts', () => {
  const contracts = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const selectedContract = ref(null)

  const totalContracts = computed(() => contracts.value.length)
  const activeContracts = computed(() => contracts.value.filter(c => c.status === 'active'))
  const completedContracts = computed(() => contracts.value.filter(c => c.status === 'completed'))
  const pendingContracts = computed(() => contracts.value.filter(c => c.status === 'pending'))
  const expiredContracts = computed(() => contracts.value.filter(c => c.status === 'expired'))
  const cancelledContracts = computed(() => contracts.value.filter(c => c.status === 'cancelled'))
  
  const hirePurchaseContracts = computed(() => contracts.value.filter(c => c.contract_type === 'hire_purchase'))
  const rentalContracts = computed(() => contracts.value.filter(c => c.contract_type === 'rental'))

  const totalAmountOwed = computed(() => {
    return contracts.value.reduce((sum, c) => sum + (c.remaining_amount || 0), 0)
  })

  // Sample data for demo
  const sampleContracts = [
    {
      id: 1,
      contract_number: 'CT-2024-001',
      driver_id: 1,
      driver_name: 'John Mwangi',
      driver_email: 'john@example.com',
      driver_phone: '+255 712 345 678',
      vehicle_id: 1,
      vehicle_name: 'Honda CBR 500R',
      vehicle_type: 'Motorcycle',
      vehicle_registration: 'T 123 ABC',
      contract_type: 'hire_purchase',
      payment_frequency: 'weekly',
      start_date: '2024-01-15',
      end_date: '2024-12-15',
      weekly_amount: 45000,
      daily_amount: 6500,
      total_amount: 1950000,
      paid_amount: 780000,
      remaining_amount: 1170000,
      deposit: 200000,
      status: 'active',
      notes: 'Regular maintenance included',
      created_at: '2024-01-15',
      updated_at: '2024-06-01'
    },
    {
      id: 2,
      contract_number: 'CT-2024-002',
      driver_id: 2,
      driver_name: 'Sarah Hassan',
      driver_email: 'sarah@example.com',
      driver_phone: '+255 765 432 123',
      vehicle_id: 2,
      vehicle_name: 'Bajaji RE 3-Wheeler',
      vehicle_type: 'Bajaji',
      vehicle_registration: 'T 456 DEF',
      contract_type: 'hire_purchase',
      payment_frequency: 'daily',
      start_date: '2024-02-01',
      end_date: '2025-02-01',
      weekly_amount: 35000,
      daily_amount: 5000,
      total_amount: 1825000,
      paid_amount: 450000,
      remaining_amount: 1375000,
      deposit: 150000,
      status: 'active',
      notes: 'Delivery vehicle',
      created_at: '2024-02-01',
      updated_at: '2024-06-01'
    },
    {
      id: 3,
      contract_number: 'CT-2024-003',
      driver_id: 3,
      driver_name: 'Michael Peter',
      driver_email: 'michael@example.com',
      driver_phone: '+255 698 765 432',
      vehicle_id: 3,
      vehicle_name: 'Toyota Rav4',
      vehicle_type: 'Car',
      vehicle_registration: 'T 789 GHI',
      contract_type: 'rental',
      payment_frequency: 'weekly',
      start_date: '2024-03-01',
      end_date: '2024-09-01',
      weekly_amount: 120000,
      daily_amount: 0,
      total_amount: 3120000,
      paid_amount: 960000,
      remaining_amount: 2160000,
      deposit: 500000,
      status: 'pending',
      notes: 'Family vehicle',
      created_at: '2024-03-01',
      updated_at: '2024-06-01'
    },
    {
      id: 4,
      contract_number: 'CT-2023-004',
      driver_id: 4,
      driver_name: 'Grace Kimani',
      driver_email: 'grace@example.com',
      driver_phone: '+255 756 789 012',
      vehicle_id: 4,
      vehicle_name: 'Honda Activa',
      vehicle_type: 'Motorcycle',
      vehicle_registration: 'T 321 JKL',
      contract_type: 'hire_purchase',
      payment_frequency: 'weekly',
      start_date: '2023-05-01',
      end_date: '2023-11-01',
      weekly_amount: 25000,
      daily_amount: 0,
      total_amount: 650000,
      paid_amount: 650000,
      remaining_amount: 0,
      deposit: 100000,
      status: 'completed',
      notes: 'Daily commute',
      created_at: '2023-05-01',
      updated_at: '2023-11-01'
    }
  ]

  async function fetchContracts() {
    isLoading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      contracts.value = sampleContracts
      return { success: true, data: contracts.value }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function createContract(data) {
    isLoading.value = true
    error.value = null
    try {
      const newContract = {
        id: Date.now(),
        ...data,
        contract_number: `CT-${new Date().getFullYear()}-${String(contracts.value.length + 1).padStart(3, '0')}`,
        status: 'active',
        paid_amount: 0,
        remaining_amount: data.total_amount,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      }
      contracts.value.unshift(newContract)
      return { success: true, data: newContract }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateContract(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const index = contracts.value.findIndex(c => c.id === id)
      if (index === -1) return { success: false, message: 'Contract not found' }
      contracts.value[index] = { 
        ...contracts.value[index], 
        ...data, 
        updated_at: new Date().toISOString().split('T')[0] 
      }
      return { success: true, data: contracts.value[index] }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteContract(id) {
    isLoading.value = true
    error.value = null
    try {
      contracts.value = contracts.value.filter(c => c.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function recordPayment(contractId, amount) {
    isLoading.value = true
    error.value = null
    try {
      const contract = contracts.value.find(c => c.id === contractId)
      if (!contract) return { success: false, message: 'Contract not found' }
      
      contract.paid_amount = (contract.paid_amount || 0) + amount
      contract.remaining_amount = contract.total_amount - contract.paid_amount
      
      if (contract.remaining_amount <= 0) {
        contract.status = 'completed'
        contract.remaining_amount = 0
      }
      
      return { success: true, data: contract }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  function getContract(id) {
    return contracts.value.find(c => c.id === id)
  }

  function getContractsByDriver(driverId) {
    return contracts.value.filter(c => c.driver_id === driverId)
  }

  function getContractByDriverName(driverName) {
    return contracts.value.find(c => c.driver_name === driverName)
  }

  function getStatusColor(status) {
    const colors = {
      active: '#00E5FF',
      pending: '#FFD93D',
      completed: '#4ADE80',
      expired: '#ff6b6b',
      cancelled: '#ff6b6b'
    }
    return colors[status] || 'rgba(255,255,255,0.3)'
  }

  function getStatusLabel(status) {
    const labels = {
      active: 'Active',
      pending: 'Pending',
      completed: 'Completed',
      expired: 'Expired',
      cancelled: 'Cancelled'
    }
    return labels[status] || status
  }

  function formatDate(date) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function getProgress(contract) {
    if (!contract.total_amount || contract.total_amount === 0) return 0
    return Math.round((contract.paid_amount / contract.total_amount) * 100)
  }

  function getDaysRemaining(endDate) {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return {
    contracts,
    isLoading,
    error,
    selectedContract,
    totalContracts,
    activeContracts,
    completedContracts,
    pendingContracts,
    expiredContracts,
    cancelledContracts,
    hirePurchaseContracts,
    rentalContracts,
    totalAmountOwed,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    recordPayment,
    getContract,
    getContractsByDriver,
    getContractByDriverName,
    getStatusColor,
    getStatusLabel,
    formatDate,
    getProgress,
    getDaysRemaining
  }
}, {
  persist: {
    key: 'contract-store',
    storage: localStorage,
    paths: ['contracts']
  }
})