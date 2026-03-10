<template>
  <div class="flex flex-col items-center justify-center min-h-[50vh] gap-6 animate-pulse">
    <div class="relative w-20 h-20">
      <!-- Glow effect -->
      <div class="absolute inset-0 bg-kros-blue/20 blur-3xl rounded-full scale-150"></div>
      
      <!-- Blue spinning loader -->
      <div class="relative w-full h-full bg-[#111112] border border-white/5 rounded-3xl flex items-center justify-center text-kros-blue shadow-inner">
        <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
    </div>
    
    <div class="text-center space-y-2">
      <p class="text-[12px] font-black italic uppercase tracking-[0.5em] text-white/80">Kros Analytics</p>
      <p class="text-[9px] font-bold uppercase tracking-[0.3em] text-kros-blue/50 italic px-4 py-1.5 bg-kros-blue/5 rounded-full border border-kros-blue/10 animate-fade-in">
        {{ message || 'Sincronizando dados no terminal...' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}
</style>
