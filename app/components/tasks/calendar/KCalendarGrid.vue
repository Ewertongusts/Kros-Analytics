<template>
  <div class="flex-1 p-3">
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div v-for="day in weekDays" :key="day" class="text-center text-xs font-semibold text-white/50">{{ day }}</div>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <div v-for="(day, index) in calendarDays" :key="index" class="h-16 p-1.5 rounded-lg border border-white/10 flex flex-col cursor-pointer transition-all hover:bg-white/10" :class="[day.isCurrentMonth ? 'bg-black/30' : 'bg-black/50', day.isToday ? 'ring-2 ring-blue-500/60 border-blue-500/60' : '']" @click="day.tasks.length > 0 && $emit('select', day.tasks[0])">
        <div :class="['text-xs font-semibold leading-none', day.isCurrentMonth ? 'text-white' : 'text-white/25', day.isToday ? 'text-blue-300' : '']">{{ day.date }}</div>
        <div class="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
          <div v-for="task in day.tasks.slice(0, 1)" :key="task.id" class="text-[10px] px-1 py-0.5 rounded truncate leading-none" :class="getTaskClasses(task)" :title="task.title" @click.stop="$emit('select', task)">{{ task.title }}</div>
        </div>
        <div v-if="day.tasks.length > 1" class="text-[8px] text-white/40 leading-none">+{{ day.tasks.length - 1 }}</div>
      </div>
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

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

const getTaskClasses = (task: Task): string => {
  return task.priority === 'alta' ? 'bg-red-500/40 text-red-100 border border-red-500/60' :
         task.priority === 'media' ? 'bg-yellow-500/40 text-yellow-100 border border-yellow-500/60' :
         'bg-blue-500/40 text-blue-100 border border-blue-500/60'
}
</script>