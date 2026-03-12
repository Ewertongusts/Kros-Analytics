<template>
  <div class="relative group/tags shrink-0">
    <button 
      @click="isOpen = !isOpen"
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
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
    </button>

    <div 
      v-if="isOpen" 
      class="absolute top-full right-0 mt-3 w-60 sm:w-64 bg-[#111112] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-[100] p-2 overflow-hidden"
    >
      <div class="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
        <button 
          @click="$emit('toggle-all')"
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
          @click="$emit('clear')"
          class="w-full py-2.5 text-[10px] font-bold text-center text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-all"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  selectedTags: string[]
  tagDefinitions: any[]
}>()

defineEmits(['toggle-tag', 'toggle-all', 'clear'])

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
