<template>
  <div class="relative">
    <button 
      @click="isOpen = !isOpen"
      class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
      title="Exportar Dados"
      aria-label="Exportar dados filtrados"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </button>

    <div 
      v-if="isOpen" 
      class="absolute top-full right-0 mt-2 w-48 bg-[#111112] border border-white/10 rounded-xl shadow-2xl z-[100] p-1 animate-in slide-in-from-top-2 duration-200"
    >
      <div class="px-3 py-2 border-b border-white/5 mb-1">
        <p class="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Exportar como</p>
      </div>
      
      <button 
        @click="handleExport('xlsx')"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <div class="flex-1">
          <p class="text-[10px] font-bold text-white group-hover:text-emerald-500 uppercase tracking-wider">Excel (XLSX)</p>
          <p class="text-[8px] text-white/30 mt-0.5">Planilha formatada</p>
        </div>
      </button>
      
      <button 
        @click="handleExport('csv')"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
        </svg>
        <div class="flex-1">
          <p class="text-[10px] font-bold text-white group-hover:text-blue-500 uppercase tracking-wider">CSV</p>
          <p class="text-[8px] text-white/30 mt-0.5">Dados separados por vírgula</p>
        </div>
      </button>
      
      <button 
        @click="handleExport('pdf')"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12h4"/><path d="M10 16h4"/>
        </svg>
        <div class="flex-1">
          <p class="text-[10px] font-bold text-white group-hover:text-red-500 uppercase tracking-wider">PDF</p>
          <p class="text-[8px] text-white/30 mt-0.5">Documento portátil</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['export'])

const isOpen = ref(false)

const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
  emit('export', format)
  isOpen.value = false
}
</script>
