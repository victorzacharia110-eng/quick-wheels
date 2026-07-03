import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'

export const usePaymentStore = defineStore('payments', () => {
  const { t } = useI18n()
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

  async function fetchPayments() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get('/owner/payments')
      payments.value = data.data || []
      return { success: true, data: payments.value }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function createPayment(data) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.post('/owner/payments', data)
      const payment = res.data.data
      payments.value.unshift(payment)
      return { success: true, data: payment }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updatePayment(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.put(`/payments/${id}`, data)
      const updated = res.data.data
      const index = payments.value.findIndex(p => p.id === id)
      if (index !== -1) payments.value[index] = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deletePayment(id) {
    isLoading.value = true
    error.value = null
    try {
      await api.delete(`/payments/${id}`)
      payments.value = payments.value.filter(p => p.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function approvePayment(id) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.post(`/payments/${id}/approve`)
      const updated = res.data.data
      const index = payments.value.findIndex(p => p.id === id)
      if (index !== -1) payments.value[index] = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function rejectPayment(id) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.post(`/payments/${id}/reject`)
      const updated = res.data.data
      const index = payments.value.findIndex(p => p.id === id)
      if (index !== -1) payments.value[index] = updated
      return { success: true, data: updated }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
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
