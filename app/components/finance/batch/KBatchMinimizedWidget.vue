<template>
  <div class="flex flex-col gap-4">
    <!-- Top: Info + Expand -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Circular Progress SVG -->
        <div class="relative w-10 h-10 shrink-0">
          <svg class="w-full h-full transform -rotate-90">
            <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="3" fill="transparent" class="text-white/5" />
            <circle 
              cx="20" cy="20" r="18" 
              stroke="currentColor" 
              stroke-width="3" 
              fill="transparent" 
              :stroke-dasharray="113" 
              :stroke-dashoffset="113 - (113 * (progress / total))" 
              class="text-kros-blue transition-all duration-500" 
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center text-kros-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </div>
        </div>
        <div>
          <p class="text-[11px] font-black text-white uppercase tracking-wider leading-none">Campanha Ativa</p>
          <p class="text-[10px] text-white/40 font-bold mt-1">{{ progress }} de {{ total }} concluídos</p>
        </div>
      </div>

      <button @click="$emit('expand')" class="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
      </button>
    </div>

    <!-- Bottom: Anti-Ban status (Compacto) -->
    <Transition name="fade">
      <div v-if="countdown > 0" class="flex items-center justify-between px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="text-[9px] font-black text-emerald-500 uppercase">Proteção Ativa</span>
        </div>
        <span class="text-[10px] font-black text-white tabular-nums">{{ countdown }}s</span>
      </div>
      <div v-else class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div class="h-full bg-kros-blue transition-all duration-500" :style="{ width: (progress / total) * 100 + '%' }"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progress: number
  total: number
  countdown: number
}>()

defineEmits(['expand'])
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
