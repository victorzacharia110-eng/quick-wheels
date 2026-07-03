import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/composables/api'

export const useSiteContentStore = defineStore('siteContent', () => {
  const contents = ref({})
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchContents() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get('/site-content')
      contents.value = data.data || {}
      return { success: true, data: contents.value }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updateContents(updates) {
    isLoading.value = true
    error.value = null
    try {
      await api.put('/owner/site-content', { contents: updates })
      await fetchContents()
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    contents,
    isLoading,
    error,
    fetchContents,
    updateContents
  }
})
