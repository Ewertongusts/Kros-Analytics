<template>
  <div class="relative group/filter shrink-0">
    <button 
      @click="isOpen = !isOpen"
      class="flex items-center gap-4 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all text-white/70 hover:text-white"
    >
      <div class="flex flex-col items-start leading-none gap-1">
        <span class="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">{{ activeFilter === 'Todos' ? 'Filtro' : 'Filtrando por' }}</span>
        <span class="text-[11px] font-bold uppercase tracking-widest text-white">{{ activeFilter }}</span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
    </button>

    <div 
      v-if="isOpen" 
      class="absolute top-full right-0 mt-3 w-64 bg-[#161618] border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-[200] p-1.5 animate-in fade-in zoom-in-95 duration-200"
    >
      <div class="max-h-[400px] overflow-y-auto custom-scrollbar space-y-0.5">
        <button 
          v-for="option in filterOptions" 
          :key="option.id"
          @click="$emit('update:activeFilter', option.id); isOpen = false"
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
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  activeFilter: string
  filterOptions: any[]
}>()

defineEmits(['update:activeFilter'])

const isOpen = ref(false)
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
