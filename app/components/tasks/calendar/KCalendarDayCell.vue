<template>
  <div class="h-16 p-1.5 rounded-lg border border-white/10 flex flex-col cursor-pointer transition-all hover:bg-white/10" :class="[day.isCurrentMonth ? 'bg-black/30' : 'bg-black/50', day.isToday ? 'ring-2 ring-blue-500/60 border-blue-500/60' : '']" @click="day.tasks.length > 0 && $emit('select', day.tasks[0])">
    <div :class="['text-xs font-semibold leading-none', day.isCurrentMonth ? 'text-white' : 'text-white/25', day.isToday ? 'text-blue-300' : '']">
      {{ day.date }}
    </div>
    <div class="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
      <div v-for="task in day.tasks.slice(0, 1)" :key="task.id" class="text-[10px] px-1 py-0.5 rounded truncate leading-none" :class="getTaskClasses(task.priority)" :title="task.title" @click.stop="$emit('select', task)">
        {{ task.title }}
      </div>
    </div>
    <div v-if="day.tasks.length > 1" class="text-[8px] text-white/40 leading-none">
      +{{ day.tasks.length - 1 }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'
import { getTaskClasses } from '~/utils/calendarUtils'

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

defineProps<{ day: CalendarDay }>()
defineEmits<{ select: [task: Task] }>()
</script>