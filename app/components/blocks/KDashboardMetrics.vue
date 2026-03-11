<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <UiKStatCard 
      title="MRR (Mensal Recorrente)" 
      :value="formatCurrency(stats.mrr)" 
      trend="+5.2%" 
      :is-positive="true"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5l-5-3-5 3M17 19l-5 3-5-3"/></svg>
      </template>
    </UiKStatCard>

    <UiKStatCard 
      title="LTV (Valor Médio/Cliente)" 
      :value="formatCurrency(stats.ltv)" 
      trend="+1.8%" 
      :is-positive="true"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </template>
    </UiKStatCard>

    <UiKStatCard 
      title="Clientes Novos (Mês)" 
      :value="stats.newClients.toString()" 
      trend="+2" 
      :is-positive="true"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
      </template>
    </UiKStatCard>

    <UiKStatCard 
      title="Burn Rate (Custos)" 
      :value="formatCurrency(stats.totalExpenses)" 
      trend="Custos Totais" 
      :is-positive="false"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
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

