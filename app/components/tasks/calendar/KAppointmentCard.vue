<template>
  <div
    class="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
    @click="$emit('select')"
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
            :class="priorityColor"
          ></div>
          <span class="text-xs text-white/50 capitalize">
            {{ appointment.priority }}
          </span>
        </div>
      </div>
      <div
        class="px-1.5 py-0.5 rounded text-xs font-medium"
        :class="statusColor"
      >
        {{ statusLabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '~/composables/useTasks'

interface Props {
  appointment: Task
}

const props = defineProps<Props>()

defineEmits<{
  select: []
}>()

const priorityColor = computed(() => {
  return props.appointment.priority === 'alta' ? 'bg-red-500' :
         props.appointment.priority === 'media' ? 'bg-yellow-500' :
         'bg-blue-500'
})

const statusColor = computed(() => {
  const status = props.appointment.status
  return status === 'concluida' || status === 'completed' || status === 'done' ? 'bg-green-500/20 text-green-300' :
         status === 'em_progresso' || status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
         status === 'a_fazer' || status === 'todo' || status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
         'bg-gray-500/20 text-gray-300'
})

const statusLabel = computed(() => {
  const labels = {
    // Status em português
    'pendente': 'Pendente',
    'em_progresso': 'Em Progresso',
    'concluida': 'Concluída',
    'cancelada': 'Cancelada',
    'a_fazer': 'A Fazer',
    // Status em inglês
    'in_progress': 'Em Progresso',
    'completed': 'Concluída',
    'cancelled': 'Cancelada',
    'todo': 'A Fazer',
    'done': 'Concluído',
    'pending': 'Pendente'
  }
  
  return labels[props.appointment.status as keyof typeof labels] || props.appointment.status
})

const formatAppointmentDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
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
</script>