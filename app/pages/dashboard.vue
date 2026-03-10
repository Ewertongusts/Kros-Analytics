<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <div v-if="loading" class="flex flex-col items-center justify-center h-[70vh] gap-6 animate-pulse">
        <div class="w-16 h-16 bg-kros-blue/10 rounded-3xl flex items-center justify-center text-kros-blue">
          <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <p class="text-[11px] font-black uppercase tracking-[0.4em] opacity-30">Analysing Engine Stats...</p>
      </div>
      
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
