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

    <!-- Layout principal com sidebar e calendário -->
    <div class="flex">
      <!-- Sidebar - Compromissos da Semana -->
      <div class="w-80 border-r border-white/10 bg-black/20">
        <div class="p-3">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Compromissos da Semana
            </h3>
            
            <!-- Botão Nova Tarefa -->
            <button
              @click="$emit('add-task')"
              class="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              title="Nova tarefa"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <!-- Lista de compromissos -->
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="appointment in weekAppointments"
              :key="appointment.id"
              class="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              @click="$emit('select', appointment)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <h4 class="text-xs font-medium text-white truncate">
                    {{ appointment.title }}
                  </h4>
                  <p class="text-xs text-white/60 mt-0.5">
                    {{ formatAppointmentDate(appointment.due_date) }}
                  </p>
                  <div class="flex items-center gap-1.5 mt-1">
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="[
                        appointment.priority === 'alta' ? 'bg-red-500' :
                        appointment.priority === 'media' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      ]"
                    ></div>
                    <span class="text-xs text-white/50 capitalize">
                      {{ appointment.priority }}
                    </span>
                  </div>
                </div>
                <div
                  class="px-1.5 py-0.5 rounded text-xs font-medium"
                  :class="[
                    appointment.status === 'concluida' ? 'bg-green-500/20 text-green-300' :
                    appointment.status === 'em_progresso' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-gray-500/20 text-gray-300'
                  ]"
                >
                  {{ getStatusLabel(appointment.status) }}
                </div>
              </div>
            </div>
            
            <!-- Estado vazio -->
            <div v-if="weekAppointments.length === 0" class="text-center py-6">
              <svg class="w-8 h-8 text-white/20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-xs text-white/40">
                Nenhum compromisso esta semana
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendário -->
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
  'add-task': []
}>()

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

const currentDate = ref(new Date())

const monthYear = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate.value)
})

// Compromissos da semana atual
const weekAppointments = computed(() => {
  const today = new Date()
  const startOfWeek = new Date(today)
  const endOfWeek = new Date(today)
  
  // Início da semana (domingo)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  // Fim da semana (sábado)
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
  endOfWeek.setHours(23, 59, 59, 999)
  
  return props.tasks
    .filter(task => {
      if (!task.due_date) return false
      const taskDate = new Date(task.due_date)
      return taskDate >= startOfWeek && taskDate <= endOfWeek
    })
    .sort((a, b) => {
      // Ordenar por data e depois por prioridade
      const dateA = new Date(a.due_date!)
      const dateB = new Date(b.due_date!)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime()
      }
      
      const priorityOrder = { alta: 0, media: 1, baixa: 2 }
      return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
    })
})

const formatAppointmentDate = (dateStr: string) => {
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
    'pendente': 'Pendente',
    'em_progresso': 'Em Progresso',
    'concluida': 'Concluída',
    'cancelada': 'Cancelada'
  }
  return labels[status as keyof typeof labels] || status
}

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
