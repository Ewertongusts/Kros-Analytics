<template>
  <div class="kanban2-column">
    <!-- Header da coluna -->
    <div class="column-header">
      <div class="column-title-section">
        <h2 class="column-title">{{ column.name }}</h2>
        <span class="card-count">{{ tasks.length }}</span>
      </div>

      <div class="column-actions">
        <button
          class="column-action-btn"
          title="Editar coluna"
          @click="emit('column-edit', column)"
        >
          ✏️
        </button>
        <button
          class="column-action-btn delete-btn"
          title="Deletar coluna"
          @click="emit('column-delete', column.id)"
        >
          🗑️
        </button>
      </div>
    </div>

    <!-- Cards da coluna com virtualização -->
    <div
      class="column-cards"
      @dragover="handleColumnDragOver"
      @drop="handleColumnDrop"
      @dragenter="handleColumnDragEnter"
      @dragleave="handleColumnDragLeave"
    >
      <!-- Virtualização para muitos cards -->
      <RecycleScroller
        v-if="tasks.length > 0"
        v-slot="{ item: task }"
        :items="tasks"
        :item-size="100"
        class="virtual-scroller"
        key-field="id"
      >
        <Kanban2Card
          :task="task"
          :columnId="column.id"
          :isSelected="isTaskSelected(task.id || '')"
          :isDragging="dragState.taskId === task.id"
          :isDragOver="dragState.toColumnId === column.id && dragState.taskId !== task.id"
          :dragPosition="dragState.toColumnId === column.id ? dragState.position : undefined"
          @drag-start="emit('task-drag-start', { task, columnId: column.id })"
          @drag-over="emit('task-drag-over', $event)"
          @drop="emit('task-drop', { task, columnId: column.id })"
          @toggle-select="emit('task-select', $event)"
          @edit="emit('task-edit', $event)"
          @delete="emit('task-delete', $event)"
        />
      </RecycleScroller>

      <!-- Placeholder quando vazio -->
      <div v-else class="column-empty">
        <p>Nenhuma tarefa</p>
      </div>
    </div>

    <!-- Botão para adicionar tarefa -->
    <button class="add-task-btn" @click="emit('add-task', column.id)">
      + Adicionar Tarefa
    </button>
  </div>
</template>

<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import type { Task } from '~/composables/useTasks'
import type { Column, DragState } from '~/composables/kanban2'

interface Props {
  column: Column
  tasks: Task[]
  isTaskSelected: (taskId: string) => boolean
  dragState: DragState
}

interface Emits {
  'task-drag-start': [{ task: Task; columnId: string }]
  'task-drag-over': [{ columnId: string; position: 'above' | 'below' }]
  'task-drop': [{ task: Task; columnId: string }]
  'task-select': [taskId: string]
  'task-edit': [task: Task]
  'task-delete': [taskId: string]
  'column-edit': [column: Column]
  'column-delete': [columnId: string]
  'add-task': [columnId: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Detecta drag over na coluna
 */
const handleColumnDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

/**
 * Completa drop na coluna (quando não há card específico)
 */
const handleColumnDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()

  // Drop na coluna vazia ou no espaço vazio
  if (props.dragState.taskId) {
    emit('task-drop', {
      task: {
        id: props.dragState.taskId,
        title: '',
        column_id: props.column.id,
        status: 'todo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Task,
      columnId: props.column.id
    })
  }
}

/**
 * Detecta entrada de drag na coluna
 */
const handleColumnDragEnter = (e: DragEvent) => {
  e.preventDefault()
}

/**
 * Detecta saída de drag da coluna
 */
const handleColumnDragLeave = (e: DragEvent) => {
  e.preventDefault()
}
</script>

<style scoped lang="css">
.kanban2-column {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 350px;
  height: 100%;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Header */
.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.column-title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.column-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.card-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  background: #e5e7eb;
  color: #374151;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.column-actions {
  display: flex;
  gap: 0.25rem;
}

.column-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.column-action-btn:hover {
  background: #f3f4f6;
}

.column-action-btn.delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Cards com virtualização */
.column-cards {
  flex: 1;
  overflow: hidden;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
}

.virtual-scroller {
  flex: 1;
  overflow-y: auto;
}

.virtual-scroller::-webkit-scrollbar {
  width: 6px;
}

.virtual-scroller::-webkit-scrollbar-track {
  background: transparent;
}

.virtual-scroller::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.virtual-scroller::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #9ca3af;
  font-size: 0.875rem;
  text-align: center;
}

.column-empty p {
  margin: 0;
}

/* Botão adicionar tarefa */
.add-task-btn {
  padding: 0.75rem;
  margin: 0.75rem;
  background: white;
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.add-task-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

.add-task-btn:active {
  background: #f3f4f6;
}

/* Responsivo */
@media (max-width: 768px) {
  .kanban2-column {
    max-width: 100%;
  }

  .column-title {
    font-size: 0.9375rem;
  }
}
</style>
