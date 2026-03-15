<template>
  <div class="space-y-4">
    <!-- Métricas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div class="p-4 bg-gradient-to-br from-white/5 to-white/0 border border-white/15 rounded-lg hover:border-white/25 transition-all">
        <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">📊 Total</p>
        <p class="text-3xl font-black text-white">{{ totalTasks }}</p>
      </div>
      <div class="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/0 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-all">
        <p class="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-2">📋 A Fazer</p>
        <p class="text-3xl font-black text-blue-300">{{ todoCount }}</p>
      </div>
      <div class="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/0 border border-yellow-500/20 rounded-lg hover:border-yellow-500/40 transition-all">
        <p class="text-[10px] font-bold text-yellow-300 uppercase tracking-widest mb-2">⚙️ Em Andamento</p>
        <p class="text-3xl font-black text-yellow-300">{{ inProgressCount }}</p>
      </div>
      <div class="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/0 border border-emerald-500/20 rounded-lg hover:border-emerald-500/40 transition-all">
        <p class="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-2">✅ Concluído</p>
        <p class="text-3xl font-black text-emerald-300">{{ doneCount }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex items-end gap-3 flex-wrap p-4 bg-gradient-to-br from-white/5 to-white/0 border border-white/15 rounded-lg">
      <!-- Busca -->
      <div class="flex-1 min-w-[250px]">
        <label class="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">🔍 Buscar Tarefa</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Digite o título ou descrição..."
          class="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-sm"
        />
      </div>

      <!-- Prioridade -->
      <div>
        <label class="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">⭐ Prioridade</label>
        <select
          v-model="priorityFilter"
          class="px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-sm font-semibold"
        >
          <option value="">Todas</option>
          <option value="alta">🔴 Alta</option>
          <option value="media">🟡 Média</option>
          <option value="baixa">🟢 Baixa</option>
        </select>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">📌 Status</label>
        <select
          v-model="statusFilter"
          class="px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-sm font-semibold"
        >
          <option value="">Todos</option>
          <option value="todo">📋 A Fazer</option>
          <option value="in_progress">⚙️ Em Andamento</option>
          <option value="done">✅ Concluído</option>
        </select>
      </div>

      <!-- Limpar -->
      <button
        @click="clearFilters"
        class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 rounded-lg text-white/70 hover:text-white transition-all text-sm font-semibold uppercase tracking-wider"
      >
        🔄 Limpar
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
