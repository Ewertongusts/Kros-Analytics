<template>
  <div class="flex items-center gap-3">
    <div :class="['w-9 h-9 rounded-full flex items-center justify-center font-black text-[10px] border transition-all shadow-sm', avatarClass]">
      {{ companyName?.charAt(0) }}
    </div>
    <div class="flex flex-col">
      <p class="font-bold text-sm text-white uppercase tracking-tight">{{ companyName }}</p>
      <div class="flex items-center gap-2 mt-0.5">
        <p class="text-[9px] text-white/40 font-bold uppercase tracking-widest">{{ planName }}</p>
        <span v-if="rep" class="w-1 h-1 rounded-full bg-white/10"></span>
        <p v-if="rep" class="text-[9px] text-white/30 font-bold uppercase tracking-tighter">{{ rep }}</p>
      </div>
      <slot name="tags"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  companyName: string
  planName: string
  rep?: string
  status: string
}>()

const avatarClass = computed(() => {
  switch (props.status?.toLowerCase()) {
    case 'pago': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
    case 'pendente': return 'bg-amber-500/10 border-amber-500/20 text-amber-500'
    case 'atrasado': return 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
    case 'churn': return 'bg-red-950/40 border-red-500/30 text-red-700'
    default: return 'bg-white/5 border-white/10 text-white/40'
  }
})
</script>
