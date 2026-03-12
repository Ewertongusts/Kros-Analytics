<template>
  <div class="flex items-center justify-center group/status relative">
    <span 
      :class="['w-2.5 h-2.5 rounded-full shadow-[0_0_12px_currentColor] transition-all duration-300 group-hover/status:scale-125 cursor-help', statusClass]" 
      :style="{ color: statusHex }"
    ></span>
    
    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-[8px] font-black text-white uppercase tracking-[0.2em] rounded-md opacity-0 group-hover/status:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[110] border border-white/10 shadow-2xl">
      {{ status }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const statusClass = computed(() => {
  switch (props.status?.toLowerCase()) {
    case 'pago': return 'bg-emerald-500 ring-emerald-500/10'
    case 'pendente': return 'bg-amber-500 ring-amber-500/10'
    case 'atrasado': return 'bg-red-500 ring-red-500/10'
    case 'churn': return 'bg-red-950 ring-red-900/40 border border-red-500/20 shadow-[0_0_15px_rgba(153,27,27,0.4)]'
    default: return 'bg-slate-500 ring-slate-500/10'
  }
})

const statusHex = computed(() => {
  switch (props.status?.toLowerCase()) {
    case 'pago': return '#10b981'
    case 'pendente': return '#f59e0b'
    case 'atrasado': return '#ef4444'
    case 'churn': return '#991b1b'
    default: return '#64748b'
  }
})
</script>
