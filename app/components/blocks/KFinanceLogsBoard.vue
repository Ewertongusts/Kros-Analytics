<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group transition-all">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
      <FinanceLogsKLogsFilters
        v-model:search-query="searchQuery"
        v-model:type-filter="typeFilter"
        v-model:status-filter="statusFilter"
        :total-logs="filteredLogs.length"
        @refresh="fetchLogs"
      />
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 opacity-50">
       <svg class="animate-spin text-white mb-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
       <p class="text-[10px] font-bold uppercase tracking-widest text-white">Buscando rastros digitais...</p>
    </div>

    <div v-else-if="logs.length === 0" class="flex flex-col items-center justify-center py-20 opacity-40 border border-dashed border-white/10 rounded-3xl">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-white"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
       <h4 class="font-bold uppercase tracking-widest text-xs text-white">Nenhum disparo detectado</h4>
    </div>

    <div v-else>
       <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
         <FinanceLogsKLogsCard
           v-for="log in paginatedLogs"
           :key="log.id"
           :company-name="log.company_name || 'Sem nome'"
           :whatsapp="log.whatsapp || 'Sem telefone'"
           :is-cron="!!log.is_cron"
           :status="log.status || 'Desconhecido'"
           :formatted-date="formatDate(log.created_at)"
           :message-body="log.message_body || 'Sem mensagem'"
           :template-name="log.template_name"
           @view-details="openDetails(log)"
         />
       </div>

       <FinanceLogsKLogsPagination
         v-if="totalPages > 1"
         v-model:current-page="currentPage"
         :total-pages="totalPages"
         :visible-pages="visiblePages"
       />
    </div>

    <!-- Modal de Detalhes -->
    <FinanceLogsKLogDetailsModal
      :is-open="isModalOpen"
      :log="selectedLog"
      @close="closeDetails"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  activeSubTab: string
}>()

defineEmits(['update:activeSubTab'])

const {
  logs,
  loading,
  searchQuery,
  typeFilter,
  statusFilter,
  currentPage,
  filteredLogs,
  totalPages,
  paginatedLogs,
  visiblePages,
  fetchLogs,
  formatDate
} = useFinanceLogs()

const isModalOpen = ref(false)
const selectedLog = ref<any>({})

const openDetails = (log: any) => {
  selectedLog.value = log
  isModalOpen.value = true
}

const closeDetails = () => {
  isModalOpen.value = false
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
/* Estilos movidos para componentes filhos */
</style>
