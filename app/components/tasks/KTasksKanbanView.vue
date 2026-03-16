<template>
  <div class="space-y-6 mb-20 animate-in fade-in duration-700 pt-20" :style="{ paddingTop: `calc(100vh - ${kanbanHeight}px)` }">
    <!-- Kanban Board - Fixed no topo -->
    <div class="flex gap-3 overflow-x-auto items-start fixed left-0 right-0 z-40" :style="{ top: `${kanbanHeight}px`, height: `calc(100vh - ${kanbanHeight}px)`, paddingLeft: '120px', paddingRight: '40px' }">
      <!-- Colunas Customizadas -->
      <div 
        v-for="(column, index) in displayColumns"
        :key="column.column_id"
        :data-column="column.column_id"
        @dragover="(e) => {
          handleColumnDragOver(column.column_id, e, columns)
          handleDragOverWithScroll(e)
        }"
        @dragleave="handleColumnDragLeave"
        @drop="(e) => {
          handleColumnDrop(column.column_id, columns, moveColumn, e)
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
                @click="$emit('add-task', column.column_id)"
                class="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Nova tarefa"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                @click="$emit('rename-column', column)"
                class="p-1 rounded hover:bg-blue-500/20 text-white/40 hover:text-blue-400 transition-colors"
                title="Renomear coluna"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="$emit('remove-column', column.column_id)"
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
            @edit="$emit('edit-task', $event)"
            @delete="$emit('delete-task', $event)"
            @duplicate="$emit('duplicate-task', $event)"
            @select="$emit('select-task', $event)"
            @dragstart="handleTaskDragStart(task, column.status)"
            @dragend="handleDragEndWithScroll"
            @dragover="(e: DragEvent) => handleDragOver(e, task.id)"
            @dragleave="handleDragLeave"
            @drop="(e: DragEvent) => {
              handleTaskDropWithPosition(e, column.column_id)
              handleDragEndWithScroll()
            }"
            @transition-complete="$emit('transition-complete', task.id!)"
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
          @click="$emit('add-column')"
          class="w-full p-2.5 bg-[#1a1a1c] hover:bg-white/5 border border-dashed border-white/10 hover:border-white/20 rounded-xl transition-all text-white/30 hover:text-white/50 flex items-center justify-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="text-xs font-medium">Add Column</span>
        </button>
      </div>

      <!-- Coluna de Tarefas Órfãs -->
      <div 
        v-if="orphanTasks.length > 0"
        class="flex-shrink-0 w-[220px] rounded-xl bg-transparent border border-orange-500/30 transition-all duration-200"
        @dragover="handleDragOverWithScroll"
      >
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
            @edit="$emit('edit-task', $event)"
            @delete="$emit('delete-task', $event)"
            @duplicate="$emit('duplicate-task', $event)"
            @select="$emit('select-task', $event)"
            @dragstart="handleTaskDragStart(task, task.status || 'todo')"
            @dragend="handleDragEndWithScroll"
            @dragover="(e: DragEvent) => handleDragOver(e, task.id)"
            @dragleave="handleDragLeave"
            @drop="(e: DragEvent) => {
              handleTaskDropWithPosition(e, task.status || 'todo')
              handleDragEndWithScroll()
            }"
            @transition-complete="$emit('transition-complete', task.id!)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '~/composables/useTasks'

interface Props {
  tasks: Task[]
  columns: any[]
  kanbanHeight: number
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
  getTasksInColumn: (columnId: string) => Task[]
  handleColumnDragStart: (columnId: string, e: DragEvent) => void
  handleColumnDragEnd: () => void
  handleColumnDragOver: (columnId: string, e: DragEvent, columns: any[]) => void
  handleColumnDragLeave: () => void
  handleColumnDrop: (columnId: string, columns: any[], moveColumn: Function, e: DragEvent) => void
  handleTaskDragStart: (task: Task, status: string) => void
  handleDragEndWithScroll: () => void
  handleDragOver: (e: DragEvent, taskId: string | null) => void
  handleDragLeave: () => void
  handleTaskDropWithPosition: (e: DragEvent, columnId: string) => void
  handleDragOverWithScroll: (e: DragEvent) => void
}

const props = defineProps<Props>()

defineEmits<{
  'add-task': [columnId: string]
  'rename-column': [column: any]
  'remove-column': [columnId: string]
  'add-column': []
  'edit-task': [task: Task]
  'delete-task': [task: Task]
  'duplicate-task': [task: Task]
  'select-task': [taskId: string]
  'transition-complete': [taskId: string]
}>()

const displayColumns = computed(() => [...props.columns])

const orphanTasks = computed(() => {
  return props.tasks.filter(t => !t.column_id)
})
</script>
