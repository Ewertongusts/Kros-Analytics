<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/5 transition-all">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
      <div>
        <h3 class="font-bold text-xl text-white tracking-tight">Board de Cobrança</h3>
        <p class="text-xs text-white/60 font-medium uppercase tracking-[0.1em] mt-1.5">Status de pagamentos e ações via WhatsApp</p>
      </div>
      <div class="flex flex-wrap items-center gap-4">
          <!-- Novo Filtro de Tags (Dropdown Multi-select) -->
          <div class="relative group/tags">
             <button 
               @click="isTagDropdownOpen = !isTagDropdownOpen"
               class="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all text-white/70 hover:text-white"
             >
               <span class="text-xs font-bold uppercase tracking-widest">Tags</span>
               <div v-if="selectedTags.length > 0" class="flex items-center justify-center min-w-[20px] h-[20px] bg-kros-blue text-white rounded-full text-[10px] font-bold">
                 {{ selectedTags.length }}
               </div>
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isTagDropdownOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
             </button>

             <!-- Dropdown Menu -->
             <div 
               v-if="isTagDropdownOpen" 
               class="absolute top-full right-0 mt-2 w-64 bg-[#111112] border border-white/10 rounded-2xl shadow-2xl z-[100] p-2 overflow-hidden"
             >
                <div class="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                   <button 
                     @click="toggleAllTags"
                     class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left"
                   >
                     <span class="text-[10px] font-bold text-white/70 uppercase tracking-widest">Todas as Tags</span>
                     <div :class="['w-4 h-4 rounded border flex items-center justify-center transition-all', selectedTags.length === tagDefinitions.length ? 'bg-kros-blue border-kros-blue' : 'border-white/20']">
                        <svg v-if="selectedTags.length === tagDefinitions.length" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </div>
                   </button>
                   
                   <div class="h-px bg-white/5 my-1"></div>

                   <button 
                     v-for="tag in tagDefinitions" 
                     :key="tag.id"
                     @click="toggleTag(tag.name)"
                     class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left group/item"
                   >
                     <div class="flex items-center gap-3">
                        <div :style="{ backgroundColor: tag.color }" class="w-3 h-3 rounded-sm shadow-[0_0_8px_rgba(0,0,0,0.5)]"></div>
                        <span class="text-[10px] font-bold text-white/50 group-hover/item:text-white uppercase tracking-widest transition-colors">{{ tag.name }}</span>
                     </div>
                     <div :class="['w-4 h-4 rounded border flex items-center justify-center transition-all', selectedTags.includes(tag.name) ? 'bg-kros-blue border-kros-blue' : 'border-white/20']">
                        <svg v-if="selectedTags.includes(tag.name)" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </div>
                   </button>
                </div>

                <div v-if="selectedTags.length > 0" class="p-2 border-t border-white/5">
                   <button 
                     @click="selectedTags = []"
                     class="w-full py-2.5 text-[10px] font-bold text-center text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-all"
                   >
                     Limpar Filtros
                   </button>
                </div>
             </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
               @click="$emit('open-logs')"
               title="Logs de Disparos e Cobrança"
               class="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-all border border-transparent hover:border-white/10 flex items-center justify-center shrink-0"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16 20h.01"/><path d="M3 14h.01"/><path d="M8 14h.01"/><path d="M3 10h.01"/><path d="M8 10h.01"/><path d="M3 6h.01"/><path d="M8 6h.01"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
            </button>
            <UiKFilterTabs v-model="activeFilter" :options="filterOptions" />
          </div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr class="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
            <th class="px-4 py-3">Empresa / Parceiro</th>
            <th class="px-4 py-3 text-center">Cadastro</th>
            <th class="px-4 py-3">Vencimento</th>
            <th class="px-4 py-3">Valor</th>
            <th class="px-4 py-3">LTV Pago</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Cobrar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in filteredPayments" :key="payment.id" 
              class="group/row bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-2xl border border-transparent hover:border-kros-blue/10">
            <td class="px-4 py-5 first:rounded-l-2xl">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-kros-blue/10 flex items-center justify-center text-kros-blue font-bold text-[10px] border border-kros-blue/10">
                  {{ payment.company_name?.charAt(0) }}
                </div>
                <div class="flex flex-col">
                   <p class="font-semibold text-sm text-white uppercase tracking-tight">{{ payment.company_name }}</p>
                   <p class="text-xs text-white/70 font-medium uppercase tracking-tighter">{{ payment.plan_name }}</p>
                   <p class="text-xs text-white/60 font-medium uppercase tracking-widest" v-if="payment.company_rep">REP: {{ payment.company_rep }}</p>
                   
                   <!-- Seção de Tags -->
                   <div v-if="payment.tags && payment.tags.length" class="flex flex-wrap gap-1 mt-1.5">
                      <span 
                        v-for="tag in payment.tags" 
                        :key="tag"
                        :style="getTagStyle(tag)"
                        :title="getTagDescription(tag)"
                        class="text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider"
                      >
                        {{ tag }}
                      </span>
                   </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-5 text-center">
               <span class="text-xs font-medium text-white/50 uppercase tracking-widest">{{ formatDate(payment.company_created_at) }}</span>
            </td>
            <td class="px-4 py-5 font-medium">
               <span class="text-xs font-semibold tabular-nums text-white/60">{{ formatDate(payment.due_date) }}</span>
            </td>
            <td class="px-4 py-5">
               <span class="text-xs font-bold tabular-nums text-white/90">{{ formatCurrency(payment.amount) }}</span>
            </td>
            <td class="px-4 py-5">
               <span class="text-xs font-bold text-white/90 tabular-nums">{{ formatCurrency(payment.company_ltv || 0) }}</span>
            </td>
            <td class="px-4 py-5">
               <div class="flex items-center gap-2.5">
                  <span :class="['w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]', getStatusColor(payment.status)]" :style="{ color: getStatusHex(payment.status) }"></span>
                  <span :class="['text-xs font-bold uppercase tracking-widest', getStatusTextColor(payment.status)]">
                    {{ payment.status }}
                  </span>
               </div>
            </td>
            <td class="px-4 py-5 last:rounded-r-2xl text-right">
                <div class="flex items-center justify-end gap-2 pr-1">
                  <!-- 1. Botão Toggle Status do Pagamento -->
                  <button 
                    @click="$emit('toggle-status', payment)"
                    :title="payment.status === 'Pago' ? 'Desfazer Pagamento (Estornar)' : 'Marcar como Pago'"
                    :class="[
                      'p-2.5 rounded-xl transition-all',
                      payment.status === 'Pago' 
                        ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' 
                        : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white'
                    ]"
                  >
                    <!-- Ícone de Marcar Pago -->
                    <svg v-if="payment.status !== 'Pago'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <!-- Ícone de Desfazer (Undo) -->
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                  </button>

                  <!-- 2. Botão de Automação de Cobrança (CRON/POST) -->
                  <UiKAutoBillingBtn 
                    :is-active="payment.auto_billing_enabled"
                    @click="toggleAutoBilling(payment)"
                  />

                  <!-- 3. Botão WhatsApp (Mensagem Manual) -->
                  <button 
                    @click="openMsgModal(payment)"
                    title="Cobrar via WhatsApp"
                    class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all group/wa"
                  >
                    <!-- Ícone oficial do WhatsApp -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/>
                    </svg>
                  </button>

                  <!-- 4. Botão de Logs (Sempre por último à direita) -->
                  <UiKPaymentLogStatusBtn 
                     :payment-id="payment.id"
                     @open-logs="$emit('open-logs', payment.id)"
                  />
               </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="payments.length === 0" class="flex flex-col items-center justify-center py-20 opacity-60">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
       <p class="font-bold uppercase tracking-widest text-[10px] text-white/60">Nenhum pagamento registrado</p>
    </div>

    <!-- Modal de Envio via API HTTP -->
    <BlocksKFinanceSendMsgModal 
      v-if="isMsgModalOpen"
      :is-open="isMsgModalOpen"
      :payment="selectedPayment"
      @close="isMsgModalOpen = false"
      @sent="handleMessageSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTags } from '~/composables/useTags'

