<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
    <div class="space-y-1">
      <h1 class="text-3xl font-bold text-kros-text dark:text-kros-surface tracking-tighter uppercase">
        Gerenciar <span class="text-kros-blue">Empresas</span>
      </h1>
      <p class="text-xs text-white/70 tracking-widest font-bold uppercase">Lista consolidada de parceiros e faturamento ativo</p>
    </div>
    
    <button 
      @click="$emit('add-company')"
      class="btn-primary px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      Nova Empresa
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits(['add-company'])
</script>
