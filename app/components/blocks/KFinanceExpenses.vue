<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/5 transition-all">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h3 class="font-bold text-lg text-white">Gestão de Saídas (Custos)</h3>
        <p class="text-[10px] text-white/50 uppercase tracking-widest mt-1 opacity-60">Controle de infraestrutura e assinaturas ativas</p>
      </div>
      <div class="flex items-center gap-2 bg-red-500/5 px-4 py-2 rounded-xl border border-red-500/10 w-fit">
         <span class="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total no Mês:</span>
         <span class="text-sm font-black text-red-500">{{ formatCurrency(totalExpenses) }}</span>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-separate border-spacing-y-2.5">
        <thead>
          <tr class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            <th class="px-4 py-3">Descrição do Custo</th>
            <th class="px-4 py-3">Categoria</th>
            <th class="px-4 py-3">Recorrência</th>
            <th class="px-4 py-3">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in sortedExpenses" :key="expense.id" 
              class="group/row bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-2xl border border-transparent hover:border-red-500/10">
            <td class="px-4 py-5 first:rounded-l-2xl">
              <p class="font-bold text-xs text-white uppercase tracking-tight">{{ expense.description }}</p>
              <p class="text-[9px] text-white/40 font-bold uppercase tracking-tighter mt-1">Registrado em {{ formatDate(expense.created_at) }}</p>
            </td>
            <td class="px-4 py-5">
               <span class="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/70">
                 {{ expense.category || 'Geral' }}
               </span>
            </td>
            <td class="px-4 py-5">
               <div class="flex items-center gap-1.5">
                 <svg v-if="expense.is_recurring" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-kros-blue"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                 <span class="text-[10px] font-bold uppercase tracking-widest" :class="expense.is_recurring ? 'text-kros-blue' : 'text-white/40'">
                   {{ expense.is_recurring ? 'Mensal' : 'Único' }}
                 </span>
               </div>
            </td>
            <td class="px-4 py-5 last:rounded-r-2xl">
               <span class="text-xs font-black tabular-nums text-red-400">{{ formatCurrency(expense.amount) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="expenses?.length === 0" class="flex flex-col items-center justify-center py-20 opacity-40">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
       <p class="font-bold uppercase tracking-widest text-[10px]">Nenhuma despesa registrada</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  expenses: any[]
}>()

const totalExpenses = computed(() => {
  return props.expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
})

const sortedExpenses = computed(() => {
  if (!props.expenses) return []
  return [...props.expenses].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
</script>
