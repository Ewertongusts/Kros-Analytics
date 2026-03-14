<template>
  <div class="relative group/tags shrink-0 h-full">
    <button 
      @click="toggleModal()"
      class="flex items-center gap-2 px-3 py-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-white/10 transition-all text-white/70 hover:text-white h-full"
    >
      <div class="flex flex-col items-start leading-none gap-0.5">
        <span class="text-[7px] font-black uppercase tracking-[0.15em] text-white/30">Categorias</span>
        <div class="flex items-center gap-1.5">
          <span class="text-[9px] font-bold uppercase tracking-widest">Tags</span>
          <div v-if="tagDefinitions.length > 0" class="flex items-center justify-center min-w-[14px] h-[14px] bg-green-500/40 text-white rounded-full text-[7px] font-black">
            {{ tagDefinitions.length }}
          </div>
          <div v-if="selectedTags.length > 0" class="flex items-center justify-center min-w-[14px] h-[14px] bg-kros-blue text-white rounded-full text-[7px] font-black">
            {{ selectedTags.length }}
          </div>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
    </button>

    <div 
      v-if="isOpen" 
      class="absolute top-full left-0 mt-2 w-[500px] bg-[#111112] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-[100] p-4 overflow-hidden"
    >
      <div class="max-h-96 overflow-y-auto custom-scrollbar p-2 space-y-2">
        <button 
          @click="$emit('toggle-all')"
          class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-all text-left"
        >
          <span class="text-[11px] font-bold text-white/70 uppercase tracking-widest">Todas as Tags</span>
          <div :class="['w-5 h-5 rounded border flex items-center justify-center transition-all', selectedTags.length === tagDefinitions.length ? 'bg-kros-blue border-kros-blue' : 'border-white/20']">
            <svg v-if="selectedTags.length === tagDefinitions.length" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </button>
        
        <div class="h-px bg-white/5 my-2"></div>

        <button 
          v-for="tag in tagDefinitions" 
          :key="tag.id"
          @click="$emit('toggle-tag', tag.name)"
          class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-all text-left group/item"
        >
          <div class="flex items-center gap-3">
            <div :style="{ backgroundColor: tag.color }" class="w-3 h-3 rounded-sm shadow-[0_0_8px_rgba(0,0,0,0.5)]"></div>
            <span class="text-[11px] font-bold text-white/50 group-hover/item:text-white uppercase tracking-widest transition-colors">{{ tag.name }}</span>
          </div>
          <div :class="['w-5 h-5 rounded border flex items-center justify-center transition-all', selectedTags.includes(tag.name) ? 'bg-kros-blue border-kros-blue' : 'border-white/20']">
            <svg v-if="selectedTags.includes(tag.name)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </button>
      </div>

      <div v-if="selectedTags.length > 0" class="p-2 border-t border-white/5 mt-2">
        <button 
          @click="$emit('clear')"
          class="w-full py-2.5 text-[11px] font-bold text-center text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-all"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFilterModals } from '~/composables/useFilterModals'

defineProps<{
  selectedTags: string[]
  tagDefinitions: any[]
}>()

defineEmits(['toggle-tag', 'toggle-all', 'clear'])

const { isOpen, toggleModal } = useFilterModals('tag-filter')
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
