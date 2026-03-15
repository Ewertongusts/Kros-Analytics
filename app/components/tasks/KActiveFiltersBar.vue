<template>
  <div v-if="hasActiveFilters" class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        <span class="text-xs font-bold text-blue-400">{{ activeFilterCount }} filtro{{ activeFilterCount !== 1 ? 's' : '' }} ativo{{ activeFilterCount !== 1 ? 's' : '' }}</span>
      </div>
      <button
        @click="clearAllFilters"
        class="px-2 py-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
      >
        Limpar tudo
      </button>
    </div>

    <!-- Tags de Filtros Ativos -->
    <div class="flex flex-wrap gap-2">
      <!-- Busca -->
      <div v-if="filters.search" class="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-lg">
        <span class="text-xs text-blue-300">🔍 {{ filters.search }}</span>
        <button @click="removeFilter('search')" class="text-blue-300 hover:text-blue-200">✕</button>
      </div>

      <!-- Status -->
      <div v-for="status in filters.status" :key="`status-${status}`" class="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-lg">
        <span class="text-xs text-blue-300">📋 {{ getStatusLabel(status) }}</span>
        <button @click="removeArrayFilter('status', status)" class="text-blue-300 hover:text-blue-200">✕</button>
      </div>

      <!-- Prioridade -->
      <div v-for="priority in filters.priority" :key="`priority-${priority}`" class="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
        <span class="text-xs text-yellow-300">⭐ {{ getPriorityLabel(priority) }}</span>
        <button @click="removeArrayFilter('priority', priority)" class="text-yellow-300 hover:text-yellow-200">✕</button>
      </div>

      <!-- Responsável -->
      <div v-for="assigned in filters.assigned_to" :key="`assigned-${assigned}`" class="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-lg">
        <span class="text-xs text-purple-300">👤 {{ assigned }}</span>
        <button @click="removeArrayFilter('assigned_to', assigned)" class="text-purple-300 hover:text-purple-200">✕</button>
      </div>

      <!-- Empresa -->
      <div v-for="companyId in filters.company_id" :key="`company-${companyId}`" class="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg">
        <span class="text-xs text-green-300">🏢 {{ getCompanyName(companyId) }}</span>
        <button @click="removeArrayFilter('company_id', companyId)" class="text-green-300 hover:text-green-200">✕</button>
      </div>

      <!-- Data de Criação -->
      <div v-if="filters.date_from" class="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded-lg">
        <span class="text-xs text-cyan-300">📅 De {{ formatDate(filters.date_from) }}</span>
        <button @click="removeFilter('date_from')" class="text-cyan-300 hover:text-cyan-200">✕</button>
      </div>

      <div v-if="filters.date_to" class="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded-lg">
        <span class="text-xs text-cyan-300">📅 Até {{ formatDate(filters.date_to) }}</span>
        <button @click="removeFilter('date_to')" class="text-cyan-300 hover:text-cyan-200">✕</button>
      </div>

      <!-- Data de Vencimento -->
      <div v-if="filters.due_date_from" class="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-lg">
        <span class="text-xs text-orange-300">⏰ Vence de {{ formatDate(filters.due_date_from) }}</span>
        <button @click="removeFilter('due_date_from')" class="text-orange-300 hover:text-orange-200">✕</button>
      </div>

      <div v-if="filters.due_date_to" class="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-lg">
        <span class="text-xs text-orange-300">⏰ Vence até {{ formatDate(filters.due_date_to) }}</span>
        <button @click="removeFilter('due_date_to')" class="text-orange-300 hover:text-orange-200">✕</button>
      </div>

      <!-- Estimativa -->
      <div v-if="filters.has_estimation !== null" class="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 rounded-lg">
        <span class="text-xs text-indigo-300">⏱️ {{ filters.has_estimation ? 'Com' : 'Sem' }} estimativa</span>
        <button @click="removeFilter('has_estimation')" class="text-indigo-300 hover:text-indigo-200">✕</button>
      </div>

      <!-- Subtarefas -->
      <div v-if="filters.has_subtasks !== null" class="flex items-center gap-1 px-2 py-1 bg-pink-500/20 rounded-lg">
        <span class="text-xs text-pink-300">📋 {{ filters.has_subtasks ? 'Com' : 'Sem' }} subtarefas</span>
        <button @click="removeFilter('has_subtasks')" class="text-pink-300 hover:text-pink-200">✕</button>
      </div>

      <!-- Atrasadas -->
      <div v-if="filters.overdue_only" class="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-lg">
        <span class="text-xs text-red-300">⚠️ Apenas atrasadas</span>
        <button @click="removeFilter('overdue_only')" class="text-red-300 hover:text-red-200">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdvancedFilters } from '~/composables/useAdvancedFilters'

interface Props {
  filters: AdvancedFilters
  hasActiveFilters: boolean
  activeFilterCount: number
  companies?: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:filters': [filters: AdvancedFilters]
}>()

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'todo': 'A Fazer',
    'in_progress': 'Em Andamento',
    'done': 'Concluído'
  }
  return labels[status] || status
}

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    'alta': 'Alta',
    'media': 'Média',
    'baixa': 'Baixa'
  }
  return labels[priority] || priority
}

const getCompanyName = (companyId: string): string => {
  const company = props.companies?.find(c => c.id === companyId)
  return company?.name || companyId
}

const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(date))
}

const removeFilter = (filterName: keyof AdvancedFilters) => {
  const newFilters = { ...props.filters }
  if (filterName === 'search') newFilters.search = ''
  else if (filterName === 'date_from') newFilters.date_from = ''
  else if (filterName === 'date_to') newFilters.date_to = ''
  else if (filterName === 'due_date_from') newFilters.due_date_from = ''
  else if (filterName === 'due_date_to') newFilters.due_date_to = ''
  else if (filterName === 'has_estimation') newFilters.has_estimation = null
  else if (filterName === 'has_subtasks') newFilters.has_subtasks = null
  else if (filterName === 'overdue_only') newFilters.overdue_only = false
  emit('update:filters', newFilters)
}

const removeArrayFilter = (filterName: string, value: any) => {
  const newFilters = { ...props.filters }
  const filter = newFilters[filterName as keyof AdvancedFilters] as any[]
  if (Array.isArray(filter)) {
    const index = filter.indexOf(value)
    if (index > -1) {
      filter.splice(index, 1)
    }
  }
  emit('update:filters', newFilters)
}

const clearAllFilters = () => {
  emit('update:filters', {
    search: '',
    status: [],
    priority: [],
    assigned_to: [],
    company_id: [],
    date_from: '',
    date_to: '',
    due_date_from: '',
    due_date_to: '',
    has_estimation: null,
    estimation_min: 0,
    estimation_max: 999,
    has_subtasks: null,
    has_attachments: null,
    has_comments: null,
    tags: [],
    overdue_only: false
  })
}
</script>
