<template>
  <div class="w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 p-3 border-b border-white/10">
      <button
        @click="previousMonth"
        class="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <h2 class="text-sm font-semibold text-white">
        {{ monthYear }}
      </h2>
      
      <button
        @click="nextMonth"
        class="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button
        @click="today"
        class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
        :style="{ 
          backgroundColor: 'var(--kros-blue, #FF0000)',
          color: 'white',
          opacity: 0.85
        }"
        @mouseenter="$event.target.style.opacity = '1'"
        @mouseleave="$event.target.style.opacity = '0.85'"
      >
        Hoje
      </button>
    </div>

    <!-- Calendário -->
    <div class="p-3">
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
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="h-16 p-1.5 rounded-lg border border-white/10 flex flex-col cursor-pointer transition-all hover:bg-white/10"
          :class="[
            day.isCurrentMonth ? 'bg-black/30' : 'bg-black/50',
            day.isToday ? 'ring-2 ring-blue-500/60 border-blue-500/60' : ''
          ]"
          @click="day.tasks.length > 0 && $emit('select', day.tasks[0])"
        >
          <!-- Número do dia -->
          <div
            :class="[
              'text-xs font-semibold leading-none',
              day.isCurrentMonth ? 'text-white' : 'text-white/25',
              day.isToday ? 'text-blue-300' : ''
            ]"
          >
            {{ day.date }}
          </div>

          <!-- Tarefas do dia -->
          <div class="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
            <div
              v-for="task in day.tasks.slice(0, 1)"
              :key="task.id"
              class="text-[10px] px-1 py-0.5 rounded truncate leading-none"
              :class="[
                task.priority === 'alta' ? 'bg-red-500/40 text-red-100 border border-red-500/60' :
                task.priority === 'media' ? 'bg-yellow-500/40 text-yellow-100 border border-yellow-500/60' :
                'bg-blue-500/40 text-blue-100 border border-blue-500/60'
              ]"
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
      </div>
    </div>

    <!-- Legenda -->
    <div class="flex items-center justify-center gap-4 text-xs text-white/50 p-3 border-t border-white/10">
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-red-500"></div>
        <span>Alta</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
        <span>Média</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
        <span>Baixa</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '~/composables/useTasks'

interface Props {
  tasks: Task[]
}

const props = defineProps<Props>()

defineEmits<{
  select: [task: Task]
}>()

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

const currentDate = ref(new Date())

const monthYear = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate.value)
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const dateStr = date.toISOString().split('T')[0]
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.getTime() === today.getTime()
    
    const dayTasks = props.tasks
      .filter(task => {
        if (!task.due_date) return false
        const taskDate = new Date(task.due_date)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate.getTime() === date.getTime()
      })
      .sort((a, b) => {
        const priorityOrder = { alta: 0, media: 1, baixa: 2 }
        return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) - 
               (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
      })
    
    days.push({
      date: date.getDate(),
      dateStr,
      isCurrentMonth,
      isToday,
      tasks: dayTasks
    })
  }
  
  return days
})

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

const today = () => {
  currentDate.value = new Date()
}
</script>
