<template>
  <div class="space-y-6 mb-20 pt-20 px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all cursor-pointer"
        @click="$emit('open-task-modal', task)"
      >
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="font-semibold text-white text-sm line-clamp-2 flex-1">{{ task.title }}</h3>
          <button
            @click.stop="toggleTaskSelection(task.id!)"
            class="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 flex-shrink-0"
            :class="[
              isTaskSelected(task.id!)
                ? 'text-white shadow-lg'
                : 'bg-black/40 border border-white/20 hover:bg-black/60'
            ]"
            :style="isTaskSelected(task.id!) ? { backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 8px var(--kros-blue, #FF0000)' } : {}"
          >
            <svg v-if="isTaskSelected(task.id!)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <p v-if="task.description" class="text-xs text-white/40 line-clamp-2 mb-3">{{ task.description }}</p>
        
        <div class="flex items-center justify-between gap-2">
          <span
            :class="[
              'px-2 py-1 rounded text-[9px] font-bold',
              task.priority === 'alta' ? 'bg-red-500/20 text-red-400' :
              task.priority === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'
            ]"
          >
            {{ task.priority?.charAt(0).toUpperCase() }}
          </span>
          <span
            :class="[
              'px-2 py-1 rounded text-[9px] font-bold',
              task.status === 'todo' ? 'bg-blue-500/20 text-blue-400' :
              task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            ]"
          >
            {{ task.status?.charAt(0).toUpperCase() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'
import { useTaskSelection } from '~/composables/useTaskSelection'

defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  'open-task-modal': [task: Task]
  'toggle-selection': [taskId: string]
}>()

const { isTaskSelected, toggleTaskSelection } = useTaskSelection()
</script>
