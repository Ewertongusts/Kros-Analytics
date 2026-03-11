<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <UiKLoader 
        v-if="loading" 
        message="Analisando Métricas do Motor..." 
      />
      
      <div v-else class="space-y-12 mb-20 animate-in fade-in duration-700">
        <BlocksKDashboardPageHeader @sync="fetchStats" />
        
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
