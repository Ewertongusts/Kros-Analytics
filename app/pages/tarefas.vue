<template>
  <LayoutsKPageLayout max-width="1800px">
    <UiKLoader 
      v-if="handlerLoading" 
      message="Carregando Tarefas..." 
    />

    <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
      <BlocksKPageHeader title="Tarefas" subtitle="Gestão de Atividades e Progresso">
        <template #actions>
          <div class="flex items-center gap-3">
            <UiKButtonPrimary 
              icon="plus"
              @click="openTaskModal()"
            >
              Nova Tarefa
            </UiKButtonPrimary>
            <button 
              @click="syncData"
              class="p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
              title="Sincronizar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
            </button>
          </div>
        </template>
      </BlocksKPageHeader>

      <!-- Filtros e Métricas -->
      <TasksKTasksFiltersBar 
        :tasks="handlerTasks"
        @update:search="searchQuery = $event"
        @update:priority="priorityFilter = $event"
        @update:status="statusFilter = $event"
      />

      <!-- Kanban Board -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- A Fazer -->
        <div 
          class="flex flex-col rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/0 border border-blue-500/15 transition-all duration-200"
          :class="dragSource === 'todo' ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20' : ''"
          @dragover="handleDragOver"
          @drop="handleTaskDrop($event, 'todo')"
        >
          <!-- Header da Coluna -->
          <div class="p-4 border-b border-blue-500/10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                <h3 class="font-bold text-white uppercase tracking-widest text-sm">A Fazer</h3>
              </div>
              <span class="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-500/30">
                {{ filteredTodoTasks.length }}
              </span>
            </div>
          </div>

          <!-- Cards Container -->
          <div class="flex-1 p-4 space-y-3 overflow-y-auto min-h-[600px]">
            <TasksKTaskCard
              v-for="task in filteredTodoTasks"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @dragstart="handleTaskDragStart(task, 'todo')"
              @dragend="handleDragEnd"
            />
            <div v-if="filteredTodoTasks.length === 0" class="flex items-center justify-center py-12 text-white/30">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm">Nenhuma tarefa</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Em Andamento -->
        <div 
          class="flex flex-col rounded-xl bg-gradient-to-br from-yellow-500/5 to-yellow-500/0 border border-yellow-500/15 transition-all duration-200"
          :class="dragSource === 'in_progress' ? 'ring-2 ring-yellow-500/50 shadow-lg shadow-yellow-500/20' : ''"
          @dragover="handleDragOver"
          @drop="handleTaskDrop($event, 'in_progress')"
        >
          <!-- Header da Coluna -->
          <div class="p-4 border-b border-yellow-500/10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <h3 class="font-bold text-white uppercase tracking-widest text-sm">Em Andamento</h3>
              </div>
              <span class="px-2.5 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold border border-yellow-500/30">
                {{ filteredInProgressTasks.length }}
              </span>
            </div>
          </div>

          <!-- Cards Container -->
          <div class="flex-1 p-4 space-y-3 overflow-y-auto min-h-[600px]">
            <TasksKTaskCard
              v-for="task in filteredInProgressTasks"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @dragstart="handleTaskDragStart(task, 'in_progress')"
              @dragend="handleDragEnd"
            />
            <div v-if="filteredInProgressTasks.length === 0" class="flex items-center justify-center py-12 text-white/30">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p class="text-sm">Nenhuma tarefa</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Concluído -->
        <div 
          class="flex flex-col rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 border border-emerald-500/15 transition-all duration-200"
          :class="dragSource === 'done' ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20' : ''"
          @dragover="handleDragOver"
          @drop="handleTaskDrop($event, 'done')"
        >
          <!-- Header da Coluna -->
          <div class="p-4 border-b border-emerald-500/10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                <h3 class="font-bold text-white uppercase tracking-widest text-sm">Concluído</h3>
              </div>
              <span class="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
                {{ filteredDoneTasks.length }}
              </span>
            </div>
          </div>

          <!-- Cards Container -->
          <div class="flex-1 p-4 space-y-3 overflow-y-auto min-h-[600px]">
            <TasksKTaskCard
              v-for="task in filteredDoneTasks"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @dragstart="handleTaskDragStart(task, 'done')"
              @dragend="handleDragEnd"
            />
            <div v-if="filteredDoneTasks.length === 0" class="flex items-center justify-center py-12 text-white/30">
              <div class="text-center">
                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm">Nenhuma tarefa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BlocksKGlobalFooter />
    </div>

    <!-- Modal de Tarefa -->
      <BlocksKTaskModal 
        v-if="isTaskModalOpen"
        :is-open="isTaskModalOpen"
        :task="selectedTask"
        :companies="companies"
        :tag-definitions="tagDefinitions"
        :submitting="loadingAction"
        @close="closeTaskModal"
        @save="handleSaveTask"
      />

      <!-- Preview de Drag e Drop -->
      <!-- Removido temporariamente -->
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import type { Task } from '~/composables/useTasks'
import { useTaskHandlers } from '~/composables/useTaskHandlers'
import { useTaskDragDrop } from '~/composables/useTaskDragDrop'
import { useTaskHistory } from '~/composables/useTaskHistory'

