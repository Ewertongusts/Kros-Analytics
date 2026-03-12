<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group transition-all">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:justify-end">
      <!-- TABS INTEGRADAS -->
      <BlocksKFinanceTabsHeader 
        :active-sub-tab="activeSubTab"
        @update:active-sub-tab="$emit('update:activeSubTab', $event)"
      />

      <div class="flex flex-wrap items-center gap-3 sm:gap-4 lg:flex-1 lg:justify-end">
        <!-- Total de Registros -->
        <div class="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest">Registros:</span>
          <span class="text-[11px] font-black text-white uppercase tracking-widest">{{ searchFilteredHistory.length }}</span>
        </div>

        <!-- Campo de Busca -->
        <div class="relative flex-1 lg:flex-initial lg:min-w-[240px]">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Buscar empresa..."
            class="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-kros-blue focus:outline-none transition-all"
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          <button 
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Filtro por Plano -->
        <div class="relative" v-if="availablePlans.length > 0">
          <button 
            @click="isPlanDropdownOpen = !isPlanDropdownOpen"
            class="flex items-center gap-4 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all text-white/70 hover:text-white"
          >
            <div class="flex flex-col items-start leading-none gap-1">
              <span class="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Plano</span>
              <span class="text-[11px] font-bold uppercase tracking-widest text-white">{{ planFilter === 'all' ? 'Todos' : planFilter }}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isPlanDropdownOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          <div 
            v-if="isPlanDropdownOpen" 
            class="absolute top-full right-0 mt-3 w-56 bg-[#111112] border border-white/10 rounded-2xl shadow-2xl z-[100] p-1.5 max-h-64 overflow-y-auto custom-scrollbar"
          >
            <button 
              @click="planFilter = 'all'; isPlanDropdownOpen = false"
              :class="['w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left', planFilter === 'all' ? 'bg-kros-blue text-white' : 'hover:bg-white/5 text-white/70']"
            >
              <span class="text-[10px] font-bold uppercase tracking-widest">Todos os Planos</span>
            </button>
            <button 
              v-for="plan in availablePlans" 
              :key="plan"
              @click="planFilter = plan; isPlanDropdownOpen = false"
              :class="['w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left', planFilter === plan ? 'bg-kros-blue text-white' : 'hover:bg-white/5 text-white/70']"
            >
              <span class="text-[10px] font-bold uppercase tracking-widest">{{ plan }}</span>
            </button>
          </div>
        </div>

        <!-- Filtro por Período -->
        <div class="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
          <div class="flex items-center gap-2">
            <label class="text-[9px] font-bold text-white/20 uppercase tracking-widest">Início:</label>
            <input 
              v-model="startDate"
              type="date"
              class="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
          <div class="w-px h-4 bg-white/10"></div>
          <div class="flex items-center gap-2">
            <label class="text-[9px] font-bold text-white/20 uppercase tracking-widest">Fim:</label>
            <input 
              v-model="endDate"
              type="date"
              class="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 px-4 py-3 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20 uppercase tracking-[0.2em]">
          <span class="text-white/50">Período:</span>
          <span>{{ formatCurrency(totalReceived) }}</span>
        </div>

        <!-- Botões Globais Integrados -->
        <div class="flex items-center gap-2 ml-2 pl-4 border-l border-white/5">
            <button 
              @click="$emit('config')"
              class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
              title="Gerenciar Empresas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </button>
            <button 
              @click="$emit('sync')"
              class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
              title="Sincronizar Dados"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
            </button>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto no-scrollbar">
      <table class="w-full min-w-[900px] text-left border-separate border-spacing-y-3">
        <thead>
          <tr class="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
            <th class="px-4 py-3">Empresa</th>
            <th class="px-4 py-3">Data Pagamento</th>
            <th class="px-4 py-3">Vencimento Original</th>
            <th class="px-4 py-3">Valor Pago</th>
            <th class="px-4 py-3">Plano</th>
            <th class="px-4 py-3 text-right">Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in paginatedHistory" :key="payment.id" 
              class="group/row bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl border border-transparent">
            <td class="px-4 py-5 first:rounded-l-2xl">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-[10px] border border-emerald-500/10">
                  {{ payment.companies?.name?.charAt(0) || 'E' }}
                </div>
                <span class="font-semibold text-sm text-white uppercase tracking-tight">{{ payment.companies?.name }}</span>
              </div>
            </td>
            <td class="px-4 py-5 font-medium">
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">{{ formatDate(payment.paid_at) }}</span>
            </td>
            <td class="px-4 py-5">
              <span class="text-xs font-medium text-white/40 uppercase tracking-widest">{{ formatDate(payment.due_date) }}</span>
            </td>
            <td class="px-4 py-5 font-bold tabular-nums text-white">
              {{ formatCurrency(payment.amount) }}
            </td>
            <td class="px-4 py-5">
              <span class="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-white/60 uppercase tracking-widest">{{ payment.plan_name }}</span>
            </td>
            <td class="px-4 py-5 last:rounded-r-2xl text-right">
              <span class="text-[10px] text-white/30 italic truncate max-w-[200px] block transition-all group-hover/row:text-white/60">
                {{ payment.notes || 'Sem observações' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <button 
        @click="currentPage--"
        :disabled="currentPage === 1"
        :class="['px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all', currentPage === 1 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white']"
      >
        Anterior
      </button>
      
      <div class="flex items-center gap-1">
        <button 
          v-for="page in visiblePages" 
          :key="page"
          @click="currentPage = page"
          :class="['px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all', currentPage === page ? 'bg-kros-blue text-white' : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white']"
        >
          {{ page }}
        </button>
      </div>

      <button 
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        :class="['px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all', currentPage === totalPages ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white']"
      >
        Próxima
      </button>
    </div>

    <div v-if="searchFilteredHistory.length === 0" class="flex flex-col items-center justify-center py-20 opacity-60">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-white/20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
       <p class="font-bold uppercase tracking-widest text-[10px] text-white/40">Nenhum registro de pagamento encontrado para este período</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  history: any[],
  activeSubTab: string
}>()

const emit = defineEmits(['update:activeSubTab', 'sync', 'config'])

// Inicializa com o mês atual
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] || ''
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] || ''

