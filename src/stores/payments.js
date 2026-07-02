import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/api'

export const usePaymentStore = defineStore('payments', () => {
  const payments = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const totalPayments = computed(() => payments.value.length)
  const totalAmount = computed(() => payments.value.reduce((sum, p) => sum + p.amount, 0))
  const paidPayments = computed(() => payments.value.filter(p => p.status === 'paid'))
  const pendingPayments = computed(() => payments.value.filter(p => p.status === 'pending'))
  const failedPayments = computed(() => payments.value.filter(p => p.status === 'failed'))

  const totalPaidAmount = computed(() => {
    return paidPayments.value.reduce((sum, p) => sum + p.amount, 0)
  })

  const totalPendingAmount = computed(() => {
    return pendingPayments.value.reduce((sum, p) => sum + p.amount, 0)
  })

  const paymentsByMethod = computed(() => {
    const methods = {}
    payments.value.forEach(p => {
      const method = p.method || 'Cash'
      if (!methods[method]) methods[method] = []
      methods[method].push(p)
    })
    return methods
  })

  const samplePayments = [
    {
      id: 1,
      contract_id: 1,
      driver_name: 'John Mwangi',
      driver_id: 1,
      amount: 45000,
      method: 'Cash',
      status: 'paid',
      date: '2024-06-01',
      notes: 'Weekly payment'
    },
    {
      id: 2,
      contract_id: 1,
      driver_name: 'John Mwangi',
      driver_id: 1,
      amount: 45000,
      method: 'M-Pesa',
      status: 'pending',
      date: '2024-05-25',
      notes: 'Weekly payment'
    },
    {
      id: 3,
      contract_id: 2,
      driver_name: 'Sarah Hassan',
      driver_id: 2,
      amount: 5000,
      method: 'Cash',
      status: 'paid',
      date: '2024-06-01',
      notes: 'Daily payment'
    },
    {
      id: 4,
      contract_id: 2,
      driver_name: 'Sarah Hassan',
      driver_id: 2,
      amount: 5000,
      method: 'M-Pesa',
      status: 'paid',
      date: '2024-05-31',
      notes: 'Daily payment'
    },
    {
      id: 5,
      contract_id: 3,
      driver_name: 'Michael Peter',
      driver_id: 3,
      amount: 120000,
      method: 'Bank Transfer',
      status: 'pending',
      date: '2024-06-02',
      notes: 'Weekly payment'
    }
  ]

  async function fetchPayments() {
    isLoading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      payments.value = samplePayments
      return { success: true, data: payments.value }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function createPayment(data) {
    isLoading.value = true
    error.value = null
    try {
      const newPayment = {
        id: Date.now(),
        ...data,
        status: 'paid',
        date: new Date().toISOString().split('T')[0]
      }
      payments.value.unshift(newPayment)
      return { success: true, data: newPayment }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updatePayment(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const index = payments.value.findIndex(p => p.id === id)
      if (index === -1) return { success: false, message: 'Payment not found' }
      payments.value[index] = { ...payments.value[index], ...data }
      return { success: true, data: payments.value[index] }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function deletePayment(id) {
    isLoading.value = true
    error.value = null
    try {
      payments.value = payments.value.filter(p => p.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function approvePayment(id) {
    isLoading.value = true
    error.value = null
    try {
      const index = payments.value.findIndex(p => p.id === id)
      if (index === -1) return { success: false, message: 'Payment not found' }
      payments.value[index].status = 'paid'
      return { success: true, data: payments.value[index] }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function rejectPayment(id) {
    isLoading.value = true
    error.value = null
    try {
      const index = payments.value.findIndex(p => p.id === id)
      if (index === -1) return { success: false, message: 'Payment not found' }
      payments.value[index].status = 'failed'
      return { success: true, data: payments.value[index] }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  function getPaymentsByContract(contractId) {
    return payments.value.filter(p => p.contract_id === contractId)
  }

  function getPaymentsByDriver(driverId) {
    return payments.value.filter(p => p.driver_id === driverId)
  }

  function getPaymentsByDriverName(driverName) {
    return payments.value.filter(p => p.driver_name === driverName)
  }

  function getPaymentsByStatus(status) {
    return payments.value.filter(p => p.status === status)
  }

  function getPaymentStatusColor(status) {
    const colors = {
      paid: '#00E5FF',
      pending: '#FFD93D',
      failed: '#ff6b6b'
    }
    return colors[status] || 'rgba(255,255,255,0.3)'
  }

  function getPaymentStatusLabel(status) {
    const labels = {
      paid: 'Paid',
      pending: 'Pending',
      failed: 'Failed'
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

  return {
    payments,
    isLoading,
    error,
    totalPayments,
    totalAmount,
    totalPaidAmount,
    totalPendingAmount,
    paidPayments,
    pendingPayments,
    failedPayments,
    paymentsByMethod,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    approvePayment,
    rejectPayment,
    getPaymentsByContract,
    getPaymentsByDriver,
    getPaymentsByDriverName,
    getPaymentsByStatus,
    getPaymentStatusColor,
    getPaymentStatusLabel,
    formatDate
  }
}, {
  persist: {
    key: 'payment-store',
    storage: localStorage,
    paths: ['payments']
  }
})