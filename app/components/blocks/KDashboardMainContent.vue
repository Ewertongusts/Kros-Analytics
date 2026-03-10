<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
    <!-- Bloco de Receita -->
    <BlocksKDashboardRevenueChart :stats="stats" />
    
    <!-- Bloco de Despesas -->
    <BlocksKDashboardExpensesChart :stats="stats" />
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Lucratividade Líquida (Saúde Financeira) -->
    <div class="p-6 rounded-2xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] relative overflow-hidden flex flex-col justify-between group h-full">
       <div class="flex justify-between items-start mb-6">
          <div>
            <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Performance de Lucro</h4>
            <h3 class="text-xl font-bold text-kros-text dark:text-kros-surface tracking-tighter uppercase mt-1">Margem de Lucro</h3>
          </div>
          <div class="bg-kros-text/5 dark:bg-white/5 p-2.5 rounded-xl text-kros-text dark:text-kros-surface/40 shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
       </div>

       <div class="flex items-end gap-4 mb-6">
          <span class="text-4xl font-bold tracking-tighter text-emerald-500">{{ Math.round(profitabilityRatio * 100) }}%</span>
          <div class="pb-1.5 flex flex-col">
             <span class="text-[9px] font-bold uppercase tracking-widest text-white/60 transition-transform group-hover:translate-x-1 underline decoration-white/10 underline-offset-4">Retenção de Capital</span>
          </div>
       </div>

       <div class="space-y-4">
          <div class="h-2 w-full bg-kros-text/5 dark:bg-kros-surface/5 rounded-full overflow-hidden">
             <div class="h-full bg-emerald-500 rounded-full transition-all duration-1000" :style="{ width: (profitabilityRatio * 100) + '%' }"></div>
          </div>
          <div class="flex justify-between items-center bg-emerald-500/[0.03] border border-emerald-500/10 p-3 rounded-xl">
             <span class="text-[10px] font-bold opacity-80 text-white uppercase tracking-tighter">Lucro Líquido Real</span>
             <span class="text-xs font-bold text-emerald-400 tracking-tighter">{{ formatCurrency(stats.mrr - stats.totalExpenses) }}</span>
          </div>
       </div>

       <!-- Background Decoration -->
       <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full"></div>
    </div>

    <!-- Progresso de Metas (Faturamento) -->
    <div class="p-6 rounded-2xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] flex flex-col justify-between group h-full">
       <div class="flex justify-between items-start mb-6">
          <div>
            <h4 class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">Metas de Receita</h4>
            <h3 class="text-xl font-medium text-kros-text dark:text-kros-surface tracking-tighter uppercase mt-1">Progresso Mensal</h3>
          </div>
          <div class="bg-kros-blue/10 p-2.5 rounded-xl text-kros-blue">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          </div>
       </div>

       <div class="space-y-6">
          <div class="space-y-2">
             <div class="flex justify-between items-end">
                <span class="text-xs font-medium opacity-80 text-white uppercase tracking-tighter">Março / 2026</span>
                <span class="text-sm font-bold tracking-tight text-kros-blue">{{ Math.round((stats.mrr / 80000) * 100) }}% da Meta</span>
             </div>
             <div class="h-2 w-full bg-kros-text/5 dark:bg-kros-surface/5 rounded-full overflow-hidden">
                <div class="h-full btn-primary rounded-full transition-all duration-1000" :style="{ width: Math.min((stats.mrr / 80000 * 100), 100) + '%' }"></div>
             </div>
             <div class="flex justify-between text-[10px] font-medium opacity-80 text-white/80 uppercase tracking-widest pt-1">
                <span>{{ formatCurrency(stats.mrr) }} real</span>
                <span>{{ formatCurrency(80000) }} alvo</span>
             </div>
          </div>
       </div>
    </div>

    <!-- Divisão de Custos (Onde o dinheiro vai) -->
    <div class="p-6 rounded-2xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] flex flex-col justify-between h-full">
       <div class="flex justify-between items-start mb-6">
          <div>
            <h4 class="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">Gestão de Saídas</h4>
            <h3 class="text-xl font-medium text-red-500 tracking-tighter uppercase mt-1">Onde você gasta</h3>
          </div>
          <div class="bg-red-500/10 p-2.5 rounded-xl text-red-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
       </div>

       <div class="space-y-4">
          <div class="flex justify-between items-center bg-kros-text/[0.02] dark:bg-white/[0.02] p-3 rounded-xl border border-kros-text/5 dark:border-white/5 transition-colors hover:border-kros-blue/20">
             <div class="flex flex-col">
                <span class="text-[10px] font-bold uppercase tracking-widest opacity-80 text-white">Infraestrutura</span>
                <span class="text-xs font-medium text-white/70">Servidores & Cloud</span>
             </div>
             <span class="text-sm font-bold text-white/90">{{ formatCurrency(stats.totalExpenses * 0.7) }}</span>
          </div>
          <div class="flex justify-between items-center bg-kros-text/[0.02] dark:bg-white/[0.02] p-3 rounded-xl border border-kros-text/5 dark:border-white/5 transition-colors hover:border-indigo-500/20">
             <div class="flex flex-col">
                <span class="text-[10px] font-bold uppercase tracking-widest opacity-80 text-white">Software</span>
                <span class="text-xs font-medium text-white/70">APIs & Assinaturas</span>
             </div>
             <span class="text-sm font-bold text-white/90">{{ formatCurrency(stats.totalExpenses * 0.3) }}</span>
          </div>
          <div class="pt-2 border-t border-white/5 flex justify-between items-center">
             <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/90 transition-colors">Total de Despesas</span>
             <span class="text-lg font-bold text-red-500 tracking-tighter">{{ formatCurrency(stats.totalExpenses) }}</span>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  stats: any
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

// Proporção de saúde financeira (Receita vs Despesa)
const profitabilityRatio = computed(() => {
  if (!props.stats.mrr || props.stats.mrr === 0) return 0
  const margin = (props.stats.mrr - props.stats.totalExpenses) / props.stats.mrr
  return Math.min(Math.max(margin, 0), 1) // Garantir entre 0 e 100%
})
</script>