const props = defineProps<{
  payments: any[]
}>()

const emit = defineEmits(['toggle-status', 'toggle-autobilling', 'open-logs'])

const isMsgModalOpen = ref(false)
const selectedPayment = ref<any>(null)
const { tags: tagDefinitions, fetchTags } = useTags()

const activeFilter = ref('Todos')
const isTagDropdownOpen = ref(false)
const selectedTags = ref<string[]>([])

const filterOptions = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Pendente', label: 'Pendentes' },
  { id: 'Atrasado', label: 'Atrasados' },
  { id: 'Pago', label: 'Pagos' }
]

const toggleTag = (tagName: string) => {
  const index = selectedTags.value.indexOf(tagName)
  if (index === -1) {
    selectedTags.value.push(tagName)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const toggleAllTags = () => {
  if (selectedTags.value.length === tagDefinitions.value.length) {
    selectedTags.value = []
  } else {
    selectedTags.value = tagDefinitions.value.map(t => t.name)
  }
}

const filteredPayments = computed(() => {
  return props.payments.filter(p => {
    // Filtro por Status
    const matchesStatus = activeFilter.value === 'Todos' || p.status === activeFilter.value
    
    // Filtro por Multi-Tags (Se houver tags selecionadas, o registro deve ter PELO MENOS UMA delas)
    const matchesTag = selectedTags.value.length === 0 || 
                       (p.tags && p.tags.some((t: string) => selectedTags.value.includes(t)))
    
    return matchesStatus && matchesTag
  })
})

onMounted(() => {
  fetchTags()
})

const getTagStyle = (tagName: string) => {
  const def = tagDefinitions.value.find(t => t.name === tagName)
  if (def) {
    return {
      backgroundColor: `${def.color}15`,
      color: def.color,
      borderColor: `${def.color}30`
    }
  }
  return {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    color: '#3B82F6',
    borderColor: 'rgba(59, 130, 246, 0.1)'
  }
}

const getTagDescription = (tagName: string) => {
  const def = tagDefinitions.value.find(t => t.name === tagName)
  return def?.description || ''
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  const safeDate = date.includes('T') ? date : `${date}T12:00:00`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(safeDate))
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return 'bg-emerald-500 ring-emerald-500/10'
    case 'pendente': return 'bg-amber-500 ring-amber-500/10'
    case 'atrasado': return 'bg-red-500 ring-red-500/10'
    default: return 'bg-slate-500 ring-slate-500/10'
  }
}

const getStatusTextColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return 'text-emerald-500'
    case 'pendente': return 'text-amber-500'
    case 'atrasado': return 'text-red-500'
    default: return 'text-white/40'
  }
}

const getStatusHex = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return '#10b981'
    case 'pendente': return '#f59e0b'
    case 'atrasado': return '#ef4444'
    default: return '#64748b'
  }
}

const openMsgModal = (payment: any) => {
  if (!payment.company_whatsapp) {
    alert('Empresa sem WhatsApp cadastrado. Não será possível enviar mensagem.')
    return
  }
  selectedPayment.value = payment
  isMsgModalOpen.value = true
}

const handleMessageSent = () => {
  isMsgModalOpen.value = false
  alert('Mensagem enviada com sucesso!')
}

const toggleAutoBilling = (payment: any) => {
  emit('toggle-autobilling', payment)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