const startDate = ref<string>(firstDay)
const endDate = ref<string>(lastDay)
const searchQuery = ref('')
const planFilter = ref<string>('all')
const isPlanDropdownOpen = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10

const hasActiveFilters = computed(() => {
  return startDate.value !== firstDay || endDate.value !== lastDay || searchQuery.value !== '' || planFilter.value !== 'all'
})

const filteredHistory = computed(() => {
  return props.history.filter(p => {
    if (!p.paid_at) return false
    const payDate = p.paid_at.split('T')[0]
    return payDate >= startDate.value && payDate <= endDate.value
  }).sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
})

const searchFilteredHistory = computed(() => {
  let filtered = filteredHistory.value

  // Filtro de busca
  if (searchQuery.value) {
    filtered = filtered.filter(p => 
      p.companies?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filtro de plano
  if (planFilter.value !== 'all') {
    filtered = filtered.filter(p => p.plan_name === planFilter.value)
  }

  return filtered
})

const availablePlans = computed(() => {
  const plans = new Set<string>()
  filteredHistory.value.forEach(p => {
    if (p.plan_name) plans.add(p.plan_name)
  })
  return Array.from(plans).sort()
})

const totalPages = computed(() => {
  return Math.ceil(searchFilteredHistory.value.length / itemsPerPage)
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return searchFilteredHistory.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const totalReceived = computed(() => {
  return searchFilteredHistory.value.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
})

// Reset página quando filtros mudam
watch([searchQuery, planFilter, startDate, endDate], () => {
  currentPage.value = 1
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(date))
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
