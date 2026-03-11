<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <UiKStatCard 
      title="A Receber (Mês)" 
      :value="formatCurrency(stats.pendingAmount)" 
      :trend="stats.pendingPaymentsCount + ' boletos'" 
      :is-positive="false"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 15h2M8 15h0M16 15h0M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M4 11v6M20 11v6"/><path d="m9 2 3 3 3-3"/></svg>
      </template>
    </UiKStatCard>

    <UiKStatCard 
      title="Liquidez Atual" 
      :value="formatCurrency(stats.receivedMonth)" 
      trend="84% pago" 
      :is-positive="true"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5L9.5 12 17 19M7 5l7.5 7L7 19"/></svg>
      </template>
    </UiKStatCard>

    <UiKStatCard 
      title="Inadimplência" 
      :value="formatCurrency(stats.lateAmount || 0)" 
      trend="Crítico" 
      :is-positive="false"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </template>
    </UiKStatCard>

    <UiKStatCard 
      title="Burn Rate" 
      :value="formatCurrency(stats.totalExpenses)" 
      trend="Fixos + APIs" 
      :is-positive="false"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
      </template>
    </UiKStatCard>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: any
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
