<template>
  <div class="flex flex-wrap items-center gap-3 sm:gap-4 lg:flex-1 lg:justify-end">
    <!-- Total de Registros -->
    <div class="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
      <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest">Registros:</span>
      <span class="text-[11px] font-black text-white uppercase tracking-widest">{{ totalRecords }}</span>
    </div>

    <!-- Campo de Busca -->
    <div class="relative flex-1 lg:flex-initial lg:min-w-[240px]">
      <input 
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Buscar empresa..."
        class="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-kros-blue focus:outline-none transition-all"
      />
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
      <button 
        v-if="searchQuery"
        @click="$emit('update:searchQuery', '')"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <!-- Filtro por Plano -->
    <div class="relative" v-if="availablePlans.length > 0">
      <button 
        @click="isPlanDropdownOpen = !isPlanDropdownOpen"
        class="flex items-center gap-4 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all text-white/70 hover:text-white"
      >
        <div class="flex flex-col items-start leading-none gap-1">
          <span class="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Plano</span>
          <span class="text-[11px] font-bold uppercase tracking-widest text-white">{{ planFilter === 'all' ? 'Todos' : planFilter }}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isPlanDropdownOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      <div 
        v-if="isPlanDropdownOpen" 
        class="absolute top-full right-0 mt-3 w-56 bg-[#111112] border border-white/10 rounded-2xl shadow-2xl z-[100] p-1.5 max-h-64 overflow-y-auto custom-scrollbar"
      >
        <button 
          @click="$emit('update:planFilter', 'all'); isPlanDropdownOpen = false"
          :class="['w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left', planFilter === 'all' ? 'bg-kros-blue text-white' : 'hover:bg-white/5 text-white/70']"
        >
          <span class="text-[10px] font-bold uppercase tracking-widest">Todos os Planos</span>
        </button>
        <button 
          v-for="plan in availablePlans" 
          :key="plan"
          @click="$emit('update:planFilter', plan); isPlanDropdownOpen = false"
          :class="['w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left', planFilter === plan ? 'bg-kros-blue text-white' : 'hover:bg-white/5 text-white/70']"
        >
          <span class="text-[10px] font-bold uppercase tracking-widest">{{ plan }}</span>
        </button>
      </div>
    </div>

    <!-- Filtro por Período -->
    <div class="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
      <div class="flex items-center gap-2">
        <label class="text-[9px] font-bold text-white/20 uppercase tracking-widest">Início:</label>
        <input 
          :value="startDate"
          @input="$emit('update:startDate', ($event.target as HTMLInputElement).value)"
          type="date"
          class="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer [color-scheme:dark]"
        />
      </div>
      <div class="w-px h-4 bg-white/10"></div>
      <div class="flex items-center gap-2">
        <label class="text-[9px] font-bold text-white/20 uppercase tracking-widest">Fim:</label>
        <input 
          :value="endDate"
          @input="$emit('update:endDate', ($event.target as HTMLInputElement).value)"
          type="date"
          class="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer [color-scheme:dark]"
        />
      </div>
    </div>

    <div class="flex items-center gap-2 px-4 py-3 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20 uppercase tracking-[0.2em]">
      <span class="text-white/50">Período:</span>
      <span>{{ formatCurrency(totalReceived) }}</span>
    </div>

    <!-- Botões Globais -->
    <div class="flex items-center gap-2 ml-2 pl-4 border-l border-white/5">
      <button 
        @click="$emit('config')"
        class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
        title="Gerenciar Empresas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      </button>
      <button 
        @click="$emit('sync')"
        class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
        title="Sincronizar Dados"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  searchQuery: string
  planFilter: string
  startDate: string
  endDate: string
  availablePlans: string[]
  totalRecords: number
  totalReceived: number
}>()

defineEmits(['update:searchQuery', 'update:planFilter', 'update:startDate', 'update:endDate', 'config', 'sync'])

const isPlanDropdownOpen = ref(false)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
