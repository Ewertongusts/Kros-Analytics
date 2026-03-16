<template>
  <div
    class="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
    @click="$emit('click', task)"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-medium text-white truncate">
          {{ task.title }}
        </h4>
        <p class="text-xs text-white/60 mt-0.5">
          {{ formatDate(task.due_date) }}
        </p>
        <div class="flex items-center gap-1.5 mt-1">
          <div
            class="w-2 h-2 rounded-full"
            :class="priorityClasses"
          ></div>
          <span class="text-xs text-white/50 capitalize">
            {{ task.priority }}
          </span>
        </div>
      </div>
      <div
        class="px-1.5 py-0.5 rounded text-xs font-medium"
        :class="statusClasses"
      >
        {{ getStatusLabel(task.status) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '~/composables/useTasks'

interface Props {
  task: Task
}

const props = defineProps<Props>()

defineEmits<{
  click: [task: Task]
}>()

const priorityClasses = computed(() => {
  switch (props.task.priority) {
    case 'alta': return 'bg-red-500'
    case 'media': return 'bg-yellow-500'
    default: return 'bg-blue-500'
  }
})

const statusClasses = computed(() => {
  switch (props.task.status) {
    case 'done': return 'bg-green-500/20 text-green-300'
    case 'in_progress': return 'bg-blue-500/20 text-blue-300'
    default: return 'bg-gray-500/20 text-gray-300'
  }
})

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  // Resetar horas para comparação
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
  
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Hoje'
  } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return 'Amanhã'
  } else {
    return new Intl.DateTimeFormat('pt-BR', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    }).format(date)
  }
}

const getStatusLabel = (status: string) => {
  const labels = {
    'todo': 'A Fazer',
    'in_progress': 'Em Progresso',
    'done': 'Concluído'
  }
  return labels[status as keyof typeof labels] || status
}
</script>