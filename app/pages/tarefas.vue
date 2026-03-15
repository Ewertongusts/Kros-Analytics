<template>
  <LayoutsKPageLayout max-width="1800px">
    <UiKLoader 
      v-if="handlerLoading" 
      message="Carregando Tarefas..." 
    />

    <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700" :style="{ paddingTop: `calc(100vh - ${kanbanHeight}px)` }">
      <!-- Kanban Board - Fixed no topo -->
      <div class="flex gap-3 overflow-x-auto items-start fixed left-0 right-0 z-40" :style="{ top: `${kanbanHeight}px`, height: `calc(100vh - ${kanbanHeight}px)`, paddingLeft: '120px', paddingRight: '40px' }">
        <!-- Colunas Customizadas -->
        <div 
          v-for="(column, index) in displayColumns"
          :key="column.column_id"
          :data-column="column.column_id"
          @dragover="(e) => {
            handleColumnDragOver(column.column_id, e, customColumns)
            handleDragOverWithScroll(e)
          }"
          @dragleave="handleColumnDragLeave"
          @drop="(e) => {
            handleColumnDrop(column.column_id, customColumns, moveColumn, e)
            if (!e.dataTransfer?.types.includes('column-drag')) {
              handleTaskDropWithPosition(e, column.column_id)
            }
          }"
          class="flex-shrink-0 w-[220px] rounded-xl bg-[#1a1a1c] border border-white/5 transition-all duration-300 ease-out relative"
          :class="[
            draggedColumnId === column.column_id ? 'opacity-50' : ''
          ]"
          :style="{
            transform: draggedColumnId && draggedColumnId !== column.column_id ? `translateX(${
              displayColumns.findIndex(c => c.column_id === draggedColumnId) < index ? '-12px' : 
              displayColumns.findIndex(c => c.column_id === draggedColumnId) > index ? '12px' : '0px'
            })` : 'translateX(0px)',
            transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          }"
        >
          <!-- Indicador de inserção à esquerda (antes de 50%) -->
          <div 
            v-if="dragOverColumnId === column.column_id && dragOverSide === 'left' && draggedColumnId !== column.column_id"
            class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-all duration-200 shadow-lg column-indicator"
            :style="{ backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 16px var(--kros-blue, #FF0000)' }"
          ></div>
          
          <!-- Indicador de inserção à direita (depois de 50%) -->
          <div 
            v-if="dragOverColumnId === column.column_id && dragOverSide === 'right' && draggedColumnId !== column.column_id"
            class="absolute right-0 top-0 bottom-0 w-1.5 rounded-r-xl transition-all duration-200 shadow-lg column-indicator"
            :style="{ backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 16px var(--kros-blue, #FF0000)' }"
          ></div>
          <!-- Header da Coluna -->
          <div 
            class="p-2.5 border-b border-white/5"
            draggable="true"
            @dragstart="handleColumnDragStart(column.column_id, $event)"
            @dragend="handleColumnDragEnd"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 flex-1 cursor-grab active:cursor-grabbing" :class="{ 'opacity-50': draggedColumnId === column.column_id }">
                <svg class="w-4 h-4 text-white/30 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm4-8h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2z" />
                </svg>
                <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: column.color }"></div>
                <h3 class="font-semibold text-white text-xs">{{ column.name }}</h3>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.5 bg-white/5 text-white/60 rounded text-[10px] font-medium">
                  {{ getTasksInColumn(column.column_id).length }}
                </span>
                <button
                  @click="openTaskModal(undefined, column.column_id)"
                  class="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="Nova tarefa"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  @click="renameColumn(column)"
                  class="p-1 rounded hover:bg-blue-500/20 text-white/40 hover:text-blue-400 transition-colors"
                  title="Renomear coluna"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="removeColumn(column.column_id)"
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
              v-for="task in getTasksInColumn(column.column_id)"
              :key="task.id"
              :data-task="task.id"
              :task="task"
              :is-drag-over="dragOverTaskId === task.id"
              :drag-over-position="dragOverPosition"
              :is-selected="isTaskSelected(task.id!)"
              :is-entering="isEntering(task.id!)"
              :is-exiting="isExiting(task.id!)"
              :is-settling="isSettling(task.id!)"
              :is-syncing="isSyncing(task.id!)"
              @edit="openTaskModal"
              @delete="(t: Task) => deleteTask(t.id!)"
              @duplicate="duplicateTask"
              @select="toggleTaskSelection"
              @dragstart="handleTaskDragStart(task, column.status)"
              @dragend="handleDragEndWithScroll"
              @dragover="(e: DragEvent) => handleDragOver(e, task.id, moveTask)"
              @dragleave="handleDragLeave"
              @drop="(e: DragEvent) => {
                handleTaskDropWithPosition(e, column.column_id)
                handleDragEndWithScroll()
              }"
              @transition-complete="completeTransition(task.id!)"
            />
            <div v-if="getTasksInColumn(column.column_id).length === 0" class="flex items-center justify-center py-6 text-white/20">
              <div class="text-center">
                <svg class="w-6 h-6 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-[10px]">Nenhuma tarefa</p>
              </div>
            </div>
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

        <!-- Coluna de Tarefas Órfãs (se houver) - SEMPRE POR ÚLTIMO -->
        <div 
          v-if="orphanTasks.length > 0"
          class="flex-shrink-0 w-[220px] rounded-xl bg-transparent border border-orange-500/30 transition-all duration-200"
          @dragover="handleDragOverWithScroll"
        >
          <!-- Header da Coluna -->
          <div class="p-2.5 border-b border-orange-500/30 bg-orange-500/5 rounded-t-xl">
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
              :data-task="task.id"
              :task="task"
              :is-orphan="true"
              :is-drag-over="dragOverTaskId === task.id"
              :drag-over-position="dragOverPosition"
              :is-selected="isTaskSelected(task.id!)"
              :is-entering="isEntering(task.id!)"
              :is-exiting="isExiting(task.id!)"
              :is-settling="isSettling(task.id!)"
              :is-syncing="isSyncing(task.id!)"
              @edit="openTaskModal"
              @delete="(t: Task) => deleteTask(t.id!)"
              @duplicate="duplicateTask"
              @select="toggleTaskSelection"
              @dragstart="handleTaskDragStart(task, task.status || 'todo')"
              @dragend="handleDragEndWithScroll"
              @dragover="(e: DragEvent) => handleDragOver(e, task.id, moveTask)"
              @dragleave="handleDragLeave"
              @drop="(e: DragEvent) => {
                handleTaskDropWithPosition(e, task.status || 'todo')
                handleDragEndWithScroll()
              }"
              @transition-complete="completeTransition(task.id!)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Renomear Coluna -->
    <TasksKRenameColumnModal
      :is-open="isRenameModalOpen"
      :column="columnToRename"
      @close="isRenameModalOpen = false"
      @save="handleRenameColumnSave"
    />

    <!-- Modal de Tarefa -->
      <BlocksKTaskModal 
        v-if="isTaskModalOpen"
        :is-open="isTaskModalOpen"
        :task="selectedTask"
        :companies="companies"
        :tag-definitions="tagDefinitions"
        :submitting="loadingAction"
        :default-column-id="defaultColumnId"
        @close="closeTaskModal"
        @save="handleSaveTask"
      />

      <!-- Preview de Drag e Drop -->
      <!-- Removido temporariamente -->

      <!-- Botão Flutuante de Ações -->
      <div v-if="selectedCount > 0" class="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        <!-- Contador de seleção -->
        <div class="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold">
          {{ selectedCount }} selecionado(s)
        </div>
        
        <!-- Botão Deletar -->
        <button
          @click="deleteSelectedTasks"
          :style="{ backgroundColor: '#ef4444' }"
          class="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:opacity-90"
          title="Deletar selecionados"
        >
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <!-- Botão Limpar seleção -->
        <button
          @click="deselectAll"
          :style="{ backgroundColor: 'var(--kros-blue, #3b82f6)' }"
          class="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:opacity-90"
          title="Limpar seleção"
        >
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Botão Flutuante de Ações (quando nenhuma tarefa selecionada) -->
      <button
        v-else
        :style="{ backgroundColor: 'var(--kros-blue, #3b82f6)' }"
        class="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:opacity-90 z-50"
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
import '~/components/tasks/kanban-transitions.css'
import { useTaskHandlers } from '~/composables/useTaskHandlers'
import { useTaskDragDrop } from '~/composables/useTaskDragDrop'
import { useTaskHistory } from '~/composables/useTaskHistory'
import { useColumnDragDrop } from '~/composables/useColumnDragDrop'
import { useRealtimeCardTransitions } from '~/composables/useRealtimeCardTransitions'
import { useAdvancedTransitions } from '~/composables/useAdvancedTransitions'

