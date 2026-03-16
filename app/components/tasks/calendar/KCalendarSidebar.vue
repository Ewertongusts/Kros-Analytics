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
      <KAppointmentItem v-for="appointment in appointments" :key="appointment.id" :appointment="appointment" @select="$emit('select', appointment)" />
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
</script>