definePageMeta({
  middleware: 'auth'
})

const { companies, fetchCompanies } = useCompanies()
const { tags: tagDefinitions, fetchTags } = useTags()

const {
  tasks: handlerTasks,
  loading,
  fetchTasks: handlerFetchTasks,
  isTaskModalOpen,
  selectedTask,
  loadingAction,
  openTaskModal,
  closeTaskModal,
  handleSaveTask,
  moveTask,
  deleteTask
} = useTaskHandlers()

const { draggedTask, dragSource, handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useTaskDragDrop()
const { canUndo, canRedo, addToHistory, undo: undoHistory, redo: redoHistory } = useTaskHistory()

const searchQuery = ref('')
const priorityFilter = ref('')
const statusFilter = ref('')
const handlerLoading = ref(false)

const todoTasks = computed(() => handlerTasks.value.filter(t => t.status === 'todo'))
const inProgressTasks = computed(() => handlerTasks.value.filter(t => t.status === 'in_progress'))
const doneTasks = computed(() => handlerTasks.value.filter(t => t.status === 'done'))

// Filtros aplicados
const filteredTasks = computed(() => {
  return handlerTasks.value.filter(task => {
    const matchSearch = !searchQuery.value || 
      task.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchPriority = !priorityFilter.value || task.priority === priorityFilter.value
    const matchStatus = !statusFilter.value || task.status === statusFilter.value
    
    return matchSearch && matchPriority && matchStatus
  })
})

const filteredTodoTasks = computed(() => filteredTasks.value.filter(t => t.status === 'todo'))
const filteredInProgressTasks = computed(() => {
  const result = filteredTasks.value.filter(t => t.status === 'in_progress')
  console.log('📊 [filteredInProgressTasks] resultado:', result)
  return result
})
const filteredDoneTasks = computed(() => filteredTasks.value.filter(t => t.status === 'done'))

const syncData = async () => {
  await handlerFetchTasks()
}

const handleTaskDragStart = (task: Task, source: string) => {
  handleDragStart(task, source)
}

const handleTaskDrop = async (e: DragEvent, targetStatus: 'todo' | 'in_progress' | 'done') => {
  await handleDrop(e, targetStatus, moveTask)
}

const undo = () => {
  const entry = undoHistory()
  if (entry) {
    addToHistory({
      action: entry.action,
      task: entry.task,
      previousState: entry.previousState,
      timestamp: Date.now()
    })
  }
}

const redo = () => {
  const entry = redoHistory()
  if (entry) {
    addToHistory({
      action: entry.action,
      task: entry.task,
      previousState: entry.previousState,
      timestamp: Date.now()
    })
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    undo()
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault()
    redo()
  }
}

let unsubscribe: (() => void) | null = null

onMounted(async () => {
  try {
    await fetchCompanies()
    await fetchTags()
    await handlerFetchTasks()

    // Real-time subscription
    const supabase = useSupabaseClient()
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          handlerFetchTasks()
        }
      )
      .subscribe()

    unsubscribe = () => {
      supabase.removeChannel(channel)
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', handleKeyDown)
  } catch (error) {
    console.error('Erro ao montar página de tarefas:', error)
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* Scrollbar customizado */
div::-webkit-scrollbar {
  width: 6px;
}

div::-webkit-scrollbar-track {
  background: transparent;
}

div::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  transition: background 0.2s;
}

div::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Animações de entrada */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Aplicar animação aos cards */
:deep(.space-y-3 > div) {
  animation: slideInUp 0.3s ease-out;
}
</style>