definePageMeta({
  middleware: 'auth'
})

const { companies, fetchCompanies } = useCompanies()
const { tags: tagDefinitions, fetchTags } = useTags()

const {
  tasks: handlerTasks,
  fetchTasks: handlerFetchTasks,
  isTaskModalOpen,
  selectedTask,
  loadingAction,
  defaultColumnId,
  openTaskModal,
  closeTaskModal,
  handleSaveTask,
  moveTask,
  deleteTask,
  duplicateTask
} = useTaskHandlers()

const { dragOverTaskId, dragOverPosition, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop } = useTaskDragDrop()
const { addToHistory, undo: undoHistory, redo: redoHistory } = useTaskHistory()
const { columns: customColumns, fetchColumns, addColumn, updateColumn, deleteColumn, moveColumn } = useKanbanColumns()
const { draggedColumnId, dragOverColumnId, dragOverSide, handleColumnDragStart, handleColumnDragOver, handleColumnDragLeave, handleColumnDrop, handleColumnDragEnd } = useColumnDragDrop()
const { toggleTaskSelection, isTaskSelected, deselectAll, selectedCount, getSelectedTaskIds } = useTaskSelection()
const { 
  startEntering, 
  startExiting, 
  startSettling, 
  completeTransition, 
  isEntering, 
  isExiting, 
  isSettling 
} = useRealtimeCardTransitions()
const {
  addDropGlow,
  isSyncing,
  executeFullTransition
} = useAdvancedTransitions()

