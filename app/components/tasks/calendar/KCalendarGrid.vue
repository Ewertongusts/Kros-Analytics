<template>
  <div class="flex-1 p-3">
    <!-- Dias da semana -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-xs font-semibold text-white/50"
      >
        {{ day }}
      </div>
    </div>

    <!-- Dias do mês -->
    <div class="grid grid-cols-7 gap-1">
      <KCalendarDay
        v-for="(day, index) in calendarDays"
        :key="index"
        :day="day"
        @click="$emit('day-click', day)"
        @task-click="$emit('task-click', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

interface CalendarDay {
  date: number
  dateStr: string
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

interface Props {
  calendarDays: CalendarDay[]
}

defineProps<Props>()

defineEmits<{
  'day-click': [day: CalendarDay]
  'task-click': [task: Task]
}>()

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
</script>