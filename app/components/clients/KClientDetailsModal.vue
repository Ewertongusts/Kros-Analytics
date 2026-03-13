<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal -->
        <div class="relative bg-[#111112] border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-[#111112]">
            <div>
              <h2 class="text-xl font-bold text-white uppercase tracking-tight">{{ company.representative_name || company.name }}</h2>
              <p class="text-xs text-white/50 mt-1">{{ company.name }}</p>
            </div>
            <button 
              @click="$emit('close')"
              class="p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70 hover:text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex items-center gap-0 border-b border-white/10 px-6 bg-[#111112]">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2',
                activeTab === tab.id
                  ? 'text-kros-blue border-kros-blue'
                  : 'text-white/50 border-transparent hover:text-white/70'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Resumo -->
            <div v-if="activeTab === 'resumo'" class="space-y-6">
              <!-- Status -->
              <div class="flex items-center gap-4">
                <div class="flex-1">
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Status</p>
                  <div class="flex items-center gap-2.5">
                    <span :class="['w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]', company.is_active ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20']"></span>
                    <span :class="['text-sm font-bold uppercase tracking-widest', company.is_active ? 'text-emerald-500' : 'text-red-500']">
                      {{ company.is_active ? 'Ativa' : 'Inativa' }}
                    </span>
                  </div>
                </div>
                <button 
                  @click="$emit('toggle-status')"
                  class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  {{ company.is_active ? 'Desativar' : 'Ativar' }}
                </button>
              </div>

              <!-- Informações Básicas -->
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Cliente</p>
                  <p class="text-sm font-semibold text-white">{{ company.representative_name || company.name }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Empresa</p>
                  <p class="text-sm font-semibold text-white">{{ company.name }}</p>
                </div>
              </div>

              <!-- Contato -->
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Email</p>
                  <p class="text-sm text-white/70 break-all">{{ company.email || '-' }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Telefone</p>
                  <p class="text-sm text-white/70">{{ company.phone || '-' }}</p>
                </div>
              </div>

              <!-- WhatsApp -->
              <div>
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">WhatsApp</p>
                <p class="text-sm text-white/70">{{ company.whatsapp || '-' }}</p>
              </div>

              <!-- Datas -->
              <div class="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div>
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Data de Cadastro</p>
                  <p class="text-sm text-white/70">{{ formatDate(company.created_at) }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Última Atualização</p>
                  <p class="text-sm text-white/70">{{ formatDate(company.updated_at) }}</p>
                </div>
              </div>

              <!-- Notas -->
              <div v-if="company.notes">
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Notas</p>
                <p class="text-sm text-white/70 bg-white/5 p-3 rounded-lg">{{ company.notes }}</p>
              </div>
            </div>

            <!-- Assinaturas -->
            <div v-if="activeTab === 'assinaturas'" class="space-y-4">
              <div v-if="loading" class="text-center py-8 text-white/50">
                <p class="text-sm">Carregando assinaturas...</p>
              </div>
              <div v-else-if="clientHistory.subscriptions && clientHistory.subscriptions.length > 0" class="space-y-3">
                <div v-for="sub in clientHistory.subscriptions" :key="sub.id" class="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <p class="text-sm font-bold text-white">{{ sub.plan?.name || 'Plano não informado' }}</p>
                      <p class="text-xs text-white/50 mt-1">{{ formatDate(sub.start_date) }} - {{ sub.end_date ? formatDate(sub.end_date) : 'Sem data de fim' }}</p>
                    </div>
                    <span :class="['px-2 py-1 rounded text-[9px] font-bold uppercase', getStatusColor(sub.status)]">
                      {{ getStatusLabel(sub.status) }}
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p class="text-white/50">Valor Mensal</p>
                      <p class="text-white font-bold">{{ formatCurrency(sub.amount) }}</p>
                    </div>
                    <div>
                      <p class="text-white/50">LTV</p>
                      <p class="text-white font-bold">{{ formatCurrency(calculateLTV(sub)) }}</p>
                    </div>
                    <div>
                      <p class="text-white/50">Pagamentos</p>
                      <p class="text-white font-bold">{{ clientHistory.stats.paidPayments }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-white/50">
                <p class="text-sm">Nenhuma assinatura encontrada</p>
              </div>
            </div>

            <!-- Produtos -->
            <div v-if="activeTab === 'produtos'" class="space-y-4">
              <div v-if="loading" class="text-center py-8 text-white/50">
                <p class="text-sm">Carregando produtos...</p>
              </div>
              <div v-else-if="clientHistory.allSales && clientHistory.allSales.filter((s: any) => s.sale_type === 'produto').length > 0" class="space-y-3">
                <div v-for="product in clientHistory.allSales.filter((s: any) => s.sale_type === 'produto')" :key="product.id" class="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <p class="text-sm font-bold text-white">{{ product.plan_name || 'Produto não informado' }}</p>
                      <p class="text-xs text-white/50 mt-1">{{ formatDate(product.created_at) }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p class="text-white/50">Valor</p>
                      <p class="text-white font-bold">{{ formatCurrency(product.monthly_price) }}</p>
                    </div>
                    <div>
                      <p class="text-white/50">Status</p>
                      <p class="text-white font-bold">{{ product.is_active ? 'Ativo' : 'Inativo' }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-white/50">
                <p class="text-sm">Nenhum produto encontrado</p>
              </div>
            </div>

            <!-- Serviços -->
            <div v-if="activeTab === 'servicos'" class="space-y-4">
              <div v-if="loading" class="text-center py-8 text-white/50">
                <p class="text-sm">Carregando serviços...</p>
              </div>
              <div v-else-if="clientHistory.allSales && clientHistory.allSales.filter((s: any) => s.sale_type === 'servico').length > 0" class="space-y-3">
                <div v-for="service in clientHistory.allSales.filter((s: any) => s.sale_type === 'servico')" :key="service.id" class="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <p class="text-sm font-bold text-white">{{ service.plan_name || 'Serviço não informado' }}</p>
                      <p class="text-xs text-white/50 mt-1">{{ formatDate(service.created_at) }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p class="text-white/50">Valor</p>
                      <p class="text-white font-bold">{{ formatCurrency(service.monthly_price) }}</p>
                    </div>
                    <div>
                      <p class="text-white/50">Status</p>
                      <p class="text-white font-bold">{{ service.is_active ? 'Ativo' : 'Inativo' }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-white/50">
                <p class="text-sm">Nenhum serviço encontrado</p>
              </div>
            </div>

            <!-- Pagamentos -->
            <div v-if="activeTab === 'pagamentos'" class="space-y-3">
              <div v-if="loading" class="text-center py-8 text-white/50">
                <p class="text-sm">Carregando pagamentos...</p>
              </div>
              <div v-else-if="clientHistory.payments && clientHistory.payments.length > 0">
                <div class="grid grid-cols-4 gap-4 mb-4 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                  <div>Data</div>
                  <div>Valor</div>
                  <div>Status</div>
                  <div>Tipo</div>
                </div>
                <div v-for="payment in clientHistory.payments" :key="payment.id" class="grid grid-cols-4 gap-4 p-3 bg-white/5 rounded-lg border border-white/10 text-xs">
                  <div class="text-white/70">{{ formatDate(payment.due_date) }}</div>
                  <div class="text-white font-bold">{{ formatCurrency(payment.amount) }}</div>
                  <div>
                    <span :class="['px-2 py-1 rounded text-[9px] font-bold uppercase', getPaymentStatusColor(payment.status)]">
                      {{ payment.status }}
                    </span>
                  </div>
                  <div class="text-white/70">{{ payment.auto_billing_enabled ? 'Automático' : 'Manual' }}</div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-white/50">
                <p class="text-sm">Nenhum pagamento encontrado</p>
              </div>
            </div>

            <!-- Histórico -->
            <div v-if="activeTab === 'historico'" class="space-y-3">
              <div v-if="loading" class="text-center py-8 text-white/50">
                <p class="text-sm">Carregando histórico...</p>
              </div>
              <div v-else-if="clientHistory.paymentHistory && clientHistory.paymentHistory.length > 0">
                <div v-for="entry in clientHistory.paymentHistory" :key="entry.id" class="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div class="flex items-start justify-between mb-2">
                    <p class="text-xs font-bold text-white">{{ entry.description }}</p>
                    <span class="text-[9px] text-white/50">{{ formatDate(entry.created_at) }}</span>
                  </div>
                  <p class="text-[10px] text-white/50">Por: {{ entry.user_name }}</p>
                </div>
              </div>
              <div v-else class="text-center py-8 text-white/50">
                <p class="text-sm">Nenhum histórico encontrado</p>
              </div>
            </div>

            <!-- Estatísticas -->
            <div v-if="activeTab === 'resumo'" class="space-y-6 pt-4 border-t border-white/10">
              <!-- Assinaturas -->
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-white/5 rounded-lg">
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Assinaturas Ativas</p>
                  <p class="text-2xl font-bold text-kros-blue">{{ clientHistory.stats.activeSubscriptions }}</p>
                </div>
                <div class="p-4 bg-white/5 rounded-lg">
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Pagamentos Realizados</p>
                  <p class="text-2xl font-bold text-emerald-500">{{ clientHistory.stats.paidPayments }}</p>
                </div>
                <div class="p-4 bg-white/5 rounded-lg">
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Total Pago</p>
                  <p class="text-2xl font-bold text-white">{{ formatCurrency(clientHistory.stats.totalPaid) }}</p>
                </div>
                <div class="p-4 bg-white/5 rounded-lg">
                  <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Pendente</p>
                  <p class="text-2xl font-bold text-amber-500">{{ formatCurrency(clientHistory.stats.totalPending) }}</p>
                </div>
              </div>

              <!-- Vendas -->
              <div class="pt-4 border-t border-white/10">
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Vendas</p>
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p class="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Total em Produtos</p>
                    <p class="text-2xl font-bold text-white">{{ formatCurrency(clientHistory.stats.totalProductValue) }}</p>
                  </div>
                  <div class="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Total em Serviços</p>
                    <p class="text-2xl font-bold text-white">{{ formatCurrency(clientHistory.stats.totalServiceValue) }}</p>
                  </div>
                </div>
              </div>

              <!-- Assinaturas Pagas -->
              <div class="pt-4 border-t border-white/10">
                <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Assinaturas</p>
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <p class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Total Pago (Ativas)</p>
                    <p class="text-2xl font-bold text-white">{{ formatCurrency(clientHistory.stats.totalPaidSubscriptions) }}</p>
                  </div>
                  <div class="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p class="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2">LTV Total</p>
                    <p class="text-2xl font-bold text-white">{{ formatCurrency(clientHistory.stats.subscriptionLTV) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#111112]">
            <button 
              @click="$emit('close')"
              class="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              Fechar
            </button>
            <button 
              @click="$emit('edit')"
              class="px-4 py-2.5 bg-kros-blue hover:bg-kros-blue/80 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useClientHistory } from '~/composables/useClientHistory'

const props = defineProps<{
  isOpen: boolean
  company: any
}>()

defineEmits<{
  close: []
  edit: []
  'toggle-status': []
}>()

const activeTab = ref('resumo')
const { fetchClientHistory, loading } = useClientHistory()
const clientHistory = ref<any>({
  subscriptions: [],
  payments: [],
  paymentHistory: [],
  sales: [],
  allSales: [],
  tasks: [],
  stats: {
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalPayments: 0,
    paidPayments: 0,
    pendingPayments: 0,
    totalPaid: 0,
    totalPending: 0,
    activeTasks: 0,
    totalProductValue: 0,
    totalServiceValue: 0,
    totalPaidSubscriptions: 0,
    subscriptionLTV: 0
  },
  subscriptionLTV: 0
})

const tabs = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'assinaturas', label: 'Assinaturas' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'pagamentos', label: 'Pagamentos' },
  { id: 'historico', label: 'Histórico' }
]

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    suspended: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border border-red-500/20',
    trial: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  }
  return colors[status] || 'bg-white/5 text-white/40 border border-white/10'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: 'Ativa',
    suspended: 'Suspensa',
    cancelled: 'Cancelada',
    trial: 'Trial'
  }
  return labels[status] || status
}

const getPaymentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border border-red-500/20'
  }
  return colors[status] || 'bg-white/5 text-white/40 border border-white/10'
}

const calculateLTV = (subscription: any) => {
  if (subscription.end_date && subscription.start_date) {
    const start = new Date(subscription.start_date)
    const end = new Date(subscription.end_date)
    const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
    return subscription.amount * Math.max(months, 1)
  }
  return subscription.amount * 12
}

onMounted(async () => {
  if (props.isOpen && props.company?.id) {
    const result = await fetchClientHistory(props.company.id)
    if (result.success) {
      clientHistory.value = result.data
    }
  }
})

// Recarregar dados quando o modal abre
watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.company?.id) {
    const result = await fetchClientHistory(props.company.id)
    if (result.success) {
      clientHistory.value = result.data
    }
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
