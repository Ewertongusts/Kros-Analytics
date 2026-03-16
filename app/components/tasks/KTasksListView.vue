<template>
  <div class="space-y-2">
    <!-- Header com filtros -->
    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-2 flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar tarefas..."
          class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
        />
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="filterStatus"
          class="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="">Todos os status</option>
          <option value="todo">A Fazer</option>
          <option value="in_progress">Em Progresso</option>
          <option value="done">Concluído</option>
        </select>
        
        <!-- Botão Nova Tarefa -->
        <button
          @click="handleAddTask"
          class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          title="Nova tarefa"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nova Tarefa
        </button>
      </div>
    </div>

    <!-- Tabela de tarefas -->
    <div class="overflow-x-auto rounded-lg border border-white/10">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/10 bg-white/5">
            <th class="px-4 py-3 text-left font-semibold text-white/80 w-8">
              <button
                @click="toggleSelectAll"
                class="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                :class="[
                  allSelected 
                    ? 'text-white shadow-lg' 
                    : 'bg-black/40 border border-white/20 hover:bg-black/60'
                ]"
                :style="allSelected ? { backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 8px var(--kros-blue, #FF0000)' } : {}"
              >
                <svg v-if="allSelected" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </th>
            <th class="px-4 py-3 text-left font-semibold text-white/80">Tarefa</th>
            <th class="px-4 py-3 text-left font-semibold text-white/80 w-32">Status</th>
            <th class="px-4 py-3 text-left font-semibold text-white/80 w-20">Prioridade</th>
            <th class="px-4 py-3 text-left font-semibold text-white/80 w-24">Coluna</th>
            <th class="px-4 py-3 text-left font-semibold text-white/80 w-24">Criação</th>
            <th class="px-4 py-3 text-left font-semibold text-white/80 w-24">Vencimento</th>
            <th class="px-4 py-3 text-left font-semibold text-white/80 w-20">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="task in filteredTasks"
            :key="task.id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors"
            :class="{ 'bg-white/10': isTaskSelected(task.id!) }"
          >
            <!-- Checkbox -->
            <td class="px-4 py-3">
              <button
                @click="toggleTaskSelection(task.id!)"
                class="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                :class="[
                  isTaskSelected(task.id!)
                    ? 'text-white shadow-lg'
                    : 'bg-black/40 border border-white/20 hover:bg-black/60'
                ]"
                :style="isTaskSelected(task.id!) ? { backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 8px var(--kros-blue, #FF0000)' } : {}"
              >
                <svg v-if="isTaskSelected(task.id!)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </td>

            <!-- Título -->
            <td class="px-4 py-3">
              <div class="flex flex-col">
                <span class="font-medium text-white">{{ task.title }}</span>
                <span v-if="task.description" class="text-xs text-white/40 line-clamp-1">{{ task.description }}</span>
              </div>
            </td>

            <!-- Status -->
            <td class="px-4 py-3">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-semibold',
                  task.status === 'todo' ? 'bg-blue-500/20 text-blue-400' :
                  task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                ]"
              >
                {{ statusLabel(task.status) }}
              </span>
            </td>

            <!-- Prioridade -->
            <td class="px-4 py-3">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-semibold',
                  task.priority === 'alta' ? 'bg-red-500/20 text-red-400' :
                  task.priority === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                ]"
              >
                {{ priorityLabel(task.priority) }}
              </span>
            </td>

            <!-- Coluna -->
            <td class="px-4 py-3">
              <span class="text-white/60 text-xs">{{ getColumnName(task.column_id) }}</span>
            </td>

            <!-- Criação -->
            <td class="px-4 py-3">
              <span v-if="task.created_at" class="text-white/60 text-xs">
                {{ formatDate(task.created_at) }}
              </span>
              <span v-else class="text-white/30 text-xs">-</span>
            </td>

            <!-- Vencimento -->
            <td class="px-4 py-3">
              <span v-if="task.due_date" class="text-white/60 text-xs">
                {{ formatDate(task.due_date) }}
              </span>
              <span v-else class="text-white/30 text-xs">-</span>
            </td>

            <!-- Ações -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button
                  @click="$emit('edit', task)"
                  class="p-1 rounded hover:bg-blue-500/20 text-white/60 hover:text-blue-400 transition-colors"
                  title="Editar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="$emit('duplicate', task)"
                  class="p-1 rounded hover:bg-blue-500/20 text-white/60 hover:text-blue-400 transition-colors"
                  title="Duplicar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  @click="$emit('delete', task)"
                  class="p-1 rounded hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                  title="Deletar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mensagem vazia -->
    <div v-if="filteredTasks.length === 0" class="flex items-center justify-center py-12 text-white/40">
      <div class="text-center">
        <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm">Nenhuma tarefa encontrada</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '~/composables/useTasks'

interface Props {
  tasks: Task[]
  columns: any[]
  isTaskSelected: (id: string) => boolean
  toggleTaskSelection: (id: string) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [task: Task]
  duplicate: [task: Task]
  'add-task': []
}>()

const searchQuery = ref('')
const filterStatus = ref('')

const filteredTasks = computed(() => {
  return props.tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)
    const matchesStatus = !filterStatus.value || task.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

const allSelected = computed(() => {
  return filteredTasks.value.length > 0 && filteredTasks.value.every(t => props.isTaskSelected(t.id!))
})

const handleAddTask = () => {
  emit('add-task')
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    // Se todas estão selecionadas, desmarcar todas
    filteredTasks.value.forEach(task => {
      if (props.isTaskSelected(task.id!)) {
        props.toggleTaskSelection(task.id!)
      }
    })
  } else {
    // Se nem todas estão selecionadas, marcar todas
    filteredTasks.value.forEach(task => {
      if (!props.isTaskSelected(task.id!)) {
        props.toggleTaskSelection(task.id!)
      }
    })
  }
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'todo': 'A Fazer',
    'in_progress': 'Em Progresso',
    'done': 'Concluído'
  }
  return labels[status] || status
}

const priorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    'alta': 'Alta',
    'media': 'Média',
    'baixa': 'Baixa'
  }
  return labels[priority] || priority
}

const getColumnName = (columnId?: string) => {
  if (!columnId) return 'Sem coluna'
  const column = props.columns.find(c => c.column_id === columnId)
  return column?.name || 'Desconhecida'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  
  try {
    const d = new Date(date)
    
    // Verificar se a data é válida
    if (isNaN(d.getTime())) return '-'
    
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Zerar horas para comparação apenas de datas
    
    const taskDate = new Date(d)
    taskDate.setHours(0, 0, 0, 0) // Zerar horas para comparação apenas de datas
    
    const diffTime = taskDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Amanhã'
    if (diffDays === -1) return 'Ontem'
    if (diffDays < 0) return `${Math.abs(diffDays)}d atrás`
    if (diffDays < 7) return `${diffDays}d`
    
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      timeZone: 'America/Sao_Paulo'
    }).format(d)
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}
</script>
