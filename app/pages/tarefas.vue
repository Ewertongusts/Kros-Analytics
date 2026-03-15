<template>
  <LayoutsKPageLayout max-width="1800px">
    <UiKLoader 
      v-if="handlerLoading" 
      message="Carregando Tarefas..." 
    />

    <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700" :style="{ paddingTop: `calc(100vh - ${kanbanHeight}px)` }">
      <!-- Kanban Board - Fixed no topo -->
      <div class="flex gap-3 overflow-x-auto items-start fixed left-0 right-0 z-40" :style="{ top: `${kanbanHeight}px`, height: `calc(100vh - ${kanbanHeight}px)`, paddingLeft: '120px' }">
        <!-- A Fazer -->
        <div 
          class="flex-shrink-0 w-[220px] rounded-xl bg-[#1a1a1c] border border-white/5 transition-all duration-200"
          :class="dragSource === 'todo' ? 'ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10' : ''"
          @dragover="handleDragOverWithScroll"
          @drop="handleTaskDrop($event, 'todo')"
        >
          <!-- Header da Coluna -->
          <div class="p-2.5 border-b border-white/5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <h3 class="font-semibold text-white text-xs">New Request</h3>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.5 bg-white/5 text-white/60 rounded text-[10px] font-medium">
                  {{ filteredTodoTasks.length }}
                </span>
                <button
                  @click="openTaskModal(undefined, 'todo')"
                  class="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="Nova tarefa"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Cards Container -->
          <div class="p-2 space-y-2 min-h-[100px]">
            <TasksKTaskCard
              v-for="task in filteredTodoTasks"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @duplicate="duplicateTask"
              @dragstart="handleTaskDragStart(task, 'todo')"
              @dragend="handleDragEndWithScroll"
            />
            <div v-if="filteredTodoTasks.length === 0" class="flex items-center justify-center py-6 text-white/20">
              <div class="text-center">
                <svg class="w-6 h-6 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-[10px]">Nenhuma tarefa</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Em Andamento -->
        <div 
          class="flex-shrink-0 w-[220px] rounded-xl bg-[#1a1a1c] border border-white/5 transition-all duration-200"
          :class="dragSource === 'in_progress' ? 'ring-2 ring-yellow-500/30 shadow-lg shadow-yellow-500/10' : ''"
          @dragover="handleDragOverWithScroll"
          @drop="handleTaskDrop($event, 'in_progress')"
        >
          <!-- Header da Coluna -->
          <div class="p-2.5 border-b border-white/5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                <h3 class="font-semibold text-white text-xs">In Progress</h3>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.5 bg-white/5 text-white/60 rounded text-[10px] font-medium">
                  {{ filteredInProgressTasks.length }}
                </span>
                <button
                  @click="openTaskModal(undefined, 'in_progress')"
                  class="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="Nova tarefa"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Cards Container -->
          <div class="p-2 space-y-2 min-h-[100px]">
            <TasksKTaskCard
              v-for="task in filteredInProgressTasks"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @duplicate="duplicateTask"
              @dragstart="handleTaskDragStart(task, 'in_progress')"
              @dragend="handleDragEndWithScroll"
            />
            <div v-if="filteredInProgressTasks.length === 0" class="flex items-center justify-center py-6 text-white/20">
              <div class="text-center">
                <svg class="w-6 h-6 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p class="text-[10px]">Nenhuma tarefa</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Concluído -->
        <div 
          class="flex-shrink-0 w-[220px] rounded-xl bg-[#1a1a1c] border border-white/5 transition-all duration-200"
          :class="dragSource === 'done' ? 'ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10' : ''"
          @dragover="handleDragOverWithScroll"
          @drop="handleTaskDrop($event, 'done')"
        >
          <!-- Header da Coluna -->
          <div class="p-2.5 border-b border-white/5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <h3 class="font-semibold text-white text-xs">Complete</h3>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.5 bg-white/5 text-white/60 rounded text-[10px] font-medium">
                  {{ filteredDoneTasks.length }}
                </span>
                <button
                  @click="openTaskModal(undefined, 'done')"
                  class="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="Nova tarefa"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Cards Container -->
          <div class="p-2 space-y-2 min-h-[100px]">
            <TasksKTaskCard
              v-for="task in filteredDoneTasks"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @duplicate="duplicateTask"
              @dragstart="handleTaskDragStart(task, 'done')"
              @dragend="handleDragEndWithScroll"
            />
            <div v-if="filteredDoneTasks.length === 0" class="flex items-center justify-center py-6 text-white/20">
              <div class="text-center">
                <svg class="w-6 h-6 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-[10px]">Nenhuma tarefa</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Colunas Customizadas -->
        <div 
          v-for="column in customColumns"
          :key="column.id"
          class="flex-shrink-0 w-[220px] rounded-xl bg-[#1a1a1c] border border-white/5 transition-all duration-200"
          @dragover="handleDragOverWithScroll"
          @drop="handleTaskDrop($event, column.status)"
        >
          <!-- Header da Coluna -->
          <div class="p-2.5 border-b border-white/5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 flex-1">
                <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: column.color }"></div>
                <h3 class="font-semibold text-white text-xs">{{ column.name }}</h3>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.5 bg-white/5 text-white/60 rounded text-[10px] font-medium">
                  {{ handlerTasks.filter(t => t.status === column.status).length }}
                </span>
                <button
                  @click="openTaskModal(undefined, column.status)"
                  class="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="Nova tarefa"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  @click="moveColumnLeft(column.id)"
                  :disabled="customColumns.indexOf(column) === 0"
                  class="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-30"
                  :class="customColumns.indexOf(column) === 0 ? 'cursor-not-allowed' : 'cursor-pointer'"
                  title="Mover para esquerda"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  @click="moveColumnRight(column.id)"
                  :disabled="customColumns.indexOf(column) === customColumns.length - 1"
                  class="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-30"
                  :class="customColumns.indexOf(column) === customColumns.length - 1 ? 'cursor-not-allowed' : 'cursor-pointer'"
                  title="Mover para direita"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  @click="removeColumn(column.id)"
                  class="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                  title="Remover coluna"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Cards Container -->
          <div class="p-2 space-y-2 min-h-[100px]">
            <TasksKTaskCard
              v-for="task in handlerTasks.filter(t => t.status === column.status)"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @duplicate="duplicateTask"
              @dragstart="handleTaskDragStart(task, column.status)"
              @dragend="handleDragEndWithScroll"
            />
            <div v-if="handlerTasks.filter(t => t.status === column.status).length === 0" class="flex items-center justify-center py-6 text-white/20">
              <div class="text-center">
                <svg class="w-6 h-6 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-[10px]">Nenhuma tarefa</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna de Tarefas Órfãs (se houver) -->
        <div 
          v-if="orphanTasks.length > 0"
          class="flex-shrink-0 w-[220px] rounded-xl bg-[#1a1a1c] border border-orange-500/30 transition-all duration-200"
          @dragover="handleDragOverWithScroll"
        >
          <!-- Header da Coluna -->
          <div class="p-2.5 border-b border-white/5 bg-orange-500/10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 flex-1">
                <div class="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                <h3 class="font-semibold text-orange-400 text-xs">Tarefas Órfãs</h3>
              </div>
              <span class="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded text-[10px] font-medium">
                {{ orphanTasks.length }}
              </span>
            </div>
            <p class="text-[9px] text-orange-400/60 mt-1">Tarefas sem coluna visível</p>
          </div>

          <!-- Cards Container -->
          <div class="p-2 space-y-2 min-h-[100px]">
            <TasksKTaskCard
              v-for="task in orphanTasks"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @duplicate="duplicateTask"
              @dragstart="handleTaskDragStart(task, task.status || 'todo')"
              @dragend="handleDragEndWithScroll"
            />
          </div>
        </div>

        <!-- Botão Adicionar Coluna -->
        <div class="flex-shrink-0 w-[220px]">
          <button
            @click="addNewColumn"
            class="w-full p-2.5 bg-[#1a1a1c] hover:bg-white/5 border border-dashed border-white/10 hover:border-white/20 rounded-xl transition-all text-white/30 hover:text-white/50 flex items-center justify-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-xs font-medium">Add Column</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Tarefa -->
      <BlocksKTaskModal 
        v-if="isTaskModalOpen"
        :is-open="isTaskModalOpen"
        :task="selectedTask"
        :companies="companies"
        :tag-definitions="tagDefinitions"
        :submitting="loadingAction"
        :default-status="defaultStatus"
        @close="closeTaskModal"
        @save="handleSaveTask"
      />

      <!-- Preview de Drag e Drop -->
      <!-- Removido temporariamente -->

      <!-- Botão Flutuante de Ações -->
      <button
        class="fixed bottom-8 right-8 w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
        title="Ações"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
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
  defaultStatus,
  openTaskModal,
  closeTaskModal,
  handleSaveTask,
  moveTask,
  deleteTask,
  duplicateTask
} = useTaskHandlers()

