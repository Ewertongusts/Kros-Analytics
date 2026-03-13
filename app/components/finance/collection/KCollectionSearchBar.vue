<template>
  <div class="relative flex-1 lg:flex-initial lg:min-w-[240px] h-full">
    <input 
      :value="searchQuery"
      @input="handleSearchInput"
      type="text"
      placeholder="Buscar cliente, empresa ou valor..."
      class="w-full h-full px-3 py-2 pl-8 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:border-kros-blue focus:outline-none transition-all"
    />
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
    <button 
      v-if="searchQuery"
      @click="$emit('update:searchQuery', '')"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'

defineProps<{
  searchQuery: string
}>()

const emit = defineEmits(['update:searchQuery'])

let searchTimeout: any = null

const handleSearchInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(() => {
    emit('update:searchQuery', value)
  }, 300)
}

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>
