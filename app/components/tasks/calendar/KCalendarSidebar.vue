<template>
  <div class="w-80 border-r border-white/10 bg-black/20 p-3">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-white">Compromissos da Semana</h3>
      <KCalendarAddTaskButton @click="$emit('add-task')" />
    </div>
    <div class="space-y-2 max-h-96 overflow-y-auto">
      <KAppointmentItem v-for="appointment in appointments" :key="appointment.id" :appointment="appointment" @select="$emit('select', appointment)" />
      <KCalendarEmptyState v-if="appointments.length === 0" message="Nenhum compromisso esta semana" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

defineProps<{ appointments: Task[] }>()
defineEmits<{ select: [task: Task]; 'add-task': [] }>()
</script>