const { draggedTask, dragSource, handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useTaskDragDrop()
const { canUndo, canRedo, addToHistory, undo: undoHistory, redo: redoHistory } = useTaskHistory()
const { columns: customColumns, fetchColumns, addColumn, updateColumn, deleteColumn, moveColumn, clearLocalStorage } = useKanbanColumns()

const searchQuery = ref('')
const priorityFilter = ref('')
const statusFilter = ref('')
const handlerLoading = ref(false)
const showFilters = ref(false)
const kanbanHeight = ref(50)

const calculateKanbanHeight = () => {
  // Medir a distância real do topo até o kanban
  const kanbanContainer = document.querySelector('.overflow-x-auto')
  if (kanbanContainer) {
    const rect = kanbanContainer.getBoundingClientRect()
    kanbanHeight.value = rect.top
  }
}

const addNewColumn = () => {
  const columnName = prompt('Nome da nova coluna:')
  if (!columnName) return
  
  addColumn({
    column_id: `custom_${Date.now()}`,
    name: columnName,
    color: '#8b5cf6',
    status: `custom_${Date.now()}`,
    position: customColumns.value.length
  })
}

const todoTasks = computed(() => {
  const result = handlerTasks.value.filter(t => t.status === 'todo')
  console.log('📋 todoTasks computed:', result.length, result)
  return result
})
const inProgressTasks = computed(() => {
  const result = handlerTasks.value.filter(t => t.status === 'in_progress')
  console.log('📋 inProgressTasks computed:', result.length, result)
  return result
})
const doneTasks = computed(() => {
  const result = handlerTasks.value.filter(t => t.status === 'done')
  console.log('📋 doneTasks computed:', result.length, result)
  return result
})

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

// Tarefas órfãs (com status que não corresponde a nenhuma coluna)
const orphanTasks = computed(() => {
  const validStatuses = ['todo', 'in_progress', 'done', ...customColumns.value.map(c => c.status)]
  return handlerTasks.value.filter(t => !validStatuses.includes(t.status || ''))
})

const removeColumn = (columnId: string) => {
  const confirmed = confirm('Deseja remover esta coluna? As tarefas não serão deletadas.')
  if (confirmed) {
    deleteColumn(columnId)
  }
}

const moveColumnLeft = (columnId: string) => {
  const index = customColumns.value.findIndex(c => c.column_id === columnId)
  if (index > 0) {
    moveColumn(columnId, index - 1)
  }
}

const moveColumnRight = (columnId: string) => {
  const index = customColumns.value.findIndex(c => c.column_id === columnId)
  if (index < customColumns.value.length - 1) {
    moveColumn(columnId, index + 1)
  }
}

const syncData = async () => {
  await handlerFetchTasks()
}

const handleTaskDragStart = (task: Task, source: string) => {
  handleDragStart(task, source)
}

const handleTaskDrop = async (e: DragEvent, targetStatus: string) => {
  await handleDrop(e, targetStatus as any, moveTask)
}

// Auto-scroll horizontal durante drag
let scrollInterval: number | null = null

const handleDragOverWithScroll = (e: DragEvent) => {
  handleDragOver(e)
  
  const container = (e.currentTarget as HTMLElement).closest('.overflow-x-auto')
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  const scrollSpeed = 15
  const edgeSize = 100 // pixels da borda para ativar scroll
  
  // Limpar intervalo anterior
  if (scrollInterval) {
    clearInterval(scrollInterval)
    scrollInterval = null
  }
  
  // Scroll para direita
  if (e.clientX > rect.right - edgeSize) {
    scrollInterval = window.setInterval(() => {
      container.scrollLeft += scrollSpeed
    }, 16)
  }
  // Scroll para esquerda
  else if (e.clientX < rect.left + edgeSize) {
    scrollInterval = window.setInterval(() => {
      container.scrollLeft -= scrollSpeed
    }, 16)
  }
}

const handleDragEndWithScroll = () => {
  handleDragEnd()
  if (scrollInterval) {
    clearInterval(scrollInterval)
    scrollInterval = null
  }
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
    calculateKanbanHeight()
    window.addEventListener('resize', calculateKanbanHeight)

    await fetchColumns()
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
  window.removeEventListener('resize', calculateKanbanHeight)
})
</script>

<style scoped>
/* Scrollbar customizado - Premium e fino */
div::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

div::-webkit-scrollbar-track {
  background: transparent;
}

div::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  transition: background 0.2s;
}

div::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
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
