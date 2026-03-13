<template>
  <div class="space-y-8">
    <!-- Header Premium -->
    <div class="bg-gradient-to-r from-kros-blue/10 to-kros-blue/5 border border-kros-blue/20 rounded-2xl p-8">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-3xl font-bold text-white mb-2">🔗 Webhooks</h2>
          <p class="text-white/60">Integre seu CRM e sincronize dados em tempo real</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-6 py-3 bg-gradient-to-r from-kros-blue to-kros-blue/80 hover:from-kros-blue/90 hover:to-kros-blue/70 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          + Adicionar Webhook
        </button>
      </div>
    </div>

    <!-- Tabs Profissional -->
    <div class="flex gap-2 border-b border-white/10">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-6 py-4 font-semibold transition-all duration-300 border-b-2',
          activeTab === tab.id
            ? 'text-kros-blue border-kros-blue'
            : 'text-white/60 hover:text-white border-transparent'
        ]"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Tab: Configurações -->
    <div v-if="activeTab === 'configs'" class="space-y-6">
      <!-- Setup Alert -->
      <div v-if="!setupDone" class="bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-xl p-6">
        <div class="flex items-start gap-4">
          <div class="text-4xl">⚠️</div>
          <div class="flex-1">
            <h3 class="text-amber-400 font-bold text-lg mb-2">Setup Necessário</h3>
            <p class="text-amber-300/80 text-sm mb-4">
              As tabelas do webhook precisam ser criadas no banco de dados. Execute o SQL no Supabase.
            </p>
            <button
              @click="runSetup"
              :disabled="setupLoading"
              class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 hover:scale-105"
            >
              {{ setupLoading ? '⏳ Criando...' : '🔧 Criar Tabelas' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Success Alert -->
      <div v-if="setupDone" class="bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30 rounded-xl p-4">
        <p class="text-green-400 font-semibold">✅ Sistema pronto! Tabelas criadas com sucesso.</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 flex-wrap">
        <button
          @click="sendTestEvent"
          :disabled="loading || !setupDone"
          class="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 hover:scale-105 flex items-center gap-2"
        >
          🧪 Teste Local
        </button>
        <button
          @click="sendToWebhook"
          :disabled="loading || webhooks.length === 0"
          class="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 hover:scale-105 flex items-center gap-2"
        >
          📤 Enviar para CRM
        </button>
      </div>

      <!-- Webhooks List -->
      <div v-if="webhooks.length === 0 && setupDone" class="text-center py-16">
        <p class="text-6xl mb-4">🔌</p>
        <p class="text-white/60 text-lg">Nenhum webhook configurado ainda</p>
        <p class="text-white/40 text-sm mt-2">Clique em "Adicionar Webhook" para começar</p>
      </div>

      <div v-for="webhook in webhooks" :key="webhook.id" class="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-kros-blue/50">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-xl font-bold text-white">{{ webhook.name }}</h3>
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', webhook.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400']">
                {{ webhook.active ? '🟢 Ativo' : '🔴 Inativo' }}
              </span>
            </div>
            <p class="text-white/60 text-sm font-mono break-all">{{ webhook.url }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="editWebhook(webhook)" class="p-2 hover:bg-white/10 rounded-lg transition-colors">✏️</button>
            <button @click="deleteWebhook(webhook.id)" class="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400">🗑️</button>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="event in webhook.event_types" :key="event" class="px-3 py-1 bg-kros-blue/20 text-kros-blue text-xs rounded-full">
            {{ event }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tab: Eventos -->
    <div v-if="activeTab === 'events'" class="space-y-6">
      <!-- Stats Grid -->
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-xl p-6">
          <p class="text-blue-400/80 text-sm font-semibold mb-2">📊 Total</p>
          <p class="text-4xl font-bold text-white">{{ stats.total }}</p>
        </div>
        <div class="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 rounded-xl p-6">
          <p class="text-green-400/80 text-sm font-semibold mb-2">✅ Processados</p>
          <p class="text-4xl font-bold text-green-400">{{ stats.processed }}</p>
        </div>
        <div class="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20 rounded-xl p-6">
          <p class="text-red-400/80 text-sm font-semibold mb-2">❌ Erros</p>
          <p class="text-4xl font-bold text-red-400">{{ stats.failed }}</p>
        </div>
        <div class="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 rounded-xl p-6">
          <p class="text-purple-400/80 text-sm font-semibold mb-2">📈 Taxa</p>
          <p class="text-4xl font-bold text-purple-400">{{ stats.successRate }}%</p>
        </div>
      </div>

      <!-- Events List -->
      <div v-if="events.length === 0" class="text-center py-16">
        <p class="text-6xl mb-4">📭</p>
        <p class="text-white/60 text-lg">Nenhum evento enviado</p>
      </div>

      <div v-for="event in events" :key="event.id" class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-white font-semibold">{{ event.event_type }}</p>
            <p class="text-white/60 text-sm">{{ formatDate(event.received_at) }}</p>
          </div>
          <span :class="['px-4 py-2 rounded-lg text-sm font-semibold', event.processed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400']">
            {{ event.processed ? '✅ OK' : '❌ Erro' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tab: Eventos Recebidos -->
    <div v-if="activeTab === 'received'" class="space-y-6">
      <!-- Stats Grid -->
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-xl p-6">
          <p class="text-blue-400/80 text-sm font-semibold mb-2">📥 Total Recebido</p>
          <p class="text-4xl font-bold text-white">{{ receivedStats.total }}</p>
        </div>
        <div class="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 rounded-xl p-6">
          <p class="text-green-400/80 text-sm font-semibold mb-2">✅ Processados</p>
          <p class="text-4xl font-bold text-green-400">{{ receivedStats.processed }}</p>
        </div>
        <div class="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20 rounded-xl p-6">
          <p class="text-red-400/80 text-sm font-semibold mb-2">❌ Erros</p>
          <p class="text-4xl font-bold text-red-400">{{ receivedStats.failed }}</p>
        </div>
        <div class="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 rounded-xl p-6">
          <p class="text-purple-400/80 text-sm font-semibold mb-2">📈 Taxa</p>
          <p class="text-4xl font-bold text-purple-400">{{ receivedStats.successRate }}%</p>
        </div>
      </div>

      <!-- Received Events List -->
      <div v-if="receivedEvents.length === 0" class="text-center py-16">
        <p class="text-6xl mb-4">📭</p>
        <p class="text-white/60 text-lg">Nenhum evento recebido do CRM</p>
        <p class="text-white/40 text-sm mt-2">Configure seu CRM para enviar eventos para:</p>
        <p class="text-kros-blue font-mono text-sm mt-2 break-all">https://kros-analytics.vercel.app/api/webhooks/receive</p>
      </div>

      <div v-for="event in receivedEvents" :key="event.id" class="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="px-3 py-1 bg-kros-blue/20 text-kros-blue text-xs rounded-full font-semibold">{{ event.event_type }}</span>
              <span class="text-white/60 text-sm">{{ event.source_system }}</span>
            </div>
            <p class="text-white/60 text-sm">{{ formatDate(event.received_at) }}</p>
          </div>
          <span :class="['px-4 py-2 rounded-lg text-sm font-semibold', event.processed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400']">
            {{ event.processed ? '✅ Processado' : '⏳ Pendente' }}
          </span>
        </div>
        
        <!-- Payload Preview -->
        <div class="bg-black/30 rounded-lg p-4 font-mono text-xs text-white/70 overflow-x-auto max-h-40 overflow-y-auto">
          <pre>{{ JSON.stringify(event.payload, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-[#0D0D0E] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-2xl font-bold text-white mb-6">{{ editingWebhook ? '✏️ Editar Webhook' : '➕ Novo Webhook' }}</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-white/80 text-sm font-semibold mb-2">Nome</label>
            <input v-model="formData.name" type="text" placeholder="Ex: Legendary Hub" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-kros-blue focus:bg-white/10 transition-all" />
          </div>

          <div>
            <label class="block text-white/80 text-sm font-semibold mb-2">URL do Webhook</label>
            <input v-model="formData.url" type="url" placeholder="https://api.seu-crm.com/webhook" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-kros-blue focus:bg-white/10 transition-all" />
          </div>

          <div>
            <label class="block text-white/80 text-sm font-semibold mb-3">Eventos a Receber</label>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <label v-for="event in availableEvents" :key="event" class="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors">
                <input type="checkbox" :value="event" v-model="formData.event_types" class="w-4 h-4 rounded bg-white/10 border border-white/20 cursor-pointer accent-kros-blue" />
                <span class="text-white/80 text-sm">{{ event }}</span>
              </label>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <input v-model="formData.active" type="checkbox" class="w-4 h-4 rounded bg-white/10 border border-white/20 cursor-pointer accent-kros-blue" />
            <label class="text-white/80 text-sm font-semibold cursor-pointer">Ativo</label>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button @click="showCreateModal = false" class="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300">
            Cancelar
          </button>
          <button @click="saveWebhook" :disabled="loading" class="flex-1 px-4 py-3 bg-gradient-to-r from-kros-blue to-kros-blue/80 hover:from-kros-blue/90 hover:to-kros-blue/70 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50">
            {{ loading ? '⏳ Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Webhook {
  id: string
  name: string
  url: string
  event_types: string[]
  active: boolean
}

interface WebhookEvent {
  id: string
  event_type: string
  processed: boolean
  received_at: string
  source_system?: string
  payload?: any
}

const activeTab = ref('configs')
const showCreateModal = ref(false)
const loading = ref(false)
const setupLoading = ref(false)
const setupDone = ref(false)
const editingWebhook = ref<Webhook | null>(null)

const tabs = [
  { id: 'configs', name: '⚙️ Configurações' },
  { id: 'events', name: '📊 Eventos Enviados' },
  { id: 'received', name: '📥 Eventos Recebidos' }
]

const availableEvents = ['customer.created', 'customer.updated', 'customer.deleted', 'subscription.created', 'payment.received', 'payment.failed']

const webhooks = ref<Webhook[]>([])
const events = ref<WebhookEvent[]>([])
const receivedEvents = ref<WebhookEvent[]>([])

const stats = reactive({
  total: 0,
  processed: 0,
  failed: 0,
  successRate: 0
})

const receivedStats = reactive({
  total: 0,
  processed: 0,
  failed: 0,
  successRate: 0
})

const formData = reactive({
  name: '',
  url: '',
  event_types: [] as string[],
  active: true
})

const resetForm = () => {
  formData.name = ''
  formData.url = ''
  formData.event_types = []
  formData.active = true
  editingWebhook.value = null
}

const fetchWebhooks = async () => {
  try {
    const response = await fetch('/api/webhooks/config')
    if (!response.ok) throw new Error('Erro')
    const data = await response.json()
    webhooks.value = data || []
  } catch (err) {
    console.error('Erro:', err)
  }
}

const fetchEvents = async () => {
  try {
    const supabase = useSupabaseClient()
    const { data } = await supabase.from('webhook_events').select('*').order('received_at', { ascending: false }).limit(50)
    events.value = (data as WebhookEvent[]) || []
    const total = data?.length || 0
    const processed = (data as WebhookEvent[])?.filter(e => e.processed).length || 0
    stats.total = total
    stats.processed = processed
    stats.failed = total - processed
    stats.successRate = total > 0 ? Math.round((processed / total) * 100) : 0
  } catch (err) {
    console.error('Erro:', err)
  }
}

const fetchReceivedEvents = async () => {
  try {
    const supabase = useSupabaseClient()
    const { data } = await supabase.from('webhook_events').select('*').order('received_at', { ascending: false }).limit(100)
    receivedEvents.value = (data as WebhookEvent[]) || []
    const total = data?.length || 0
    const processed = (data as WebhookEvent[])?.filter(e => e.processed).length || 0
    receivedStats.total = total
    receivedStats.processed = processed
    receivedStats.failed = total - processed
    receivedStats.successRate = total > 0 ? Math.round((processed / total) * 100) : 0
  } catch (err) {
    console.error('Erro:', err)
  }
}

const saveWebhook = async () => {
  if (!formData.name || !formData.url || formData.event_types.length === 0) {
    alert('Preencha todos os campos')
    return
  }

  loading.value = true
  try {
    const method = editingWebhook.value ? 'PUT' : 'POST'
    const body = editingWebhook.value ? { id: editingWebhook.value.id, ...formData } : formData

    const response = await fetch('/api/webhooks/config', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) throw new Error('Erro ao salvar')

    showCreateModal.value = false
    resetForm()
    await fetchWebhooks()
    alert('✅ Webhook salvo com sucesso!')
  } catch (err: any) {
    alert('❌ Erro: ' + err.message)
  } finally {
    loading.value = false
  }
}

const editWebhook = (webhook: Webhook) => {
  editingWebhook.value = webhook
  formData.name = webhook.name
  formData.url = webhook.url
  formData.event_types = webhook.event_types
  formData.active = webhook.active
  showCreateModal.value = true
}

const deleteWebhook = async (id: string) => {
  if (!confirm('Tem certeza?')) return
  try {
    const response = await fetch('/api/webhooks/config', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (!response.ok) throw new Error('Erro')
    await fetchWebhooks()
    alert('✅ Deletado!')
  } catch (err: any) {
    alert('❌ Erro: ' + err.message)
  }
}

const formatDate = (date: string) => new Date(date).toLocaleString('pt-BR')

const runSetup = async () => {
  setupLoading.value = true
  try {
    const response = await fetch('/api/webhooks/setup', { method: 'POST' })
    const data = await response.json()
    if (data.success) {
      setupDone.value = true
      alert('✅ Tabelas criadas!')
      await fetchWebhooks()
    } else {
      alert('❌ Erro: ' + data.message)
    }
  } catch (err: any) {
    alert('❌ Erro: ' + err.message)
  } finally {
    setupLoading.value = false
  }
}

const sendTestEvent = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/webhooks/test', { method: 'POST' })
    if (!response.ok) throw new Error('Erro')
    alert('✅ Evento teste criado!')
    setTimeout(() => fetchEvents(), 500)
  } catch (err: any) {
    alert('❌ Erro: ' + err.message)
  } finally {
    loading.value = false
  }
}

const sendToWebhook = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/webhooks/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'test.event',
        payload: { message: 'Teste enviado em ' + new Date().toLocaleString('pt-BR') }
      })
    })
    if (!response.ok) throw new Error('Erro ao enviar')
    alert('✅ Evento enviado para o CRM!')
  } catch (err: any) {
    alert('❌ Erro: ' + err.message)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const supabase = useSupabaseClient()
    await supabase.from('webhook_events').select('count', { count: 'exact' }).limit(1)
    setupDone.value = true
  } catch {
    setupDone.value = false
  }
  await fetchWebhooks()
  await fetchEvents()
  await fetchReceivedEvents()
})
</script>
