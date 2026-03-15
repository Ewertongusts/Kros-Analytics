<template>
  <div>
    <!-- Filtros -->
    <div class="flex items-end gap-3 flex-wrap p-4 bg-[#1a1a1c] border border-white/5 rounded-xl">
      <!-- Busca -->
      <div class="flex-1 min-w-[250px]">
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">Buscar</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Digite o título ou descrição..."
          class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
        />
      </div>

      <!-- Prioridade -->
      <div>
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">Prioridade</label>
        <select
          v-model="priorityFilter"
          class="px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20 transition-all"
        >
          <option value="">Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">Status</label>
        <select
          v-model="statusFilter"
          class="px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20 transition-all"
        >
          <option value="">Todos</option>
          <option value="todo">A Fazer</option>
          <option value="in_progress">Em Andamento</option>
          <option value="done">Concluído</option>
        </select>
      </div>

      <!-- Limpar -->
      <button
        @click="clearFilters"
        class="px-3 py-2 bg-[#1c1c1e] hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-white/60 hover:text-white transition-all text-sm font-medium"
      >
        Limpar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  tasks: any[]
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:priority': [value: string]
  'update:status': [value: string]
}>()

const searchQuery = ref('')
const priorityFilter = ref('')
const statusFilter = ref('')

const clearFilters = () => {
  searchQuery.value = ''
  priorityFilter.value = ''
  statusFilter.value = ''
  emit('update:search', '')
  emit('update:priority', '')
  emit('update:status', '')
}

watch([searchQuery, priorityFilter, statusFilter], ([search, priority, status]) => {
  emit('update:search', search)
  emit('update:priority', priority)
  emit('update:status', status)
})
</script>
