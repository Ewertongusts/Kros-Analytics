<template>
  <div class="space-y-4">
    <!-- Métricas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div class="p-4 bg-white/5 border border-white/10 rounded-xl">
        <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Total</p>
        <p class="text-2xl font-black text-white">{{ totalTasks }}</p>
      </div>
      <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">A Fazer</p>
        <p class="text-2xl font-black text-blue-400">{{ todoCount }}</p>
      </div>
      <div class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <p class="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-2">Em Andamento</p>
        <p class="text-2xl font-black text-yellow-400">{{ inProgressCount }}</p>
      </div>
      <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <p class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Concluído</p>
        <p class="text-2xl font-black text-emerald-400">{{ doneCount }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex items-end gap-3 flex-wrap">
      <!-- Busca -->
      <div class="flex-1 min-w-[200px]">
        <label class="block text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Buscar</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar tarefa..."
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-[10px]"
        />
      </div>

      <!-- Prioridade -->
      <div>
        <label class="block text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Prioridade</label>
        <select
          v-model="priorityFilter"
          class="px-4 py-2.5 bg-[#1a1a1b] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px] font-bold uppercase tracking-widest"
        >
          <option value="">Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Status</label>
        <select
          v-model="statusFilter"
          class="px-4 py-2.5 bg-[#1a1a1b] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px] font-bold uppercase tracking-widest"
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
        class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
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

const totalTasks = computed(() => props.tasks.length)
const todoCount = computed(() => props.tasks.filter(t => t.status === 'todo').length)
const inProgressCount = computed(() => props.tasks.filter(t => t.status === 'in_progress').length)
const doneCount = computed(() => props.tasks.filter(t => t.status === 'done').length)

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