const kanbanHeight = ref(50)
const isRenameModalOpen = ref(false)
const columnToRename = ref<any>(null)
const isProcessingDrop = ref(false) // Previne race conditions em drops simultâneos

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



// Tarefas órfãs (tarefas sem column_id atribuído)
const orphanTasks = computed(() => {
  return handlerTasks.value.filter(t => !t.column_id)
})

// Colunas para exibição
const displayColumns = computed(() => {
  // Criar novo array para forçar Vue a detectar mudanças de ordem
  return [...customColumns.value]
})

// Função para obter tasks de uma coluna específica
const getTasksInColumn = (columnId: string) => {
  return handlerTasks.value
    .filter(t => t.column_id === columnId)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

const removeColumn = (columnId: string) => {
  const confirmed = confirm('Deseja remover esta coluna? As tarefas não serão deletadas.')
  if (confirmed) {
    deleteColumn(columnId)
  }
}

const renameColumn = (column: any) => {
  columnToRename.value = column
  isRenameModalOpen.value = true
}

const handleRenameColumnSave = (newName: string, newColor: string) => {
  if (columnToRename.value) {
    updateColumn(columnToRename.value.column_id, { 
      name: newName,
      color: newColor
    })
    isRenameModalOpen.value = false
    columnToRename.value = null
  }
}

const syncData = async () => {
  await handlerFetchTasks()
}

const handleTaskDragStart = (task: Task, source: string) => {
  handleDragStart(task, source)
}

const dropTimeoutId = ref<NodeJS.Timeout | null>(null)

const resetDropFlag = () => {
  isProcessingDrop.value = false
  if (dropTimeoutId.value) {
    clearTimeout(dropTimeoutId.value)
    dropTimeoutId.value = null
  }
}

const handleTaskDropWithPosition = async (e: DragEvent, targetColumnId: string) => {
  // Prevenir múltiplos drops simultâneos
  if (isProcessingDrop.value) {
    return
  }
  
  isProcessingDrop.value = true
  
  // Reset automático após 5 segundos (segurança contra travamento)
  dropTimeoutId.value = setTimeout(() => {
    console.warn('⚠️ [DROP] Timeout - resetando flag de processamento')
    resetDropFlag()
  }, 5000)
  
  try {
    // Obter a tarefa sendo arrastada
    const draggedTaskData = e.dataTransfer?.getData('application/json')
    if (!draggedTaskData) {
      handleDrop(e, targetColumnId, moveTask)
      return
    }

    let task
    try {
      task = JSON.parse(draggedTaskData)
    } catch (parseError) {
      console.error('❌ [DROP] Erro ao fazer parse dos dados:', parseError)
      handleDrop(e, targetColumnId, moveTask)
      return
    }

    const fromColumnId = task.column_id
    
    // Se está mudando de coluna, iniciar transição completa
    if (fromColumnId !== targetColumnId) {
      try {
        // Executar transição completa com todas as animações avançadas
        await executeFullTransition(
          task.id,
          fromColumnId,
          targetColumnId,
          task.priority || 'media'
        )
      } catch (transitionError) {
        console.error('❌ [DROP] Erro na transição:', transitionError)
      }
      
      try {
        // Fazer o drop
        handleDrop(e, targetColumnId, moveTask)
      } catch (dropError) {
        console.error('❌ [DROP] Erro ao fazer drop:', dropError)
      }
      
      try {
        // Iniciar transições de entrada/saída
        startExiting(task.id, fromColumnId)
        
        setTimeout(() => {
          startEntering(task.id, targetColumnId)
          
          setTimeout(() => {
            startSettling(task.id, targetColumnId)
          }, 400)
        }, 300)
      } catch (stateError) {
        console.error('❌ [DROP] Erro ao atualizar estados:', stateError)
      }
    } else {
      // Mesma coluna, apenas fazer o drop
      handleDrop(e, targetColumnId, moveTask)
    }
  } catch (error) {
    console.error('❌ [DROP] Erro geral:', error)
    try {
      handleDrop(e, targetColumnId, moveTask)
    } catch (fallbackError) {
      console.error('❌ [DROP] Erro no fallback:', fallbackError)
    }
  } finally {
    resetDropFlag()
  }
}

const deleteSelectedTasks = async () => {
  const selectedIds = getSelectedTaskIds()
  if (selectedIds.length === 0) return

  const confirmed = confirm(`Deseja deletar ${selectedIds.length} tarefa(s)?`)
  if (!confirmed) return

  loadingAction.value = true
  try {
    for (const id of selectedIds) {
      await deleteTask(id)
    }
    deselectAll()
  } catch (error) {
    console.error('Erro ao deletar tarefas:', error)
  } finally {
    loadingAction.value = false
  }
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
let keydownListener: ((e: KeyboardEvent) => void) | null = null
let resizeListener: (() => void) | null = null

onMounted(async () => {
  try {
    calculateKanbanHeight()
    
    // Usar referência para poder remover depois
    resizeListener = calculateKanbanHeight
    window.addEventListener('resize', resizeListener)

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
    keydownListener = handleKeyDown
    window.addEventListener('keydown', keydownListener)
  } catch (error) {
    console.error('Erro ao montar página de tarefas:', error)
  }
})

onUnmounted(() => {
  // Limpar subscription
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
  
  // Limpar event listeners
  if (keydownListener) {
    window.removeEventListener('keydown', keydownListener)
    keydownListener = null
  }
  
  if (resizeListener) {
    window.removeEventListener('resize', resizeListener)
    resizeListener = null
  }
  
  // Limpar scroll interval se estiver ativo
  if (scrollInterval) {
    clearInterval(scrollInterval)
    scrollInterval = null
  }
  
  // Limpar drop timeout se estiver ativo
  if (dropTimeoutId.value) {
    clearTimeout(dropTimeoutId.value)
    dropTimeoutId.value = null
  }
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
