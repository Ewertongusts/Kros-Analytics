<template>
  <div class="p-6 rounded-[2.5rem] bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/10 transition-all flex flex-col h-full relative overflow-hidden">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="font-black text-xl text-white tracking-tighter uppercase">Projeção de Caixa</h3>
        <p class="text-[9px] font-bold text-white/50 tracking-[0.2em] mt-1 uppercase">Previsão de Recebimentos (Próximos 30 dias)</p>
      </div>
      <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
    </div>

    <!-- BARS CONTAINER -->
    <div class="flex-1 flex items-end justify-between gap-6 min-h-[180px] px-6 mb-8">
      <div v-for="(period, idx) in forecastData" :key="period.label" class="flex-1 flex flex-col items-center group/bar max-w-[100px]">
        <!-- Value Label -->
        <span class="text-[10px] font-bold text-white mb-3 opacity-0 group-hover/bar:opacity-100 transition-all duration-300">
          {{ formatCurrency(period.value) }}
        </span>
        
        <!-- Bar Container -->
        <div class="w-full relative flex flex-col justify-end items-center h-full">
            <div 
              class="w-full rounded-xl transition-all duration-700 relative overflow-hidden backdrop-blur-xl border border-white/10 group-hover/bar:border-white/20"
              :class="[
                idx === 0 ? 'bg-blue-500/10' : idx === 1 ? 'bg-indigo-500/10' : 'bg-emerald-500/10'
              ]"
              :style="{ height: Math.max(period.percentage * 1.5, 12) + 'px' }"
            >
                <!-- Glass Reflection Shine -->
                <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                
                <!-- Inner Glow (Bottom) -->
                <div 
                  class="absolute inset-x-0 bottom-0 h-1 transition-all duration-500"
                  :class="idx === 0 ? 'bg-blue-500/40' : idx === 1 ? 'bg-indigo-500/40' : 'bg-emerald-500/40'"
                ></div>
            </div>
        </div>

        <!-- Label -->
        <div class="mt-4 flex flex-col items-center">
           <span class="text-[10px] font-bold text-white/70 uppercase tracking-widest">{{ period.label }}</span>
           <span class="text-[7px] font-medium text-white/20 uppercase tracking-[0.2em] mt-1">{{ period.sub }}</span>
        </div>
      </div>
    </div>

    <!-- TOTAL FOOTER -->
    <div class="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
       <div class="flex flex-col">
          <span class="text-[9px] font-black text-white/40 uppercase tracking-widest">Previsão Total</span>
          <span class="text-xl font-black text-white tracking-tighter">{{ formatCurrency(totalForecast) }}</span>
       </div>
       <div class="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <span class="text-[10px] font-black text-emerald-500 uppercase">+{{ Math.round((totalForecast / 5000) * 100) }}% alvo</span>
       </div>
    </div>

    <!-- Decorative background -->
    <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  payments: any[]
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)
}

const forecastData = computed(() => {
  const now = new Date()
  
  const getSumForDays = (days: number) => {
    const targetDate = new Date()
    targetDate.setDate(now.getDate() + days)
    
    return props.payments
      .filter(p => {
        if (p.status !== 'pending' && p.status !== 'overdue') return false
        const dueDate = new Date(p.due_date)
        return dueDate <= targetDate && dueDate >= now
      })
      .reduce((acc, p) => acc + Number(p.amount || 0), 0)
  }

  const v7 = getSumForDays(7)
  const v15 = getSumForDays(15)
  const v30 = getSumForDays(30)
  
  const max = Math.max(v30, 1000) // Avoid division by zero

  return [
    { 
      label: '7 Dias', 
      value: v7, 
      sub: 'Imediato',
      percentage: (v7 / max) * 100,
      color: 'from-blue-600 to-blue-400',
      glowColor: 'bg-blue-500'
    },
    { 
      label: '15 Dias', 
      value: v15, 
      sub: 'Curto Prazo',
      percentage: (v15 / max) * 100,
      color: 'from-indigo-600 to-indigo-400',
      glowColor: 'bg-indigo-500'
    },
    { 
      label: '30 Dias', 
      value: v30, 
      sub: 'Mensal',
      percentage: (v30 / max) * 100,
      color: 'from-emerald-600 to-emerald-400',
      glowColor: 'bg-emerald-500'
    }
  ]
})

const totalForecast = computed(() => {
    const data = forecastData.value
    if (!data.length) return 0
    return data[data.length - 1]?.value || 0
})
</script>
