<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
    <div class="space-y-1">
      <h1 class="text-3xl font-bold text-kros-text dark:text-kros-surface tracking-tighter uppercase italic">
        GESTÃO <span class="text-kros-blue">FINANCEIRA</span>
      </h1>
      <p class="text-xs text-white/70 tracking-widest font-bold uppercase">Controle de Fluxo de Caixa, Cobranças e Despesas</p>
    </div>
    
    <div class="flex items-center gap-3">
        <button 
          @click="$emit('add-expense')"
          class="btn-primary text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Registrar Gasto
        </button>
        <button 
          @click="$emit('sync')"
          class="btn-primary text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
          Sincronizar
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['add-expense', 'sync'])
</script>
