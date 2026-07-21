<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessageStore } from '@/stores/messages'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const messageStore = useMessageStore()
const authStore = useAuthStore()

const newMessage = ref('')
const chatBody = ref(null)
const sending = ref(false)

onMounted(async () => {
  await messageStore.fetchContacts()
  messageStore.startPolling()
})

onUnmounted(() => {
  messageStore.stopPolling()
})

async function openChat(userId) {
  await messageStore.fetchMessages(userId)
  await nextTick()
  scrollBottom()
}

async function send() {
  if (!newMessage.value.trim() || !messageStore.activeContactId) return
  sending.value = true
  const msg = newMessage.value.trim()
  newMessage.value = ''
  try {
    await messageStore.sendMessage(messageStore.activeContactId, msg)
    await nextTick()
    scrollBottom()
  } catch (_) {
    newMessage.value = msg
  }
  sending.value = false
}

function scrollBottom() {
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

watch(() => messageStore.currentChat.length, async () => {
  await nextTick()
  scrollBottom()
})

function isOwn(msg) {
  return msg.sender_id === authStore.user?.id
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return t('chat.today')
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="chat-container">
    <!-- Sidebar: contacts -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <h3><font-awesome-icon icon="fa-solid fa-comments" /> {{ t('chat.title') }}</h3>
      </div>
      <div class="contact-list">
        <div v-if="messageStore.contacts.length === 0" class="no-contacts">
          {{ t('chat.noContacts') }}
        </div>
        <div
          v-for="contact in messageStore.contacts"
          :key="contact.id"
          class="contact-item"
          :class="{ active: messageStore.activeContactId === contact.id }"
          @click="openChat(contact.id)"
        >
          <div class="contact-avatar">
            <font-awesome-icon :icon="contact.role === 'owner' ? 'fa-solid fa-user-tie' : 'fa-solid fa-wrench'" />
          </div>
          <div class="contact-info">
            <div class="contact-name">{{ contact.name }}</div>
            <div class="contact-role">{{ t('roles.' + contact.role) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat area -->
    <div class="chat-main">
      <div v-if="!messageStore.activeContactId" class="chat-empty">
        <font-awesome-icon icon="fa-solid fa-comments" size="3x" />
        <p>{{ t('chat.selectContact') }}</p>
      </div>
      <template v-else>
        <div class="chat-header">
          <div class="chat-header-info">
            <font-awesome-icon :icon="messageStore.activeContact?.role === 'owner' ? 'fa-solid fa-user-tie' : 'fa-solid fa-wrench'" />
            <span>{{ messageStore.activeContact?.name }}</span>
          </div>
        </div>

        <div ref="chatBody" class="chat-messages">
          <div v-if="messageStore.currentChat.length === 0" class="no-messages">
            {{ t('chat.noMessages') }}
          </div>
          <div
            v-for="msg in messageStore.currentChat"
            :key="msg.id"
            class="message-bubble"
            :class="{ own: isOwn(msg), other: !isOwn(msg) }"
          >
            <div class="message-body">{{ msg.body }}</div>
            <div class="message-time">
              {{ formatTime(msg.created_at) }}
              <font-awesome-icon v-if="isOwn(msg) && msg.is_read" icon="fa-solid fa-check-double" class="read-tick" />
              <font-awesome-icon v-else-if="isOwn(msg)" icon="fa-solid fa-check" class="read-tick" />
            </div>
          </div>
        </div>

        <div class="chat-input">
          <input
            v-model="newMessage"
            type="text"
            :placeholder="t('chat.placeholder')"
            @keyup.enter="send"
            :disabled="sending"
          />
          <button class="btn-send" @click="send" :disabled="sending || !newMessage.trim()">
            <font-awesome-icon :icon="sending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane'" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 140px);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
}

.chat-sidebar {
  width: 280px;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sidebar-header h3 {
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-list {
  flex: 1;
  overflow-y: auto;
}

.no-contacts {
  padding: 24px;
  text-align: center;
  color: rgba(255,255,255,0.3);
  font-size: 0.85rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.contact-item:hover { background: rgba(255,255,255,0.04); }
.contact-item.active { background: rgba(139,92,246,0.12); border-left: 3px solid #8B5CF6; }

.contact-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(139,92,246,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A78BFA;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.contact-info { min-width: 0; }
.contact-name { font-weight: 600; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.contact-role { font-size: 0.7rem; color: rgba(255,255,255,0.35); text-transform: capitalize; }

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.2);
  gap: 12px;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.chat-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-messages {
  margin: auto;
  text-align: center;
  color: rgba(255,255,255,0.25);
}

.message-bubble {
  max-width: 65%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.9rem;
  line-height: 1.4;
}
.message-bubble.own {
  align-self: flex-end;
  background: rgba(139,92,246,0.25);
  border-bottom-right-radius: 4px;
}
.message-bubble.other {
  align-self: flex-start;
  background: rgba(255,255,255,0.06);
  border-bottom-left-radius: 4px;
}

.message-body { word-break: break-word; }
.message-time {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.3);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}
.read-tick { color: #A78BFA; font-size: 0.6rem; }

.chat-input {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.chat-input input {
  flex: 1;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 10px 16px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
}
.chat-input input:focus { border-color: rgba(139,92,246,0.4); }
.chat-input input::placeholder { color: rgba(255,255,255,0.3); }

.btn-send {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: #8B5CF6;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.btn-send:hover:not(:disabled) { background: #7C3AED; }
.btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
