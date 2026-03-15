<template>
  <div
    class="kanban2-card"
    :class="{
      'is-dragging': isDragging,
      'is-drag-over': isDragOver,
      'is-selected': isSelected,
      'drag-above': dragPosition === 'above',
      'drag-below': dragPosition === 'below'
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragend="handleDragEnd"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <!-- Checkbox para seleção -->
    <div class="card-checkbox">
      <input
        type="checkbox"
        :checked="isSelected"
        @change="emit('toggle-select', task.id)"
        @click.stop
      />
    </div>

    <!-- Conteúdo do card -->
    <div class="card-content">
      <h3 class="card-title">{{ task.title }}</h3>
      <p v-if="task.description" class="card-description">
        {{ task.description }}
      </p>
      <div class="card-meta">
        <span v-if="task.status" class="card-status">
          {{ task.status }}
        </span>
      </div>
    </div>

    <!-- Ações do card -->
    <div class="card-actions">
      <button
        class="card-action-btn edit-btn"
        title="Editar"
        @click.stop="emit('edit', task)"
      >
        ✏️
      </button>
      <button
        class="card-action-btn delete-btn"
        title="Deletar"
        @click.stop="emit('delete', task.id)"
      >
        🗑️
      </button>
    </div>

    <!-- Indicador de drag -->
    <div v-if="isDragOver" class="drag-indicator">
      <div v-if="dragPosition === 'above'" class="indicator-line above" />
      <div v-else class="indicator-line below" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

interface Props {
  task: Task
  columnId: string
  isSelected: boolean
  isDragging: boolean
  isDragOver: boolean
  dragPosition?: 'above' | 'below'
}

interface Emits {
  'drag-start': [{ task: Task; columnId: string }]
  'drag-over': [{ columnId: string; position: 'above' | 'below' }]
  drop: [{ task: Task; columnId: string }]
  'toggle-select': [taskId: string]
  edit: [task: Task]
  delete: [taskId: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Inicia o drag do card
 */
const handleDragStart = (e: DragEvent) => {
  if (!e.dataTransfer) return

  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.task.id || '')

  emit('drag-start', {
    task: props.task,
    columnId: props.columnId
  })
}

/**
 * Detecta posição durante drag over
 */
const handleDragOver = (e: DragEvent) => {
  if (!e.currentTarget) return

  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'

  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()

  // Usar 35% do topo para "acima" (mais generoso)
  const threshold = rect.top + rect.height * 0.35
  const position = e.clientY < threshold ? 'above' : 'below'

  emit('drag-over', {
    columnId: props.columnId,
    position
  })
}

/**
 * Completa o drop
 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()

  emit('drop', {
    task: props.task,
    columnId: props.columnId
  })
}

/**
 * Finaliza o drag
 */
const handleDragEnd = () => {
  // Limpeza se necessário
}

/**
 * Detecta entrada de drag
 */
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
}

/**
 * Detecta saída de drag
 */
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
}
</script>

<style scoped lang="css">
.kanban2-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: move;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
}

.kanban2-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.kanban2-card.is-dragging {
  opacity: 0.5;
  background: #f3f4f6;
  border-color: #9ca3af;
}

.kanban2-card.is-selected {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.kanban2-card.is-drag-over {
  background: #f0fdf4;
  border-color: #22c55e;
}

.kanban2-card.drag-above::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
  border-radius: 1px;
}

.kanban2-card.drag-below::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
  border-radius: 1px;
}

/* Checkbox */
.card-checkbox {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.card-checkbox input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: #3b82f6;
}

/* Conteúdo */
.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  word-break: break-word;
  line-height: 1.4;
}

.card-description {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: #6b7280;
  word-break: break-word;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.card-status {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #e5e7eb;
  color: #374151;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
}

/* Ações */
.card-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.kanban2-card:hover .card-actions {
  opacity: 1;
}

.card-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.card-action-btn:hover {
  background: #f3f4f6;
}

.edit-btn:hover {
  background: #dbeafe;
  color: #0284c7;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Indicador de drag */
.drag-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.indicator-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
  border-radius: 1px;
}

.indicator-line.above {
  top: -1px;
}

.indicator-line.below {
  bottom: -1px;
}

/* Responsivo */
@media (max-width: 640px) {
  .kanban2-card {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .card-title {
    font-size: 0.8125rem;
  }

  .card-description {
    font-size: 0.7rem;
  }

  .card-actions {
    opacity: 1;
  }
}
</style>
