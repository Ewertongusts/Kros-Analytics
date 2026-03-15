<template>
  <div class="kanban2-board">
    <!-- Header -->
    <div class="board-header">
      <h1 class="board-title">Kanban 2</h1>
      <div class="board-actions">
        <button class="action-btn" @click="handleAddColumn">
          + Adicionar Coluna
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="data.loading.value" class="board-loading">
      <p>Carregando...</p>
    </div>

    <!-- Error -->
    <div v-else-if="data.error.value" class="board-error">
      <p>{{ data.error.value }}</p>
      <button @click="handleRetry">Tentar Novamente</button>
    </div>

    <!-- Colunas -->
    <div v-else class="board-columns">
      <Kanban2Column
        v-for="column in columns.sortedColumns.value"
        :key="column.id"
        :column="column"
        :tasks="data.getTasksByColumn(column.id)"
        :selectedTaskIds="selection.selectedTaskIds.value"
        :dragState="dragDrop.dragState.value"
        @task-drag-start="handleTaskDragStart"
        @task-drag-over="handleTaskDragOver"
        @task-drop="handleTaskDrop"
        @task-select="handleTaskSelect"
        @task-edit="handleTaskEdit"
        @task-delete="handleTaskDelete"
        @column-edit="handleColumnEdit"
        @column-delete="handleColumnDelete"
        @add-task="handleAddTask"
      />
    </div>

    <!-- Batch Actions -->
    <Kanban2BatchActions
      v-if="selection.hasSelection.value"
      :selectedCount="selection.selectionCount.value"
      @delete="handleBatchDelete"
      @close="selection.clearSelection()"
    />

    <!-- Modal de edição -->
    <Kanban2Modal
      v-if="showModal"
      :task="editingTask"
      :columnId="editingColumnId"
      @save="handleSaveTask"
      @delete="handleDeleteTask"
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  useKanban2DragDrop,
  useKanban2Data,
  useKanban2Selection,
  useKanban2Columns
} from '~/composables/kanban2'
import type { Task } from '~/composables/useTasks'
import type { Column } from '~/composables/kanban2'

const dragDrop = useKanban2DragDrop()
const data = useKanban2Data()
const selection = useKanban2Selection()
const columns = useKanban2Columns()

// Modal state
const showModal = ref(false)
const editingTask = ref<Task | undefined>(undefined)
const editingColumnId = ref<string>('')

/**
 * Carrega dados iniciais
 */
onMounted(async () => {
  try {
    await data.fetchTasks()
    await data.fetchColumns()
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
  }
})

/**
 * Inicia drag de uma tarefa
 */
const handleTaskDragStart = (event: { task: Task; columnId: string }) => {
  dragDrop.startDrag(event.task, event.columnId)
}

/**
 * Atualiza posição durante drag
 */
const handleTaskDragOver = (event: { columnId: string; position: 'above' | 'below' }) => {
  dragDrop.moveDrag(event.columnId, event.position)
}

/**
 * Completa drop de uma tarefa
 */
const handleTaskDrop = async (event: { task: Task; columnId: string }) => {
  const fromColumnId = dragDrop.dragState.value.fromColumnId || ''
  const toColumnId = event.columnId

  // Se não mudou de coluna, apenas reordenar
  if (fromColumnId === toColumnId) {
    dragDrop.resetDrag()
    return
  }

  try {
    await dragDrop.completeDrop(async (taskId, fromCol, toCol, position) => {
      await data.moveTask(taskId, fromCol, toCol, position)
    })
  } catch (err) {
    console.error('Erro ao mover tarefa:', err)
    dragDrop.resetDrag()
  }
}

/**
 * Alterna seleção de uma tarefa
 */
const handleTaskSelect = (taskId: string) => {
  selection.toggleSelection(taskId)
}

/**
 * Abre modal para editar tarefa
 */
const handleTaskEdit = (task: Task) => {
  editingTask.value = task
  editingColumnId.value = task.column_id || ''
  showModal.value = true
}

/**
 * Deleta uma tarefa
 */
const handleTaskDelete = async (taskId: string) => {
  if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return

  try {
    await data.deleteTask(taskId)
    selection.removeFromSelection(taskId)
  } catch (err) {
    console.error('Erro ao deletar tarefa:', err)
  }
}

/**
 * Abre modal para editar coluna
 */
const handleColumnEdit = (column: Column) => {
  // TODO: Implementar modal de edição de coluna
  console.log('Editar coluna:', column)
}

/**
 * Deleta uma coluna
 */
const handleColumnDelete = async (columnId: string) => {
  if (!confirm('Tem certeza que deseja deletar esta coluna?')) return

  try {
    await columns.deleteColumn(columnId)
  } catch (err) {
    console.error('Erro ao deletar coluna:', err)
  }
}

/**
 * Abre modal para adicionar tarefa
 */
const handleAddTask = (columnId: string) => {
  editingTask.value = undefined
  editingColumnId.value = columnId
  showModal.value = true
}

/**
 * Abre modal para adicionar coluna
 */
const handleAddColumn = async () => {
  const name = prompt('Nome da coluna:')
  if (!name) return

  try {
    await columns.addColumn(name)
  } catch (err) {
    console.error('Erro ao adicionar coluna:', err)
  }
}

/**
 * Salva uma tarefa (criar ou atualizar)
 */
const handleSaveTask = async (task: Task) => {
  try {
    if (task.id) {
      await data.updateTask(task.id, task)
    } else {
      await data.addTask({
        title: task.title,
        description: task.description,
        column_id: editingColumnId.value,
        status: task.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    showModal.value = false
  } catch (err) {
    console.error('Erro ao salvar tarefa:', err)
  }
}

/**
 * Deleta uma tarefa do modal
 */
const handleDeleteTask = async (taskId: string) => {
  try {
    await data.deleteTask(taskId)
    showModal.value = false
  } catch (err) {
    console.error('Erro ao deletar tarefa:', err)
  }
}

/**
 * Deleta múltiplas tarefas
 */
const handleBatchDelete = async () => {
  if (!confirm(`Deletar ${selection.selectionCount.value} tarefas?`)) return

  try {
    for (const taskId of selection.selectedIds.value) {
      await data.deleteTask(taskId)
    }
    selection.clearSelection()
  } catch (err) {
    console.error('Erro ao deletar tarefas:', err)
  }
}

/**
 * Tenta carregar dados novamente
 */
const handleRetry = async () => {
  try {
    await data.fetchTasks()
    await data.fetchColumns()
  } catch (err) {
    console.error('Erro ao recarregar:', err)
  }
}
</script>

<style scoped lang="css">
.kanban2-board {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #ffffff;
}

/* Header */
.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.board-title {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 800;
  color: #1f2937;
}

.board-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.action-btn:active {
  background: #1d4ed8;
}

/* Colunas */
.board-columns {
  flex: 1;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
}

.board-columns::-webkit-scrollbar {
  height: 6px;
}

.board-columns::-webkit-scrollbar-track {
  background: transparent;
}

.board-columns::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.board-columns::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Loading */
.board-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #6b7280;
  font-size: 1rem;
}

.board-loading p {
  margin: 0;
}

/* Error */
.board-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 1rem;
  color: #dc2626;
  font-size: 1rem;
}

.board-error p {
  margin: 0;
}

.board-error button {
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-error button:hover {
  background: #b91c1c;
}

/* Responsivo */
@media (max-width: 768px) {
  .board-header {
    padding: 1rem;
  }

  .board-title {
    font-size: 1.5rem;
  }

  .board-columns {
    padding: 0.5rem;
    gap: 0.5rem;
  }
}
</style>
