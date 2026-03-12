<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
    <!-- Card: Pendentes -->
    <div class="p-5 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl relative overflow-hidden group">
      <div class="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">A Receber</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xl font-black text-white tracking-tighter">{{ formatCurrency(summary.pendingAmount) }}</span>
        <span class="text-[10px] font-bold text-blue-500/60 uppercase">{{ summary.pendingCount }} cobranças</span>
      </div>
    </div>

    <!-- Card: Atrasados -->
    <div class="p-5 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl relative overflow-hidden group">
      <div class="absolute -right-4 -top-4 w-16 h-16 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all"></div>
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
        </div>
        <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Em Atraso</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xl font-black text-red-500 tracking-tighter">{{ formatCurrency(summary.overdueAmount) }}</span>
        <span class="text-[10px] font-bold text-red-500/60 uppercase">{{ summary.overdueCount }} pendências</span>
      </div>
    </div>

    <!-- Card: Churn -->
    <div class="p-5 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl relative overflow-hidden group">
      <div class="absolute -right-4 -top-4 w-16 h-16 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all"></div>
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
        </div>
        <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Churn (30d+)</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xl font-black text-orange-500 tracking-tighter">{{ formatCurrency(summary.churnAmount) }}</span>
        <span class="text-[10px] font-bold text-orange-500/60 uppercase">{{ summary.churnCount }} perdidos</span>
      </div>
    </div>

    <!-- Card: Recuperação -->
    <div class="p-5 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl relative overflow-hidden group">
      <div class="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Recuperação</span>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-xl font-black text-white tracking-tighter">{{ recoveryRate }}%</span>
        <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-500 transition-all duration-1000" :style="{ width: recoveryRate + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Card: Total Liquidados -->
    <div class="p-5 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl relative overflow-hidden group">
      <div class="absolute -right-4 -top-4 w-16 h-16 bg-kros-blue/5 rounded-full blur-2xl group-hover:bg-kros-blue/10 transition-all"></div>
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-xl bg-kros-blue/10 flex items-center justify-center text-kros-blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 7 3 5-3 5"/><path d="m19 7-3 5 3 5"/></svg>
        </div>
        <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Liquidado Mês</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xl font-black text-white tracking-tighter">{{ formatCurrency(summary.paidAmount) }}</span>
        <span class="text-[10px] font-bold text-kros-blue uppercase tracking-tighter">{{ summary.paidCount }} baixas</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  payments: any[]
}>()

const summary = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return props.payments.reduce((acc, p) => {
    const amount = Number(p.amount) || 0
    const status = p.status
    
    // Filtro básico para o mês atual nas liquidações
    const payDate = p.paid_at ? new Date(p.paid_at) : null
    const isThisMonth = payDate && payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear

    if (status === 'Pago' && isThisMonth) {
      acc.paidAmount += amount
      acc.paidCount++
    } else if (status === 'Atrasado') {
      acc.overdueAmount += amount
      acc.overdueCount++
    } else if (status === 'Pendente') {
      acc.pendingAmount += amount
      acc.pendingCount++
    } else if (status === 'Churn') {
      acc.churnAmount += amount
      acc.churnCount++
    }

    return acc
  }, {
    pendingAmount: 0,
    pendingCount: 0,
    overdueAmount: 0,
    overdueCount: 0,
    churnAmount: 0,
    churnCount: 0,
    paidAmount: 0,
    paidCount: 0
  })
})

const recoveryRate = computed(() => {
  const total = summary.value.paidCount + summary.value.overdueCount
  if (total === 0) return 0
  return Math.round((summary.value.paidCount / total) * 100)
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
