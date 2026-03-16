<template>
  <div class="space-y-6 mb-20 animate-in fade-in duration-700 pt-20">
    <!-- Kanban Board -->
    <div class="flex gap-3 overflow-x-auto items-start fixed left-0 right-0 z-40" :style="{ top: `${kanbanHeight}px`, height: `calc(100vh - ${kanbanHeight}px)`, paddingLeft: '120px', paddingRight: '40px' }">
      <!-- Colunas Customizadas -->
      <TasksKanbanKTasksKanbanColumn
        v-for="(column, index) in displayColumns"
        :key="column.column_id"
        :column="column"
        :index="index"
        :tasks="getTasksInColumn(column.column_id)"
        :orphan-tasks="[]"
        :dragged-column-id="draggedColumnId"
        :drag-over-column-id="dragOverColumnId"
        :drag-over-side="dragOverSide"
        :drag-over-task-id="dragOverTaskId"
        :drag-over-position="dragOverPosition"
        :is-task-selected="isTaskSelected"
        :is-entering="isEntering"
        :is-exiting="isExiting"
        :is-settling="isSettling"
        :is-syncing="isSyncing"
        :display-columns="displayColumns"
        @column-drag-start="handleColumnDragStart"
        @column-drag-over="handleColumnDragOver"
        @column-drag-leave="handleColumnDragLeave"
        @column-drop="handleColumnDrop"
        @column-drag-end="handleColumnDragEnd"
        @task-drag-start="handleTaskDragStart"
        @task-drag-over="handleTaskDragOver"
        @task-drag-leave="handleTaskDragLeave"
        @task-drop="handleTaskDropWithPosition"
        @task-edit="$emit('open-task-modal', $event)"
        @task-delete="$emit('delete-task', $event)"
        @task-duplicate="$emit('duplicate-task', $event)"
        @task-select="handleTaskSelection"
        @column-add-task="$emit('open-task-modal', undefined, $event)"
        @column-rename="renameColumn"
        @column-remove="removeColumn"
        @transition-complete="completeTransition"
      />

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

      <!-- Coluna de Tarefas Órfãs -->
      <TasksKanbanKTasksKanbanColumn
        v-if="orphanTasks.length > 0"
        :column="orphanColumn"
        :index="displayColumns.length"
        :tasks="orphanTasks"
        :orphan-tasks="orphanTasks"
        :dragged-column-id="draggedColumnId"
        :drag-over-column-id="dragOverColumnId"
        :drag-over-side="dragOverSide"
        :drag-over-task-id="dragOverTaskId"
        :drag-over-position="dragOverPosition"
        :is-task-selected="isTaskSelected"
        :is-entering="isEntering"
        :is-exiting="isExiting"
        :is-settling="isSettling"
        :is-syncing="isSyncing"
        :display-columns="displayColumns"
        :is-orphan="true"
        @task-drag-start="handleTaskDragStart"
        @task-drag-over="handleTaskDragOver"
        @task-drag-leave="handleTaskDragLeave"
        @task-drop="handleTaskDropWithPosition"
        @task-edit="$emit('open-task-modal', $event)"
        @task-delete="$emit('delete-task', $event)"
        @task-duplicate="$emit('duplicate-task', $event)"
        @task-select="handleTaskSelection"
        @transition-complete="completeTransition"
      />
    </div>

    <!-- Task Modal -->
    <BlocksKTaskModal 
      v-if="isTaskModalOpen"
      :is-open="isTaskModalOpen"
      :task="selectedTask"
      :companies="companies"
      :tag-definitions="tagDefinitions"
      :submitting="loadingAction"
      :default-column-id="defaultColumnId"
      @close="$emit('close-task-modal')"
      @save="$emit('save-task', $event)"
    />

    <!-- Rename Column Modal -->
    <TasksKRenameColumnModal
      :is-open="isRenameModalOpen"
      :column="columnToRename"
      @close="isRenameModalOpen = false"
      @save="handleRenameColumnSave"
    />

    <!-- Bulk Actions Bar -->
    <TasksKBulkActionsBar
      :selected-count="selectedCount"
      @transfer="openBulkTransferModal"
      @delete="handleBulkDelete"
      @clear="deselectAll"
    />

    <!-- Bulk Transfer Modal -->
    <TasksKBulkTransferModal
      :is-open="isBulkTransferModalOpen"
      :selected-task-ids="getSelectedTaskIds()"
      :columns="displayColumns"
      :tasks="props.tasks"
      :get-tasks-in-column="getTasksInColumn"
      @close="closeBulkTransferModal"
      @transfer="handleBulkTransfer"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import type { Task } from '~/composables/useTasks'
