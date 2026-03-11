<template>
  <div class="p-6 rounded-[2.5rem] bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/10 transition-all flex flex-col h-full">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="font-black text-xl text-white tracking-tighter uppercase">Funil de Conversão</h3>
        <p class="text-[9px] font-bold text-white/50 tracking-[0.2em] mt-1 uppercase">Desempenho de Recuperação e Baixas</p>
      </div>
      <div class="w-10 h-10 rounded-2xl bg-kros-blue/10 flex items-center justify-center text-kros-blue">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H7M17 19H7M19 12H5"/></svg>
      </div>
    </div>

    <!-- FUNNEL SVG -->
    <div class="flex-1 flex flex-col justify-center gap-4 relative">
      <div v-for="(stage, idx) in funnelData" :key="stage.label" 
           class="group/stage relative"
           :style="{ width: stage.width + '%', margin: '0 auto' }">
        
        <!-- Tooltip -->
        <div class="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#1A1A1C]/90 backdrop-blur-md border border-white/5 rounded-xl shadow-2xl opacity-0 scale-95 group-hover/stage:opacity-100 group-hover/stage:scale-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap">
          <p class="text-[10px] font-bold text-white uppercase tracking-wider mb-0.5">{{ stage.label }}</p>
          <p class="text-[9px] text-white/40 font-medium italic lowercase">{{ stage.description }}</p>
        </div>

        <!-- Bar/Layer -->
        <div 
          :class="[
            'h-14 rounded-xl transition-all duration-700 flex items-center justify-between px-6 relative overflow-hidden border backdrop-blur-xl cursor-help',
            idx === 0 ? 'bg-white/[0.02] border-white/10 group-hover/stage:border-white/20' : 
            idx === 1 ? 'bg-kros-blue/[0.05] border-kros-blue/20 group-hover/stage:border-kros-blue/40' : 
            'bg-emerald-500/[0.05] border-emerald-500/20 group-hover/stage:border-emerald-500/40'
          ]"
        >
          <!-- Glass Reflection Shine -->
          <div class="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent pointer-events-none"></div>

          <!-- Bottom Accent Line -->
          <div 
            class="absolute inset-x-0 bottom-0 h-px transition-all duration-700 opacity-50"
            :class="idx === 0 ? 'bg-white' : idx === 1 ? 'bg-kros-blue' : 'bg-emerald-500'"
          ></div>

          <div class="z-10 flex flex-col">
            <span class="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover/stage:text-white/60 transition-colors">{{ stage.label }}</span>
            <span class="text-lg font-medium text-white tracking-tight">{{ stage.value }}</span>
          </div>

          <div class="z-10 flex flex-col items-end">
             <span class="text-[10px] font-medium text-white/90">{{ stage.percentage }}%</span>
             <span class="text-[8px] font-medium text-white/20 uppercase tracking-widest">{{ stage.sub }}</span>
          </div>
        </div>

        <!-- Connection Light -->
        <div v-if="idx < funnelData.length - 1" class="h-6 flex justify-center items-center">
            <div class="w-px h-full bg-gradient-to-b from-white/10 to-transparent"></div>
        </div>
      </div>

      <!-- Center line decoration -->
      <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/5 -z-10"></div>
    </div>

    <!-- INSIGHT -->
    <div class="mt-8 pt-6 border-t border-white/5">
       <div class="flex items-center gap-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.5 8.5L10 12 2 20"/><path d="M16 7h6v6"/></svg>
          </div>
          <p class="text-[10px] font-bold text-emerald-500/80 leading-relaxed uppercase tracking-widest">
            Sua taxa de conversão direta (Pagas / Notificadas) está em <span class="text-emerald-400">{{ directConversion }}%</span>. Excelente performance!
          </p>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  payments: any[]
}>()

const metrics = computed(() => {
  const total = props.payments.length
  const notified = props.payments.filter(p => p.cron_message || p.status === 'paid').length
  const paid = props.payments.filter(p => p.status === 'paid').length

  return { total, notified, paid }
})

const funnelData = computed(() => {
  const { total, notified, paid } = metrics.value
  
  return [
    { 
      label: 'Total Emitido', 
      value: total, 
      percentage: 100, 
      width: 100, 
      sub: 'Base de Operações',
      description: 'A base de todas as cobranças geradas pelo sistema.'
    },
    { 
      label: 'Notificadas', 
      value: notified, 
      percentage: total > 0 ? Math.round((notified / total) * 100) : 0, 
      width: 85, 
      sub: 'Alcance WhatsApp',
      description: 'Quantas dessas cobranças já foram enviadas (via automação ou manualmente).'
    },
    { 
      label: 'Liquidadas', 
      value: paid, 
      percentage: total > 0 ? Math.round((paid / total) * 100) : 0, 
      width: 70, 
      sub: 'Sucesso / Caixa',
      description: 'O sucesso final — quantas dessas cobranças foram efetivamente pagas.'
    }
  ]
})

const directConversion = computed(() => {
  const { notified, paid } = metrics.value
  if (notified === 0) return 0
  return Math.round((paid / notified) * 100)
})
</script>
