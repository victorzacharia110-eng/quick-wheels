import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/composables/api'

export const useMessageStore = defineStore('messages', () => {
  const conversations = ref([])
  const currentChat = ref([])
  const contacts = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const activeContactId = ref(null)
  let pollInterval = null

  const activeContact = computed(() =>
    contacts.value.find(c => c.id === activeContactId.value)
  )

  async function fetchConversations() {
    isLoading.value = true
    try {
      const { data } = await api.get('/messages')
      conversations.value = data.data || []
    } catch (_) {}
    isLoading.value = false
  }

  async function fetchMessages(userId) {
    activeContactId.value = userId
    try {
      const { data } = await api.get('/messages', { params: { with_user: userId } })
      currentChat.value = data.data || []
    } catch (_) {}
  }

  async function sendMessage(receiverId, body) {
    const { data } = await api.post('/messages', { receiver_id: receiverId, body })
    currentChat.value.push(data.data)
    return data.data
  }

  async function fetchUnreadCount() {
    try {
      const { data } = await api.get('/messages/unread-count')
      unreadCount.value = data.data?.count || 0
    } catch (_) {}
  }

  async function fetchContacts() {
    try {
      const { data } = await api.get('/messages/contacts')
      contacts.value = data.data || []
    } catch (_) {}
  }

  function startPolling() {
    stopPolling()
    fetchUnreadCount()
    pollInterval = setInterval(() => {
      fetchUnreadCount()
      if (activeContactId.value) {
        fetchMessages(activeContactId.value)
      }
    }, 5000)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  return {
    conversations, currentChat, contacts, unreadCount,
    isLoading, activeContactId, activeContact,
    fetchConversations, fetchMessages, sendMessage,
    fetchUnreadCount, fetchContacts, startPolling, stopPolling,
  }
})