import { useTaskDragDrop } from '~/composables/useTaskDragDrop'
import { useColumnDragDrop } from '~/composables/useColumnDragDrop'
import { useRealtimeCardTransitions } from '~/composables/useRealtimeCardTransitions'
import { useAdvancedTransitions } from '~/composables/useAdvancedTransitions'
import { useKanbanColumns } from '~/composables/useKanbanColumns'
import { useTaskSelection } from '~/composables/useTaskSelection'
import { useBulkTaskTransfer } from '~/composables/useBulkTaskTransfer'

const props = defineProps<{
  tasks: Task[]
  columns: any[]
  companies: any[]
  tagDefinitions: any[]
  loading: boolean
  loadingAction: boolean
  selectedTask: Task | null
  isTaskModalOpen: boolean
  defaultColumnId: string
}>()

const emit = defineEmits<{
  'open-task-modal': [task?: Task, columnId?: string]
  'close-task-modal': []
  'save-task': [taskData: any]
  'delete-task': [taskId: string]
  'duplicate-task': [task: Task]
}>()

const { dragOverTaskId, dragOverPosition, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave } = useTaskDragDrop()
const { draggedColumnId, dragOverColumnId, dragOverSide, handleColumnDragStart, handleColumnDragOver, handleColumnDragLeave, handleColumnDrop, handleColumnDragEnd } = useColumnDragDrop()
const { toggleTaskSelection, isTaskSelected, getSelectedTaskIds, deselectAll, selectedTaskIds } = useTaskSelection()
const { startEntering, startExiting, startSettling, completeTransition, isEntering, isExiting, isSettling } = useRealtimeCardTransitions()
const { isSyncing, executeFullTransition } = useAdvancedTransitions()
const { columns: customColumns, addColumn, updateColumn, deleteColumn, moveColumn } = useKanbanColumns()
const { isBulkTransferModalOpen, openBulkTransferModal, closeBulkTransferModal } = useBulkTaskTransfer()

// Computed para contar selecionadas (reativo)
const selectedCount = computed(() => selectedTaskIds.value.size)

// Debug: Log quando task é selecionada
const handleTaskSelection = (taskId: string) => {
  console.log('✅ Task selecionada:', taskId)
  toggleTaskSelection(taskId)
  console.log('📊 Total selecionadas:', selectedCount.value)
}

// Watch para monitorar mudanças na seleção
watch(selectedTaskIds, (newVal) => {
  console.log('👀 Seleção mudou:', newVal.size, 'tarefas')
}, { deep: true })

const kanbanHeight = ref(70)
const isRenameModalOpen = ref(false)
const columnToRename = ref<any>(null)
const isProcessingDrop = ref(false)
const dropTimeoutId = ref<NodeJS.Timeout | null>(null)

const orphanColumn = {
  column_id: 'orphan',
  name: 'Tarefas Órfãs',
  color: '#f97316',
  status: 'orphan',
  position: 999
}

const orphanTasks = computed(() => {
  return props.tasks.filter(t => !t.column_id)
})

const displayColumns = computed(() => {
  return [...props.columns]
})

