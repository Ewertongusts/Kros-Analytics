<template>
  <div
    class="h-16 p-1.5 rounded-lg border border-white/10 flex flex-col cursor-pointer transition-all hover:bg-white/10"
    :class="dayClasses"
    @click="day.tasks.length > 0 && $emit('select', day.tasks[0])"
  >
    <!-- Número do dia -->
    <div :class="dateClasses">
      {{ day.date }}
    </div>

    <!-- Tarefas do dia -->
    <div class="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
      <div
        v-for="task in day.tasks.slice(0, 1)"
        :key="task.id"
        class="text-[10px] px-1 py-0.5 rounded truncate leading-none"
        :class="getTaskClasses(task)"
        :title="task.title"
        @click.stop="$emit('select', task)"
      >
        {{ task.title }}
      </div>
    </div>

    <!-- Indicador de mais tarefas -->
    <div
      v-if="day.tasks.length > 1"
      class="text-[8px] text-white/40 leading-none"
    >
      +{{ day.tasks.length - 1 }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '~/composables/useTasks'

interface CalendarDay {
  date: number
  dateStr: string
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

interface Props {
  day: CalendarDay
}

const props = defineProps<Props>()

defineEmits<{
  select: [task: Task]
}>()

const dayClasses = computed(() => [
  props.day.isCurrentMonth ? 'bg-black/30' : 'bg-black/50',
  props.day.isToday ? 'ring-2 ring-blue-500/60 border-blue-500/60' : ''
])

const dateClasses = computed(() => [
  'text-xs font-semibold leading-none',
  props.day.isCurrentMonth ? 'text-white' : 'text-white/25',
  props.day.isToday ? 'text-blue-300' : ''
])

const getTaskClasses = (task: Task) => {
  return task.priority === 'alta' ? 'bg-red-500/40 text-red-100 border border-red-500/60' :
         task.priority === 'media' ? 'bg-yellow-500/40 text-yellow-100 border border-yellow-500/60' :
         'bg-blue-500/40 text-blue-100 border border-blue-500/60'
}
</script>