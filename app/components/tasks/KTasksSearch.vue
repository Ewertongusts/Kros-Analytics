<template>
  <div class="relative">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Buscar tarefas por título, descrição..."
      class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-sm"
      @input="handleSearch"
    />
    <svg
      v-if="searchQuery"
      @click="clearSearch"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer transition-colors"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['search', 'clear'])

const searchQuery = ref('')

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('clear')
}
</script>
