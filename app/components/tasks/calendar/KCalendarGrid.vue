<template>
  <div class="flex-1 p-3">
    <KCalendarWeekHeader />
    <div class="grid grid-cols-7 gap-1">
      <KCalendarDayCell v-for="(day, index) in calendarDays" :key="index" :day="day" @select="$emit('select', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

defineProps<{ calendarDays: CalendarDay[] }>()
defineEmits<{ select: [task: Task] }>()
</script>