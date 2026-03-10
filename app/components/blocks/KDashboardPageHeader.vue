<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 transition-all">
    <div class="space-y-1">
      <h1 class="text-3xl font-bold text-kros-text dark:text-kros-surface tracking-tighter uppercase italic">
        KROS <span class="text-kros-blue">ANALYTICS</span>
      </h1>
      <p class="text-[10px] text-kros-blue font-bold uppercase tracking-[0.3em] mt-1">Visão Consolidada de Receita e Performance</p>
    </div>
    
    <div class="flex items-center gap-4 bg-[#111112] p-1 rounded-xl border border-white/5 shadow-inner">
      <select 
        class="bg-transparent text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 outline-none cursor-pointer"
      >
        <option>Mês Atual (Março)</option>
        <option>Trimestre Atual</option>
        <option>Semestre Atual</option>
        <option>Anual 2026</option>
      </select>
      <button 
        @click="$emit('sync')"
        class="bg-kros-blue hover:bg-kros-blue/80 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 rounded-lg transition-all shadow-[0_10px_30px_rgba(0,123,255,0.2)] active:scale-95 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
        Sincronizar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['sync'])
</script>
