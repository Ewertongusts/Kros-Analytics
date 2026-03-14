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

    <FinanceHistoryKHistoryTable 
      :payments="paginatedHistory" 
      @pay="$emit('pay', $event)"
      @reverse="$emit('reverse', $event)"
      @open-client-details="$emit('open-client-details', $event)"
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
const props = defineProps<{
  history: any[]
  activeSubTab: string
}>()

defineEmits(['update:activeSubTab', 'sync', 'config', 'pay', 'reverse', 'open-client-details'])

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
</script>

<style scoped>
/* Estilos movidos para componentes filhos */
</style>
