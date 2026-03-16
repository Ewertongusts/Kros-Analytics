<template>
  <div class="h-16 p-1.5 rounded-lg border border-white/10 flex flex-col cursor-pointer transition-all hover:bg-white/10" :class="[day.isCurrentMonth ? 'bg-black/30' : 'bg-black/50', day.isToday ? 'ring-2 ring-blue-500/60 border-blue-500/60' : '']" @click="day.tasks.length > 0 && $emit('select', day.tasks[0])">
    <KCalendarDayNumber :date="day.date" :is-current-month="day.isCurrentMonth" :is-today="day.isToday" />
    <KCalendarDayTasks :tasks="day.tasks" @select="$emit('select', $event)" />
    <KCalendarDayMoreIndicator :count="day.tasks.length - 1" />
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'
import KCalendarDayNumber from './KCalendarDayNumber.vue'
import KCalendarDayTasks from './KCalendarDayTasks.vue'
import KCalendarDayMoreIndicator from './KCalendarDayMoreIndicator.vue'

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

defineProps<{ day: CalendarDay }>()
defineEmits<{ select: [task: Task] }>()
</script>