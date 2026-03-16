<template>
  <div 
    :data-column="column.column_id"
    @dragover="handleDragOver"
    @dragleave="$emit('column-drag-leave')"
    @drop="handleDrop"
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
    <!-- Indicador de inserção à esquerda -->
    <div 
      v-if="dragOverColumnId === column.column_id && dragOverSide === 'left' && draggedColumnId !== column.column_id"
      class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-all duration-200 shadow-lg column-indicator"
      :style="{ backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 16px var(--kros-blue, #FF0000)' }"
    ></div>
    
    <!-- Indicador de inserção à direita -->
    <div 
      v-if="dragOverColumnId === column.column_id && dragOverSide === 'right' && draggedColumnId !== column.column_id"
      class="absolute right-0 top-0 bottom-0 w-1.5 rounded-r-xl transition-all duration-200 shadow-lg column-indicator"
      :style="{ backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 16px var(--kros-blue, #FF0000)' }"
    ></div>

    <!-- Header da Coluna -->
    <div 
      class="p-2.5 border-b border-white/5"
      :draggable="!isOrphan"
      @dragstart="handleColumnDragStart"
      @dragend="$emit('column-drag-end')"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 flex-1 cursor-grab active:cursor-grabbing" :class="{ 'opacity-50': draggedColumnId === column.column_id }">
          <svg v-if="!isOrphan" class="w-4 h-4 text-white/30 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm4-8h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2z" />
          </svg>
          <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: column.color }"></div>
          <h3 class="font-semibold text-white text-xs">{{ column.name }}</h3>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="px-1.5 py-0.5 bg-white/5 text-white/60 rounded text-[10px] font-medium">
            {{ tasks.length }}
          </span>
          <button
            v-if="!isOrphan"
            @click="$emit('column-add-task', column.column_id)"
            class="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            title="Nova tarefa"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            v-if="!isOrphan"
            @click="$emit('column-rename', column)"
            class="p-1 rounded hover:bg-blue-500/20 text-white/40 hover:text-blue-400 transition-colors"
            title="Renomear coluna"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            v-if="!isOrphan"
            @click="$emit('column-remove', column.column_id)"
            class="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
            title="Remover coluna"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <p v-if="isOrphan" class="text-[9px] text-orange-400/60 mt-1">Tarefas sem coluna visível</p>
    </div>

    <!-- Cards Container -->
    <div class="p-2 space-y-2 min-h-[100px]">
      <TasksKTaskCard
        v-for="task in tasks"
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
        :is-orphan="isOrphan"
        @edit="$emit('task-edit', $event as unknown as Task)"
        @delete="$emit('task-delete', ($event as unknown as Task).id!)"
        @duplicate="$emit('task-duplicate', $event as unknown as Task)"
        @select="$emit('task-select', $event as unknown as string)"
        @dragstart="handleTaskDragStart($event as unknown as any)"
        @dragend="$emit('task-drag-leave')"
        @dragover="handleTaskDragOver"
        @dragleave="$emit('task-drag-leave')"
        @drop="handleTaskDrop"
        @transition-complete="$emit('transition-complete', $event as unknown as string)"
      />
      <div v-if="tasks.length === 0" class="flex items-center justify-center py-6 text-white/20">
        <div class="text-center">
          <svg class="w-6 h-6 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-[10px]">Nenhuma tarefa</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

const props = defineProps<{
  column: any
  index: number
  tasks: Task[]
  orphanTasks: Task[]
  draggedColumnId: string | null
  dragOverColumnId: string | null
  dragOverSide: 'left' | 'right' | null
  dragOverTaskId: string | null
  dragOverPosition: 'above' | 'below' | null
  isTaskSelected: (id: string) => boolean
  isEntering: (id: string) => boolean
  isExiting: (id: string) => boolean
  isSettling: (id: string) => boolean
  isSyncing: (id: string) => boolean
  displayColumns: any[]
  isOrphan?: boolean
}>()

const emit = defineEmits<{
  'column-drag-start': [e: DragEvent]
  'column-drag-over': [e: DragEvent]
  'column-drag-leave': []
  'column-drop': [e: DragEvent]
  'column-drag-end': []
  'task-drag-start': [task: any, columnId: string]
  'task-drag-over': [e: DragEvent]
  'task-drag-leave': []
  'task-drop': [e: DragEvent, columnId: string]
  'task-edit': [task: Task]
  'task-delete': [taskId: string]
  'task-duplicate': [task: Task]
  'task-select': [taskId: string]
  'column-add-task': [columnId: string]
  'column-rename': [column: any]
  'column-remove': [columnId: string]
  'transition-complete': [taskId: string]
}>()

const handleColumnDragStart = (e: DragEvent) => {
  emit('column-drag-start', e)
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
  emit('column-drag-over', e)
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  emit('column-drop', e)
}

const handleTaskDragStart = (task: any) => {
  emit('task-drag-start', task, props.column.column_id)
}

const handleTaskDragOver = (e: DragEvent) => {
  emit('task-drag-over', e)
}

const handleTaskDrop = (e: DragEvent) => {
  emit('task-drop', e, props.column.column_id)
}
</script>
