<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <UiKLoader 
        v-if="loading" 
        message="Analisando Métricas do Motor..." 
      />
      
      <div v-else class="space-y-12 mb-20 animate-in fade-in duration-700">
        <BlocksKPageHeader title="Dashboard" subtitle="Visão geral do negócio">
          <template #actions>
            <div class="flex items-center gap-3">
              <select 
                class="bg-[#111112] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border border-white/10 outline-none cursor-pointer"
              >
                <option>Mês Atual (Março)</option>
                <option>Trimestre Atual</option>
                <option>Semestre Atual</option>
                <option>Anual 2026</option>
              </select>
              <button 
                @click="fetchStats"
                class="btn-primary text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                Sincronizar
              </button>
            </div>
          </template>
        </BlocksKPageHeader>
        
        <div class="space-y-8">
           <BlocksKDashboardMetrics :stats="stats" />
           <BlocksKFinanceCollectionSummary :payments="stats.paymentsList" />
        </div>

        <BlocksKDashboardOperationStats :stats="stats" />
        
        <!-- INTELIGÊNCIA DE COBRANÇA -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
           <BlocksKFinanceConversionFunnel :payments="stats.paymentsList" />
           <BlocksKFinanceCashflowForecast :payments="stats.paymentsList" />
           <BlocksKFinanceChurnRisk :payments="stats.paymentsList" />
        </div>

        <!-- PERFORMANCE E GRÁFICOS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BlocksKFinanceEvolutionChart :payments="stats.paymentsList" />
          <BlocksKFinanceDistributionChart :payments="stats.paymentsList" />
        </div>

        <BlocksKDashboardMainContent :stats="stats" />

        <BlocksKGlobalFooter />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const { stats, loading, fetchStats } = useAnalytics()

onMounted(() => {
  fetchStats()
})
</script>
