<template>
  <div v-if="isOpen" class="absolute top-full left-0 mt-2 w-56 rounded-xl z-[9999] p-2 border border-white/20" :style="{ backgroundColor: backgroundColor }">
    <div class="max-h-64 overflow-y-auto custom-scrollbar">
      <div class="px-4 py-3 border-b border-white/10 mb-2">
        <p class="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">{{ title }}</p>
      </div>
      
      <!-- Remove All Tags Button (only for remove mode) -->
      <button 
        v-if="mode === 'remove'"
        @click="$emit('select', 'remove-all')"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/20 transition-all text-left group/rtag border-b border-white/10 mb-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-400 shrink-0"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        <span class="text-[10px] font-black text-red-400 uppercase tracking-widest group-hover/rtag:text-red-300">Remover Todas</span>
      </button>
      
      <!-- Tag Items -->
      <button 
        v-for="tag in tags" 
        :key="tag.id"
        @click="$emit('select', tag.name)"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group/btag mb-1',
          mode === 'remove' 
            ? 'hover:bg-red-500/15 group-hover/btag:text-red-400' 
            : 'hover:bg-white/15 group-hover/btag:text-white'
        ]"
      >
        <div :style="{ backgroundColor: tag.color }" class="w-3 h-3 rounded-sm shrink-0 shadow-lg"></div>
        <span class="text-[10px] font-bold text-white/85 uppercase tracking-widest truncate">{{ tag.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  title: string
  tags: any[]
  mode: 'add' | 'remove'
  backgroundColor?: string
}>()

defineEmits<{
  select: [tagName: string]
}>()
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
