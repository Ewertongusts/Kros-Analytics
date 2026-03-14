<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/90 backdrop-blur-xl" @click="$emit('close')"></div>

        <!-- Modal Premium -->
        <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-[1000px] p-6 shadow-[0_0_100px_rgba(0,0,0,0.8)] max-h-[90vh] flex gap-6">
          
          <!-- Coluna Principal (Conteúdo) -->
          <div class="flex-1 flex flex-col min-w-0">
            <!-- Header -->
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-white uppercase tracking-tight">{{ company.representative_name || company.name }}</h2>
                <p class="text-xs text-white/50 mt-1">{{ company.name }}</p>
              </div>
              <button
                @click="refreshData"
                :disabled="loading"
                class="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-all"
                title="Atualizar dados"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70 hover:text-white">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
                </svg>
              </button>
            </div>

            <!-- Tabs -->
            <div class="flex items-center gap-0 border-b border-white/10 mb-6 -mx-6 px-6 overflow-x-auto">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap',
                  activeTab === tab.id
                    ? 'text-kros-blue border-kros-blue'
                    : 'text-white/50 border-transparent hover:text-white/70'
                ]"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Conteúdo -->
            <div class="space-y-3">
              <!-- Resumo Tab -->
              <div v-if="activeTab === 'resumo'" class="space-y-3">
                <!-- Status -->
                <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Status</p>
                    <div class="flex items-center gap-2">
                      <span :class="['w-2 h-2 rounded-full', company.is_active ? 'bg-emerald-500' : 'bg-red-500']"></span>
                      <span :class="['text-xs font-bold', company.is_active ? 'text-emerald-500' : 'text-red-500']">
                        {{ company.is_active ? 'Ativa' : 'Inativa' }}
                      </span>
                    </div>
                  </div>
                  <button 
                    @click="$emit('toggle-status')"
                    class="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/70 hover:text-white text-[8px] font-bold uppercase tracking-widest transition-all"
                  >
                    {{ company.is_active ? 'Desativar' : 'Ativar' }}
                  </button>
                </div>

                <!-- Informações Básicas -->
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="p-2 bg-white/5 rounded-lg">
                    <p class="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Cliente</p>
                    <p class="font-semibold text-white text-[9px]">{{ company.representative_name || company.name }}</p>
                  </div>
                  <div class="p-2 bg-white/5 rounded-lg">
                    <p class="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Email</p>
                    <p class="text-white/70 break-all text-[8px]">{{ company.email || '-' }}</p>
                  </div>
                </div>

                <!-- Vendas & Assinaturas Grid -->
                <div class="pt-2 border-t border-white/10">
                  <p class="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-2">Resumo Financeiro</p>
                  <div class="grid grid-cols-2 gap-2">
                    <!-- Pagos - Produtos -->
                    <div class="p-2.5 bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-xl border border-purple-500/30 cursor-help group relative">
                      <p class="text-[7px] font-bold text-purple-300 uppercase tracking-widest mb-1">Produtos Pagos</p>
                      <p class="text-sm font-bold text-white">{{ formatCurrency(clientHistory.stats.paidProductValue) }}</p>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/95 text-white text-[7px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Produtos pagos
                      </div>
                    </div>
                    <!-- Pagos - Serviços -->
                    <div class="p-2.5 bg-gradient-to-br from-blue-600/20 to-blue-900/20 rounded-xl border border-blue-500/30 cursor-help group relative">
                      <p class="text-[7px] font-bold text-blue-300 uppercase tracking-widest mb-1">Serviços Pagos</p>
                      <p class="text-sm font-bold text-white">{{ formatCurrency(clientHistory.stats.paidServiceValue) }}</p>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/95 text-white text-[7px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Serviços pagos
                      </div>
                    </div>
                    <!-- Pendentes - Produtos -->
                    <div class="p-2.5 bg-gradient-to-br from-amber-600/20 to-amber-900/20 rounded-xl border border-amber-500/30 cursor-help group relative">
                      <p class="text-[7px] font-bold text-amber-300 uppercase tracking-widest mb-1">Produtos Pendentes</p>
                      <p class="text-sm font-bold text-white">{{ formatCurrency(clientHistory.stats.pendingProductValue) }}</p>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/95 text-white text-[7px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Produtos pendentes
                      </div>
                    </div>
                    <!-- Pendentes - Serviços -->
                    <div class="p-2.5 bg-gradient-to-br from-orange-600/20 to-orange-900/20 rounded-xl border border-orange-500/30 cursor-help group relative">
                      <p class="text-[7px] font-bold text-orange-300 uppercase tracking-widest mb-1">Serviços Pendentes</p>
                      <p class="text-sm font-bold text-white">{{ formatCurrency(clientHistory.stats.pendingServiceValue) }}</p>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/95 text-white text-[7px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Serviços pendentes
                      </div>
                    </div>
                    <!-- Assinaturas Ativas -->
                    <div class="p-2.5 bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 rounded-xl border border-emerald-500/30 cursor-help group relative">
                      <p class="text-[7px] font-bold text-emerald-300 uppercase tracking-widest mb-1">Assinaturas Ativas</p>
                      <p class="text-sm font-bold text-white">{{ clientHistory.stats.activeSubscriptions }}</p>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/95 text-white text-[7px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Assinaturas ativas
                      </div>
                    </div>
                    <!-- LTV Total -->
                    <div class="p-2.5 bg-gradient-to-br from-rose-600/20 to-rose-900/20 rounded-xl border border-rose-500/30 cursor-help group relative">
                      <p class="text-[7px] font-bold text-rose-300 uppercase tracking-widest mb-1">LTV Total</p>
                      <p class="text-sm font-bold text-white">{{ formatCurrency(clientHistory.stats.subscriptionLTV) }}</p>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/95 text-white text-[7px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Lifetime Value total
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Assinaturas Tab -->
              <div v-if="activeTab === 'assinaturas'" class="space-y-1.5">
                <div v-if="loading" class="text-center py-2 text-white/50 text-xs">Carregando...</div>
                <div v-else-if="clientHistory.subscriptions?.length > 0" class="space-y-1.5">
                  <div v-for="sub in clientHistory.subscriptions.slice(0, 5)" :key="sub.id" class="p-2 bg-white/5 rounded-lg border border-white/10 text-xs">
                    <div class="flex items-start justify-between mb-1">
                      <p class="font-bold text-white text-[9px]">{{ sub.plan?.name || 'Plano' }}</p>
                      <span class="px-1.5 py-0.5 rounded text-[7px] font-bold bg-emerald-500/20 text-emerald-400">{{ sub.status }}</span>
                    </div>
                    <p class="text-white/70 text-[8px]">{{ formatCurrency(sub.amount) }}/mês</p>
                  </div>
                </div>
                <div v-else class="text-center py-2 text-white/50 text-xs">Nenhuma assinatura</div>
              </div>

              <!-- Pagamentos Tab -->
              <div v-if="activeTab === 'pagamentos'" class="space-y-1.5">
                <div v-if="loading" class="text-center py-2 text-white/50 text-xs">Carregando...</div>
                <div v-else-if="clientHistory.payments?.length > 0" class="space-y-1.5">
                  <div v-for="payment in clientHistory.payments.slice(0, 5)" :key="payment.id" class="p-2 bg-white/5 rounded-lg border border-white/10 text-xs">
                    <div class="flex items-center justify-between">
                      <p class="text-white/70 text-[8px]">{{ formatDate(payment.due_date) }}</p>
                      <p class="font-bold text-white text-[9px]">{{ formatCurrency(payment.amount) }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-2 text-white/50 text-xs">Nenhum pagamento</div>
              </div>

              <!-- Vendas Tab -->
              <div v-if="activeTab === 'vendas'" class="space-y-2">
                <div v-if="loading" class="text-center py-2 text-white/50 text-xs">Carregando...</div>
                <div v-else class="space-y-2">
                  <!-- Produtos -->
                  <div>
                    <p class="text-[8px] font-bold text-purple-300 uppercase tracking-widest mb-1.5">Produtos</p>
                    <div v-if="paidProducts.length > 0" class="space-y-1.5">
                      <div v-for="product in paidProducts.slice(0, 5)" :key="product.id" class="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 text-xs">
                        <div class="flex items-start justify-between mb-1">
                          <p class="font-bold text-white text-[9px]">{{ product.plan_name || product.custom_name }}</p>
                          <span :class="['px-1.5 py-0.5 rounded text-[7px] font-bold', product.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400']">
                            {{ product.payment_status === 'paid' ? 'Pago' : 'Pendente' }}
                          </span>
                        </div>
                        <p class="text-white/70 text-[8px]">{{ formatCurrency(product.monthly_price) }}</p>
                      </div>
                    </div>
                    <div v-else class="text-center py-2 text-white/50 text-[8px]">Nenhum produto</div>
                  </div>

                  <!-- Serviços -->
                  <div class="pt-2 border-t border-white/10">
                    <p class="text-[8px] font-bold text-blue-300 uppercase tracking-widest mb-1.5">Serviços</p>
                    <div v-if="paidServices.length > 0" class="space-y-1.5">
                      <div v-for="service in paidServices.slice(0, 5)" :key="service.id" class="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs">
                        <div class="flex items-start justify-between mb-1">
                          <p class="font-bold text-white text-[9px]">{{ service.plan_name || service.custom_name }}</p>
                          <span :class="['px-1.5 py-0.5 rounded text-[7px] font-bold', service.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400']">
                            {{ service.payment_status === 'paid' ? 'Pago' : 'Pendente' }}
                          </span>
                        </div>
                        <p class="text-white/70 text-[8px]">{{ formatCurrency(service.monthly_price) }}</p>
                      </div>
                    </div>
                    <div v-else class="text-center py-2 text-white/50 text-[8px]">Nenhum serviço</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Coluna Lateral (Resumo) -->
          <div class="w-64 flex flex-col gap-4 border-l border-white/10 pl-6">
            <!-- Contato -->
            <div class="space-y-2">
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest">Contato</p>
              <div v-if="company.whatsapp" class="flex items-center gap-2">
                <button 
                  @click="openWhatsApp"
                  class="flex-1 p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-all text-[9px] font-bold uppercase tracking-widest"
                >
                  WhatsApp
                </button>
              </div>
              <div v-if="company.website" class="text-[9px]">
                <a :href="company.website" target="_blank" class="text-kros-blue hover:underline break-all">{{ company.website }}</a>
              </div>
            </div>

            <!-- Endereço -->
            <div v-if="company.address_city" class="space-y-2 pt-3 border-t border-white/10">
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest">Endereço</p>
              <div class="text-[9px] text-white/70 space-y-1">
                <p v-if="company.address_street">{{ company.address_street }}, {{ company.address_number }}</p>
                <p v-if="company.address_neighborhood">{{ company.address_neighborhood }}</p>
                <p v-if="company.address_city">{{ company.address_city }}, {{ company.address_state }}</p>
              </div>
            </div>

            <!-- Notas -->
            <div v-if="company.notes" class="space-y-2 pt-3 border-t border-white/10">
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest">Notas</p>
              <p class="text-[9px] text-white/70 bg-white/5 p-2 rounded-lg">{{ company.notes }}</p>
            </div>

            <!-- Ações -->
            <div class="space-y-2 pt-3 border-t border-white/10 mt-auto">
              <button 
                @click="$emit('close')"
                class="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/70 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-all"
              >
                Fechar
              </button>
              <button 
                @click="$emit('edit')"
                class="w-full px-3 py-2 bg-kros-blue hover:bg-kros-blue/80 rounded-lg text-white text-[9px] font-bold uppercase tracking-widest transition-all"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useClientHistory } from '~/composables/useClientHistory'
import { useSaleCrud } from '~/composables/useSaleCrud'

const props = defineProps<{
  isOpen: boolean
  company: any
}>()

const emit = defineEmits<{
  close: []
  edit: []
  'toggle-status': []
  'refresh-sales': []
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
    subscriptionLTV: 0,
    paidProductValue: 0,
    paidServiceValue: 0,
    pendingProductValue: 0,
    pendingServiceValue: 0
  },
  subscriptionLTV: 0
})

const tabs = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'vendas', label: 'Vendas' },
  { id: 'assinaturas', label: 'Assinaturas' },
  { id: 'pagamentos', label: 'Pagamentos' }
]

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const openWhatsApp = () => {
  if (!props.company.whatsapp) {
    alert('WhatsApp não informado para este contato')
    return
  }
  
  const phoneNumber = props.company.whatsapp.replace(/\D/g, '')
  window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}`, '_blank')
}

const paidProducts = computed(() => {
  return clientHistory.value.allSales?.filter((s: any) => s.sale_type === 'produto') || []
})

const paidServices = computed(() => {
  return clientHistory.value.allSales?.filter((s: any) => s.sale_type === 'servico') || []
})

const refreshData = async () => {
  if (props.company?.id) {
    console.log('🔄 [KClientDetailsModal] Iniciando refresh de dados...')
    
    // Buscar dados atualizados do cliente
    const result = await fetchClientHistory(props.company.id)
    if (result?.success && 'data' in result) {
      clientHistory.value = (result as any).data
      
      // Atualizar status de todas as vendas pendentes para "paid"
      const pendingSales = clientHistory.value.allSales?.filter((s: any) => s.payment_status === 'pending') || []
      
      if (pendingSales.length > 0) {
        console.log(`📝 [KClientDetailsModal] Encontradas ${pendingSales.length} vendas pendentes para atualizar`)
        
        // Importar useSaleCrud para atualizar status
        const { updateSaleStatus } = useSaleCrud()
        
        for (const sale of pendingSales) {
          console.log(`💾 [KClientDetailsModal] Atualizando venda ${sale.id} para "paid"`)
          await updateSaleStatus(sale.id, 'paid')
        }
      }
      
      console.log('✅ [KClientDetailsModal] Dados atualizados, emitindo evento refresh-sales')
      // Emitir evento para atualizar a lista de vendas na página pai
      emit('refresh-sales')
    }
  }
}

onMounted(async () => {
  if (props.isOpen && props.company?.id) {
    const result = await fetchClientHistory(props.company.id)
    if (result?.success && 'data' in result) {
      clientHistory.value = (result as any).data
    }
  }
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.company?.id) {
    const result = await fetchClientHistory(props.company.id)
    if (result?.success && 'data' in result) {
      clientHistory.value = (result as any).data
    }
  }
}, { immediate: true })

watch(() => props.company?.id, async (newId) => {
  if (newId && props.isOpen) {
    const result = await fetchClientHistory(newId)
    if (result?.success && 'data' in result) {
      clientHistory.value = (result as any).data
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

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.1);
  border-radius: 10px;
}
</style>
