<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 px-2">
    <!-- Info da paginação -->
    <div class="flex items-center gap-3">
      <div class="text-[10px] font-bold text-white/50 uppercase tracking-widest">
        Página {{ currentPage }} de {{ totalPages }}
      </div>
      <div class="h-4 w-px bg-white/10"></div>
      <div class="text-[10px] font-bold text-white/70 uppercase tracking-widest">
        {{ totalCount }} registro{{ totalCount !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Controles de navegação -->
    <div class="flex items-center gap-2">
      <!-- Botão Anterior -->
      <button 
        @click="$emit('prev')"
        :disabled="!hasPrevPage"
        class="group flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-white/5 hover:border-white/10 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/50 group-hover:text-white transition-colors">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <span class="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest transition-colors">
          Anterior
        </span>
      </button>

      <!-- Números das páginas -->
      <div class="flex items-center gap-1">
        <!-- Primeira página -->
        <button 
          v-if="currentPage > 3"
          @click="$emit('go-to-page', 1)"
          class="w-10 h-10 flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white rounded-lg border border-white/5 hover:border-white/10 transition-all"
        >
          <span class="text-[11px] font-bold">1</span>
        </button>

        <!-- Reticências início -->
        <div v-if="currentPage > 4" class="px-2 text-white/30 text-[11px]">...</div>

        <!-- Páginas próximas -->
        <button 
          v-for="page in getVisiblePages()" 
          :key="page"
          @click="$emit('go-to-page', page)"
          :class="[
            'w-10 h-10 flex items-center justify-center rounded-lg border transition-all',
            page === currentPage 
              ? 'bg-kros-blue border-kros-blue text-white shadow-lg shadow-kros-blue/20' 
              : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10 text-white/50 hover:text-white'
          ]"
        >
          <span class="text-[11px] font-bold">{{ page }}</span>
        </button>

        <!-- Reticências fim -->
        <div v-if="currentPage < totalPages - 3" class="px-2 text-white/30 text-[11px]">...</div>

        <!-- Última página -->
        <button 
          v-if="currentPage < totalPages - 2 && totalPages > 5"
          @click="$emit('go-to-page', totalPages)"
          :class="[
            'w-10 h-10 flex items-center justify-center rounded-lg border transition-all',
            totalPages === currentPage 
              ? 'bg-kros-blue border-kros-blue text-white shadow-lg shadow-kros-blue/20' 
              : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10 text-white/50 hover:text-white'
          ]"
        >
          <span class="text-[11px] font-bold">{{ totalPages }}</span>
        </button>
      </div>

      <!-- Botão Próxima -->
      <button 
        @click="$emit('next')"
        :disabled="!hasNextPage"
        class="group flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-white/5 hover:border-white/10 transition-all"
      >
        <span class="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest transition-colors">
          Próxima
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/50 group-hover:text-white transition-colors">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
}>()

defineEmits<{
  next: []
  prev: []
  'go-to-page': [page: number]
}>()

const getVisiblePages = () => {
  const pages: number[] = []
  const start = Math.max(1, props.currentPage - 1)
  const end = Math.min(props.totalPages, props.currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}
</script>
