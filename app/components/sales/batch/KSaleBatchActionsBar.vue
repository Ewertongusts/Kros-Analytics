<template>
  <div v-if="selectedIds.length > 0" class="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
    <div class="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02] rounded-xl border border-white/10">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-white/70 uppercase tracking-widest">{{ selectedIds.length }} selecionados</span>
          <span class="text-[11px] font-black text-white uppercase tracking-widest">{{ formatCurrency(selectedTotal) }}</span>
        </div>
        
        <div class="h-6 w-px bg-white/10"></div>
        
        <div class="flex items-center gap-2">
          <!-- Marcar como Pago -->
          <button 
            @click="$emit('batch-action', 'mark-paid')"
            class="group/paid relative p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg transition-all"
            aria-label="Marcar vendas selecionadas como pago"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-emerald-500/30 rounded-lg shadow-xl opacity-0 group-hover/paid:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
              <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Marcar Pago</p>
            </div>
          </button>
          
          <!-- Marcar como Pendente -->
          <button 
            @click="$emit('batch-action', 'mark-pending')"
            class="group/pending relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all"
            aria-label="Marcar vendas selecionadas como pendente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/pending:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
              <p class="text-[9px] font-bold text-white uppercase tracking-wider">Marcar Pendente</p>
            </div>
          </button>
          
          <div class="h-6 w-px bg-white/10"></div>
          
          <!-- Enviar WhatsApp -->
          <button 
            @click="$emit('batch-action', 'whatsapp')"
            class="group/whats relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all"
            aria-label="Enviar recibo via WhatsApp para selecionados"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/></svg>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/whats:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
              <p class="text-[9px] font-bold text-white uppercase tracking-wider">Enviar WhatsApp</p>
            </div>
          </button>
          
          <div class="h-6 w-px bg-white/10"></div>
          
          <!-- Apagar -->
          <button 
            @click="$emit('batch-action', 'delete')"
            class="group/delete relative p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all"
            aria-label="Apagar vendas selecionadas permanentemente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-red-500/30 rounded-lg shadow-xl opacity-0 group-hover/delete:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
              <p class="text-[9px] font-bold text-red-400 uppercase tracking-wider">⚠️ Apagar</p>
            </div>
          </button>
        </div>
      </div>

      <button 
        @click="$emit('clear-selection')"
        class="px-3 py-1.5 text-white/40 hover:text-white text-[9px] font-bold uppercase tracking-wider transition-all"
      >
        Limpar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '~/utils/validators'

defineProps<{
  selectedIds: string[]
  selectedTotal: number
}>()

defineEmits(['batch-action', 'clear-selection'])
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
