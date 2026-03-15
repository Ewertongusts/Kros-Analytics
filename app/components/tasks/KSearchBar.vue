<template>
  <div class="relative">
    <div class="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus-within:border-blue-500 transition-all">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/50">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar tarefas..."
        class="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm"
        @input="onSearch"
        @focus="showSuggestions = true"
        @blur="setTimeout(() => { showSuggestions = false }, 200)"
      />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="p-1 text-white/50 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Sugestões -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm z-50 overflow-hidden"
    >
      <div class="p-2 space-y-1">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          @click="selectSuggestion(suggestion)"
          class="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg transition-all"
        >
          🔍 {{ suggestion }}
        </button>
      </div>
    </div>

    <!-- Resultados -->
    <div
      v-if="showResults && searchResults.length > 0"
      class="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm z-50 max-h-[400px] overflow-y-auto custom-scrollbar"
    >
      <div class="p-2 space-y-1">
        <div
          v-for="result in searchResults.slice(0, 5)"
          :key="result.task.id"
          @click="selectResult(result.task)"
          class="p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all group"
        >
          <div class="flex items-start justify-between mb-1">
            <h4 class="text-sm font-bold text-white truncate group-hover:text-blue-400">{{ result.task.title }}</h4>
            <span class="text-xs text-white/50 ml-2">{{ Math.round(result.score * 10) }}%</span>
          </div>
          <p v-if="result.highlights.length > 0" class="text-xs text-white/50 truncate">
            {{ result.highlights[0] }}
          </p>
          <div v-if="result.task.tags && result.task.tags.length > 0" class="flex gap-1 mt-1 flex-wrap">
            <span
              v-for="tag in result.task.tags.slice(0, 2)"
              :key="tag"
              class="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sem resultados -->
    <div
      v-if="showResults && searchQuery && searchResults.length === 0"
      class="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm z-50 p-4 text-center"
    >
      <p class="text-sm text-white/50">Nenhuma tarefa encontrada para "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '~/composables/useTasks'
import { useFullTextSearch } from '~/composables/useFullTextSearch'

interface Props {
  tasks: Task[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'search': [query: string]
  'select': [task: Task]
}>()

const { search, getSearchSuggestions } = useFullTextSearch()

const searchQuery = ref('')
const showSuggestions = ref(false)
const showResults = ref(false)

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  return search(searchQuery.value, props.tasks)
})

const suggestions = computed(() => {
  if (!searchQuery.value.trim()) return []
  return getSearchSuggestions(searchQuery.value, props.tasks, 5)
})

const onSearch = () => {
  showSuggestions.value = searchQuery.value.length > 0
  showResults.value = searchQuery.value.length > 2
  emit('search', searchQuery.value)
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  showResults.value = true
  emit('search', suggestion)
}

const selectResult = (task: Task) => {
  emit('select', task)
  searchQuery.value = ''
  showResults.value = false
  showSuggestions.value = false
}

const clearSearch = () => {
  searchQuery.value = ''
  showResults.value = false
  showSuggestions.value = false
  emit('search', '')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
