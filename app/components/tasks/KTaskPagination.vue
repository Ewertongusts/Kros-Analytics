<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
    <div class="text-xs text-white/50">
      Página <span class="font-bold text-white">{{ currentPage }}</span> de <span class="font-bold text-white">{{ totalPages }}</span>
      <span class="ml-2">{{ startIndex + 1 }}-{{ Math.min(endIndex, totalItems) }} de {{ totalItems }}</span>
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="prevPage"
        :disabled="!canPrevPage"
        class="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all"
        title="Página anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div class="flex items-center gap-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 rounded-lg text-sm font-bold transition-all',
            page === currentPage
              ? 'bg-kros-blue text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          ]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="nextPage"
        :disabled="!canNextPage"
        class="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all"
        title="Próxima página"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <select
      :value="itemsPerPage"
      @change="updateItemsPerPage"
      class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-bold hover:bg-white/20 transition-all focus:outline-none"
    >
      <option value="10">10 por página</option>
      <option value="20">20 por página</option>
      <option value="50">50 por página</option>
      <option value="100">100 por página</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  startIndex: number
  endIndex: number
  itemsPerPage: number
  canNextPage: boolean
  canPrevPage: boolean
}>()

const emit = defineEmits<{
  'next': []
  'prev': []
  'go-to-page': [page: number]
  'update:itemsPerPage': [value: number]
}>()

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(props.totalPages, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const nextPage = () => emit('next')
const prevPage = () => emit('prev')
const goToPage = (page: number) => emit('go-to-page', page)
const updateItemsPerPage = (e: Event) => {
  const value = parseInt((e.target as HTMLSelectElement).value)
  emit('update:itemsPerPage', value)
}
</script>
