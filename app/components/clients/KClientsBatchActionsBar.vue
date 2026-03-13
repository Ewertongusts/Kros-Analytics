<template>
  <div v-if="selectedCount > 0" class="flex items-center justify-between gap-4 px-6 py-4 bg-white/[0.02] border-b border-white/5 animate-in slide-in-from-top duration-300">
    <div class="flex items-center gap-4">
      <span class="text-[10px] font-bold uppercase tracking-widest text-white/70">
        {{ selectedCount }} {{ selectedCount === 1 ? 'cliente' : 'clientes' }} selecionado(s)
      </span>
      <button
        @click="$emit('clear-selection')"
        class="text-[10px] text-white/50 hover:text-white/70 transition-colors uppercase tracking-widest font-semibold"
      >
        Limpar
      </button>
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="$emit('export-csv')"
        class="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 border border-white/10"
        title="Exportar como CSV"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        CSV
      </button>

      <button
        @click="$emit('export-xlsx')"
        class="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 border border-white/10"
        title="Exportar como XLSX"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        XLSX
      </button>

      <button
        @click="$emit('import')"
        class="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 border border-white/10"
        title="Importar contatos"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        Importar
      </button>

      <div class="w-px h-6 bg-white/10"></div>

      <button
        @click="$emit('delete')"
        class="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 border border-red-500/20"
        title="Deletar clientes selecionados"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1.5">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        Deletar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedCount: number
}>()

defineEmits<{
  'clear-selection': []
  'export-csv': []
  'export-xlsx': []
  'import': []
  'delete': []
}>()
</script>

<style scoped>
</style>
