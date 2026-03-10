<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <UiKLoader 
        v-if="loading" 
        message="Analisando Métricas do Motor..." 
      />
      
      <div v-else class="space-y-12 mb-20 animate-in fade-in duration-700">
        <BlocksKDashboardPageHeader @sync="fetchStats" />
        <BlocksKDashboardMetrics :stats="stats" />
        <BlocksKDashboardOperationStats :stats="stats" />
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
