import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'

export const useContractStore = defineStore('contracts', () => {
  const { t } = useI18n()
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

  async function fetchContracts() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get('/owner/contracts')
      contracts.value = data.data?.data || data.data || []
      return { success: true, data: contracts.value }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function createContract(data) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.post('/owner/contracts', data)
      const contract = res.data.data
      contracts.value.unshift(contract)
      return { success: true, data: contract }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updateContract(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.put(`/owner/contracts/${id}`, data)
      const updated = res.data.data
      const index = contracts.value.findIndex(c => c.id === id)
      if (index !== -1) contracts.value[index] = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteContract(id) {
    isLoading.value = true
    error.value = null
    try {
      await api.delete(`/owner/contracts/${id}`)
      contracts.value = contracts.value.filter(c => c.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function recordPayment(contractId, amount) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.post(`/owner/contracts/${contractId}/payments`, { amount })
      const payment = res.data.data
      const contract = contracts.value.find(c => c.id === contractId)
      if (contract) {
        contract.paid_amount = (contract.paid_amount || 0) + amount
        contract.remaining_amount = contract.total_amount - contract.paid_amount
        if (contract.remaining_amount <= 0) {
          contract.status = 'completed'
          contract.remaining_amount = 0
        }
      }
      return { success: true, data: payment }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchContractById(id) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get(`/owner/contracts/${id}`)
      selectedContract.value = data.data
      return { success: true, data: selectedContract.value }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
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
    return t('status.' + status)
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
    fetchContractById,
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
