<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group transition-all">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:justify-end">
      <FinanceHistoryKHistoryFilters
        v-model:search-query="searchQuery"
        v-model:plan-filter="planFilter"
        v-model:start-date="startDate"
        v-model:end-date="endDate"
        :available-plans="availablePlans"
        :total-records="searchFilteredHistory.length"
        :total-received="totalReceived"
        @config="$emit('config')"
        @sync="$emit('sync')"
      />
    </div>

    <!-- Barra de Ações em Massa -->
    <div v-if="selectedIds.length > 0" class="mb-6 flex items-center justify-between gap-4 px-6 py-4 bg-kros-blue/10 border border-kros-blue/20 rounded-2xl">
      <div class="flex items-center gap-3">
        <span class="text-sm font-black uppercase tracking-widest text-white">
          {{ selectedIds.length }} SELECIONADOS
        </span>
        <span class="text-xs font-bold text-white/60">
          {{ formatCurrency(selectedTotal) }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <!-- Pagar em massa -->
        <button
          @click="$emit('batch-pay')"
          class="p-2 rounded-lg transition-all border flex items-center justify-center"
          :style="{ backgroundColor: 'var(--kros-blue, #007BFF)', borderColor: 'var(--kros-blue, #007BFF)' }"
          title="Receber Pagamentos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </button>
        
        <!-- Estornar em massa -->
        <button
          @click="$emit('batch-reverse')"
          class="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-all border border-yellow-500/20 hover:border-yellow-500/40 flex items-center justify-center"
          title="Estornar Pagamentos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>

        <!-- Limpar seleção -->
        <button
          @click="$emit('clear-selection')"
          class="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest"
        >
          Limpar
        </button>
      </div>
    </div>

    <FinanceHistoryKHistoryTable 
      :payments="paginatedHistory"
      :selected-ids="selectedIds"
      @pay="$emit('pay', $event)"
      @reverse="$emit('reverse', $event)"
      @open-client-details="$emit('open-client-details', $event)"
      @toggle-select="$emit('toggle-select', $event)"
    />

    <FinanceLogsKLogsPagination
      v-if="totalPages > 1"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      :visible-pages="visiblePages"
    />

    <div v-if="searchFilteredHistory.length === 0" class="flex flex-col items-center justify-center py-20 opacity-60">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-white/20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
       <p class="font-bold uppercase tracking-widest text-[10px] text-white/40">Nenhum registro de pagamento encontrado para este período</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  history: any[]
  activeSubTab: string
  selectedIds: string[]
}>()

defineEmits(['update:activeSubTab', 'sync', 'config', 'pay', 'reverse', 'open-client-details', 'toggle-select', 'batch-pay', 'batch-reverse', 'clear-selection'])

const {
  startDate,
  endDate,
  searchQuery,
  planFilter,
  currentPage,
  searchFilteredHistory,
  availablePlans,
  totalPages,
  paginatedHistory,
  visiblePages,
  totalReceived
} = useFinanceHistory(props.history)

const selectedTotal = computed(() => {
  return props.history
    .filter(p => props.selectedIds.includes(p.id))
    .reduce((sum, p) => sum + (p.amount || 0), 0)
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>

<style scoped>
/* Estilos movidos para componentes filhos */
</style>
