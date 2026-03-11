<template>
  <div class="p-6 rounded-[2.5rem] bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-red-500/20 transition-all flex flex-col h-full relative overflow-hidden">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="font-black text-xl text-white tracking-tighter uppercase">Risco de Churn</h3>
        <p class="text-[9px] font-bold text-white/50 tracking-[0.2em] mt-1 uppercase">Clientes em Zona Crítica</p>
      </div>
      <div class="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
    </div>

    <!-- RISK LIST -->
    <div class="flex-1 space-y-3">
      <div v-if="churnRisks.length === 0" class="h-full flex flex-col items-center justify-center py-8 opacity-40">
         <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-white/30"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
         <span class="text-[10px] font-black uppercase tracking-widest text-center text-white/60">Nenhum risco<br>crítico detectado</span>
      </div>

      <div v-for="risk in churnRisks.slice(0, 3)" :key="risk.id" 
           class="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-all group/item">
        <div class="flex justify-between items-start mb-2">
          <div class="flex flex-col">
            <span class="text-xs font-black text-white uppercase tracking-tighter group-hover/item:text-red-400 transition-colors">{{ risk.name }}</span>
            <span class="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">{{ risk.reason }}</span>
          </div>
          <div class="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
            <span class="text-[9px] font-black text-red-500 uppercase">{{ risk.days }} DIAS</span>
          </div>
        </div>

        <!-- PROGRESS BAR (Risk Intensity) -->
        <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
           <div 
             class="h-full bg-red-500 shadow-[0_0_10px_#EF4444] transition-all duration-1000" 
             :style="{ width: Math.min((risk.days / 15) * 100, 100) + '%' }"
           ></div>
        </div>
      </div>
    </div>

    <!-- FOOTER INSIGHT -->
    <div v-if="churnRisks.length > 0" class="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
       <div class="flex flex-col">
          <span class="text-[9px] font-black text-white/40 uppercase tracking-widest">Prejuízo Potencial</span>
          <span class="text-lg font-black text-red-500 tracking-tighter">{{ formatCurrency(potentialLoss) }}</span>
       </div>
       <button @click="navigateTo('/cobrancas')" class="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/20">
          Agir Agora
       </button>
    </div>

    <!-- Overlay de Alerta Critico -->
    <div v-if="churnRisks.length > 5" class="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  payments: any[]
}>()

const navigateTo = (path: string) => {
  const router = useRouter()
  router.push(path)
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)
}

const churnRisks = computed(() => {
  const risks: any[] = []
  const now = new Date()

  if (!props.payments) return []

  props.payments.forEach(p => {
    const currentStatus = (p.status || '').toLowerCase()
    
    // Considera 'overdue', 'atrasado' ou 'pending' com data passada
    if (currentStatus === 'overdue' || currentStatus === 'atrasado' || currentStatus === 'pending') {
      const dueDate = new Date(p.due_date)
      const diffTime = now.getTime() - dueDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays >= 1) { 
        risks.push({
          id: p.id,
          name: p.companies?.name || 'Cliente Indefinido',
          days: diffDays,
          amount: Number(p.amount || 0),
          reason: diffDays > 7 ? 'Risco Crítico' : 'Atraso Inicial'
        })
      }
    }
  })

  return risks.sort((a, b) => b.days - a.days)
})

const potentialLoss = computed(() => {
  return churnRisks.value.reduce((acc, risk) => acc + risk.amount, 0)
})
</script>
