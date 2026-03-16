<template>
  <LayoutsKPageLayout max-width="1800px">
    <!-- Tasks Page Container -->
    <UiKLoader 
      v-if="loading" 
      message="Carregando Tarefas..." 
    />

    <!-- View Toggle -->
    <TasksKTasksViewToggle 
      v-model="viewMode"
    />

    <!-- Kanban View -->
    <div v-if="viewMode === 'kanban'" class="space-y-6 mb-20 pt-20">
      <!-- Debug Info -->
      <div class="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300">
        <p>Colunas: {{ allColumns.length }} | Tarefas: {{ tasks.length }} | Tarefas com column_id: {{ tasks.filter(t => t.column_id).length }}</p>
        <p v-for="col in allColumns" :key="col.column_id" class="mt-1">
          Coluna "{{ col.name }}" ({{ col.column_id }}): {{ getTasksInColumn(col.column_id).length }} tarefas
        </p>
      </div>

      <!-- Kanban Board -->
      <div class="flex gap-3 overflow-x-auto items-start pb-8">
        <!-- Columns -->
        <div 
          v-for="column in allColumns"
          :key="column.column_id"
          class="flex-shrink-0 w-[280px] rounded-xl bg-[#1a1a1c] border border-white/5 transition-all duration-300"
        >
          <!-- Column Header -->
          <div class="p-3 border-b border-white/5 flex items-center justify-between">
            <div class="flex items-center gap-2 flex-1">
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: column.color }"></div>
              <h3 class="font-semibold text-white text-sm">{{ column.name }}</h3>
              <span class="px-2 py-0.5 bg-white/5 text-white/60 rounded text-xs font-medium">
                {{ getTasksInColumn(column.column_id).length }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="openTaskModal(undefined, column.column_id)"
                class="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Nova tarefa"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                @click="handleRenameColumn(column)"
                class="p-1 rounded hover:bg-blue-500/20 text-white/40 hover:text-blue-400 transition-colors"
                title="Renomear"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="handleDeleteColumn(column.column_id)"
                class="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                title="Deletar"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Cards Container -->
          <div class="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
            <div
              v-for="task in getTasksInColumn(column.column_id)"
              :key="task.id"
              @click="openTaskModal(task)"
              class="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all group"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-white truncate">{{ task.title }}</h4>
                  <p v-if="task.description" class="text-xs text-white/50 truncate mt-1">{{ task.description }}</p>
                </div>
                <button
                  v-if="task.id"
                  @click.stop="deleteTask(task.id)"
                  class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
                  title="Deletar"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="flex items-center gap-2 mt-2 text-xs text-white/40">
                <span v-if="task.priority" class="px-1.5 py-0.5 rounded bg-white/5">{{ task.priority }}</span>
                <span v-if="task.due_date" class="px-1.5 py-0.5 rounded bg-white/5">{{ formatDate(task.due_date) }}</span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="getTasksInColumn(column.column_id).length === 0" class="flex items-center justify-center h-24 text-white/30">
              <p class="text-sm">Nenhuma tarefa</p>
            </div>
          </div>
        </div>

        <!-- Add Column Button -->
        <button
          @click="handleAddColumn"
          class="flex-shrink-0 w-[280px] h-12 rounded-xl border-2 border-dashed border-white/10 hover:border-white/30 flex items-center justify-center gap-2 text-white/40 hover:text-white/60 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="text-sm font-medium">Nova Coluna</span>
        </button>
      </div>
    </div>

    <!-- List View -->
    <TasksKTasksListView
      v-else-if="viewMode === 'list'"
      :tasks="tasks"
      :columns="customColumns"
      :is-task-selected="isTaskSelected"
      :toggle-task-selection="toggleTaskSelection"
      @edit="openTaskModal"
      @delete="handleDeleteTask"
    />

    <!-- Grid View -->
    <TasksKTasksGridViewContainer 
      v-else-if="viewMode === 'grid'"
      :tasks="tasks"
      @open-task-modal="openTaskModal"
      @toggle-selection="toggleTaskSelection"
    />

    <!-- Calendar View -->
    <TasksKTasksCalendarView
      v-else-if="viewMode === 'calendar'"
      :tasks="tasks"
      @open-task-modal="openTaskModal"
    />

    <!-- Bulk Actions Bar -->
    <TasksKTasksBulkActionsBar 
      v-if="selectedCount > 0"
      :selected-count="selectedCount"
      @delete-selected="deleteSelectedTasks"
      @clear-selection="deselectAll"
    />

    <!-- Task Modal -->
    <BlocksKTaskModal
      :is-open="isTaskModalOpen"
      :task="selectedTask"
      :companies="companies"
      :submitting="loadingAction"
      :default-column-id="defaultColumnId"
      @save="handleSaveTask"
      @close="closeTaskModal"
    />

    <!-- Rename Column Modal -->
    <TasksKRenameColumnModal
      :is-open="showRenameModal"
      :column="columnToRename"
      @save="handleSaveColumnName"
      @close="showRenameModal = false"
    />

    <!-- Add Task Button (when no bulk actions) -->
    <button
      v-if="selectedCount === 0"
      @click="openTaskModal()"
      :style="{ backgroundColor: 'var(--kros-blue, #3b82f6)' }"
      class="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:opacity-90 z-50"
      title="Nova tarefa"
    >
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { Task } from '~/composables/useTasks'
import { useTaskHandlers } from '~/composables/useTaskHandlers'
import { useTaskHistory } from '~/composables/useTaskHistory'
import { useKanbanColumns } from '~/composables/useKanbanColumns'
import { useTaskSelection } from '~/composables/useTaskSelection'
import { useCompanies } from '~/composables/useCompanies'
import { useTags } from '~/composables/useTags'
import { useTasksMigration } from '~/composables/useTasksMigration'

const { companies, fetchCompanies } = useCompanies()
const { fetchTags } = useTags()
const { migrateTasksColumnId } = useTasksMigration()

const {
  tasks,
  fetchTasks: handlerFetchTasks,
  isTaskModalOpen,
  selectedTask,
  loadingAction,
  defaultColumnId,
  openTaskModal,
  closeTaskModal,
  handleSaveTask,
  deleteTask,
  loading
} = useTaskHandlers()

const { columns: customColumns, fetchColumns, addColumn, updateColumn, deleteColumn } = useKanbanColumns()
const { toggleTaskSelection, isTaskSelected, deselectAll, selectedCount, getSelectedTaskIds } = useTaskSelection()
const { addToHistory, undo: undoHistory, redo: redoHistory } = useTaskHistory()

const viewMode = ref<'kanban' | 'list' | 'grid' | 'calendar'>('kanban')
const showRenameModal = ref(false)
const columnToRename = ref<any>(null)

// Computed: Combinar colunas padrão com customizadas + colunas órfãs das tarefas
const allColumns = computed(() => {
  const defaultColumns = [
    { column_id: 'col_todo', name: 'A Fazer', color: '#3b82f6', status: 'todo', position: 0 },
    { column_id: 'col_in_progress', name: 'Em Progresso', color: '#f59e0b', status: 'in_progress', position: 1 },
    { column_id: 'col_done', name: 'Concluído', color: '#10b981', status: 'done', position: 2 }
  ]
  
  // Coletar todos os column_ids únicos das tarefas
  const columnIdsFromTasks = new Set<string>()
  tasks.value.forEach(t => {
    if (t.column_id) {
      columnIdsFromTasks.add(t.column_id)
    }
  })
  
  // Combinar colunas customizadas com colunas órfãs das tarefas
  const allCols = [...customColumns.value]
  
  // Adicionar colunas órfãs (que existem nas tarefas mas não nas colunas customizadas)
  columnIdsFromTasks.forEach(columnId => {
    if (!allCols.find(c => c.column_id === columnId)) {
      allCols.push({
        column_id: columnId,
        name: columnId.substring(0, 20), // Usar parte do ID como nome
        color: '#6b7280',
        status: 'orphan',
        position: allCols.length
      })
    }
  })
  
  return allCols.length > 0 ? allCols : defaultColumns
})

// Helper function to get tasks in a column
const getTasksInColumn = (columnId: string | undefined) => {
  if (!columnId) return []
  return tasks.value.filter(t => t.column_id === columnId).sort((a, b) => (a.position || 0) - (b.position || 0))
}

// Format date helper
const formatDate = (date: string | null | undefined) => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

// Column handlers
const handleAddColumn = async () => {
  const name = prompt('Nome da coluna:')
  if (!name) return
  
  await addColumn({
    column_id: `col_${Date.now()}`,
    name,
    color: '#3b82f6',
    status: name.toLowerCase(),
    position: customColumns.value.length
  })
}

const handleRenameColumn = (column: any) => {
  columnToRename.value = column
  showRenameModal.value = true
}

const handleSaveColumnName = async (newName: string, newColor: string) => {
  if (columnToRename.value) {
    await updateColumn(columnToRename.value.column_id, { name: newName, color: newColor })
    showRenameModal.value = false
    columnToRename.value = null
  }
}

const handleDeleteTask = async (task: Task) => {
  if (task.id) {
    await deleteTask(task.id)
  }
}

const handleDeleteColumn = async (columnId: string) => {
  if (confirm('Tem certeza que deseja deletar esta coluna?')) {
    await deleteColumn(columnId)
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

onMounted(async () => {
  try {
    await fetchColumns()
    await fetchCompanies()
    await fetchTags()
    
    // Migrar tarefas existentes para ter column_id
    await migrateTasksColumnId()
    
    // Não fazer fetch automático - as tarefas já estão no estado local
    // await handlerFetchTasks()

    // Real-time subscription
    try {
      const supabase = useSupabaseClient()
      const channel = supabase
        .channel('tasks-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          () => {
            // Desabilitar refetch automático para evitar reload
            // handlerFetchTasks()
          }
        )
        .subscribe()

      unsubscribe = () => {
        supabase.removeChannel(channel)
      }
    } catch (e) {
      console.warn('Real-time subscription não disponível:', e)
    }

    // Keyboard shortcuts
    keydownListener = handleKeyDown
    window.addEventListener('keydown', keydownListener)
  } catch (error) {
    console.error('Erro ao montar página de tarefas:', error)
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
  
  if (keydownListener) {
    window.removeEventListener('keydown', keydownListener)
    keydownListener = null
  }
})
</script>

<style scoped>
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
</style>