const getTasksInColumn = (columnId: string) => {
  return props.tasks
    .filter(t => t.column_id === columnId && !isExiting(t.id!))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
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

const resetDropFlag = () => {
  isProcessingDrop.value = false
  if (dropTimeoutId.value) {
    clearTimeout(dropTimeoutId.value)
    dropTimeoutId.value = null
  }
}

const handleTaskDragStart = (task: Task, source: string) => {
  handleDragStart(task, source)
}

const handleTaskDragOver = (e: DragEvent, taskId?: string) => {
  handleDragOver(e, taskId)
}

const handleTaskDragLeave = () => {
  handleDragLeave()
}

const handleTaskDropWithPosition = async (e: DragEvent, targetColumnId: string) => {
  if (isProcessingDrop.value) {
    return
  }
  
  isProcessingDrop.value = true
  
  dropTimeoutId.value = setTimeout(() => {
    console.warn('⚠️ [DROP] Timeout - resetando flag de processamento')
    resetDropFlag()
  }, 5000)
  
  try {
    const draggedTaskData = e.dataTransfer?.getData('application/json')
    if (!draggedTaskData) {
      return
    }

    let task
    try {
      task = JSON.parse(draggedTaskData)
    } catch (parseError) {
      console.error('❌ [DROP] Erro ao fazer parse dos dados:', parseError)
      return
    }

    const fromColumnId = task.column_id
    
    if (fromColumnId !== targetColumnId) {
      try {
        startExiting(task.id, fromColumnId)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 150))
      } catch (stateError) {
        console.error('❌ [DROP] Erro ao iniciar exit:', stateError)
      }
      
      try {
        await new Promise(resolve => setTimeout(resolve, 100))
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
        startEntering(task.id, targetColumnId)
        
        setTimeout(() => {
          startSettling(task.id, targetColumnId)
        }, 400)
      } catch (stateError) {
        console.error('❌ [DROP] Erro ao atualizar estados:', stateError)
      }
      
      handleDragEnd()
    }
  } catch (error) {
    console.error('❌ [DROP] Erro geral:', error)
  } finally {
    resetDropFlag()
  }
}

let scrollInterval: number | null = null

const handleDragOverWithScroll = (e: DragEvent) => {
  handleDragOver(e)
  
  const container = (e.currentTarget as HTMLElement).closest('.overflow-x-auto')
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  const scrollSpeed = 8
  const edgeSize = 150
  
  if (scrollInterval) {
    clearInterval(scrollInterval)
    scrollInterval = null
  }
  
  if (e.clientX > rect.right - edgeSize) {
    scrollInterval = window.setInterval(() => {
      container.scrollLeft += scrollSpeed
    }, 16)
  }
  else if (e.clientX < rect.left + edgeSize) {
    scrollInterval = window.setInterval(() => {
      container.scrollLeft -= scrollSpeed
    }, 16)
  }
}

const handleBulkTransfer = async (targetColumnId: string, taskIds: string[]) => {
  try {
    for (const taskId of taskIds) {
      const task = props.tasks.find(t => t.id === taskId)
      if (!task) continue
      
      const fromColumnId = task.column_id || ''
      
      if (fromColumnId && fromColumnId !== targetColumnId) {
        startExiting(taskId, fromColumnId)
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))
        
        await executeFullTransition(
          taskId,
          fromColumnId,
          targetColumnId,
          task.priority || 'media'
        )
        
        startEntering(taskId, targetColumnId)
        setTimeout(() => {
          startSettling(taskId, targetColumnId)
        }, 300)
      }
    }
    
    deselectAll()
    closeBulkTransferModal()
  } catch (error) {
    console.error('❌ Erro ao transferir tarefas em lote:', error)
  }
}

const handleBulkDelete = async () => {
  const selectedIds = getSelectedTaskIds()
  const confirmed = confirm(`Deseja deletar ${selectedIds.length} ${selectedIds.length === 1 ? 'tarefa' : 'tarefas'}?`)
  if (!confirmed) return
  
  try {
    for (const taskId of selectedIds) {
      emit('delete-task', taskId)
    }
    
    deselectAll()
  } catch (error) {
    console.error('❌ Erro ao deletar tarefas em lote:', error)
  }
}

</script>
