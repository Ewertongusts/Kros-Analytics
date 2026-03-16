<template>
  <div class="w-80 border-r border-white/10 bg-black/20 p-3">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-white">Compromissos da Semana</h3>
      <button @click="$emit('add-task')" class="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
    <div class="space-y-2 max-h-96 overflow-y-auto">
      <div v-for="appointment in appointments" :key="appointment.id" class="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" @click="$emit('select', appointment)">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-medium text-white truncate">{{ appointment.title }}</h4>
            <p class="text-xs text-white/60 mt-0.5">{{ formatAppointmentDate(appointment.due_date) }}</p>
          </div>
          <div class="px-1.5 py-0.5 rounded text-xs font-medium" :class="getStatusColor(appointment.status)">{{ getStatusLabel(appointment.status) }}</div>
        </div>
      </div>
      <div v-if="appointments.length === 0" class="text-center py-6">
        <p class="text-xs text-white/40">Nenhum compromisso esta semana</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

defineProps<{ appointments: Task[] }>()
defineEmits<{ select: [task: Task]; 'add-task': [] }>()

const formatAppointmentDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
  if (dateOnly.getTime() === todayOnly.getTime()) return 'Hoje'
  if (dateOnly.getTime() === tomorrowOnly.getTime()) return 'Amanhã'
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).format(date)
}

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    'done': 'Concluído',
    'in_progress': 'Em Progresso',
    'todo': 'A Fazer',
    'concluida': 'Concluída',
    'em_progresso': 'Em Progresso',
    'a_fazer': 'A Fazer',
    'pendente': 'Pendente',
    'completed': 'Concluída',
    'cancelled': 'Cancelada',
    'cancelada': 'Cancelada'
  }
  return map[status] || status
}

const getStatusColor = (status: string): string => {
  if (['done', 'concluida', 'completed'].includes(status)) return 'bg-green-500/20 text-green-300'
  if (['in_progress', 'em_progresso'].includes(status)) return 'bg-blue-500/20 text-blue-300'
  if (['todo', 'a_fazer', 'pendente', 'pending'].includes(status)) return 'bg-yellow-500/20 text-yellow-300'
  return 'bg-gray-500/20 text-gray-300'
}
</script>