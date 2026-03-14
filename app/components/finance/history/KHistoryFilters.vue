<template>
  <div class="flex flex-wrap items-center gap-3">
    <!-- Total de Registros -->
    <div class="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
      <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest">Registros:</span>
      <span class="text-[11px] font-black text-white uppercase tracking-widest">{{ totalRecords }}</span>
    </div>

    <!-- Campo de Busca -->
    <div class="relative flex-1 min-w-[200px] max-w-[280px]">
      <input 
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Buscar empresa..."
        class="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-kros-blue focus:outline-none transition-all"
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

    <!-- Filtro por Status -->
    <div class="relative">
      <button 
        @click="isStatusDropdownOpen = !isStatusDropdownOpen"
        class="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all text-white/70 hover:text-white"
      >
        <div class="flex flex-col items-start leading-none gap-0.5">
          <span class="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Status</span>
          <span class="text-[10px] font-bold uppercase tracking-widest text-white">{{ getStatusLabel(statusFilter) }}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isStatusDropdownOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      <div 
        v-if="isStatusDropdownOpen" 
        class="absolute top-full right-0 mt-2 w-48 bg-[#111112] border border-white/10 rounded-2xl shadow-2xl z-[100] p-1.5"
      >
        <button 
          @click="$emit('update:statusFilter', 'all'); isStatusDropdownOpen = false"
          :class="['w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left', statusFilter === 'all' ? 'bg-kros-blue text-white' : 'hover:bg-white/5 text-white/70']"
        >
          <span class="text-[10px] font-bold uppercase tracking-widest">Todos</span>
        </button>
        <button 
          @click="$emit('update:statusFilter', 'paid'); isStatusDropdownOpen = false"
          :class="['w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left', statusFilter === 'paid' ? 'bg-kros-blue text-white' : 'hover:bg-white/5 text-white/70']"
        >
          <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span class="text-[10px] font-bold uppercase tracking-widest">Pago</span>
        </button>
        <button 
          @click="$emit('update:statusFilter', 'pending'); isStatusDropdownOpen = false"
          :class="['w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left', statusFilter === 'pending' ? 'bg-kros-blue text-white' : 'hover:bg-white/5 text-white/70']"
        >
          <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span class="text-[10px] font-bold uppercase tracking-widest">Pendente</span>
        </button>
      </div>
    </div>

    <!-- Filtro por Plano -->
    <div class="relative" v-if="availablePlans.length > 0">
      <button 
        @click="isPlanDropdownOpen = !isPlanDropdownOpen"
        class="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all text-white/70 hover:text-white"
      >
        <div class="flex flex-col items-start leading-none gap-0.5">
          <span class="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Plano</span>
          <span class="text-[10px] font-bold uppercase tracking-widest text-white">{{ planFilter === 'all' ? 'Todos' : planFilter }}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isPlanDropdownOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      <div 
        v-if="isPlanDropdownOpen" 
        class="absolute top-full right-0 mt-2 w-56 bg-[#111112] border border-white/10 rounded-2xl shadow-2xl z-[100] p-1.5 max-h-64 overflow-y-auto custom-scrollbar"
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
    <div class="flex items-center gap-2 bg-white/5 px-3 py-2.5 rounded-xl border border-white/5">
      <div class="flex items-center gap-1.5">
        <label class="text-[8px] font-bold text-white/30 uppercase tracking-widest">Início:</label>
        <input 
          :value="startDate"
          @input="$emit('update:startDate', ($event.target as HTMLInputElement).value)"
          type="date"
          class="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer [color-scheme:dark]"
        />
      </div>
      <div class="w-px h-4 bg-white/10"></div>
      <div class="flex items-center gap-1.5">
        <label class="text-[8px] font-bold text-white/30 uppercase tracking-widest">Fim:</label>
        <input 
          :value="endDate"
          @input="$emit('update:endDate', ($event.target as HTMLInputElement).value)"
          type="date"
          class="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer [color-scheme:dark]"
        />
      </div>
    </div>

    <!-- Total do Período -->
    <div class="flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20 uppercase tracking-[0.2em]">
      <span class="text-white/50">Período:</span>
      <span>{{ formatCurrency(totalReceived) }}</span>
    </div>

    <!-- Espaçador flexível -->
    <div class="flex-1"></div>

    <!-- Botões de Ação -->
    <div class="flex items-center gap-2">
      <!-- Toggle View -->
      <div class="flex items-center gap-1 bg-white/[0.02] border border-white/5 rounded-xl p-1">
        <button
          @click="$emit('update:viewMode', 'list')"
          :class="[
            'p-2 rounded-lg transition-all',
            viewMode === 'list' ? 'bg-kros-blue text-white' : 'text-white/40 hover:text-white/60'
          ]"
          title="Visualização em Lista"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
        <button
          @click="$emit('update:viewMode', 'cards')"
          :class="[
            'p-2 rounded-lg transition-all',
            viewMode === 'cards' ? 'bg-kros-blue text-white' : 'text-white/40 hover:text-white/60'
          ]"
          title="Visualização em Cards"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        </button>
      </div>

      <!-- Memorizar Preferências -->
      <button 
        @click="$emit('update:rememberPreferences', !rememberPreferences)"
        class="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
        :class="rememberPreferences ? 'text-kros-blue' : 'text-white/30 hover:text-white'"
        title="Memorizar Preferências"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
      </button>

      <!-- Deletar -->
      <button 
        class="p-2.5 bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/40"
        title="Deletar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  searchQuery: string
  statusFilter: string
  planFilter: string
  startDate: string
  endDate: string
  availablePlans: string[]
  totalRecords: number
  totalReceived: number
  viewMode: 'list' | 'cards'
  rememberPreferences: boolean
}>()

defineEmits(['update:searchQuery', 'update:statusFilter', 'update:planFilter', 'update:startDate', 'update:endDate', 'update:viewMode', 'update:rememberPreferences'])

const isStatusDropdownOpen = ref(false)
const isPlanDropdownOpen = ref(false)

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'all': 'Todos',
    'paid': 'Pago',
    'pending': 'Pendente'
  }
  return labels[status] || 'Todos'
}

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
