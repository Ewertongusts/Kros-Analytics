<template>
  <div class="flex flex-wrap items-center gap-3 sm:gap-4 lg:flex-1 lg:justify-end">
    <!-- Total Filtrado -->
    <div class="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
      <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest">Total Filtrado:</span>
      <span class="text-[11px] font-black text-white uppercase tracking-widest">{{ totalCount }}</span>
    </div>

    <!-- Campo de Busca -->
    <div class="relative flex-1 lg:flex-initial lg:min-w-[280px]">
      <input 
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Buscar empresa ou valor..."
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

    <!-- Filtro de Tags -->
    <div class="relative group/tags shrink-0">
      <button 
        @click="isTagDropdownOpen = !isTagDropdownOpen"
        class="flex items-center gap-4 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all text-white/70 hover:text-white"
      >
        <div class="flex flex-col items-start leading-none gap-1">
          <span class="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Categorias</span>
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold uppercase tracking-widest">Tags</span>
            <div v-if="selectedTags.length > 0" class="flex items-center justify-center min-w-[16px] h-[16px] bg-kros-blue text-white rounded-full text-[9px] font-black">
              {{ selectedTags.length }}
            </div>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isTagDropdownOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      <div 
        v-if="isTagDropdownOpen" 
        class="absolute top-full right-0 lg:left-0 lg:right-auto mt-3 w-60 sm:w-64 bg-[#111112] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-[100] p-2 overflow-hidden"
      >
        <div class="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
          <button 
            @click="$emit('toggle-all-tags')"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left"
          >
            <span class="text-[10px] font-bold text-white/70 uppercase tracking-widest">Todas as Tags</span>
            <div :class="['w-4 h-4 rounded border flex items-center justify-center transition-all', selectedTags.length === tagDefinitions.length ? 'bg-kros-blue border-kros-blue' : 'border-white/20']">
              <svg v-if="selectedTags.length === tagDefinitions.length" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </button>
          
          <div class="h-px bg-white/5 my-1"></div>

          <button 
            v-for="tag in tagDefinitions" 
            :key="tag.id"
            @click="$emit('toggle-tag', tag.name)"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left group/item"
          >
            <div class="flex items-center gap-3">
              <div :style="{ backgroundColor: tag.color }" class="w-2.5 h-2.5 rounded-sm shadow-[0_0_8px_rgba(0,0,0,0.5)]"></div>
              <span class="text-[10px] font-bold text-white/50 group-hover/item:text-white uppercase tracking-widest transition-colors">{{ tag.name }}</span>
            </div>
            <div :class="['w-4 h-4 rounded border flex items-center justify-center transition-all', selectedTags.includes(tag.name) ? 'bg-kros-blue border-kros-blue' : 'border-white/20']">
              <svg v-if="selectedTags.includes(tag.name)" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </button>
        </div>

        <div v-if="selectedTags.length > 0" class="p-2 border-t border-white/5">
          <button 
            @click="$emit('clear-tags')"
            class="w-full py-2.5 text-[10px] font-bold text-center text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-all"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Filtro de Status -->
    <div class="flex items-center gap-2">
      <div class="relative group/filter shrink-0">
        <button 
          @click="isFilterDropdownOpen = !isFilterDropdownOpen"
          class="flex items-center gap-4 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all text-white/70 hover:text-white"
        >
          <div class="flex flex-col items-start leading-none gap-1">
            <span class="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">{{ activeFilter === 'Todos' ? 'Filtro' : 'Filtrando por' }}</span>
            <span class="text-[11px] font-bold uppercase tracking-widest text-white">{{ activeFilter }}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isFilterDropdownOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        <div 
          v-if="isFilterDropdownOpen" 
          class="absolute top-full right-0 mt-3 w-64 bg-[#161618] border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-[200] p-1.5 animate-in fade-in zoom-in-95 duration-200"
        >
          <div class="max-h-[400px] overflow-y-auto custom-scrollbar space-y-0.5">
            <button 
              v-for="option in filterOptions" 
              :key="option.id"
              @click="$emit('update:activeFilter', option.id); isFilterDropdownOpen = false"
              :class="[
                'w-full flex flex-col px-3.5 py-2.5 rounded-xl transition-all text-left group/opt',
                activeFilter === option.id ? 'bg-kros-blue border border-kros-blue/20' : 'hover:bg-white/5 border border-transparent'
              ]"
            >
              <span :class="['text-[10px] font-bold uppercase tracking-widest transition-colors', activeFilter === option.id ? 'text-white' : 'text-white/70 group-hover/opt:text-white']">{{ option.label }}</span>
              <span v-if="option.description" :class="['text-[8px] font-bold uppercase tracking-tight mt-0.5 transition-colors', activeFilter === option.id ? 'text-white/60' : 'text-white/30 group-hover/opt:text-white/40']">{{ option.description }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botões de Ação -->
    <div class="flex items-center gap-2 ml-2 pl-4 border-l border-white/5">
      <!-- Toggle de Densidade -->
      <button 
        @click="$emit('toggle-compact')"
        class="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
        :class="isCompact ? 'text-kros-blue' : 'text-white/30 hover:text-white'"
        :title="isCompact ? 'Visualização Compacta' : 'Visualização Expandida'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
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
  totalCount: number
  searchQuery: string
  selectedTags: string[]
  tagDefinitions: any[]
  activeFilter: string
  filterOptions: any[]
  isCompact: boolean
}>()

defineEmits([
  'update:searchQuery',
  'toggle-tag',
  'toggle-all-tags',
  'clear-tags',
  'update:activeFilter',
  'toggle-compact',
  'config',
  'sync'
])

const isTagDropdownOpen = ref(false)
const isFilterDropdownOpen = ref(false)
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
