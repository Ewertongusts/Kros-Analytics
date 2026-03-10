<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading && !tags.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="h-44 bg-white/5 rounded-[2rem] animate-pulse"></div>
    </div>

    <!-- Grid -->
    <div v-else-if="tags.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="tag in tags" 
        :key="tag.id"
        class="group relative bg-[#111112] border border-white/5 p-8 rounded-[2rem] hover:border-kros-blue/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div class="flex items-start justify-between mb-6">
          <div 
            class="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight border shadow-sm"
            :style="{ 
              backgroundColor: `${tag.color}15`, 
              color: tag.color, 
              borderColor: `${tag.color}40` 
            }"
          >
            {{ tag.name }}
          </div>
          
          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="$emit('edit', tag)" class="p-2.5 bg-white/5 hover:bg-kros-blue/20 rounded-xl text-white/40 hover:text-kros-blue transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
            <button @click="$emit('delete', tag.id)" class="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-white/40 hover:text-red-500 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <h5 class="text-[10px] font-bold uppercase tracking-widest text-kros-blue mb-2 opacity-80">Descrição</h5>
        <p class="text-xs text-white/70 line-clamp-3 leading-relaxed font-medium">
          {{ tag.description || 'Nenhuma descrição detalhada para esta tag.' }}
        </p>

        <!-- Hover Glow -->
        <div class="absolute -inset-1 bg-gradient-to-r from-kros-blue/20 to-transparent rounded-[2.2rem] opacity-0 group-hover:opacity-100 -z-10 blur-xl transition-all duration-500"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-40 bg-[#111112] border border-dashed border-white/10 rounded-[3rem] shadow-inner">
      <div class="w-20 h-20 bg-kros-blue/10 rounded-3xl flex items-center justify-center text-kros-blue mb-8 rotate-12 group-hover:rotate-0 transition-transform duration-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2Z"/><path d="M18 9h4v4h-4Z"/><path d="M18 4h4v4h-4Z"/><path d="M18 14h4v4h-4Z"/></svg>
      </div>
      <h3 class="font-bold italic uppercase tracking-[0.2em] text-lg text-white">Nenhuma tag cadastrada</h3>
      <p class="text-sm mt-4 text-center max-w-xs px-8 text-white/60 font-medium">Crie categorias personalizadas para organizar suas empresas por nicho, prioridade ou status.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TagDefinition } from '~/composables/useTags'

defineProps<{
  tags: TagDefinition[]
  loading: boolean
}>()

defineEmits(['edit', 'delete'])
</script>
